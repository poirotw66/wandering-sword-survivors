import Phaser from "phaser";
import type { GameState } from "../game/GameState";

export class ExpBar {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.bg = scene.add.rectangle(0, 0, 1, 12, 0x172033).setOrigin(0, 0).setScrollFactor(0);
    this.fill = scene.add.rectangle(0, 0, 1, 12, 0x84f7b2).setOrigin(0, 0).setScrollFactor(0);
  }

  resize(width: number): void {
    this.bg.width = width;
  }

  update(state: GameState): void {
    this.fill.width = this.bg.width * Phaser.Math.Clamp(state.exp / state.expToNext, 0, 1);
  }
}
