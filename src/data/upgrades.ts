import { SKILL_CONFIGS, type SkillId } from "./skills";
import { WEAPON_CONFIGS, type WeaponId } from "./weapons";
import { BUILD_PATH_CONFIGS, type BuildPathId } from "./buildPaths";
import { EVOLUTION_CONFIGS, type EvolutionId } from "./evolutions";
import type { GameState } from "../game/GameState";
import { buildPathName, skillName, t, weaponName } from "../i18n";

export type UpgradeOption = {
  id: string;
  kind: "stat" | "weapon" | "skill" | "build" | "evolution" | "standaloneSkill";
  iconKey: string;
  title: string;
  description: string;
  apply: (state: GameState) => void;
};

export function buildUpgradePool(state: GameState): UpgradeOption[] {
  const options: UpgradeOption[] = [
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
      }
    },
    {
      id: "cooldown",
      kind: "stat",
      iconKey: "icon-cooldown",
      title: t("cooldownTitle"),
      description: t("cooldownDescription"),
      apply: ({ player }) => {
        player.stats.cooldownMultiplier *= 0.9;
      }
    },
    {
      id: "speed",
      kind: "stat",
      iconKey: "icon-speed",
      title: t("speedTitle"),
      description: t("speedDescription", { current: state.player.stats.moveSpeed, next: state.player.stats.moveSpeed + 18 }),
      apply: ({ player }) => {
        player.stats.moveSpeed += 18;
      }
    },
    {
      id: "pickup",
      kind: "stat",
      iconKey: "icon-pickup",
      title: t("pickupTitle"),
      description: t("pickupDescription", { current: state.player.stats.pickupRange, next: state.player.stats.pickupRange + 28 }),
      apply: ({ player }) => {
        player.stats.pickupRange += 28;
      }
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
      }
    }
  ];

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
      apply: ({ evolvedWeapons }) => {
        evolvedWeapons.set(config.baseWeaponId, evolutionId);
      }
    });
  }

  for (const weaponId of Object.keys(WEAPON_CONFIGS) as WeaponId[]) {
    const config = WEAPON_CONFIGS[weaponId];
    const level = state.weaponLevels.get(weaponId) ?? 0;
    if (level >= 5) {
      continue;
    }
    if (!config.availableInUpgradePool) {
      continue;
    }

    const label = weaponName(weaponId);
    options.push({
      id: `weapon-${weaponId}`,
      kind: "weapon",
      iconKey: config.iconKey,
      title: level === 0 ? t("unlock", { name: label }) : t("weaponLevel", { name: label, level: level + 1 }),
      description: level === 0 ? t("addWeapon", { name: label }) : t("improveWeapon", { level }),
      apply: ({ weaponLevels }) => {
        weaponLevels.set(weaponId, level + 1);
      }
    });
  }

  for (const buildPathId of Object.keys(BUILD_PATH_CONFIGS) as BuildPathId[]) {
    const config = BUILD_PATH_CONFIGS[buildPathId];
    const level = state.buildPathLevels.get(buildPathId) ?? 0;
    if (level >= config.maxLevel) {
      continue;
    }

    const nextLevel = level + 1;
    options.push({
      id: `build-${buildPathId}`,
      kind: "build",
      iconKey: config.iconKey,
      title:
        level === 0
          ? t("buildUnlock", { name: buildPathName(buildPathId) })
          : t("buildLevel", { name: buildPathName(buildPathId), level: nextLevel }),
      description: config.describe(state, nextLevel),
      apply: (gameState) => {
        gameState.buildPathLevels.set(buildPathId, nextLevel);
        config.apply(gameState, nextLevel);
      }
    });
  }

  for (const skillId of Object.keys(SKILL_CONFIGS) as SkillId[]) {
    const config = SKILL_CONFIGS[skillId];
    const level = state.skillLevels.get(skillId) ?? 0;
    if (config.kind !== "combo" || level >= config.maxLevel || !state.unlockedSkills.has(skillId)) {
      continue;
    }

    const nextLevel = level + 1;
    const label = skillName(skillId);
    options.push({
      id: `skill-${skillId}`,
      kind: "skill",
      iconKey: config.iconKey,
      title: level === 0 ? t("learn", { name: label }) : t("skillLevel", { name: label, level: nextLevel }),
      description: config.describe(state, nextLevel),
      apply: (gameState) => {
        gameState.skillLevels.set(skillId, nextLevel);
        config.apply(gameState, nextLevel);
      }
    });
  }

  const learnedStandaloneCount = [...state.skillLevels.entries()].filter(
    ([skillId, level]) => level > 0 && SKILL_CONFIGS[skillId].kind === "standalone"
  ).length;
  const standaloneUnlocked = state.devMode.enabled || state.elapsedSec >= 300 || state.bossDefeats.size > 0;
  if (standaloneUnlocked && learnedStandaloneCount < 2) {
    for (const skillId of Object.keys(SKILL_CONFIGS) as SkillId[]) {
      const config = SKILL_CONFIGS[skillId];
      const level = state.skillLevels.get(skillId) ?? 0;
      if (config.kind !== "standalone" || level >= config.maxLevel) {
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
        apply: (gameState) => {
          gameState.skillLevels.set(skillId, nextLevel);
          config.apply(gameState, nextLevel);
        }
      });
    }
  }

  return options;
}
