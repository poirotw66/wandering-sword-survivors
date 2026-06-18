import type { GameState } from "../game/GameState";

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
    describe: (_state, nextLevel) => `Sword damage +18%, sword aura +${nextLevel * 4}%`,
    apply: ({ player }, nextLevel) => {
      player.stats.damageMultiplier += 0.18;
      player.stats.areaMultiplier += 0.04 + nextLevel * 0.005;
    }
  },
  starAbsorption: {
    id: "starAbsorption",
    name: "Star Absorption Inner Force",
    maxLevel: 5,
    describe: (_state, nextLevel) => `Max HP +12, recover ${18 + nextLevel * 4} HP`,
    apply: ({ player }, nextLevel) => {
      player.stats.maxHp += 12;
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 18 + nextLevel * 4);
    }
  },
  huashanFootwork: {
    id: "huashanFootwork",
    name: "Huashan Cloud Steps",
    maxLevel: 5,
    describe: ({ player }) => `Move speed ${player.stats.moveSpeed} -> ${player.stats.moveSpeed + 16}, pickup range +10`,
    apply: ({ player }) => {
      player.stats.moveSpeed += 16;
      player.stats.pickupRange += 10;
    }
  },
  wineSwordHeart: {
    id: "wineSwordHeart",
    name: "Wine-Tempered Sword Heart",
    maxLevel: 5,
    describe: (_state, nextLevel) => `Cooldown -7%, projectile speed +${6 + nextLevel}%`,
    apply: ({ player }, nextLevel) => {
      player.stats.cooldownMultiplier *= 0.93;
      player.stats.projectileSpeedMultiplier += 0.06 + nextLevel * 0.01;
    }
  }
};
