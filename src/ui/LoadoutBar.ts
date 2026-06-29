import Phaser from "phaser";
import { EVOLUTION_CONFIGS } from "../data/evolutions";
import type { GameState } from "../game/GameState";
import { MAX_SKILL_SLOTS, MAX_WEAPON_SLOTS, learnedSkillCount, learnedWeaponCount } from "../data/loadoutLimits";
import { SKILL_CONFIGS } from "../data/skills";
import { WEAPON_CONFIGS, type WeaponId } from "../data/weapons";
import { t } from "../i18n";
import { UI_FONT } from "./textStyle";

const SLOT_SIZE = 42;
const SLOT_GAP = 6;
const ICON_SIZE = 30;

type SlotEntry = {
  iconKey?: string;
  level?: number;
  tint?: number;
};

export class LoadoutBar {
  private readonly root: Phaser.GameObjects.Container;
  private readonly weaponRow: Phaser.GameObjects.Container;
  private readonly skillRow: Phaser.GameObjects.Container;
  private readonly weaponLabel: Phaser.GameObjects.Text;
  private readonly skillLabel: Phaser.GameObjects.Text;
  private readonly weaponSlots: Phaser.GameObjects.Container[] = [];
  private readonly skillSlots: Phaser.GameObjects.Container[] = [];

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.root = scene.add.container(x, y).setDepth(820).setScrollFactor(0);
    this.weaponLabel = scene.add
      .text(0, 0, "", { fontFamily: UI_FONT, fontSize: "12px", color: "#aac7d8" })
      .setPadding(0, 1, 0, 1)
      .setDepth(1);
    this.skillLabel = scene.add
      .text(0, SLOT_SIZE + 22, "", { fontFamily: UI_FONT, fontSize: "12px", color: "#f7c66b" })
      .setPadding(0, 1, 0, 1)
      .setDepth(1);
    this.weaponRow = scene.add.container(0, 20);
    this.skillRow = scene.add.container(0, SLOT_SIZE + 38);
    this.root.add([this.weaponLabel, this.weaponRow, this.skillLabel, this.skillRow]);

    for (let index = 0; index < MAX_WEAPON_SLOTS; index += 1) {
      this.weaponSlots.push(this.createSlot(this.weaponRow, index));
    }
    for (let index = 0; index < MAX_SKILL_SLOTS; index += 1) {
      this.skillSlots.push(this.createSlot(this.skillRow, index));
    }
  }

  setPosition(x: number, y: number): void {
    this.root.setPosition(x, y);
  }

  update(state: GameState): void {
    this.weaponLabel.setText(`${t("forms")} ${t("loadoutSlots", { current: learnedWeaponCount(state), max: MAX_WEAPON_SLOTS })}`);
    this.skillLabel.setText(`${t("martialSkills")} ${t("loadoutSlots", { current: learnedSkillCount(state), max: MAX_SKILL_SLOTS })}`);

    const weapons = this.buildWeaponSlots(state);
    const skills = this.buildSkillSlots(state);

    this.weaponSlots.forEach((slot, index) => this.renderSlot(slot, weapons[index]));
    this.skillSlots.forEach((slot, index) => this.renderSlot(slot, skills[index]));
  }

  private buildWeaponSlots(state: GameState): SlotEntry[] {
    const equipped = [...state.weaponLevels.entries()]
      .filter(([, level]) => level > 0)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([weaponId, level]) => ({
        iconKey: this.weaponIconKey(state, weaponId),
        level,
        tint: state.evolvedWeapons.has(weaponId) ? 0xffe09a : 0xffffff
      }));

    return this.padSlots(equipped, MAX_WEAPON_SLOTS);
  }

  private buildSkillSlots(state: GameState): SlotEntry[] {
    const equipped = [...state.skillLevels.entries()]
      .filter(([, level]) => level > 0)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([skillId, level]) => ({
        iconKey: SKILL_CONFIGS[skillId].iconKey,
        level,
        tint: SKILL_CONFIGS[skillId].kind === "standalone" ? 0xb8f7ff : 0xffffff
      }));

    return this.padSlots(equipped, MAX_SKILL_SLOTS);
  }

  private weaponIconKey(state: GameState, weaponId: WeaponId): string {
    const evolutionId = state.evolvedWeapons.get(weaponId);
    if (evolutionId) {
      return EVOLUTION_CONFIGS[evolutionId].iconKey;
    }
    return WEAPON_CONFIGS[weaponId].iconKey;
  }

  private padSlots(entries: SlotEntry[], maxSlots: number): SlotEntry[] {
    const slots: SlotEntry[] = [...entries];
    while (slots.length < maxSlots) {
      slots.push({});
    }
    return slots.slice(0, maxSlots);
  }

  private createSlot(parent: Phaser.GameObjects.Container, index: number): Phaser.GameObjects.Container {
    const x = index * (SLOT_SIZE + SLOT_GAP);
    const slot = this.scene.add.container(x, 0);
    const frame = this.scene.add
      .rectangle(0, 0, SLOT_SIZE, SLOT_SIZE, 0x111421, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x3a4a5f, 0.95);
    const icon = this.scene.add.image(SLOT_SIZE / 2, SLOT_SIZE / 2, "icon-upgrade-default").setDisplaySize(ICON_SIZE, ICON_SIZE).setVisible(false);
    const levelBadge = this.scene.add
      .text(SLOT_SIZE - 4, SLOT_SIZE - 2, "", {
        fontFamily: UI_FONT,
        fontSize: "11px",
        color: "#f7efd8",
        fontStyle: "700",
        backgroundColor: "#1a2233cc",
        padding: { left: 4, right: 4, top: 1, bottom: 1 }
      })
      .setOrigin(1, 1)
      .setVisible(false);
    slot.add([frame, icon, levelBadge]);
    slot.setData("frame", frame);
    slot.setData("icon", icon);
    slot.setData("levelBadge", levelBadge);
    parent.add(slot);
    return slot;
  }

  private renderSlot(slot: Phaser.GameObjects.Container, entry: SlotEntry): void {
    const frame = slot.getData("frame") as Phaser.GameObjects.Rectangle;
    const icon = slot.getData("icon") as Phaser.GameObjects.Image;
    const levelBadge = slot.getData("levelBadge") as Phaser.GameObjects.Text;
    const filled = Boolean(entry.iconKey);

    frame.setFillStyle(filled ? 0x171f2f : 0x0d111c, filled ? 0.96 : 0.88);
    frame.setStrokeStyle(1, filled ? 0x6f8aa8 : 0x2d3848, filled ? 1 : 0.75);

    if (filled && entry.iconKey) {
      icon.setTexture(entry.iconKey);
      icon.setTint(entry.tint ?? 0xffffff);
      icon.setVisible(true);
      levelBadge.setText(String(entry.level ?? 1));
      levelBadge.setVisible(true);
    } else {
      icon.setVisible(false);
      levelBadge.setVisible(false);
    }
  }
}
