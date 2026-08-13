import Phaser from "phaser";
import { buildPathName, t, toggleLocale } from "../i18n";
import {
  DIFFICULTY_CONFIGS,
  difficultyDisplays,
  difficultyForLevel,
  unlockedDifficulties
} from "../data/metaProgression";
import {
  DEFAULT_START_STYLE,
  formatNextGoalLine,
  nextRunGoal,
  normalizeStartStyle,
  startStyleLabel,
  startStyleOptions,
  type StartStyleId,
  type StartStyleOption
} from "../data/metaChoices";
import {
  formatPurchaseToast,
  formatRenownShopRow,
  metaBonusesFromShop,
  purchaseRenownUpgrade,
  renownShopBalanceLine,
  renownShopState,
  type RenownShopRow
} from "../data/renownShop";
import { readAudioSettings, writeAudioSettings, type AudioSettings } from "../data/audioSettings";
import { AchievementSystem } from "../systems/AchievementSystem";
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";
import { drawGoalRibbon, drawScrollPanel, drawSectionTabCentered, drawHubBorderFrame, drawVerticalCouplet, drawInkSwordStrokes, spawnHubPetals, paintHubMapLayer, HUB, paintMenuBackdrop, paintInkSwordAtmosphere } from "../ui/menuHubTheme";
import { mountHubBgm } from "../audio/mountHubBgm";
import { isMobileHubLayout, isTouchDevice, safeInset } from "../utils/display";
import { titleProgressFor } from "../data/metaProgression";
import {
  normalizeRunModifier,
  rollRunModifierChoices,
  runModifierDescription,
  runModifierLabel,
  runModifierSectionLabel,
  type RunModifierId
} from "../data/runModifiers";

const START_STYLE_ICONS: Record<StartStyleId, string> = {
  swordSect: "icon-build-sword",
  qiSect: "icon-build-qi",
  footworkSect: "icon-build-footwork",
  wineSwordSect: "icon-build-wine"
};

const RUN_ZONE_H = 360;
const ZONE_GAP = 18;

type HubZone = {
  y: number;
  height: number;
};

type HubMetrics = {
  topBarH: number;
  headerH: number;
  goalH: number;
  runH: number;
  summaryH: number;
  actionsH: number;
  footerH: number;
  gap: number;
};

type HubLayout = {
  panelWidth: number;
  topBar: HubZone;
  header: HubZone;
  goal: HubZone;
  run: HubZone;
  summary: HubZone;
  actions: HubZone;
  footer: HubZone;
  stackActions: boolean;
  hidePitch: boolean;
  compact: boolean;
  tight: boolean;
  mobileHub: boolean;
  showDifficultyHint: boolean;
  dualColumn: boolean;
  brandX: number;
  brandWidth: number;
  settingsCenterX: number;
  settingsWidth: number;
};

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty = 1;
  private selectedStartStyle: StartStyleId = DEFAULT_START_STYLE;
  private runModifierChoices: RunModifierId[] = [];
  private selectedRunModifier: RunModifierId = "ironTrial";
  private shopOverlay?: Phaser.GameObjects.Container;
  private shopScrollY = 0;
  private shopMaxScroll = 0;
  private shopContent?: Phaser.GameObjects.Container;
  private shopContentBaseY = 0;
  private runConfigContent?: Phaser.GameObjects.Container;
  private runConfigScrollY = 0;
  private runConfigMaxScroll = 0;
  private runConfigContentBaseY = 0;
  private runConfigDragStartY = 0;
  private runConfigDragStartScroll = 0;
  private runConfigDragging = false;
  private runConfigScrollBoundsRect?: Phaser.Geom.Rectangle;
  private runConfigPointerId = -1;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const record = AchievementSystem.readRecord();
    const bonuses = metaBonusesFromShop(record);
    const unlocked = unlockedDifficulties(record).map((difficulty) => difficulty.level);
    this.selectedDifficulty = Math.min(
      Math.max(Number(window.localStorage?.getItem("sword-survivors-difficulty") ?? "1"), 1),
      Math.max(...unlocked)
    );
    this.selectedStartStyle = normalizeStartStyle(
      record,
      window.localStorage?.getItem("sword-survivors-start-style")
    );
    this.runModifierChoices = rollRunModifierChoices(record, 3);
    this.selectedRunModifier = normalizeRunModifier(
      record,
      this.runModifierChoices,
      window.localStorage?.getItem("sword-survivors-run-modifier")
    );

    const layout = this.computeLayout(width, height);
    this.paintBackground(width, height, layout);
    this.createTopBar(width, layout, record, bonuses);
    if (layout.dualColumn) {
      this.paintBrandColumn(width, layout, record, bonuses);
      this.createRunConfigPanel(record, unlocked, layout);
      this.createFooterHints(width, layout);
    } else if (layout.mobileHub) {
      this.paintMobileHeader(width, layout, bonuses, record);
      this.createRunConfigPanel(record, unlocked, layout);
      this.createMobileActionDock(width, layout, bonuses);
    } else {
      this.paintHeader(width, layout);
      drawGoalRibbon(this, width / 2, layout.goal.y, layout.goal.height, Math.min(layout.panelWidth - 48, 640));
      const goalTextY = layout.showDifficultyHint ? layout.goal.y + 10 : this.zoneCenter(layout.goal);
      this.add
        .text(width / 2, goalTextY, formatNextGoalLine(nextRunGoal(record)), {
          fontFamily: UI_FONT,
          fontSize: layout.tight ? "12px" : "13px",
          color: "#84f7b2",
          align: "center",
          wordWrap: { width: layout.panelWidth - 96 }
        })
        .setDepth(9)
        .setOrigin(0.5, layout.showDifficultyHint ? 0 : 0.5);
      if (layout.showDifficultyHint) {
        this.add
          .text(width / 2, layout.goal.y + layout.goal.height - 8, t("difficultyHint"), {
            fontFamily: UI_FONT,
            fontSize: "10px",
            color: "#566678",
            align: "center",
            wordWrap: { width: layout.panelWidth - 96 }
          })
          .setDepth(9)
          .setOrigin(0.5, 1);
      }
      this.createRunConfigPanel(record, unlocked, layout);
      this.createSelectionSummary(bonuses, width, layout);
      this.createActionFooter(width, layout);
    }

    mountHubBgm(this);
    this.scale.off("resize", this.onResize, this);
    this.scale.on("resize", this.onResize, this);
  }

  shutdown(): void {
    this.scale.off("resize", this.onResize, this);
    this.teardownRunConfigScroll();
  }

  private teardownRunConfigScroll(): void {
    this.input.off("pointerdown", this.handleRunConfigPointerDown, this);
    this.input.off("pointermove", this.handleRunConfigPointerMove, this);
    this.input.off("pointerup", this.handleRunConfigPointerUp, this);
    this.input.off("wheel", this.handleRunConfigWheel, this);
    this.runConfigContent = undefined;
    this.runConfigScrollBoundsRect = undefined;
    this.runConfigDragging = false;
  }

  private onResize = (): void => {
    if (this.shopOverlay) {
      return;
    }
    this.scene.restart();
  };

  private sumMetrics(metrics: HubMetrics): number {
    return (
      metrics.topBarH +
      metrics.headerH +
      metrics.gap +
      metrics.goalH +
      metrics.gap +
      metrics.runH +
      metrics.gap +
      metrics.summaryH +
      metrics.gap +
      metrics.actionsH +
      metrics.gap +
      metrics.footerH
    );
  }

  private buildMetrics(height: number, width: number, showHint: boolean): HubMetrics {
    const mobileHub = isMobileHubLayout(width, height);
    const tight = height < 780;
    const compact = height < 940;
    if (mobileHub) {
      void showHint;
      return {
        topBarH: 44 + safeInset("top"),
        headerH: 58,
        goalH: 0,
        runH: 280,
        summaryH: 0,
        actionsH: 96 + safeInset("bottom"),
        footerH: 0,
        gap: 10
      };
    }
    return {
      topBarH: tight ? 54 : compact ? 60 : 64,
      headerH: tight ? 68 : compact ? 80 : 92,
      goalH: showHint ? (tight ? 44 : compact ? 48 : 52) : tight ? 22 : 26,
      runH: tight ? 292 : compact ? 300 : RUN_ZONE_H,
      summaryH: tight ? 32 : 36,
      actionsH: tight ? 112 : compact ? 118 : 124,
      footerH: tight ? 34 : compact ? 40 : 46,
      gap: tight ? 6 : compact ? 10 : ZONE_GAP
    };
  }

  private fitMetrics(metrics: HubMetrics, height: number, showHint: boolean): HubMetrics {
    const budget = height - 2;
    let m = { ...metrics };
    let total = this.sumMetrics(m);

    while (total > budget && m.gap > 3) {
      m.gap -= 1;
      total = this.sumMetrics(m);
    }
    while (total > budget && m.runH > 272) {
      m.runH -= 6;
      total = this.sumMetrics(m);
    }
    while (total > budget && m.headerH > 48) {
      m.headerH -= 4;
      m.topBarH = Math.max(34, m.topBarH - 2);
      total = this.sumMetrics(m);
    }
    if (total > budget) {
      const factor = budget / total;
      const scale = (value: number, min: number) => Math.max(min, Math.floor(value * factor));
      m = {
        topBarH: scale(m.topBarH, 32),
        headerH: scale(m.headerH, 48),
        goalH: scale(m.goalH, showHint ? 18 : 10),
        runH: scale(m.runH, 272),
        summaryH: scale(m.summaryH, 18),
        actionsH: scale(m.actionsH, 34),
        footerH: scale(m.footerH, 28),
        gap: Math.max(3, Math.floor(m.gap * factor))
      };
    }
    return m;
  }

  private layoutFromMetrics(
    metrics: HubMetrics,
    height: number,
    width: number,
    showDifficultyHint: boolean,
    stackActions: boolean,
    compact: boolean,
    tight: boolean,
    mobileHub: boolean
  ): HubLayout {
    const topBar: HubZone = { y: 0, height: metrics.topBarH };
    const panelWidth = Math.min(mobileHub ? width - 16 : 900, width - (mobileHub ? 16 : 48));

    if (mobileHub) {
      const header: HubZone = { y: metrics.topBarH + metrics.gap, height: metrics.headerH };
      const actions: HubZone = {
        y: height - metrics.actionsH,
        height: metrics.actionsH
      };
      const runTop = header.y + header.height + metrics.gap;
      const runH = Math.max(220, actions.y - metrics.gap - runTop);
      return {
        panelWidth,
        topBar,
        header,
        goal: { y: runTop, height: 0 },
        run: { y: runTop, height: runH },
        summary: { y: actions.y, height: 0 },
        actions,
        footer: { y: height, height: 0 },
        stackActions: true,
        hidePitch: true,
        compact: true,
        tight: true,
        mobileHub: true,
        showDifficultyHint: false,
        dualColumn: false,
        brandX: width / 2,
        brandWidth: panelWidth,
        settingsCenterX: width / 2,
        settingsWidth: panelWidth
      };
    }

    let runH = metrics.runH;
    const header: HubZone = { y: metrics.topBarH + metrics.gap, height: metrics.headerH };
    const footer: HubZone = { y: height - metrics.footerH, height: metrics.footerH };
    const actions: HubZone = {
      y: footer.y - metrics.gap - metrics.actionsH,
      height: metrics.actionsH
    };
    const summary: HubZone = {
      y: actions.y - metrics.gap - metrics.summaryH,
      height: metrics.summaryH
    };

    const middleTop = header.y + header.height + metrics.gap;
    const middleBottom = summary.y - metrics.gap;
    const blockH = metrics.goalH + metrics.gap + runH;
    const blockTop = middleTop + Math.max(0, Math.floor((middleBottom - middleTop - blockH) / 2));
    const goal: HubZone = { y: blockTop, height: metrics.goalH };
    const run: HubZone = { y: goal.y + metrics.goalH + metrics.gap, height: runH };
    const middlePad = middleBottom - middleTop - blockH;
    const hidePitch = mobileHub || tight || middlePad < 32 || width < 640;
    const dualColumn = !mobileHub && width >= 900;
    const contentLeft = dualColumn ? Math.max(48, width * 0.06) : width / 2 - panelWidth / 2;
    const brandWidth = dualColumn ? Math.min(460, width * 0.42) : panelWidth;
    const settingsWidth = dualColumn ? Math.min(420, Math.max(300, width * 0.34)) : panelWidth;
    const settingsCenterX = dualColumn ? width - Math.max(48, width * 0.06) - settingsWidth / 2 : width / 2;
    const brandX = dualColumn ? contentLeft : width / 2;

    if (dualColumn) {
      const contentTop = metrics.topBarH + Math.max(metrics.gap, 12);
      const contentBottom = height - metrics.footerH - 8;
      const dualRunH = Math.max(320, contentBottom - contentTop);
      return {
        panelWidth,
        topBar,
        header: { y: contentTop, height: dualRunH },
        goal: { y: contentTop, height: 0 },
        run: { y: contentTop, height: dualRunH },
        summary: { y: contentBottom, height: 0 },
        actions: { y: contentBottom, height: 0 },
        footer,
        stackActions: false,
        hidePitch: false,
        compact,
        tight,
        mobileHub,
        showDifficultyHint: false,
        dualColumn: true,
        brandX,
        brandWidth,
        settingsCenterX,
        settingsWidth
      };
    }

    return {
      panelWidth,
      topBar,
      header,
      goal,
      run,
      summary,
      actions,
      footer,
      stackActions: stackActions || mobileHub,
      hidePitch,
      compact: compact || mobileHub,
      tight: tight || mobileHub,
      mobileHub,
      showDifficultyHint: mobileHub ? false : showDifficultyHint,
      dualColumn: false,
      brandX: width / 2,
      brandWidth: panelWidth,
      settingsCenterX: width / 2,
      settingsWidth: panelWidth
    };
  }

  private computeLayout(width: number, height: number): HubLayout {
    const showDifficultyHint =
      AchievementSystem.readRecord().totalRenown < DIFFICULTY_CONFIGS[DIFFICULTY_CONFIGS.length - 1].renownRequired;
    const mobileHub = isMobileHubLayout(width, height);
    const tight = height < 780 || mobileHub;
    const compact = height < 940 || mobileHub;
    let stackActions = width < 480 || mobileHub;
    if (mobileHub) {
      return this.layoutFromMetrics(
        this.buildMetrics(height, width, showDifficultyHint),
        height,
        width,
        false,
        true,
        true,
        true,
        true
      );
    }
    let metrics = this.fitMetrics(this.buildMetrics(height, width, showDifficultyHint), height, showDifficultyHint);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const layout = this.layoutFromMetrics(
        metrics,
        height,
        width,
        showDifficultyHint,
        stackActions,
        compact,
        tight,
        mobileHub
      );
      const blockBottom = layout.run.y + layout.run.height;
      if (blockBottom <= layout.summary.y - 4 && layout.header.y + layout.header.height <= layout.goal.y - 4) {
        return layout;
      }
      metrics.runH = Math.max(272, metrics.runH - 8);
      metrics.goalH = Math.max(showDifficultyHint ? 20 : 12, metrics.goalH - 2);
      metrics.headerH = Math.max(52, metrics.headerH - 4);
      metrics.gap = Math.max(4, metrics.gap - 1);
      stackActions = stackActions || width < 520;
    }

    return this.layoutFromMetrics(metrics, height, width, showDifficultyHint, true, true, true, mobileHub);
  }

  private zoneCenter(zone: HubZone): number {
    return zone.y + zone.height / 2;
  }

  private paintBackground(width: number, height: number, layout: HubLayout): void {
    const panelLeft = width / 2 - layout.panelWidth / 2;
    paintMenuBackdrop(this, width, height);
    if (!layout.tight) {
      paintHubMapLayer(this, width, height, 1, width >= 900 ? 0.05 : 0.03);
    }
    if (!layout.mobileHub) {
      paintInkSwordAtmosphere(this, width, height, 2);
    }
    drawHubBorderFrame(this, width, height, 3);
    if (!layout.tight) {
      drawInkSwordStrokes(this, width, height, 2);
      spawnHubPetals(this, width, height, layout.compact ? 4 : 6);
    }
    if (!layout.tight && width >= 900 && panelLeft > 108 && !layout.dualColumn) {
      drawVerticalCouplet(this, 42, height * 0.44, t("menuHubCoupletLeft").split(""), 4);
      drawVerticalCouplet(this, width - 42, height * 0.44, t("menuHubCoupletRight").split(""), 4);
    }
  }

  private createTopBar(
    width: number,
    layout: HubLayout,
    record: ReturnType<typeof AchievementSystem.readRecord>,
    bonuses: ReturnType<typeof metaBonusesFromShop>
  ): void {
    this.add
      .rectangle(width / 2, layout.topBar.y + layout.topBar.height / 2, width, layout.topBar.height, HUB.inkMid, 0.88)
      .setDepth(10)
      .setStrokeStyle(1, HUB.goldDim, 0.35);

    if (layout.mobileHub) {
      this.createMobileTopBar(width, layout, record, bonuses);
      return;
    }

    const sideReserve = Math.min(168, Math.max(120, width * 0.2));
    const renownY = layout.topBar.y + layout.topBar.height * 0.36;
    const controlsY = layout.topBar.y + layout.topBar.height * 0.72;
    const progress = titleProgressFor(record.totalRenown);
    const nextLine = progress.isMaxTitle
      ? t("titleProgressMax")
      : t("titleProgressNext", { title: t(progress.nextTitleKey!), renown: progress.nextRenownRequired ?? 0 });
    this.add
      .text(width / 2, renownY, t("metaProgressionLine", { title: t(bonuses.titleKey), renown: record.totalRenown, next: nextLine }), {
        fontFamily: UI_FONT,
        fontSize: layout.compact ? "10px" : "11px",
        color: "#9eb4c8",
        align: "center",
        lineSpacing: 3,
        wordWrap: { width: Math.max(160, width - sideReserve * 2 - 80) }
      })
      .setDepth(11)
      .setOrigin(0.5);
    this.createTopNavChips(record, layout);
    this.createLanguageToggle(width, layout.topBar.y + 8);
    if (layout.dualColumn) {
      this.createCompactMuteChip(width, layout.topBar.y + 8);
    } else {
      this.createAudioControls(width, controlsY, layout.compact, sideReserve, false);
    }
  }

  private createMobileTopBar(
    width: number,
    layout: HubLayout,
    record: ReturnType<typeof AchievementSystem.readRecord>,
    _bonuses: ReturnType<typeof metaBonusesFromShop>
  ): void {
    const chipY = layout.topBar.y + safeInset("top") + 22;
    const chipStyle = {
      fontFamily: UI_FONT,
      fontSize: "12px",
      color: "#f7c66b",
      backgroundColor: "#192033",
      padding: { left: 10, right: 10, top: 7, bottom: 7 }
    } as const;

    const muteSettings = readAudioSettings();
    const mute = this.add
      .text(12, chipY, muteSettings.muted ? t("audioMutedLabel") : "♪", {
        ...chipStyle,
        color: muteSettings.muted ? "#ff7687" : "#d8e2eb"
      })
      .setOrigin(0, 0.5)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    mute.on("pointerdown", () => {
      const current = readAudioSettings();
      writeAudioSettings({ ...current, muted: !current.muted });
      this.scene.restart();
    });

    const shop = this.add
      .text(mute.x + mute.width + 8, chipY, t("menuHubShopShort"), chipStyle)
      .setOrigin(0, 0.5)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    shop.on("pointerdown", () => this.openRenownShop(record));

    const codex = this.add
      .text(shop.x + shop.width + 8, chipY, t("menuHubCodexShort"), {
        ...chipStyle,
        color: "#aac7d8"
      })
      .setOrigin(0, 0.5)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    codex.on("pointerdown", () => this.scene.start("CollectionScene"));

    const language = this.add
      .text(width - 12, chipY, t("languageToggle"), chipStyle)
      .setOrigin(1, 0.5)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    language.on("pointerdown", () => {
      toggleLocale();
      this.scene.restart();
    });
  }

  private paintMobileHeader(
    width: number,
    layout: HubLayout,
    bonuses: ReturnType<typeof metaBonusesFromShop>,
    record: ReturnType<typeof AchievementSystem.readRecord>
  ): void {
    const centerY = this.zoneCenter(layout.header);
    this.add
      .text(width / 2, centerY - 8, t("title"), {
        fontFamily: TITLE_FONT,
        fontSize: "28px",
        color: "#f7efd8",
        fontStyle: "700"
      })
      .setDepth(9)
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        centerY + 16,
        t("menuHubRenownShort", { title: t(bonuses.titleKey), renown: record.totalRenown }),
        {
          fontFamily: UI_FONT,
          fontSize: "12px",
          color: "#9eb4c8"
        }
      )
      .setDepth(9)
      .setOrigin(0.5);
  }

  private createMobileActionDock(
    width: number,
    layout: HubLayout,
    bonuses: ReturnType<typeof metaBonusesFromShop>
  ): void {
    const dock = layout.actions;
    this.add
      .rectangle(width / 2, dock.y + dock.height / 2, width, dock.height, HUB.inkMid, 0.94)
      .setDepth(10)
      .setStrokeStyle(1, HUB.goldDim, 0.4);
    this.add.rectangle(width / 2, dock.y, width, 1, HUB.gold, 0.35).setDepth(11).setOrigin(0.5, 0);

    const styleTitle = buildPathName(this.selectedStartStyle);
    this.add
      .text(
        width / 2,
        dock.y + 12,
        t("menuHubRunSummary", {
          difficulty: this.selectedDifficulty,
          style: styleTitle,
          modifier: runModifierLabel(this.selectedRunModifier),
          title: t(bonuses.titleKey)
        }),
        {
          fontFamily: UI_FONT,
          fontSize: "11px",
          color: "#aac7d8",
          align: "center",
          wordWrap: { width: width - 28 }
        }
      )
      .setDepth(12)
      .setOrigin(0.5, 0);

    const start = this.add
      .text(width / 2, dock.y + 40, t("startRun"), {
        fontFamily: TITLE_FONT,
        fontSize: "22px",
        color: "#1a1208",
        backgroundColor: "#f7c66b",
        padding: { left: 36, right: 36, top: 12, bottom: 12 }
      })
      .setDepth(12)
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true });
    start.on("pointerover", () => start.setBackgroundColor("#ffd36a"));
    start.on("pointerout", () => start.setBackgroundColor("#f7c66b"));
    start.on("pointerdown", () => this.startRun());
    this.tweens.add({
      targets: start,
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 1.02 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private createTopNavChips(record: ReturnType<typeof AchievementSystem.readRecord>, layout: HubLayout): void {
    const y = layout.topBar.y + 8;
    const chipStyle = {
      fontFamily: UI_FONT,
      fontSize: "11px",
      color: "#f7c66b",
      backgroundColor: "#192033",
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    } as const;
    let right = this.scale.width - 108;

    const collection = this.add
      .text(right, y, t("collectionButton"), {
        ...chipStyle,
        color: "#aac7d8"
      })
      .setOrigin(1, 0)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    collection.on("pointerover", () => collection.setColor("#f7c66b"));
    collection.on("pointerout", () => collection.setColor("#aac7d8"));
    collection.on("pointerdown", () => this.scene.start("CollectionScene"));

    right -= collection.width + 8;
    const shop = this.add
      .text(right, y, t("renownShopButton"), chipStyle)
      .setOrigin(1, 0)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    shop.on("pointerover", () => shop.setColor("#ffd36a"));
    shop.on("pointerout", () => shop.setColor("#f7c66b"));
    shop.on("pointerdown", () => this.openRenownShop(record));
  }

  private paintBrandColumn(
    _width: number,
    layout: HubLayout,
    record: ReturnType<typeof AchievementSystem.readRecord>,
    bonuses: ReturnType<typeof metaBonusesFromShop>
  ): void {
    const x = layout.brandX;
    const top = layout.run.y + 18;
    const title = t("title");
    const titleLines = title.length > 6 ? `${title.slice(0, Math.ceil(title.length / 2))}\n${title.slice(Math.ceil(title.length / 2))}` : title;

    this.add
      .text(x, top, t("menuBrandEyebrow"), {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#c9a24d"
      })
      .setDepth(9)
      .setOrigin(0, 0);

    const titleText = this.add
      .text(x, top + 28, titleLines, {
        fontFamily: TITLE_FONT,
        fontSize: layout.compact ? "40px" : "48px",
        color: "#f7efd8",
        fontStyle: "700",
        lineSpacing: 8
      })
      .setPadding(0, 8, 0, 8)
      .setDepth(9)
      .setOrigin(0, 0);

    this.add
      .rectangle(x, titleText.y + titleText.height + 10, Math.min(180, layout.brandWidth * 0.45), 2, HUB.gold, 0.45)
      .setOrigin(0, 0.5)
      .setDepth(8);

    this.add
      .text(x, titleText.y + titleText.height + 24, t("menuSubtitle"), {
        fontFamily: TITLE_FONT,
        fontSize: "17px",
        color: "#c9a24d",
        fontStyle: "italic"
      })
      .setDepth(9)
      .setOrigin(0, 0);

    this.add
      .text(x, titleText.y + titleText.height + 54, t("menuPitch"), {
        fontFamily: UI_FONT,
        fontSize: "15px",
        color: "#9eb4c8",
        lineSpacing: 6,
        wordWrap: { width: layout.brandWidth - 12 }
      })
      .setDepth(9)
      .setOrigin(0, 0);

    const startY = Math.min(layout.run.y + layout.run.height - 120, titleText.y + titleText.height + 150);
    const start = this.add
      .text(x, startY, t("startRun"), {
        fontFamily: TITLE_FONT,
        fontSize: "26px",
        color: "#1a1208",
        backgroundColor: "#f7c66b",
        padding: { left: 28, right: 28, top: 12, bottom: 12 }
      })
      .setDepth(9)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    start.on("pointerover", () => start.setBackgroundColor("#ffd36a"));
    start.on("pointerout", () => start.setBackgroundColor("#f7c66b"));
    start.on("pointerdown", () => this.startRun());
    this.input.keyboard?.once("keydown-SPACE", () => this.startRun());
    this.tweens.add({
      targets: start,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    const styleTitle = buildPathName(this.selectedStartStyle);
    this.add
      .text(
        x,
        startY + 58,
        t("menuHubRunSummary", {
          difficulty: this.selectedDifficulty,
          style: styleTitle,
          modifier: runModifierLabel(this.selectedRunModifier),
          title: t(bonuses.titleKey)
        }),
        {
          fontFamily: UI_FONT,
          fontSize: "12px",
          color: "#aac7d8",
          wordWrap: { width: layout.brandWidth - 8 }
        }
      )
      .setDepth(9)
      .setOrigin(0, 0);

    this.add
      .text(x, startY + 86, formatNextGoalLine(nextRunGoal(record)), {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#84f7b2",
        wordWrap: { width: layout.brandWidth - 8 }
      })
      .setDepth(9)
      .setOrigin(0, 0);
  }

  private createCompactMuteChip(width: number, y: number): void {
    const settings = readAudioSettings();
    const mute = this.add
      .text(width - 12, y + 28, settings.muted ? t("audioMutedLabel") : "♪", {
        fontFamily: UI_FONT,
        fontSize: "11px",
        color: settings.muted ? "#ff7687" : "#d8e2eb",
        backgroundColor: "#192033",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      })
      .setOrigin(1, 0)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    mute.on("pointerdown", () => {
      const current = readAudioSettings();
      writeAudioSettings({ ...current, muted: !current.muted });
      this.scene.restart();
    });
  }

  private paintHeader(width: number, layout: HubLayout): void {
    const headerCenter = this.zoneCenter(layout.header);
    const titleY = layout.mobileHub ? headerCenter : headerCenter - (layout.hidePitch ? 14 : layout.compact ? 22 : 26);
    const subtitleY = headerCenter + (layout.hidePitch ? 10 : 4);
    const pitchY = subtitleY + (layout.compact ? 28 : 32);

    if (!layout.mobileHub) {
      this.add
        .rectangle(width / 2, titleY + 8, Math.min(420, layout.panelWidth * 0.55), 2, HUB.gold, 0.35)
        .setDepth(4);
    }
    this.add
      .text(width / 2, titleY, t("title"), {
        fontFamily: TITLE_FONT,
        fontSize: layout.mobileHub ? "26px" : layout.compact ? "36px" : "46px",
        color: "#f7efd8",
        fontStyle: "700"
      })
      .setPadding(0, layout.mobileHub ? 2 : 10, 0, layout.mobileHub ? 2 : 10)
      .setDepth(9)
      .setOrigin(0.5);
    if (!layout.mobileHub && !layout.hidePitch) {
      this.add
        .text(width / 2, subtitleY, `— ${t("menuSubtitle")} —`, {
          fontFamily: TITLE_FONT,
          fontSize: layout.compact ? "16px" : "18px",
          color: "#c9a24d",
          fontStyle: "italic"
        })
        .setPadding(0, 4, 0, 4)
        .setDepth(9)
        .setOrigin(0.5);
    }
    if (!layout.hidePitch) {
      this.add
        .text(width / 2, pitchY, t("menuPitch"), {
          fontFamily: UI_FONT,
          fontSize: layout.compact ? "14px" : "16px",
          color: "#9eb4c8",
          align: "center",
          lineSpacing: 6,
          wordWrap: { width: Math.min(520, layout.panelWidth - 64) }
        })
        .setPadding(0, 4, 0, 4)
        .setDepth(9)
        .setOrigin(0.5);
    }
  }

  private addSectionPanel(
    centerX: number,
    zone: HubZone,
    panelWidth: number,
    sectionTitle: string
  ): { contentTop: number; innerWidth: number; innerLeft: number; panelBottom: number } {
    const frame = drawScrollPanel(this, centerX, zone.y, zone.height, panelWidth);
    const contentTop = drawSectionTabCentered(this, centerX, zone.y + 12, sectionTitle, TITLE_FONT);
    return { ...frame, contentTop: Math.max(frame.contentTop, contentTop) };
  }

  private createRunConfigPanel(
    record: ReturnType<typeof AchievementSystem.readRecord>,
    unlocked: number[],
    layout: HubLayout
  ): void {
    const { contentTop, innerWidth, innerLeft, panelBottom } = this.addSectionPanel(
      layout.settingsCenterX,
      layout.run,
      layout.settingsWidth,
      t("menuHubRunSection")
    );

    this.teardownRunConfigScroll();
    this.runConfigScrollY = 0;
    const maskTop = contentTop + 2;
    const maskHeight = Math.max(120, panelBottom - maskTop - 6);
    const needsScrollHost = layout.mobileHub || layout.dualColumn;
    const host = needsScrollHost ? this.add.container(layout.settingsCenterX, contentTop).setDepth(9) : undefined;
    if (host) {
      this.runConfigContent = host;
      this.runConfigContentBaseY = contentTop;
      const maskShape = this.make.graphics({});
      maskShape.fillStyle(0xffffff);
      maskShape.fillRect(innerLeft, maskTop, innerWidth, maskHeight);
      host.setMask(maskShape.createGeometryMask());
      this.input.on("pointerdown", this.handleRunConfigPointerDown, this);
      this.input.on("pointermove", this.handleRunConfigPointerMove, this);
      this.input.on("pointerup", this.handleRunConfigPointerUp, this);
      this.input.on("wheel", this.handleRunConfigWheel, this);
    }

    const labelGap = layout.mobileHub ? 12 : layout.dualColumn ? 12 : layout.tight ? 14 : 18;
    let cursorY = 4;
    const sectionCenterX = host ? 0 : layout.settingsCenterX;

    const diffLabel = this.hubText(sectionCenterX, cursorY, `— ${t("menuHubDifficultyRow")} —`, {
      fontFamily: TITLE_FONT,
      fontSize: layout.mobileHub ? "11px" : layout.tight ? "12px" : "13px",
      color: "#9ec8e8"
    }, host).setOrigin(0.5, 0);
    cursorY += diffLabel.height + labelGap;

    const difficultyBottom = this.createDifficultyButtons(
      unlocked,
      sectionCenterX,
      cursorY + (layout.mobileHub ? 18 : layout.tight ? 20 : 22),
      innerWidth,
      layout,
      host
    );
    cursorY = difficultyBottom + (layout.mobileHub ? 10 : layout.tight ? 14 : 18);

    const styleLabel = this.hubText(sectionCenterX, cursorY, `— ${startStyleLabel()} —`, {
      fontFamily: TITLE_FONT,
      fontSize: layout.mobileHub ? "11px" : layout.tight ? "12px" : "13px",
      color: "#d8b4ff"
    }, host).setOrigin(0.5, 0);
    cursorY += styleLabel.height + labelGap;

    const styleBottom = this.createStartStyleButtons(record, sectionCenterX, cursorY, innerWidth, layout, host);
    cursorY = styleBottom + (layout.mobileHub ? 8 : layout.tight ? 8 : 12);

    const modifierLabel = this.hubText(sectionCenterX, cursorY, `— ${runModifierSectionLabel()} —`, {
      fontFamily: TITLE_FONT,
      fontSize: layout.mobileHub ? "11px" : layout.tight ? "12px" : "13px",
      color: "#84f7b2"
    }, host).setOrigin(0.5, 0);
    cursorY += modifierLabel.height + labelGap;

    const contentBottom = this.createRunModifierButtons(sectionCenterX, cursorY, innerWidth, layout, host);
    this.runConfigMaxScroll = host ? Math.max(0, contentBottom - maskHeight + 12) : 0;
    if (host) {
      this.runConfigScrollBoundsRect = new Phaser.Geom.Rectangle(innerLeft, maskTop, innerWidth, maskHeight);
    }
  }

  private hubText(
    x: number,
    y: number,
    content: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
    host?: Phaser.GameObjects.Container
  ): Phaser.GameObjects.Text {
    const text = this.add.text(x, y, content, style).setDepth(9);
    host?.add(text);
    return text;
  }

  private handleRunConfigPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.runConfigContent || this.shopOverlay) {
      return;
    }
    const bounds = this.runConfigScrollBounds();
    if (!bounds.contains(pointer.x, pointer.y)) {
      return;
    }
    this.runConfigPointerId = pointer.id;
    this.runConfigDragStartY = pointer.y;
    this.runConfigDragStartScroll = this.runConfigScrollY;
    this.runConfigDragging = false;
  };

  private handleRunConfigPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.runConfigContent || pointer.id !== this.runConfigPointerId) {
      return;
    }
    const delta = this.runConfigDragStartY - pointer.y;
    if (!this.runConfigDragging && Math.abs(delta) < 10) {
      return;
    }
    this.runConfigDragging = true;
    this.setRunConfigScroll(this.runConfigDragStartScroll + delta);
  };

  private handleRunConfigPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id === this.runConfigPointerId) {
      this.runConfigPointerId = -1;
      this.runConfigDragging = false;
    }
  };

  private handleRunConfigWheel = (
    _pointer: Phaser.Input.Pointer,
    _objects: unknown,
    _dx: number,
    dy: number
  ): void => {
    if (!this.runConfigContent || this.shopOverlay) {
      return;
    }
    this.setRunConfigScroll(this.runConfigScrollY + dy * 0.35);
  };

  private runConfigScrollBounds(): Phaser.Geom.Rectangle {
    return this.runConfigScrollBoundsRect ?? new Phaser.Geom.Rectangle(0, 0, 0, 0);
  }

  private setRunConfigScroll(next: number): void {
    if (!this.runConfigContent) {
      return;
    }
    this.runConfigScrollY = Phaser.Math.Clamp(next, 0, this.runConfigMaxScroll);
    this.runConfigContent.setY(this.runConfigContentBaseY - this.runConfigScrollY);
  }

  private createRunModifierButtons(
    centerX: number,
    startY: number,
    innerWidth: number,
    layout: HubLayout,
    host?: Phaser.GameObjects.Container
  ): number {
    const choices = this.runModifierChoices;
    const stacked = layout.mobileHub;
    const tileHeight = layout.mobileHub ? 52 : layout.tight ? 54 : 58;
    const rowGap = layout.mobileHub ? 8 : 0;

    if (stacked) {
      let bottom = startY;
      choices.forEach((modifierId, index) => {
        const y = startY + index * (tileHeight + rowGap) + tileHeight / 2;
        const tileWidth = innerWidth - 8;
        bottom = y + tileHeight / 2;
        this.createRunModifierTile(modifierId, centerX, y, tileWidth, tileHeight, layout, host);
      });
      return bottom + 4;
    }

    const tileWidth = Math.min(120, Math.max(72, (innerWidth - 16) / Math.max(1, choices.length)));
    const gap = Math.max(6, (innerWidth - tileWidth * choices.length) / Math.max(1, choices.length - 1));
    const startX = centerX - (tileWidth * choices.length + gap * (choices.length - 1)) / 2 + tileWidth / 2;

    choices.forEach((modifierId, index) => {
      const x = startX + index * (tileWidth + gap);
      this.createRunModifierTile(modifierId, x, startY + tileHeight / 2, tileWidth, tileHeight, layout, host);
    });
    return startY + tileHeight + 4;
  }

  private createRunModifierTile(
    modifierId: RunModifierId,
    x: number,
    y: number,
    tileWidth: number,
    tileHeight: number,
    layout: HubLayout,
    host?: Phaser.GameObjects.Container
  ): void {
    const selected = this.selectedRunModifier === modifierId;
    const container = this.add.container(x, y).setDepth(9);
    host?.add(container);
    const bg = this.add
      .rectangle(0, 0, tileWidth, tileHeight, selected ? 0xf7c66b : 0x141c28, selected ? 1 : 0.96)
      .setStrokeStyle(2, selected ? 0xffe09a : 0x5a9a78);
    const label = layout.mobileHub
      ? `${runModifierLabel(modifierId)} · ${runModifierDescription(modifierId)}`
      : `${runModifierLabel(modifierId)}\n${runModifierDescription(modifierId)}`;
    const text = this.add
      .text(0, 0, label, {
        fontFamily: UI_FONT,
        fontSize: layout.mobileHub ? "10px" : layout.tight ? "10px" : "11px",
        color: selected ? "#10121f" : "#b8f7d8",
        align: "center",
        lineSpacing: 2,
        wordWrap: { width: tileWidth - 8 }
      })
      .setOrigin(0.5);
    container.add([bg, text]);
    container.setSize(tileWidth, tileHeight);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight),
      Phaser.Geom.Rectangle.Contains
    );
    container.on("pointerover", () => {
      if (!selected) {
        bg.setStrokeStyle(2, 0x84f7b2);
      }
      this.tweens.add({ targets: container, scaleX: 1.03, scaleY: 1.03, duration: 90, ease: "Sine.easeOut" });
    });
    container.on("pointerout", () => {
      bg.setStrokeStyle(2, selected ? 0xffe09a : 0x5a9a78);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90, ease: "Sine.easeOut" });
    });
    container.on("pointerdown", () => {
      this.selectedRunModifier = modifierId;
      window.localStorage?.setItem("sword-survivors-run-modifier", modifierId);
      this.scene.restart();
    });
  }

  private createDifficultyButtons(
    unlocked: number[],
    centerX: number,
    buttonY: number,
    innerWidth: number,
    layout: HubLayout,
    host?: Phaser.GameObjects.Container
  ): number {
    const displays = difficultyDisplays(AchievementSystem.readRecord());
    const tileHeight = layout.mobileHub ? 42 : layout.tight ? 40 : 44;
    const tileWidth = Math.min(88, Math.max(58, (innerWidth - 20) / displays.length));
    const gap = Math.max(6, (innerWidth - tileWidth * displays.length) / Math.max(1, displays.length - 1));
    const startX = centerX - (tileWidth * displays.length + gap * (displays.length - 1)) / 2 + tileWidth / 2;

    displays.forEach((difficulty, index) => {
      const isUnlocked = unlocked.includes(difficulty.level);
      const selected = this.selectedDifficulty === difficulty.level;
      const x = startX + index * (tileWidth + gap);
      const container = this.add.container(x, buttonY).setDepth(9);
      host?.add(container);
      const bg = this.add
        .rectangle(0, 0, tileWidth, tileHeight, selected ? 0xf7c66b : 0x141c28, selected ? 1 : 0.96)
        .setStrokeStyle(2, selected ? 0xffe09a : isUnlocked ? HUB.swordBlue : 0x3a4254);
      const label = isUnlocked
        ? `${t("menuDifficultyShort", { level: difficulty.level })}\n${t("menuDifficultyReward", {
            reward: Math.round(difficulty.rewardMultiplier * 100)
          })}`
        : `${t("menuDifficultyShort", { level: difficulty.level })}\n${t("difficultyLocked", {
            level: difficulty.level,
            renown: difficulty.renownRequired
          }).split("\n")[1] ?? ""}`;
      const text = this.add
        .text(0, 0, label, {
          fontFamily: UI_FONT,
          fontSize: layout.tight ? "11px" : "12px",
          color: isUnlocked ? (selected ? "#10121f" : "#f7c66b") : "#6f7d91",
          align: "center",
          lineSpacing: 2,
          wordWrap: { width: tileWidth - 6 }
        })
        .setOrigin(0.5);
      container.add([bg, text]);

      if (isUnlocked) {
        container.setSize(tileWidth, tileHeight);
        container.setInteractive(
          new Phaser.Geom.Rectangle(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight),
          Phaser.Geom.Rectangle.Contains
        );
        container.on("pointerover", () => {
          if (!selected) {
            bg.setStrokeStyle(2, 0xffd36a);
          }
          this.tweens.add({ targets: container, scaleX: 1.03, scaleY: 1.03, duration: 90, ease: "Sine.easeOut" });
        });
        container.on("pointerout", () => {
          bg.setStrokeStyle(1, selected ? 0xffe09a : 0x6f8aa8);
          this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90, ease: "Sine.easeOut" });
        });
        container.on("pointerdown", () => {
          this.selectedDifficulty = difficultyForLevel(difficulty.level).level;
          window.localStorage?.setItem("sword-survivors-difficulty", String(this.selectedDifficulty));
          this.scene.restart();
        });
      }
    });
    return buttonY + tileHeight / 2 + 4;
  }

  private createStartStyleButtons(
    record: ReturnType<typeof AchievementSystem.readRecord>,
    centerX: number,
    rowTop: number,
    innerWidth: number,
    layout: HubLayout,
    host?: Phaser.GameObjects.Container
  ): number {
    const options = startStyleOptions(record);
    const columns = layout.mobileHub || layout.dualColumn || innerWidth < 440 || layout.tight ? 2 : options.length;
    const tileHeight = layout.mobileHub ? 60 : layout.dualColumn ? 58 : layout.tight ? 66 : layout.compact ? 72 : 78;
    const rowGap = layout.mobileHub ? 8 : 8;
    const tileWidth = Math.floor((innerWidth - (columns - 1) * 10) / columns);
    const gridLeft = centerX - innerWidth / 2;

    options.forEach((option, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = gridLeft + col * (tileWidth + 10) + tileWidth / 2;
      const y = rowTop + row * (tileHeight + rowGap) + tileHeight / 2;
      this.createStartStyleTile(option, x, y, tileWidth, tileHeight, layout, host);
    });
    const rows = Math.ceil(options.length / columns);
    return rowTop + rows * (tileHeight + rowGap) - rowGap;
  }

  private createStartStyleTile(
    option: StartStyleOption,
    x: number,
    y: number,
    tileWidth: number,
    tileHeight: number,
    layout: HubLayout,
    host?: Phaser.GameObjects.Container
  ): void {
    const selected = this.selectedStartStyle === option.id;
    const iconSize = layout.mobileHub ? 20 : layout.tight ? 24 : layout.compact ? 28 : 32;
    const titleSize = layout.mobileHub ? 9 : layout.tight ? 10 : layout.compact ? 11 : 12;
    const subSize = layout.mobileHub ? 8 : layout.tight ? 9 : 10;
    const halfH = tileHeight / 2;
    const textWidth = tileWidth - 12;
    const iconY = -halfH + 6 + iconSize / 2;
    const titleY = iconY + iconSize / 2 + (layout.mobileHub ? 3 : 5);
    const subY = titleY + (layout.mobileHub ? 10 : layout.tight ? 12 : 14);
    const container = this.add.container(x, y).setDepth(9);
    host?.add(container);
    const bg = this.add
      .rectangle(0, 0, tileWidth, tileHeight, selected ? 0xf7c66b : 0x141c28, selected ? 1 : 0.96)
      .setStrokeStyle(2, selected ? 0xffe09a : option.unlocked ? HUB.qiPurple : 0x3a4254);
    const iconKey = START_STYLE_ICONS[option.id];
    const parts: Phaser.GameObjects.GameObject[] = [bg];
    if (this.textures.exists(iconKey)) {
      parts.push(this.add.image(0, iconY, iconKey).setDisplaySize(iconSize, iconSize));
    }
    const titleLine = option.unlocked ? option.title : option.title;
    const subLine = option.unlocked ? option.bonus : option.unlockHint;
    parts.push(
      this.add
        .text(0, titleY, titleLine, {
          fontFamily: UI_FONT,
          fontSize: `${titleSize}px`,
          color: option.unlocked ? (selected ? "#10121f" : "#e8d4ff") : "#6f7d91",
          align: "center",
          wordWrap: { width: textWidth }
        })
        .setOrigin(0.5, 0)
    );
    parts.push(
      this.add
        .text(0, subY, subLine, {
          fontFamily: UI_FONT,
          fontSize: `${subSize}px`,
          color: option.unlocked ? (selected ? "#2a2018" : "#9eb4c8") : "#566678",
          align: "center",
          wordWrap: { width: textWidth }
        })
        .setOrigin(0.5, 0)
    );
    container.add(parts);

    if (option.unlocked) {
      container.setSize(tileWidth, tileHeight);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight),
        Phaser.Geom.Rectangle.Contains
      );
      container.on("pointerover", () => {
        if (!selected) {
          bg.setStrokeStyle(2, 0xd8b4ff);
        }
        this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 90, ease: "Sine.easeOut" });
      });
      container.on("pointerout", () => {
        bg.setStrokeStyle(2, selected ? 0xffe09a : HUB.qiPurple);
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90, ease: "Sine.easeOut" });
      });
      container.on("pointerdown", () => {
        this.selectedStartStyle = option.id;
        window.localStorage?.setItem("sword-survivors-start-style", option.id);
        this.scene.restart();
      });
    }
  }

  private createSelectionSummary(
    bonuses: ReturnType<typeof metaBonusesFromShop>,
    width: number,
    layout: HubLayout
  ): void {
    const styleTitle = buildPathName(this.selectedStartStyle);
    this.add
      .text(
        width / 2,
        this.zoneCenter(layout.summary),
        t("menuHubRunSummary", {
          difficulty: this.selectedDifficulty,
          style: styleTitle,
          modifier: runModifierLabel(this.selectedRunModifier),
          title: t(bonuses.titleKey)
        }),
        {
          fontFamily: TITLE_FONT,
          fontSize: layout.tight ? "13px" : "15px",
          color: "#f7efd8",
          backgroundColor: "#0a1018cc",
          padding: { left: 16, right: 16, top: 7, bottom: 7 },
          align: "center",
          wordWrap: { width: layout.panelWidth - 40 }
        }
      )
      .setDepth(9)
      .setOrigin(0.5);
  }

  private createActionFooter(width: number, layout: HubLayout): void {
    const stackedFooter = layout.stackActions || layout.tight || width < 560;
    const startY = layout.actions.y + (stackedFooter ? 8 : layout.tight ? 10 : 14);

    this.add
      .rectangle(width / 2, layout.actions.y - 6, layout.panelWidth, 1, HUB.goldDim, 0.45)
      .setDepth(8)
      .setOrigin(0.5, 0);

    const start = this.add
      .text(width / 2, startY, t("startRun"), {
        fontFamily: TITLE_FONT,
        fontSize: stackedFooter ? "24px" : layout.compact ? "26px" : "28px",
        color: "#1a1208",
        backgroundColor: "#f7c66b",
        padding: { left: stackedFooter ? 24 : 32, right: stackedFooter ? 24 : 32, top: 12, bottom: 12 }
      })
      .setDepth(9)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    start.on("pointerover", () => start.setBackgroundColor("#ffd36a"));
    start.on("pointerout", () => start.setBackgroundColor("#f7c66b"));
    start.on("pointerdown", () => this.startRun());
    this.input.keyboard?.once("keydown-SPACE", () => this.startRun());

    this.tweens.add({
      targets: start,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.createFooterHints(width, layout);
  }

  private createFooterHints(width: number, layout: HubLayout): void {
    if (isTouchDevice()) {
      return;
    }
    const footerCenterY = this.zoneCenter(layout.footer);
    this.add
      .text(width / 2, footerCenterY - (layout.dualColumn ? 0 : 10), t("menuStartHint"), {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#6f8296"
      })
      .setOrigin(0.5);
    if (!layout.dualColumn) {
      this.add
        .text(width / 2, footerCenterY + 12, t("controls"), {
          fontFamily: UI_FONT,
          fontSize: "13px",
          color: "#6f8296",
          align: "center",
          lineSpacing: 4
        })
        .setPadding(0, 4, 0, 4)
        .setOrigin(0.5);
    }
  }

  private createLanguageToggle(width: number, y: number): void {
    const language = this.add
      .text(width - 12, y, t("languageToggle"), {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#f7c66b",
        backgroundColor: "#192033",
        padding: { left: 8, right: 8, top: 5, bottom: 5 }
      })
      .setOrigin(1, 0)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    language.on("pointerdown", () => {
      toggleLocale();
      this.scene.restart();
    });
  }

  private createAudioControls(width: number, y: number, compact: boolean, sideReserve: number, mobileHub = false): void {
    const settings = readAudioSettings();
    const label = settings.muted
      ? t("audioMutedLabel")
      : t("audioActiveLabel", {
          sfx: Math.round(settings.sfxVolume * 100),
          music: Math.round(settings.musicVolume * 100)
        });
    const maxControlWidth = Math.max(96, sideReserve - 12);
    if (!mobileHub) {
      this.add
        .text(14, y, t("audioSettingsButton"), {
          fontFamily: UI_FONT,
          fontSize: "11px",
          color: "#aac7d8"
        })
        .setOrigin(0, 0)
        .setDepth(12);
    }
    const status = this.add
      .text(mobileHub ? 12 : 14, mobileHub ? y - 8 : y + (compact ? 16 : 18), mobileHub ? (settings.muted ? t("audioMutedLabel") : "♪") : label, {
        fontFamily: UI_FONT,
        fontSize: mobileHub ? "12px" : "10px",
        color: settings.muted ? "#ff7687" : "#d8e2eb",
        backgroundColor: "#192033",
        padding: { left: 6, right: 6, top: 3, bottom: 3 },
        wordWrap: { width: maxControlWidth }
      })
      .setOrigin(0, 0)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    status.on("pointerdown", () => {
      const current = readAudioSettings();
      writeAudioSettings({ ...current, muted: !current.muted });
      this.scene.restart();
    });

    if (width < 900 || mobileHub) {
      return;
    }

    const buttonStyle = {
      fontFamily: UI_FONT,
      fontSize: "9px",
      color: "#f7c66b",
      backgroundColor: "#192033",
      padding: { left: 4, right: 4, top: 2, bottom: 2 }
    };
    const rowY = y + (compact ? 16 : 18);
    const startX = 14;
    const makeAdjuster = (offset: number, text: string, adjust: (settings: AudioSettings) => AudioSettings) => {
      const button = this.add.text(startX + offset, rowY, text, buttonStyle).setOrigin(0, 0).setDepth(12).setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => {
        writeAudioSettings(adjust(readAudioSettings()));
        this.scene.restart();
      });
    };
    makeAdjuster(0, t("audioSfxDown"), (current) => ({ ...current, sfxVolume: Math.max(0, current.sfxVolume - 0.1) }));
    makeAdjuster(36, t("audioSfxUp"), (current) => ({ ...current, sfxVolume: Math.min(1, current.sfxVolume + 0.1) }));
    makeAdjuster(72, t("audioMusicDown"), (current) => ({ ...current, musicVolume: Math.max(0, current.musicVolume - 0.1) }));
    makeAdjuster(114, t("audioMusicUp"), (current) => ({ ...current, musicVolume: Math.min(1, current.musicVolume + 0.1) }));
  }

  private openRenownShop(record: ReturnType<typeof AchievementSystem.readRecord>): void {
    this.shopOverlay?.destroy();
    this.shopScrollY = 0;
    const { width, height } = this.scale;
    const overlay = this.add.container(0, 0).setDepth(40);
    const backdrop = this.add
      .rectangle(width / 2, height / 2, width, height, 0x050711, 0.82)
      .setInteractive();
    backdrop.on("pointerdown", () => this.closeRenownShop());
    const panelWidth = Math.min(560, width - 48);
    const panelHeight = Math.min(420, height - 120);
    const panel = this.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, HUB.scrollFill, 0.96)
      .setStrokeStyle(2, HUB.goldBright, 0.85);
    const title = this.add
      .text(width / 2, height / 2 - panelHeight / 2 + 22, t("renownShopTitle"), {
        fontFamily: TITLE_FONT,
        fontSize: "24px",
        color: "#ffe09a"
      })
      .setOrigin(0.5, 0);
    const balance = this.add
      .text(width / 2, height / 2 - panelHeight / 2 + 54, renownShopBalanceLine(record), {
        fontFamily: UI_FONT,
        fontSize: "13px",
        color: "#d8e2eb"
      })
      .setOrigin(0.5, 0);
    const maskShape = this.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(width / 2 - panelWidth / 2 + 16, height / 2 - panelHeight / 2 + 84, panelWidth - 32, panelHeight - 110);
    const content = this.add.container(width / 2 - panelWidth / 2 + 24, height / 2 - panelHeight / 2 + 92);
    this.shopContentBaseY = content.y;
    content.setMask(maskShape.createGeometryMask());
    this.shopContent = content;
    const rows = renownShopState(record);
    rows.forEach((row, index) => {
      const rowText = this.add
        .text(0, index * 52, formatRenownShopRow(row), {
          fontFamily: UI_FONT,
          fontSize: "14px",
          color: row.canPurchase ? "#10121f" : row.isMaxed ? "#84f7b2" : "#d8e2eb",
          backgroundColor: row.canPurchase ? "#f7c66b" : "#192033",
          align: "left",
          padding: { left: 12, right: 12, top: 10, bottom: 10 },
          wordWrap: { width: panelWidth - 72 }
        })
        .setOrigin(0, 0)
        .setInteractive(row.canPurchase ? { useHandCursor: true } : undefined);
      if (row.canPurchase) {
        rowText.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          pointer.event.stopPropagation();
          this.purchaseUpgrade(row);
        });
      }
      content.add(rowText);
    });
    this.shopMaxScroll = Math.max(0, rows.length * 52 - (panelHeight - 120));
    overlay.add([backdrop, panel, title, balance, content]);
    this.shopOverlay = overlay;
    this.input.on("wheel", this.handleShopWheel, this);
  }

  private handleShopWheel(_pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number): void {
    if (!this.shopOverlay || !this.shopContent) {
      return;
    }
    this.shopScrollY = Phaser.Math.Clamp(this.shopScrollY + dy, 0, this.shopMaxScroll);
    this.shopContent.setY(this.shopContentBaseY - this.shopScrollY);
  }

  private closeRenownShop(): void {
    this.input.off("wheel", this.handleShopWheel, this);
    this.shopOverlay?.destroy();
    this.shopOverlay = undefined;
    this.shopContent = undefined;
  }

  private purchaseUpgrade(row: RenownShopRow): void {
    const result = purchaseRenownUpgrade(AchievementSystem.readRecord(), row.id);
    if (!result.purchased) {
      return;
    }
    AchievementSystem.writeRecord(result.record);
    this.add
      .text(this.scale.width / 2, this.scale.height * 0.52, formatPurchaseToast(row), {
        fontFamily: UI_FONT,
        fontSize: "18px",
        color: "#ffe09a",
        backgroundColor: "#111421dd",
        padding: { left: 14, right: 14, top: 8, bottom: 8 }
      })
      .setOrigin(0.5);
    this.time.delayedCall(160, () => this.scene.restart());
  }

  private startRun(): void {
    this.scene.start("GameScene", {
      difficultyLevel: this.selectedDifficulty,
      startStyleId: this.selectedStartStyle,
      runModifierId: this.selectedRunModifier
    });
  }
}
