import Phaser from "phaser";
import type { GameState } from "../game/GameState";
import { t } from "../i18n";
import { buildStatusReport } from "./formatPlayerStatus";
import { TITLE_FONT, UI_FONT } from "./textStyle";

export class StatusPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly backdrop: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private visible = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(940).setScrollFactor(0).setVisible(false);
    this.backdrop = scene.add.rectangle(0, 0, 10, 10, 0x050711, 0.42);
    this.panel = scene.add.rectangle(0, 0, 10, 10, 0x10182a, 0.96).setStrokeStyle(2, 0x5f7f9d, 0.9);
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
    this.container.add([this.backdrop, this.panel, this.title, this.hint, this.bodyText]);
    this.layout();
    scene.scale.on("resize", () => this.layout());
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
  }

  private layout(): void {
    const { width, height } = this.scene.scale;
    const panelWidth = Math.min(420, width - 48);
    const panelHeight = Math.min(560, height - 80);
    const x = width - panelWidth / 2 - 20;
    const y = height / 2;

    this.backdrop.setPosition(width / 2, height / 2).setSize(width, height);
    this.panel.setPosition(x, y).setSize(panelWidth, panelHeight);
    this.title.setPosition(x, y - panelHeight / 2 + 18).setOrigin(0.5, 0);
    this.hint.setPosition(x, y + panelHeight / 2 - 16).setOrigin(0.5, 1);
    this.bodyText.setPosition(x - panelWidth / 2 + 18, y - panelHeight / 2 + 58);
    this.bodyText.setWordWrapWidth(panelWidth - 36);
  }
}
