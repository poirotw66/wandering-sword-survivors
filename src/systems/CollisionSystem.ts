import Phaser from "phaser";
import type { Enemy } from "../entities/Enemy";
import type { ExpGem } from "../entities/ExpGem";
import type { HealthPickup } from "../entities/HealthPickup";
import type { Player } from "../entities/Player";
import type { Projectile } from "../entities/Projectile";
import type { GameState } from "../game/GameState";
import type { EnemySystem } from "./EnemySystem";
import type { ExpSystem } from "./ExpSystem";
import type { PickupSystem } from "./PickupSystem";
import type { WeaponSystem } from "./WeaponSystem";
import { enemyName, t } from "../i18n";
import type { AchievementSystem } from "./AchievementSystem";
import { buildBossLegacySummary } from "../data/bossLegacy";

type ArcadeOverlapObject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile;

export class CollisionSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly state: GameState,
    enemySystem: EnemySystem,
    weaponSystem: WeaponSystem,
    private readonly expSystem: ExpSystem,
    private readonly pickupSystem: PickupSystem,
    private readonly achievementSystem: AchievementSystem
  ) {
    scene.physics.add.overlap(
      weaponSystem.projectiles,
      enemySystem.enemies,
      this.projectileHitsEnemy,
      undefined,
      this
    );
    scene.physics.add.overlap(player, enemySystem.enemies, this.enemyHitsPlayer, undefined, this);
    scene.physics.add.overlap(player, expSystem.gems, this.playerCollectsGem, undefined, this);
    scene.physics.add.overlap(player, pickupSystem.healthPickups, this.playerCollectsHealth, undefined, this);
  }

  private projectileHitsEnemy(projectileObject: ArcadeOverlapObject, enemyObject: ArcadeOverlapObject): void {
    const projectile = projectileObject as Projectile;
    const enemy = enemyObject as Enemy;
    if (!projectile.active || !enemy.active || projectile.hitIds.has(enemy)) {
      return;
    }

    projectile.hitIds.add(enemy);
    const killed = enemy.damage(projectile.damage);
    this.scene.events.emit("projectile-hit", enemy.x, enemy.y, projectile.weaponId);
    const flashColor = this.hitColor(projectile.weaponId);
    this.flashHit(enemy.x, enemy.y, flashColor);
    if (enemy.config.isBoss) {
      this.scene.events.emit("boss-health-changed", Math.max(0, enemy.hp), enemy.maxHp, enemyName(enemy.enemyId));
    }
    projectile.pierceLeft -= 1;
    if (projectile.pierceLeft <= 0 && projectile.weaponId !== "orbitBlade") {
      projectile.expire();
    }

    if (killed) {
      this.killEnemy(enemy);
    }
  }

  private enemyHitsPlayer(_playerObject: ArcadeOverlapObject, enemyObject: ArcadeOverlapObject): void {
    const enemy = enemyObject as Enemy;
    const tookDamage = this.player.takeDamage(Math.round(enemy.config.damage * enemy.damageMultiplier), this.scene.time.now);
    if (tookDamage) {
      this.scene.events.emit("player-damaged");
    }
  }

  private playerCollectsGem(_playerObject: ArcadeOverlapObject, gemObject: ArcadeOverlapObject): void {
    this.expSystem.collect(gemObject as ExpGem);
  }

  private playerCollectsHealth(_playerObject: ArcadeOverlapObject, pickupObject: ArcadeOverlapObject): void {
    this.pickupSystem.collect(pickupObject as HealthPickup);
  }

  private flashHit(x: number, y: number, color: number): void {
    const flash = this.scene.add.circle(x, y, 12, color, 0.52).setDepth(35);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.2,
      duration: 130,
      ease: "Sine.easeOut",
      onComplete: () => flash.destroy()
    });
  }

  private hitColor(weaponId: string): number {
    const colors: Record<string, number> = {
      magicBolt: 0xfff1a1,
      orbitBlade: 0xb8f7ff,
      flameWave: 0xb86bff,
      thunderStrike: 0xffa55f,
      starVortex: 0xb86bff,
      blossomBlade: 0xffb7d5,
      galeSword: 0xb8ffd8,
      taiyuePeak: 0xffd36a,
      coldPondSword: 0x8ff4ff,
      vajraFist: 0xffd36a
    };
    return colors[weaponId] ?? 0xfff1a1;
  }

  private killEnemy(enemy: Enemy): void {
    this.state.kills += 1;
    const score = Math.round(enemy.config.score * enemy.rewardMultiplier);
    const exp = Math.round(enemy.config.exp * enemy.rewardMultiplier);
    this.state.score += score;
    this.scene.events.emit("enemy-killed", enemy.x, enemy.y, score);
    this.expSystem.drop(enemy.x, enemy.y, exp);
    this.pickupSystem.maybeDropHealth(enemy.x, enemy.y, enemy.config.isBoss || enemy.enemyId === "golem" ? 0.16 : 0.055);
    const wonRun = Boolean(enemy.config.endsRunOnDefeat);
    if (enemy.config.isBoss) {
      this.scene.events.emit("boss-defeated");
      this.scene.events.emit("milestone-unlocked", t("bossDefeatedReward", { name: enemyName(enemy.enemyId), exp }));
      const unlockedBefore = new Set(this.state.unlockedSkills);
      for (const message of this.achievementSystem.recordBossDefeat(enemy.enemyId)) {
        this.scene.events.emit("milestone-unlocked", message);
      }
      const newlyUnlocked = [...this.state.unlockedSkills].filter((skillId) => !unlockedBefore.has(skillId));
      this.scene.events.emit("boss-legacy", buildBossLegacySummary(enemy.enemyId, newlyUnlocked, exp, score));
    }
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);
    enemy.hideStatusUi();

    if (wonRun) {
      this.scene.events.emit("game-won");
    }
  }
}
