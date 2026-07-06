import { GAME_DURATION_SEC } from "./waves";
import { RUN_BALANCE } from "./runBalance";
import { clamp } from "../utils/math";

export function timeCombatScale(elapsedSec: number): { hp: number; damage: number } {
  const { hpScaleMax, damageScaleMax, easingPower, lateRampStartSec, lateRampBonus, lateRampPower, lateRampCap } =
    RUN_BALANCE.timeCombat;
  const progress = clamp(elapsedSec / GAME_DURATION_SEC, 0, 1);
  let eased = progress ** easingPower;

  if (elapsedSec > lateRampStartSec) {
    const lateSpan = Math.max(1, GAME_DURATION_SEC - lateRampStartSec);
    const lateProgress = clamp((elapsedSec - lateRampStartSec) / lateSpan, 0, 1);
    eased = Math.min(lateRampCap, eased + lateProgress ** lateRampPower * lateRampBonus);
  }

  return {
    hp: 1 + eased * hpScaleMax,
    damage: 1 + eased * damageScaleMax
  };
}
