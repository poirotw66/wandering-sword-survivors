import Phaser from "phaser";
import type { Player } from "../entities/Player";
import { UI_FONT } from "./textStyle";

const BAR_WIDTH = 200;

export class HealthBar {
  private readonly root: Phaser.GameObjects.Container;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.root = scene.add.container(x, y).setDepth(825).setScrollFactor(0);
    const track = scene.add
      .rectangle(0, 0, BAR_WIDTH, 16, 0x1a1220, 0.94)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x5a3048, 0.85);
    this.fill = scene.add.rectangle(2, 0, BAR_WIDTH - 4, 12, 0xff5f72).setOrigin(0, 0.5);
    this.label = scene.add
      .text(BAR_WIDTH / 2, 0, "", {
        fontFamily: UI_FONT,
        fontSize: "11px",
        color: "#fff8f0",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setStroke("#2a1018", 2);
    this.root.add([track, this.fill, this.label]);
  }

  setPosition(x: number, y: number): void {
    this.root.setPosition(x, y);
  }

  getWidth(): number {
    return BAR_WIDTH;
  }

  update(player: Player): void {
    const ratio = Phaser.Math.Clamp(player.stats.hp / player.stats.maxHp, 0, 1);
    this.fill.width = (BAR_WIDTH - 4) * ratio;
    this.label.setText(`${Math.ceil(player.stats.hp)} / ${player.stats.maxHp}`);
    const lowHp = ratio <= 0.28;
    this.fill.setFillStyle(lowHp ? 0xff3d55 : 0xff5f72);
    this.label.setColor(lowHp ? "#ffe0e6" : "#fff8f0");
  }
}
