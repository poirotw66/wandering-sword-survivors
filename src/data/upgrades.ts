import { SKILL_CONFIGS, type SkillId } from "./skills";
import { WEAPON_CONFIGS, type WeaponId } from "./weapons";
import type { GameState } from "../game/GameState";

export type UpgradeOption = {
  id: string;
  title: string;
  description: string;
  apply: (state: GameState) => void;
};

const weaponLabel: Record<WeaponId, string> = {
  magicBolt: WEAPON_CONFIGS.magicBolt.name,
  orbitBlade: WEAPON_CONFIGS.orbitBlade.name,
  flameWave: WEAPON_CONFIGS.flameWave.name,
  thunderStrike: WEAPON_CONFIGS.thunderStrike.name,
  starVortex: WEAPON_CONFIGS.starVortex.name
};

const skillLabel: Record<SkillId, string> = {
  duguNineSwords: SKILL_CONFIGS.duguNineSwords.name,
  starAbsorption: SKILL_CONFIGS.starAbsorption.name,
  huashanFootwork: SKILL_CONFIGS.huashanFootwork.name,
  wineSwordHeart: SKILL_CONFIGS.wineSwordHeart.name
};

export function buildUpgradePool(state: GameState): UpgradeOption[] {
  const options: UpgradeOption[] = [
    {
      id: "damage",
      title: "Sword Intent",
      description: `Damage ${Math.round(state.player.stats.damageMultiplier * 100)}% -> ${Math.round(
        (state.player.stats.damageMultiplier + 0.15) * 100
      )}%`,
      apply: ({ player }) => {
        player.stats.damageMultiplier += 0.15;
      }
    },
    {
      id: "cooldown",
      title: "Flowing Meridian",
      description: "Martial arts recover 10% faster",
      apply: ({ player }) => {
        player.stats.cooldownMultiplier *= 0.9;
      }
    },
    {
      id: "speed",
      title: "Lightness Step",
      description: `Move speed ${state.player.stats.moveSpeed} -> ${state.player.stats.moveSpeed + 18}`,
      apply: ({ player }) => {
        player.stats.moveSpeed += 18;
      }
    },
    {
      id: "pickup",
      title: "Qi Sense",
      description: `Pickup range ${state.player.stats.pickupRange} -> ${state.player.stats.pickupRange + 28}`,
      apply: ({ player }) => {
        player.stats.pickupRange += 28;
      }
    },
    {
      id: "heal",
      title: "Inner Breath",
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

  for (const skillId of Object.keys(SKILL_CONFIGS) as SkillId[]) {
    const config = SKILL_CONFIGS[skillId];
    const level = state.skillLevels.get(skillId) ?? 0;
    if (level >= config.maxLevel) {
      continue;
    }

    const nextLevel = level + 1;
    options.push({
      id: `skill-${skillId}`,
      title: level === 0 ? `Learn ${skillLabel[skillId]}` : `${skillLabel[skillId]} Lv.${nextLevel}`,
      description: config.describe(state, nextLevel),
      apply: (gameState) => {
        gameState.skillLevels.set(skillId, nextLevel);
        config.apply(gameState, nextLevel);
      }
    });
  }

  return options;
}
