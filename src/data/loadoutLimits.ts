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
