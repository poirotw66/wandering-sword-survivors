import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    const basePath = "assets/sprites/wuxia";
    const audioPath = "assets/audio/wuxia";
    this.load.image("wuxia-jianghu-map", "assets/maps/wuxia-jianghu-map.png");
    this.load.audio("sfx-hit", `${audioPath}/sfx-hit.wav`);
    this.load.audio("sfx-sword", `${audioPath}/sfx-sword.wav`);
    this.load.audio("sfx-level-up", `${audioPath}/sfx-level-up.wav`);
    this.load.audio("sfx-pickup", `${audioPath}/sfx-pickup.wav`);
    this.load.audio("sfx-heal", `${audioPath}/sfx-heal.wav`);
    this.load.audio("sfx-hurt", `${audioPath}/sfx-hurt.wav`);
    this.load.audio("sfx-boss", `${audioPath}/sfx-boss.wav`);
    this.load.audio("sfx-evolution", `${audioPath}/sfx-evolution.wav`);
    this.loadGeneratedUpgradeIcons();
    this.loadEnemyAndBossSprites(basePath);
    this.load.image("player", `${basePath}/hero-linghu.png`);
    this.load.image("enemy-purple", `${basePath}/enemy-purple.png`);
    this.load.image("enemy-red", `${basePath}/enemy-red.png`);
    this.load.image("enemy-green", `${basePath}/enemy-green.png`);
    this.load.image("boss-master", `${basePath}/boss-master.png`);
    this.load.image("bolt", `${basePath}/sword-qi.png`);
    this.load.image("blade", `${basePath}/orbit-swords.png`);
    this.load.image("palm-wave", `${basePath}/palm-wave.png`);
    this.load.image("strike", `${basePath}/sword-flash.png`);
    this.load.image("star-vortex", `${basePath}/star-vortex.png`);
    this.load.image("gem", `${basePath}/jade-gem.png`);
    this.load.image("heart", `${basePath}/wine-gourd.png`);
  }

  private loadEnemyAndBossSprites(basePath: string): void {
    const spriteKeys = [
      "enemy-huashan",
      "enemy-hengshan",
      "enemy-taishan",
      "enemy-river-bandit",
      "enemy-medicine-heretic",
      "enemy-sun-moon",
      "enemy-royal-guard",
      "enemy-wudang",
      "enemy-shaolin",
      "enemy-emei",
      "enemy-beggar",
      "enemy-northern-rider",
      "enemy-poison-cult",
      "boss-rival-captain",
      "boss-renegade-master",
      "boss-grand-elder",
      "boss-demonic-overlord",
      "boss-eastern-invincible"
    ];

    for (const key of spriteKeys) {
      this.load.image(key, `${basePath}/${key}.png`);
    }
  }

  private loadGeneratedUpgradeIcons(): void {
    const iconPath = "assets/icons/wuxia";
    const iconKeys = [
      "icon-damage",
      "icon-cooldown",
      "icon-speed",
      "icon-pickup",
      "icon-heal",
      "icon-weapon-bolt",
      "icon-weapon-blade",
      "icon-weapon-palm-wave",
      "icon-weapon-strike",
      "icon-weapon-star-vortex",
      "icon-blossom-blade",
      "icon-gale-sword",
      "icon-taiyue-peak",
      "icon-cold-pond-sword",
      "icon-vajra-fist",
      "icon-dugu-sword",
      "icon-star-absorption",
      "icon-huashan-footwork",
      "icon-wine-heart",
      "icon-zixia-skill",
      "icon-wind-step",
      "icon-hunyuan-qi",
      "icon-ice-heart",
      "icon-vajra-skill",
      "icon-yijin-manual",
      "icon-cosmos-breathing",
      "icon-formless-sutra",
      "icon-marrow-cleansing",
      "icon-freewind-method",
      "icon-evolution-dugu",
      "icon-evolution-wind-array",
      "icon-evolution-star-palm",
      "icon-evolution-drunken-sword",
      "icon-evolution-star-field",
      "icon-evolution-violet-blossom",
      "icon-evolution-gale",
      "icon-evolution-taiyue",
      "icon-evolution-cold-pond",
      "icon-evolution-vajra",
      "icon-build-sword",
      "icon-build-qi",
      "icon-build-footwork",
      "icon-build-wine"
    ];

    for (const key of iconKeys) {
      this.load.image(key, `${iconPath}/${key}.png`);
    }
  }

  create(): void {
    this.createFallbackTextures();
    this.configureTextureFilters();
    this.scene.start("MenuScene");
  }

  private configureTextureFilters(): void {
    const smoothTextureKeys = [
      "wuxia-jianghu-map",
      "player",
      "enemy-purple",
      "enemy-red",
      "enemy-green",
      "enemy-huashan",
      "enemy-hengshan",
      "enemy-taishan",
      "enemy-river-bandit",
      "enemy-medicine-heretic",
      "enemy-sun-moon",
      "enemy-royal-guard",
      "enemy-wudang",
      "enemy-shaolin",
      "enemy-emei",
      "enemy-beggar",
      "enemy-northern-rider",
      "enemy-poison-cult",
      "boss-master",
      "boss-rival-captain",
      "boss-renegade-master",
      "boss-grand-elder",
      "boss-demonic-overlord",
      "boss-eastern-invincible",
      "bolt",
      "blade",
      "palm-wave",
      "strike",
      "gem",
      "heart",
      "star-vortex"
    ];

    for (const key of smoothTextureKeys) {
      if (this.textures.exists(key)) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }
  }

  private createFallbackTextures(): void {
    this.createUpgradeIcons();

    if (!this.textures.exists("player")) {
      this.createHeroTexture();
    }
    if (!this.textures.exists("enemy-purple")) {
      this.createEnemyFigureTexture("enemy-purple", 0xd17de8, 0xff73d2, "dagger");
    }
    if (!this.textures.exists("enemy-red")) {
      this.createEnemyFigureTexture("enemy-red", 0xc0a46b, 0xff8f70, "hammer");
    }
    if (!this.textures.exists("enemy-green")) {
      this.createEnemyFigureTexture("enemy-green", 0x61d394, 0x92f5bd, "dagger");
    }
    this.createEnemyFigureTexture("enemy-huashan", 0x9ee7ff, 0xf7efd8, "sword");
    this.createEnemyFigureTexture("enemy-hengshan", 0xb8f7ff, 0xffffff, "staff");
    this.createEnemyFigureTexture("enemy-taishan", 0xd9b45f, 0x5f4a2a, "saber");
    this.createEnemyFigureTexture("enemy-river-bandit", 0xb9824d, 0x84f7b2, "axe");
    this.createEnemyFigureTexture("enemy-medicine-heretic", 0x84f7b2, 0xcaff6e, "bottle");
    this.createEnemyFigureTexture("enemy-sun-moon", 0x2b2036, 0xff73d2, "crescent");
    this.createEnemyFigureTexture("enemy-royal-guard", 0x27415f, 0xffd36a, "spear");
    this.createEnemyFigureTexture("enemy-wudang", 0x7ec8e3, 0xf7efd8, "fan");
    this.createEnemyFigureTexture("enemy-shaolin", 0xffb347, 0xf7efd8, "fist");
    this.createEnemyFigureTexture("enemy-emei", 0xf4b8ff, 0xffffff, "needle");
    this.createEnemyFigureTexture("enemy-beggar", 0x8b7355, 0xd4a574, "club");
    this.createEnemyFigureTexture("enemy-northern-rider", 0xc67b4e, 0xffd36a, "whip");
    this.createEnemyFigureTexture("enemy-poison-cult", 0x2a3a1f, 0x6ecf4a, "vial");
    if (!this.textures.exists("boss-master")) {
      this.createCircleTexture("boss-master", 64, 0xff4f64, 0x2b2036);
    }
    this.createBossFigureTexture("boss-rival-captain", 0xff8f70, 0xffd36a, "banner");
    this.createBossFigureTexture("boss-renegade-master", 0xff4f64, 0x2b2036, "sleeves");
    this.createBossFigureTexture("boss-grand-elder", 0xf7efd8, 0xd9b45f, "elderSword");
    this.createBossFigureTexture("boss-demonic-overlord", 0x2b2036, 0xb86bff, "aura");
    this.createBossFigureTexture("boss-eastern-invincible", 0xff2f86, 0xf7efd8, "needleFan");
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
    if (!this.textures.exists("star-vortex")) {
      this.createVortexTexture();
    }
  }

  private createUpgradeIcons(): void {
    this.createSwordGlyph("icon-damage", 0xf7c66b, 0x5a2330);
    this.createSwirlGlyph("icon-cooldown", 0x8ff4ff, 0x26354f);
    this.createStepGlyph("icon-speed", 0x92f5bd, 0x1d4d42);
    this.createGemGlyph("icon-pickup", 0x84f7b2, 0x203f45);
    this.createHeartGlyph("icon-heal", 0xff8fa3, 0x5a2330);

    this.createSwordGlyph("icon-dugu-sword", 0xfff1a1, 0x4d3144);
    this.createSwirlGlyph("icon-star-absorption", 0xb86bff, 0x1e243d);
    this.createStepGlyph("icon-huashan-footwork", 0xb8f7ff, 0x23415a);
    this.createGourdGlyph("icon-wine-heart", 0xf7a55f, 0x4d2634);
    this.createSwordGlyph("icon-zixia-skill", 0xd5a3ff, 0x332449);
    this.createStepGlyph("icon-wind-step", 0xa8f4d0, 0x1f4238);
    this.createSwirlGlyph("icon-hunyuan-qi", 0xf7c66b, 0x3f3520);
    this.createSwirlGlyph("icon-ice-heart", 0xb8f7ff, 0x20384a);
    this.createHeartGlyph("icon-vajra-skill", 0xffd36a, 0x4a2f20);
    this.createSwordGlyph("icon-blossom-blade", 0xffb7d5, 0x432238);
    this.createSwordGlyph("icon-gale-sword", 0xb8ffd8, 0x1f4238);
    this.createSwordGlyph("icon-taiyue-peak", 0xffd36a, 0x403421);
    this.createSwordGlyph("icon-cold-pond-sword", 0xb8f7ff, 0x1f384a);
    this.createHeartGlyph("icon-vajra-fist", 0xffd36a, 0x4a2f20);

    this.createHeartGlyph("icon-yijin-manual", 0xffd36a, 0x402b24);
    this.createSwirlGlyph("icon-cosmos-breathing", 0x8ff4ff, 0x1e3142);
    this.createSwirlGlyph("icon-formless-sutra", 0xd8e2eb, 0x2b2f3d);
    this.createHeartGlyph("icon-marrow-cleansing", 0xff8fa3, 0x3f2532);
    this.createStepGlyph("icon-freewind-method", 0xb8ffd8, 0x1f4238);

    this.createSwordGlyph("icon-evolution-dugu", 0xffe09a, 0x4a2d18);
    this.createSwordGlyph("icon-evolution-wind-array", 0xffe09a, 0x3d321d);
    this.createHeartGlyph("icon-evolution-star-palm", 0xffe09a, 0x3d2234);
    this.createSwordGlyph("icon-evolution-drunken-sword", 0xffe09a, 0x4d2634);
    this.createSwirlGlyph("icon-evolution-star-field", 0xffe09a, 0x332449);
    this.createSwordGlyph("icon-evolution-violet-blossom", 0xffe09a, 0x432238);
    this.createSwordGlyph("icon-evolution-gale", 0xffe09a, 0x243d34);
    this.createSwordGlyph("icon-evolution-taiyue", 0xffe09a, 0x403421);
    this.createSwordGlyph("icon-evolution-cold-pond", 0xffe09a, 0x20384a);
    this.createHeartGlyph("icon-evolution-vajra", 0xffe09a, 0x4a2f20);

    this.createSwordGlyph("icon-build-sword", 0xf7c66b, 0x2f2636);
    this.createSwirlGlyph("icon-build-qi", 0x8ff4ff, 0x22384b);
    this.createStepGlyph("icon-build-footwork", 0x92f5bd, 0x203d35);
    this.createGourdGlyph("icon-build-wine", 0xf7a55f, 0x4d2634);
    this.createSectGlyph("icon-upgrade-default", 0xd8e2eb, 0x2b2036, "武");
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

  private createEnemyFigureTexture(
    key: string,
    robe: number,
    accent: number,
    weapon: "sword" | "staff" | "saber" | "axe" | "bottle" | "crescent" | "spear" | "dagger" | "hammer" | "fan" | "fist" | "needle" | "club" | "whip" | "vial"
  ): void {
    if (this.textures.exists(key)) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0x080912, 0);
    graphics.fillRect(0, 0, 56, 56);
    graphics.fillStyle(robe, 0.96);
    graphics.lineStyle(3, 0x171522, 0.92);
    graphics.fillCircle(28, 13, 8);
    graphics.strokeCircle(28, 13, 8);
    graphics.fillTriangle(18, 22, 38, 22, 44, 46);
    graphics.fillTriangle(18, 22, 12, 46, 44, 46);
    graphics.strokeTriangle(18, 22, 38, 22, 44, 46);
    graphics.lineStyle(4, accent, 0.95);
    graphics.lineBetween(20, 29, 36, 29);
    graphics.lineStyle(3, accent, 1);

    switch (weapon) {
      case "sword":
        graphics.lineBetween(37, 20, 52, 5);
        graphics.lineStyle(1, 0xffffff, 0.9);
        graphics.lineBetween(40, 18, 51, 7);
        break;
      case "staff":
        graphics.lineBetween(14, 10, 42, 46);
        graphics.fillStyle(accent, 0.9);
        graphics.fillCircle(14, 10, 2.5);
        break;
      case "saber":
        graphics.beginPath();
        graphics.moveTo(38, 17);
        graphics.lineTo(50, 26);
        graphics.lineTo(40, 35);
        graphics.strokePath();
        break;
      case "axe":
        graphics.lineBetween(13, 17, 42, 45);
        graphics.fillStyle(accent, 0.92);
        graphics.fillTriangle(11, 15, 23, 17, 15, 27);
        break;
      case "bottle":
        graphics.fillStyle(accent, 0.92);
        graphics.fillRoundedRect(39, 26, 8, 14, 3);
        graphics.fillRect(41, 21, 4, 7);
        break;
      case "crescent":
        graphics.strokeCircle(41, 20, 9);
        graphics.lineStyle(4, 0x080912, 1);
        graphics.strokeCircle(45, 17, 9);
        break;
      case "spear":
        graphics.lineBetween(40, 10, 40, 42);
        graphics.fillStyle(accent, 0.96);
        graphics.fillTriangle(40, 8, 36, 16, 44, 16);
        break;
      case "dagger":
        graphics.lineBetween(38, 18, 50, 8);
        graphics.fillStyle(accent, 0.92);
        graphics.fillTriangle(50, 6, 54, 10, 48, 12);
        break;
      case "hammer":
        graphics.lineBetween(16, 22, 40, 42);
        graphics.fillStyle(accent, 0.94);
        graphics.fillRect(12, 16, 10, 7);
        break;
      case "fan":
        graphics.beginPath();
        graphics.moveTo(36, 18);
        graphics.lineTo(52, 12);
        graphics.lineTo(50, 28);
        graphics.lineTo(34, 30);
        graphics.closePath();
        graphics.strokePath();
        break;
      case "fist":
        graphics.fillStyle(accent, 0.94);
        graphics.fillCircle(38, 18, 3.5);
        graphics.fillCircle(44, 22, 3.5);
        break;
      case "needle":
        graphics.lineBetween(36, 24, 52, 10);
        graphics.lineStyle(1, 0xffffff, 0.85);
        graphics.lineBetween(38, 22, 50, 12);
        break;
      case "club":
        graphics.lineBetween(14, 14, 38, 44);
        graphics.fillStyle(accent, 0.94);
        graphics.fillCircle(14, 12, 4.5);
        break;
      case "whip":
        graphics.lineBetween(38, 16, 46, 10);
        graphics.lineBetween(46, 10, 50, 22);
        graphics.lineBetween(50, 22, 48, 34);
        break;
      case "vial":
        graphics.fillStyle(accent, 0.94);
        graphics.fillRoundedRect(40, 24, 7, 12, 2);
        graphics.fillRect(42, 20, 3, 6);
        graphics.fillCircle(43, 38, 2);
        break;
    }

    graphics.generateTexture(key, 56, 56);
    graphics.destroy();
  }

  private createBossFigureTexture(
    key: string,
    robe: number,
    accent: number,
    style: "banner" | "sleeves" | "elderSword" | "aura" | "needleFan"
  ): void {
    if (this.textures.exists(key)) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0x080912, 0);
    graphics.fillRect(0, 0, 96, 96);
    graphics.lineStyle(4, accent, 0.38);
    graphics.strokeCircle(48, 52, 36);
    graphics.fillStyle(robe, 0.98);
    graphics.lineStyle(4, 0x171522, 0.94);
    graphics.fillCircle(48, 22, 13);
    graphics.strokeCircle(48, 22, 13);
    graphics.fillTriangle(30, 40, 66, 40, 74, 82);
    graphics.fillTriangle(30, 40, 22, 82, 74, 82);
    graphics.strokeTriangle(30, 40, 66, 40, 74, 82);
    graphics.lineStyle(5, accent, 0.96);
    graphics.lineBetween(32, 52, 64, 52);

    switch (style) {
      case "banner":
        graphics.lineBetween(68, 16, 68, 76);
        graphics.fillStyle(accent, 0.85);
        graphics.fillTriangle(70, 18, 88, 26, 70, 34);
        graphics.lineStyle(4, 0xf7efd8, 0.9);
        graphics.lineBetween(30, 34, 12, 52);
        break;
      case "sleeves":
        graphics.lineStyle(9, accent, 0.9);
        graphics.lineBetween(24, 42, 8, 62);
        graphics.lineBetween(72, 42, 88, 62);
        graphics.lineStyle(3, 0xffffff, 0.5);
        graphics.lineBetween(18, 49, 10, 60);
        break;
      case "elderSword":
        graphics.lineStyle(5, accent, 1);
        graphics.lineBetween(23, 75, 78, 20);
        graphics.lineStyle(2, 0xffffff, 0.86);
        graphics.lineBetween(28, 70, 76, 22);
        graphics.fillStyle(0xf7efd8, 0.95);
        graphics.fillTriangle(43, 33, 53, 33, 48, 48);
        break;
      case "aura":
        graphics.lineStyle(6, accent, 0.66);
        graphics.strokeCircle(48, 52, 42);
        graphics.lineStyle(3, 0xff73d2, 0.85);
        graphics.beginPath();
        graphics.moveTo(18, 74);
        graphics.lineTo(29, 58);
        graphics.lineTo(20, 46);
        graphics.lineTo(36, 34);
        graphics.strokePath();
        break;
      case "needleFan":
        graphics.lineStyle(3, accent, 0.95);
        for (let i = 0; i < 7; i += 1) {
          graphics.lineBetween(51, 40, 70 + i * 3, 24 + i * 7);
        }
        graphics.fillStyle(0xf7efd8, 0.85);
        graphics.fillCircle(51, 40, 4);
        break;
    }

    graphics.generateTexture(key, 96, 96);
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

  private createIconBase(key: string, accent: number, base: number): Phaser.GameObjects.Graphics {
    if (this.textures.exists(key)) {
      return this.add.graphics().setVisible(false);
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(base, 1);
    graphics.fillRoundedRect(0, 0, 64, 64, 12);
    graphics.lineStyle(3, accent, 0.95);
    graphics.strokeRoundedRect(4, 4, 56, 56, 10);
    graphics.fillStyle(0xffffff, 0.08);
    graphics.fillCircle(50, 14, 16);
    return graphics;
  }

  private finishIcon(key: string, graphics: Phaser.GameObjects.Graphics): void {
    if (!this.textures.exists(key)) {
      graphics.generateTexture(key, 64, 64);
    }
    graphics.destroy();
  }

  private createSwordGlyph(key: string, accent: number, base: number): void {
    const graphics = this.createIconBase(key, accent, base);
    graphics.lineStyle(5, accent, 1);
    graphics.lineBetween(18, 48, 46, 16);
    graphics.lineStyle(2, 0xffffff, 0.9);
    graphics.lineBetween(21, 45, 43, 19);
    graphics.fillStyle(0xf7efd8, 1);
    graphics.fillTriangle(44, 14, 51, 9, 49, 19);
    graphics.lineStyle(4, 0xf7efd8, 1);
    graphics.lineBetween(14, 50, 24, 40);
    this.finishIcon(key, graphics);
  }

  private createSwirlGlyph(key: string, accent: number, base: number): void {
    const graphics = this.createIconBase(key, accent, base);
    graphics.lineStyle(5, accent, 0.9);
    graphics.strokeCircle(32, 32, 18);
    graphics.lineStyle(4, 0xffffff, 0.72);
    graphics.beginPath();
    for (let i = 0; i < 22; i += 1) {
      const angle = i * 0.54;
      const radius = 4 + i * 0.78;
      const x = 32 + Math.cos(angle) * radius;
      const y = 32 + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.strokePath();
    this.finishIcon(key, graphics);
  }

  private createStepGlyph(key: string, accent: number, base: number): void {
    const graphics = this.createIconBase(key, accent, base);
    graphics.lineStyle(5, accent, 0.95);
    graphics.beginPath();
    graphics.moveTo(12, 42);
    graphics.lineTo(20, 35);
    graphics.lineTo(29, 33);
    graphics.lineTo(38, 39);
    graphics.lineTo(47, 34);
    graphics.lineTo(54, 26);
    graphics.strokePath();
    graphics.fillStyle(0xffffff, 0.86);
    graphics.fillCircle(22, 43, 4);
    graphics.fillCircle(38, 36, 4);
    graphics.fillCircle(50, 25, 4);
    this.finishIcon(key, graphics);
  }

  private createGemGlyph(key: string, accent: number, base: number): void {
    const graphics = this.createIconBase(key, accent, base);
    graphics.fillStyle(accent, 0.95);
    graphics.lineStyle(3, 0xffffff, 0.72);
    graphics.beginPath();
    graphics.moveTo(32, 12);
    graphics.lineTo(48, 29);
    graphics.lineTo(32, 52);
    graphics.lineTo(16, 29);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    this.finishIcon(key, graphics);
  }

  private createHeartGlyph(key: string, accent: number, base: number): void {
    const graphics = this.createIconBase(key, accent, base);
    graphics.fillStyle(accent, 0.95);
    graphics.fillCircle(25, 25, 10);
    graphics.fillCircle(39, 25, 10);
    graphics.beginPath();
    graphics.moveTo(16, 31);
    graphics.lineTo(32, 50);
    graphics.lineTo(48, 31);
    graphics.closePath();
    graphics.fillPath();
    this.finishIcon(key, graphics);
  }

  private createGourdGlyph(key: string, accent: number, base: number): void {
    const graphics = this.createIconBase(key, accent, base);
    graphics.fillStyle(accent, 0.96);
    graphics.lineStyle(3, 0xf7efd8, 0.88);
    graphics.fillEllipse(32, 24, 19, 22);
    graphics.fillEllipse(32, 42, 25, 27);
    graphics.strokeEllipse(32, 24, 19, 22);
    graphics.strokeEllipse(32, 42, 25, 27);
    graphics.lineStyle(4, 0x3a1e24, 1);
    graphics.lineBetween(25, 13, 39, 13);
    this.finishIcon(key, graphics);
  }

  private createSectGlyph(key: string, accent: number, base: number, glyph: string): void {
    const graphics = this.createIconBase(key, accent, base);
    graphics.fillStyle(accent, 0.15);
    graphics.fillCircle(32, 32, 19);
    this.finishIcon(key, graphics);

    const text = this.add
      .text(32, 31, glyph, {
        fontFamily: "Microsoft JhengHei, Noto Sans TC, Arial, sans-serif",
        fontSize: "26px",
        color: Phaser.Display.Color.IntegerToColor(accent).rgba,
        fontStyle: "700"
      })
      .setOrigin(0.5);
    const renderTexture = this.add.renderTexture(0, 0, 64, 64);
    renderTexture.draw(key, 0, 0);
    renderTexture.draw(text);
    this.textures.remove(key);
    renderTexture.saveTexture(key);
    text.destroy();
    renderTexture.destroy();
  }

  private createVortexTexture(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(5, 0x8ff4ff, 0.8);
    graphics.strokeCircle(96, 96, 74);
    graphics.lineStyle(4, 0xb86bff, 0.72);
    graphics.beginPath();
    for (let i = 0; i < 42; i += 1) {
      const angle = i * 0.48;
      const radius = 12 + i * 1.6;
      const x = 96 + Math.cos(angle) * radius;
      const y = 96 + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.strokePath();
    graphics.generateTexture("star-vortex", 192, 192);
    graphics.destroy();
  }
}
