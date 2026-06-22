import Phaser from "phaser";
import type { Player } from "../entities/Player";

export class PlayerSystem {
  private static readonly ACCELERATION = 2400;
  private static readonly DECELERATION = 3000;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<"w" | "a" | "s" | "d", Phaser.Input.Keyboard.Key>;

  constructor(
    scene: Phaser.Scene,
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

  update(deltaMs: number): void {
    const x =
      Number(this.cursors.right.isDown || this.keys.d.isDown) -
      Number(this.cursors.left.isDown || this.keys.a.isDown);
    const y =
      Number(this.cursors.down.isDown || this.keys.s.isDown) -
      Number(this.cursors.up.isDown || this.keys.w.isDown);
    const direction = new Phaser.Math.Vector2(x, y).normalize();
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const deltaSeconds = Math.min(deltaMs / 1000, 0.05);
    const velocity = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y);

    if (direction.lengthSq() > 0) {
      const targetVelocity = direction.clone().scale(this.player.stats.moveSpeed);
      const toTarget = targetVelocity.clone().subtract(velocity);
      const maxStep = PlayerSystem.ACCELERATION * deltaSeconds;
      const nextVelocity =
        toTarget.length() <= maxStep ? targetVelocity : velocity.add(toTarget.normalize().scale(maxStep));
      this.player.setVelocity(nextVelocity.x, nextVelocity.y);
      this.player.setFlipX(direction.x < -0.05);
    } else {
      const speed = velocity.length();
      const nextSpeed = Math.max(0, speed - PlayerSystem.DECELERATION * deltaSeconds);
      if (nextSpeed <= 2) {
        this.player.setVelocity(0, 0);
      } else {
        velocity.setLength(nextSpeed);
        this.player.setVelocity(velocity.x, velocity.y);
      }
    }

    this.player.setRotation(0);
  }
}
