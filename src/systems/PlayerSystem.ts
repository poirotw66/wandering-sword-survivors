import Phaser from "phaser";
import type { Player } from "../entities/Player";

export class PlayerSystem {
  private static readonly ACCELERATION = 1650;
  private static readonly DECELERATION = 2200;
  private static readonly TURN_LERP = 0.24;
  private static readonly CAMERA_LERP = 0.16;

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
      const targetVelocity = direction.scale(this.player.stats.moveSpeed);
      const maxStep = PlayerSystem.ACCELERATION * deltaSeconds;
      const nextVelocity = velocity.lerp(targetVelocity, Math.min(1, maxStep / Math.max(1, velocity.distance(targetVelocity))));
      this.player.setVelocity(nextVelocity.x, nextVelocity.y);
      this.player.rotation = Phaser.Math.Angle.RotateTo(
        this.player.rotation,
        direction.angle(),
        PlayerSystem.TURN_LERP
      );
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

    const camera = this.scene.cameras.main;
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, this.player.x - camera.width / 2, PlayerSystem.CAMERA_LERP);
    camera.scrollY = Phaser.Math.Linear(camera.scrollY, this.player.y - camera.height / 2, PlayerSystem.CAMERA_LERP);
  }
}
