import Phaser from "phaser";
import { HealthPickup } from "../entities/HealthPickup";
import type { Player } from "../entities/Player";

export class PickupSystem {
  readonly healthPickups: Phaser.Physics.Arcade.Group;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player
  ) {
    this.healthPickups = scene.physics.add.group({ classType: HealthPickup, runChildUpdate: false });
  }

  maybeDropHealth(x: number, y: number, chance: number): void {
    if (this.player.stats.hp >= this.player.stats.maxHp || Math.random() > chance) {
      return;
    }

    const pickup = this.healthPickups.get(x, y, "heart") as HealthPickup | null;
    if (pickup) {
      pickup.spawn(x, y, 12);
    } else {
      new HealthPickup(this.scene, x, y, 12);
    }
  }

  update(): void {
    this.healthPickups.children.each((child) => {
      const pickup = child as HealthPickup;
      if (!pickup.active) {
        return true;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, pickup.x, pickup.y);
      if (distance <= this.player.stats.pickupRange * 0.8) {
        this.scene.physics.moveToObject(pickup, this.player, 300);
      }
      return true;
    });
  }

  collect(pickup: HealthPickup): void {
    this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + pickup.amount);
    pickup.setActive(false);
    pickup.setVisible(false);
    pickup.setVelocity(0, 0);
    this.scene.events.emit("player-healed", pickup.amount);
  }
}
