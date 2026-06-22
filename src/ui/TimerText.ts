import Phaser from "phaser";
import type { GameState } from "../game/GameState";
import { formatClock } from "../utils/math";
import { UI_FONT } from "./textStyle";

export class TimerText {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add
      .text(x, y, "0:00", { fontFamily: UI_FONT, fontSize: "26px", color: "#f7efd8", fontStyle: "700" })
      .setPadding(0, 4, 0, 4)
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
  }

  update(state: GameState): void {
    this.text.setText(formatClock(state.elapsedSec));
  }

  setPosition(x: number, y: number): void {
    this.text.setPosition(x, y);
  }
}
