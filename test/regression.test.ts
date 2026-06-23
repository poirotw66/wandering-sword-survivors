import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildUpgradePool } from "../src/data/upgrades";
import type { GameState } from "../src/game/GameState";
import { AchievementSystem, getBossSkillUnlocks, type RunRecord } from "../src/systems/AchievementSystem";
import { chooseUpgradeOptions } from "../src/systems/UpgradeSystem";
import { missingLocaleKeys, setLocale, skillName, t } from "../src/i18n";
import { EVOLUTION_CONFIGS, isEvolutionRecipeValid } from "../src/data/evolutions";
import { SKILL_CONFIGS } from "../src/data/skills";
import { WEAPON_CONFIGS } from "../src/data/weapons";
import { computeEvolutionProgress, trackedEvolutionProgress } from "../src/data/evolutionProgress";
import { formatBossUnlockDetail, formatEvolutionRecipeDetail } from "../src/data/codexDetails";
import { buildBossLegacySummary } from "../src/data/bossLegacy";
import { bossSkillConfig, bossSkillCooldown, bossSkillProfileFor, finalPhaseFor } from "../src/data/bossSkills";
import { eliteTraitFor } from "../src/data/eliteTraits";
import { difficultyDisplays, titleProgressFor } from "../src/data/metaProgression";
import { applyStartStyleBonus, nextRunGoal, normalizeStartStyle, renownShopRows, startStyleOptions } from "../src/data/metaChoices";

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
    unlockedSkillsThisRun: new Set(),
    unlockedAchievements: new Set(),
    bossDefeats: new Map(),
    highestDifficulty: 1,
    selectedDifficulty: 1,
    difficultyRewardMultiplier: 1,
    rerolls: 0,
    banishedUpgradeIds: new Set(),
    banishCharges: 1,
    renownTitle: "江湖浪客",
    evolvedArtsSeen: new Set(),
    standaloneSkillsSeen: new Set(),
    devMode: {
      enabled: false,
      timeScale: 1
    },
    ...overrides
  };
}

function createRecord(overrides: Partial<RunRecord> = {}): RunRecord {
  return {
    bestRenown: 0,
    totalRenown: 0,
    highestDifficulty: 1,
    achievements: [],
    evolvedArtsSeen: [],
    standaloneSkillsSeen: [],
    skillsSeen: [],
    bossDefeatsSeen: [],
    buildPathCounts: {},
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

  it("computes and sorts martial evolution progress for build guidance", () => {
    const state = createState({
      weaponLevels: new Map([
        ["magicBolt", 5],
        ["flameWave", 2]
      ]),
      skillLevels: new Map([
        ["duguNineSwords", 3],
        ["starAbsorption", 1]
      ])
    });

    const progress = computeEvolutionProgress(state);

    expect(progress[0]).toMatchObject({ evolutionId: "voidDuguSword", canEvolve: true, progressScore: 8 });
    expect(trackedEvolutionProgress(state, 1)[0].evolutionId).toBe("voidDuguSword");
  });

  it("adds badges and recipe hints for upgrade choices", () => {
    const options = buildUpgradePool(
      createState({
        elapsedSec: 300,
        weaponLevels: new Map([["magicBolt", 4]]),
        skillLevels: new Map([["duguNineSwords", 2]]),
        unlockedSkills: new Set(["duguNineSwords"])
      })
    );

    expect(options.some((option) => option.kind === "weapon" && option.badgeText && option.recipeHint)).toBe(true);
    expect(options.some((option) => option.kind === "skill" && option.badgeText && option.recipeHint)).toBe(true);
    expect(options.some((option) => option.kind === "standaloneSkill" && option.badgeText && !option.recipeHint)).toBe(true);
  });

  it("adds recommendation reasons for near-complete martial routes", () => {
    setLocale("en");
    const state = createState({
      weaponLevels: new Map([["magicBolt", 4]]),
      skillLevels: new Map([["duguNineSwords", 2]]),
      unlockedSkills: new Set(["duguNineSwords"])
    });

    const selected = chooseUpgradeOptions(state, buildUpgradePool(state), 3, () => 0);

    expect(selected.filter((option) => option.recommendedText).length).toBeLessThanOrEqual(2);
    expect(selected.some((option) => option.id === "weapon-magicBolt" && option.recommendationReason?.includes("Void-Cleaving"))).toBe(true);
    expect(selected.some((option) => option.id === "skill-duguNineSwords" && option.recommendationReason?.includes("Void-Cleaving"))).toBe(true);
  });

  it("banishes ordinary stat options from future pools and selections", () => {
    const state = createState({
      banishedUpgradeIds: new Set(["damage"])
    });
    const pool = buildUpgradePool(state);
    const selected = chooseUpgradeOptions(state, pool, 3, () => 0);

    expect(pool.some((option) => option.id === "damage")).toBe(false);
    expect(selected.some((option) => option.id === "damage")).toBe(false);
    expect(pool.filter((option) => option.kind === "stat").every((option) => option.banishable)).toBe(true);
    expect(pool.filter((option) => option.kind !== "stat").every((option) => !option.banishable)).toBe(true);
  });

  it("limits ordinary stat choices and favors near-complete martial routes", () => {
    const state = createState({
      weaponLevels: new Map([["magicBolt", 4]]),
      skillLevels: new Map([["duguNineSwords", 2]]),
      unlockedSkills: new Set(["duguNineSwords"])
    });

    const selected = chooseUpgradeOptions(state, buildUpgradePool(state), 3, () => 0);

    expect(selected.filter((option) => option.kind === "stat").length).toBeLessThanOrEqual(1);
    expect(selected.map((option) => option.id)).toContain("weapon-magicBolt");
    expect(selected.map((option) => option.id)).toContain("skill-duguNineSwords");
    expect(selected.map((option) => option.id)).toContain("build-swordSect");
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

  it("formats codex recipe details with discovered names and hidden heart methods", () => {
    setLocale("en");
    const discovered = formatEvolutionRecipeDetail(
      createRecord({
        evolvedArtsSeen: ["voidDuguSword"],
        skillsSeen: ["duguNineSwords"]
      }),
      "voidDuguSword"
    );
    const hidden = formatEvolutionRecipeDetail(createRecord(), "voidDuguSword");

    expect(discovered.title).toBe(t("evolution_voidDuguSword"));
    expect(discovered.body).toContain(skillName("duguNineSwords"));
    expect(hidden.title).toBe(t("unknownUltimateArt"));
    expect(hidden.body).toContain(t("hiddenHeartMethod"));
  });

  it("formats boss codex unlock details through the public unlock mapping", () => {
    setLocale("en");
    const defeated = formatBossUnlockDetail(createRecord({ bossDefeatsSeen: ["minorBoss"] }), "minorBoss");
    const hidden = formatBossUnlockDetail(createRecord(), "minorBoss");

    expect(getBossSkillUnlocks("minorBoss")).toEqual(["duguNineSwords", "zixiaDivineSkill"]);
    expect(defeated.body).toContain(skillName("duguNineSwords"));
    expect(hidden.body).toContain(t("hiddenHeartMethod"));
  });

  it("computes title progression and max title state from total renown", () => {
    expect(titleProgressFor(0)).toMatchObject({
      currentTitleKey: "renownTitleWanderer",
      nextTitleKey: "renownTitleHero",
      nextRenownRequired: 2500,
      isMaxTitle: false
    });
    expect(titleProgressFor(16000)).toMatchObject({
      currentTitleKey: "renownTitleLegend",
      isMaxTitle: true
    });
  });

  it("describes difficulty unlock states with multiplier display data", () => {
    const displays = difficultyDisplays(
      createRecord({
        totalRenown: 1200,
        highestDifficulty: 1
      })
    );

    expect(displays.find((difficulty) => difficulty.level === 1)).toMatchObject({ unlocked: true, unlockReason: "available" });
    expect(displays.find((difficulty) => difficulty.level === 2)).toMatchObject({ unlocked: true, unlockReason: "renown" });
    expect(displays.find((difficulty) => difficulty.level === 3)).toMatchObject({ unlocked: false, hpMultiplier: 1.34, speedMultiplier: 1.08 });
  });

  it("unlocks opening styles through renown or boss defeats", () => {
    setLocale("en");
    const fresh = startStyleOptions(createRecord());
    const byBoss = startStyleOptions(createRecord({ bossDefeatsSeen: ["minorBoss"] }));
    const byRenown = startStyleOptions(createRecord({ totalRenown: 5200 }));

    expect(fresh.find((option) => option.id === "swordSect")?.unlocked).toBe(true);
    expect(fresh.find((option) => option.id === "qiSect")?.unlocked).toBe(false);
    expect(byBoss.find((option) => option.id === "qiSect")?.unlocked).toBe(true);
    expect(byRenown.every((option) => option.unlocked)).toBe(true);
    expect(normalizeStartStyle(createRecord(), "wineSwordSect")).toBe("swordSect");
  });

  it("summarizes earned and upcoming renown shop tiers", () => {
    setLocale("en");
    const rows = renownShopRows(1600);

    expect(rows.find((row) => row.id === "hp")).toMatchObject({ earned: true, threshold: 500 });
    expect(rows.find((row) => row.id === "speed")).toMatchObject({ earned: true, threshold: 1500 });
    expect(rows.find((row) => row.id === "pickup")).toMatchObject({ earned: false, threshold: 3000 });
  });

  it("prioritizes next-run goals from unlocks to difficulty to mastery", () => {
    setLocale("en");
    expect(nextRunGoal(createRecord())).toContain("Unlock Qi Sect");
    expect(nextRunGoal(createRecord({ totalRenown: 5200, highestDifficulty: 1 }))).toContain("Difficulty 2");
    expect(
      nextRunGoal(
        createRecord({
          totalRenown: 5200,
          highestDifficulty: 5,
          evolvedArtsSeen: ["voidDuguSword"]
        })
      )
    ).toContain("more ultimate arts");
    expect(
      nextRunGoal(
        createRecord({
          totalRenown: 5200,
          highestDifficulty: 5,
          evolvedArtsSeen: Object.keys(EVOLUTION_CONFIGS) as (keyof typeof EVOLUTION_CONFIGS)[]
        })
      )
    ).toContain("faster clear");
  });

  it("applies the selected opening style as one build-path level", () => {
    const state = createState();

    applyStartStyleBonus(state, "footworkSect");
    const speed = state.player.stats.moveSpeed;

    expect(state.startStyleId).toBe("footworkSect");
    expect(state.buildPathLevels.get("footworkSect")).toBe(1);
    expect(state.player.stats.moveSpeed).toBeGreaterThan(188);
    expect(state.player.stats.pickupRange).toBeGreaterThan(86);

    applyStartStyleBonus(state, "footworkSect");

    expect(state.player.stats.moveSpeed).toBe(speed);
    expect(state.buildPathLevels.get("footworkSect")).toBe(1);
  });

  it("builds boss legacy summaries with heart methods and ultimate route clues", () => {
    setLocale("en");
    const summary = buildBossLegacySummary("minorBoss", ["duguNineSwords"], 26, 220);

    expect(summary.title).toContain("Rival Sect Captain");
    expect(summary.body).toContain(skillName("duguNineSwords"));
    expect(summary.body).toContain(t("evolution_voidDuguSword"));
    expect(summary.rewardExp).toBe(26);
    expect(summary.rewardScore).toBe(220);
  });

  it("defines data-driven boss skill profiles by boss tier", () => {
    expect(bossSkillProfileFor("minorBoss")?.skillIds).toEqual(["dash"]);
    expect(bossSkillProfileFor("midBoss")?.skillIds).toEqual(["dash", "fanStrike"]);
    expect(bossSkillProfileFor("greatBoss")?.skillIds).toEqual(["dash", "fanStrike", "summon"]);
    expect(bossSkillProfileFor("finalBoss")?.skillIds).toEqual(["dash", "fanStrike", "summon"]);
  });

  it("keeps boss skill timing and damage config valid", () => {
    for (const skillId of ["dash", "fanStrike", "summon"] as const) {
      const config = bossSkillConfig(skillId);
      expect(config.cooldownMs).toBeGreaterThan(0);
      expect(config.windupMs).toBeGreaterThan(0);
      expect(config.range).toBeGreaterThan(0);
      expect(config.labelKey).toMatch(/^bossTechnique/);
    }
    expect(bossSkillConfig("fanStrike").damageMultiplier).toBeGreaterThan(1);
  });

  it("gives the final boss a phase cue that speeds up techniques", () => {
    const phase = finalPhaseFor("finalBoss");

    expect(phase).toMatchObject({ hpRatio: 0.45, labelKey: "bossTechniqueFinalPhase" });
    expect(bossSkillCooldown("dash", true, "finalBoss")).toBeLessThan(bossSkillCooldown("dash", false, "finalBoss"));
    expect(finalPhaseFor("minorBoss")).toBeUndefined();
  });

  it("keeps elite family traits distinct", () => {
    const qingcheng = eliteTraitFor("slime");
    const demonic = eliteTraitFor("bat");
    const songshan = eliteTraitFor("golem");

    expect(qingcheng.labelKey).toBe("eliteQingcheng");
    expect(demonic.moveSpeedMultiplier).toBeGreaterThan(qingcheng.moveSpeedMultiplier);
    expect(songshan.hpMultiplier).toBeGreaterThan(qingcheng.hpMultiplier);
    expect(songshan.damageMultiplier).toBeGreaterThan(demonic.damageMultiplier);
  });

  it("reports potential ultimate arts when boss skills unlock", () => {
    const state = createState();
    const achievements = new AchievementSystem(state);

    const messages = achievements.recordBossDefeat("minorBoss");

    expect(messages.some((message) => message.includes("可悟絕學"))).toBe(true);
  });

  it("records evolution and standalone manual achievements", () => {
    const state = createState({
      evolvedWeapons: new Map([["magicBolt", "voidDuguSword"]])
    });
    const achievements = new AchievementSystem(state);

    achievements.recordEvolution("voidDuguSword");
    achievements.recordStandaloneSkill("yijinManual");

    expect(state.unlockedAchievements.has("firstEvolution")).toBe(true);
    expect(state.unlockedAchievements.has("voidDuguSword")).toBe(true);
    expect(state.unlockedAchievements.has("rareManual")).toBe(true);
    expect(state.unlockedAchievements.has("mixedMastery")).toBe(true);
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

  it("persists discovered ultimate arts and standalone manuals", () => {
    const record = AchievementSystem.saveRun(
      {
        score: 100,
        elapsedSec: 900,
        highestDifficulty: 2,
        achievements: ["firstEvolution"],
        evolvedArtsSeen: ["voidDuguSword"],
        standaloneSkillsSeen: ["yijinManual"],
        skillsSeen: ["duguNineSwords"],
        bossDefeatsSeen: ["minorBoss"],
        favoriteBuildPathId: "swordSect"
      },
      false
    );

    expect(record.evolvedArtsSeen).toEqual(["voidDuguSword"]);
    expect(record.standaloneSkillsSeen).toEqual(["yijinManual"]);
    expect(record.skillsSeen).toEqual(["duguNineSwords"]);
    expect(record.bossDefeatsSeen).toEqual(["minorBoss"]);
    expect(record.totalRenown).toBe(100);
    expect(record.favoriteBuildPathId).toBe("swordSect");
  });

  it("keeps Traditional Chinese and English locale keys in sync", () => {
    expect(missingLocaleKeys()).toEqual([]);
  });
});
