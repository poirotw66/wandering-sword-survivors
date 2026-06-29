import Phaser from "phaser";

const BASE_RADIUS = 56;
const THUMB_RADIUS = 24;

export class VirtualJoystick {
  private readonly base: Phaser.GameObjects.Arc;
  private readonly thumb: Phaser.GameObjects.Arc;
  private readonly vector = new Phaser.Math.Vector2(0, 0);
  private pointerId: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly onChange: (x: number, y: number) => void
  ) {
    const depth = 810;
    this.base = scene.add
      .circle(x, y, BASE_RADIUS, 0x0a1018, 0.42)
      .setStrokeStyle(2, 0x5f6f84, 0.55)
      .setScrollFactor(0)
      .setDepth(depth);
    this.thumb = scene.add
      .circle(x, y, THUMB_RADIUS, 0xd8e2eb, 0.55)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    scene.input.on("pointerdown", this.handlePointerDown, this);
    scene.input.on("pointermove", this.handlePointerMove, this);
    scene.input.on("pointerup", this.handlePointerUp, this);
    scene.input.on("pointerupoutside", this.handlePointerUp, this);
  }

  setPosition(x: number, y: number): void {
    this.base.setPosition(x, y);
    if (this.pointerId === null) {
      this.thumb.setPosition(x, y);
    }
  }

  destroy(): void {
    this.scene.input.off("pointerdown", this.handlePointerDown, this);
    this.scene.input.off("pointermove", this.handlePointerMove, this);
    this.scene.input.off("pointerup", this.handlePointerUp, this);
    this.scene.input.off("pointerupoutside", this.handlePointerUp, this);
    this.base.destroy();
    this.thumb.destroy();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== null || !pointer.isDown) {
      return;
    }
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.base.x, this.base.y);
    if (distance > BASE_RADIUS * 1.35) {
      return;
    }
    this.pointerId = pointer.id;
    this.updateThumb(pointer.x, pointer.y);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) {
      return;
    }
    this.updateThumb(pointer.x, pointer.y);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) {
      return;
    }
    this.pointerId = null;
    this.vector.set(0, 0);
    this.thumb.setPosition(this.base.x, this.base.y);
    this.onChange(0, 0);
  }

  private updateThumb(x: number, y: number): void {
    const offset = new Phaser.Math.Vector2(x - this.base.x, y - this.base.y);
    const maxDistance = BASE_RADIUS - THUMB_RADIUS;
    if (offset.length() > maxDistance) {
      offset.setLength(maxDistance);
    }
    this.thumb.setPosition(this.base.x + offset.x, this.base.y + offset.y);
    this.vector.copy(offset).scale(1 / maxDistance);
    this.onChange(this.vector.x, this.vector.y);
  }
}
