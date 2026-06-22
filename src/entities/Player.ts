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
  critChance: number;
  critMultiplier: number;
  dodgeChance: number;
  comboChance: number;
  burstMultiplier: number;
};

export const PLAYER_BASE_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  moveSpeed: 188,
  pickupRange: 86,
  damageMultiplier: 1,
  cooldownMultiplier: 1,
  projectileSpeedMultiplier: 1,
  areaMultiplier: 1,
  critChance: 0.05,
  critMultiplier: 1.75,
  dodgeChance: 0,
  comboChance: 0,
  burstMultiplier: 1
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats = { ...PLAYER_BASE_STATS };
  invulnerableUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.2);
    this.setCircle(78, 105, 112);
    this.setDepth(20);
    this.setCollideWorldBounds(false);
  }

  takeDamage(amount: number, now: number): boolean {
    if (now < this.invulnerableUntil) {
      return false;
    }

    if (Math.random() < this.stats.dodgeChance) {
      this.invulnerableUntil = now + 260;
      this.scene.tweens.add({
        targets: this,
        alpha: 0.55,
        yoyo: true,
        duration: 70,
        repeat: 1,
        onComplete: () => this.setAlpha(1)
      });
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
