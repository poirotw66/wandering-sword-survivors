import Phaser from "phaser";
import type { GameState } from "../game/GameState";
import {
  buildBuildPathLoadoutSlots,
  buildSkillLoadoutSlots,
  buildWeaponLoadoutSlots,
  resolveLoadoutIconKey,
  type LoadoutSlotEntry
} from "../data/loadoutEntries";
import {
  MAX_BUILD_PATH_SLOTS,
  MAX_SKILL_SLOTS,
  MAX_WEAPON_SLOTS,
  learnedBuildPathCount,
  learnedSkillCount,
  learnedWeaponCount
} from "../data/loadoutLimits";
import { t } from "../i18n";
import { TITLE_FONT } from "./textStyle";

const SLOT_SIZE = 40;
const SLOT_GAP = 4;
const ICON_SIZE = 24;
const SECTION_HEADER_HEIGHT = 24;
const SECTION_PADDING = 6;
const SECTION_GAP = 6;
const ROW_WIDTH = MAX_WEAPON_SLOTS * SLOT_SIZE + (MAX_WEAPON_SLOTS - 1) * SLOT_GAP + SECTION_PADDING * 2;

type SlotTheme = {
  accent: number;
  accentDim: number;
  fill: number;
  fillEmpty: number;
  headerColor: string;
  sealBg: string;
  sealColor: string;
};

const WEAPON_THEME: SlotTheme = {
  accent: 0x6f8aa8,
  accentDim: 0x2d3f58,
  fill: 0x121a28,
  fillEmpty: 0x080c14,
  headerColor: "#b8d4f0",
  sealBg: "#1a2a3dcc",
  sealColor: "#e8f4ff"
};

const SKILL_THEME: SlotTheme = {
  accent: 0xc9a24d,
  accentDim: 0x4a3820,
  fill: 0x18120e,
  fillEmpty: 0x0c0908,
  headerColor: "#f7c66b",
  sealBg: "#3a2818cc",
  sealColor: "#ffe9c2"
};

const BUILD_THEME: SlotTheme = {
  accent: 0xb86bff,
  accentDim: 0x3a2848,
  fill: 0x14101a,
  fillEmpty: 0x0a080e,
  headerColor: "#d8b4ff",
  sealBg: "#2a1840cc",
  sealColor: "#f0e0ff"
};

export class LoadoutBar {
  private readonly root: Phaser.GameObjects.Container;
  private readonly weaponSection: Phaser.GameObjects.Container;
  private readonly skillSection: Phaser.GameObjects.Container;
  private readonly buildSection: Phaser.GameObjects.Container;
  private readonly weaponLabel: Phaser.GameObjects.Text;
  private readonly skillLabel: Phaser.GameObjects.Text;
  private readonly buildLabel: Phaser.GameObjects.Text;
  private readonly weaponSlots: Phaser.GameObjects.Container[] = [];
  private readonly skillSlots: Phaser.GameObjects.Container[] = [];
  private readonly buildSlots: Phaser.GameObjects.Container[] = [];
  private readonly tooltip: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.root = scene.add.container(x, y).setDepth(820).setScrollFactor(0);
    this.tooltip = scene.add
      .text(0, 0, "", {
        fontFamily: TITLE_FONT,
        fontSize: "11px",
        color: "#f7efd8",
        fontStyle: "700",
        backgroundColor: "#0a1018dd",
        padding: { left: 6, right: 6, top: 3, bottom: 3 }
      })
      .setDepth(840)
      .setScrollFactor(0)
      .setVisible(false);

    this.weaponSection = this.createSection(0, WEAPON_THEME);
    this.skillSection = this.createSection(this.sectionHeight() + SECTION_GAP, SKILL_THEME);
    this.buildSection = this.createSection((this.sectionHeight() + SECTION_GAP) * 2, BUILD_THEME);

    this.weaponLabel = this.createSectionLabel(this.weaponSection, WEAPON_THEME);
    this.skillLabel = this.createSectionLabel(this.skillSection, SKILL_THEME);
    this.buildLabel = this.createSectionLabel(this.buildSection, BUILD_THEME);

    const weaponRow = scene.add.container(SECTION_PADDING, SECTION_HEADER_HEIGHT + 4);
    const skillRow = scene.add.container(SECTION_PADDING, SECTION_HEADER_HEIGHT + 4);
    const buildRow = scene.add.container(SECTION_PADDING, SECTION_HEADER_HEIGHT + 4);
    this.weaponSection.add(weaponRow);
    this.skillSection.add(skillRow);
    this.buildSection.add(buildRow);

    for (let index = 0; index < MAX_WEAPON_SLOTS; index += 1) {
      this.weaponSlots.push(this.createSlot(weaponRow, index, WEAPON_THEME));
    }
    for (let index = 0; index < MAX_SKILL_SLOTS; index += 1) {
      this.skillSlots.push(this.createSlot(skillRow, index, SKILL_THEME));
    }
    for (let index = 0; index < MAX_BUILD_PATH_SLOTS; index += 1) {
      this.buildSlots.push(this.createSlot(buildRow, index, BUILD_THEME));
    }

    this.root.add([this.weaponSection, this.skillSection, this.buildSection]);
  }

  setPosition(x: number, y: number): void {
    this.root.setPosition(x, y);
  }

  getWidth(): number {
    return ROW_WIDTH;
  }

  getHeight(): number {
    return this.sectionHeight() * 3 + SECTION_GAP * 2;
  }

  update(state: GameState): void {
    this.weaponLabel.setText(
      t("loadoutSectionLabel", {
        name: t("forms"),
        current: learnedWeaponCount(state),
        max: MAX_WEAPON_SLOTS
      })
    );
    this.skillLabel.setText(
      t("loadoutSectionLabel", {
        name: t("martialSkills"),
        current: learnedSkillCount(state),
        max: MAX_SKILL_SLOTS
      })
    );
    this.buildLabel.setText(
      t("loadoutSectionLabel", {
        name: t("buildPaths"),
        current: learnedBuildPathCount(state),
        max: MAX_BUILD_PATH_SLOTS
      })
    );

    const weapons = buildWeaponLoadoutSlots(state);
    const skills = buildSkillLoadoutSlots(state);
    const builds = buildBuildPathLoadoutSlots(state);

    this.weaponSlots.forEach((slot, index) => this.renderSlot(slot, weapons[index], WEAPON_THEME));
    this.skillSlots.forEach((slot, index) => this.renderSlot(slot, skills[index], SKILL_THEME));
    this.buildSlots.forEach((slot, index) => this.renderSlot(slot, builds[index], BUILD_THEME));
  }

  private sectionHeight(): number {
    return SECTION_HEADER_HEIGHT + SLOT_SIZE + SECTION_PADDING + 4;
  }

  private createSection(y: number, theme: SlotTheme): Phaser.GameObjects.Container {
    const section = this.scene.add.container(0, y);
    const height = this.sectionHeight();
    const bg = this.scene.add
      .rectangle(0, 0, ROW_WIDTH, height, 0x05080f, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, theme.accentDim, 0.95);
    const topAccent = this.scene.add.rectangle(1, 1, ROW_WIDTH - 2, 2, theme.accent, 0.55).setOrigin(0, 0);
    const bottomFade = this.scene.add.rectangle(1, height - 2, ROW_WIDTH - 2, 1, theme.accent, 0.22).setOrigin(0, 0);
    section.add([bg, topAccent, bottomFade]);
    return section;
  }

  private createSectionLabel(section: Phaser.GameObjects.Container, theme: SlotTheme): Phaser.GameObjects.Text {
    const label = this.scene.add
      .text(SECTION_PADDING, 5, "", {
        fontFamily: TITLE_FONT,
        fontSize: "12px",
        color: theme.headerColor,
        fontStyle: "700"
      })
      .setPadding(0, 0, 0, 0)
      .setDepth(2);
    section.add(label);
    return label;
  }

  private createSlot(parent: Phaser.GameObjects.Container, index: number, theme: SlotTheme): Phaser.GameObjects.Container {
    const x = index * (SLOT_SIZE + SLOT_GAP);
    const slot = this.scene.add.container(x, 0);
    const frame = this.scene.add
      .rectangle(0, 0, SLOT_SIZE, SLOT_SIZE, theme.fillEmpty, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(1, theme.accentDim, 0.85)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, SLOT_SIZE, SLOT_SIZE), Phaser.Geom.Rectangle.Contains);
    frame.on("pointerover", () => this.showTooltip(slot));
    frame.on("pointerout", () => this.hideTooltip());
    const innerFrame = this.scene.add
      .rectangle(4, 4, SLOT_SIZE - 8, SLOT_SIZE - 8, theme.fillEmpty, 0.35)
      .setOrigin(0, 0)
      .setStrokeStyle(1, theme.accent, 0.18);
    const cornerMark = this.scene.add
      .text(SLOT_SIZE / 2, SLOT_SIZE / 2, t("loadoutAwaiting"), {
        fontFamily: TITLE_FONT,
        fontSize: "10px",
        color: "#4a5a6e",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setAlpha(0.42);
    const icon = this.scene.add
      .image(SLOT_SIZE / 2, SLOT_SIZE / 2, "icon-upgrade-default")
      .setDisplaySize(ICON_SIZE, ICON_SIZE)
      .setDepth(1)
      .setVisible(false);
    const levelSeal = this.scene.add
      .text(SLOT_SIZE - 4, 3, "", {
        fontFamily: TITLE_FONT,
        fontSize: "9px",
        color: theme.sealColor,
        fontStyle: "700",
        backgroundColor: theme.sealBg,
        padding: { left: 3, right: 3, top: 1, bottom: 1 }
      })
      .setOrigin(1, 0)
      .setDepth(2)
      .setVisible(false);
    slot.add([frame, innerFrame, cornerMark, icon, levelSeal]);
    slot.setData("frame", frame);
    slot.setData("innerFrame", innerFrame);
    slot.setData("cornerMark", cornerMark);
    slot.setData("icon", icon);
    slot.setData("levelSeal", levelSeal);
    parent.add(slot);
    return slot;
  }

  private renderSlot(slot: Phaser.GameObjects.Container, entry: LoadoutSlotEntry, theme: SlotTheme): void {
    const frame = slot.getData("frame") as Phaser.GameObjects.Rectangle;
    const innerFrame = slot.getData("innerFrame") as Phaser.GameObjects.Rectangle;
    const cornerMark = slot.getData("cornerMark") as Phaser.GameObjects.Text;
    const icon = slot.getData("icon") as Phaser.GameObjects.Image;
    const levelSeal = slot.getData("levelSeal") as Phaser.GameObjects.Text;
    const filled = Boolean(entry.iconKey);

    const strokeColor = entry.evolved ? 0xffd36a : entry.standalone ? 0x8ff4ff : filled ? theme.accent : theme.accentDim;
    const fillColor = filled ? theme.fill : theme.fillEmpty;

    frame.setFillStyle(fillColor, filled ? 0.97 : 0.9);
    frame.setStrokeStyle(1, strokeColor, filled ? 1 : 0.7);
    innerFrame.setFillStyle(filled ? theme.fill : theme.fillEmpty, filled ? 0.55 : 0.2);
    innerFrame.setStrokeStyle(entry.evolved || entry.standalone ? 2 : 1, strokeColor, filled ? 0.55 : 0.12);
    cornerMark.setVisible(!filled);

    const tooltipText =
      filled && entry.label
        ? entry.evolved
          ? `${entry.label} · ${t("loadoutEvolvedTier")}`
          : `${entry.label} · ${t("loadoutTier", { tier: entry.level ?? 1 })}`
        : "";
    slot.setData("tooltip", tooltipText);

    if (filled && entry.iconKey) {
      icon.setTexture(resolveLoadoutIconKey(this.scene, entry.iconKey));
      icon.setDisplaySize(ICON_SIZE, ICON_SIZE);
      icon.setTint(entry.tint ?? 0xffffff);
      icon.setVisible(true);
      levelSeal.setText(entry.evolved ? t("loadoutEvolvedTier") : t("loadoutTier", { tier: entry.level ?? 1 }));
      levelSeal.setVisible(true);
      if (entry.evolved) {
        levelSeal.setColor("#ffe9a8");
        levelSeal.setBackgroundColor("#4a3018dd");
      } else if (entry.standalone) {
        levelSeal.setColor("#d8f7ff");
        levelSeal.setBackgroundColor("#1a3344dd");
      } else {
        levelSeal.setColor(theme.sealColor);
        levelSeal.setBackgroundColor(theme.sealBg);
      }
    } else {
      icon.clearTint();
      icon.setVisible(false);
      levelSeal.setVisible(false);
    }
  }

  private showTooltip(slot: Phaser.GameObjects.Container): void {
    const text = slot.getData("tooltip") as string;
    if (!text) {
      return;
    }
    const matrix = slot.getWorldTransformMatrix();
    const worldX = matrix.tx + SLOT_SIZE / 2;
    const worldY = matrix.ty - 6;
    this.tooltip.setText(text);
    this.tooltip.setPosition(worldX, worldY);
    this.tooltip.setOrigin(0.5, 1);
    this.tooltip.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltip.setVisible(false);
  }
}
