import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0f17);
    this.add
      .text(width / 2, height * 0.31, "Wandering Sword Survivors", {
        fontFamily: "Georgia, serif",
        fontSize: "50px",
        color: "#f7efd8"
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.42, "Linghu Chong enters the jianghu alone.", {
        fontSize: "20px",
        color: "#aac7d8"
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.56, "WASD / Arrow keys to move\nChoose martial arts with mouse or 1-3", {
        fontSize: "18px",
        color: "#d8e2eb",
        align: "center",
        lineSpacing: 8
      })
      .setOrigin(0.5);

    const start = this.add
      .text(width / 2, height * 0.74, "Start Run", {
        fontSize: "24px",
        color: "#10121f",
        backgroundColor: "#f7c66b",
        padding: { left: 28, right: 28, top: 12, bottom: 12 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    start.on("pointerdown", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}
