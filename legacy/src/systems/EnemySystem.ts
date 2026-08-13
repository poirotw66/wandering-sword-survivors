import Phaser from "phaser";
import { type EnemyId } from "../data/enemies";
import { archetypeConfigFor, minionBehaviorFor, type MinionArchetypeConfig } from "../data/minionBehaviors";
import { bossSkillConfig, bossSkillCooldown, bossSkillProfileFor, finalPhaseFor, type BossSkillConfig } from "../data/bossSkills";
import {
  playBossDashLunge,
  playBossDashTelegraph,
  playBossFanImpact,
  playBossFanLingerZone,
  playBossFanTelegraph,
  playBossFinalPhaseBurst,
  playBossNeedleLaunchBurst,
  playBossNeedleTelegraph,
  playBossOrbitCharge,
  playBossSummonBurst,
  playBossSummonTelegraph
} from "../data/bossVfx";
import { bossIdentityFor, type GuardFormationConfig, type OrbitingNeedlesConfig } from "../data/bossIdentity";
import type { DifficultyConfig } from "../data/metaProgression";
import type { RunModifierId } from "../data/runModifiers";
import { runModifierEnemySpeedMultiplier } from "../data/runModifiers";
import { timeCombatScale } from "../data/timeCombatScale";
import { Enemy } from "../entities/Enemy";
import { BOSS_NEEDLE_PROJECTILE_SCALE } from "../data/enemyProjectileVisual";
import { EnemyProjectile } from "../entities/EnemyProjectile";
import type { Player } from "../entities/Player";
import { t } from "../i18n";

export class EnemySystem {
  readonly enemies: Phaser.Physics.Arcade.Group;
  readonly enemyProjectiles: Phaser.Physics.Arcade.Group;
  private readonly nextDashAt = new WeakMap<Enemy, number>();
  private readonly dashUntil = new WeakMap<Enemy, number>();
  private readonly nextFanAt = new WeakMap<Enemy, number>();
  private readonly nextSummonAt = new WeakMap<Enemy, number>();
  private readonly nextNeedleAt = new WeakMap<Enemy, number>();
  private readonly finalPhaseActive = new WeakSet<Enemy>();
  private readonly minionNextActionAt = new WeakMap<Enemy, number>();
  private readonly minionLockedUntil = new WeakMap<Enemy, number>();
  private readonly minionWindupPending = new WeakSet<Enemy>();
  private readonly bossGuards = new WeakMap<Enemy, Enemy[]>();
  private readonly nextOrbitAt = new WeakMap<Enemy, number>();
  private elapsedSec = 0;
  private runModifierId: RunModifierId | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly difficulty: DifficultyConfig
  ) {
    this.enemies = scene.physics.add.group({ classType: Enemy, runChildUpdate: false });
    this.enemyProjectiles = scene.physics.add.group({ classType: EnemyProjectile, runChildUpdate: false });
  }

  setElapsedSec(elapsedSec: number): void {
    this.elapsedSec = elapsedSec;
  }

  setRunModifier(modifierId: RunModifierId | null): void {
    this.runModifierId = modifierId;
  }

  spawn(enemyId: EnemyId, x: number, y: number, elite = false): Enemy {
    const enemy = this.enemies.get(x, y, enemyId) as Enemy | null;
    const spawned = enemy ?? new Enemy(this.scene, x, y, enemyId);
    spawned.spawnAs(enemyId, x, y, elite, this.difficultyScale());
    this.resetMinionState(spawned);
    return spawned;
  }

  update(): void {
    const now = this.scene.time.now;
    this.enemies.children.each((child) => {
      const enemy = child as Enemy;
      if (!enemy.active) {
        return true;
      }

      if (enemy.config.isBoss) {
        enemy.tickBossPresentation();
        this.updateBossSkills(enemy);
        if ((this.dashUntil.get(enemy) ?? 0) < now) {
          this.chasePlayer(enemy, 1);
        }
      } else {
        this.updateOrdinaryBehavior(enemy);
      }
      enemy.updateStatusUi();
      return true;
    });
    this.updateEnemyProjectiles(now);
  }

  activeCount(): number {
    return this.enemies.countActive(true);
  }

  activeMinionCount(): number {
    let count = 0;
    this.enemies.children.each((child) => {
      const enemy = child as Enemy;
      if (enemy.active && !enemy.config.isBoss) {
        count += 1;
      }
      return true;
    });
    return count;
  }

  bossDamageTakenMultiplier(boss: Enemy): number {
    if (!boss.config.isBoss) {
      return 1;
    }
    const formation = bossIdentityFor(boss.enemyId)?.guardFormation;
    if (!formation) {
      return 1;
    }
    const guards = (this.bossGuards.get(boss) ?? []).filter((guard) => guard.active);
    if (guards.length === 0) {
      return 1;
    }
    return Math.max(0.2, 1 - formation.damageReduction);
  }

  private updateOrdinaryBehavior(enemy: Enemy): void {
    const now = this.scene.time.now;
    const archetype = minionBehaviorFor(enemy.enemyId);
    const config = archetypeConfigFor(archetype, enemy.isElite);

    if ((this.dashUntil.get(enemy) ?? 0) >= now) {
      return;
    }

    if ((this.minionLockedUntil.get(enemy) ?? 0) >= now) {
      enemy.setVelocity(0, 0);
      return;
    }

    switch (archetype) {
      case "chaser":
        this.chasePlayer(enemy, config.speedMultiplier);
        break;
      case "dasher":
        this.updateDasher(enemy, config, now);
        break;
      case "tank":
        this.updateTank(enemy, config, now);
        break;
      case "ranger":
        this.updateRanger(enemy, config, now);
        break;
    }
  }

  private updateDasher(enemy: Enemy, config: MinionArchetypeConfig, now: number): void {
    const nextActionAt = this.minionNextActionAt.get(enemy) ?? 0;
    if (now >= nextActionAt && !this.minionWindupPending.has(enemy)) {
      this.startDasherLunge(enemy, config, now);
      return;
    }
    this.chasePlayer(enemy, config.speedMultiplier);
  }

  private updateTank(enemy: Enemy, config: MinionArchetypeConfig, now: number): void {
    const nextActionAt = this.minionNextActionAt.get(enemy) ?? 0;
    if (now >= nextActionAt && !this.minionWindupPending.has(enemy)) {
      this.startTankPlant(enemy, config, now);
      return;
    }
    this.chasePlayer(enemy, config.speedMultiplier);
  }

  private updateRanger(enemy: Enemy, config: MinionArchetypeConfig, now: number): void {
    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const nextActionAt = this.minionNextActionAt.get(enemy) ?? 0;
    const speed = enemy.config.moveSpeed * enemy.moveSpeedMultiplier * config.speedMultiplier;

    if (distance < config.range * 0.72) {
      this.moveAwayFromPlayer(enemy, speed);
    } else if (distance > config.range * 1.08) {
      this.chasePlayer(enemy, config.speedMultiplier);
    } else {
      enemy.setVelocity(0, 0);
      if (now >= nextActionAt && !this.minionWindupPending.has(enemy)) {
        this.startRangerShot(enemy, config, now);
      }
    }
  }

  private startDasherLunge(enemy: Enemy, config: MinionArchetypeConfig, now: number): void {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    this.minionWindupPending.add(enemy);
    this.minionLockedUntil.set(enemy, now + config.windupMs);
    this.minionNextActionAt.set(enemy, now + config.cooldownMs);
    this.showLineTelegraph(enemy.x, enemy.y, angle, config.range * 0.42, 10, enemy.config.tint, config.windupMs);

    this.scene.time.delayedCall(config.windupMs, () => {
      this.minionWindupPending.delete(enemy);
      if (!enemy.active) {
        return;
      }
      const dashSpeed = enemy.config.moveSpeed * enemy.moveSpeedMultiplier * config.dashSpeedMultiplier;
      enemy.setVelocity(Math.cos(angle) * dashSpeed, Math.sin(angle) * dashSpeed);
      this.dashUntil.set(enemy, this.scene.time.now + config.actionMs);
    });
  }

  private startTankPlant(enemy: Enemy, config: MinionArchetypeConfig, now: number): void {
    this.minionWindupPending.add(enemy);
    this.minionLockedUntil.set(enemy, now + config.windupMs + config.actionMs);
    this.minionNextActionAt.set(enemy, now + config.cooldownMs);
    enemy.setVelocity(0, 0);
    this.showRingTelegraph(enemy.x, enemy.y, enemy.config.radius + 18, enemy.config.tint, config.windupMs + config.actionMs);

    this.scene.time.delayedCall(config.windupMs + config.actionMs, () => {
      this.minionWindupPending.delete(enemy);
    });
  }

  private startRangerShot(enemy: Enemy, config: MinionArchetypeConfig, now: number): void {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    this.minionWindupPending.add(enemy);
    this.minionLockedUntil.set(enemy, now + config.windupMs);
    this.minionNextActionAt.set(enemy, now + config.cooldownMs);
    this.showRingTelegraph(enemy.x, enemy.y, 16, enemy.config.tint, config.windupMs);

    this.scene.time.delayedCall(config.windupMs, () => {
      this.minionWindupPending.delete(enemy);
      if (!enemy.active) {
        return;
      }
      this.fireEnemyProjectile(enemy, angle, config);
    });
  }

  private fireEnemyProjectile(enemy: Enemy, angle: number, config: MinionArchetypeConfig): void {
    const pooled = this.enemyProjectiles.get(enemy.x, enemy.y, "bolt") as EnemyProjectile | null;
    const projectile = pooled ?? new EnemyProjectile(this.scene, enemy.x, enemy.y);
    projectile.fire({
      x: enemy.x,
      y: enemy.y,
      damage: Math.round(enemy.config.damage * enemy.damageMultiplier * config.projectileDamageMultiplier),
      velocityX: Math.cos(angle) * config.projectileSpeed,
      velocityY: Math.sin(angle) * config.projectileSpeed,
      tint: enemy.config.tint,
      durationMs: config.actionMs
    });
    if (!pooled) {
      this.enemyProjectiles.add(projectile);
    }
  }

  private chasePlayer(enemy: Enemy, speedMultiplier: number): void {
    const speed = enemy.config.moveSpeed * enemy.moveSpeedMultiplier * speedMultiplier;
    this.scene.physics.moveToObject(enemy, this.player, speed);
  }

  private moveAwayFromPlayer(enemy: Enemy, speed: number): void {
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private showLineTelegraph(
    x: number,
    y: number,
    angle: number,
    length: number,
    width: number,
    color: number,
    durationMs: number
  ): void {
    const warning = this.scene.add
      .rectangle(x, y, length, width, color, 0.28)
      .setRotation(angle)
      .setDepth(9);
    this.scene.tweens.add({
      targets: warning,
      alpha: { from: 0.32, to: 0.06 },
      duration: durationMs,
      onComplete: () => warning.destroy()
    });
  }

  private showRingTelegraph(x: number, y: number, radius: number, color: number, durationMs: number): void {
    const ring = this.scene.add.circle(x, y, radius, color, 0.2).setDepth(9);
    this.scene.tweens.add({
      targets: ring,
      alpha: { from: 0.28, to: 0.04 },
      scale: { from: 0.85, to: 1.15 },
      duration: durationMs,
      onComplete: () => ring.destroy()
    });
  }

  private updateEnemyProjectiles(now: number): void {
    this.enemyProjectiles.children.each((child) => {
      const projectile = child as EnemyProjectile;
      if (!projectile.active) {
        return true;
      }
      if (projectile.isBossNeedle && Phaser.Math.Between(0, 100) < 34) {
        const trail = this.scene.add
          .image(projectile.x, projectile.y, "boss-needle")
          .setTint(projectile.tintTopLeft)
          .setRotation(projectile.rotation)
          .setScale(projectile.scaleX * 0.85, projectile.scaleY * 0.85)
          .setAlpha(0.35)
          .setDepth(14)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({
          targets: trail,
          alpha: 0,
          scaleX: trail.scaleX * 0.4,
          scaleY: trail.scaleY * 0.4,
          duration: 120,
          onComplete: () => trail.destroy()
        });
      }
      if (now >= projectile.expiresAt) {
        projectile.expire();
      }
      return true;
    });
  }

  private resetMinionState(enemy: Enemy): void {
    if (enemy.config.isBoss) {
      return;
    }
    this.minionWindupPending.delete(enemy);
    this.minionLockedUntil.delete(enemy);
    this.dashUntil.delete(enemy);
    this.minionNextActionAt.set(enemy, this.scene.time.now + Phaser.Math.Between(500, 1400));
  }

  private updateBossSkills(enemy: Enemy): void {
    if (!enemy.config.isBoss) {
      return;
    }

    const profile = bossSkillProfileFor(enemy.enemyId);
    if (!profile) {
      return;
    }

    const now = this.scene.time.now;
    this.updateFinalPhase(enemy, profile.enemyId);
    const inFinalPhase = this.finalPhaseActive.has(enemy);

    if (profile.skillIds.includes("dash") && now >= (this.nextDashAt.get(enemy) ?? 0)) {
      this.nextDashAt.set(enemy, now + bossSkillCooldown("dash", inFinalPhase, enemy.enemyId));
      this.performDash(enemy, bossSkillConfig("dash"));
    }
    if (profile.skillIds.includes("fanStrike") && now >= (this.nextFanAt.get(enemy) ?? 0)) {
      this.nextFanAt.set(enemy, now + bossSkillCooldown("fanStrike", inFinalPhase, enemy.enemyId));
      this.performFanStrike(enemy, bossSkillConfig("fanStrike"));
    }
    if (profile.skillIds.includes("summon") && now >= (this.nextSummonAt.get(enemy) ?? 0)) {
      this.nextSummonAt.set(enemy, now + bossSkillCooldown("summon", inFinalPhase, enemy.enemyId));
      this.performSummon(enemy, bossSkillConfig("summon"));
    }
    if (profile.skillIds.includes("needleStorm") && now >= (this.nextNeedleAt.get(enemy) ?? 0)) {
      this.nextNeedleAt.set(enemy, now + bossSkillCooldown("needleStorm", inFinalPhase, enemy.enemyId));
      this.performNeedleStorm(enemy, bossSkillConfig("needleStorm"), inFinalPhase);
    }

    const identity = bossIdentityFor(enemy.enemyId);
    if (identity?.orbitingNeedles && inFinalPhase && now >= (this.nextOrbitAt.get(enemy) ?? 0)) {
      this.nextOrbitAt.set(enemy, now + identity.orbitingNeedles.cooldownMs);
      this.performOrbitingNeedles(enemy, identity.orbitingNeedles);
    }
  }

  private performDash(enemy: Enemy, config: BossSkillConfig): void {
    const identity = bossIdentityFor(enemy.enemyId);
    const pursuitLockMs = identity?.pursuitLockMs;
    const windupMs = pursuitLockMs ?? config.windupMs;
    const lockX = pursuitLockMs ? this.player.x : enemy.x;
    const lockY = pursuitLockMs ? this.player.y : enemy.y;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, lockX, lockY);
    playBossDashTelegraph(
      this.scene,
      enemy.x,
      enemy.y,
      angle,
      config,
      windupMs,
      pursuitLockMs ? lockX : undefined,
      pursuitLockMs ? lockY : undefined
    );
    this.emitTechniqueStarted(enemy, config, pursuitLockMs ? "bossTechniquePursuitLock" : config.labelKey);
    this.showCastLabel(enemy, t(pursuitLockMs ? "bossTechniquePursuitLock" : config.labelKey), config.color);
    this.scene.time.delayedCall(windupMs, () => {
      if (!enemy.active) {
        return;
      }
      const dashAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, lockX, lockY);
      this.dashUntil.set(enemy, this.scene.time.now + 520);
      enemy.setVelocity(Math.cos(dashAngle) * 360, Math.sin(dashAngle) * 360);
      playBossDashLunge(this.scene, enemy.x, enemy.y, dashAngle, config.color);
      this.emitTechniqueEnded(enemy);
    });
  }

  private performFanStrike(enemy: Enemy, config: BossSkillConfig): void {
    const originAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const lingerMs = bossIdentityFor(enemy.enemyId)?.fanLingerMs;
    const wedge = playBossFanTelegraph(this.scene, enemy.x, enemy.y, originAngle, config, config.windupMs);
    const lingerZones: { x: number; y: number; radius: number }[] = [];
    for (let i = -2; i <= 2; i += 1) {
      const angle = originAngle + i * (config.arcRadians / 5);
      const arcX = enemy.x + Math.cos(angle) * config.range * 0.55;
      const arcY = enemy.y + Math.sin(angle) * config.range * 0.55;
      lingerZones.push({ x: arcX, y: arcY, radius: config.width / 3 });
    }
    this.emitTechniqueStarted(enemy, config, lingerMs ? "bossTechniqueFanLinger" : config.labelKey);
    this.showCastLabel(enemy, t(lingerMs ? "bossTechniqueFanLinger" : config.labelKey), config.color);
    this.scene.time.delayedCall(config.windupMs, () => {
      wedge.destroy();
      if (!enemy.active) {
        return;
      }
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const delta = Phaser.Math.Angle.Wrap(angleToPlayer - originAngle);
      if (distance <= config.range && Math.abs(delta) <= config.arcRadians / 2) {
        const tookDamage = this.player.takeDamage(Math.round(enemy.config.damage * config.damageMultiplier), this.scene.time.now);
        if (tookDamage) {
          this.scene.cameras.main.shake(130, 0.005);
          this.scene.events.emit("player-damaged");
        }
      }
      playBossFanImpact(this.scene, enemy.x, enemy.y, originAngle, config);
      if (lingerMs) {
        this.spawnFanLingerZones(enemy, lingerZones, config, lingerMs);
      }
      this.emitTechniqueEnded(enemy);
    });
  }

  private spawnFanLingerZones(
    enemy: Enemy,
    zones: { x: number; y: number; radius: number }[],
    config: BossSkillConfig,
    lingerMs: number
  ): void {
    const visuals = zones.map((zone) => playBossFanLingerZone(this.scene, zone.x, zone.y, zone.radius, config.color, lingerMs));
    const tickCount = Math.max(1, Math.floor(lingerMs / 400));
    let ticks = 0;
    const tickEvent = this.scene.time.addEvent({
      delay: 400,
      repeat: tickCount - 1,
      callback: () => {
        ticks += 1;
        for (const zone of zones) {
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y) <= zone.radius) {
            const tookDamage = this.player.takeDamage(Math.round(enemy.config.damage * config.damageMultiplier * 0.55), this.scene.time.now);
            if (tookDamage) {
              this.scene.events.emit("player-damaged");
            }
          }
        }
        if (ticks >= tickCount) {
          visuals.forEach((visual) => visual.destroy());
        }
      }
    });
    this.scene.time.delayedCall(lingerMs + 50, () => tickEvent.destroy());
  }

  private performNeedleStorm(enemy: Enemy, config: BossSkillConfig, inFinalPhase: boolean): void {
    const sectorRadians = bossIdentityFor(enemy.enemyId)?.needleSectorRadians;
    const centerAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const needleCount = Math.round(config.width) + (inFinalPhase ? 6 : 0);
    this.emitTechniqueStarted(enemy, config, sectorRadians ? "bossTechniqueSectorNeedle" : config.labelKey);
    this.showCastLabel(enemy, t(sectorRadians ? "bossTechniqueSectorNeedle" : config.labelKey), config.color);
    playBossNeedleTelegraph(this.scene, enemy.x, enemy.y, centerAngle, config, config.windupMs, sectorRadians, needleCount);
    this.scene.time.delayedCall(config.windupMs, () => {
      if (!enemy.active) {
        this.emitTechniqueEnded(enemy);
        return;
      }
      const damage = Math.round(enemy.config.damage * enemy.damageMultiplier * config.damageMultiplier);
      const speed = config.range + (inFinalPhase ? 60 : 0);
      playBossNeedleLaunchBurst(this.scene, enemy.x, enemy.y);
      for (let i = 0; i < needleCount; i += 1) {
        const angle = sectorRadians
          ? centerAngle - sectorRadians / 2 + (sectorRadians * i) / Math.max(1, needleCount - 1) + Phaser.Math.FloatBetween(-0.03, 0.03)
          : (Math.PI * 2 * i) / needleCount + Phaser.Math.FloatBetween(-0.04, 0.04);
        this.fireBossNeedle(enemy, angle, damage, speed, config.color, inFinalPhase ? 2200 : 1800);
      }
      this.scene.cameras.main.shake(160, 0.004);
      this.emitTechniqueEnded(enemy);
    });
  }

  private fireBossNeedle(
    enemy: Enemy,
    angle: number,
    damage: number,
    speed: number,
    tint: number,
    durationMs: number,
    originX = enemy.x,
    originY = enemy.y
  ): void {
    const pooled = this.enemyProjectiles.get(originX, originY, "boss-needle") as EnemyProjectile | null;
    const projectile = pooled ?? new EnemyProjectile(this.scene, originX, originY);
    projectile.fire({
      x: originX,
      y: originY,
      damage,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      tint,
      durationMs,
      scale: BOSS_NEEDLE_PROJECTILE_SCALE,
      textureKey: "boss-needle"
    });
    if (!pooled) {
      this.enemyProjectiles.add(projectile);
    }
  }

  private performSummon(enemy: Enemy, config: BossSkillConfig): void {
    const guardFormation = bossIdentityFor(enemy.enemyId)?.guardFormation;
    this.emitTechniqueStarted(enemy, config, guardFormation ? "bossTechniqueGuardFormation" : config.labelKey);
    this.showCastLabel(enemy, t(guardFormation ? "bossTechniqueGuardFormation" : config.labelKey), config.color);
    playBossSummonTelegraph(this.scene, enemy.x, enemy.y, config.range, config.windupMs);
    this.scene.time.delayedCall(config.windupMs, () => {
      if (guardFormation) {
        this.summonGuardFormation(enemy, guardFormation);
      } else {
        this.summonMinions(enemy);
      }
      this.emitTechniqueEnded(enemy);
    });
  }

  private summonGuardFormation(boss: Enemy, formation: GuardFormationConfig): void {
    if (!boss.active) {
      return;
    }
    const guards: Enemy[] = [];
    for (let i = 0; i < formation.count; i += 1) {
      const angle = (Math.PI * 2 * i) / formation.count;
      const x = boss.x + Math.cos(angle) * 118;
      const y = boss.y + Math.sin(angle) * 118;
      const guard = this.spawn(formation.minionId, x, y);
      guard.setTint(0xf7c66b);
      guards.push(guard);
    }
    this.bossGuards.set(boss, guards);
    playBossSummonBurst(this.scene, boss.x, boss.y, 0xf7c66b, true);
  }

  private summonMinions(enemy: Enemy): void {
    if (!enemy.active) {
      return;
    }
    const count = enemy.enemyId === "finalBoss" ? 6 : 4;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const x = enemy.x + Math.cos(angle) * 118;
      const y = enemy.y + Math.sin(angle) * 118;
      const summoned = this.spawn(i % 2 === 0 ? "bat" : "slime", x, y, enemy.enemyId === "finalBoss");
      summoned.setTint(0xff9bd2);
    }
    playBossSummonBurst(this.scene, enemy.x, enemy.y, 0xb86bff, false);
  }

  private performOrbitingNeedles(enemy: Enemy, config: OrbitingNeedlesConfig): void {
    this.scene.events.emit("boss-technique-started", t("bossTechniqueOrbitingNeedles"), 0xff2f86, enemy.enemyId);
    this.showCastLabel(enemy, t("bossTechniqueOrbitingNeedles"), 0xff2f86);
    const damage = Math.round(enemy.config.damage * enemy.damageMultiplier * config.damageMultiplier);
    for (let i = 0; i < config.count; i += 1) {
      const orbitAngle = (Math.PI * 2 * i) / config.count;
      const originX = enemy.x + Math.cos(orbitAngle) * config.orbitRadius;
      const originY = enemy.y + Math.sin(orbitAngle) * config.orbitRadius;
      const shootAngle = Phaser.Math.Angle.Between(originX, originY, this.player.x, this.player.y);
      playBossOrbitCharge(this.scene, originX, originY, 420);
      this.scene.time.delayedCall(420, () => {
        if (!enemy.active) {
          return;
        }
        this.fireBossNeedle(enemy, shootAngle, damage, 280, 0xff2f86, 1600, originX, originY);
      });
    }
    this.scene.time.delayedCall(500, () => this.emitTechniqueEnded(enemy));
  }

  private updateFinalPhase(enemy: Enemy, enemyId: EnemyId): void {
    const phase = finalPhaseFor(enemyId);
    if (!phase || this.finalPhaseActive.has(enemy) || enemy.hp / enemy.maxHp > phase.hpRatio) {
      return;
    }

    this.finalPhaseActive.add(enemy);
    const label = t(phase.labelKey);
    this.scene.events.emit("boss-technique-started", label, 0xff2f86, enemy.enemyId);
    this.showCastLabel(enemy, label, 0xff2f86);
    enemy.setTint(0xff2f86);
    playBossFinalPhaseBurst(this.scene, enemy.x, enemy.y);
    this.scene.time.delayedCall(720, () => this.scene.events.emit("boss-technique-ended", enemy.enemyId));
  }

  private showCastLabel(enemy: Enemy, label: string, color: number): void {
    const text = this.scene.add
      .text(enemy.x, enemy.y - enemy.displayHeight / 2 - 28, label, {
        fontFamily: "Microsoft JhengHei, Noto Sans TC, Arial, sans-serif",
        fontSize: "15px",
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        fontStyle: "700",
        backgroundColor: "#111421cc",
        padding: { x: 7, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(50);
    this.scene.tweens.add({
      targets: text,
      y: text.y - 18,
      alpha: 0,
      duration: 760,
      ease: "Sine.easeOut",
      onComplete: () => text.destroy()
    });
  }

  private emitTechniqueStarted(enemy: Enemy, config: BossSkillConfig, labelKey: BossSkillConfig["labelKey"] | "bossTechniquePursuitLock" | "bossTechniqueFanLinger" | "bossTechniqueGuardFormation" | "bossTechniqueSectorNeedle" | "bossTechniqueOrbitingNeedles" = config.labelKey): void {
    this.scene.events.emit("boss-technique-started", t(labelKey), config.color, enemy.enemyId);
  }

  private emitTechniqueEnded(enemy: Enemy): void {
    this.scene.events.emit("boss-technique-ended", enemy.enemyId);
  }

  private difficultyScale(): { hp: number; damage: number; speed: number; reward: number } {
    const time = timeCombatScale(this.elapsedSec);
    return {
      hp: this.difficulty.hpMultiplier * time.hp,
      damage: this.difficulty.damageMultiplier * time.damage,
      speed: this.difficulty.speedMultiplier * runModifierEnemySpeedMultiplier(this.runModifierId),
      reward: this.difficulty.rewardMultiplier
    };
  }
}
