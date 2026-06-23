import type { EnemyId } from "../data/enemies";
import type { SkillId } from "../data/skills";
import type { GameState } from "../game/GameState";
import { achievementName, skillName, t } from "../i18n";

export type RunRecord = {
  bestRenown: number;
  fastestClearSec?: number;
  highestDifficulty: number;
  achievements: string[];
};

export type RunSummary = {
  score: number;
  elapsedSec: number;
  highestDifficulty: number;
  achievements: string[];
};

const RECORD_KEY = "sword-survivors-record";

const BOSS_SKILL_UNLOCKS: Partial<Record<EnemyId, SkillId[]>> = {
  minorBoss: ["duguNineSwords", "zixiaDivineSkill"],
  midBoss: ["huashanFootwork", "windChasingStep"],
  greatBoss: ["starAbsorption", "hunyuanQi"],
  megaBoss: ["wineSwordHeart", "iceHeart", "vajraDemonSubduing"]
};

const BOSS_ACHIEVEMENTS: Partial<Record<EnemyId, string>> = {
  minorBoss: "firstRival",
  midBoss: "midBoss",
  greatBoss: "greatBoss",
  megaBoss: "megaBoss",
  finalBoss: "finalBoss"
};

export class AchievementSystem {
  static readRecord(): RunRecord {
    const fallback: RunRecord = { bestRenown: 0, highestDifficulty: 1, achievements: [] };
    try {
      return { ...fallback, ...JSON.parse(localStorage.getItem(RECORD_KEY) ?? "{}") };
    } catch {
      return fallback;
    }
  }

  static saveRun(summary: RunSummary, won: boolean): RunRecord {
    const record = AchievementSystem.readRecord();
    const bestRenown = Math.max(record.bestRenown, summary.score);
    const highestDifficulty = Math.max(record.highestDifficulty, summary.highestDifficulty);
    const fastestClearSec = won
      ? record.fastestClearSec === undefined
        ? summary.elapsedSec
        : Math.min(record.fastestClearSec, summary.elapsedSec)
      : record.fastestClearSec;
    const achievements = [...new Set([...record.achievements, ...summary.achievements])];
    const nextRecord = { bestRenown, fastestClearSec, highestDifficulty, achievements };
    localStorage.setItem(RECORD_KEY, JSON.stringify(nextRecord));
    return nextRecord;
  }

  constructor(private readonly state: GameState) {}

  recordBossDefeat(enemyId: EnemyId): string[] {
    const messages: string[] = [];
    this.state.bossDefeats.set(enemyId, (this.state.bossDefeats.get(enemyId) ?? 0) + 1);
    this.state.highestDifficulty = Math.max(this.state.highestDifficulty, this.difficultyFor(enemyId));

    const skillIds = BOSS_SKILL_UNLOCKS[enemyId] ?? [];
    for (const skillId of skillIds) {
      if (!this.state.unlockedSkills.has(skillId)) {
        this.state.unlockedSkills.add(skillId);
        messages.push(t("skillUnlockedToast", { name: skillName(skillId) }));
      }
    }

    const achievementId = BOSS_ACHIEVEMENTS[enemyId];
    if (achievementId && !this.state.unlockedAchievements.has(achievementId)) {
      this.state.unlockedAchievements.add(achievementId);
      messages.push(t("achievementToast", { name: achievementName(achievementId) }));
    }

    if (this.state.score >= 10000 && !this.state.unlockedAchievements.has("renown10000")) {
      this.state.unlockedAchievements.add("renown10000");
      messages.push(t("achievementToast", { name: achievementName("renown10000") }));
    }

    return messages;
  }

  private difficultyFor(enemyId: EnemyId): number {
    const difficulty: Partial<Record<EnemyId, number>> = {
      minorBoss: 1,
      midBoss: 2,
      greatBoss: 3,
      megaBoss: 4,
      finalBoss: 5
    };
    return difficulty[enemyId] ?? this.state.highestDifficulty;
  }
}
