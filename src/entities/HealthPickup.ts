import Phaser from "phaser";

export class HealthPickup extends Phaser.Physics.Arcade.Sprite {
  amount = 15;

  constructor(scene: Phaser.Scene, x: number, y: number, amount: number) {
    super(scene, x, y, "heart");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.spawn(x, y, amount);
  }

  spawn(x: number, y: number, amount: number): void {
    this.amount = amount;
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(0.14);
    this.setCircle(70, 38, 54);
    this.setDepth(9);
    this.setVelocity(0, 0);
  }
}
