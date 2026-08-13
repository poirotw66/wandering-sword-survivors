import Phaser from "phaser";
import { isTouchDevice, joystickRadius, joystickThumbRadius, safeInset } from "../utils/display";

export class VirtualJoystick {
  private readonly base: Phaser.GameObjects.Arc;
  private readonly thumb: Phaser.GameObjects.Arc;
  private readonly vector = new Phaser.Math.Vector2(0, 0);
  private pointerId: number | null = null;
  private readonly baseRadius: number;
  private readonly thumbRadius: number;
  private readonly floating: boolean;
  private anchorX: number;
  private anchorY: number;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly onChange: (x: number, y: number) => void
  ) {
    const depth = 810;
    this.floating = isTouchDevice();
    this.baseRadius = joystickRadius();
    this.thumbRadius = joystickThumbRadius();
    this.anchorX = x;
    this.anchorY = y;
    this.base = scene.add
      .circle(x, y, this.baseRadius, 0x0a1018, this.floating ? 0 : 0.42)
      .setStrokeStyle(2, 0x5f6f84, this.floating ? 0 : 0.55)
      .setScrollFactor(0)
      .setDepth(depth)
      .setVisible(!this.floating);
    this.thumb = scene.add
      .circle(x, y, this.thumbRadius, 0xd8e2eb, this.floating ? 0 : 0.55)
      .setScrollFactor(0)
      .setDepth(depth + 1)
      .setVisible(!this.floating);

    scene.input.on("pointerdown", this.handlePointerDown, this);
    scene.input.on("pointermove", this.handlePointerMove, this);
    scene.input.on("pointerup", this.handlePointerUp, this);
    scene.input.on("pointerupoutside", this.handlePointerUp, this);
  }

  setPosition(x: number, y: number): void {
    this.anchorX = x;
    this.anchorY = y;
    if (this.pointerId === null) {
      this.base.setPosition(x, y);
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

    if (this.floating) {
      if (!this.isFloatingZone(pointer.x, pointer.y)) {
        return;
      }
      this.showAt(pointer.x, pointer.y);
    } else {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.base.x, this.base.y);
      if (distance > this.baseRadius * 1.35) {
        return;
      }
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
    this.onChange(0, 0);
    if (this.floating) {
      this.hide();
      return;
    }
    this.thumb.setPosition(this.base.x, this.base.y);
  }

  private isFloatingZone(x: number, y: number): boolean {
    const { width, height } = this.scene.scale;
    const topGuard = 120 + safeInset("top");
    const bottomGuard = height - safeInset("bottom") - 24;
    if (y < topGuard || y > bottomGuard) {
      return false;
    }
    return x <= width * 0.58;
  }

  private showAt(x: number, y: number): void {
    const { width, height } = this.scene.scale;
    const insetLeft = safeInset("left");
    const insetRight = safeInset("right");
    const insetBottom = safeInset("bottom");
    const clampedX = Phaser.Math.Clamp(x, insetLeft + this.baseRadius + 8, width - insetRight - this.baseRadius - 8);
    const clampedY = Phaser.Math.Clamp(
      y,
      120 + safeInset("top") + this.baseRadius,
      height - insetBottom - this.baseRadius - 8
    );
    this.base.setPosition(clampedX, clampedY).setVisible(true).setAlpha(0.42);
    this.thumb.setPosition(clampedX, clampedY).setVisible(true).setAlpha(0.55);
  }

  private hide(): void {
    this.base.setVisible(false).setAlpha(0.42);
    this.thumb.setVisible(false).setAlpha(0.55);
    this.base.setPosition(this.anchorX, this.anchorY);
    this.thumb.setPosition(this.anchorX, this.anchorY);
  }

  private updateThumb(x: number, y: number): void {
    const offset = new Phaser.Math.Vector2(x - this.base.x, y - this.base.y);
    const maxDistance = this.baseRadius - this.thumbRadius;
    if (offset.length() > maxDistance) {
      offset.setLength(maxDistance);
    }
    this.thumb.setPosition(this.base.x + offset.x, this.base.y + offset.y);
    this.vector.copy(offset).scale(1 / maxDistance);
    this.onChange(this.vector.x, this.vector.y);
  }
}
