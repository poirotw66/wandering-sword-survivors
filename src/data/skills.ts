import type { GameState } from "../game/GameState";
import { t } from "../i18n";

export type SkillId =
  | "duguNineSwords"
  | "starAbsorption"
  | "huashanFootwork"
  | "wineSwordHeart"
  | "zixiaDivineSkill"
  | "windChasingStep"
  | "hunyuanQi"
  | "iceHeart"
  | "vajraDemonSubduing"
  | "yijinManual"
  | "cosmosBreathing"
  | "formlessSutra"
  | "marrowCleansing"
  | "freewindMethod";

export type SkillKind = "combo" | "standalone";

export type SkillConfig = {
  id: SkillId;
  name: string;
  iconKey: string;
  kind: SkillKind;
  maxLevel: number;
  describe: (state: GameState, nextLevel: number) => string;
  apply: (state: GameState, nextLevel: number) => void;
};

export const SKILL_CONFIGS: Record<SkillId, SkillConfig> = {
  duguNineSwords: {
    id: "duguNineSwords",
    name: "Dugu Nine Swords",
    iconKey: "icon-dugu-sword",
    kind: "combo",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("duguDescription", { aura: nextLevel * 4 }),
    apply: ({ player }, nextLevel) => {
      player.stats.damageMultiplier += 0.16;
      player.stats.areaMultiplier += 0.04 + nextLevel * 0.005;
    }
  },
  starAbsorption: {
    id: "starAbsorption",
    name: "Star Absorption Inner Force",
    iconKey: "icon-star-absorption",
    kind: "combo",
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
    iconKey: "icon-huashan-footwork",
    kind: "combo",
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
    iconKey: "icon-wine-heart",
    kind: "combo",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("wineHeartDescription", { speed: 6 + nextLevel }),
    apply: ({ player }, nextLevel) => {
      player.stats.cooldownMultiplier *= 0.93;
      player.stats.projectileSpeedMultiplier += 0.06 + nextLevel * 0.01;
    }
  },
  zixiaDivineSkill: {
    id: "zixiaDivineSkill",
    name: "Violet Mist Divine Skill",
    iconKey: "icon-zixia-skill",
    kind: "combo",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("zixiaDescription", { area: 8 + nextLevel }),
    apply: ({ player }, nextLevel) => {
      player.stats.areaMultiplier += 0.08 + nextLevel * 0.004;
      player.stats.damageMultiplier += 0.06;
    }
  },
  windChasingStep: {
    id: "windChasingStep",
    name: "Chasing Wind Shadow Step",
    iconKey: "icon-wind-step",
    kind: "combo",
    maxLevel: 5,
    describe: ({ player }) => t("windStepDescription", { current: player.stats.moveSpeed, next: player.stats.moveSpeed + 18 }),
    apply: ({ player }) => {
      player.stats.moveSpeed += 18;
      player.stats.dodgeChance = Math.min(0.45, player.stats.dodgeChance + 0.04);
    }
  },
  hunyuanQi: {
    id: "hunyuanQi",
    name: "Hunyuan One-Qi Skill",
    iconKey: "icon-hunyuan-qi",
    kind: "combo",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("hunyuanDescription", { hp: 10 + nextLevel * 2 }),
    apply: ({ player }, nextLevel) => {
      player.stats.maxHp += 10 + nextLevel * 2;
      player.stats.damageMultiplier += 0.08;
    }
  },
  iceHeart: {
    id: "iceHeart",
    name: "Ice Heart Focus Method",
    iconKey: "icon-ice-heart",
    kind: "combo",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("iceHeartDescription", { crit: 3 + nextLevel }),
    apply: ({ player }, nextLevel) => {
      player.stats.critChance += (3 + nextLevel) / 100;
      player.stats.cooldownMultiplier *= 0.96;
    }
  },
  vajraDemonSubduing: {
    id: "vajraDemonSubduing",
    name: "Vajra Demon-Subduing Skill",
    iconKey: "icon-vajra-skill",
    kind: "combo",
    maxLevel: 5,
    describe: (_state, nextLevel) => t("vajraDescription", { hp: 12 + nextLevel * 3 }),
    apply: ({ player }, nextLevel) => {
      player.stats.maxHp += 12 + nextLevel * 3;
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 12);
      player.stats.damageMultiplier += 0.05;
    }
  },
  yijinManual: {
    id: "yijinManual",
    name: "Tendon-Bone Forging Manual",
    iconKey: "icon-yijin-manual",
    kind: "standalone",
    maxLevel: 3,
    describe: (_state, nextLevel) => t("yijinDescription", { hp: 24 + nextLevel * 8 }),
    apply: ({ player }, nextLevel) => {
      player.stats.maxHp += 24 + nextLevel * 8;
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 18);
    }
  },
  cosmosBreathing: {
    id: "cosmosBreathing",
    name: "Cosmos Breathing Method",
    iconKey: "icon-cosmos-breathing",
    kind: "standalone",
    maxLevel: 3,
    describe: () => t("cosmosDescription"),
    apply: ({ player }) => {
      player.stats.cooldownMultiplier *= 0.86;
      player.stats.projectileSpeedMultiplier += 0.08;
    }
  },
  formlessSutra: {
    id: "formlessSutra",
    name: "Formless Heart Sutra",
    iconKey: "icon-formless-sutra",
    kind: "standalone",
    maxLevel: 3,
    describe: () => t("formlessDescription"),
    apply: ({ player }) => {
      player.stats.damageMultiplier += 0.18;
      player.stats.areaMultiplier += 0.08;
    }
  },
  marrowCleansing: {
    id: "marrowCleansing",
    name: "Marrow-Cleansing Classic",
    iconKey: "icon-marrow-cleansing",
    kind: "standalone",
    maxLevel: 3,
    describe: () => t("marrowDescription"),
    apply: ({ player }) => {
      player.stats.maxHp += 10;
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 36);
      player.stats.pickupRange += 18;
    }
  },
  freewindMethod: {
    id: "freewindMethod",
    name: "Freewind Wandering Method",
    iconKey: "icon-freewind-method",
    kind: "standalone",
    maxLevel: 3,
    describe: () => t("freewindDescription"),
    apply: ({ player }) => {
      player.stats.moveSpeed += 24;
      player.stats.dodgeChance = Math.min(0.48, player.stats.dodgeChance + 0.06);
      player.stats.pickupRange += 20;
    }
  }
};
