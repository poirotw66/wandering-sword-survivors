import Phaser from "phaser";
import type { UpgradeOption } from "../data/upgrades";
import type { GameState } from "./GameState";
import { ExpBar } from "../ui/ExpBar";
import { HealthBar } from "../ui/HealthBar";
import { TimerText } from "../ui/TimerText";
import { UpgradePanel } from "../ui/UpgradePanel";
import { buildPathName, enemyName, skillName, t, weaponName } from "../i18n";

export class UIScene extends Phaser.Scene {
  private state!: GameState;
  private healthBar!: HealthBar;
  private expBar!: ExpBar;
  private timerText!: TimerText;
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private skillText!: Phaser.GameObjects.Text;
  private innerForceText!: Phaser.GameObjects.Text;
  private buildPathText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;
  private bossBar!: Phaser.GameObjects.Container;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarLabel!: Phaser.GameObjects.Text;
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
    this.expBar = new ExpBar(this);
    this.healthBar = new HealthBar(this, 24, 34);
    this.timerText = new TimerText(this, this.scale.width / 2, 18);
    this.levelText = this.add.text(24, 52, "", { fontSize: "18px", color: "#f7efd8" }).setScrollFactor(0);
    this.scoreText = this.add
      .text(this.scale.width - 24, 26, "", { fontSize: "18px", color: "#d8e2eb" })
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.weaponText = this.add
      .text(24, 80, "", { fontSize: "14px", color: "#aac7d8", lineSpacing: 5 })
      .setScrollFactor(0);
    this.skillText = this.add
      .text(24, 166, "", { fontSize: "14px", color: "#f7c66b", lineSpacing: 5 })
      .setScrollFactor(0);
    this.innerForceText = this.add
      .text(24, 264, "", { fontSize: "14px", color: "#84f7b2", lineSpacing: 5 })
      .setScrollFactor(0);
    this.buildPathText = this.add
      .text(24, 328, "", { fontSize: "14px", color: "#ffe09a", lineSpacing: 5 })
      .setScrollFactor(0);
    this.bossText = this.add
      .text(this.scale.width / 2, 62, "", { fontSize: "22px", color: "#ff7687", fontStyle: "700" })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.bossBar = this.createBossBar();
    this.pauseOverlay = this.createPauseOverlay();
    this.upgradePanel = new UpgradePanel(this);
    this.resize();

    this.scale.on("resize", () => this.resize());
    this.events.on("show-upgrades", (options: UpgradeOption[]) => {
      this.upgradePanel.show(options, (option) => this.scene.get("GameScene").events.emit("upgrade-picked", option));
    });
    this.events.on("hide-upgrades", () => this.upgradePanel.hide());
    this.events.on("pause-changed", (paused: boolean) => this.pauseOverlay.setVisible(paused));
    this.scene.get("GameScene").events.on("boss-spawned", (name: string, markSec: number) => this.showBossWarning(name, markSec));
    this.scene.get("GameScene").events.on("boss-health-changed", (hp: number, maxHp: number, name: string) => {
      this.updateBossBar(hp, maxHp, name);
    });

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
    this.scoreText.setText(`${t("renown")} ${this.state.score}  ${t("defeated")} ${this.state.kills}`);
    this.weaponText.setText(this.formatWeapons());
    this.skillText.setText(this.formatSkills());
    this.innerForceText.setText(this.formatInnerForce());
    this.buildPathText.setText(this.formatBuildPaths());
  }

  private resize(): void {
    const width = this.scale.width;
    this.expBar.resize(width);
    this.timerText.setPosition(width / 2, 18);
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

  private formatWeapons(): string {
    const equipped = [...this.state.weaponLevels.entries()]
      .filter(([, level]) => level > 0)
      .map(([weaponId, level]) => t("weaponLevel", { name: weaponName(weaponId), level }));
    return equipped.length > 0
      ? `${t("forms")}\n${equipped.join("\n")}`
      : `${t("forms")}\n${t("weaponLevel", { name: weaponName("magicBolt"), level: 1 })}`;
  }

  private formatSkills(): string {
    const learned = [...this.state.skillLevels.entries()]
      .filter(([, level]) => level > 0)
      .map(([skillId, level]) => t("skillLevel", { name: skillName(skillId), level }));
    return learned.length > 0 ? `${t("martialSkills")}\n${learned.join("\n")}` : `${t("martialSkills")}\n${t("none")}`;
  }

  private formatInnerForce(): string {
    const weaponLayers = [...this.state.weaponLevels.values()].reduce((total, level) => total + level, 0);
    const skillLayers = [...this.state.skillLevels.values()].reduce((total, level) => total + level, 0);
    const innerForce = Math.round(
      100 * this.state.player.stats.damageMultiplier +
        this.state.player.stats.pickupRange * 0.4 +
        (1 / this.state.player.stats.cooldownMultiplier) * 28
    );
    return `${t("innerForce")} ${innerForce}\n${t("martialLayers")} ${weaponLayers + skillLayers}`;
  }

  private formatBuildPaths(): string {
    const paths = [...this.state.buildPathLevels.entries()]
      .filter(([, level]) => level > 0)
      .map(([pathId, level]) => t("buildLevel", { name: buildPathName(pathId), level }));
    return paths.length > 0 ? `${t("buildPaths")}\n${paths.join("\n")}` : `${t("buildPaths")}\n${t("none")}`;
  }

  private createPauseOverlay(): Phaser.GameObjects.Container {
    const { width, height } = this.scale;
    const container = this.add.container(width / 2, height / 2).setDepth(900).setScrollFactor(0).setVisible(false);
    const bg = this.add.rectangle(0, 0, width, height, 0x050711, 0.68).setName("pause-bg");
    const title = this.add
      .text(0, -28, t("paused"), {
        fontFamily: "Georgia, serif",
        fontSize: "46px",
        color: "#f7efd8"
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(0, 34, t("pauseHint"), {
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
        fontSize: "16px",
        color: "#ffb3bf",
        fontStyle: "700"
      })
      .setOrigin(0.5);
    container.add([bg, this.bossBarFill, this.bossBarLabel]);
    return container;
  }

  private updateBossBar(hp: number, maxHp: number, name: string): void {
    const ratio = Phaser.Math.Clamp(hp / maxHp, 0, 1);
    this.bossBar.setVisible(ratio > 0);
    this.bossBarFill.width = 416 * ratio;
    this.bossBarLabel.setText(`${name}  ${Math.ceil(hp)} / ${maxHp}`);
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
}
