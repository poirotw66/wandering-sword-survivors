import type { WeaponId } from "../data/weapons";
import type { SkillId } from "../data/skills";
import type { Player } from "../entities/Player";
import type { BuildPathId } from "../data/buildPaths";
import type { EnemyId } from "../data/enemies";
import type { EvolutionId } from "../data/evolutions";

export type GameState = {
  player: Player;
  level: number;
  exp: number;
  expToNext: number;
  score: number;
  kills: number;
  elapsedSec: number;
  pausedForUpgrade: boolean;
  pausedForMenu: boolean;
  weaponLevels: Map<WeaponId, number>;
  evolvedWeapons: Map<WeaponId, EvolutionId>;
  skillLevels: Map<SkillId, number>;
  buildPathLevels: Map<BuildPathId, number>;
  unlockedSkills: Set<SkillId>;
  unlockedAchievements: Set<string>;
  evolvedArtsSeen: Set<EvolutionId>;
  standaloneSkillsSeen: Set<SkillId>;
  bossDefeats: Map<EnemyId, number>;
  highestDifficulty: number;
  devMode: {
    enabled: boolean;
    timeScale: number;
  };
};
