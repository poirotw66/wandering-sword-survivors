import { ENEMY_CONFIGS, type EnemyId } from "./enemies";

export type EnemyBehaviorArchetype = "chaser" | "dasher" | "tank" | "ranger";

export type MinionArchetypeConfig = {
  archetype: EnemyBehaviorArchetype;
  cooldownMs: number;
  windupMs: number;
  actionMs: number;
  range: number;
  projectileSpeed: number;
  projectileDamageMultiplier: number;
  speedMultiplier: number;
  dashSpeedMultiplier: number;
  telegraphColor: number;
};

const ARCHETYPE_BASE: Record<EnemyBehaviorArchetype, MinionArchetypeConfig> = {
  chaser: {
    archetype: "chaser",
    cooldownMs: 0,
    windupMs: 0,
    actionMs: 0,
    range: 0,
    projectileSpeed: 0,
    projectileDamageMultiplier: 0,
    speedMultiplier: 1,
    dashSpeedMultiplier: 1,
    telegraphColor: 0xffffff
  },
  dasher: {
    archetype: "dasher",
    cooldownMs: 2800,
    windupMs: 400,
    actionMs: 480,
    range: 220,
    projectileSpeed: 0,
    projectileDamageMultiplier: 0,
    speedMultiplier: 1,
    dashSpeedMultiplier: 2.2,
    telegraphColor: 0xff73d2
  },
  tank: {
    archetype: "tank",
    cooldownMs: 3200,
    windupMs: 600,
    actionMs: 550,
    range: 0,
    projectileSpeed: 0,
    projectileDamageMultiplier: 0,
    speedMultiplier: 0.85,
    dashSpeedMultiplier: 1,
    telegraphColor: 0xffd36a
  },
  ranger: {
    archetype: "ranger",
    cooldownMs: 3500,
    windupMs: 500,
    actionMs: 2200,
    range: 300,
    projectileSpeed: 210,
    projectileDamageMultiplier: 0.62,
    speedMultiplier: 0.96,
    dashSpeedMultiplier: 1,
    telegraphColor: 0x84f7b2
  }
};

export function minionBehaviorFor(enemyId: EnemyId): EnemyBehaviorArchetype {
  const config = ENEMY_CONFIGS[enemyId];
  if (config.isBoss) {
    return "chaser";
  }
  return config.behaviorArchetype ?? "chaser";
}

export function archetypeConfigFor(archetype: EnemyBehaviorArchetype, elite: boolean): MinionArchetypeConfig {
  const base = ARCHETYPE_BASE[archetype];
  if (!elite) {
    return { ...base };
  }

  if (archetype === "dasher") {
    return { ...base, cooldownMs: Math.round(base.cooldownMs * 0.82) };
  }
  if (archetype === "tank") {
    return {
      ...base,
      windupMs: Math.round(base.windupMs * 1.12),
      actionMs: Math.round(base.actionMs * 1.12)
    };
  }
  if (archetype === "ranger") {
    return { ...base, cooldownMs: Math.round(base.cooldownMs * 0.85) };
  }
  return { ...base };
}

export function ordinaryEnemyBehaviorMap(): Partial<Record<EnemyId, EnemyBehaviorArchetype>> {
  const map: Partial<Record<EnemyId, EnemyBehaviorArchetype>> = {};
  for (const [enemyId, config] of Object.entries(ENEMY_CONFIGS)) {
    if (config.isBoss) {
      continue;
    }
    map[enemyId as EnemyId] = config.behaviorArchetype ?? "chaser";
  }
  return map;
}
