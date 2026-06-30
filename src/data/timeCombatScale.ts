import { GAME_DURATION_SEC } from "./waves";

/** Extra HP multiplier at run end (1.0 = double HP at 30:00). */
export const TIME_HP_SCALE_MAX = 1;
/** Extra damage multiplier at run end (0.75 = +75% damage at 30:00). */
export const TIME_DAMAGE_SCALE_MAX = 0.75;

export function timeCombatScale(elapsedSec: number): { hp: number; damage: number } {
  const progress = Math.min(1, Math.max(0, elapsedSec / GAME_DURATION_SEC));
  return {
    hp: 1 + progress * TIME_HP_SCALE_MAX,
    damage: 1 + progress * TIME_DAMAGE_SCALE_MAX
  };
}
