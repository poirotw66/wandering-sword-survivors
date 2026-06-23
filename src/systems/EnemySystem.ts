import Phaser from "phaser";
import { type EnemyId } from "../data/enemies";
import { bossSkillConfig, bossSkillCooldown, bossSkillProfileFor, finalPhaseFor, type BossSkillConfig } from "../data/bossSkills";
import type { DifficultyConfig } from "../data/metaProgression";
import { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import { t } from "../i18n";

export class EnemySystem {
  readonly enemies: Phaser.Physics.Arcade.Group;
  private readonly nextDashAt = new WeakMap<Enemy, number>();
  private readonly dashUntil = new WeakMap<Enemy, number>();
  private readonly nextFanAt = new WeakMap<Enemy, number>();
  private readonly nextSummonAt = new WeakMap<Enemy, number>();
  private readonly finalPhaseActive = new WeakSet<Enemy>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly difficulty: DifficultyConfig
  ) {
    this.enemies = scene.physics.add.group({ classType: Enemy, runChildUpdate: false });
  }

  spawn(enemyId: EnemyId, x: number, y: number, elite = false): Enemy {
    const enemy = this.enemies.get(x, y, enemyId) as Enemy | null;
    if (enemy) {
      enemy.spawnAs(enemyId, x, y, elite, this.difficultyScale());
      return enemy;
    }

    const created = new Enemy(this.scene, x, y, enemyId);
    created.spawnAs(enemyId, x, y, elite, this.difficultyScale());
    return created;
  }

  update(): void {
    this.enemies.children.each((child) => {
      const enemy = child as Enemy;
      if (!enemy.active) {
        return true;
      }

      this.updateBossSkills(enemy);
      if ((this.dashUntil.get(enemy) ?? 0) < this.scene.time.now) {
        this.scene.physics.moveToObject(enemy, this.player, enemy.config.moveSpeed * enemy.moveSpeedMultiplier);
      }
      enemy.updateStatusUi();
      return true;
    });
  }

  activeCount(): number {
    return this.enemies.countActive(true);
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
    return {
      hp: this.difficulty.hpMultiplier,
      damage: this.difficulty.damageMultiplier,
      speed: this.difficulty.speedMultiplier,
      reward: this.difficulty.rewardMultiplier
    };
  }
}
