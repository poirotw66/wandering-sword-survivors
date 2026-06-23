import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildUpgradePool } from "../src/data/upgrades";
import type { GameState } from "../src/game/GameState";
import { AchievementSystem } from "../src/systems/AchievementSystem";
import { missingLocaleKeys, setLocale } from "../src/i18n";
import { EVOLUTION_CONFIGS, isEvolutionRecipeValid } from "../src/data/evolutions";
import { SKILL_CONFIGS } from "../src/data/skills";
import { WEAPON_CONFIGS } from "../src/data/weapons";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    }
  };
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    player: {
      stats: {
        hp: 100,
        maxHp: 100,
        moveSpeed: 188,
        pickupRange: 86,
        damageMultiplier: 1,
        cooldownMultiplier: 1,
        projectileSpeedMultiplier: 1,
        areaMultiplier: 1,
        critChance: 0.05,
        critMultiplier: 1.75,
        dodgeChance: 0,
        comboChance: 0,
        burstMultiplier: 1
      }
    } as GameState["player"],
    level: 1,
    exp: 0,
    expToNext: 8,
    score: 0,
    kills: 0,
    elapsedSec: 0,
    pausedForUpgrade: false,
    pausedForMenu: false,
    weaponLevels: new Map(),
    evolvedWeapons: new Map(),
    skillLevels: new Map(),
    buildPathLevels: new Map(),
    unlockedSkills: new Set(),
    unlockedAchievements: new Set(),
    bossDefeats: new Map(),
    highestDifficulty: 1,
    devMode: {
      enabled: false,
      timeScale: 1
    },
    ...overrides
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createStorage());
  setLocale("zh-TW");
});

describe("game regression rules", () => {
  it("keeps the upgrade pool populated before boss skills are unlocked", () => {
    const options = buildUpgradePool(createState());

    expect(options.length).toBeGreaterThan(0);
    expect(options.some((option) => option.id.startsWith("build-"))).toBe(true);
    expect(options.some((option) => option.id.startsWith("skill-"))).toBe(false);
  });

  it("provides an icon for every upgrade option shown in the manual", () => {
    const options = buildUpgradePool(
      createState({
        unlockedSkills: new Set(["duguNineSwords", "huashanFootwork", "starAbsorption", "wineSwordHeart"])
      })
    );

    expect(options).not.toHaveLength(0);
    expect(options.every((option) => option.iconKey.length > 0)).toBe(true);
  });

  it("defines ten valid martial evolution recipes without standalone heart methods", () => {
    const recipes = Object.values(EVOLUTION_CONFIGS);

    expect(recipes).toHaveLength(10);
    expect(recipes.every((recipe) => recipe.implemented)).toBe(true);
    expect(recipes.every(isEvolutionRecipeValid)).toBe(true);
    expect(recipes.every((recipe) => SKILL_CONFIGS[recipe.requiredSkillId].kind !== "standalone")).toBe(true);
  });

  it("makes all ten martial forms available in the upgrade pool", () => {
    expect(Object.values(WEAPON_CONFIGS)).toHaveLength(10);
    expect(Object.values(WEAPON_CONFIGS).every((weapon) => weapon.availableInUpgradePool)).toBe(true);
  });

  it("offers an evolution option when the required form and heart method are mastered", () => {
    const options = buildUpgradePool(
      createState({
        weaponLevels: new Map([["magicBolt", 5]]),
        skillLevels: new Map([["duguNineSwords", 3]]),
        unlockedSkills: new Set(["duguNineSwords"])
      })
    );

    expect(options.some((option) => option.id === "evolution-voidDuguSword")).toBe(true);
  });

  it("keeps standalone heart methods from creating evolution options", () => {
    const options = buildUpgradePool(
      createState({
        elapsedSec: 300,
        weaponLevels: new Map([["magicBolt", 5]]),
        skillLevels: new Map([["yijinManual", 3]])
      })
    );

    expect(options.some((option) => option.kind === "standaloneSkill")).toBe(true);
    expect(options.some((option) => option.kind === "evolution")).toBe(false);
  });

  it("unlocks staged martial skills from boss defeats", () => {
    const state = createState();
    const achievements = new AchievementSystem(state);

    achievements.recordBossDefeat("minorBoss");
    achievements.recordBossDefeat("midBoss");
    achievements.recordBossDefeat("greatBoss");
    achievements.recordBossDefeat("megaBoss");

    expect([...state.unlockedSkills]).toEqual([
      "duguNineSwords",
      "zixiaDivineSkill",
      "huashanFootwork",
      "windChasingStep",
      "starAbsorption",
      "hunyuanQi",
      "wineSwordHeart",
      "iceHeart",
      "vajraDemonSubduing"
    ]);
    expect(state.highestDifficulty).toBe(4);
  });

  it("persists best renown, highest difficulty, and fastest clear", () => {
    AchievementSystem.saveRun(
      { score: 4000, elapsedSec: 1800, highestDifficulty: 5, achievements: ["finalBoss"] },
      true
    );
    const record = AchievementSystem.saveRun(
      { score: 9000, elapsedSec: 1700, highestDifficulty: 3, achievements: ["renown10000"] },
      true
    );

    expect(record.bestRenown).toBe(9000);
    expect(record.highestDifficulty).toBe(5);
    expect(record.fastestClearSec).toBe(1700);
    expect(record.achievements).toEqual(["finalBoss", "renown10000"]);
  });

  it("keeps Traditional Chinese and English locale keys in sync", () => {
    expect(missingLocaleKeys()).toEqual([]);
  });
});
