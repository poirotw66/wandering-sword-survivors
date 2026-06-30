import { BUILD_PATH_CONFIGS, type BuildPathId } from "./buildPaths";
import type { GameState } from "../game/GameState";
import { buildPathName, t } from "../i18n";

export type BossBuildPathReward = {
  pathId: BuildPathId;
  previousLevel: number;
  newLevel: number;
};

export function grantRandomBuildPathLevel(state: GameState): BossBuildPathReward | null {
  const eligible = (Object.keys(BUILD_PATH_CONFIGS) as BuildPathId[]).filter((pathId) => {
    const level = state.buildPathLevels.get(pathId) ?? 0;
    return level < BUILD_PATH_CONFIGS[pathId].maxLevel;
  });
  if (eligible.length === 0) {
    return null;
  }

  const pathId = eligible[Math.floor(Math.random() * eligible.length)];
  const previousLevel = state.buildPathLevels.get(pathId) ?? 0;
  const newLevel = previousLevel + 1;
  state.buildPathLevels.set(pathId, newLevel);
  BUILD_PATH_CONFIGS[pathId].apply(state, newLevel);
  return { pathId, previousLevel, newLevel };
}

export function formatBossBuildPathRewardMessage(reward: BossBuildPathReward): string {
  const name = buildPathName(reward.pathId);
  if (reward.previousLevel === 0) {
    return t("bossBuildPathUnlock", { name });
  }
  return t("bossBuildPathLevel", { name, level: reward.newLevel });
}
