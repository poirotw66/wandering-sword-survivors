import Phaser from "phaser";

export type PlayerStats = {
  hp: number;
  maxHp: number;
  moveSpeed: number;
  pickupRange: number;
  damageMultiplier: number;
  cooldownMultiplier: number;
  projectileSpeedMultiplier: number;
  areaMultiplier: number;
};

export const PLAYER_BASE_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  moveSpeed: 180,
  pickupRange: 72,
  damageMultiplier: 1,
  cooldownMultiplier: 1,
  projectileSpeedMultiplier: 1,
  areaMultiplier: 1
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats = { ...PLAYER_BASE_STATS };
  invulnerableUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(14);
    this.setDepth(20);
    this.setCollideWorldBounds(false);
  }

  takeDamage(amount: number, now: number): boolean {
    if (now < this.invulnerableUntil) {
      return false;
    }

    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.invulnerableUntil = now + 550;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      yoyo: true,
      duration: 80,
      repeat: 3,
      onComplete: () => this.setAlpha(1)
    });
    return true;
  }
}
