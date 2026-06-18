import { WEAPON_CONFIGS, type WeaponId } from "./weapons";
import type { GameState } from "../game/GameState";

export type UpgradeOption = {
  id: string;
  title: string;
  description: string;
  apply: (state: GameState) => void;
};

const weaponLabel: Record<WeaponId, string> = {
  magicBolt: "Magic Bolt",
  orbitBlade: "Orbit Blade",
  flameWave: "Flame Wave",
  thunderStrike: "Thunder Strike"
};

export function buildUpgradePool(state: GameState): UpgradeOption[] {
  const options: UpgradeOption[] = [
    {
      id: "damage",
      title: "Ritual Edge",
      description: `Weapon damage ${Math.round(state.player.stats.damageMultiplier * 100)}% -> ${Math.round(
        (state.player.stats.damageMultiplier + 0.15) * 100
      )}%`,
      apply: ({ player }) => {
        player.stats.damageMultiplier += 0.15;
      }
    },
    {
      id: "cooldown",
      title: "Quickened Pulse",
      description: "Weapons fire 10% faster",
      apply: ({ player }) => {
        player.stats.cooldownMultiplier *= 0.9;
      }
    },
    {
      id: "speed",
      title: "Fleet Step",
      description: `Move speed ${state.player.stats.moveSpeed} -> ${state.player.stats.moveSpeed + 18}`,
      apply: ({ player }) => {
        player.stats.moveSpeed += 18;
      }
    },
    {
      id: "pickup",
      title: "Moon Magnet",
      description: `Pickup range ${state.player.stats.pickupRange} -> ${state.player.stats.pickupRange + 28}`,
      apply: ({ player }) => {
        player.stats.pickupRange += 28;
      }
    },
    {
      id: "heal",
      title: "Warm Blood",
      description: "Recover 25 HP and gain +10 max HP",
      apply: ({ player }) => {
        player.stats.maxHp += 10;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 25);
      }
    }
  ];

  for (const weaponId of Object.keys(WEAPON_CONFIGS) as WeaponId[]) {
    const level = state.weaponLevels.get(weaponId) ?? 0;
    if (level >= 5) {
      continue;
    }

    options.push({
      id: `weapon-${weaponId}`,
      title: level === 0 ? `Unlock ${weaponLabel[weaponId]}` : `${weaponLabel[weaponId]} Lv.${level + 1}`,
      description:
        level === 0
          ? `Add ${weaponLabel[weaponId]} to your arsenal`
          : `Current Lv.${level}; improve damage, count, or cooldown`,
      apply: ({ weaponLevels }) => {
        weaponLevels.set(weaponId, level + 1);
      }
    });
  }

  return options;
}
