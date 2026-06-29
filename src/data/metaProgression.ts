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
  { level: 2, renownRequired: 1000, hpMultiplier: 1.18, damageMultiplier: 1.1, speedMultiplier: 1.05, rewardMultiplier: 1.15 },
  { level: 3, renownRequired: 3500, hpMultiplier: 1.36, damageMultiplier: 1.2, speedMultiplier: 1.09, rewardMultiplier: 1.35 },
  { level: 4, renownRequired: 8000, hpMultiplier: 1.62, damageMultiplier: 1.32, speedMultiplier: 1.13, rewardMultiplier: 1.65 },
  { level: 5, renownRequired: 15000, hpMultiplier: 1.95, damageMultiplier: 1.48, speedMultiplier: 1.17, rewardMultiplier: 2 }
];

export function metaBonusesFor(totalRenown: number): MetaBonuses {
  const progress = titleProgressFor(totalRenown);
  return {
    maxHp: 0,
    moveSpeed: 0,
    pickupRange: 0,
    rerolls: 0,
    titleKey: progress.currentTitleKey
  };
}

export function activeBonusSummary(totalRenown: number): MetaBonuses {
  return metaBonusesFor(totalRenown);
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
