import type { GameState } from "../game/GameState";

export { isBuildPathUpgradeUnlocked } from "./buildPathSynergy";

export function isStandaloneSkillPoolUnlocked(state: GameState): boolean {
  if (state.devMode.enabled) {
    return true;
  }
  if ((state.bossDefeats.get("minorBoss") ?? 0) > 0) {
    return true;
  }
  return state.elapsedSec >= 300 || state.bossDefeats.size > 0;
}
