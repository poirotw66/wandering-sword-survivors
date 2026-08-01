import Phaser from "phaser";
import type { GameState } from "../game/GameState";
import { t } from "../i18n";
import { buildStatusReport } from "./formatPlayerStatus";
import { TITLE_FONT, UI_FONT } from "./textStyle";
import { isMobileCombatLayout, isTouchDevice, refreshSafeInsets, safeInset } from "../utils/display";

export class StatusPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly backdrop: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly bodyMaskShape: Phaser.GameObjects.Graphics;
  private visible = false;
  private onDismiss?: () => void;
  private bodyScrollY = 0;
  private bodyScrollMax = 0;
  private bodyBaseY = 0;
  private dragPointerId = -1;
  private dragStartY = 0;
  private dragStartScroll = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(940).setScrollFactor(0).setVisible(false);
    this.backdrop = scene.add.rectangle(0, 0, 10, 10, 0x050711, 0.55).setInteractive();
    this.panel = scene.add.rectangle(0, 0, 10, 10, 0x10182a, 0.96).setStrokeStyle(2, 0x5f7f9d, 0.9).setInteractive();
    this.title = scene.add.text(0, 0, t("statusPanelTitle"), {
      fontFamily: TITLE_FONT,
      fontSize: "24px",
      color: "#f7efd8"
    });
    this.hint = scene.add.text(0, 0, t("statusPanelHint"), {
      fontFamily: UI_FONT,
      fontSize: "13px",
      color: "#8aa0b8"
    });
    this.bodyText = scene.add.text(0, 0, "", {
      fontFamily: UI_FONT,
      fontSize: "14px",
      color: "#d8e2eb",
      lineSpacing: 5
    });
    this.bodyMaskShape = scene.make.graphics({}, false);
    this.container.add([this.backdrop, this.panel, this.title, this.hint, this.bodyText]);
    this.backdrop.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const bounds = this.panel.getBounds();
      if (!Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
        this.onDismiss?.();
      }
    });
    this.panel.on("pointerdown", (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event?: Phaser.Types.Input.EventData) => {
      event?.stopPropagation();
    });
    this.layout();
    scene.scale.on("resize", () => this.layout());
  }

  setDismissHandler(handler: () => void): void {
    this.onDismiss = handler;
  }

  toggle(state: GameState): boolean {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    if (this.visible) {
      this.refresh(state);
    }
    return this.visible;
  }

  setVisible(next: boolean, state: GameState): void {
    this.visible = next;
    this.container.setVisible(next);
    if (next) {
      this.refresh(state);
    } else {
      this.bodyScrollY = 0;
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  refresh(state: GameState): void {
    if (!this.visible) {
      return;
    }
    this.bodyText.setText(buildStatusReport(state));
    this.layout();
  }

  private layout(): void {
    refreshSafeInsets();
    const { width, height } = this.scene.scale;
    const mobile = isMobileCombatLayout(width, height);
    const insetTop = safeInset("top");
    const insetBottom = safeInset("bottom");
    const panelWidth = Math.min(mobile ? width - 24 : 420, width - (mobile ? 24 : 48));
    const panelHeight = Math.min(mobile ? height - insetTop - insetBottom - 48 : 560, height - insetTop - insetBottom - 40);
    const x = mobile ? width / 2 : width - panelWidth / 2 - 20 - safeInset("right");
    const y = height / 2;

    this.backdrop.setPosition(width / 2, height / 2).setSize(width, height);
    this.panel.setPosition(x, y).setSize(panelWidth, panelHeight);
    this.title.setPosition(x, y - panelHeight / 2 + 16).setOrigin(0.5, 0).setFontSize(mobile ? "20px" : "24px");
    this.hint
      .setText(isTouchDevice() ? t("statusPanelHintTouch") : t("statusPanelHint"))
      .setPosition(x, y + panelHeight / 2 - 14)
      .setOrigin(0.5, 1)
      .setFontSize(mobile ? "12px" : "13px");

    const bodyTop = y - panelHeight / 2 + 52;
    const bodyBottom = y + panelHeight / 2 - 36;
    const bodyHeight = Math.max(80, bodyBottom - bodyTop);
    this.bodyBaseY = bodyTop;
    this.bodyText.setPosition(x - panelWidth / 2 + 16, bodyTop - this.bodyScrollY);
    this.bodyText.setWordWrapWidth(panelWidth - 32);
    this.bodyText.setFontSize(mobile ? "13px" : "14px");

    this.bodyMaskShape.clear();
    this.bodyMaskShape.fillStyle(0xffffff);
    this.bodyMaskShape.fillRect(x - panelWidth / 2 + 12, bodyTop, panelWidth - 24, bodyHeight);
    this.bodyText.setMask(this.bodyMaskShape.createGeometryMask());
    this.bodyScrollMax = Math.max(0, this.bodyText.height - bodyHeight + 8);
    this.bodyScrollY = Phaser.Math.Clamp(this.bodyScrollY, 0, this.bodyScrollMax);
    this.bodyText.setY(this.bodyBaseY - this.bodyScrollY);

    this.scene.input.off("pointerdown", this.handleBodyPointerDown, this);
    this.scene.input.off("pointermove", this.handleBodyPointerMove, this);
    this.scene.input.off("pointerup", this.handleBodyPointerUp, this);
    this.scene.input.off("wheel", this.handleBodyWheel, this);
    if (this.visible && this.bodyScrollMax > 0) {
      this.scene.input.on("pointerdown", this.handleBodyPointerDown, this);
      this.scene.input.on("pointermove", this.handleBodyPointerMove, this);
      this.scene.input.on("pointerup", this.handleBodyPointerUp, this);
      this.scene.input.on("wheel", this.handleBodyWheel, this);
    }
  }

  private handleBodyPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.visible) {
      return;
    }
    this.dragPointerId = pointer.id;
    this.dragStartY = pointer.y;
    this.dragStartScroll = this.bodyScrollY;
  };

  private handleBodyPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.visible || pointer.id !== this.dragPointerId) {
      return;
    }
    const delta = this.dragStartY - pointer.y;
    if (Math.abs(delta) < 8) {
      return;
    }
    this.bodyScrollY = Phaser.Math.Clamp(this.dragStartScroll + delta, 0, this.bodyScrollMax);
    this.bodyText.setY(this.bodyBaseY - this.bodyScrollY);
  };

  private handleBodyPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id === this.dragPointerId) {
      this.dragPointerId = -1;
    }
  };

  private handleBodyWheel = (_pointer: Phaser.Input.Pointer, _gos: unknown, _dx: number, dy: number): void => {
    if (!this.visible || this.bodyScrollMax <= 0) {
      return;
    }
    this.bodyScrollY = Phaser.Math.Clamp(this.bodyScrollY + dy * 0.35, 0, this.bodyScrollMax);
    this.bodyText.setY(this.bodyBaseY - this.bodyScrollY);
  };
}
