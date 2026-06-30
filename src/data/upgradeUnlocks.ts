import type { GameState } from "../game/GameState";
import { weaponsLoadoutFullAndMastered, skillsLoadoutFullAndMastered } from "./loadoutLimits";

export function isBuildPathUpgradeUnlocked(state: GameState): boolean {
  return state.devMode.enabled || (weaponsLoadoutFullAndMastered(state) && skillsLoadoutFullAndMastered(state));
}

export function isStandaloneSkillPoolUnlocked(state: GameState): boolean {
  if (state.devMode.enabled) {
    return true;
  }
  if ((state.bossDefeats.get("minorBoss") ?? 0) > 0) {
    return true;
  }
  return state.elapsedSec >= 300 || state.bossDefeats.size > 0;
}
