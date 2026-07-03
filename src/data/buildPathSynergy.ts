import type { GameState } from "../game/GameState";
import type { BuildPathId } from "./buildPaths";
import { RUN_BALANCE } from "./runBalance";
import { computeEvolutionProgress } from "./evolutionProgress";
import { weaponsLoadoutFullAndMastered, skillsLoadoutFullAndMastered } from "./loadoutLimits";
import { skillName, t, weaponName } from "../i18n";
export const BUILD_PATH_UNLOCK_REQUIREMENTS = {
  weaponLevel: 3,
  weaponCount: 2,
  skillLevel: 2,
  skillCount: 1
} as const;

export const BUILD_PATH_SPECIALIZATION_CAP = 2;
export const BUILD_PATH_OVERFLOW_WEIGHT = 0.5;

const MILESTONE_LEVELS = [3, 5, 8] as const;

export function buildPathLevel(state: GameState, pathId: BuildPathId): number {
  return state.buildPathLevels.get(pathId) ?? 0;
}

export function learnedBuildPathCount(state: GameState): number {
  return [...state.buildPathLevels.values()].filter((level) => level > 0).length;
}

export function countWeaponsAtLevel(state: GameState, minLevel: number): number {
  return [...state.weaponLevels.values()].filter((level) => level >= minLevel).length;
}

export function countSkillsAtLevel(state: GameState, minLevel: number): number {
  return [...state.skillLevels.values()].filter((level) => level >= minLevel).length;
}

export function isBuildPathUpgradeUnlocked(state: GameState): boolean {
  if (state.devMode.enabled) {
    return true;
  }
  if ((state.bossDefeats.get("minorBoss") ?? 0) > 0) {
    return true;
  }
  if (weaponsLoadoutFullAndMastered(state) && skillsLoadoutFullAndMastered(state)) {
    return true;
  }
  return (
    countWeaponsAtLevel(state, BUILD_PATH_UNLOCK_REQUIREMENTS.weaponLevel) >= BUILD_PATH_UNLOCK_REQUIREMENTS.weaponCount &&
    countSkillsAtLevel(state, BUILD_PATH_UNLOCK_REQUIREMENTS.skillLevel) >= BUILD_PATH_UNLOCK_REQUIREMENTS.skillCount
  );
}

export function buildPathWeightMultiplier(state: GameState, pathId: BuildPathId): number {
  const currentLevel = buildPathLevel(state, pathId);
  if (currentLevel > 0) {
    return 1;
  }
  if (learnedBuildPathCount(state) >= BUILD_PATH_SPECIALIZATION_CAP) {
    return BUILD_PATH_OVERFLOW_WEIGHT;
  }
  return 1;
}

export function evolutionPreviewLine(state: GameState): string | undefined {
  const ready = computeEvolutionProgress(state).find((progress) => progress.canEvolve);
  if (ready) {
    return t("evolutionPreviewReady", { name: t(ready.config.nameKey as Parameters<typeof t>[0]) });
  }

  for (const progress of computeEvolutionProgress(state)) {
    if (progress.alreadyEvolved) {
      continue;
    }
    const weaponGap = Math.max(0, progress.requiredWeaponLevel - progress.weaponLevel);
    const skillGap = Math.max(0, progress.requiredSkillLevel - progress.skillLevel);
    const totalGap = weaponGap + skillGap;
    if (totalGap !== 1) {
      continue;
    }
    const artName = t(progress.config.nameKey as Parameters<typeof t>[0]);
    if (weaponGap === 1) {
      return t("evolutionPreviewWeapon", {
        name: artName,
        weapon: weaponName(progress.config.baseWeaponId)
      });
    }
    return t("evolutionPreviewSkill", {
      name: artName,
      skill: skillName(progress.config.requiredSkillId)
    });
  }

  return undefined;
}

export function isBuildPathMilestone(level: number): boolean {
  return MILESTONE_LEVELS.includes(level as (typeof MILESTONE_LEVELS)[number]);
}

export function applyBuildPathMilestone(state: GameState, pathId: BuildPathId, level: number): void {
  if (!isBuildPathMilestone(level)) {
    return;
  }

  const { player } = state;
  switch (pathId) {
    case "swordSect":
      if (level === 3) {
        player.stats.critChance = Math.min(0.75, player.stats.critChance + 0.03);
      } else if (level === 5) {
        player.stats.damageMultiplier += 0.08;
      } else if (level === 8) {
        player.stats.critMultiplier += 0.25;
      }
      break;
    case "qiSect":
      if (level === 3) {
        player.stats.maxHp += 8;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 8);
      } else if (level === 5) {
        player.stats.areaMultiplier += 0.05;
      } else if (level === 8) {
        player.stats.areaMultiplier += 0.1;
        player.stats.maxHp += 12;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 12);
      }
      break;
    case "footworkSect":
      if (level === 3) {
        player.stats.dodgeChance = Math.min(0.42, player.stats.dodgeChance + 0.02);
      } else if (level === 5) {
        player.stats.moveSpeed += 16;
      } else if (level === 8) {
        player.stats.pickupRange += 20;
        player.stats.dodgeChance = Math.min(0.42, player.stats.dodgeChance + 0.04);
      }
      break;
    case "wineSwordSect":
      if (level === 3) {
        player.stats.comboChance = Math.min(0.36, player.stats.comboChance + 0.03);
      } else if (level === 5) {
        player.stats.burstMultiplier += 0.08;
      } else if (level === 8) {
        player.stats.cooldownMultiplier *= 0.92;
        player.stats.comboChance = Math.min(0.36, player.stats.comboChance + 0.05);
      }
      break;
  }
}

export function buildPathMilestoneLabel(pathId: BuildPathId, level: number): string | undefined {
  if (!isBuildPathMilestone(level)) {
    return undefined;
  }
  return t(`buildMilestone_${pathId}_L${level}` as Parameters<typeof t>[0]);
}

export function shouldTriggerSwordCritBurst(state: GameState): boolean {
  return buildPathLevel(state, "swordSect") >= 5;
}

export function shouldTriggerQiKillHeal(state: GameState): boolean {
  return buildPathLevel(state, "qiSect") >= 3;
}

export function qiKillHealAmount(state: GameState): number {
  const level = buildPathLevel(state, "qiSect");
  if (level >= 8) {
    return RUN_BALANCE.buildPath.qiKillHeal.level8;
  }
  return RUN_BALANCE.buildPath.qiKillHeal.level3;
}

export function shouldTriggerFootworkDodgeBoost(state: GameState): boolean {
  return buildPathLevel(state, "footworkSect") >= 5;
}

export function footworkDodgeSpeedBonus(state: GameState): number {
  return buildPathLevel(state, "footworkSect") >= 8 ? 28 : 18;
}

export function shouldTriggerWineComboCooldownShave(state: GameState): boolean {
  return buildPathLevel(state, "wineSwordSect") >= 5;
}

export function swordCritBurstDamage(state: GameState, baseDamage: number): number {
  const level = buildPathLevel(state, "swordSect");
  const multiplier =
    level >= 8 ? RUN_BALANCE.buildPath.swordCritBurst.level8 : RUN_BALANCE.buildPath.swordCritBurst.level5;
  return Math.round(baseDamage * multiplier * state.player.stats.damageMultiplier);
}

export type BuildPathCombatTrigger =
  | { type: "swordCritBurst"; x: number; y: number; damage: number }
  | { type: "qiKillHeal"; amount: number }
  | { type: "footworkDodgeBoost"; speedBonus: number; durationMs: number }
  | { type: "wineComboCooldownShave"; amountMs: number };

export function wineComboCooldownShaveMs(state: GameState): number {
  const level = buildPathLevel(state, "wineSwordSect");
  return level >= 8
    ? RUN_BALANCE.buildPath.wineCooldownShaveMs.level8
    : RUN_BALANCE.buildPath.wineCooldownShaveMs.level5;
}
