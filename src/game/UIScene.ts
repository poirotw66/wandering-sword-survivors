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
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";
import type { BossLegacySummary } from "../data/bossLegacy";

export class UIScene extends Phaser.Scene {
  private state!: GameState;
  private healthBar!: HealthBar;
  private expBar!: ExpBar;
  private timerText!: TimerText;
  private loadoutBar!: LoadoutBar;
  private statusPanel!: StatusPanel;
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;
  private bossBar!: Phaser.GameObjects.Container;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarLabel!: Phaser.GameObjects.Text;
  private bossTechniqueLabel!: Phaser.GameObjects.Text;
  private legacyPanel?: Phaser.GameObjects.Container;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private upgradePanel!: UpgradePanel;

  constructor() {
    super("UIScene");
  }

  create(state: GameState): void {
    this.state = state;
    this.events.removeAllListeners("show-upgrades");
    this.events.removeAllListeners("hide-upgrades");
    this.events.removeAllListeners("upgrade-picked");
    this.events.removeAllListeners("status-changed");
    this.expBar = new ExpBar(this);
    this.healthBar = new HealthBar(this, 24, 34);
    this.timerText = new TimerText(this, this.scale.width / 2, 18);
    this.levelText = this.add
      .text(0, 0, "", { fontFamily: UI_FONT, fontSize: "16px", color: "#f7efd8" })
      .setPadding(0, 2, 0, 2)
      .setScrollFactor(0)
      .setDepth(830);
    this.scoreText = this.add
      .text(this.scale.width - 24, 26, "", { fontFamily: UI_FONT, fontSize: "18px", color: "#d8e2eb" })
      .setPadding(0, 4, 0, 4)
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.loadoutBar = new LoadoutBar(this, 24, 0);
    this.statusPanel = new StatusPanel(this);
    this.levelText.setText(`${t("playerName")} Lv ${state.level}`);
    this.bossText = this.add
      .text(this.scale.width / 2, 62, "", { fontFamily: UI_FONT, fontSize: "21px", color: "#ff7687", fontStyle: "700" })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.bossBar = this.createBossBar();
    this.pauseOverlay = this.createPauseOverlay();
    this.upgradePanel = new UpgradePanel(this);
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
    this.scene.get("GameScene").events.on("boss-spawned", (name: string, markSec: number) => this.showBossWarning(name, markSec));
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
    this.levelText.setText(`${t("playerName")} Lv ${this.state.level}`);
    this.layoutLeftHud();
    this.scoreText.setText(`${t("renown")} ${this.state.score}  ${t("defeated")} ${this.state.kills}`);
    this.loadoutBar.update(this.state);
    this.statusPanel.refresh(this.state);
  }

  private resize(): void {
    const width = this.scale.width;
    this.expBar.resize(width);
    this.timerText.setPosition(width / 2, 18);
    this.layoutLeftHud();
    if (this.scoreText) {
      this.scoreText.setPosition(width - 24, 26);
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
    const hpBarBottom = 43;
    const loadoutTop = hpBarBottom + 12;
    this.levelText.setPosition(292, 25);
    this.loadoutBar.setPosition(24, loadoutTop);
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
    this.bossBarLabel.setText(`${name}  ${Math.ceil(hp)} / ${maxHp}`);
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

  private showBossWarning(name: string, markSec: number): void {
    this.bossText.setText(t("bossWarning", { minute: Math.floor(markSec / 60), name }));
    this.tweens.add({
      targets: this.bossText,
      alpha: 0,
      delay: 1600,
      duration: 900,
      onComplete: () => {
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
