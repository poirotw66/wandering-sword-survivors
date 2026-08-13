import type { EnemyId } from "./enemies";
import { EVOLUTION_CONFIGS } from "./evolutions";
import type { SkillId } from "./skills";
import { enemyName, skillName, t } from "../i18n";
import { getBossSkillUnlocks } from "../systems/AchievementSystem";

export type BossLegacySummary = {
  enemyId: EnemyId;
  bossName: string;
  unlockedSkillIds: SkillId[];
  routeNames: string[];
  rewardExp: number;
  rewardScore: number;
  title: string;
  body: string;
};

export function buildBossLegacySummary(enemyId: EnemyId, unlockedSkillIds: SkillId[], rewardExp = 0, rewardScore = 0): BossLegacySummary {
  const allSkillIds = getBossSkillUnlocks(enemyId);
  const shownSkillIds = unlockedSkillIds.length > 0 ? unlockedSkillIds : allSkillIds;
  const routeNames = shownSkillIds
    .flatMap((skillId) => Object.values(EVOLUTION_CONFIGS).filter((evolution) => evolution.requiredSkillId === skillId))
    .map((evolution) => t(evolution.nameKey as Parameters<typeof t>[0]));
  const skillText = shownSkillIds.length > 0 ? shownSkillIds.map((skillId) => skillName(skillId)).join(" / ") : t("bossLegacyNoSkill");
  const routeText = routeNames.length > 0 ? routeNames.join(" / ") : t("bossLegacyNoRoute");
  const bossName = enemyName(enemyId);

  return {
    enemyId,
    bossName,
    unlockedSkillIds,
    routeNames,
    rewardExp,
    rewardScore,
    title: t("bossLegacyTitle", { boss: bossName }),
    body: t("bossLegacyBody", {
      skills: skillText,
      routes: routeText,
      exp: rewardExp,
      renown: rewardScore
    })
  };
}
