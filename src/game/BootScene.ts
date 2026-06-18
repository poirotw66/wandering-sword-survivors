import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    this.createHeroTexture();
    this.createCircleTexture("enemy", 32, 0xffffff, 0x2b2036);
    this.createCircleTexture("bolt", 14, 0x9ee7ff, 0xffffff);
    this.createCircleTexture("gem", 12, 0x84f7b2, 0xffffff);
    this.createHeartTexture();
    this.createBladeTexture();
    this.createStrikeTexture();
    this.scene.start("MenuScene");
  }

  private createCircleTexture(key: string, size: number, fill: number, stroke: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(fill, 1);
    graphics.lineStyle(3, stroke, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2 - 3);
    graphics.strokeCircle(size / 2, size / 2, size / 2 - 3);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  private createHeroTexture(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xd8e2eb, 1);
    graphics.lineStyle(3, 0x27415f, 1);
    graphics.fillCircle(15, 15, 12);
    graphics.strokeCircle(15, 15, 12);
    graphics.lineStyle(4, 0xf7efd8, 1);
    graphics.lineBetween(22, 8, 39, 1);
    graphics.lineStyle(2, 0x6ee7ff, 1);
    graphics.lineBetween(24, 6, 42, 1);
    graphics.generateTexture("player", 44, 34);
    graphics.destroy();
  }

  private createBladeTexture(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xe7e1ff, 1);
    graphics.lineStyle(2, 0x7a6cf2, 1);
    graphics.beginPath();
    graphics.moveTo(18, 0);
    graphics.lineTo(32, 18);
    graphics.lineTo(18, 36);
    graphics.lineTo(4, 18);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    graphics.generateTexture("blade", 36, 36);
    graphics.destroy();
  }

  private createStrikeTexture(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(8, 0xfff27a, 1);
    graphics.beginPath();
    graphics.moveTo(22, 0);
    graphics.lineTo(8, 28);
    graphics.lineTo(24, 28);
    graphics.lineTo(12, 58);
    graphics.strokePath();
    graphics.generateTexture("strike", 40, 64);
    graphics.destroy();
  }

  private createHeartTexture(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff6f86, 1);
    graphics.lineStyle(2, 0xffd6de, 1);
    graphics.fillCircle(9, 8, 7);
    graphics.fillCircle(19, 8, 7);
    graphics.beginPath();
    graphics.moveTo(3, 12);
    graphics.lineTo(14, 28);
    graphics.lineTo(25, 12);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokeCircle(9, 8, 7);
    graphics.strokeCircle(19, 8, 7);
    graphics.strokePath();
    graphics.generateTexture("heart", 28, 30);
    graphics.destroy();
  }
}
