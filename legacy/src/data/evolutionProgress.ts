import type { GameState } from "../game/GameState";
import { EVOLUTION_CONFIGS, type EvolutionConfig, type EvolutionId } from "./evolutions";

export type EvolutionProgress = {
  evolutionId: EvolutionId;
  config: EvolutionConfig;
  weaponLevel: number;
  requiredWeaponLevel: number;
  skillLevel: number;
  requiredSkillLevel: number;
  canEvolve: boolean;
  alreadyEvolved: boolean;
  progressScore: number;
};

export function computeEvolutionProgress(state: GameState): EvolutionProgress[] {
  return (Object.keys(EVOLUTION_CONFIGS) as EvolutionId[])
    .map((evolutionId) => {
      const config = EVOLUTION_CONFIGS[evolutionId];
      const weaponLevel = state.weaponLevels.get(config.baseWeaponId) ?? 0;
      const skillLevel = state.skillLevels.get(config.requiredSkillId) ?? 0;
      const alreadyEvolved = state.evolvedWeapons.get(config.baseWeaponId) === evolutionId;
      const canEvolve =
        !alreadyEvolved &&
        weaponLevel >= config.requiredWeaponLevel &&
        skillLevel >= config.requiredSkillLevel;
      const weaponScore = Math.min(weaponLevel, config.requiredWeaponLevel);
      const skillScore = Math.min(skillLevel, config.requiredSkillLevel);
      return {
        evolutionId,
        config,
        weaponLevel,
        requiredWeaponLevel: config.requiredWeaponLevel,
        skillLevel,
        requiredSkillLevel: config.requiredSkillLevel,
        canEvolve,
        alreadyEvolved,
        progressScore: weaponScore + skillScore
      };
    })
    .sort((a, b) => {
      if (a.alreadyEvolved !== b.alreadyEvolved) {
        return a.alreadyEvolved ? 1 : -1;
      }
      if (a.canEvolve !== b.canEvolve) {
        return a.canEvolve ? -1 : 1;
      }
      const aTouched = a.weaponLevel > 0 || a.skillLevel > 0;
      const bTouched = b.weaponLevel > 0 || b.skillLevel > 0;
      if (aTouched !== bTouched) {
        return aTouched ? -1 : 1;
      }
      return b.progressScore - a.progressScore;
    });
}

export function trackedEvolutionProgress(state: GameState, limit = 3): EvolutionProgress[] {
  return computeEvolutionProgress(state)
    .filter((progress) => !progress.alreadyEvolved)
    .slice(0, limit);
}

export function findProgressForWeapon(state: GameState, weaponId: string): EvolutionProgress | undefined {
  return computeEvolutionProgress(state).find((progress) => progress.config.baseWeaponId === weaponId);
}

export function findProgressForSkill(state: GameState, skillId: string): EvolutionProgress | undefined {
  return computeEvolutionProgress(state).find((progress) => progress.config.requiredSkillId === skillId);
}
