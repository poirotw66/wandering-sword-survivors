import Phaser from "phaser";
import { type EnemyId } from "../data/enemies";
import { archetypeConfigFor, minionBehaviorFor, type MinionArchetypeConfig } from "../data/minionBehaviors";
import { bossSkillConfig, bossSkillCooldown, bossSkillProfileFor, finalPhaseFor, type BossSkillConfig } from "../data/bossSkills";
import type { DifficultyConfig } from "../data/metaProgression";
import { timeCombatScale } from "../data/timeCombatScale";
import { Enemy } from "../entities/Enemy";
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
  private readonly finalPhaseActive = new WeakSet<Enemy>();
  private readonly minionNextActionAt = new WeakMap<Enemy, number>();
  private readonly minionLockedUntil = new WeakMap<Enemy, number>();
  private readonly minionWindupPending = new WeakSet<Enemy>();
  private elapsedSec = 0;

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
  }

  private performDash(enemy: Enemy, config: BossSkillConfig): void {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const warning = this.scene.add
      .rectangle(enemy.x, enemy.y, config.range, config.width, config.color, 0.3)
      .setRotation(angle)
      .setDepth(12);
    this.emitTechniqueStarted(enemy, config);
    this.scene.tweens.add({
      targets: warning,
      alpha: { from: 0.34, to: 0.08 },
      scaleX: { from: 0.35, to: 1 },
      duration: config.windupMs,
      yoyo: true,
      onComplete: () => warning.destroy()
    });
    this.showCastLabel(enemy, t(config.labelKey), config.color);
    this.scene.time.delayedCall(config.windupMs, () => {
      if (!enemy.active) {
        return;
      }
      this.dashUntil.set(enemy, this.scene.time.now + 520);
      enemy.setVelocity(Math.cos(angle) * 360, Math.sin(angle) * 360);
      this.emitTechniqueEnded(enemy);
    });
  }

  private performFanStrike(enemy: Enemy, config: BossSkillConfig): void {
    const originAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const arcs: Phaser.GameObjects.Arc[] = [];
    for (let i = -2; i <= 2; i += 1) {
      const angle = originAngle + i * 0.22;
      const arc = this.scene.add
        .arc(enemy.x + Math.cos(angle) * 92, enemy.y + Math.sin(angle) * 92, config.width / 2, -18, 18, false, config.color, 0.28)
        .setRotation(angle)
        .setDepth(12);
      arcs.push(arc);
      this.scene.tweens.add({
        targets: arc,
        alpha: { from: 0.12, to: 0.38 },
        scale: { from: 0.7, to: 1.2 },
        duration: config.windupMs,
        yoyo: true
      });
    }
    this.emitTechniqueStarted(enemy, config);
    this.showCastLabel(enemy, t(config.labelKey), config.color);
    this.scene.time.delayedCall(config.windupMs, () => {
      for (const arc of arcs) {
        arc.destroy();
      }
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
      this.emitTechniqueEnded(enemy);
    });
  }

  private performSummon(enemy: Enemy, config: BossSkillConfig): void {
    this.emitTechniqueStarted(enemy, config);
    this.showCastLabel(enemy, t(config.labelKey), config.color);
    const pulse = this.scene.add.circle(enemy.x, enemy.y, config.range, config.color, 0.18).setDepth(11);
    this.scene.tweens.add({
      targets: pulse,
      alpha: { from: 0.3, to: 0.04 },
      scale: { from: 0.45, to: 1.35 },
      duration: config.windupMs,
      yoyo: true,
      onComplete: () => pulse.destroy()
    });
    this.scene.time.delayedCall(config.windupMs, () => {
      this.summonMinions(enemy);
      this.emitTechniqueEnded(enemy);
    });
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
    const pulse = this.scene.add.circle(enemy.x, enemy.y, 132, 0xb86bff, 0.22).setDepth(11);
    this.scene.tweens.add({
      targets: pulse,
      alpha: 0,
      scale: 1.5,
      duration: 360,
      onComplete: () => pulse.destroy()
    });
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
    const pulse = this.scene.add.circle(enemy.x, enemy.y, 178, 0xff2f86, 0.22).setDepth(14);
    this.scene.tweens.add({
      targets: pulse,
      alpha: 0,
      scale: 1.9,
      duration: 720,
      ease: "Sine.easeOut",
      onComplete: () => {
        pulse.destroy();
        this.scene.events.emit("boss-technique-ended", enemy.enemyId);
      }
    });
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

  private emitTechniqueStarted(enemy: Enemy, config: BossSkillConfig): void {
    this.scene.events.emit("boss-technique-started", t(config.labelKey), config.color, enemy.enemyId);
  }

  private emitTechniqueEnded(enemy: Enemy): void {
    this.scene.events.emit("boss-technique-ended", enemy.enemyId);
  }

  private difficultyScale(): { hp: number; damage: number; speed: number; reward: number } {
    const time = timeCombatScale(this.elapsedSec);
    return {
      hp: this.difficulty.hpMultiplier * time.hp,
      damage: this.difficulty.damageMultiplier * time.damage,
      speed: this.difficulty.speedMultiplier,
      reward: this.difficulty.rewardMultiplier
    };
  }
}
