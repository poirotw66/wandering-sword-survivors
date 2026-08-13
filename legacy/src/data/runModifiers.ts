import type { GameState } from "../game/GameState";
import type { RunRecord } from "../systems/AchievementSystem";
import { shuffle } from "../utils/random";
import { locale, t } from "../i18n";

export type RunModifierId = "ironTrial" | "jadeFlow" | "mistFoot" | "bloodOath" | "hermitGift" | "sectChase";

export type RunModifierConfig = {
  id: RunModifierId;
  renownRequired: number;
  bossUnlock?: RunRecord["bossDefeatsSeen"][number];
  eliteChanceBonus: number;
  expDropMultiplier: number;
  scoreMultiplier: number;
  themeIntervalMultiplier: number;
  enemySpeedMultiplier: number;
  damageMultiplier: number;
  moveSpeedBonus: number;
  dodgeChanceBonus: number;
  bonusRerolls: number;
};

export const RUN_MODIFIER_CONFIGS: Record<RunModifierId, RunModifierConfig> = {
  ironTrial: {
    id: "ironTrial",
    renownRequired: 0,
    eliteChanceBonus: 0.05,
    expDropMultiplier: 1,
    scoreMultiplier: 1,
    themeIntervalMultiplier: 1,
    enemySpeedMultiplier: 1,
    damageMultiplier: 0.12,
    moveSpeedBonus: 0,
    dodgeChanceBonus: 0,
    bonusRerolls: 0
  },
  jadeFlow: {
    id: "jadeFlow",
    renownRequired: 0,
    eliteChanceBonus: 0,
    expDropMultiplier: 1.15,
    scoreMultiplier: 1,
    themeIntervalMultiplier: 1,
    enemySpeedMultiplier: 1,
    damageMultiplier: 0,
    moveSpeedBonus: 0,
    dodgeChanceBonus: 0,
    bonusRerolls: 0
  },
  mistFoot: {
    id: "mistFoot",
    renownRequired: 1500,
    eliteChanceBonus: 0,
    expDropMultiplier: 1,
    scoreMultiplier: 1,
    themeIntervalMultiplier: 1,
    enemySpeedMultiplier: 1,
    damageMultiplier: 0,
    moveSpeedBonus: 14,
    dodgeChanceBonus: 0.05,
    bonusRerolls: 0
  },
  bloodOath: {
    id: "bloodOath",
    renownRequired: 0,
    bossUnlock: "minorBoss",
    eliteChanceBonus: 0,
    expDropMultiplier: 1,
    scoreMultiplier: 1.2,
    themeIntervalMultiplier: 1,
    enemySpeedMultiplier: 1.08,
    damageMultiplier: 0,
    moveSpeedBonus: 0,
    dodgeChanceBonus: 0,
    bonusRerolls: 0
  },
  hermitGift: {
    id: "hermitGift",
    renownRequired: 3000,
    eliteChanceBonus: 0,
    expDropMultiplier: 1,
    scoreMultiplier: 1,
    themeIntervalMultiplier: 1,
    enemySpeedMultiplier: 1,
    damageMultiplier: -0.08,
    moveSpeedBonus: 0,
    dodgeChanceBonus: 0,
    bonusRerolls: 1
  },
  sectChase: {
    id: "sectChase",
    renownRequired: 0,
    bossUnlock: "midBoss",
    eliteChanceBonus: 0,
    expDropMultiplier: 1,
    scoreMultiplier: 1,
    themeIntervalMultiplier: 0.85,
    enemySpeedMultiplier: 1,
    damageMultiplier: 0,
    moveSpeedBonus: 0,
    dodgeChanceBonus: 0,
    bonusRerolls: 0
  }
};

const RUN_MODIFIER_ORDER: RunModifierId[] = [
  "ironTrial",
  "jadeFlow",
  "mistFoot",
  "bloodOath",
  "hermitGift",
  "sectChase"
];

export function isRunModifierUnlocked(record: RunRecord, id: RunModifierId): boolean {
  const config = RUN_MODIFIER_CONFIGS[id];
  if (config.bossUnlock && record.bossDefeatsSeen.includes(config.bossUnlock)) {
    return true;
  }
  if (config.renownRequired > 0) {
    return record.totalRenown >= config.renownRequired;
  }
  if (config.bossUnlock) {
    return false;
  }
  return true;
}

export function unlockedRunModifiers(record: RunRecord): RunModifierId[] {
  return RUN_MODIFIER_ORDER.filter((id) => isRunModifierUnlocked(record, id));
}

export function rollRunModifierChoices(record: RunRecord, count = 3): RunModifierId[] {
  const pool = unlockedRunModifiers(record);
  if (pool.length <= count) {
    return [...pool];
  }
  return shuffle(pool).slice(0, count);
}

export function normalizeRunModifier(
  record: RunRecord,
  choices: RunModifierId[],
  requested?: string | null
): RunModifierId {
  const fallback = choices[0] ?? unlockedRunModifiers(record)[0] ?? "ironTrial";
  if (requested && choices.includes(requested as RunModifierId)) {
    return requested as RunModifierId;
  }
  return fallback;
}

export function runModifierConfig(id: RunModifierId | null | undefined): RunModifierConfig | undefined {
  if (!id) {
    return undefined;
  }
  return RUN_MODIFIER_CONFIGS[id];
}

export function applyRunModifier(state: GameState, modifierId: RunModifierId): void {
  const config = RUN_MODIFIER_CONFIGS[modifierId];
  state.runModifierId = modifierId;
  state.player.stats.damageMultiplier += config.damageMultiplier;
  state.player.stats.moveSpeed += config.moveSpeedBonus;
  state.player.stats.dodgeChance = Math.min(0.42, state.player.stats.dodgeChance + config.dodgeChanceBonus);
  state.rerolls += config.bonusRerolls;
}

export function runModifierEliteBonus(modifierId: RunModifierId | null | undefined): number {
  return runModifierConfig(modifierId)?.eliteChanceBonus ?? 0;
}

export function runModifierExpMultiplier(modifierId: RunModifierId | null | undefined): number {
  return runModifierConfig(modifierId)?.expDropMultiplier ?? 1;
}

export function runModifierScoreMultiplier(modifierId: RunModifierId | null | undefined): number {
  return runModifierConfig(modifierId)?.scoreMultiplier ?? 1;
}

export function runModifierThemeIntervalMultiplier(modifierId: RunModifierId | null | undefined): number {
  return runModifierConfig(modifierId)?.themeIntervalMultiplier ?? 1;
}

export function runModifierEnemySpeedMultiplier(modifierId: RunModifierId | null | undefined): number {
  return runModifierConfig(modifierId)?.enemySpeedMultiplier ?? 1;
}

export function runModifierLabel(modifierId: RunModifierId): string {
  return t(`runModifier_${modifierId}_title` as Parameters<typeof t>[0]);
}

export function runModifierDescription(modifierId: RunModifierId): string {
  return t(`runModifier_${modifierId}_desc` as Parameters<typeof t>[0]);
}

export function runModifierSectionLabel(): string {
  return locale() === "zh-TW" ? "江湖際遇" : "Jianghu Encounter";
}

export function formatRunModifierToast(modifierId: RunModifierId): string {
  return t("runModifierToast", { name: runModifierLabel(modifierId) });
}
