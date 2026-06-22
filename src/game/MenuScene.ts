import Phaser from "phaser";
import { t, toggleLocale } from "../i18n";
import { TITLE_FONT, UI_FONT } from "../ui/textStyle";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0f17);
    this.add.image(width / 2, height * 0.58, "player").setScale(0.34).setAlpha(0.78);
    this.add.image(width / 2 + 86, height * 0.56, "strike").setScale(0.7).setAlpha(0.42).setAngle(22);
    this.add
      .text(width / 2, height * 0.31, t("title"), {
        fontFamily: TITLE_FONT,
        fontSize: "46px",
        color: "#f7efd8"
      })
      .setPadding(0, 10, 0, 10)
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.42, t("menuSubtitle"), {
        fontFamily: UI_FONT,
        fontSize: "20px",
        color: "#aac7d8"
      })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.56, t("menuPitch"), {
        fontFamily: UI_FONT,
        fontSize: "18px",
        color: "#d8e2eb",
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: Math.min(620, width - 80) }
      })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5);

    const start = this.add
      .text(width / 2, height * 0.74, t("startRun"), {
        fontFamily: UI_FONT,
        fontSize: "24px",
        color: "#10121f",
        backgroundColor: "#f7c66b",
        padding: { left: 28, right: 28, top: 12, bottom: 12 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const language = this.add
      .text(width - 24, 22, t("languageToggle"), {
        fontFamily: UI_FONT,
        fontSize: "16px",
        color: "#f7c66b",
        backgroundColor: "#192033",
        padding: { left: 12, right: 12, top: 8, bottom: 8 }
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height * 0.84, t("controls"), {
        fontFamily: UI_FONT,
        fontSize: "16px",
        color: "#aac7d8",
        align: "center",
        lineSpacing: 6
      })
      .setPadding(0, 6, 0, 6)
      .setOrigin(0.5);

    start.on("pointerdown", () => this.scene.start("GameScene"));
    language.on("pointerdown", () => {
      toggleLocale();
      this.scene.restart();
    });
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}
