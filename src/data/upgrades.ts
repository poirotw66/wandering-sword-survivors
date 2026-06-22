import { SKILL_CONFIGS, type SkillId } from "./skills";
import { WEAPON_CONFIGS, type WeaponId } from "./weapons";
import { BUILD_PATH_CONFIGS, type BuildPathId } from "./buildPaths";
import type { GameState } from "../game/GameState";
import { buildPathName, skillName, t, weaponName } from "../i18n";

export type UpgradeOption = {
  id: string;
  title: string;
  description: string;
  apply: (state: GameState) => void;
};

export function buildUpgradePool(state: GameState): UpgradeOption[] {
  const options: UpgradeOption[] = [
    {
      id: "damage",
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
      title: t("cooldownTitle"),
      description: t("cooldownDescription"),
      apply: ({ player }) => {
        player.stats.cooldownMultiplier *= 0.9;
      }
    },
    {
      id: "speed",
      title: t("speedTitle"),
      description: t("speedDescription", { current: state.player.stats.moveSpeed, next: state.player.stats.moveSpeed + 18 }),
      apply: ({ player }) => {
        player.stats.moveSpeed += 18;
      }
    },
    {
      id: "pickup",
      title: t("pickupTitle"),
      description: t("pickupDescription", { current: state.player.stats.pickupRange, next: state.player.stats.pickupRange + 28 }),
      apply: ({ player }) => {
        player.stats.pickupRange += 28;
      }
    },
    {
      id: "heal",
      title: t("healTitle"),
      description: t("healDescription"),
      apply: ({ player }) => {
        player.stats.maxHp += 10;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 25);
      }
    }
  ];

  for (const weaponId of Object.keys(WEAPON_CONFIGS) as WeaponId[]) {
    const level = state.weaponLevels.get(weaponId) ?? 0;
    if (level >= 5) {
      continue;
    }

    const label = weaponName(weaponId);
    options.push({
      id: `weapon-${weaponId}`,
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
    if (level >= config.maxLevel || !state.unlockedSkills.has(skillId)) {
      continue;
    }

    const nextLevel = level + 1;
    const label = skillName(skillId);
    options.push({
      id: `skill-${skillId}`,
      title: level === 0 ? t("learn", { name: label }) : t("skillLevel", { name: label, level: nextLevel }),
      description: config.describe(state, nextLevel),
      apply: (gameState) => {
        gameState.skillLevels.set(skillId, nextLevel);
        config.apply(gameState, nextLevel);
      }
    });
  }

  return options;
}
