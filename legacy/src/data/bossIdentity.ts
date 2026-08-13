import type { EnemyId } from "./enemies";

export type GuardFormationConfig = {
  count: number;
  minionId: EnemyId;
  damageReduction: number;
};

export type OrbitingNeedlesConfig = {
  count: number;
  cooldownMs: number;
  orbitRadius: number;
  damageMultiplier: number;
};

export type BossIdentityConfig = {
  enemyId: EnemyId;
  pursuitLockMs?: number;
  fanLingerMs?: number;
  guardFormation?: GuardFormationConfig;
  needleSectorRadians?: number;
  orbitingNeedles?: OrbitingNeedlesConfig;
};

export const BOSS_IDENTITY_CONFIGS: Partial<Record<EnemyId, BossIdentityConfig>> = {
  minorBoss: {
    enemyId: "minorBoss",
    pursuitLockMs: 1200
  },
  midBoss: {
    enemyId: "midBoss",
    fanLingerMs: 2000
  },
  greatBoss: {
    enemyId: "greatBoss",
    guardFormation: {
      count: 2,
      minionId: "golem",
      damageReduction: 0.35
    }
  },
  megaBoss: {
    enemyId: "megaBoss",
    needleSectorRadians: Math.PI / 2
  },
  finalBoss: {
    enemyId: "finalBoss",
    orbitingNeedles: {
      count: 6,
      cooldownMs: 5200,
      orbitRadius: 150,
      damageMultiplier: 1.1
    }
  }
};

export function bossIdentityFor(enemyId: EnemyId): BossIdentityConfig | undefined {
  return BOSS_IDENTITY_CONFIGS[enemyId];
}

export function bossDamageTakenMultiplier(enemyId: EnemyId, activeGuardCount: number): number {
  const identity = bossIdentityFor(enemyId);
  if (!identity?.guardFormation || activeGuardCount <= 0) {
    return 1;
  }
  return Math.max(0.2, 1 - identity.guardFormation.damageReduction);
}
