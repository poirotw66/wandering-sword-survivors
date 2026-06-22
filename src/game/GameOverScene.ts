import Phaser from "phaser";
import { formatClock } from "../utils/math";

export type GameOverData = {
  won: boolean;
  score: number;
  kills: number;
  elapsedSec: number;
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(data: GameOverData): void {
    const best = Math.max(data.score, Number(localStorage.getItem("sword-survivors-best") ?? 0));
    localStorage.setItem("sword-survivors-best", String(best));

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0f17, 0.96);
    this.add.image(width / 2, height * 0.54, data.won ? "strike" : "boss-master").setScale(data.won ? 1.1 : 0.34).setAlpha(0.25);
    this.add
      .text(width / 2, height * 0.28, data.won ? "Sword Roams Free" : "The Jianghu Prevails", {
        fontFamily: "Georgia, serif",
        fontSize: "58px",
        color: data.won ? "#f7c66b" : "#ff7687"
      })
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height * 0.45,
        `Linghu Chong survived ${formatClock(data.elapsedSec)}   Defeated ${data.kills}\nRenown ${data.score}   Best ${best}`,
        {
          fontSize: "22px",
          color: "#d8e2eb",
          align: "center",
          lineSpacing: 10
        }
      )
      .setOrigin(0.5);

    const restart = this.add
      .text(width / 2, height * 0.68, "Roam Again", {
        fontSize: "24px",
        color: "#10121f",
        backgroundColor: "#84f7b2",
        padding: { left: 28, right: 28, top: 12, bottom: 12 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restart.on("pointerdown", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}
