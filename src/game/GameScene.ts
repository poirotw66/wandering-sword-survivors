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
import { buildPathName, t } from "../i18n";
import { difficultyForLevel, type DifficultyConfig } from "../data/metaProgression";
import { applyStartStyleBonus, formatStartStyleToast, normalizeStartStyle, type StartStyleId } from "../data/metaChoices";
import { applyStyleMasteryBonus, banishChargesFromShop, metaBonusesFromShop } from "../data/renownShop";

type GameSceneData = {
  difficultyLevel?: number;
  startStyleId?: StartStyleId;
};

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
  private playerGroundFx?: Phaser.GameObjects.Graphics;
  private playerShadow?: Phaser.GameObjects.Ellipse;
  private devText?: Phaser.GameObjects.Text;
  private nextFootstepAt = 0;
  private ended = false;

  constructor() {
    super("GameScene");
  }

  create(data: GameSceneData = {}): void {
    this.ended = false;
    this.events.removeAllListeners("level-up");
    this.events.removeAllListeners("game-won");
    this.events.removeAllListeners("player-damaged");
    this.events.removeAllListeners("enemy-killed");
    this.events.removeAllListeners("player-healed");
    this.events.removeAllListeners("upgrade-picked");
    this.events.removeAllListeners("upgrade-reroll");
    this.events.removeAllListeners("upgrade-banish");
    this.physics.world.setBounds(-3000, -3000, 6000, 6000);
    this.cameras.main.setBackgroundColor("#111421");
    this.cameras.main.setBounds(-3000, -3000, 6000, 6000);
    this.cameras.main.roundPixels = true;

    this.createFloor();
    this.player = new Player(this, 0, 0);
    this.createPlayerGroundingEffects();
    const difficulty = difficultyForLevel(data.difficultyLevel ?? 1);
    this.applyMetaBonuses(difficulty);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setDeadzone(28, 28);
    const record = AchievementSystem.readRecord();
    const metaBonuses = metaBonusesFromShop(record);
    const startStyleId = normalizeStartStyle(
      record,
      data.startStyleId ?? window.localStorage?.getItem("sword-survivors-start-style")
    );
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
      startStyleId,
      unlockedSkills: new Set(),
      unlockedSkillsThisRun: new Set(),
      unlockedAchievements: new Set(),
      evolvedArtsSeen: new Set(),
      standaloneSkillsSeen: new Set(),
      bossDefeats: new Map(),
      highestDifficulty: 1,
      selectedDifficulty: difficulty.level,
      difficultyRewardMultiplier: difficulty.rewardMultiplier,
      rerolls: metaBonuses.rerolls,
      banishedUpgradeIds: new Set(),
      banishCharges: banishChargesFromShop(record),
      renownTitle: t(metaBonuses.titleKey),
      devMode: {
        enabled: this.isDevModeRequested(),
        timeScale: 1
      }
    };
    applyStartStyleBonus(this.state, startStyleId);
    applyStyleMasteryBonus(this.state, startStyleId, record);
    this.showScorePop(this.player.x, this.player.y - 100, formatStartStyleToast(buildPathName(startStyleId)), "#b8f7ff");

    this.playerSystem = new PlayerSystem(this, this.player);
    this.enemySystem = new EnemySystem(this, this.player, difficulty);
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
      if (option.evolutionId) {
        this.events.emit("evolution-learned", option.evolutionId);
        this.showEvolutionLearned(option.title);
        for (const message of this.achievementSystem.recordEvolution(option.evolutionId)) {
          this.showScorePop(this.player.x, this.player.y - 94, message, "#ffe09a");
        }
      }
      if (option.kind === "standaloneSkill" && option.skillId) {
        for (const message of this.achievementSystem.recordStandaloneSkill(option.skillId)) {
          this.showScorePop(this.player.x, this.player.y - 82, message, "#b8f7ff");
        }
      }
    });
    this.events.on("upgrade-reroll", () => this.upgradeSystem.reroll());
    this.events.on("upgrade-banish", (option: UpgradeOption) => this.upgradeSystem.banish(option));

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

  update(time: number, delta: number): void {
    if (this.ended || this.state.pausedForUpgrade) {
      return;
    }

    if (this.state.pausedForMenu) {
      return;
    }

    this.state.elapsedSec += (delta / 1000) * this.state.devMode.timeScale;
    this.playerSystem.update(delta);
    this.updatePlayerGroundingEffects(time);
    this.spawnSystem.update(this.state.elapsedSec);
    this.enemySystem.update();
    this.weaponSystem.update();
    this.expSystem.update();
    this.pickupSystem.update();
    this.refreshDevText();

  }

  private createFloor(): void {
    this.add
      .image(0, 0, "wuxia-jianghu-map")
      .setDisplaySize(6000, 6000)
      .setDepth(-20);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x07101a, 0.18);
    graphics.fillRect(-3000, -3000, 6000, 6000);

    graphics.lineStyle(1, 0xd8e2eb, 0.08);
    for (let x = -3000; x <= 3000; x += 240) {
      graphics.lineBetween(x, -3000, x, 3000);
    }
    for (let y = -3000; y <= 3000; y += 240) {
      graphics.lineBetween(-3000, y, 3000, y);
    }

    this.drawMistBand(graphics, -2780, -930, 1320, 155);
    this.drawMistBand(graphics, -1020, -1210, 1160, 130);
    this.drawMistBand(graphics, 760, -900, 1420, 160);
    this.drawMistBand(graphics, -2440, 920, 1520, 150);
    this.drawMistBand(graphics, 500, 1120, 1660, 170);

    graphics.fillStyle(0xe4cf8f, 0.26);
    graphics.fillCircle(-145, 65, 7);
    graphics.lineStyle(2, 0xe4cf8f, 0.28);
    graphics.strokeCircle(-145, 65, 22);
    graphics.strokeCircle(-145, 65, 36);
    graphics.setDepth(-10);
  }

  private drawMistBand(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void {
    graphics.fillStyle(0xd8e2eb, 0.08);
    graphics.fillEllipse(x, y, width, height);
    graphics.fillStyle(0xb8f7ff, 0.05);
    graphics.fillEllipse(x + width * 0.18, y + 24, width * 0.62, height * 0.54);
  }

  private createPlayerGroundingEffects(): void {
    this.playerGroundFx = this.add.graphics().setDepth(-8);
    this.playerShadow = this.add
      .ellipse(this.player.x, this.player.y + 18, 48, 18, 0x02060a, 0.48)
      .setDepth(19);
  }

  private updatePlayerGroundingEffects(time: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = body.velocity.length();
    const stride = Phaser.Math.Clamp(speed / this.player.stats.moveSpeed, 0, 1);

    this.playerShadow
      ?.setPosition(this.player.x, this.player.y + 18)
      .setScale(1 + stride * 0.18, 1 + stride * 0.08)
      .setAlpha(0.42 + stride * 0.12);

    if (this.playerGroundFx) {
      this.playerGroundFx.clear();
      this.playerGroundFx.fillStyle(0xd8e2eb, 0.045);
      this.playerGroundFx.fillCircle(this.player.x, this.player.y + 8, 120);
      this.playerGroundFx.fillStyle(0x8fd3dc, 0.035);
      this.playerGroundFx.fillCircle(this.player.x, this.player.y + 8, 76);
      this.playerGroundFx.lineStyle(2, 0xe4cf8f, 0.2);
      this.playerGroundFx.strokeCircle(this.player.x, this.player.y + 8, 42 + stride * 8);
    }

    if (speed > 55 && time >= this.nextFootstepAt) {
      this.nextFootstepAt = time + 105;
      this.spawnFootstepDust(body.velocity);
    }
  }

  private spawnFootstepDust(velocity: Phaser.Math.Vector2): void {
    const direction = velocity.clone().normalize();
    const x = this.player.x - direction.x * 18 + Phaser.Math.Between(-7, 7);
    const y = this.player.y + 20 - direction.y * 8 + Phaser.Math.Between(-4, 4);
    const dust = this.add
      .ellipse(x, y, Phaser.Math.Between(18, 28), Phaser.Math.Between(6, 10), 0xd8c79e, 0.22)
      .setDepth(18)
      .setRotation(Phaser.Math.FloatBetween(-0.45, 0.45));

    this.tweens.add({
      targets: dust,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.45,
      x: x - direction.x * 12,
      y: y - direction.y * 8,
      duration: 360,
      ease: "Sine.easeOut",
      onComplete: () => dust.destroy()
    });
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
      highestDifficulty: Math.max(this.state.highestDifficulty, this.state.selectedDifficulty),
      achievements: [...this.state.unlockedAchievements],
      evolvedArtsSeen: [...this.state.evolvedArtsSeen],
      standaloneSkillsSeen: [...this.state.standaloneSkillsSeen],
      unlockedSkillsThisRun: [...this.state.unlockedSkillsThisRun],
      bossDefeatsSeen: [...this.state.bossDefeats.keys()],
      favoriteBuildPathId: this.favoriteBuildPathId(),
      selectedDifficulty: this.state.selectedDifficulty,
      difficultyRewardMultiplier: this.state.difficultyRewardMultiplier
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

  private showEvolutionLearned(title: string): void {
    const ring = this.add.circle(this.player.x, this.player.y, 54, 0xffd36a, 0.22).setDepth(36);
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 2.7,
      duration: 420,
      ease: "Sine.easeOut",
      onComplete: () => ring.destroy()
    });
    this.cameras.main.flash(180, 255, 220, 120, false);
    this.showScorePop(this.player.x, this.player.y - 118, title, "#ffe09a");
  }

  private applyMetaBonuses(difficulty: DifficultyConfig): void {
    const record = AchievementSystem.readRecord();
    const bonuses = metaBonusesFromShop(record);
    this.player.stats.maxHp += bonuses.maxHp;
    this.player.stats.hp = this.player.stats.maxHp;
    this.player.stats.moveSpeed += bonuses.moveSpeed;
    this.player.stats.pickupRange += bonuses.pickupRange;
    this.showScorePop(this.player.x, this.player.y - 74, t("runStartBonus", {
      title: t(bonuses.titleKey),
      difficulty: difficulty.level
    }), "#ffe09a");
  }

  private favoriteBuildPathId(): GameOverData["favoriteBuildPathId"] {
    const paths = [...this.state.buildPathLevels.entries()].filter(([, level]) => level > 0);
    paths.sort((a, b) => b[1] - a[1]);
    return paths[0]?.[0];
  }
}
