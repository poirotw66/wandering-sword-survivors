import Phaser from "phaser";
import { MINION_PROJECTILE_SCALE } from "../data/enemyProjectileVisual";

export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  damage = 1;
  expiresAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bolt");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(15);
    this.setCircle(5);
  }

  fire(options: {
    x: number;
    y: number;
    damage: number;
    velocityX: number;
    velocityY: number;
    tint: number;
    durationMs: number;
    scale?: number;
  }): void {
    const scale = options.scale ?? MINION_PROJECTILE_SCALE;
    this.damage = options.damage;
    this.expiresAt = this.scene.time.now + options.durationMs;
    this.setPosition(options.x, options.y);
    this.setTint(options.tint);
    this.setScale(scale);
    this.setAlpha(0.9);
    this.setActive(true);
    this.setVisible(true);
    if (this.body) {
      this.body.enable = true;
    }
    this.setVelocity(options.velocityX, options.velocityY);
  }

  expire(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
  }
}
