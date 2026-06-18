import Phaser from "phaser";

export class ExpGem extends Phaser.Physics.Arcade.Sprite {
  value = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
    super(scene, x, y, "gem");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.spawn(x, y, value);
  }

  spawn(x: number, y: number, value: number): void {
    this.value = value;
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setCircle(6);
    this.setDepth(8);
  }
}
