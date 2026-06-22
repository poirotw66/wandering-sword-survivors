import type { GameState } from "../game/GameState";
import { t } from "../i18n";

export type SkillId = "duguNineSwords" | "starAbsorption" | "huashanFootwork" | "wineSwordHeart";

export type SkillConfig = {
  id: SkillId;
  name: string;
  maxLevel: number;
  describe: (state: GameState, nextLevel: number) => string;
  apply: (state: GameState, nextLevel: number) => void;
};

export const SKILL_CONFIGS: Record<SkillId, SkillConfig> = {
  duguNineSwords: {
    id: "duguNineSwords",
    name: "Dugu Nine Swords",
    maxLevel: 6,
    describe: (_state, nextLevel) => t("duguDescription", { aura: nextLevel * 4 }),
    apply: ({ player }, nextLevel) => {
      player.stats.damageMultiplier += 0.16;
      player.stats.areaMultiplier += 0.04 + nextLevel * 0.005;
    }
  },
  starAbsorption: {
    id: "starAbsorption",
    name: "Star Absorption Inner Force",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("starAbsorptionSkillDescription", { heal: 18 + nextLevel * 5 }),
    apply: ({ player }, nextLevel) => {
      player.stats.maxHp += 14;
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 18 + nextLevel * 5);
    }
  },
  huashanFootwork: {
    id: "huashanFootwork",
    name: "Huashan Cloud Steps",
    maxLevel: 5,
    describe: ({ player }) => t("footworkDescription", { current: player.stats.moveSpeed, next: player.stats.moveSpeed + 14 }),
    apply: ({ player }) => {
      player.stats.moveSpeed += 14;
      player.stats.pickupRange += 12;
    }
  },
  wineSwordHeart: {
    id: "wineSwordHeart",
    name: "Wine-Tempered Sword Heart",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("wineHeartDescription", { speed: 6 + nextLevel }),
    apply: ({ player }, nextLevel) => {
      player.stats.cooldownMultiplier *= 0.93;
      player.stats.projectileSpeedMultiplier += 0.06 + nextLevel * 0.01;
    }
  }
};
