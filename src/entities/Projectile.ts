import Phaser from "phaser";
import type { WeaponId } from "../data/weapons";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  weaponId: WeaponId = "magicBolt";
  damage = 1;
  pierceLeft = 1;
  expiresAt = 0;
  hitIds = new Set<Phaser.GameObjects.GameObject>();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bolt");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(14);
  }

  fire(options: {
    weaponId: WeaponId;
    x: number;
    y: number;
    damage: number;
    pierce: number;
    velocityX: number;
    velocityY: number;
    durationMs: number;
    texture?: string;
    scale?: number;
    tint?: number;
  }): void {
    this.weaponId = options.weaponId;
    this.damage = options.damage;
    this.pierceLeft = options.pierce;
    this.expiresAt = this.scene.time.now + options.durationMs;
    this.hitIds.clear();
    this.setTexture(options.texture ?? "bolt");
    this.setPosition(options.x, options.y);
    this.setScale(options.scale ?? 1);
    this.setTint(options.tint ?? 0xffffff);
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(0.96);
    this.setDepth(options.weaponId === "thunderStrike" ? 26 : 16);
    if (this.body) {
      this.body.enable = true;
    }
    this.setVelocity(options.velocityX, options.velocityY);
  }

  expire(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
  }
}
