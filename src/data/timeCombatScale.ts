import { GAME_DURATION_SEC } from "./waves";
import { RUN_BALANCE } from "./runBalance";

export function timeCombatScale(elapsedSec: number): { hp: number; damage: number } {
  const { hpScaleMax, damageScaleMax, easingPower } = RUN_BALANCE.timeCombat;
  const progress = Math.min(1, Math.max(0, elapsedSec / GAME_DURATION_SEC));
  const eased = progress ** easingPower;
  return {
    hp: 1 + eased * hpScaleMax,
    damage: 1 + eased * damageScaleMax
  };
}
