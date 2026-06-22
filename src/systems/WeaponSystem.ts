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
  private nextOrbitSoundAt = 0;

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
    } else if (weaponId === "starVortex") {
      this.fireStarVortex(level);
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
        scale: 0.14,
        tint: 0x89d8ff
      });
    }
    this.scene.events.emit("weapon-fired", "magicBolt");
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
        scale: 0.16,
        tint: 0xffffff,
        texture: "palm-wave"
      });
    }
    this.scene.events.emit("weapon-fired", "flameWave");
  }

  private fireThunderStrike(level: number): void {
    const targets = this.closestEnemies(1 + Math.floor(level / 2));
    for (const target of targets) {
      const projectile = this.acquireProjectile();
      projectile.fire({
        weaponId: "thunderStrike",
        x: target.x,
        y: target.y,
        damage: this.rollDamage(45 + level * 18),
        pierce: 1,
        velocityX: 0,
        velocityY: 0,
        durationMs: 220,
        texture: "strike",
        scale: 0.22,
        tint: 0xfff27a
      });
      this.flashAt(target.x, target.y, 0xfff27a, 62);
    }
    this.scene.events.emit("weapon-fired", "thunderStrike");
  }

  private fireStarVortex(level: number): void {
    const radius = 116 + level * 18;
    const projectile = this.acquireProjectile();
    projectile.fire({
      weaponId: "starVortex",
      x: this.player.x,
      y: this.player.y,
      damage: this.rollDamage(12 + level * 6),
      pierce: 99,
      velocityX: 0,
      velocityY: 0,
      durationMs: 760,
      texture: "star-vortex",
      scale: (radius * 2) / 192,
      tint: 0xffffff
    });

    for (const enemy of this.closestEnemies(28)) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > radius + 80) {
        continue;
      }
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const pull = 120 + level * 28;
      enemy.setVelocity(Math.cos(angle) * pull, Math.sin(angle) * pull);
    }

    const healAmount = 2 + Math.floor(level / 2) + Math.floor(this.player.stats.areaMultiplier - 1);
    this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + healAmount);
    this.scene.events.emit("player-healed", healAmount);
    this.scene.events.emit("weapon-fired", "starVortex");
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
        damage: this.rollDamage(9 + level * 4),
        pierce: 99,
        velocityX: 0,
        velocityY: 0,
        durationMs: 200,
        texture: "blade",
        scale: 0.18 + level * 0.01,
        tint: 0xe7e1ff
      });
    }
    if (this.scene.time.now >= this.nextOrbitSoundAt) {
      this.nextOrbitSoundAt = this.scene.time.now + 520;
      this.scene.events.emit("weapon-fired", "orbitBlade");
    }
  }

  private spawnProjectile(
    weaponId: WeaponId,
    angle: number,
    options: { damage: number; speed: number; pierce: number; durationMs: number; scale: number; tint: number; texture?: string }
  ): void {
    const direction = angleToVector(angle);
    const projectile = this.acquireProjectile();
    projectile.fire({
      weaponId,
      x: this.player.x + direction.x * 24,
      y: this.player.y + direction.y * 24,
      damage: this.rollDamage(options.damage),
      pierce: options.pierce,
      velocityX: direction.x * options.speed * this.player.stats.projectileSpeedMultiplier,
      velocityY: direction.y * options.speed * this.player.stats.projectileSpeedMultiplier,
      durationMs: options.durationMs,
      texture: options.texture,
      scale: options.scale * this.player.stats.areaMultiplier,
      tint: options.tint
    });
  }

  private flashAt(x: number, y: number, color: number, radius: number): void {
    const flash = this.scene.add.circle(x, y, radius, color, 0.28).setDepth(13);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.4,
      duration: 160,
      ease: "Sine.easeOut",
      onComplete: () => flash.destroy()
    });
  }

  private acquireProjectile(): Projectile {
    const projectile = this.projectiles.get(this.player.x, this.player.y) as Projectile | null;
    return projectile ?? new Projectile(this.scene, this.player.x, this.player.y);
  }

  private rollDamage(baseDamage: number): number {
    let damage = baseDamage * this.player.stats.damageMultiplier * this.player.stats.burstMultiplier;
    if (Math.random() < this.player.stats.critChance) {
      damage *= this.player.stats.critMultiplier;
      this.scene.events.emit("critical-hit");
    }
    if (Math.random() < this.player.stats.comboChance) {
      damage *= 1.35;
      this.scene.events.emit("combo-hit");
    }
    return damage;
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
