import { SKILL_CONFIGS, type SkillId } from "./skills";
import { WEAPON_CONFIGS, type WeaponId } from "./weapons";
import { BUILD_PATH_CONFIGS, type BuildPathId } from "./buildPaths";
import { EVOLUTION_CONFIGS, EVOLUTION_REQUIRED_WEAPON_LEVEL, type EvolutionId } from "./evolutions";
import { findProgressForSkill, findProgressForWeapon, trackedEvolutionProgress, type EvolutionProgress } from "./evolutionProgress";
import { canLearnNewSkill, canLearnNewWeapon, isMartialLoadoutComplete } from "./loadoutLimits";
import { isBuildPathUpgradeUnlocked, isStandaloneSkillPoolUnlocked } from "./upgradeUnlocks";
import type { GameState } from "../game/GameState";
import { buildPathName, skillName, t, weaponName } from "../i18n";

export function isEndgameUpgradeUnlocked(state: GameState): boolean {
  return state.devMode.enabled || isMartialLoadoutComplete(state);
}

export type UpgradeOption = {
  id: string;
  kind: "stat" | "weapon" | "skill" | "build" | "evolution" | "standaloneSkill";
  iconKey: string;
  title: string;
  description: string;
  badgeText?: string;
  recipeHint?: string;
  progressText?: string;
  recommendedText?: string;
  recommendationReason?: string;
  banishable?: boolean;
  evolutionId?: EvolutionId;
  skillId?: SkillId;
  apply: (state: GameState) => void;
};

export function buildUpgradePool(state: GameState): UpgradeOption[] {
  const statOptions: UpgradeOption[] = [
    {
      id: "damage",
      kind: "stat",
      iconKey: "icon-damage",
      title: t("damageTitle"),
      description: t("damageDescription", {
        current: Math.round(state.player.stats.damageMultiplier * 100),
        next: Math.round((state.player.stats.damageMultiplier + 0.15) * 100)
      }),
      apply: ({ player }) => {
        player.stats.damageMultiplier += 0.15;
      },
      banishable: true
    },
    {
      id: "cooldown",
      kind: "stat",
      iconKey: "icon-cooldown",
      title: t("cooldownTitle"),
      description: t("cooldownDescription"),
      apply: ({ player }) => {
        player.stats.cooldownMultiplier *= 0.9;
      },
      banishable: true
    },
    {
      id: "speed",
      kind: "stat",
      iconKey: "icon-speed",
      title: t("speedTitle"),
      description: t("speedDescription", { current: state.player.stats.moveSpeed, next: state.player.stats.moveSpeed + 18 }),
      apply: ({ player }) => {
        player.stats.moveSpeed += 18;
      },
      banishable: true
    },
    {
      id: "pickup",
      kind: "stat",
      iconKey: "icon-pickup",
      title: t("pickupTitle"),
      description: t("pickupDescription", { current: state.player.stats.pickupRange, next: state.player.stats.pickupRange + 28 }),
      apply: ({ player }) => {
        player.stats.pickupRange += 28;
      },
      banishable: true
    },
    {
      id: "heal",
      kind: "stat",
      iconKey: "icon-heal",
      title: t("healTitle"),
      description: t("healDescription"),
      apply: ({ player }) => {
        player.stats.maxHp += 10;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 25);
      },
      banishable: true
    }
  ];

  const options: UpgradeOption[] = isEndgameUpgradeUnlocked(state)
    ? statOptions.filter((option) => !state.banishedUpgradeIds.has(option.id))
    : [];

  const nearRoutes = trackedEvolutionProgress(state, 4).filter((progress) => !progress.alreadyEvolved);

  for (const evolutionId of Object.keys(EVOLUTION_CONFIGS) as EvolutionId[]) {
    const config = EVOLUTION_CONFIGS[evolutionId];
    const weaponLevel = state.weaponLevels.get(config.baseWeaponId) ?? 0;
    const skillLevel = state.skillLevels.get(config.requiredSkillId) ?? 0;
    if (
      !config.implemented ||
      state.evolvedWeapons.has(config.baseWeaponId) ||
      weaponLevel < config.requiredWeaponLevel ||
      skillLevel < config.requiredSkillLevel
    ) {
      continue;
    }

    const name = t(config.nameKey as Parameters<typeof t>[0]);
    options.push({
      id: `evolution-${evolutionId}`,
      kind: "evolution",
      iconKey: config.iconKey,
      title: t("evolutionTitle", { name }),
      description: t(config.descriptionKey as Parameters<typeof t>[0]),
      badgeText: t("evolutionBadge"),
      recipeHint: recipeHint(state, config.baseWeaponId, config.requiredSkillId, evolutionId),
      progressText: t("readyToEvolve"),
      evolutionId,
      apply: ({ evolvedWeapons }) => {
        evolvedWeapons.set(config.baseWeaponId, evolutionId);
      }
    });
  }

  for (const weaponId of Object.keys(WEAPON_CONFIGS) as WeaponId[]) {
    const config = WEAPON_CONFIGS[weaponId];
    const level = state.weaponLevels.get(weaponId) ?? 0;
    if (level >= EVOLUTION_REQUIRED_WEAPON_LEVEL) {
      continue;
    }
    if (!config.availableInUpgradePool) {
      continue;
    }
    if (level === 0 && !canLearnNewWeapon(state)) {
      continue;
    }

    const label = weaponName(weaponId);
    const progress = findProgressForWeapon(state, weaponId);
    const recommendation = recommendationForProgress(progress);
    options.push({
      id: `weapon-${weaponId}`,
      kind: "weapon",
      iconKey: config.iconKey,
      title: level === 0 ? t("unlock", { name: label }) : t("weaponLevel", { name: label, level: level + 1 }),
      description: level === 0 ? t("addWeapon", { name: label }) : t("improveWeapon", { level }),
      badgeText: progress ? t("comboBadge") : t("forms"),
      recipeHint: progress ? recipeHint(state, progress.config.baseWeaponId, progress.config.requiredSkillId, progress.evolutionId) : undefined,
      progressText: progress
        ? t("recipeProgress", { current: progress.progressScore, total: progress.requiredWeaponLevel + progress.requiredSkillLevel })
        : undefined,
      recommendedText: recommendation?.text,
      recommendationReason: recommendation?.reason,
      apply: ({ weaponLevels }) => {
        weaponLevels.set(weaponId, level + 1);
      }
    });
  }

  if (isBuildPathUpgradeUnlocked(state)) {
    for (const buildPathId of Object.keys(BUILD_PATH_CONFIGS) as BuildPathId[]) {
      const config = BUILD_PATH_CONFIGS[buildPathId];
      const level = state.buildPathLevels.get(buildPathId) ?? 0;
      if (level >= config.maxLevel) {
        continue;
      }

      const nextLevel = level + 1;
      const route = nearRoutes.find((progress) => EVOLUTION_CONFIGS[progress.evolutionId].preferredBuildPathId === buildPathId);
      const artName = route ? t(route.config.nameKey as Parameters<typeof t>[0]) : "";
      options.push({
        id: `build-${buildPathId}`,
        kind: "build",
        iconKey: config.iconKey,
        title:
          level === 0
            ? t("buildUnlock", { name: buildPathName(buildPathId) })
            : t("buildLevel", { name: buildPathName(buildPathId), level: nextLevel }),
        description: config.describe(state, nextLevel),
        recommendedText: route ? t("recommendedBadge") : undefined,
        recommendationReason: route ? t("recommendBuildPath", { path: buildPathName(buildPathId), art: artName }) : undefined,
        apply: (gameState) => {
          gameState.buildPathLevels.set(buildPathId, nextLevel);
          config.apply(gameState, nextLevel);
        }
      });
    }
  }

  for (const skillId of Object.keys(SKILL_CONFIGS) as SkillId[]) {
    const config = SKILL_CONFIGS[skillId];
    const level = state.skillLevels.get(skillId) ?? 0;
    if (config.kind !== "combo" || level >= config.maxLevel) {
      continue;
    }
    if (level === 0 && !canLearnNewSkill(state)) {
      continue;
    }

    const nextLevel = level + 1;
    const label = skillName(skillId);
    const progress = findProgressForSkill(state, skillId);
    const recommendation = recommendationForProgress(progress);
    options.push({
      id: `skill-${skillId}`,
      kind: "skill",
      iconKey: config.iconKey,
      title: level === 0 ? t("learn", { name: label }) : t("skillLevel", { name: label, level: nextLevel }),
      description: config.describe(state, nextLevel),
      badgeText: t("martialSkills"),
      recipeHint: progress ? recipeHint(state, progress.config.baseWeaponId, progress.config.requiredSkillId, progress.evolutionId) : undefined,
      progressText: progress
        ? t("recipeProgress", { current: progress.progressScore, total: progress.requiredWeaponLevel + progress.requiredSkillLevel })
        : undefined,
      recommendedText: recommendation?.text,
      recommendationReason: recommendation?.reason,
      skillId,
      apply: (gameState) => {
        gameState.skillLevels.set(skillId, nextLevel);
        config.apply(gameState, nextLevel);
      }
    });
  }

  const learnedStandaloneCount = [...state.skillLevels.entries()].filter(
    ([skillId, level]) => level > 0 && SKILL_CONFIGS[skillId].kind === "standalone"
  ).length;
  const standaloneUnlocked = isStandaloneSkillPoolUnlocked(state);
  if (standaloneUnlocked && learnedStandaloneCount < 2) {
    for (const skillId of Object.keys(SKILL_CONFIGS) as SkillId[]) {
      const config = SKILL_CONFIGS[skillId];
      const level = state.skillLevels.get(skillId) ?? 0;
      if (config.kind !== "standalone" || level >= config.maxLevel) {
        continue;
      }
      if (level === 0 && !canLearnNewSkill(state)) {
        continue;
      }

      const nextLevel = level + 1;
      const label = skillName(skillId);
      options.push({
        id: `standalone-skill-${skillId}`,
        kind: "standaloneSkill",
        iconKey: config.iconKey,
        title: level === 0 ? t("standaloneSkillTitle", { name: label }) : t("skillLevel", { name: label, level: nextLevel }),
        description: `${t("standaloneSkillHint")}\n${config.describe(state, nextLevel)}`,
        badgeText: t("standaloneBadge"),
        progressText: t("standaloneNoRecipe"),
        skillId,
        apply: (gameState) => {
          gameState.skillLevels.set(skillId, nextLevel);
          config.apply(gameState, nextLevel);
        }
      });
    }
  }

  return options;
}

function recipeHint(state: GameState, weaponId: WeaponId, skillId: SkillId, evolutionId: EvolutionId): string {
  const config = EVOLUTION_CONFIGS[evolutionId];
  const weaponLevel = state.weaponLevels.get(weaponId) ?? 0;
  const skillLevel = state.skillLevels.get(skillId) ?? 0;
  return t("recipeHint", {
    weapon: weaponName(weaponId),
    weaponLevel,
    requiredWeapon: config.requiredWeaponLevel,
    skill: skillName(skillId),
    skillLevel,
    requiredSkill: config.requiredSkillLevel,
    art: t(config.nameKey as Parameters<typeof t>[0])
  });
}

function recommendationForProgress(progress?: EvolutionProgress): { text: string; reason: string } | undefined {
  if (!progress) {
    return undefined;
  }

  const total = progress.requiredWeaponLevel + progress.requiredSkillLevel;
  const missing = total - progress.progressScore;
  const art = t(progress.config.nameKey as Parameters<typeof t>[0]);
  if (missing <= 1) {
    return {
      text: t("recommendedBadge"),
      reason: t("recommendCompletesRecipe", { art, current: progress.progressScore, total })
    };
  }
  if (missing <= 3 || progress.progressScore > 0) {
    return {
      text: t("recommendedBadge"),
      reason: t("recommendNearRecipe", { art, current: progress.progressScore, total })
    };
  }
  return undefined;
}
