import type { EnemyId } from "./enemies";

export type EliteTrait = {
  enemyId: EnemyId;
  hpMultiplier: number;
  moveSpeedMultiplier: number;
  damageMultiplier: number;
  tint: number;
  labelKey: "eliteQingcheng" | "eliteDemonic" | "eliteSongshan" | "elite";
};

const DEFAULT_ELITE_TRAIT: EliteTrait = {
  enemyId: "slime",
  hpMultiplier: 2.4,
  moveSpeedMultiplier: 1.12,
  damageMultiplier: 1.08,
  tint: 0x92f5bd,
  labelKey: "elite"
};

const ELITE_TRAITS: Partial<Record<EnemyId, EliteTrait>> = {
  slime: {
    enemyId: "slime",
    hpMultiplier: 2,
    moveSpeedMultiplier: 1.12,
    damageMultiplier: 1.08,
    tint: 0x92f5bd,
    labelKey: "eliteQingcheng"
  },
  bat: {
    enemyId: "bat",
    hpMultiplier: 1.8,
    moveSpeedMultiplier: 1.35,
    damageMultiplier: 1.18,
    tint: 0xff73d2,
    labelKey: "eliteDemonic"
  },
  golem: {
    enemyId: "golem",
    hpMultiplier: 2.9,
    moveSpeedMultiplier: 0.88,
    damageMultiplier: 1.35,
    tint: 0xffd36a,
    labelKey: "eliteSongshan"
  }
};

export function eliteTraitFor(enemyId: EnemyId): EliteTrait {
  return ELITE_TRAITS[enemyId] ?? { ...DEFAULT_ELITE_TRAIT, enemyId };
}
