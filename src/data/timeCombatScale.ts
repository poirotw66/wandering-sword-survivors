import { GAME_DURATION_SEC } from "./waves";

/** Extra HP multiplier at run end (1.25 = +125% HP at 30:00). */
export const TIME_HP_SCALE_MAX = 1.25;
/** Extra damage multiplier at run end (1 = +100% damage at 30:00). */
export const TIME_DAMAGE_SCALE_MAX = 1;

export function timeCombatScale(elapsedSec: number): { hp: number; damage: number } {
  const progress = Math.min(1, Math.max(0, elapsedSec / GAME_DURATION_SEC));
  // ponytail: slow ramp first half of run, steeper pressure in final third
  const eased = progress ** 1.4;
  return {
    hp: 1 + eased * TIME_HP_SCALE_MAX,
    damage: 1 + eased * TIME_DAMAGE_SCALE_MAX
  };
}
