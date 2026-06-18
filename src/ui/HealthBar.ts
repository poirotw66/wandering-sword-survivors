import Phaser from "phaser";
import type { Player } from "../entities/Player";

export class HealthBar {
  private readonly fill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    scene.add.rectangle(x, y, 260, 18, 0x2a1f2a).setOrigin(0, 0.5).setScrollFactor(0);
    this.fill = scene.add.rectangle(x + 2, y, 256, 12, 0xff5f72).setOrigin(0, 0.5).setScrollFactor(0);
  }

  update(player: Player): void {
    const ratio = Phaser.Math.Clamp(player.stats.hp / player.stats.maxHp, 0, 1);
    this.fill.width = 256 * ratio;
  }
}
