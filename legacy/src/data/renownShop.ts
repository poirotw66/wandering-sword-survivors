import type { BuildPathId } from "./buildPaths";
import type { MetaBonuses } from "./metaProgression";
import { titleProgressFor } from "./metaProgression";
import type { GameState } from "../game/GameState";
import type { RunRecord } from "../systems/AchievementSystem";
import { locale } from "../i18n";

export type RenownShopUpgradeId = "hp" | "speed" | "pickup" | "reroll" | "banish" | "styleMastery";

export type RenownShopLevels = Partial<Record<RenownShopUpgradeId, number>>;

export type RenownShopUpgradeConfig = {
  id: RenownShopUpgradeId;
  maxLevel: number;
  costs: number[];
  title: LocalizedText;
  description: LocalizedText;
  effectText: (level: number) => string;
};

export type RenownShopRow = {
  id: RenownShopUpgradeId;
  title: string;
  description: string;
  level: number;
  maxLevel: number;
  nextCost?: number;
  effectText: string;
  canPurchase: boolean;
  isMaxed: boolean;
};

export type RenownPurchaseResult =
  | { purchased: true; cost: number; record: RunRecord }
  | { purchased: false; reason: "maxed" | "unaffordable"; record: RunRecord };

type LocalizedText = {
  zh: string;
  en: string;
};

export const RENOWN_SHOP_CONFIGS: Record<RenownShopUpgradeId, RenownShopUpgradeConfig> = {
  hp: {
    id: "hp",
    maxLevel: 5,
    costs: [300, 700, 1200, 1800, 2600],
    title: { zh: "開局氣血", en: "Opening HP" },
    description: { zh: "每層開局氣血上限 +8", en: "Start with +8 max HP per level." },
    effectText: (level) => text({ zh: `氣血 +${level * 8}`, en: `HP +${level * 8}` })
  },
  speed: {
    id: "speed",
    maxLevel: 5,
    costs: [400, 850, 1400, 2100, 3000],
    title: { zh: "開局身法", en: "Opening Speed" },
    description: { zh: "每層開局移速 +5", en: "Start with +5 move speed per level." },
    effectText: (level) => text({ zh: `身法 +${level * 5}`, en: `Speed +${level * 5}` })
  },
  pickup: {
    id: "pickup",
    maxLevel: 5,
    costs: [350, 800, 1300, 1900, 2800],
    title: { zh: "開局感知", en: "Opening Qi Sense" },
    description: { zh: "每層拾取範圍 +8", en: "Gain +8 pickup range per level." },
    effectText: (level) => text({ zh: `感知 +${level * 8}`, en: `Pickup +${level * 8}` })
  },
  reroll: {
    id: "reroll",
    maxLevel: 3,
    costs: [900, 1800, 3200],
    title: { zh: "改命機緣", en: "Fate Reroll" },
    description: { zh: "每層開局重抽 +1", en: "Start with +1 reroll per level." },
    effectText: (level) => text({ zh: `重抽 +${level}`, en: `Reroll +${level}` })
  },
  banish: {
    id: "banish",
    maxLevel: 2,
    costs: [1200, 2600],
    title: { zh: "封印令", en: "Seal Order" },
    description: { zh: "每層開局封印次數 +1", en: "Start with +1 seal charge per level." },
    effectText: (level) => text({ zh: `封印 +${level}`, en: `Seal +${level}` })
  },
  styleMastery: {
    id: "styleMastery",
    maxLevel: 4,
    costs: [1000, 2200, 3800, 5600],
    title: { zh: "流派傳承", en: "Style Mastery" },
    description: { zh: "強化所選開局流派的第一層特色", en: "Strengthens the selected opening style." },
    effectText: (level) => text({ zh: `傳承 ${level}/${4}`, en: `Mastery ${level}/${4}` })
  }
};

export const RENOWN_SHOP_ORDER: RenownShopUpgradeId[] = ["hp", "speed", "pickup", "reroll", "banish", "styleMastery"];

export function renownShopState(record: RunRecord): RenownShopRow[] {
  return RENOWN_SHOP_ORDER.map((id) => {
    const config = RENOWN_SHOP_CONFIGS[id];
    const level = renownUpgradeLevel(record, id);
    const nextCost = nextRenownUpgradeCost(record, id);
    return {
      id,
      title: text(config.title),
      description: text(config.description),
      level,
      maxLevel: config.maxLevel,
      nextCost,
      effectText: config.effectText(level),
      canPurchase: canPurchaseRenownUpgrade(record, id),
      isMaxed: level >= config.maxLevel
    };
  });
}

export function renownUpgradeLevel(record: RunRecord, upgradeId: RenownShopUpgradeId): number {
  return Math.max(0, Math.min(RENOWN_SHOP_CONFIGS[upgradeId].maxLevel, record.renownShopLevels[upgradeId] ?? 0));
}

export function nextRenownUpgradeCost(record: RunRecord, upgradeId: RenownShopUpgradeId): number | undefined {
  const level = renownUpgradeLevel(record, upgradeId);
  const config = RENOWN_SHOP_CONFIGS[upgradeId];
  return level >= config.maxLevel ? undefined : config.costs[level];
}

export function canPurchaseRenownUpgrade(record: RunRecord, upgradeId: RenownShopUpgradeId): boolean {
  const cost = nextRenownUpgradeCost(record, upgradeId);
  return cost !== undefined && record.spendableRenown >= cost;
}

export function purchaseRenownUpgrade(record: RunRecord, upgradeId: RenownShopUpgradeId): RenownPurchaseResult {
  const cost = nextRenownUpgradeCost(record, upgradeId);
  if (cost === undefined) {
    return { purchased: false, reason: "maxed", record };
  }
  if (record.spendableRenown < cost) {
    return { purchased: false, reason: "unaffordable", record };
  }

  return {
    purchased: true,
    cost,
    record: {
      ...record,
      spendableRenown: record.spendableRenown - cost,
      renownShopLevels: {
        ...record.renownShopLevels,
        [upgradeId]: renownUpgradeLevel(record, upgradeId) + 1
      }
    }
  };
}

export function metaBonusesFromShop(record: RunRecord): MetaBonuses {
  const progress = titleProgressFor(record.totalRenown);
  return {
    maxHp: renownUpgradeLevel(record, "hp") * 8,
    moveSpeed: renownUpgradeLevel(record, "speed") * 5,
    pickupRange: renownUpgradeLevel(record, "pickup") * 8,
    rerolls: renownUpgradeLevel(record, "reroll"),
    titleKey: progress.currentTitleKey
  };
}

export function banishChargesFromShop(record: RunRecord): number {
  return 1 + renownUpgradeLevel(record, "banish");
}

export function nextAffordableRenownUpgrade(record: RunRecord): RenownShopRow | undefined {
  return renownShopState(record).find((row) => row.canPurchase);
}

export function applyStyleMasteryBonus(state: GameState, styleId: BuildPathId, record: RunRecord): void {
  const level = renownUpgradeLevel(record, "styleMastery");
  if (level <= 0) {
    return;
  }

  if (styleId === "swordSect") {
    state.player.stats.damageMultiplier += 0.03 * level;
    state.player.stats.critChance += 0.01 * level;
    return;
  }
  if (styleId === "qiSect") {
    state.player.stats.maxHp += 3 * level;
    state.player.stats.hp = Math.min(state.player.stats.maxHp, state.player.stats.hp + 3 * level);
    state.player.stats.areaMultiplier += 0.02 * level;
    return;
  }
  if (styleId === "footworkSect") {
    state.player.stats.moveSpeed += 3 * level;
    state.player.stats.pickupRange += 4 * level;
    return;
  }

  state.player.stats.cooldownMultiplier *= Math.max(0.88, 1 - 0.015 * level);
  state.player.stats.comboChance = Math.min(0.42, state.player.stats.comboChance + 0.01 * level);
}

export function renownShopBalanceLine(record: RunRecord): string {
  return text({
    zh: `可用聲望 ${record.spendableRenown} / 累積聲望 ${record.totalRenown}`,
    en: `Spendable Renown ${record.spendableRenown} / Lifetime ${record.totalRenown}`
  });
}

export function formatRenownShopRow(row: RenownShopRow): string {
  const state = row.isMaxed
    ? text({ zh: "已滿", en: "Max" })
    : text({ zh: `${row.nextCost} 聲望`, en: `${row.nextCost} renown` });
  return text({
    zh: `${row.title} ${row.level}/${row.maxLevel}\n${row.effectText}｜${state}`,
    en: `${row.title} ${row.level}/${row.maxLevel}\n${row.effectText} | ${state}`
  });
}

export function formatPurchaseToast(row: RenownShopRow): string {
  return text({ zh: `修得：${row.title}`, en: `Purchased: ${row.title}` });
}

export function formatSpendableRenownGained(score: number, spendableRenown: number): string {
  return text({
    zh: `本局聲望 +${score}｜可用聲望 ${spendableRenown}`,
    en: `Run renown +${score} | Spendable ${spendableRenown}`
  });
}

function text(value: LocalizedText): string {
  return locale() === "zh-TW" ? value.zh : value.en;
}
