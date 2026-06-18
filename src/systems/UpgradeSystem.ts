import Phaser from "phaser";
import { buildUpgradePool, type UpgradeOption } from "../data/upgrades";
import type { GameState } from "../game/GameState";
import { shuffle } from "../utils/random";

export class UpgradeSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly state: GameState
  ) {}

  open(): void {
    if (this.state.pausedForUpgrade) {
      return;
    }
    this.state.pausedForUpgrade = true;
    this.scene.physics.world.pause();
    this.scene.scene.get("UIScene").events.emit("pause-changed", false);
    const options = shuffle(buildUpgradePool(this.state)).slice(0, 3);
    this.scene.scene.get("UIScene").events.emit("show-upgrades", options);
  }

  apply(option: UpgradeOption): void {
    option.apply(this.state);
    this.state.pausedForUpgrade = false;
    this.scene.physics.world.resume();
    this.scene.scene.get("UIScene").events.emit("hide-upgrades");
  }
}
