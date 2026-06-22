import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildUpgradePool } from "../src/data/upgrades";
import type { GameState } from "../src/game/GameState";
import { AchievementSystem } from "../src/systems/AchievementSystem";
import { missingLocaleKeys, setLocale } from "../src/i18n";

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

  it("unlocks staged martial skills from boss defeats", () => {
    const state = createState();
    const achievements = new AchievementSystem(state);

    achievements.recordBossDefeat("minorBoss");
    achievements.recordBossDefeat("midBoss");
    achievements.recordBossDefeat("greatBoss");
    achievements.recordBossDefeat("megaBoss");

    expect([...state.unlockedSkills]).toEqual([
      "duguNineSwords",
      "huashanFootwork",
      "starAbsorption",
      "wineSwordHeart"
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
