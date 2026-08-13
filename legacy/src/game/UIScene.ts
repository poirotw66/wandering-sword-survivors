import Phaser from "phaser";
import type { UpgradeOption } from "../data/upgrades";
import type { GameState } from "./GameState";
import { ExpBar } from "../ui/ExpBar";
import { HealthBar } from "../ui/HealthBar";
import { LoadoutBar } from "../ui/LoadoutBar";
import { StatusPanel } from "../ui/StatusPanel";
import { TimerText } from "../ui/TimerText";
import { UpgradePanel } from "../ui/UpgradePanel";
import { enemyName, t } from "../i18n";
import { ENEMY_CONFIGS, type EnemyId } from "../data/enemies";
import { bossPresentationFor } from "../data/bossPresentation";
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";
import { VirtualJoystick } from "../ui/VirtualJoystick";
import { formatCompactNumber } from "../utils/math";
import { evolutionPreviewLine } from "../data/buildPathSynergy";
import type { BossLegacySummary } from "../data/bossLegacy";
import {
  getSafeInsets,
  isCompactViewport,
  isMobileCombatLayout,
  isNarrowViewport,
  isTouchDevice,
  joystickRadius,
  refreshSafeInsets,
  safeInset
} from "../utils/display";

export class UIScene extends Phaser.Scene {
  private state!: GameState;
  private healthBar!: HealthBar;
  private expBar!: ExpBar;
  private timerText!: TimerText;
  private loadoutBar!: LoadoutBar;
  private statusPanel!: StatusPanel;
  private levelText!: Phaser.GameObjects.Text;
  private difficultyText!: Phaser.GameObjects.Text;
  private hudHintText!: Phaser.GameObjects.Text;
  private evolutionPreviewText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;
  private bossBar!: Phaser.GameObjects.Container;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarLabel!: Phaser.GameObjects.Text;
  private bossTechniqueLabel!: Phaser.GameObjects.Text;
  private legacyPanel?: Phaser.GameObjects.Container;
  private bossIntroPanel?: Phaser.GameObjects.Container;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private pauseHintText!: Phaser.GameObjects.Text;
  private upgradePanel!: UpgradePanel;
  private virtualJoystick?: VirtualJoystick;
  private pauseChip?: Phaser.GameObjects.Text;
  private statusChip?: Phaser.GameObjects.Text;
  private bossBarVisible = false;

  constructor() {
    super("UIScene");
  }

  init(state: GameState): void {
    this.state = state;
  }

  create(state: GameState): void {
    if (state) {
      this.state = state;
    }
    this.events.removeAllListeners("show-upgrades");
    this.events.removeAllListeners("hide-upgrades");
    this.events.removeAllListeners("upgrade-picked");
    this.events.removeAllListeners("status-changed");
    this.events.removeAllListeners("loadout-changed");
    this.expBar = new ExpBar(this);
    this.healthBar = new HealthBar(this, 24, 34);
    this.timerText = new TimerText(this, this.scale.width / 2, 18);
    this.levelText = this.add
      .text(0, 0, "", { fontFamily: UI_FONT, fontSize: "14px", color: "#f7efd8", fontStyle: "700" })
      .setPadding(0, 2, 0, 2)
      .setScrollFactor(0)
      .setDepth(830);
    this.difficultyText = this.add
      .text(0, 0, "", { fontFamily: UI_FONT, fontSize: "12px", color: "#aac7d8" })
      .setPadding(0, 2, 0, 2)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(830);
    this.hudHintText = this.add
      .text(0, 0, "", { fontFamily: UI_FONT, fontSize: "11px", color: "#6f8296" })
      .setPadding(0, 1, 0, 1)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(820);
    this.evolutionPreviewText = this.add
      .text(24, 0, "", { fontFamily: UI_FONT, fontSize: "11px", color: "#ffe09a", fontStyle: "700" })
      .setPadding(0, 1, 0, 1)
      .setScrollFactor(0)
      .setDepth(825);
    this.scoreText = this.add
      .text(this.scale.width - 24, 26, "", { fontFamily: UI_FONT, fontSize: "18px", color: "#d8e2eb" })
      .setPadding(0, 4, 0, 4)
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.loadoutBar = new LoadoutBar(this, 24, 0);
    this.statusPanel = new StatusPanel(this);
    this.statusPanel.setDismissHandler(() => this.events.emit("ui-toggle-status"));
    this.levelText.setText(t("hudPlayerLevel", { level: state.level }));
    this.bossText = this.add
      .text(this.scale.width / 2, 62, "", { fontFamily: UI_FONT, fontSize: "21px", color: "#ff7687", fontStyle: "700" })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.bossBar = this.createBossBar();
    this.pauseOverlay = this.createPauseOverlay();
    this.upgradePanel = new UpgradePanel(this);
    this.createTouchHudChips();
    this.virtualJoystick = new VirtualJoystick(this, 88, this.scale.height - 108, (x, y) => {
      this.scene.get("GameScene").events.emit("virtual-move", x, y);
    });
    this.events.once("shutdown", () => this.virtualJoystick?.destroy());
    this.resize();

    this.scale.on("resize", () => this.resize());
    this.events.on("show-upgrades", (options: UpgradeOption[]) => {
      this.upgradePanel.show(
        options,
        (option) => this.scene.get("GameScene").events.emit("upgrade-picked", option),
        this.state.rerolls,
        () => this.scene.get("GameScene").events.emit("upgrade-reroll"),
        this.state.banishCharges,
        (option) => this.scene.get("GameScene").events.emit("upgrade-banish", option)
      );
    });
    this.events.on("hide-upgrades", () => this.upgradePanel.hide());
    this.events.on("pause-changed", (paused: boolean) => {
      this.pauseOverlay.setVisible(paused);
      this.pauseHintText?.setText(isTouchDevice() ? t("pauseHintTouch") : t("pauseHint"));
    });
    this.events.on("status-changed", (visible: boolean) => {
      this.statusPanel.setVisible(visible, this.state);
    });
    this.events.on("loadout-changed", (state: GameState) => {
      this.state = state;
      this.loadoutBar?.update(this.state);
    });
    const gameScene = this.scene.get("GameScene");
    gameScene.events.off("sync-state");
    gameScene.events.on("sync-state", (state: GameState) => {
      this.state = state;
    });
    this.scene.get("GameScene").events.on("boss-spawned", (name: string, markSec: number, enemyId: EnemyId) =>
      this.showBossIntro(name, markSec, enemyId)
    );
    this.scene.get("GameScene").events.on("boss-health-changed", (hp: number, maxHp: number, name: string) => {
      this.updateBossBar(hp, maxHp, name);
    });
    this.scene.get("GameScene").events.on("boss-legacy", (summary: BossLegacySummary) => this.showBossLegacy(summary));
    this.scene.get("GameScene").events.on("boss-technique-started", (name: string, color?: number) => this.showBossTechnique(name, color));
    this.scene.get("GameScene").events.on("boss-technique-ended", () => this.clearBossTechnique());

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index <= 2) {
        this.upgradePanel.pickByIndex(index);
      }
    });
  }

  update(): void {
    this.healthBar.update(this.state.player);
    this.expBar.update(this.state);
    this.timerText.update(this.state);
    this.levelText.setText(t("hudPlayerLevel", { level: this.state.level }));
    this.difficultyText.setText(
      t("hudDifficulty", {
        level: this.state.selectedDifficulty,
        reward: Math.round(this.state.difficultyRewardMultiplier * 100)
      })
    );
    this.layoutHud();
    const mobile = isMobileCombatLayout(this.scale.width, this.scale.height);
    const rewardSuffix =
      this.state.difficultyRewardMultiplier > 1
        ? `  ×${Math.round(this.state.difficultyRewardMultiplier * 100)}%`
        : "";
    if (mobile) {
      this.scoreText.setText(
        `${t("renown")} ${this.state.score}${rewardSuffix}\n${t("defeated")} ${this.state.kills}`
      );
      this.scoreText.setStyle({ align: "right" });
    } else {
      this.scoreText.setText(`${t("renown")} ${this.state.score}${rewardSuffix}  ${t("defeated")} ${this.state.kills}`);
      this.scoreText.setStyle({ align: "left" });
    }
    this.hudHintText.setText(
      t("hudControlsLine", {
        rerolls: this.state.rerolls,
        banish: this.state.banishCharges
      })
    );
    const preview = evolutionPreviewLine(this.state);
    this.evolutionPreviewText.setText(preview ?? "");
    this.evolutionPreviewText.setVisible(Boolean(preview));
    this.loadoutBar.update(this.state);
    this.statusPanel.refresh(this.state);
  }

  private resize(): void {
    refreshSafeInsets();
    const width = this.scale.width;
    const height = this.scale.height;
    const insets = getSafeInsets();
    this.expBar.resize(width);
    this.layoutHud();
    if (this.virtualJoystick) {
      const radius = joystickRadius();
      this.virtualJoystick.setPosition(
        insets.left + radius + 20,
        height - insets.bottom - radius - 20
      );
    }
    if (this.pauseOverlay) {
      this.pauseOverlay.setPosition(width / 2, height / 2);
      const bg = this.pauseOverlay.getByName("pause-bg") as Phaser.GameObjects.Rectangle | null;
      bg?.setSize(width, height);
    }
    this.layoutBossBar();
    if (this.bossText) {
      this.bossText.setPosition(width / 2, insets.top + (isMobileCombatLayout(width, height) ? 72 : 62));
    }
  }

  private layoutBossBar(): void {
    if (!this.bossBar) {
      return;
    }
    const width = this.scale.width;
    const height = this.scale.height;
    const insets = getSafeInsets();
    const mobile = isMobileCombatLayout(width, height);
    const bossScale = mobile ? Math.min(1, (width - 32) / 420) : 1;
    this.bossBar.setScale(bossScale);
    const barY = height - insets.bottom - (mobile ? 34 : 40);
    this.bossBar.setPosition(width / 2, barY);
  }

  private layoutHud(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const insets = getSafeInsets();
    const insetLeft = insets.left;
    const insetRight = insets.right;
    const insetTop = insets.top;
    const insetBottom = insets.bottom;
    const mobile = isMobileCombatLayout(width, height);
    const narrow = isNarrowViewport(width);
    const margin = mobile ? 10 : 16;
    const topY = insetTop + (mobile ? 10 : 18);

    if (mobile) {
      const columnGap = 8;
      const leftColumnWidth = Math.min(128, width * 0.3);
      const rightColumnWidth = Math.min(108, width * 0.28);
      const centerX = width / 2;
      const leftX = insetLeft + margin;
      const rightX = width - insetRight - margin;

      this.healthBar.setBarWidth(leftColumnWidth);
      this.healthBar.setPosition(leftX, topY + 10);
      this.levelText.setPosition(leftX + leftColumnWidth / 2, topY + 28);
      this.levelText.setOrigin(0.5, 0);
      this.levelText.setFontSize("12px");

      this.timerText.setPosition(centerX, topY);
      this.timerText.setFontSize("20px");

      this.difficultyText.setPosition(centerX, topY + 28);
      this.difficultyText.setFontSize("11px");

      this.scoreText.setPosition(rightX, topY + 2);
      this.scoreText.setOrigin(1, 0);
      this.scoreText.setFontSize("11px");
      this.scoreText.setStyle({
        wordWrap: { width: rightColumnWidth },
        lineSpacing: 2
      });

      this.hudHintText.setPosition(rightX, topY + 44);
      this.hudHintText.setVisible(false);

      this.loadoutBar.setCompactMode(true);
      this.loadoutBar.setDisplayScale(1);
      const loadoutW = this.loadoutBar.getWidth();
      const loadoutH = this.loadoutBar.getHeight();
      const bossReserve = this.bossBarVisible ? 70 : 12;
      const loadoutX = width - insetRight - margin - loadoutW;
      const loadoutY = height - insetBottom - loadoutH - bossReserve;
      this.loadoutBar.setPosition(loadoutX, loadoutY);

      const preview = evolutionPreviewLine(this.state);
      this.evolutionPreviewText.setPosition(leftX, topY + 46);
      this.evolutionPreviewText.setFontSize("10px");
      this.evolutionPreviewText.setStyle({
        wordWrap: { width: Math.min(leftColumnWidth + 40, centerX - leftX - columnGap) }
      });
      this.evolutionPreviewText.setVisible(Boolean(preview));

      if (this.pauseChip && this.statusChip) {
        const chipY = topY + 62;
        this.pauseChip.setPosition(rightX, chipY).setVisible(true);
        this.statusChip.setPosition(rightX - this.pauseChip.width - 8, chipY).setVisible(true);
      }
    } else {
      this.healthBar.setBarWidth(200);
      const hpLeft = insetLeft + margin;
      const hpTop = insetTop + 28;
      const loadoutLeft = insetLeft + margin;
      const loadoutTop = isCompactViewport(width, height) ? hpTop + 46 : hpTop + 52;

      this.healthBar.setPosition(hpLeft, hpTop);
      this.levelText.setPosition(hpLeft + this.healthBar.getWidth() + 10, hpTop - 1);
      this.levelText.setOrigin(0, 0);
      this.levelText.setFontSize("14px");

      this.timerText.setPosition(width / 2, topY);
      this.timerText.setFontSize("26px");

      this.difficultyText.setPosition(width / 2, topY + 28);
      this.difficultyText.setFontSize("12px");

      this.scoreText.setPosition(width - insetRight - 24, topY + 8);
      this.scoreText.setOrigin(1, 0);
      this.scoreText.setFontSize("18px");
      this.scoreText.setStyle({ wordWrap: { width: 0 } });

      this.hudHintText.setPosition(width - insetRight - 24, topY + 30);
      this.hudHintText.setVisible(!narrow);

      this.loadoutBar.setCompactMode(false);
      this.loadoutBar.setDisplayScale(1);
      this.loadoutBar.setPosition(loadoutLeft, loadoutTop);

      this.evolutionPreviewText.setPosition(loadoutLeft, loadoutTop + this.loadoutBar.getHeight() + 4);
      this.evolutionPreviewText.setFontSize("11px");
      this.evolutionPreviewText.setStyle({
        wordWrap: { width: Math.min(320, width - loadoutLeft - 24) }
      });

      this.pauseChip?.setVisible(false);
      this.statusChip?.setVisible(false);
    }

    this.layoutBossBar();

    if (isTouchDevice() && !mobile) {
      this.scoreText.setFontSize("16px");
      this.bossText.setFontSize("18px");
    } else if (!mobile) {
      this.bossText.setFontSize("21px");
    } else {
      this.bossText.setFontSize("17px");
    }
  }

  private createTouchHudChips(): void {
    if (!isTouchDevice()) {
      return;
    }
    const chipStyle = {
      fontFamily: UI_FONT,
      fontSize: "12px",
      color: "#f7c66b",
      backgroundColor: "#192033cc",
      padding: { left: 10, right: 10, top: 6, bottom: 6 }
    } as const;
    this.pauseChip = this.add
      .text(0, 0, t("hudPauseButton"), chipStyle)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(860)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.pauseChip.on("pointerdown", () => this.events.emit("ui-toggle-pause"));

    this.statusChip = this.add
      .text(0, 0, t("hudStatusButton"), {
        ...chipStyle,
        color: "#aac7d8"
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(860)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.statusChip.on("pointerdown", () => this.events.emit("ui-toggle-status"));
  }

  private createPauseOverlay(): Phaser.GameObjects.Container {
    const { width, height } = this.scale;
    const container = this.add.container(width / 2, height / 2).setDepth(900).setScrollFactor(0).setVisible(false);
    const bg = this.add.rectangle(0, 0, width, height, 0x050711, 0.68).setName("pause-bg").setInteractive();
    bg.on("pointerdown", () => this.events.emit("ui-toggle-pause"));
    const title = this.add
      .text(0, -28, t("paused"), {
        fontFamily: TITLE_FONT,
        fontSize: isTouchDevice() ? "40px" : "46px",
        color: "#f7efd8"
      })
      .setOrigin(0.5);
    this.pauseHintText = this.add
      .text(0, 34, isTouchDevice() ? t("pauseHintTouch") : t("pauseHint"), {
        fontFamily: UI_FONT,
        fontSize: "18px",
        color: "#aac7d8"
      })
      .setOrigin(0.5);
    container.add([bg, title, this.pauseHintText]);
    return container;
  }

  private createBossBar(): Phaser.GameObjects.Container {
    const container = this.add
      .container(this.scale.width / 2, this.scale.height - 40)
      .setDepth(850)
      .setScrollFactor(0)
      .setVisible(false);
    const bg = this.add.rectangle(0, 0, 420, 18, 0x2a1720).setStrokeStyle(2, 0xff7687);
    this.bossBarFill = this.add.rectangle(-208, 0, 416, 10, 0xff4f64).setOrigin(0, 0.5);
    this.bossBarLabel = this.add
      .text(0, -28, enemyName("midBoss"), {
        fontFamily: UI_FONT,
        fontSize: "16px",
        color: "#ffb3bf",
        fontStyle: "700"
      })
      .setOrigin(0.5);
    this.bossTechniqueLabel = this.add
      .text(0, 18, "", {
        fontFamily: UI_FONT,
        fontSize: "13px",
        color: "#ffe09a",
        fontStyle: "700"
      })
      .setOrigin(0.5);
    container.add([bg, this.bossBarFill, this.bossBarLabel, this.bossTechniqueLabel]);
    return container;
  }

  private updateBossBar(hp: number, maxHp: number, name: string): void {
    const ratio = Phaser.Math.Clamp(hp / maxHp, 0, 1);
    const wasVisible = this.bossBarVisible;
    this.bossBarVisible = ratio > 0;
    this.bossBar.setVisible(this.bossBarVisible);
    this.bossBarFill.width = 416 * ratio;
    const percent = Math.round(ratio * 100);
    this.bossBarLabel.setText(
      `${name}  ${percent}%  ${formatCompactNumber(hp)} / ${formatCompactNumber(maxHp)}`
    );
    if (ratio <= 0) {
      this.clearBossTechnique();
    }
    if (wasVisible !== this.bossBarVisible) {
      this.layoutHud();
    }
  }

  private showBossTechnique(name: string, color = 0xffe09a): void {
    this.bossBar.setVisible(true);
    this.bossTechniqueLabel.setText(t("bossTechniqueStatus", { name }));
    this.bossTechniqueLabel.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
  }

  private clearBossTechnique(): void {
    this.bossTechniqueLabel?.setText("");
  }

  private showBossIntro(name: string, markSec: number, enemyId: EnemyId): void {
    this.bossIntroPanel?.destroy();
    this.bossText.setText(t("bossWarning", { minute: Math.floor(markSec / 60), name }));
    this.bossText.setAlpha(1);

    const config = ENEMY_CONFIGS[enemyId];
    const presentation = bossPresentationFor(enemyId);
    const centerX = this.scale.width / 2;
    const frameColor = presentation?.portraitFrameColor ?? 0xff7687;
    const titleColor = presentation?.titleColor ?? "#ff7687";
    const portraitScale = presentation?.portraitScale ?? 1.1;
    const textureKey = this.textures.exists(config.spriteKey) ? config.spriteKey : "boss-master";

    const introY = safeInset("top") + (isMobileCombatLayout(this.scale.width, this.scale.height) ? 96 : 118);
    const container = this.add.container(centerX, introY).setDepth(880).setScrollFactor(0).setAlpha(0);
    const backdrop = this.add.rectangle(0, 0, Math.min(420, this.scale.width - 48), 148, 0x120d18, 0.9).setStrokeStyle(3, frameColor, 0.95);
    const portrait = this.add.image(0, -8, textureKey).setScale(portraitScale);
    const frame = this.add.rectangle(0, -8, portrait.displayWidth + 18, portrait.displayHeight + 18, 0x000000, 0).setStrokeStyle(4, frameColor, 0.92);
    const tierLabel =
      presentation && presentation.tier >= 5
        ? t("bossTierSupreme")
        : presentation && presentation.tier >= 4
          ? t("bossTierLegendary")
          : presentation && presentation.tier >= 3
            ? t("bossTierGrand")
            : presentation && presentation.tier >= 2
              ? t("bossTierMaster")
              : t("bossTierCaptain");
    const tierText = this.add
      .text(0, -72, tierLabel, {
        fontFamily: UI_FONT,
        fontSize: presentation && presentation.tier >= 5 ? "15px" : "13px",
        color: titleColor,
        fontStyle: "700"
      })
      .setOrigin(0.5);
    const nameText = this.add
      .text(0, 58, name, {
        fontFamily: TITLE_FONT,
        fontSize: presentation && presentation.tier >= 5 ? "28px" : "24px",
        color: titleColor,
        fontStyle: "700"
      })
      .setOrigin(0.5);
    container.add([backdrop, portrait, frame, tierText, nameText]);
    this.bossIntroPanel = container;

    this.tweens.add({
      targets: container,
      alpha: 1,
      y: introY - 10,
      duration: 280,
      ease: "Back.easeOut"
    });
    this.tweens.add({
      targets: portrait,
      scale: portraitScale * 1.06,
      duration: 720,
      yoyo: true,
      repeat: 2,
      ease: "Sine.easeInOut"
    });
    this.tweens.add({
      targets: [container, this.bossText],
      alpha: 0,
      delay: 2200,
      duration: 520,
      ease: "Sine.easeIn",
      onComplete: () => {
        container.destroy();
        if (this.bossIntroPanel === container) {
          this.bossIntroPanel = undefined;
        }
        this.bossText.setText("");
        this.bossText.setAlpha(1);
      }
    });
  }

  private showBossLegacy(summary: BossLegacySummary): void {
    this.legacyPanel?.destroy();
    const { width } = this.scale;
    const panelWidth = Math.min(560, width - 52);
    const legacyY = safeInset("top") + (isMobileCombatLayout(width, this.scale.height) ? 88 : 120);
    const container = this.add.container(width / 2, legacyY).setDepth(920).setScrollFactor(0);
    const bg = this.add.rectangle(0, 0, panelWidth, 118, 0x16101d, 0.92).setStrokeStyle(2, 0xffd36a, 0.9);
    const title = this.add
      .text(0, -46, summary.title, {
        fontFamily: TITLE_FONT,
        fontSize: "22px",
        color: "#ffe09a",
        align: "center",
        wordWrap: { width: panelWidth - 32 }
      })
      .setOrigin(0.5, 0);
    const body = this.add
      .text(0, -10, summary.body, {
        fontFamily: UI_FONT,
        fontSize: "14px",
        color: "#d8e2eb",
        align: "center",
        lineSpacing: 6,
        wordWrap: { width: panelWidth - 38 }
      })
      .setOrigin(0.5, 0);
    container.add([bg, title, body]);
    this.legacyPanel = container;
    this.tweens.add({
      targets: container,
      y: legacyY - 16,
      duration: 180,
      ease: "Sine.easeOut",
      yoyo: true,
      hold: 2600,
      onComplete: () => {
        container.destroy();
        if (this.legacyPanel === container) {
          this.legacyPanel = undefined;
        }
      }
    });
  }
}
