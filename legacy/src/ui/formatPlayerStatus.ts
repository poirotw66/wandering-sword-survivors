import { EVOLUTION_CONFIGS } from "../data/evolutions";
import { trackedEvolutionProgress } from "../data/evolutionProgress";
import { buildPathName, t } from "../i18n";
import type { GameState } from "../game/GameState";

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function buildStatusReport(state: GameState): string {
  const stats = state.player.stats;
  const weaponLayers = [...state.weaponLevels.values()].reduce((total, level) => total + level, 0);
  const skillLayers = [...state.skillLevels.values()].reduce((total, level) => total + level, 0);
  const innerForce = Math.round(
    100 * stats.damageMultiplier + stats.pickupRange * 0.4 + (1 / stats.cooldownMultiplier) * 28
  );

  const sections = [
    `【${t("statusSectionRun")}】`,
    t("statusRunLine", {
      level: state.level,
      renown: state.score,
      kills: state.kills,
      time: formatSeconds(state.elapsedSec),
      difficulty: state.selectedDifficulty,
      title: state.renownTitle
    }),
    "",
    `【${t("statusSectionVitals")}】`,
    t("statusHpLine", { hp: Math.ceil(stats.hp), maxHp: stats.maxHp }),
    t("statusInnerForceLine", { innerForce, layers: weaponLayers + skillLayers }),
    "",
    `【${t("statusSectionCombat")}】`,
    t("statusDamageLine", { value: formatPercent(stats.damageMultiplier) }),
    t("statusCooldownLine", { value: formatPercent(stats.cooldownMultiplier) }),
    t("statusProjectileSpeedLine", { value: formatPercent(stats.projectileSpeedMultiplier) }),
    t("statusAreaLine", { value: formatPercent(stats.areaMultiplier) }),
    t("statusCritLine", { chance: formatPercent(stats.critChance), multiplier: stats.critMultiplier.toFixed(2) }),
    t("statusDodgeLine", { value: formatPercent(stats.dodgeChance) }),
    t("statusComboLine", { value: formatPercent(stats.comboChance) }),
    t("statusBurstLine", { value: formatPercent(stats.burstMultiplier) }),
    t("statusMoveSpeedLine", { value: Math.round(stats.moveSpeed) }),
    t("statusPickupLine", { value: Math.round(stats.pickupRange) }),
    "",
    `【${t("statusSectionBuild")}】`,
    formatBuildPaths(state),
    "",
    `【${t("statusSectionEvolution")}】`,
    formatEvolutionRoutes(state)
  ];

  return sections.join("\n");
}

function formatBuildPaths(state: GameState): string {
  const paths = [...state.buildPathLevels.entries()].filter(([, level]) => level > 0);
  if (paths.length === 0) {
    return t("buildPaths") + ": " + t("none");
  }

  return paths.map(([pathId, level]) => t("buildLevel", { name: buildPathName(pathId), level })).join("\n");
}

function formatEvolutionRoutes(state: GameState): string {
  const tracked = trackedEvolutionProgress(state, 5).filter((progress) => progress.progressScore > 0 || progress.canEvolve);
  if (tracked.length === 0) {
    return t("evolutionRoutes") + ": " + t("none");
  }

  return tracked
    .map((progress) => {
      const name = t(EVOLUTION_CONFIGS[progress.evolutionId].nameKey as Parameters<typeof t>[0]);
      const total = progress.requiredWeaponLevel + progress.requiredSkillLevel;
      const status = progress.canEvolve ? ` ${t("readyToEvolveShort")}` : "";
      return `${name} ${progress.progressScore}/${total}${status}`;
    })
    .join("\n");
}
