import Phaser from "phaser";
import { ENEMY_CONFIGS, type EnemyConfig, type EnemyId } from "../data/enemies";
import { eliteTraitFor } from "../data/eliteTraits";
import { t } from "../i18n";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  enemyId: EnemyId = "slime";
  hp = 1;
  maxHp = 1;
  config: EnemyConfig = ENEMY_CONFIGS.slime;
  isElite = false;
  moveSpeedMultiplier = 1;
  damageMultiplier = 1;
  rewardMultiplier = 1;
  private hpBarBg?: Phaser.GameObjects.Rectangle;
  private hpBarFill?: Phaser.GameObjects.Rectangle;
  private eliteMarker?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyId: EnemyId) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.spawn(enemyId, x, y);
  }

  spawn(enemyId: EnemyId, x: number, y: number): void {
    this.spawnAs(enemyId, x, y, false);
  }

  spawnAs(enemyId: EnemyId, x: number, y: number, elite: boolean, difficulty = { hp: 1, damage: 1, speed: 1, reward: 1 }): void {
    this.enemyId = enemyId;
    this.config = ENEMY_CONFIGS[enemyId];
    this.isElite = !this.config.isBoss && elite;
    this.moveSpeedMultiplier = difficulty.speed;
    this.damageMultiplier = difficulty.damage;
    this.rewardMultiplier = difficulty.reward;
    const eliteMultiplier = this.isElite ? eliteTraitFor(enemyId).hpMultiplier : 1;
    this.hp = Math.floor(this.config.hp * eliteMultiplier * difficulty.hp);
    this.maxHp = this.hp;
    this.setTexture(this.textureFor(this.config));
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.clearTint();
    if (this.isElite) {
      this.applyEliteTrait(enemyId);
    }
    const scale = this.config.isBoss ? this.config.radius / 150 : this.config.radius / 90;
    this.setScale(this.isElite ? scale * 1.22 : scale);
    const bodyRadius = this.config.isBoss ? 95 : 74;
    this.setCircle(bodyRadius, this.width / 2 - bodyRadius, this.height / 2 - bodyRadius);
    this.setDepth(this.config.isBoss || this.isElite ? 18 : 10);
    this.ensureStatusUi();
    this.updateStatusUi();
  }

  damage(amount: number): boolean {
    this.hp -= amount;
    this.setAlpha(0.65);
    this.scene.time.delayedCall(60, () => this.active && this.setAlpha(1));
    this.updateStatusUi();
    return this.hp <= 0;
  }

  hideStatusUi(): void {
    this.hpBarBg?.setVisible(false);
    this.hpBarFill?.setVisible(false);
    this.eliteMarker?.setVisible(false);
  }

  updateStatusUi(): void {
    const shouldShow = this.active && (this.config.isBoss || this.isElite || this.hp < this.maxHp);
    this.hpBarBg?.setVisible(shouldShow);
    this.hpBarFill?.setVisible(shouldShow);
    this.eliteMarker?.setVisible(this.active && this.isElite);
    if (!shouldShow) {
      return;
    }

    const width = this.config.isBoss ? 54 : 34;
    const y = this.y - this.displayHeight / 2 - 12;
    this.hpBarBg?.setPosition(this.x, y).setSize(width, 5);
    this.hpBarFill?.setPosition(this.x - width / 2, y).setSize(width * Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1), 3);
    this.eliteMarker?.setPosition(this.x, y - 14);
  }

  private ensureStatusUi(): void {
    this.hpBarBg ??= this.scene.add.rectangle(this.x, this.y, 34, 5, 0x160f18, 0.86).setDepth(45);
    this.hpBarFill ??= this.scene.add.rectangle(this.x, this.y, 34, 3, 0xff5f72, 0.95).setOrigin(0, 0.5).setDepth(46);
    this.eliteMarker ??= this.scene.add
      .text(this.x, this.y, this.eliteLabel(), {
        fontSize: "11px",
        color: "#ffe09a",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(47);
    this.eliteMarker.setText(this.eliteLabel());
  }

  private applyEliteTrait(enemyId: EnemyId): void {
    const trait = eliteTraitFor(enemyId);
    this.moveSpeedMultiplier *= trait.moveSpeedMultiplier;
    this.damageMultiplier *= trait.damageMultiplier;
    this.setTint(trait.tint);
  }

  private eliteLabel(): string {
    if (!this.isElite) {
      return t("elite");
    }
    return t(eliteTraitFor(this.enemyId).labelKey);
  }

  private textureFor(config: EnemyConfig): string {
    if (this.scene.textures.exists(config.spriteKey)) {
      return config.spriteKey;
    }
    return config.isBoss ? "boss-master" : "enemy-green";
  }
}
