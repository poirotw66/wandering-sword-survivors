import type { RunRecord } from "../systems/AchievementSystem";

export type MetaBonuses = {
  maxHp: number;
  moveSpeed: number;
  pickupRange: number;
  rerolls: number;
  titleKey: "renownTitleWanderer" | "renownTitleHero" | "renownTitleMaster" | "renownTitleLegend";
};

export type TitleProgress = {
  currentTitleKey: MetaBonuses["titleKey"];
  nextTitleKey?: MetaBonuses["titleKey"];
  nextRenownRequired?: number;
  isMaxTitle: boolean;
};

export type DifficultyDisplay = DifficultyConfig & {
  unlocked: boolean;
  unlockReason: "available" | "renown" | "cleared";
};

const TITLE_THRESHOLDS: { renown: number; titleKey: MetaBonuses["titleKey"] }[] = [
  { renown: 0, titleKey: "renownTitleWanderer" },
  { renown: 2500, titleKey: "renownTitleHero" },
  { renown: 8000, titleKey: "renownTitleMaster" },
  { renown: 15000, titleKey: "renownTitleLegend" }
];

export type DifficultyConfig = {
  level: number;
  renownRequired: number;
  hpMultiplier: number;
  damageMultiplier: number;
  speedMultiplier: number;
  rewardMultiplier: number;
};

export const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
  { level: 1, renownRequired: 0, hpMultiplier: 1, damageMultiplier: 1, speedMultiplier: 1, rewardMultiplier: 1 },
  { level: 2, renownRequired: 1000, hpMultiplier: 1.16, damageMultiplier: 1.08, speedMultiplier: 1.04, rewardMultiplier: 1.15 },
  { level: 3, renownRequired: 3500, hpMultiplier: 1.34, damageMultiplier: 1.18, speedMultiplier: 1.08, rewardMultiplier: 1.35 },
  { level: 4, renownRequired: 8000, hpMultiplier: 1.58, damageMultiplier: 1.3, speedMultiplier: 1.12, rewardMultiplier: 1.65 },
  { level: 5, renownRequired: 15000, hpMultiplier: 1.9, damageMultiplier: 1.45, speedMultiplier: 1.16, rewardMultiplier: 2 }
];

export function metaBonusesFor(totalRenown: number): MetaBonuses {
  const progress = titleProgressFor(totalRenown);
  return {
    maxHp: totalRenown >= 500 ? 10 : 0,
    moveSpeed: totalRenown >= 1500 ? 8 : 0,
    pickupRange: totalRenown >= 3000 ? 12 : 0,
    rerolls: totalRenown >= 5000 ? 1 : 0,
    titleKey: progress.currentTitleKey
  };
}

export function unlockedDifficulties(record: RunRecord): DifficultyConfig[] {
  return difficultyDisplays(record).filter((difficulty) => difficulty.unlocked);
}

export function difficultyForLevel(level: number): DifficultyConfig {
  return DIFFICULTY_CONFIGS.find((difficulty) => difficulty.level === level) ?? DIFFICULTY_CONFIGS[0];
}

export function titleProgressFor(totalRenown: number): TitleProgress {
  const current = [...TITLE_THRESHOLDS].reverse().find((threshold) => totalRenown >= threshold.renown) ?? TITLE_THRESHOLDS[0];
  const next = TITLE_THRESHOLDS.find((threshold) => threshold.renown > totalRenown);
  return {
    currentTitleKey: current.titleKey,
    nextTitleKey: next?.titleKey,
    nextRenownRequired: next?.renown,
    isMaxTitle: next === undefined
  };
}

export function activeBonusSummary(totalRenown: number): MetaBonuses {
  return metaBonusesFor(totalRenown);
}

export function difficultyDisplays(record: RunRecord): DifficultyDisplay[] {
  return DIFFICULTY_CONFIGS.map((difficulty) => {
    const byLevel = difficulty.level === 1;
    const byRenown = record.totalRenown >= difficulty.renownRequired;
    const byCleared = record.highestDifficulty >= difficulty.level;
    return {
      ...difficulty,
      unlocked: byLevel || byRenown || byCleared,
      unlockReason: byLevel ? "available" : byCleared ? "cleared" : "renown"
    };
  });
}
