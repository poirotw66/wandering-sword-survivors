import type { GameState } from "../game/GameState";
import { t } from "../i18n";

export type BuildPathId = "swordSect" | "qiSect" | "footworkSect" | "wineSwordSect";

export type BuildPathConfig = {
  id: BuildPathId;
  iconKey: string;
  maxLevel: number;
  title: () => string;
  describe: (state: GameState, nextLevel: number) => string;
  apply: (state: GameState, nextLevel: number) => void;
};

export const BUILD_PATH_CONFIGS: Record<BuildPathId, BuildPathConfig> = {
  swordSect: {
    id: "swordSect",
    iconKey: "icon-build-sword",
    maxLevel: 8,
    title: () => t("buildSwordTitle"),
    describe: (_state, nextLevel) => t("buildSwordDescription", { crit: 6, damage: 10, level: nextLevel }),
    apply: ({ player }, nextLevel) => {
      player.stats.damageMultiplier += 0.1;
      player.stats.critChance += 0.06;
      player.stats.critMultiplier += nextLevel % 3 === 0 ? 0.15 : 0.05;
    }
  },
  qiSect: {
    id: "qiSect",
    iconKey: "icon-build-qi",
    maxLevel: 8,
    title: () => t("buildQiTitle"),
    describe: (_state, nextLevel) => t("buildQiDescription", { area: 8, leech: 1 + Math.floor(nextLevel / 2) }),
    apply: ({ player }, nextLevel) => {
      player.stats.areaMultiplier += 0.08;
      player.stats.maxHp += 6;
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 8 + nextLevel);
    }
  },
  footworkSect: {
    id: "footworkSect",
    iconKey: "icon-build-footwork",
    maxLevel: 8,
    title: () => t("buildFootworkTitle"),
    describe: (_state, nextLevel) => t("buildFootworkDescription", { speed: 12, dodge: 3, pickup: 14 + nextLevel }),
    apply: ({ player }, nextLevel) => {
      player.stats.moveSpeed += 12;
      player.stats.pickupRange += 14 + nextLevel;
      player.stats.dodgeChance = Math.min(0.42, player.stats.dodgeChance + 0.03);
    }
  },
  wineSwordSect: {
    id: "wineSwordSect",
    iconKey: "icon-build-wine",
    maxLevel: 8,
    title: () => t("buildWineTitle"),
    describe: (_state, nextLevel) => t("buildWineDescription", { cooldown: 6, combo: 4, burst: 8 + nextLevel }),
    apply: ({ player }, nextLevel) => {
      player.stats.cooldownMultiplier *= 0.94;
      player.stats.comboChance = Math.min(0.36, player.stats.comboChance + 0.04);
      player.stats.burstMultiplier += (8 + nextLevel) / 100;
    }
  }
};
