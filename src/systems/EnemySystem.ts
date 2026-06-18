import Phaser from "phaser";
import { type EnemyId } from "../data/enemies";
import { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";

export class EnemySystem {
  readonly enemies: Phaser.Physics.Arcade.Group;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player
  ) {
    this.enemies = scene.physics.add.group({ classType: Enemy, runChildUpdate: false });
  }

  spawn(enemyId: EnemyId, x: number, y: number): Enemy {
    const enemy = this.enemies.get(x, y, enemyId) as Enemy | null;
    if (enemy) {
      enemy.spawn(enemyId, x, y);
      return enemy;
    }

    return new Enemy(this.scene, x, y, enemyId);
  }

  update(): void {
    this.enemies.children.each((child) => {
      const enemy = child as Enemy;
      if (!enemy.active) {
        return true;
      }

      this.scene.physics.moveToObject(enemy, this.player, enemy.config.moveSpeed);
      return true;
    });
  }

  activeCount(): number {
    return this.enemies.countActive(true);
  }
}
