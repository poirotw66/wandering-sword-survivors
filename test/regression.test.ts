import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildSkillLoadoutSlots, buildWeaponLoadoutSlots } from "../src/data/loadoutEntries";
import { isMartialLoadoutComplete, learnedSkillCount } from "../src/data/loadoutLimits";
import { buildUpgradePool, isEndgameUpgradeUnlocked } from "../src/data/upgrades";
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
import { ENEMY_CONFIGS } from "../src/data/enemies";
import { archetypeConfigFor, ordinaryEnemyBehaviorMap } from "../src/data/minionBehaviors";
import { difficultyDisplays, titleProgressFor } from "../src/data/metaProgression";
import { applyStartStyleBonus, nextRunGoal, normalizeStartStyle, renownShopRows, startStyleOptions } from "../src/data/metaChoices";
import { SPAWN_DENSITY, SPAWN_WAVES } from "../src/data/waves";
import { expToNextForLevel } from "../src/data/expCurve";
import { estimateBossTimeToDefeat, estimateWeaponDps } from "../src/data/combatMetrics";
import { isBuildPathUpgradeUnlocked, isStandaloneSkillPoolUnlocked } from "../src/data/upgradeUnlocks";
import { formatCompactNumber } from "../src/utils/math";
import {
  canPurchaseRenownUpgrade,
  metaBonusesFromShop,
  nextAffordableRenownUpgrade,
  purchaseRenownUpgrade,
  renownShopState,
  type RenownShopUpgradeId
} from "../src/data/renownShop";

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
    expToNext: expToNextForLevel(1),
    score: 0,
    kills: 0,
    elapsedSec: 0,
    pausedForUpgrade: false,
    pausedForMenu: false,
    pausedForStatus: false,
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
    spendableRenown: 0,
    highestDifficulty: 1,
    achievements: [],
    evolvedArtsSeen: [],
    standaloneSkillsSeen: [],
    skillsSeen: [],
    bossDefeatsSeen: [],
    buildPathCounts: {},
    renownShopLevels: {},
    ...overrides
  };
}

function createMasteredLoadoutState(overrides: Partial<GameState> = {}): GameState {
  return createState({
    weaponLevels: new Map([
      ["magicBolt", 5],
      ["orbitBlade", 5],
      ["flameWave", 5],
      ["thunderStrike", 5],
      ["blossomBlade", 5],
      ["galeSword", 5]
    ]),
    skillLevels: new Map([
      ["duguNineSwords", 5],
      ["huashanFootwork", 5],
      ["starAbsorption", 5],
      ["wineSwordHeart", 5],
      ["zixiaDivineSkill", 5],
      ["windChasingStep", 5]
    ]),
    evolvedWeapons: new Map([
      ["magicBolt", "voidDuguSword"],
      ["orbitBlade", "windClearSwordArray"],
      ["flameWave", "starDrainingPalm"],
      ["thunderStrike", "drunkenShadowNineSwords"],
      ["blossomBlade", "violetMistBlossomSword"],
      ["galeSword", "shadowlessGaleSlash"]
    ]),
    unlockedSkills: new Set([
      "duguNineSwords",
      "huashanFootwork",
      "starAbsorption",
      "wineSwordHeart",
      "zixiaDivineSkill",
      "windChasingStep"
    ]),
    ...overrides
  });
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createStorage());
  setLocale("zh-TW");
});

describe("game regression rules", () => {
  it("includes combo heart methods in the upgrade pool from the start", () => {
    const options = buildUpgradePool(createState());

    expect(options.length).toBeGreaterThan(0);
    expect(options.some((option) => option.id.startsWith("weapon-"))).toBe(true);
    expect(options.some((option) => option.id.startsWith("skill-"))).toBe(true);
    expect(options.some((option) => option.id.startsWith("build-"))).toBe(false);
    expect(options.some((option) => option.kind === "stat")).toBe(false);
  });

  it("unlocks stat and build upgrades after the martial loadout is complete", () => {
    const mastered = createMasteredLoadoutState();
    const options = buildUpgradePool(mastered);

    expect(isMartialLoadoutComplete(mastered)).toBe(true);
    expect(options.some((option) => option.kind === "stat")).toBe(true);
    expect(options.some((option) => option.id.startsWith("build-"))).toBe(true);
    expect(isEndgameUpgradeUnlocked(mastered)).toBe(true);
    expect(isEndgameUpgradeUnlocked(createState())).toBe(false);
  });

  it("keeps stat and build upgrades locked when an eligible ultimate art is still unmastered", () => {
    const almostDone = createMasteredLoadoutState({
      evolvedWeapons: new Map([
        ["orbitBlade", "windClearSwordArray"],
        ["flameWave", "starDrainingPalm"],
        ["thunderStrike", "drunkenShadowNineSwords"],
        ["blossomBlade", "violetMistBlossomSword"],
        ["galeSword", "shadowlessGaleSlash"]
      ])
    });

    expect(isMartialLoadoutComplete(almostDone)).toBe(false);
    expect(buildUpgradePool(almostDone).some((option) => option.kind === "stat")).toBe(false);
    expect(buildUpgradePool(almostDone).some((option) => option.id.startsWith("build-"))).toBe(false);
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

  it("hides new weapons when six forms are learned but keeps level-up options", () => {
    const state = createState({
      weaponLevels: new Map([
        ["magicBolt", 2],
        ["orbitBlade", 1],
        ["flameWave", 1],
        ["thunderStrike", 1],
        ["starVortex", 1],
        ["blossomBlade", 1]
      ])
    });
    const options = buildUpgradePool(state);

    expect(options.some((option) => option.id === "weapon-galeSword")).toBe(false);
    expect(options.some((option) => option.id === "weapon-magicBolt")).toBe(true);
    expect(options.some((option) => option.id === "weapon-orbitBlade")).toBe(true);
  });

  it("hides new heart methods when six are learned but keeps level-up options", () => {
    const state = createState({
      unlockedSkills: new Set([
        "duguNineSwords",
        "huashanFootwork",
        "starAbsorption",
        "wineSwordHeart",
        "zixiaDivineSkill",
        "windChasingStep",
        "hunyuanQi"
      ]),
      skillLevels: new Map([
        ["duguNineSwords", 2],
        ["huashanFootwork", 1],
        ["starAbsorption", 1],
        ["wineSwordHeart", 1],
        ["zixiaDivineSkill", 1],
        ["windChasingStep", 1]
      ])
    });
    const options = buildUpgradePool(state);

    expect(options.some((option) => option.id === "skill-hunyuanQi")).toBe(false);
    expect(options.some((option) => option.id === "skill-duguNineSwords")).toBe(true);
    expect(options.some((option) => option.id === "skill-huashanFootwork")).toBe(true);
  });

  it("shows learned heart methods in loadout slots after upgrade apply", () => {
    const state = createState({
      unlockedSkills: new Set(["duguNineSwords", "huashanFootwork"])
    });
    const learnHuashan = buildUpgradePool(state).find((option) => option.id === "skill-huashanFootwork");
    const learnDugu = buildUpgradePool(state).find((option) => option.id === "skill-duguNineSwords");

    expect(learnHuashan).toBeDefined();
    expect(learnDugu).toBeDefined();

    learnHuashan?.apply(state);
    learnDugu?.apply(state);

    expect(learnedSkillCount(state)).toBe(2);
    const slots = buildSkillLoadoutSlots(state);
    expect(slots[0]).toMatchObject({ iconKey: "icon-huashan-footwork", level: 1 });
    expect(slots[1]).toMatchObject({ iconKey: "icon-dugu-sword", level: 1 });
    expect(slots[2]).toEqual({});
  });

  it("shows evolved forms in weapon loadout slots", () => {
    const state = createState({
      weaponLevels: new Map([["magicBolt", 5]]),
      evolvedWeapons: new Map([["magicBolt", "voidDuguSword"]])
    });

    const slots = buildWeaponLoadoutSlots(state);
    expect(slots[0]).toMatchObject({ iconKey: "icon-evolution-dugu", level: 5 });
  });

  it("offers an evolution option when the required form and heart method are mastered", () => {
    const options = buildUpgradePool(
      createState({
        weaponLevels: new Map([["magicBolt", 5]]),
        skillLevels: new Map([["duguNineSwords", 5]]),
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
        ["duguNineSwords", 5],
        ["starAbsorption", 1]
      ])
    });

    const progress = computeEvolutionProgress(state);

    expect(progress[0]).toMatchObject({ evolutionId: "voidDuguSword", canEvolve: true, progressScore: 10 });
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
    const state = createMasteredLoadoutState({
      banishedUpgradeIds: new Set(["damage"])
    });
    const pool = buildUpgradePool(state);
    const selected = chooseUpgradeOptions(state, pool, 3, () => 0);

    expect(pool.some((option) => option.id === "damage")).toBe(false);
    expect(selected.some((option) => option.id === "damage")).toBe(false);
    expect(pool.filter((option) => option.kind === "stat").every((option) => option.banishable)).toBe(true);
    expect(pool.filter((option) => option.kind !== "stat").every((option) => !option.banishable)).toBe(true);
  });

  it("prioritizes martial upgrades before the endgame phase", () => {
    const state = createState({
      weaponLevels: new Map([["magicBolt", 4]]),
      skillLevels: new Map([["duguNineSwords", 2]]),
      unlockedSkills: new Set(["duguNineSwords"])
    });

    const selected = chooseUpgradeOptions(state, buildUpgradePool(state), 3, () => 0);

    expect(selected.every((option) => option.kind === "weapon" || option.kind === "skill")).toBe(true);
    expect(selected.map((option) => option.id)).toContain("weapon-magicBolt");
    expect(selected.map((option) => option.id)).toContain("skill-duguNineSwords");
  });

  it("limits ordinary stat choices once only stat and build upgrades remain", () => {
    const state = createMasteredLoadoutState();

    const selected = chooseUpgradeOptions(state, buildUpgradePool(state), 3, () => 0);

    expect(selected.filter((option) => option.kind === "stat").length).toBeLessThanOrEqual(1);
    expect(selected.every((option) => option.kind === "stat" || option.kind === "build")).toBe(true);
    expect(selected.some((option) => option.id.startsWith("build-"))).toBe(true);
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
    expect(displays.find((difficulty) => difficulty.level === 3)).toMatchObject({ unlocked: false, hpMultiplier: 1.36, speedMultiplier: 1.09 });
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

  it("migrates old records with spendable renown and empty shop levels", () => {
    localStorage.setItem(
      "sword-survivors-record",
      JSON.stringify({
        bestRenown: 1000,
        totalRenown: 2400,
        highestDifficulty: 2,
        achievements: [],
        evolvedArtsSeen: [],
        standaloneSkillsSeen: [],
        skillsSeen: [],
        bossDefeatsSeen: [],
        buildPathCounts: {}
      })
    );

    const record = AchievementSystem.readRecord();

    expect(record.totalRenown).toBe(2400);
    expect(record.spendableRenown).toBe(2400);
    expect(record.renownShopLevels).toEqual({});
  });

  it("adds run score to spendable renown during settlement", () => {
    localStorage.setItem(
      "sword-survivors-record",
      JSON.stringify(createRecord({ totalRenown: 2000, spendableRenown: 500 }))
    );

    const record = AchievementSystem.saveRun(
      { score: 900, elapsedSec: 300, highestDifficulty: 1, achievements: [] },
      false
    );

    expect(record.totalRenown).toBe(2900);
    expect(record.spendableRenown).toBe(1400);
  });

  it("purchases renown shop upgrades and blocks unaffordable or maxed upgrades", () => {
    const affordable = createRecord({ spendableRenown: 900 });
    const purchased = purchaseRenownUpgrade(affordable, "hp");
    const unaffordable = purchaseRenownUpgrade(createRecord({ spendableRenown: 100 }), "hp");
    const maxed = purchaseRenownUpgrade(
      createRecord({ spendableRenown: 99999, renownShopLevels: { hp: 5 } }),
      "hp"
    );

    expect(purchased.purchased).toBe(true);
    expect(purchased.record.spendableRenown).toBe(600);
    expect(purchased.record.renownShopLevels.hp).toBe(1);
    expect(unaffordable).toMatchObject({ purchased: false, reason: "unaffordable" });
    expect(maxed).toMatchObject({ purchased: false, reason: "maxed" });
  });

  it("calculates opening meta bonuses from purchased shop levels", () => {
    const record = createRecord({
      totalRenown: 9000,
      renownShopLevels: { hp: 2, speed: 3, pickup: 1, reroll: 2 }
    });
    const bonuses = metaBonusesFromShop(record);

    expect(bonuses).toMatchObject({
      maxHp: 16,
      moveSpeed: 15,
      pickupRange: 8,
      rerolls: 2,
      titleKey: "renownTitleMaster"
    });
  });

  it("prioritizes affordable shop upgrades in next-run goals", () => {
    setLocale("en");
    const record = createRecord({ spendableRenown: 400 });

    expect(canPurchaseRenownUpgrade(record, "hp")).toBe(true);
    expect(nextAffordableRenownUpgrade(record)?.id).toBe("hp");
    expect(nextRunGoal(record)).toContain("Buy Opening HP");
    expect(renownShopState(record).find((row) => row.id === "hp")).toMatchObject({ canPurchase: true });
  });

  it("defines valid cost curves for every renown shop upgrade", () => {
    const ids: RenownShopUpgradeId[] = ["hp", "speed", "pickup", "reroll", "banish", "styleMastery"];

    for (const id of ids) {
      const row = renownShopState(createRecord()).find((entry) => entry.id === id);
      expect(row?.maxLevel).toBeGreaterThan(0);
      expect(row?.nextCost).toBeGreaterThan(0);
    }
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

  it("defines sixteen ordinary wuxia enemies with configured sprites", () => {
    const ordinaryEnemies = Object.values(ENEMY_CONFIGS).filter((enemy) => !enemy.isBoss);
    const spriteKeys = new Set(ordinaryEnemies.map((enemy) => enemy.spriteKey));

    expect(ordinaryEnemies).toHaveLength(16);
    expect(spriteKeys.size).toBe(16);
    expect(ordinaryEnemies.every((enemy) => enemy.spriteKey.startsWith("enemy-"))).toBe(true);
  });

  it("gives each boss tier a unique boss sprite key", () => {
    const bosses = Object.values(ENEMY_CONFIGS).filter((enemy) => enemy.isBoss);
    const spriteKeys = new Set(bosses.map((enemy) => enemy.spriteKey));

    expect(bosses).toHaveLength(5);
    expect(spriteKeys.size).toBe(5);
    expect(bosses.every((enemy) => enemy.spriteKey.startsWith("boss-"))).toBe(true);
    expect(spriteKeys.has("boss-master")).toBe(false);
  });

  it("spawns every ordinary enemy archetype during the run", () => {
    const ordinaryEnemyIds = Object.values(ENEMY_CONFIGS)
      .filter((enemy) => !enemy.isBoss)
      .map((enemy) => enemy.id);
    const waveEnemyIds = new Set(SPAWN_WAVES.map((wave) => wave.enemyId));

    expect(ordinaryEnemyIds.every((enemyId) => waveEnemyIds.has(enemyId))).toBe(true);
  });

  it("maps every ordinary enemy to a minion behavior archetype", () => {
    const behaviorMap = ordinaryEnemyBehaviorMap();
    const ordinaryEnemies = Object.values(ENEMY_CONFIGS).filter((enemy) => !enemy.isBoss);
    const archetypes = new Set(["chaser", "dasher", "tank", "ranger"]);

    expect(Object.keys(behaviorMap)).toHaveLength(16);
    expect(ordinaryEnemies.every((enemy) => archetypes.has(behaviorMap[enemy.id] ?? ""))).toBe(true);
    expect(ordinaryEnemies.every((enemy) => enemy.behaviorArchetype === behaviorMap[enemy.id])).toBe(true);
  });

  it("defines positive minion behavior tuning for action archetypes", () => {
    for (const archetype of ["dasher", "tank", "ranger"] as const) {
      const config = archetypeConfigFor(archetype, false);
      expect(config.cooldownMs).toBeGreaterThan(0);
      expect(config.windupMs).toBeGreaterThan(0);
      expect(config.actionMs).toBeGreaterThan(0);
    }

    const ranger = archetypeConfigFor("ranger", false);
    expect(ranger.projectileSpeed).toBeGreaterThan(0);
    expect(ranger.projectileDamageMultiplier).toBeGreaterThan(0);
    expect(ranger.range).toBeGreaterThan(0);
  });

  it("amplifies elite minion behavior cooldowns and plant duration", () => {
    const normalDasher = archetypeConfigFor("dasher", false);
    const eliteDasher = archetypeConfigFor("dasher", true);
    const normalTank = archetypeConfigFor("tank", false);
    const eliteTank = archetypeConfigFor("tank", true);
    const normalRanger = archetypeConfigFor("ranger", false);
    const eliteRanger = archetypeConfigFor("ranger", true);

    expect(eliteDasher.cooldownMs).toBeLessThan(normalDasher.cooldownMs);
    expect(eliteTank.windupMs).toBeGreaterThan(normalTank.windupMs);
    expect(eliteTank.actionMs).toBeGreaterThan(normalTank.actionMs);
    expect(eliteRanger.cooldownMs).toBeLessThan(normalRanger.cooldownMs);
    expect(archetypeConfigFor("chaser", true).speedMultiplier).toBe(1);
  });

  it("uses elevated spawn density tuning for busier on-screen waves", () => {
    expect(SPAWN_DENSITY.intervalScale).toBeLessThan(1);
    expect(SPAWN_DENSITY.amountBonus).toBeGreaterThanOrEqual(1);
    expect(SPAWN_DENSITY.timeAmountScaleCap).toBeGreaterThan(6);
  });

  it("requires progressively more experience for higher levels", () => {
    expect(expToNextForLevel(1)).toBe(14);
    expect(expToNextForLevel(10)).toBeGreaterThan(expToNextForLevel(5) * 1.5);
    expect(expToNextForLevel(20)).toBeGreaterThan(expToNextForLevel(10) * 1.6);
  });

  it("gives ordinary enemies more health than the previous baseline", () => {
    expect(ENEMY_CONFIGS.slime.hp).toBe(48);
    expect(ENEMY_CONFIGS.finalBoss.hp).toBe(125550);
  });

  it("formats large boss health for the HUD", () => {
    expect(formatCompactNumber(9315)).toBe("9.3k");
    expect(formatCompactNumber(125550)).toBe("125.5k");
  });

  it("estimates weapon dps and boss time-to-defeat for balance checks", () => {
    const dps = estimateWeaponDps("magicBolt", 1, 1);
    expect(dps).toBeGreaterThan(20);
    expect(estimateBossTimeToDefeat("minorBoss", "magicBolt", 1, 1)).toBeGreaterThan(200);
  });

  it("unlocks build paths after the first boss or level eight", () => {
    const early = createState({ level: 3, bossDefeats: new Map() });
    expect(isBuildPathUpgradeUnlocked(early)).toBe(false);
    const afterBoss = createState({ level: 3, bossDefeats: new Map([["minorBoss", 1]]) });
    expect(isBuildPathUpgradeUnlocked(afterBoss)).toBe(true);
    const highLevel = createState({ level: 8, bossDefeats: new Map() });
    expect(isBuildPathUpgradeUnlocked(highLevel)).toBe(true);
  });

  it("unlocks standalone manuals after the first minor boss", () => {
    const beforeBoss = createState({ bossDefeats: new Map(), elapsedSec: 10 });
    expect(isStandaloneSkillPoolUnlocked(beforeBoss)).toBe(false);
    const afterMinorBoss = createState({ bossDefeats: new Map([["minorBoss", 1]]), elapsedSec: 10 });
    expect(isStandaloneSkillPoolUnlocked(afterMinorBoss)).toBe(true);
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
