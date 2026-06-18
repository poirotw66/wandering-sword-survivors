import Phaser from "phaser";
import type { Player } from "../entities/Player";

export class PlayerSystem {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<"w" | "a" | "s" | "d", Phaser.Input.Keyboard.Key>;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player
  ) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = {
      w: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  update(): void {
    const x =
      Number(this.cursors.right.isDown || this.keys.d.isDown) -
      Number(this.cursors.left.isDown || this.keys.a.isDown);
    const y =
      Number(this.cursors.down.isDown || this.keys.s.isDown) -
      Number(this.cursors.up.isDown || this.keys.w.isDown);
    const direction = new Phaser.Math.Vector2(x, y).normalize();
    this.player.setVelocity(
      direction.x * this.player.stats.moveSpeed,
      direction.y * this.player.stats.moveSpeed
    );

    if (direction.lengthSq() > 0) {
      this.player.setRotation(direction.angle());
    }

    this.scene.cameras.main.centerOn(this.player.x, this.player.y);
  }
}
