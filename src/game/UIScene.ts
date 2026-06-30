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
import type { BossLegacySummary } from "../data/bossLegacy";

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
  private scoreText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;
  private bossBar!: Phaser.GameObjects.Container;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarLabel!: Phaser.GameObjects.Text;
  private bossTechniqueLabel!: Phaser.GameObjects.Text;
  private legacyPanel?: Phaser.GameObjects.Container;
  private bossIntroPanel?: Phaser.GameObjects.Container;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private upgradePanel!: UpgradePanel;
  private virtualJoystick?: VirtualJoystick;

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
    this.scoreText = this.add
      .text(this.scale.width - 24, 26, "", { fontFamily: UI_FONT, fontSize: "18px", color: "#d8e2eb" })
      .setPadding(0, 4, 0, 4)
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.loadoutBar = new LoadoutBar(this, 24, 0);
    this.statusPanel = new StatusPanel(this);
    this.levelText.setText(t("hudPlayerLevel", { level: state.level }));
    this.bossText = this.add
      .text(this.scale.width / 2, 62, "", { fontFamily: UI_FONT, fontSize: "21px", color: "#ff7687", fontStyle: "700" })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.bossBar = this.createBossBar();
    this.pauseOverlay = this.createPauseOverlay();
    this.upgradePanel = new UpgradePanel(this);
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
    this.events.on("pause-changed", (paused: boolean) => this.pauseOverlay.setVisible(paused));
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
    this.layoutLeftHud();
    const rewardSuffix =
      this.state.difficultyRewardMultiplier > 1
        ? `  ×${Math.round(this.state.difficultyRewardMultiplier * 100)}%`
        : "";
    this.scoreText.setText(`${t("renown")} ${this.state.score}${rewardSuffix}  ${t("defeated")} ${this.state.kills}`);
    this.hudHintText.setText(
      t("hudControlsLine", {
        rerolls: this.state.rerolls,
        banish: this.state.banishCharges
      })
    );
    this.loadoutBar.update(this.state);
    this.statusPanel.refresh(this.state);
  }

  private resize(): void {
    const width = this.scale.width;
    this.expBar.resize(width);
    this.timerText.setPosition(width / 2, 18);
    this.difficultyText.setPosition(width / 2, 46);
    this.layoutLeftHud();
    if (this.scoreText) {
      this.scoreText.setPosition(width - 24, 26);
    }
    if (this.hudHintText) {
      this.hudHintText.setPosition(width - 24, 48);
    }
    if (this.virtualJoystick) {
      this.virtualJoystick.setPosition(88, this.scale.height - 108);
    }
    if (this.pauseOverlay) {
      this.pauseOverlay.setPosition(width / 2, this.scale.height / 2);
      const bg = this.pauseOverlay.getByName("pause-bg") as Phaser.GameObjects.Rectangle | null;
      bg?.setSize(width, this.scale.height);
    }
    if (this.bossBar) {
      this.bossBar.setPosition(width / 2, this.scale.height - 40);
    }
    if (this.bossText) {
      this.bossText.setPosition(width / 2, 62);
    }
  }

  private layoutLeftHud(): void {
    const hpLeft = 24;
    const hpTop = 34;
    const loadoutLeft = 24;
    const loadoutTop = 58;
    this.healthBar.setPosition(hpLeft, hpTop);
    this.levelText.setPosition(hpLeft + this.healthBar.getWidth() + 10, hpTop - 1);
    this.loadoutBar.setPosition(loadoutLeft, loadoutTop);
  }

  private createPauseOverlay(): Phaser.GameObjects.Container {
    const { width, height } = this.scale;
    const container = this.add.container(width / 2, height / 2).setDepth(900).setScrollFactor(0).setVisible(false);
    const bg = this.add.rectangle(0, 0, width, height, 0x050711, 0.68).setName("pause-bg");
    const title = this.add
      .text(0, -28, t("paused"), {
        fontFamily: TITLE_FONT,
        fontSize: "46px",
        color: "#f7efd8"
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(0, 34, t("pauseHint"), {
        fontFamily: UI_FONT,
        fontSize: "18px",
        color: "#aac7d8"
      })
      .setOrigin(0.5);
    container.add([bg, title, hint]);
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
    this.bossBar.setVisible(ratio > 0);
    this.bossBarFill.width = 416 * ratio;
    const percent = Math.round(ratio * 100);
    this.bossBarLabel.setText(
      `${name}  ${percent}%  ${formatCompactNumber(hp)} / ${formatCompactNumber(maxHp)}`
    );
    if (ratio <= 0) {
      this.clearBossTechnique();
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

    const container = this.add.container(centerX, 118).setDepth(880).setScrollFactor(0).setAlpha(0);
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
      y: 108,
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
    const container = this.add.container(width / 2, 120).setDepth(920).setScrollFactor(0);
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
      y: 96,
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
