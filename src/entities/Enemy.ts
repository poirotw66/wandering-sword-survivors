import Phaser from "phaser";
import { ENEMY_CONFIGS, type EnemyConfig, type EnemyId } from "../data/enemies";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  enemyId: EnemyId = "slime";
  hp = 1;
  maxHp = 1;
  config: EnemyConfig = ENEMY_CONFIGS.slime;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyId: EnemyId) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.spawn(enemyId, x, y);
  }

  spawn(enemyId: EnemyId, x: number, y: number): void {
    this.enemyId = enemyId;
    this.config = ENEMY_CONFIGS[enemyId];
    this.hp = this.config.hp;
    this.maxHp = this.config.hp;
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setTint(this.config.tint);
    this.setCircle(this.config.radius);
    this.setScale(this.config.radius / 16);
    this.setDepth(enemyId === "boss" ? 18 : 10);
  }

  damage(amount: number): boolean {
    this.hp -= amount;
    this.setAlpha(0.65);
    this.scene.time.delayedCall(60, () => this.active && this.setAlpha(1));
    return this.hp <= 0;
  }
}
