import Phaser from "phaser";
import { WEAPON_CONFIGS, type WeaponId } from "../data/weapons";
import type { EvolutionId } from "../data/evolutions";
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
    private readonly weaponLevels: Map<WeaponId, number>,
    private readonly evolvedWeapons: Map<WeaponId, EvolutionId>
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
    } else if (weaponId === "blossomBlade") {
      this.fireBlossomBlade(level);
    } else if (weaponId === "galeSword") {
      this.fireGaleSword(level);
    } else if (weaponId === "taiyuePeak") {
      this.fireTaiyuePeak(level);
    } else if (weaponId === "coldPondSword") {
      this.fireColdPondSword(level);
    } else if (weaponId === "vajraFist") {
      this.fireVajraFist(level);
    }
  }

  private fireMagicBolt(level: number): void {
    const target = this.nearestEnemy();
    if (!target) {
      return;
    }
    const evolved = this.evolvedWeapons.get("magicBolt") === "voidDuguSword";
    const count = (evolved ? 2 : 1) + Math.floor(level / 4);
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    for (let i = 0; i < count; i += 1) {
      this.spawnProjectile("magicBolt", angle + (i - (count - 1) / 2) * 0.18, {
        damage: (evolved ? 30 : 18) + level * (evolved ? 7 : 5),
        speed: evolved ? 540 : 470,
        pierce: (evolved ? 4 : 1) + Math.floor(level / 4),
        durationMs: evolved ? 1550 : 1300,
        scale: evolved ? 0.24 : 0.14,
        tint: evolved ? 0xffe09a : 0x89d8ff
      });
    }
    this.emitFired("magicBolt", evolved ? "voidDuguSword" : undefined);
  }

  private fireFlameWave(level: number): void {
    const evolved = this.evolvedWeapons.get("flameWave") === "starDrainingPalm";
    const count = (evolved ? 7 : 5) + level;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      this.spawnProjectile("flameWave", angle, {
        damage: (evolved ? 24 : 16) + level * 5,
        speed: (evolved ? 170 : 190) + level * 16,
        pierce: (evolved ? 4 : 2) + Math.floor(level / 3),
        durationMs: evolved ? 1050 : 820,
        scale: evolved ? 0.22 : 0.16,
        tint: evolved ? 0xb86bff : 0xffffff,
        texture: "palm-wave"
      });
    }
    if (evolved) {
      const affected = this.pullNearbyEnemies(190 + level * 14, 95 + level * 10);
      const healAmount = Math.min(18, Math.max(3, Math.floor(affected / 2) + 3));
      this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + healAmount);
      this.scene.events.emit("player-healed", healAmount);
    }
    this.emitFired("flameWave", evolved ? "starDrainingPalm" : undefined);
  }

  private fireThunderStrike(level: number): void {
    const evolved = this.evolvedWeapons.get("thunderStrike") === "drunkenShadowNineSwords";
    const targets = this.closestEnemies((evolved ? 3 : 1) + Math.floor(level / 2));
    for (const target of targets) {
      const projectile = this.acquireProjectile();
      projectile.fire({
        weaponId: "thunderStrike",
        x: target.x,
        y: target.y,
        damage: this.rollDamage((evolved ? 58 : 45) + level * 18),
        pierce: evolved ? 2 : 1,
        velocityX: 0,
        velocityY: 0,
        durationMs: evolved ? 300 : 220,
        texture: "strike",
        scale: evolved ? 0.3 : 0.22,
        tint: evolved ? 0xffa55f : 0xfff27a
      });
      this.flashAt(target.x, target.y, evolved ? 0xffa55f : 0xfff27a, evolved ? 82 : 62);
    }
    this.emitFired("thunderStrike", evolved ? "drunkenShadowNineSwords" : undefined);
  }

  private fireStarVortex(level: number): void {
    const evolved = this.evolvedWeapons.get("starVortex") === "starReturningOriginField";
    const radius = (evolved ? 150 : 116) + level * 18;
    const projectile = this.acquireProjectile();
    projectile.fire({
      weaponId: "starVortex",
      x: this.player.x,
      y: this.player.y,
      damage: this.rollDamage((evolved ? 20 : 12) + level * 6),
      pierce: 99,
      velocityX: 0,
      velocityY: 0,
      durationMs: evolved ? 1250 : 760,
      texture: "star-vortex",
      scale: (radius * 2) / 192,
      tint: evolved ? 0xffe09a : 0xffffff
    });

    for (const enemy of this.closestEnemies(28)) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > radius + 80) {
        continue;
      }
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const pull = (evolved ? 170 : 120) + level * 28;
      enemy.setVelocity(Math.cos(angle) * pull, Math.sin(angle) * pull);
    }

    const healAmount = (evolved ? 8 : 2) + Math.floor(level / 2) + Math.floor(this.player.stats.areaMultiplier - 1);
    this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + healAmount);
    this.scene.events.emit("player-healed", healAmount);
    this.emitFired("starVortex", evolved ? "starReturningOriginField" : undefined);
  }

  private fireBlossomBlade(level: number): void {
    const evolved = this.evolvedWeapons.get("blossomBlade") === "violetMistBlossomSword";
    const target = this.nearestEnemy();
    const baseAngle = target ? Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y) : this.player.rotation;
    const count = (evolved ? 8 : 5) + Math.floor(level / 2);
    const spread = evolved ? 1.2 : 0.76;
    for (let i = 0; i < count; i += 1) {
      const offset = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread;
      this.spawnProjectile("blossomBlade", baseAngle + offset, {
        damage: (evolved ? 24 : 16) + level * 4,
        speed: evolved ? 420 : 340,
        pierce: (evolved ? 3 : 1) + Math.floor(level / 3),
        durationMs: evolved ? 1350 : 1050,
        scale: evolved ? 0.2 : 0.16,
        tint: evolved ? 0xd5a3ff : 0xffb7d5,
        texture: "blade"
      });
    }
    if (evolved) {
      this.scene.time.delayedCall(260, () => {
        for (let i = 0; i < count; i += 1) {
          const angle = baseAngle + Math.PI + (i / Math.max(1, count - 1) - 0.5) * 0.85;
          this.spawnProjectile("blossomBlade", angle, {
            damage: 14 + level * 3,
            speed: 360,
            pierce: 2,
            durationMs: 900,
            scale: 0.18,
            tint: 0xffe09a,
            texture: "blade"
          });
        }
      });
    }
    this.emitFired("blossomBlade", evolved ? "violetMistBlossomSword" : undefined);
  }

  private fireGaleSword(level: number): void {
    const evolved = this.evolvedWeapons.get("galeSword") === "shadowlessGaleSlash";
    const targets = this.closestEnemies(evolved ? 2 + Math.floor(level / 3) : 1);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null;
    const moving = !!playerBody && playerBody.velocity.lengthSq() > 900;
    const bonusSlash = evolved && moving;
    for (const target of targets) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
      this.spawnProjectile("galeSword", angle, {
        damage: (bonusSlash ? 30 : evolved ? 22 : 14) + level * 4,
        speed: evolved ? 680 : 560,
        pierce: evolved ? 2 : 1,
        durationMs: 820,
        scale: evolved ? 0.17 : 0.13,
        tint: bonusSlash ? 0xffe09a : 0xb8ffd8,
        texture: "blade"
      });
      if (bonusSlash) {
        this.spawnProjectile("galeSword", angle + 0.16, {
          damage: 18 + level * 3,
          speed: 720,
          pierce: 2,
          durationMs: 720,
          scale: 0.14,
          tint: 0xffe09a,
          texture: "strike"
        });
      }
    }
    this.emitFired("galeSword", evolved ? "shadowlessGaleSlash" : undefined);
  }

  private fireTaiyuePeak(level: number): void {
    const evolved = this.evolvedWeapons.get("taiyuePeak") === "taiyueMountainSealingForm";
    const targets = this.closestEnemies(evolved ? 5 : 3);
    for (const target of targets) {
      const projectile = this.acquireProjectile();
      projectile.fire({
        weaponId: "taiyuePeak",
        x: target.x,
        y: target.y,
        damage: this.rollDamage((evolved ? 70 : 44) + level * 12),
        pierce: 99,
        velocityX: 0,
        velocityY: 0,
        durationMs: evolved ? 360 : 260,
        texture: "strike",
        scale: evolved ? 0.42 : 0.3,
        tint: evolved ? 0xffd36a : 0xf7c66b
      });
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
      target.setVelocity(Math.cos(angle) * (evolved ? 240 : 150), Math.sin(angle) * (evolved ? 240 : 150));
      this.flashAt(target.x, target.y, evolved ? 0xffd36a : 0xf7c66b, evolved ? 104 : 74);
    }
    this.emitFired("taiyuePeak", evolved ? "taiyueMountainSealingForm" : undefined);
  }

  private fireColdPondSword(level: number): void {
    const evolved = this.evolvedWeapons.get("coldPondSword") === "coldPondMirrorSword";
    const targets = this.closestEnemies(evolved ? 4 : 2);
    for (const target of targets) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
      this.spawnProjectile("coldPondSword", angle, {
        damage: (evolved ? 28 : 18) + level * 5,
        speed: evolved ? 450 : 370,
        pierce: evolved ? 4 : 2,
        durationMs: evolved ? 1250 : 980,
        scale: evolved ? 0.18 : 0.14,
        tint: evolved ? 0xb8f7ff : 0x8ff4ff,
        texture: "bolt"
      });
      const body = target.body as Phaser.Physics.Arcade.Body;
      target.setVelocity(body.velocity.x * 0.62, body.velocity.y * 0.62);
      if (evolved) {
        this.flashAt(target.x, target.y, 0x8ff4ff, 54);
      }
    }
    this.emitFired("coldPondSword", evolved ? "coldPondMirrorSword" : undefined);
  }

  private fireVajraFist(level: number): void {
    const target = this.nearestEnemy();
    if (!target) {
      return;
    }
    const evolved = this.evolvedWeapons.get("vajraFist") === "vajraHundredStepQuake";
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const count = evolved ? 3 : 1;
    for (let i = 0; i < count; i += 1) {
      this.spawnProjectile("vajraFist", angle + (i - (count - 1) / 2) * 0.16, {
        damage: (evolved ? 62 : 38) + level * 8,
        speed: evolved ? 520 : 440,
        pierce: evolved ? 9 : 5,
        durationMs: evolved ? 1450 : 1150,
        scale: evolved ? 0.28 : 0.2,
        tint: evolved ? 0xffd36a : 0xf7efd8,
        texture: "palm-wave"
      });
    }
    if (evolved) {
      const healAmount = 3 + Math.floor(level / 2);
      this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + healAmount);
      this.scene.events.emit("player-healed", healAmount);
    }
    this.emitFired("vajraFist", evolved ? "vajraHundredStepQuake" : undefined);
  }

  private updateOrbitBlades(): void {
    const level = this.weaponLevels.get("orbitBlade") ?? 0;
    if (level <= 0) {
      return;
    }

    const evolved = this.evolvedWeapons.get("orbitBlade") === "windClearSwordArray";
    const count = (evolved ? 3 : 1) + Math.floor(level / 2);
    const radius = (evolved ? 104 : 78) + level * 9 + (evolved ? this.player.stats.moveSpeed * 0.04 : 0);
    for (let i = 0; i < count; i += 1) {
      const key = `orbit-${i}`;
      let blade = this.projectiles.getChildren().find(
        (child) => child.name === key && child.active
      ) as Projectile | undefined;
      if (!blade) {
        blade = this.acquireProjectile();
        blade.name = key;
      }

      const angle = this.scene.time.now * (evolved ? 0.006 : 0.004) + (Math.PI * 2 * i) / count;
      blade.fire({
        weaponId: "orbitBlade",
        x: this.player.x + Math.cos(angle) * radius,
        y: this.player.y + Math.sin(angle) * radius,
        damage: this.rollDamage((evolved ? 14 : 9) + level * 4),
        pierce: 99,
        velocityX: 0,
        velocityY: 0,
        durationMs: 200,
        texture: "blade",
        scale: (evolved ? 0.24 : 0.18) + level * 0.01,
        tint: evolved ? 0xffe09a : 0xe7e1ff
      });
    }
    if (this.scene.time.now >= this.nextOrbitSoundAt) {
      this.nextOrbitSoundAt = this.scene.time.now + 520;
      this.emitFired("orbitBlade", evolved ? "windClearSwordArray" : undefined);
    }
  }

  private emitFired(weaponId: WeaponId, evolutionId?: EvolutionId): void {
    this.scene.events.emit("weapon-fired", weaponId);
    if (evolutionId) {
      this.scene.events.emit("evolution-fired", evolutionId);
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

  private pullNearbyEnemies(radius: number, pull: number): number {
    let affected = 0;
    for (const enemy of this.closestEnemies(32)) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > radius) {
        continue;
      }
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      enemy.setVelocity(Math.cos(angle) * pull, Math.sin(angle) * pull);
      affected += 1;
    }
    return affected;
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
    const maxRadiusSq = 520 * 520;
    const playerX = this.player.x;
    const playerY = this.player.y;
    const candidates: Enemy[] = [];

    for (const child of this.enemySystem.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }
      const dx = enemy.x - playerX;
      const dy = enemy.y - playerY;
      if (dx * dx + dy * dy > maxRadiusSq) {
        continue;
      }
      candidates.push(enemy);
    }

    candidates.sort((left, right) => {
      const leftDistance = Phaser.Math.Distance.Squared(playerX, playerY, left.x, left.y);
      const rightDistance = Phaser.Math.Distance.Squared(playerX, playerY, right.x, right.y);
      return leftDistance - rightDistance;
    });

    return candidates.slice(0, limit);
  }
}
