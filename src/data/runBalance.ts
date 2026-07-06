import type { EnemyId } from "./enemies";
import { GAME_DURATION_SEC } from "./waves";
import { clamp } from "../utils/math";

export const RUN_BALANCE = {
  eliteSpawn: {
    baseChance: 0.045,
    growthPerSec: 0.000062,
    capChance: 0.14
  },
  spawnPressure: {
    lateRamp: 0.42,
    floor: 0.55
  },
  bossHpMultiplier: {
    minorBoss: 0.96,
    midBoss: 0.94,
    greatBoss: 0.92,
    megaBoss: 0.9,
    finalBoss: 0.88
  },
  bossSkillCooldownScale: 1.1,
  timeCombat: {
    hpScaleMax: 1.68,
    damageScaleMax: 1.28,
    easingPower: 1.2,
    lateRampStartSec: 540,
    lateRampBonus: 0.42,
    lateRampPower: 0.85,
    lateRampCap: 1.12
  },
  pressureWaveSpawnMultiplier: 1.4,
  exp: {
    minionDropMultiplier: 1.15,
    earlyLevelEaseBoost: 1.38,
    earlyDrop: {
      peakMultiplier: 1.55,
      fadeSec: 300
    }
  },
  /** Early-run outgoing damage boost; fades so late-run pressure stays unchanged. */
  earlyWeaponDamage: {
    peakMultiplier: 2.15,
    fadeSec: 360
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
  if (level >= 22) {
    return 1;
  }
  const baseEase = 0.42 + (level / 18) * 0.48;
  const boosted = 1 - (1 - baseEase) / RUN_BALANCE.exp.earlyLevelEaseBoost;
  return boosted;
}

export function earlyExpDropMultiplier(elapsedSec: number): number {
  const { peakMultiplier, fadeSec } = RUN_BALANCE.exp.earlyDrop;
  const progress = clamp(elapsedSec / fadeSec, 0, 1);
  return 1 + (1 - progress) * (peakMultiplier - 1);
}

export function earlyOutgoingDamageMultiplier(elapsedSec: number): number {
  const { peakMultiplier, fadeSec } = RUN_BALANCE.earlyWeaponDamage;
  const progress = clamp(elapsedSec / fadeSec, 0, 1);
  return 1 + (1 - progress) * (peakMultiplier - 1);
}
