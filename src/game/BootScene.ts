import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    const basePath = "assets/sprites/wuxia";
    this.load.image("player", `${basePath}/hero-linghu.png`);
    this.load.image("enemy-purple", `${basePath}/enemy-purple.png`);
    this.load.image("enemy-red", `${basePath}/enemy-red.png`);
    this.load.image("enemy-green", `${basePath}/enemy-green.png`);
    this.load.image("boss-master", `${basePath}/boss-master.png`);
    this.load.image("bolt", `${basePath}/sword-qi.png`);
    this.load.image("blade", `${basePath}/orbit-swords.png`);
    this.load.image("palm-wave", `${basePath}/palm-wave.png`);
    this.load.image("strike", `${basePath}/sword-flash.png`);
    this.load.image("gem", `${basePath}/jade-gem.png`);
    this.load.image("heart", `${basePath}/wine-gourd.png`);
  }

  create(): void {
    this.createFallbackTextures();
    this.scene.start("MenuScene");
  }

  private createFallbackTextures(): void {
    if (!this.textures.exists("player")) {
      this.createHeroTexture();
    }
    if (!this.textures.exists("enemy-purple")) {
      this.createCircleTexture("enemy-purple", 32, 0xffffff, 0x2b2036);
    }
    if (!this.textures.exists("enemy-red")) {
      this.createCircleTexture("enemy-red", 32, 0xffffff, 0x2b2036);
    }
    if (!this.textures.exists("enemy-green")) {
      this.createCircleTexture("enemy-green", 32, 0xffffff, 0x2b2036);
    }
    if (!this.textures.exists("boss-master")) {
      this.createCircleTexture("boss-master", 64, 0xff4f64, 0x2b2036);
    }
    if (!this.textures.exists("bolt")) {
      this.createCircleTexture("bolt", 14, 0x9ee7ff, 0xffffff);
    }
    if (!this.textures.exists("gem")) {
      this.createCircleTexture("gem", 12, 0x84f7b2, 0xffffff);
    }
    if (!this.textures.exists("heart")) {
      this.createHeartTexture();
    }
    if (!this.textures.exists("blade")) {
      this.createBladeTexture();
    }
    if (!this.textures.exists("strike")) {
      this.createStrikeTexture();
    }
    if (!this.textures.exists("palm-wave")) {
      this.createCircleTexture("palm-wave", 42, 0x9ee7ff, 0xffffff);
    }
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
