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
  },
  huashanSwordsman: {
    enemyId: "huashanSwordsman",
    hpMultiplier: 2.1,
    moveSpeedMultiplier: 1.18,
    damageMultiplier: 1.14,
    tint: 0xb8f7ff,
    labelKey: "elite"
  },
  hengshanNun: {
    enemyId: "hengshanNun",
    hpMultiplier: 2.3,
    moveSpeedMultiplier: 1,
    damageMultiplier: 1.1,
    tint: 0xd8ffff,
    labelKey: "elite"
  },
  taishanAcolyte: {
    enemyId: "taishanAcolyte",
    hpMultiplier: 2.6,
    moveSpeedMultiplier: 0.92,
    damageMultiplier: 1.22,
    tint: 0xffd36a,
    labelKey: "elite"
  },
  riverBandit: {
    enemyId: "riverBandit",
    hpMultiplier: 1.9,
    moveSpeedMultiplier: 1.24,
    damageMultiplier: 1.16,
    tint: 0xf7a55f,
    labelKey: "elite"
  },
  medicineHeretic: {
    enemyId: "medicineHeretic",
    hpMultiplier: 2.2,
    moveSpeedMultiplier: 1.08,
    damageMultiplier: 1.2,
    tint: 0xcaff6e,
    labelKey: "elite"
  },
  sunMoonCultist: {
    enemyId: "sunMoonCultist",
    hpMultiplier: 2.4,
    moveSpeedMultiplier: 1.16,
    damageMultiplier: 1.26,
    tint: 0xff73d2,
    labelKey: "elite"
  },
  royalGuard: {
    enemyId: "royalGuard",
    hpMultiplier: 2.8,
    moveSpeedMultiplier: 0.9,
    damageMultiplier: 1.32,
    tint: 0xffd36a,
    labelKey: "elite"
  }
};

export function eliteTraitFor(enemyId: EnemyId): EliteTrait {
  return ELITE_TRAITS[enemyId] ?? { ...DEFAULT_ELITE_TRAIT, enemyId };
}
