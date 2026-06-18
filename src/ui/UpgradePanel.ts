import Phaser from "phaser";
import type { UpgradeOption } from "../data/upgrades";

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
    this.container.add(this.scene.add.rectangle(width / 2, height / 2, width, height, 0x070912, 0.72));
    this.container.add(
      this.scene.add
        .text(width / 2, height * 0.22, "Comprehend a Martial Art", {
          fontFamily: "Georgia, serif",
          fontSize: "36px",
          color: "#f7efd8"
        })
        .setOrigin(0.5)
    );

    options.forEach((option, index) => {
      const cardWidth = Math.min(280, width * 0.27);
      const cardHeight = 178;
      const x = width / 2 + (index - 1) * (cardWidth + 22);
      const y = height * 0.52;
      const card = this.scene.add.container(x, y);
      const bg = this.scene.add
        .rectangle(0, 0, cardWidth, cardHeight, 0x192033, 0.98)
        .setStrokeStyle(2, 0xf7c66b)
        .setInteractive({ useHandCursor: true });
      const title = this.scene.add
        .text(0, -52, `${index + 1}. ${option.title}`, {
          fontSize: "20px",
          color: "#f7c66b",
          align: "center",
          wordWrap: { width: cardWidth - 32 }
        })
        .setOrigin(0.5);
      const description = this.scene.add
        .text(0, 22, option.description, {
          fontSize: "16px",
          color: "#d8e2eb",
          align: "center",
          wordWrap: { width: cardWidth - 34 }
        })
        .setOrigin(0.5);

      bg.on("pointerdown", () => onPick(option));
      card.add([bg, title, description]);
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
