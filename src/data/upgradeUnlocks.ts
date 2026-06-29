import type { GameState } from "../game/GameState";
import { isMartialLoadoutComplete } from "./loadoutLimits";

export function isBuildPathUpgradeUnlocked(state: GameState): boolean {
  return state.devMode.enabled || isMartialLoadoutComplete(state) || state.level >= 8 || state.bossDefeats.size > 0;
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
