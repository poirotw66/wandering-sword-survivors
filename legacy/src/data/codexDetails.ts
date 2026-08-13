import type { EnemyId } from "./enemies";
import { EVOLUTION_CONFIGS, type EvolutionId } from "./evolutions";
import { getBossSkillUnlocks, type RunRecord } from "../systems/AchievementSystem";
import { buildPathName, enemyName, skillName, t, weaponName } from "../i18n";

export type CodexDetail = {
  title: string;
  body: string;
};

export function formatEvolutionRecipeDetail(record: RunRecord, evolutionId: EvolutionId): CodexDetail {
  const config = EVOLUTION_CONFIGS[evolutionId];
  const discovered = record.evolvedArtsSeen.includes(evolutionId);
  const skillSeen = record.skillsSeen.includes(config.requiredSkillId) || record.standaloneSkillsSeen.includes(config.requiredSkillId);
  const title = discovered ? t(config.nameKey as Parameters<typeof t>[0]) : t("unknownUltimateArt");
  const weapon = weaponName(config.baseWeaponId);
  const skill = skillSeen || discovered ? skillName(config.requiredSkillId) : t("hiddenHeartMethod");
  const buildPath = config.preferredBuildPathId ? buildPathName(config.preferredBuildPathId) : t("none");

  return {
    title,
    body: discovered
      ? t("codexRecipeDiscovered", {
          weapon,
          weaponLevel: config.requiredWeaponLevel,
          skill,
          skillLevel: config.requiredSkillLevel,
          buildPath
        })
      : t("codexRecipeHidden", {
          weapon,
          weaponLevel: config.requiredWeaponLevel,
          skill,
          skillLevel: config.requiredSkillLevel,
          buildPath
        })
  };
}

export function formatBossUnlockDetail(record: RunRecord, enemyId: EnemyId): CodexDetail {
  const defeated = record.bossDefeatsSeen.includes(enemyId);
  const unlocks = getBossSkillUnlocks(enemyId);
  const unlockText =
    unlocks.length === 0
      ? t("bossUnlockNone")
      : defeated
        ? unlocks.map((skillId) => skillName(skillId)).join(" / ")
        : unlocks.map(() => t("hiddenHeartMethod")).join(" / ");

  return {
    title: defeated ? enemyName(enemyId) : t("unknownBossRecord"),
    body: t("bossUnlockDetail", {
      status: defeated ? t("defeated") : t("lockedCodexItem"),
      unlocks: unlockText
    })
  };
}
