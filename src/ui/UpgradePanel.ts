import Phaser from "phaser";
import type { UpgradeOption } from "../data/upgrades";
import { t } from "../i18n";
import { TITLE_FONT, UI_FONT } from "./textStyle";

export class UpgradePanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly cards: Phaser.GameObjects.Container[] = [];
  private currentOptions: UpgradeOption[] = [];
  private currentPick?: (option: UpgradeOption) => void;

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);
  }

  show(options: UpgradeOption[], onPick: (option: UpgradeOption) => void): void {
    this.clear();
    this.currentOptions = options;
    this.currentPick = onPick;
    const { width, height } = this.scene.scale;
    this.container.setVisible(true);
    this.container.add(this.scene.add.rectangle(width / 2, height / 2, width, height, 0x070912, 0.78));
    this.container.add(this.scene.add.rectangle(width / 2, height * 0.5, Math.min(1040, width - 60), 390, 0x111421, 0.82).setStrokeStyle(1, 0x5f4a2a, 0.9));
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.2, t("manualTitle"), {
          fontFamily: TITLE_FONT,
          fontSize: "36px",
          color: "#f7efd8"
        })
        .setPadding(0, 8, 0, 8)
        .setOrigin(0.5)
    );
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.27, t("manualHint"), {
          fontFamily: UI_FONT,
          fontSize: "16px",
          color: "#aac7d8"
        })
        .setPadding(0, 6, 0, 6)
        .setOrigin(0.5)
    );

    options.forEach((option, index) => {
      const cardWidth = Math.min(280, width * 0.27);
      const cardHeight = 220;
      const x = width / 2 + (index - 1) * (cardWidth + 22);
      const y = height * 0.55;
      const card = this.scene.add.container(x, y);
      card.setSize(cardWidth, cardHeight);
      card.setInteractive(
        new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains
      );
      const bg = this.scene.add
        .rectangle(0, 0, cardWidth, cardHeight, 0x1b1720, 0.98)
        .setStrokeStyle(2, 0xd9b45f);
      const seal = this.scene.add.circle(0, -76, 16, 0x7b2f3a, 0.96).setStrokeStyle(2, 0xffd6b0);
      const indexText = this.scene.add
        .text(0, -77, `${index + 1}`, {
          fontFamily: TITLE_FONT,
          fontSize: "16px",
          color: "#f7efd8",
          fontStyle: "700"
        })
        .setOrigin(0.5);
      const title = this.scene.add
        .text(0, -42, option.title, {
          fontFamily: UI_FONT,
          fontSize: "19px",
          color: "#f7c66b",
          align: "center",
          lineSpacing: 4,
          wordWrap: { width: cardWidth - 28 }
        })
        .setPadding(0, 8, 0, 8)
        .setOrigin(0.5);
      const description = this.scene.add
        .text(0, 48, option.description, {
          fontFamily: UI_FONT,
          fontSize: "15px",
          color: "#d8e2eb",
          align: "center",
          lineSpacing: 6,
          wordWrap: { width: cardWidth - 30 }
        })
        .setPadding(0, 6, 0, 6)
        .setOrigin(0.5);

      card.on("pointerover", () => bg.setStrokeStyle(3, 0xffe09a));
      card.on("pointerout", () => bg.setStrokeStyle(2, 0xd9b45f));
      card.on("pointerdown", () => onPick(option));
      card.add([bg, seal, indexText, title, description]);
      this.container.add(card);
      this.cards.push(card);
    });
  }

  hide(): void {
    this.clear();
    this.container.setVisible(false);
  }

  pickByIndex(index: number): void {
    const option = this.currentOptions[index];
    if (option && this.currentPick) {
      this.currentPick(option);
    }
  }

  private clear(): void {
    this.cards.length = 0;
    this.currentOptions = [];
    this.container.removeAll(true);
  }
}
