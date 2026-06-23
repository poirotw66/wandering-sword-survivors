import type { GameState } from "../game/GameState";
import type { RunRecord } from "../systems/AchievementSystem";
import { buildPathName, locale } from "../i18n";
import { BUILD_PATH_CONFIGS, type BuildPathId } from "./buildPaths";
import { DIFFICULTY_CONFIGS } from "./metaProgression";
import { EVOLUTION_CONFIGS } from "./evolutions";

export type StartStyleId = BuildPathId;

export type StartStyleOption = {
  id: StartStyleId;
  title: string;
  bonus: string;
  unlocked: boolean;
  unlockHint: string;
};

export type RenownShopRow = {
  id: "hp" | "speed" | "pickup" | "reroll";
  threshold: number;
  label: string;
  earned: boolean;
};

export const DEFAULT_START_STYLE: StartStyleId = "swordSect";

type StartStyleConfig = {
  id: StartStyleId;
  bonus: LocalizedText;
  renownRequired: number;
  bossUnlock?: RunRecord["bossDefeatsSeen"][number];
  unlockHint: (renown: number) => string;
};

type LocalizedText = {
  zh: string;
  en: string;
};

const START_STYLE_CONFIGS: StartStyleConfig[] = [
  {
    id: "swordSect",
    bonus: { zh: "劍意先成", en: "Sword intent first" },
    renownRequired: 0,
    unlockHint: () => text({ zh: "已解鎖", en: "Unlocked" })
  },
  {
    id: "qiSect",
    bonus: { zh: "內力先聚", en: "Inner force first" },
    renownRequired: 1000,
    bossUnlock: "minorBoss",
    unlockHint: () => text({ zh: "1000 聲望或擊敗首名 Boss", en: "1000 renown or defeat the first Boss" })
  },
  {
    id: "footworkSect",
    bonus: { zh: "身法先行", en: "Footwork first" },
    renownRequired: 2500,
    bossUnlock: "midBoss",
    unlockHint: () => text({ zh: "2500 聲望或擊敗中 Boss", en: "2500 renown or defeat the mid Boss" })
  },
  {
    id: "wineSwordSect",
    bonus: { zh: "酒意先燃", en: "Wine fire first" },
    renownRequired: 5000,
    bossUnlock: "megaBoss",
    unlockHint: () => text({ zh: "5000 聲望或擊敗極大 Boss", en: "5000 renown or defeat the mega Boss" })
  }
];

const RENOWN_SHOP_ROWS: Omit<RenownShopRow, "earned" | "label">[] = [
  { id: "hp", threshold: 500 },
  { id: "speed", threshold: 1500 },
  { id: "pickup", threshold: 3000 },
  { id: "reroll", threshold: 5000 }
];

const SHOP_LABELS: Record<RenownShopRow["id"], LocalizedText> = {
  hp: { zh: "開局氣血 +10", en: "Start HP +10" },
  speed: { zh: "開局身法 +8", en: "Start speed +8" },
  pickup: { zh: "開局感知 +12", en: "Start pickup +12" },
  reroll: { zh: "開局改命 +1", en: "Start reroll +1" }
};

export function startStyleOptions(record: RunRecord): StartStyleOption[] {
  return START_STYLE_CONFIGS.map((config) => {
    const unlocked =
      config.id === DEFAULT_START_STYLE ||
      record.totalRenown >= config.renownRequired ||
      (config.bossUnlock !== undefined && record.bossDefeatsSeen.includes(config.bossUnlock));
    return {
      id: config.id,
      title: buildPathName(config.id),
      bonus: text(config.bonus),
      unlocked,
      unlockHint: unlocked ? text({ zh: "已解鎖", en: "Unlocked" }) : config.unlockHint(config.renownRequired)
    };
  });
}

export function normalizeStartStyle(record: RunRecord, requested?: string | null): StartStyleId {
  const options = startStyleOptions(record);
  const match = options.find((option) => option.id === requested && option.unlocked);
  return match?.id ?? DEFAULT_START_STYLE;
}

export function applyStartStyleBonus(state: GameState, styleId: StartStyleId): void {
  const currentLevel = state.buildPathLevels.get(styleId) ?? 0;
  const nextLevel = Math.max(1, currentLevel);
  state.startStyleId = styleId;
  state.buildPathLevels.set(styleId, nextLevel);
  if (currentLevel < 1) {
    BUILD_PATH_CONFIGS[styleId].apply(state, 1);
  }
}

export function renownShopRows(totalRenown: number): RenownShopRow[] {
  return RENOWN_SHOP_ROWS.map((row) => ({
    ...row,
    label: text(SHOP_LABELS[row.id]),
    earned: totalRenown >= row.threshold
  }));
}

export function renownShopSummary(totalRenown: number): string {
  const rows = renownShopRows(totalRenown);
  const earned = rows.filter((row) => row.earned).map((row) => row.label);
  const next = rows.find((row) => !row.earned);
  const earnedText = earned.length ? earned.join(" / ") : text({ zh: "尚無", en: "None" });
  const nextText = next
    ? text({ zh: `${next.label}（${next.threshold} 聲望）`, en: `${next.label} (${next.threshold} renown)` })
    : text({ zh: "所有開局加成都已入手", en: "All start bonuses earned" });
  return text({ zh: `聲望商店：${earnedText}\n下一項：${nextText}`, en: `Renown Shop: ${earnedText}\nNext: ${nextText}` });
}

export function nextRunGoal(record: RunRecord): string {
  const lockedStyle = startStyleOptions(record).find((option) => !option.unlocked);
  if (lockedStyle) {
    return text({ zh: `解鎖 ${lockedStyle.title}：${lockedStyle.unlockHint}`, en: `Unlock ${lockedStyle.title}: ${lockedStyle.unlockHint}` });
  }

  const nextDifficulty = DIFFICULTY_CONFIGS.find((difficulty) => difficulty.level > record.highestDifficulty);
  if (nextDifficulty) {
    const reward = Math.round(nextDifficulty.rewardMultiplier * 100);
    return text({ zh: `挑戰難度 ${nextDifficulty.level}，通關獎勵 ${reward}%`, en: `Clear Difficulty ${nextDifficulty.level} for ${reward}% rewards` });
  }

  const remainingEvolutions = Object.keys(EVOLUTION_CONFIGS).length - record.evolvedArtsSeen.length;
  if (remainingEvolutions > 0) {
    return text({ zh: `再悟出 ${remainingEvolutions} 門絕學`, en: `Master ${remainingEvolutions} more ultimate arts` });
  }

  return text({ zh: "挑戰更快通關或更高聲望", en: "Chase a faster clear or higher renown" });
}

export function startStyleLabel(): string {
  return text({ zh: "開局流派", en: "Opening Style" });
}

export function formatStartStyleButton(option: StartStyleOption): string {
  return option.unlocked ? `${option.title}\n${option.bonus}` : `${option.title}\n${option.unlockHint}`;
}

export function formatNextGoalLine(goal: string): string {
  return text({ zh: `下一局目標：${goal}`, en: `Next-run target: ${goal}` });
}

export function formatStartStyleToast(styleTitle: string): string {
  return text({ zh: `開局流派：${styleTitle}`, en: `Opening style: ${styleTitle}` });
}

function text(value: LocalizedText): string {
  return locale() === "zh-TW" ? value.zh : value.en;
}
