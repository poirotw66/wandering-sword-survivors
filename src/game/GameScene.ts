import Phaser from "phaser";
import { GAME_DURATION_SEC } from "../data/waves";
import { Player } from "../entities/Player";
import { CollisionSystem } from "../systems/CollisionSystem";
import { AudioFeedbackSystem } from "../systems/AudioFeedbackSystem";
import { AchievementSystem } from "../systems/AchievementSystem";
import { EnemySystem } from "../systems/EnemySystem";
import { ExpSystem } from "../systems/ExpSystem";
import { PlayerSystem } from "../systems/PlayerSystem";
import { PickupSystem } from "../systems/PickupSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { UpgradeSystem } from "../systems/UpgradeSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import type { UpgradeOption } from "../data/upgrades";
import type { GameOverData } from "./GameOverScene";
import type { GameState } from "./GameState";
import { t } from "../i18n";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private state!: GameState;
  private playerSystem!: PlayerSystem;
  private enemySystem!: EnemySystem;
  private spawnSystem!: SpawnSystem;
  private weaponSystem!: WeaponSystem;
  private expSystem!: ExpSystem;
  private pickupSystem!: PickupSystem;
  private upgradeSystem!: UpgradeSystem;
  private achievementSystem!: AchievementSystem;
  private devText?: Phaser.GameObjects.Text;
  private ended = false;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.ended = false;
    this.events.removeAllListeners("level-up");
    this.events.removeAllListeners("game-won");
    this.events.removeAllListeners("player-damaged");
    this.events.removeAllListeners("enemy-killed");
    this.events.removeAllListeners("player-healed");
    this.events.removeAllListeners("upgrade-picked");
    this.physics.world.setBounds(-3000, -3000, 6000, 6000);
    this.cameras.main.setBackgroundColor("#111421");

    this.createFloor();
    this.player = new Player(this, 0, 0);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setDeadzone(28, 28);
    this.state = {
      player: this.player,
      level: 1,
      exp: 0,
      expToNext: 8,
      score: 0,
      kills: 0,
      elapsedSec: 0,
      pausedForUpgrade: false,
      pausedForMenu: false,
      weaponLevels: new Map(),
      evolvedWeapons: new Map(),
      skillLevels: new Map(),
      buildPathLevels: new Map(),
      unlockedSkills: new Set(),
      unlockedAchievements: new Set(),
      bossDefeats: new Map(),
      highestDifficulty: 1,
      devMode: {
        enabled: this.isDevModeRequested(),
        timeScale: 1
      }
    };

    this.playerSystem = new PlayerSystem(this, this.player);
    this.enemySystem = new EnemySystem(this, this.player);
    this.spawnSystem = new SpawnSystem(this, this.player, this.enemySystem);
    this.weaponSystem = new WeaponSystem(this, this.player, this.enemySystem, this.state.weaponLevels, this.state.evolvedWeapons);
    this.expSystem = new ExpSystem(this, this.player, this.state);
    this.pickupSystem = new PickupSystem(this, this.player);
    this.upgradeSystem = new UpgradeSystem(this, this.state);
    this.achievementSystem = new AchievementSystem(this.state);
    new AudioFeedbackSystem(this);
    new CollisionSystem(
      this,
      this.player,
      this.state,
      this.enemySystem,
      this.weaponSystem,
      this.expSystem,
      this.pickupSystem,
      this.achievementSystem
    );

    this.scene.launch("UIScene", this.state);
    this.events.on("level-up", () => this.upgradeSystem.open());
    this.events.on("game-won", () => this.finish(true));
    this.events.on("player-damaged", () => {
      this.cameras.main.shake(120, 0.006);
      if (this.player.stats.hp <= 0) {
        this.finish(false);
      }
    });
    this.events.on("enemy-killed", (x: number, y: number, score: number) => this.showScorePop(x, y, score));
    this.events.on("milestone-unlocked", (message: string) => this.showScorePop(this.player.x, this.player.y - 78, message, "#ffe09a"));
    this.events.on("player-healed", (amount: number) => this.showScorePop(this.player.x, this.player.y - 12, amount, "#84f7b2"));
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-F1", () => this.toggleDevMode());
    this.input.keyboard?.on("keydown-L", () => this.devGrantLevel());
    this.input.keyboard?.on("keydown-B", () => this.devSpawnBoss());
    this.input.keyboard?.on("keydown-N", () => this.devAdvanceWave());
    this.events.on("upgrade-picked", (option: UpgradeOption) => {
      this.upgradeSystem.apply(option);
    });

    this.devText = this.add
      .text(18, this.scale.height - 18, "", {
        fontSize: "13px",
        color: "#f7c66b",
        backgroundColor: "#111421bb",
        padding: { x: 8, y: 5 }
      })
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(950);
    this.scale.on("resize", () => this.devText?.setPosition(18, this.scale.height - 18));
    this.refreshDevText();
  }

  update(_time: number, delta: number): void {
    if (this.ended || this.state.pausedForUpgrade) {
      return;
    }

    if (this.state.pausedForMenu) {
      return;
    }

    this.state.elapsedSec += (delta / 1000) * this.state.devMode.timeScale;
    this.playerSystem.update(delta);
    this.spawnSystem.update(this.state.elapsedSec);
    this.enemySystem.update();
    this.weaponSystem.update();
    this.expSystem.update();
    this.pickupSystem.update();
    this.refreshDevText();

  }

  private createFloor(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x24283b, 0.45);
    for (let x = -3000; x <= 3000; x += 120) {
      graphics.lineBetween(x, -3000, x, 3000);
    }
    for (let y = -3000; y <= 3000; y += 120) {
      graphics.lineBetween(-3000, y, 3000, y);
    }
    graphics.setDepth(-10);
  }

  private finish(won: boolean): void {
    if (this.ended) {
      return;
    }
    this.ended = true;
    const data: GameOverData = {
      won,
      score: this.state.score,
      kills: this.state.kills,
      elapsedSec: this.state.elapsedSec,
      highestDifficulty: this.state.highestDifficulty,
      achievements: [...this.state.unlockedAchievements]
    };
    this.scene.stop("UIScene");
    this.scene.start("GameOverScene", data);
  }

  private togglePause(): void {
    if (this.ended || this.state.pausedForUpgrade) {
      return;
    }

    this.state.pausedForMenu = !this.state.pausedForMenu;
    if (this.state.pausedForMenu) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
    this.scene.get("UIScene").events.emit("pause-changed", this.state.pausedForMenu);
  }

  private isDevModeRequested(): boolean {
    const params = new URLSearchParams(window.location.search);
    return params.get("dev") === "1" || window.location.hash.includes("dev");
  }

  private toggleDevMode(): void {
    this.state.devMode.enabled = !this.state.devMode.enabled;
    this.state.devMode.timeScale = this.state.devMode.enabled ? 4 : 1;
    this.refreshDevText();
    this.showScorePop(this.player.x, this.player.y - 52, this.state.devMode.enabled ? t("devOn") : t("devOff"), "#f7c66b");
  }

  private devGrantLevel(): void {
    if (!this.state.devMode.enabled || this.ended || this.state.pausedForUpgrade) {
      return;
    }
    this.state.exp = this.state.expToNext;
    this.expSystem.collectDevExp();
    this.refreshDevText();
  }

  private devSpawnBoss(): void {
    if (!this.state.devMode.enabled || this.ended) {
      return;
    }
    this.spawnSystem.spawnBossNow();
    this.refreshDevText();
  }

  private devAdvanceWave(): void {
    if (!this.state.devMode.enabled || this.ended || this.state.pausedForUpgrade) {
      return;
    }
    this.state.elapsedSec = Math.min(GAME_DURATION_SEC - 10, this.state.elapsedSec + 60);
    this.refreshDevText();
  }

  private refreshDevText(): void {
    if (!this.devText) {
      return;
    }

    this.devText.setVisible(this.state.devMode.enabled);
    this.devText.setText(
      t("devHud", { seconds: Math.floor(this.state.elapsedSec), scale: this.state.devMode.timeScale })
    );
  }

  private showScorePop(x: number, y: number, score: number | string, color = "#f7c66b"): void {
    const text = this.add
      .text(x, y - 18, typeof score === "number" ? `+${score}` : score, {
        fontSize: "16px",
        color,
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(40);
    this.tweens.add({
      targets: text,
      y: y - 54,
      alpha: 0,
      duration: 520,
      ease: "Sine.easeOut",
      onComplete: () => text.destroy()
    });
  }
}
