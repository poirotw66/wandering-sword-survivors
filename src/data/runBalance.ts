import type { EnemyId } from "./enemies";
import { GAME_DURATION_SEC } from "./waves";
import { clamp } from "../utils/math";

export const RUN_BALANCE = {
  eliteSpawn: {
    baseChance: 0.04,
    growthPerSec: 0.000048,
    capChance: 0.11
  },
  spawnPressure: {
    lateRamp: 0.35,
    floor: 0.65
  },
  bossHpMultiplier: {
    minorBoss: 0.92,
    midBoss: 0.9,
    greatBoss: 0.88,
    megaBoss: 0.86,
    finalBoss: 0.85
  },
  bossSkillCooldownScale: 1.1,
  timeCombat: {
    hpScaleMax: 1.18,
    damageScaleMax: 0.92,
    easingPower: 1.35
  },
  pressureWaveSpawnMultiplier: 1.4,
  exp: {
    minionDropMultiplier: 1.05,
    earlyLevelEaseBoost: 1.06
  },
  buildPath: {
    swordCritBurst: { level5: 0.26, level8: 0.38 },
    qiKillHeal: { level3: 2, level8: 4 },
    wineCooldownShaveMs: { level5: 70, level8: 100 }
  }
} as const;

const BOSS_IDS: EnemyId[] = ["minorBoss", "midBoss", "greatBoss", "megaBoss", "finalBoss"];

export function eliteSpawnChance(elapsedSec: number): number {
  const { baseChance, growthPerSec, capChance } = RUN_BALANCE.eliteSpawn;
  return clamp(baseChance + elapsedSec * growthPerSec, baseChance, capChance);
}

export function spawnPressureMultiplier(elapsedSec: number): number {
  const { lateRamp, floor } = RUN_BALANCE.spawnPressure;
  return clamp(1 - (elapsedSec / GAME_DURATION_SEC) * lateRamp, floor, 1);
}

export function bossHpMultiplier(enemyId: EnemyId): number {
  if (!BOSS_IDS.includes(enemyId)) {
    return 1;
  }
  return RUN_BALANCE.bossHpMultiplier[enemyId as keyof typeof RUN_BALANCE.bossHpMultiplier];
}

export function combatHpMultiplier(enemyId: EnemyId, isBoss = false): number {
  return isBoss ? bossHpMultiplier(enemyId) : 1;
}

export function expDropBalanceMultiplier(isBoss: boolean): number {
  return isBoss ? 1 : RUN_BALANCE.exp.minionDropMultiplier;
}

export function earlyLevelExpEase(level: number): number {
  if (level >= 30) {
    return 1;
  }
  const baseEase = 0.7 + (level / 30) * 0.25;
  const boosted = 1 - (1 - baseEase) / RUN_BALANCE.exp.earlyLevelEaseBoost;
  return boosted;
}
