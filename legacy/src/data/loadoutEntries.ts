import { EVOLUTION_CONFIGS } from "./evolutions";
import type { GameState } from "../game/GameState";
import { evolutionName, skillName, weaponName, buildPathName } from "../i18n";
import { MAX_BUILD_PATH_SLOTS, MAX_SKILL_SLOTS, MAX_WEAPON_SLOTS } from "./loadoutLimits";
import { BUILD_PATH_CONFIGS, type BuildPathId } from "./buildPaths";
import { SKILL_CONFIGS } from "./skills";
import { WEAPON_CONFIGS, type WeaponId } from "./weapons";

export type LoadoutSlotEntry = {
  iconKey?: string;
  label?: string;
  level?: number;
  tint?: number;
  evolved?: boolean;
  standalone?: boolean;
};

export function buildWeaponLoadoutSlots(state: GameState): LoadoutSlotEntry[] {
  const equipped = [...state.weaponLevels.entries()]
    .filter(([, level]) => level > 0)
    .map(([weaponId, level]) => ({
      iconKey: weaponIconKey(state, weaponId),
      label: weaponSlotLabel(state, weaponId),
      level,
      tint: state.evolvedWeapons.has(weaponId) ? 0xffe09a : 0xffffff,
      evolved: state.evolvedWeapons.has(weaponId)
    }));

  return padSlots(equipped, MAX_WEAPON_SLOTS);
}

export function buildSkillLoadoutSlots(state: GameState): LoadoutSlotEntry[] {
  const equipped = [...state.skillLevels.entries()]
    .filter(([, level]) => level > 0)
    .map(([skillId, level]) => ({
      iconKey: SKILL_CONFIGS[skillId].iconKey,
      label: skillName(skillId),
      level,
      tint: SKILL_CONFIGS[skillId].kind === "standalone" ? 0xb8f7ff : 0xffffff,
      standalone: SKILL_CONFIGS[skillId].kind === "standalone"
    }));

  return padSlots(equipped, MAX_SKILL_SLOTS);
}

export function buildBuildPathLoadoutSlots(state: GameState): LoadoutSlotEntry[] {
  const equipped = (Object.keys(BUILD_PATH_CONFIGS) as BuildPathId[])
    .map((pathId) => ({ pathId, level: state.buildPathLevels.get(pathId) ?? 0 }))
    .filter(({ level }) => level > 0)
    .map(({ pathId, level }) => ({
      iconKey: BUILD_PATH_CONFIGS[pathId].iconKey,
      label: buildPathName(pathId),
      level,
      tint: 0xe8d4ff
    }));

  return padSlots(equipped, MAX_BUILD_PATH_SLOTS);
}

function weaponSlotLabel(state: GameState, weaponId: WeaponId): string {
  const evolutionId = state.evolvedWeapons.get(weaponId);
  if (evolutionId) {
    return evolutionName(evolutionId);
  }
  return weaponName(weaponId);
}

function weaponIconKey(state: GameState, weaponId: WeaponId): string {
  const evolutionId = state.evolvedWeapons.get(weaponId);
  if (evolutionId) {
    return EVOLUTION_CONFIGS[evolutionId].iconKey;
  }
  return WEAPON_CONFIGS[weaponId].iconKey;
}

function padSlots(entries: LoadoutSlotEntry[], maxSlots: number): LoadoutSlotEntry[] {
  const slots: LoadoutSlotEntry[] = [...entries];
  while (slots.length < maxSlots) {
    slots.push({});
  }
  return slots.slice(0, maxSlots);
}

export function resolveLoadoutIconKey(scene: { textures: { exists(key: string): boolean } }, iconKey: string): string {
  if (scene.textures.exists(iconKey)) {
    return iconKey;
  }
  return scene.textures.exists("icon-upgrade-default") ? "icon-upgrade-default" : iconKey;
}
