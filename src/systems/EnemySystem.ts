import Phaser from "phaser";
import { type EnemyId } from "../data/enemies";
import { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";

export class EnemySystem {
  readonly enemies: Phaser.Physics.Arcade.Group;
  private readonly nextDashAt = new WeakMap<Enemy, number>();
  private readonly dashUntil = new WeakMap<Enemy, number>();
  private readonly nextFanAt = new WeakMap<Enemy, number>();
  private readonly nextSummonAt = new WeakMap<Enemy, number>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player
  ) {
    this.enemies = scene.physics.add.group({ classType: Enemy, runChildUpdate: false });
  }

  spawn(enemyId: EnemyId, x: number, y: number, elite = false): Enemy {
    const enemy = this.enemies.get(x, y, enemyId) as Enemy | null;
    if (enemy) {
      enemy.spawnAs(enemyId, x, y, elite);
      return enemy;
    }

    const created = new Enemy(this.scene, x, y, enemyId);
    if (elite) {
      created.spawnAs(enemyId, x, y, true);
    }
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
        this.scene.physics.moveToObject(enemy, this.player, enemy.config.moveSpeed);
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

    const now = this.scene.time.now;
    if (enemy.config.canDash && now >= (this.nextDashAt.get(enemy) ?? 0)) {
      this.nextDashAt.set(enemy, now + 4200);
      this.performDash(enemy);
    }
    if (enemy.config.canFanStrike && now >= (this.nextFanAt.get(enemy) ?? 0)) {
      this.nextFanAt.set(enemy, now + 6200);
      this.performFanStrike(enemy);
    }
    if (enemy.config.canSummon && now >= (this.nextSummonAt.get(enemy) ?? 0)) {
      this.nextSummonAt.set(enemy, now + 8200);
      this.performSummon(enemy);
    }
  }

  private performDash(enemy: Enemy): void {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const warning = this.scene.add
      .rectangle(enemy.x, enemy.y, 260, 12, 0xff7687, 0.26)
      .setRotation(angle)
      .setDepth(12);
    this.scene.tweens.add({
      targets: warning,
      alpha: 0,
      duration: 420,
      onComplete: () => warning.destroy()
    });
    this.scene.time.delayedCall(260, () => {
      if (!enemy.active) {
        return;
      }
      this.dashUntil.set(enemy, this.scene.time.now + 520);
      enemy.setVelocity(Math.cos(angle) * 360, Math.sin(angle) * 360);
    });
  }

  private performFanStrike(enemy: Enemy): void {
    const originAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const arcs: Phaser.GameObjects.Arc[] = [];
    for (let i = -2; i <= 2; i += 1) {
      const angle = originAngle + i * 0.22;
      const arc = this.scene.add
        .arc(enemy.x + Math.cos(angle) * 92, enemy.y + Math.sin(angle) * 92, 76, -16, 16, false, 0x8ff4ff, 0.24)
        .setRotation(angle)
        .setDepth(12);
      arcs.push(arc);
    }
    this.scene.time.delayedCall(520, () => {
      for (const arc of arcs) {
        arc.destroy();
      }
      if (!enemy.active) {
        return;
      }
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const delta = Phaser.Math.Angle.Wrap(angleToPlayer - originAngle);
      if (distance <= 250 && Math.abs(delta) <= 0.62) {
        const tookDamage = this.player.takeDamage(Math.round(enemy.config.damage * 1.2), this.scene.time.now);
        if (tookDamage) {
          this.scene.events.emit("player-damaged");
        }
      }
    });
  }

  private performSummon(enemy: Enemy): void {
    const count = enemy.enemyId === "finalBoss" ? 6 : 4;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const x = enemy.x + Math.cos(angle) * 118;
      const y = enemy.y + Math.sin(angle) * 118;
      const summoned = this.spawn(i % 2 === 0 ? "bat" : "slime", x, y, enemy.enemyId === "finalBoss");
      summoned.setTint(0xff9bd2);
    }
    const pulse = this.scene.add.circle(enemy.x, enemy.y, 132, 0xb86bff, 0.18).setDepth(11);
    this.scene.tweens.add({
      targets: pulse,
      alpha: 0,
      scale: 1.5,
      duration: 360,
      onComplete: () => pulse.destroy()
    });
  }
}
