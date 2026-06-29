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
import { drawGoalRibbon, drawScrollPanel, drawSectionTab, HUB, paintMenuBackdrop } from "../ui/menuHubTheme";

const START_STYLE_ICONS: Record<StartStyleId, string> = {
  swordSect: "icon-build-sword",
  qiSect: "icon-build-qi",
  footworkSect: "icon-build-footwork",
  wineSwordSect: "icon-build-wine"
};

const RUN_ZONE_H = 258;
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
  showDifficultyHint: boolean;
};

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty = 1;
  private selectedStartStyle: StartStyleId = DEFAULT_START_STYLE;
  private shopOverlay?: Phaser.GameObjects.Container;
  private shopScrollY = 0;
  private shopMaxScroll = 0;
  private shopContent?: Phaser.GameObjects.Container;
  private shopContentBaseY = 0;

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

    const layout = this.computeLayout(width, height);
    this.paintBackground(width, height, layout);
    this.createTopBar(width, layout);
    this.paintHeader(width, layout);
    drawGoalRibbon(this, width / 2, layout.goal.y, layout.goal.height, Math.min(layout.panelWidth - 48, 640));
    const goalTextY = layout.showDifficultyHint ? layout.goal.y + 8 : this.zoneCenter(layout.goal);
    this.add
      .text(width / 2, goalTextY, formatNextGoalLine(nextRunGoal(record)), {
        fontFamily: UI_FONT,
        fontSize: layout.tight ? "12px" : "13px",
        color: "#84f7b2",
        align: "center",
        wordWrap: { width: layout.panelWidth - 80 }
      })
      .setDepth(8)
      .setOrigin(0.5, layout.showDifficultyHint ? 0 : 0.5);
    if (layout.showDifficultyHint) {
      this.add
        .text(width / 2, layout.goal.y + layout.goal.height - 6, t("difficultyHint"), {
          fontFamily: UI_FONT,
          fontSize: "11px",
          color: "#566678",
          align: "center",
          wordWrap: { width: layout.panelWidth - 80 }
        })
        .setDepth(8)
        .setOrigin(0.5, 1);
    }
    this.createRunConfigPanel(record, unlocked, width, layout);
    this.createSelectionSummary(bonuses, width, layout);
    this.createActionFooter(width, layout, record);

    this.scale.off("resize", this.onResize, this);
    this.scale.on("resize", this.onResize, this);
  }

  shutdown(): void {
    this.scale.off("resize", this.onResize, this);
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
    const tight = height < 780;
    const compact = height < 940;
    void width;
    return {
      topBarH: tight ? 40 : compact ? 46 : 50,
      headerH: tight ? 68 : compact ? 80 : 92,
      goalH: showHint ? (tight ? 32 : compact ? 36 : 40) : tight ? 18 : 22,
      runH: tight ? 188 : compact ? 208 : RUN_ZONE_H,
      summaryH: tight ? 28 : 32,
      actionsH: tight ? 94 : compact ? 100 : 108,
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
    while (total > budget && m.runH > 136) {
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
        runH: scale(m.runH, 132),
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
    tight: boolean
  ): HubLayout {
    const topBar: HubZone = { y: 0, height: metrics.topBarH };
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
    const blockH = metrics.goalH + metrics.gap + metrics.runH;
    const blockTop = middleTop + Math.max(0, Math.floor((middleBottom - middleTop - blockH) / 2));
    const goal: HubZone = { y: blockTop, height: metrics.goalH };
    const run: HubZone = { y: goal.y + metrics.goalH + metrics.gap, height: metrics.runH };
    const middlePad = middleBottom - middleTop - blockH;
    const hidePitch = tight || middlePad < 32;

    return {
      panelWidth: Math.min(900, width - 48),
      topBar,
      header,
      goal,
      run,
      summary,
      actions,
      footer,
      stackActions,
      hidePitch,
      compact,
      tight,
      showDifficultyHint
    };
  }

  private computeLayout(width: number, height: number): HubLayout {
    const showDifficultyHint =
      AchievementSystem.readRecord().totalRenown < DIFFICULTY_CONFIGS[DIFFICULTY_CONFIGS.length - 1].renownRequired;
    const tight = height < 780;
    const compact = height < 940;
    let stackActions = width < 480;
    let metrics = this.fitMetrics(this.buildMetrics(height, width, showDifficultyHint), height, showDifficultyHint);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const layout = this.layoutFromMetrics(metrics, height, width, showDifficultyHint, stackActions, compact, tight);
      const blockBottom = layout.run.y + layout.run.height;
      if (blockBottom <= layout.summary.y - 4 && layout.header.y + layout.header.height <= layout.goal.y - 4) {
        return layout;
      }
      metrics.runH = Math.max(130, metrics.runH - 8);
      metrics.goalH = Math.max(showDifficultyHint ? 20 : 12, metrics.goalH - 2);
      metrics.headerH = Math.max(52, metrics.headerH - 4);
      metrics.gap = Math.max(4, metrics.gap - 1);
      stackActions = stackActions || width < 520;
    }

    return this.layoutFromMetrics(metrics, height, width, showDifficultyHint, true, true, true);
  }

  private zoneCenter(zone: HubZone): number {
    return zone.y + zone.height / 2;
  }

  private paintBackground(width: number, height: number, layout: HubLayout): void {
    paintMenuBackdrop(this, width, height);
    const heroX = width * 0.78;
    const heroY = this.zoneCenter(layout.run);
    if (this.textures.exists("player")) {
      this.add
        .image(heroX, heroY, "player")
        .setScale(layout.compact ? 0.26 : 0.32)
        .setAlpha(0.14)
        .setDepth(3)
        .setFlipX(true);
    }
    if (this.textures.exists("blade") && !layout.hidePitch) {
      this.add
        .image(width * 0.14, layout.header.y + 40, "blade")
        .setScale(0.58)
        .setAlpha(0.12)
        .setAngle(-28)
        .setDepth(3);
    }
  }

  private createTopBar(width: number, layout: HubLayout): void {
    const barCenterY = this.zoneCenter(layout.topBar);
    this.add
      .rectangle(width / 2, barCenterY, width, layout.topBar.height, HUB.inkMid, 0.72)
      .setDepth(10)
      .setStrokeStyle(1, HUB.goldDim, 0.35);
    this.createLanguageToggle(width, layout.topBar.y + 10);
    this.createAudioControls(width, layout.topBar.y + 8, layout.compact);
  }

  private paintHeader(width: number, layout: HubLayout): void {
    const headerCenter = this.zoneCenter(layout.header);
    const titleY = headerCenter - (layout.hidePitch ? 14 : layout.compact ? 22 : 26);
    const subtitleY = headerCenter + (layout.hidePitch ? 10 : 4);
    const pitchY = subtitleY + (layout.compact ? 28 : 32);

    this.add
      .rectangle(width / 2, titleY + 8, Math.min(420, layout.panelWidth * 0.55), 2, HUB.gold, 0.35)
      .setDepth(4);
    this.add
      .text(width / 2, titleY, t("title"), {
        fontFamily: TITLE_FONT,
        fontSize: layout.compact ? "36px" : "46px",
        color: "#f7efd8",
        fontStyle: "700"
      })
      .setPadding(0, 10, 0, 10)
      .setDepth(5)
      .setOrigin(0.5);
    this.add
      .text(width / 2, subtitleY, `— ${t("menuSubtitle")} —`, {
        fontFamily: TITLE_FONT,
        fontSize: layout.compact ? "16px" : "18px",
        color: "#c9a24d",
        fontStyle: "italic"
      })
      .setPadding(0, 4, 0, 4)
      .setDepth(5)
      .setOrigin(0.5);
    if (!layout.hidePitch) {
      this.add
        .text(width / 2, pitchY, t("menuPitch"), {
          fontFamily: UI_FONT,
          fontSize: layout.compact ? "14px" : "16px",
          color: "#9eb4c8",
          align: "center",
          lineSpacing: 6,
          wordWrap: { width: Math.min(560, layout.panelWidth - 48) }
        })
        .setPadding(0, 4, 0, 4)
        .setDepth(5)
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
    drawSectionTab(this, frame.innerLeft, zone.y + 12, sectionTitle, TITLE_FONT);
    return frame;
  }

  private createRunConfigPanel(
    record: ReturnType<typeof AchievementSystem.readRecord>,
    unlocked: number[],
    width: number,
    layout: HubLayout
  ): void {
    const { contentTop, innerWidth } = this.addSectionPanel(
      width / 2,
      layout.run,
      layout.panelWidth,
      t("menuHubRunSection")
    );

    const labelGap = layout.tight ? 16 : 20;
    const diffLabelY = contentTop + 2;
    this.add
      .text(width / 2, diffLabelY, `— ${t("menuHubDifficultyRow")} —`, {
        fontFamily: TITLE_FONT,
        fontSize: layout.tight ? "12px" : "13px",
        color: "#9ec8e8"
      })
      .setDepth(8)
      .setOrigin(0.5, 0);

    const difficultyY = diffLabelY + labelGap;
    this.createDifficultyButtons(unlocked, width, difficultyY, innerWidth, layout);

    const styleLabelY = difficultyY + (layout.tight ? 50 : 56);
    this.add
      .text(width / 2, styleLabelY, `— ${startStyleLabel()} —`, {
        fontFamily: TITLE_FONT,
        fontSize: layout.tight ? "12px" : "13px",
        color: "#d8b4ff"
      })
      .setDepth(8)
      .setOrigin(0.5, 0);

    const styleY = styleLabelY + labelGap;
    this.createStartStyleButtons(record, width, styleY, innerWidth, layout);
  }

  private createDifficultyButtons(
    unlocked: number[],
    width: number,
    buttonY: number,
    innerWidth: number,
    layout: HubLayout
  ): void {
    const displays = difficultyDisplays(AchievementSystem.readRecord());
    const tileHeight = layout.tight ? 40 : 44;
    const tileWidth = Math.min(88, Math.max(58, (innerWidth - 20) / displays.length));
    const gap = Math.max(6, (innerWidth - tileWidth * displays.length) / Math.max(1, displays.length - 1));
    const startX = width / 2 - (tileWidth * displays.length + gap * (displays.length - 1)) / 2 + tileWidth / 2;

    displays.forEach((difficulty, index) => {
      const isUnlocked = unlocked.includes(difficulty.level);
      const selected = this.selectedDifficulty === difficulty.level;
      const x = startX + index * (tileWidth + gap);
      const container = this.add.container(x, buttonY);
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
  }

  private createStartStyleButtons(
    record: ReturnType<typeof AchievementSystem.readRecord>,
    width: number,
    buttonY: number,
    innerWidth: number,
    layout: HubLayout
  ): void {
    const options = startStyleOptions(record);
    const tileWidth = Math.min(118, Math.max(92, (innerWidth - 20) / options.length));
    const gap = Math.max(8, (innerWidth - tileWidth * options.length) / Math.max(1, options.length - 1));
    const startX = width / 2 - (tileWidth * options.length + gap * (options.length - 1)) / 2 + tileWidth / 2;

    options.forEach((option, index) => {
      const x = startX + index * (tileWidth + gap);
      this.createStartStyleTile(option, x, buttonY, tileWidth, layout);
    });
  }

  private createStartStyleTile(
    option: StartStyleOption,
    x: number,
    y: number,
    tileWidth: number,
    layout: HubLayout
  ): void {
    const selected = this.selectedStartStyle === option.id;
    const iconSize = layout.tight ? 28 : layout.compact ? 32 : 36;
    const titleSize = layout.tight ? 11 : layout.compact ? 12 : 13;
    const subSize = layout.tight ? 10 : 11;
    const tileHeight = layout.tight ? 72 : layout.compact ? 78 : 84;
    const halfH = tileHeight / 2;
    const padTop = 6;
    const iconTextGap = 8;
    const iconY = -halfH + padTop + iconSize / 2;
    const titleY = iconY + iconSize / 2 + iconTextGap;
    const subY = titleY + (layout.tight ? 18 : 20);
    const container = this.add.container(x, y).setDepth(8);
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
          wordWrap: { width: tileWidth - 10 }
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
          wordWrap: { width: tileWidth - 10 }
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
          title: t(bonuses.titleKey)
        }),
        {
          fontFamily: TITLE_FONT,
          fontSize: layout.tight ? "14px" : "15px",
          color: "#f7efd8",
          backgroundColor: "#0a1018cc",
          padding: { left: 16, right: 16, top: 7, bottom: 7 },
          align: "center"
        }
      )
      .setDepth(8)
      .setOrigin(0.5);
  }

  private createActionFooter(
    width: number,
    layout: HubLayout,
    record: ReturnType<typeof AchievementSystem.readRecord>
  ): void {
    const startY = layout.actions.y + (layout.tight ? 10 : 14);
    const secondaryY = layout.actions.y + layout.actions.height - (layout.tight ? 12 : 16);
    const pairHalf = layout.stackActions ? 78 : Math.min(110, layout.panelWidth * 0.14);
    const shopX = width / 2 - pairHalf - 8;
    const collectionX = width / 2 + pairHalf + 8;

    this.add
      .rectangle(width / 2, layout.actions.y - 6, layout.panelWidth, 1, HUB.goldDim, 0.45)
      .setDepth(8)
      .setOrigin(0.5, 0);

    const start = this.add
      .text(width / 2, startY, t("startRun"), {
        fontFamily: TITLE_FONT,
        fontSize: layout.compact ? "26px" : "28px",
        color: "#1a1208",
        backgroundColor: "#f7c66b",
        padding: { left: 32, right: 32, top: 14, bottom: 14 }
      })
      .setDepth(9)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const shop = this.add
      .text(shopX, secondaryY, t("renownShopButton"), {
        fontFamily: TITLE_FONT,
        fontSize: "18px",
        color: "#1a1208",
        backgroundColor: "#f7c66b",
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      })
      .setDepth(9)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const collection = this.add
      .text(collectionX, secondaryY, t("collectionButton"), {
        fontFamily: TITLE_FONT,
        fontSize: "18px",
        color: "#f7c66b",
        backgroundColor: "#101820",
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      })
      .setDepth(9)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const footerCenterY = this.zoneCenter(layout.footer);
    this.add
      .text(width / 2, footerCenterY - 10, t("menuStartHint"), {
        fontFamily: UI_FONT,
        fontSize: "12px",
        color: "#6f8296"
      })
      .setOrigin(0.5);
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

    start.on("pointerover", () => start.setBackgroundColor("#ffd36a"));
    start.on("pointerout", () => start.setBackgroundColor("#f7c66b"));
    start.on("pointerdown", () => this.startRun());
    shop.on("pointerover", () => shop.setBackgroundColor("#ffd36a"));
    shop.on("pointerout", () => shop.setBackgroundColor("#f7c66b"));
    shop.on("pointerdown", () => this.openRenownShop(record));
    collection.on("pointerover", () => collection.setColor("#ffd36a"));
    collection.on("pointerout", () => collection.setColor("#f7c66b"));
    collection.on("pointerdown", () => this.scene.start("CollectionScene"));
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
  }

  private createLanguageToggle(width: number, y: number): void {
    const language = this.add
      .text(width - 20, y, t("languageToggle"), {
        fontFamily: UI_FONT,
        fontSize: "14px",
        color: "#f7c66b",
        backgroundColor: "#192033",
        padding: { left: 10, right: 10, top: 6, bottom: 6 }
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    language.on("pointerdown", () => {
      toggleLocale();
      this.scene.restart();
    });
  }

  private createAudioControls(width: number, y: number, compact: boolean): void {
    const settings = readAudioSettings();
    const label = settings.muted
      ? t("audioMutedLabel")
      : t("audioActiveLabel", {
          sfx: Math.round(settings.sfxVolume * 100),
          music: Math.round(settings.musicVolume * 100)
        });
    const maxWidth = Math.max(180, width - 160);
    this.add
      .text(16, y, t("audioSettingsButton"), {
        fontFamily: UI_FONT,
        fontSize: "11px",
        color: "#aac7d8"
      })
      .setOrigin(0, 0);
    const status = this.add
      .text(16, y + (compact ? 16 : 18), label, {
        fontFamily: UI_FONT,
        fontSize: "10px",
        color: settings.muted ? "#ff7687" : "#d8e2eb",
        backgroundColor: "#192033",
        padding: { left: 6, right: 6, top: 3, bottom: 3 }
      })
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    status.on("pointerdown", () => {
      const current = readAudioSettings();
      writeAudioSettings({ ...current, muted: !current.muted });
      this.scene.restart();
    });

    const buttonStyle = {
      fontFamily: UI_FONT,
      fontSize: "9px",
      color: "#f7c66b",
      backgroundColor: "#192033",
      padding: { left: 4, right: 4, top: 2, bottom: 2 }
    };
    const rowY = y + (compact ? 16 : 18);
    const startX = Math.min(120, maxWidth * 0.35);
    const makeAdjuster = (offset: number, text: string, adjust: (settings: AudioSettings) => AudioSettings) => {
      const button = this.add.text(startX + offset, rowY, text, buttonStyle).setOrigin(0, 0).setInteractive({ useHandCursor: true });
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
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x111421, 0.96)
      .setStrokeStyle(2, 0xf7c66b, 0.85);
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
    this.scene.start("GameScene", { difficultyLevel: this.selectedDifficulty, startStyleId: this.selectedStartStyle });
  }
}
