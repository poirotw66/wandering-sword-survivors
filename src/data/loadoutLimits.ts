import { EVOLUTION_CONFIGS, EVOLUTION_REQUIRED_WEAPON_LEVEL, type EvolutionId } from "./evolutions";
import { SKILL_CONFIGS } from "./skills";
import type { GameState } from "../game/GameState";

export const MAX_WEAPON_SLOTS = 6;
export const MAX_SKILL_SLOTS = 6;

export function learnedWeaponCount(state: GameState): number {
  return [...state.weaponLevels.values()].filter((level) => level > 0).length;
}

export function learnedSkillCount(state: GameState): number {
  return [...state.skillLevels.values()].filter((level) => level > 0).length;
}

export function canLearnNewWeapon(state: GameState): boolean {
  return learnedWeaponCount(state) < MAX_WEAPON_SLOTS;
}

export function canLearnNewSkill(state: GameState): boolean {
  return learnedSkillCount(state) < MAX_SKILL_SLOTS;
}

export function weaponsLoadoutFullAndMastered(state: GameState): boolean {
  const learned = [...state.weaponLevels.entries()].filter(([, level]) => level > 0);
  if (learned.length < MAX_WEAPON_SLOTS) {
    return false;
  }
  return learned.every(([, level]) => level >= EVOLUTION_REQUIRED_WEAPON_LEVEL);
}

export function skillsLoadoutFullAndMastered(state: GameState): boolean {
  const learned = [...state.skillLevels.entries()].filter(([, level]) => level > 0);
  if (learned.length < MAX_SKILL_SLOTS) {
    return false;
  }
  return learned.every(([skillId, level]) => level >= SKILL_CONFIGS[skillId].maxLevel);
}

export function eligibleEvolutionsMastered(state: GameState): boolean {
  for (const evolutionId of Object.keys(EVOLUTION_CONFIGS) as EvolutionId[]) {
    const config = EVOLUTION_CONFIGS[evolutionId];
    const weaponLevel = state.weaponLevels.get(config.baseWeaponId) ?? 0;
    const skillLevel = state.skillLevels.get(config.requiredSkillId) ?? 0;
    if (
      weaponLevel >= config.requiredWeaponLevel &&
      skillLevel >= config.requiredSkillLevel &&
      state.evolvedWeapons.get(config.baseWeaponId) !== evolutionId
    ) {
      return false;
    }
  }
  return true;
}

export function isMartialLoadoutComplete(state: GameState): boolean {
  return weaponsLoadoutFullAndMastered(state) && skillsLoadoutFullAndMastered(state) && eligibleEvolutionsMastered(state);
}
