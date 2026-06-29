import { ENEMY_CONFIGS, type EnemyId } from "./enemies";
import { WEAPON_CONFIGS, type WeaponId } from "./weapons";

export function estimateWeaponDps(
  weaponId: WeaponId,
  level = 1,
  damageMultiplier = 1,
  cooldownMultiplier = 1
): number {
  const config = WEAPON_CONFIGS[weaponId];
  const levelCooldownScale = Math.max(0.55, 1 - level * 0.04);
  const cooldownSec = (config.cooldownMs * levelCooldownScale * cooldownMultiplier) / 1000;
  if (cooldownSec <= 0) {
    return 0;
  }
  return (config.baseDamage * damageMultiplier) / cooldownSec;
}

export function estimateTimeToDefeatSeconds(hp: number, dps: number): number {
  if (dps <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return hp / dps;
}

export function estimateBossTimeToDefeat(
  enemyId: EnemyId,
  weaponId: WeaponId,
  level = 1,
  damageMultiplier = 1
): number {
  const hp = ENEMY_CONFIGS[enemyId].hp;
  const dps = estimateWeaponDps(weaponId, level, damageMultiplier);
  return estimateTimeToDefeatSeconds(hp, dps);
}
