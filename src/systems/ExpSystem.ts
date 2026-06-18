import Phaser from "phaser";
import { ExpGem } from "../entities/ExpGem";
import type { Player } from "../entities/Player";
import type { GameState } from "../game/GameState";

export class ExpSystem {
  readonly gems: Phaser.Physics.Arcade.Group;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly state: GameState
  ) {
    this.gems = scene.physics.add.group({ classType: ExpGem, runChildUpdate: false });
  }

  drop(x: number, y: number, value: number): void {
    const gem = this.gems.get(x, y, "gem") as ExpGem | null;
    if (gem) {
      gem.spawn(x, y, value);
    } else {
      new ExpGem(this.scene, x, y, value);
    }
  }

  update(): void {
    this.gems.children.each((child) => {
      const gem = child as ExpGem;
      if (!gem.active) {
        return true;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, gem.x, gem.y);
      if (distance <= this.player.stats.pickupRange) {
        this.scene.physics.moveToObject(gem, this.player, 360);
      }
      return true;
    });
  }

  collect(gem: ExpGem): void {
    this.state.exp += gem.value;
    gem.setActive(false);
    gem.setVisible(false);
    gem.setVelocity(0, 0);

    while (this.state.exp >= this.state.expToNext) {
      this.state.exp -= this.state.expToNext;
      this.state.level += 1;
      this.state.expToNext = Math.floor(8 + this.state.level * 5 + this.state.level ** 1.35);
      this.scene.events.emit("level-up");
    }
  }
}
