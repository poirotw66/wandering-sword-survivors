export type WeaponId =
  | "magicBolt"
  | "orbitBlade"
  | "flameWave"
  | "thunderStrike"
  | "starVortex"
  | "blossomBlade"
  | "galeSword"
  | "taiyuePeak"
  | "coldPondSword"
  | "vajraFist";

export type WeaponConfig = {
  id: WeaponId;
  name: string;
  iconKey: string;
  availableInUpgradePool: boolean;
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
    iconKey: "bolt",
    availableInUpgradePool: true,
    baseDamage: 18,
    cooldownMs: 650,
    projectileSpeed: 460,
    projectileCount: 1,
    pierce: 1
  },
  orbitBlade: {
    id: "orbitBlade",
    name: "Circling Sword Guard",
    iconKey: "blade",
    availableInUpgradePool: true,
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
    iconKey: "palm-wave",
    availableInUpgradePool: true,
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
    iconKey: "strike",
    availableInUpgradePool: true,
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
    iconKey: "star-vortex",
    availableInUpgradePool: true,
    baseDamage: 14,
    cooldownMs: 3200,
    projectileSpeed: 0,
    projectileCount: 1,
    pierce: 99,
    durationMs: 760
  },
  blossomBlade: {
    id: "blossomBlade",
    name: "Falling Blossom Blades",
    iconKey: "icon-blossom-blade",
    availableInUpgradePool: true,
    baseDamage: 18,
    cooldownMs: 1800,
    projectileSpeed: 330,
    projectileCount: 5,
    pierce: 2,
    durationMs: 1100
  },
  galeSword: {
    id: "galeSword",
    name: "Gale Swift Sword",
    iconKey: "icon-gale-sword",
    availableInUpgradePool: true,
    baseDamage: 16,
    cooldownMs: 520,
    projectileSpeed: 520,
    projectileCount: 1,
    pierce: 1,
    durationMs: 900
  },
  taiyuePeak: {
    id: "taiyuePeak",
    name: "Three Peaks of Taiyue",
    iconKey: "icon-taiyue-peak",
    availableInUpgradePool: true,
    baseDamage: 48,
    cooldownMs: 2400,
    projectileSpeed: 0,
    projectileCount: 3,
    pierce: 99,
    durationMs: 260
  },
  coldPondSword: {
    id: "coldPondSword",
    name: "Cold Pond Sword Shadow",
    iconKey: "icon-cold-pond-sword",
    availableInUpgradePool: true,
    baseDamage: 20,
    cooldownMs: 1900,
    projectileSpeed: 380,
    projectileCount: 2,
    pierce: 2,
    durationMs: 1100
  },
  vajraFist: {
    id: "vajraFist",
    name: "Hundred-Step Divine Fist",
    iconKey: "icon-vajra-fist",
    availableInUpgradePool: true,
    baseDamage: 42,
    cooldownMs: 2600,
    projectileSpeed: 440,
    projectileCount: 1,
    pierce: 5,
    durationMs: 1200
  }
};
