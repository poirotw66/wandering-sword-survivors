import Phaser from "phaser";
import { WEAPON_CONFIGS, type WeaponId } from "../data/weapons";
import type { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import { angleToVector } from "../utils/math";
import type { EnemySystem } from "./EnemySystem";

export class WeaponSystem {
  readonly projectiles: Phaser.Physics.Arcade.Group;
  private readonly cooldowns = new Map<WeaponId, number>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemySystem: EnemySystem,
    private readonly weaponLevels: Map<WeaponId, number>
  ) {
    this.projectiles = scene.physics.add.group({ classType: Projectile, runChildUpdate: false });
    weaponLevels.set("magicBolt", 1);
  }

  update(): void {
    this.updateOrbitBlades();
    for (const [weaponId, level] of this.weaponLevels.entries()) {
      if (level <= 0 || weaponId === "orbitBlade") {
        continue;
      }

      const config = WEAPON_CONFIGS[weaponId];
      const nextReady = this.cooldowns.get(weaponId) ?? 0;
      if (this.scene.time.now < nextReady) {
        continue;
      }

      this.cooldowns.set(
        weaponId,
        this.scene.time.now + config.cooldownMs * this.player.stats.cooldownMultiplier * Math.max(0.55, 1 - level * 0.04)
      );
      this.fireWeapon(weaponId, level);
    }

    this.projectiles.children.each((child) => {
      const projectile = child as Projectile;
      if (projectile.active && projectile.expiresAt < this.scene.time.now) {
        projectile.expire();
      }
      return true;
    });
  }

  private fireWeapon(weaponId: WeaponId, level: number): void {
    if (weaponId === "magicBolt") {
      this.fireMagicBolt(level);
    } else if (weaponId === "flameWave") {
      this.fireFlameWave(level);
    } else if (weaponId === "thunderStrike") {
      this.fireThunderStrike(level);
    }
  }

  private fireMagicBolt(level: number): void {
    const target = this.nearestEnemy();
    if (!target) {
      return;
    }
    const count = 1 + Math.floor(level / 4);
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    for (let i = 0; i < count; i += 1) {
      this.spawnProjectile("magicBolt", angle + (i - (count - 1) / 2) * 0.18, {
        damage: 18 + level * 5,
        speed: 470,
        pierce: 1 + Math.floor(level / 5),
        durationMs: 1300,
        scale: 0.85,
        tint: 0x89d8ff
      });
    }
  }

  private fireFlameWave(level: number): void {
    const count = 5 + level;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      this.spawnProjectile("flameWave", angle, {
        damage: 16 + level * 5,
        speed: 190 + level * 16,
        pierce: 2 + Math.floor(level / 3),
        durationMs: 820,
        scale: 1.25,
        tint: 0xff8750
      });
    }
  }

  private fireThunderStrike(level: number): void {
    const targets = this.closestEnemies(1 + Math.floor(level / 2));
    for (const target of targets) {
      const projectile = this.acquireProjectile();
      projectile.fire({
        weaponId: "thunderStrike",
        x: target.x,
        y: target.y,
        damage: (45 + level * 18) * this.player.stats.damageMultiplier,
        pierce: 1,
        velocityX: 0,
        velocityY: 0,
        durationMs: 220,
        texture: "strike",
        scale: 1.6,
        tint: 0xfff27a
      });
    }
  }

  private updateOrbitBlades(): void {
    const level = this.weaponLevels.get("orbitBlade") ?? 0;
    if (level <= 0) {
      return;
    }

    const count = 1 + Math.floor(level / 2);
    const radius = 78 + level * 9;
    for (let i = 0; i < count; i += 1) {
      const key = `orbit-${i}`;
      let blade = this.projectiles.getChildren().find(
        (child) => child.name === key && child.active
      ) as Projectile | undefined;
      if (!blade) {
        blade = this.acquireProjectile();
        blade.name = key;
      }

      const angle = this.scene.time.now * 0.004 + (Math.PI * 2 * i) / count;
      blade.fire({
        weaponId: "orbitBlade",
        x: this.player.x + Math.cos(angle) * radius,
        y: this.player.y + Math.sin(angle) * radius,
        damage: 9 + level * 4,
        pierce: 99,
        velocityX: 0,
        velocityY: 0,
        durationMs: 200,
        texture: "blade",
        scale: 0.95 + level * 0.04,
        tint: 0xe7e1ff
      });
    }
  }

  private spawnProjectile(
    weaponId: WeaponId,
    angle: number,
    options: { damage: number; speed: number; pierce: number; durationMs: number; scale: number; tint: number }
  ): void {
    const direction = angleToVector(angle);
    const projectile = this.acquireProjectile();
    projectile.fire({
      weaponId,
      x: this.player.x + direction.x * 24,
      y: this.player.y + direction.y * 24,
      damage: options.damage * this.player.stats.damageMultiplier,
      pierce: options.pierce,
      velocityX: direction.x * options.speed * this.player.stats.projectileSpeedMultiplier,
      velocityY: direction.y * options.speed * this.player.stats.projectileSpeedMultiplier,
      durationMs: options.durationMs,
      scale: options.scale * this.player.stats.areaMultiplier,
      tint: options.tint
    });
  }

  private acquireProjectile(): Projectile {
    const projectile = this.projectiles.get(this.player.x, this.player.y) as Projectile | null;
    return projectile ?? new Projectile(this.scene, this.player.x, this.player.y);
  }

  private nearestEnemy(): Enemy | undefined {
    return this.closestEnemies(1)[0];
  }

  private closestEnemies(limit: number): Enemy[] {
    return this.enemySystem.enemies
      .getChildren()
      .filter((child): child is Enemy => child.active)
      .sort((a, b) => {
        const da = Phaser.Math.Distance.Squared(this.player.x, this.player.y, a.x, a.y);
        const db = Phaser.Math.Distance.Squared(this.player.x, this.player.y, b.x, b.y);
        return da - db;
      })
      .slice(0, limit);
  }
}
