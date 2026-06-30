import type { EnemyId } from "./enemies";

export type BossSkillId = "dash" | "fanStrike" | "summon" | "needleStorm";

export type BossSkillConfig = {
  id: BossSkillId;
  cooldownMs: number;
  windupMs: number;
  damageMultiplier: number;
  labelKey:
    | "bossTechniqueDash"
    | "bossTechniqueFanStrike"
    | "bossTechniqueSummon"
    | "bossTechniqueNeedleStorm";
  range: number;
  width: number;
  arcRadians: number;
  color: number;
};

export type BossSkillProfile = {
  enemyId: EnemyId;
  skillIds: BossSkillId[];
  finalPhase?: FinalBossPhaseConfig;
};

export type FinalBossPhaseConfig = {
  hpRatio: number;
  cooldownMultiplier: number;
  labelKey: "bossTechniqueFinalPhase";
};

const BOSS_SKILL_CONFIGS: Record<BossSkillId, BossSkillConfig> = {
  dash: {
    id: "dash",
    cooldownMs: 4200,
    windupMs: 640,
    damageMultiplier: 1,
    labelKey: "bossTechniqueDash",
    range: 310,
    width: 18,
    arcRadians: 0,
    color: 0xff7687
  },
  fanStrike: {
    id: "fanStrike",
    cooldownMs: 6200,
    windupMs: 780,
    damageMultiplier: 1.2,
    labelKey: "bossTechniqueFanStrike",
    range: 270,
    width: 160,
    arcRadians: 1.24,
    color: 0x8ff4ff
  },
  summon: {
    id: "summon",
    cooldownMs: 8200,
    windupMs: 820,
    damageMultiplier: 0,
    labelKey: "bossTechniqueSummon",
    range: 150,
    width: 150,
    arcRadians: Math.PI * 2,
    color: 0xb86bff
  },
  needleStorm: {
    id: "needleStorm",
    cooldownMs: 9600,
    windupMs: 980,
    damageMultiplier: 1.35,
    labelKey: "bossTechniqueNeedleStorm",
    range: 390,
    width: 18,
    arcRadians: Math.PI * 2,
    color: 0xff2f86
  }
};

const BOSS_SKILL_PROFILES: Partial<Record<EnemyId, BossSkillProfile>> = {
  minorBoss: { enemyId: "minorBoss", skillIds: ["dash"] },
  midBoss: { enemyId: "midBoss", skillIds: ["dash", "fanStrike"] },
  greatBoss: { enemyId: "greatBoss", skillIds: ["dash", "fanStrike", "summon"] },
  megaBoss: { enemyId: "megaBoss", skillIds: ["dash", "fanStrike", "summon"] },
  finalBoss: {
    enemyId: "finalBoss",
    skillIds: ["dash", "fanStrike", "summon", "needleStorm"],
    finalPhase: {
      hpRatio: 0.45,
      cooldownMultiplier: 0.72,
      labelKey: "bossTechniqueFinalPhase"
    }
  }
};

export function bossSkillConfig(skillId: BossSkillId): BossSkillConfig {
  return BOSS_SKILL_CONFIGS[skillId];
}

export function bossSkillProfileFor(enemyId: EnemyId): BossSkillProfile | undefined {
  return BOSS_SKILL_PROFILES[enemyId];
}

export function finalPhaseFor(enemyId: EnemyId): FinalBossPhaseConfig | undefined {
  return BOSS_SKILL_PROFILES[enemyId]?.finalPhase;
}

export function bossSkillCooldown(skillId: BossSkillId, finalPhaseActive = false, enemyId: EnemyId = "minorBoss"): number {
  const config = bossSkillConfig(skillId);
  const phase = finalPhaseActive ? finalPhaseFor(enemyId) : undefined;
  return Math.round(config.cooldownMs * (phase?.cooldownMultiplier ?? 1));
}
