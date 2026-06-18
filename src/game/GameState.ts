import type { WeaponId } from "../data/weapons";
import type { Player } from "../entities/Player";

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
};
