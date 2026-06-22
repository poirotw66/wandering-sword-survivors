export type WeaponId = "magicBolt" | "orbitBlade" | "flameWave" | "thunderStrike" | "starVortex";

export type WeaponConfig = {
  id: WeaponId;
  name: string;
  baseDamage: number;
  cooldownMs: number;
  projectileSpeed: number;
  projectileCount: number;
  pierce: number;
  durationMs?: number;
};

export const WEAPON_CONFIGS: Record<WeaponId, WeaponConfig> = {
  magicBolt: {
    id: "magicBolt",
    name: "Sword Qi",
    baseDamage: 18,
    cooldownMs: 650,
    projectileSpeed: 460,
    projectileCount: 1,
    pierce: 1
  },
  orbitBlade: {
    id: "orbitBlade",
    name: "Circling Sword Guard",
    baseDamage: 12,
    cooldownMs: 120,
    projectileSpeed: 0,
    projectileCount: 1,
    pierce: 99,
    durationMs: 6000
  },
  flameWave: {
    id: "flameWave",
    name: "Breaking Palm Wave",
    baseDamage: 22,
    cooldownMs: 2600,
    projectileSpeed: 260,
    projectileCount: 7,
    pierce: 2,
    durationMs: 900
  },
  thunderStrike: {
    id: "thunderStrike",
    name: "Nine Swords Flash",
    baseDamage: 55,
    cooldownMs: 2300,
    projectileSpeed: 0,
    projectileCount: 1,
    pierce: 1,
    durationMs: 180
  },
  starVortex: {
    id: "starVortex",
    name: "Star Absorption Field",
    baseDamage: 14,
    cooldownMs: 3200,
    projectileSpeed: 0,
    projectileCount: 1,
    pierce: 99,
    durationMs: 760
  }
};
