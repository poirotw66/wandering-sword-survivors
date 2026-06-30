export type EnemyId =
  | "slime"
  | "bat"
  | "golem"
  | "huashanSwordsman"
  | "hengshanNun"
  | "taishanAcolyte"
  | "riverBandit"
  | "medicineHeretic"
  | "sunMoonCultist"
  | "royalGuard"
  | "wudangMonk"
  | "shaolinMonk"
  | "emeiDisciple"
  | "beggarSect"
  | "northernRider"
  | "poisonMaster"
  | "minorBoss"
  | "midBoss"
  | "greatBoss"
  | "megaBoss"
  | "finalBoss";

import type { EnemyBehaviorArchetype } from "./minionBehaviors";

export type EnemyConfig = {
  id: EnemyId;
  name: string;
  hp: number;
  damage: number;
  moveSpeed: number;
  exp: number;
  radius: number;
  tint: number;
  score: number;
  spriteKey: string;
  behaviorArchetype?: EnemyBehaviorArchetype;
  isBoss?: boolean;
  endsRunOnDefeat?: boolean;
  canDash?: boolean;
  canFanStrike?: boolean;
  canSummon?: boolean;
};

export const ENEMY_CONFIGS: Record<EnemyId, EnemyConfig> = {
  slime: {
    id: "slime",
    name: "Qingcheng Disciple",
    hp: 48,
    damage: 10,
    moveSpeed: 72,
    exp: 2,
    radius: 14,
    tint: 0x61d394,
    score: 10,
    spriteKey: "enemy-green",
    behaviorArchetype: "chaser"
  },
  bat: {
    id: "bat",
    name: "Demonic Cult Assassin",
    hp: 38,
    damage: 8,
    moveSpeed: 118,
    exp: 2,
    radius: 10,
    tint: 0xd17de8,
    score: 15,
    spriteKey: "enemy-purple",
    behaviorArchetype: "dasher"
  },
  golem: {
    id: "golem",
    name: "Songshan Expert",
    hp: 300,
    damage: 20,
    moveSpeed: 48,
    exp: 7,
    radius: 20,
    tint: 0xc0a46b,
    score: 40,
    spriteKey: "enemy-red",
    behaviorArchetype: "tank"
  },
  huashanSwordsman: {
    id: "huashanSwordsman",
    name: "Huashan Sword Trainee",
    hp: 64,
    damage: 12,
    moveSpeed: 82,
    exp: 3,
    radius: 13,
    tint: 0x9ee7ff,
    score: 18,
    spriteKey: "enemy-huashan",
    behaviorArchetype: "chaser"
  },
  hengshanNun: {
    id: "hengshanNun",
    name: "Hengshan Guard Nun",
    hp: 100,
    damage: 10,
    moveSpeed: 64,
    exp: 4,
    radius: 14,
    tint: 0xb8f7ff,
    score: 20,
    spriteKey: "enemy-hengshan",
    behaviorArchetype: "tank"
  },
  taishanAcolyte: {
    id: "taishanAcolyte",
    name: "Taishan Acolyte",
    hp: 185,
    damage: 16,
    moveSpeed: 58,
    exp: 5,
    radius: 17,
    tint: 0xd9b45f,
    score: 28,
    spriteKey: "enemy-taishan",
    behaviorArchetype: "tank"
  },
  riverBandit: {
    id: "riverBandit",
    name: "River Bandit",
    hp: 54,
    damage: 11,
    moveSpeed: 96,
    exp: 3,
    radius: 12,
    tint: 0xb9824d,
    score: 18,
    spriteKey: "enemy-river-bandit",
    behaviorArchetype: "dasher"
  },
  medicineHeretic: {
    id: "medicineHeretic",
    name: "Medicine Valley Heretic",
    hp: 138,
    damage: 14,
    moveSpeed: 70,
    exp: 5,
    radius: 14,
    tint: 0x84f7b2,
    score: 30,
    spriteKey: "enemy-medicine-heretic",
    behaviorArchetype: "ranger"
  },
  sunMoonCultist: {
    id: "sunMoonCultist",
    name: "Sun Moon Cultist",
    hp: 170,
    damage: 18,
    moveSpeed: 88,
    exp: 6,
    radius: 16,
    tint: 0xff73d2,
    score: 36,
    spriteKey: "enemy-sun-moon",
    behaviorArchetype: "dasher"
  },
  royalGuard: {
    id: "royalGuard",
    name: "Imperial Brocade Guard",
    hp: 360,
    damage: 24,
    moveSpeed: 54,
    exp: 8,
    radius: 21,
    tint: 0x6aa8ff,
    score: 55,
    spriteKey: "enemy-royal-guard",
    behaviorArchetype: "tank"
  },
  wudangMonk: {
    id: "wudangMonk",
    name: "Wudang Taoist",
    hp: 125,
    damage: 13,
    moveSpeed: 62,
    exp: 4,
    radius: 15,
    tint: 0x7ec8e3,
    score: 22,
    spriteKey: "enemy-wudang",
    behaviorArchetype: "ranger"
  },
  shaolinMonk: {
    id: "shaolinMonk",
    name: "Shaolin Monk",
    hp: 235,
    damage: 18,
    moveSpeed: 52,
    exp: 6,
    radius: 18,
    tint: 0xffb347,
    score: 34,
    spriteKey: "enemy-shaolin",
    behaviorArchetype: "tank"
  },
  emeiDisciple: {
    id: "emeiDisciple",
    name: "Emei Sword Maiden",
    hp: 60,
    damage: 10,
    moveSpeed: 105,
    exp: 3,
    radius: 12,
    tint: 0xf4b8ff,
    score: 19,
    spriteKey: "enemy-emei",
    behaviorArchetype: "ranger"
  },
  beggarSect: {
    id: "beggarSect",
    name: "Beggar Sect Scout",
    hp: 92,
    damage: 12,
    moveSpeed: 78,
    exp: 4,
    radius: 14,
    tint: 0x8b7355,
    score: 21,
    spriteKey: "enemy-beggar",
    behaviorArchetype: "chaser"
  },
  northernRider: {
    id: "northernRider",
    name: "Northern Steppe Raider",
    hp: 105,
    damage: 14,
    moveSpeed: 112,
    exp: 4,
    radius: 13,
    tint: 0xc67b4e,
    score: 24,
    spriteKey: "enemy-northern-rider",
    behaviorArchetype: "dasher"
  },
  poisonMaster: {
    id: "poisonMaster",
    name: "Five Poisons Cultist",
    hp: 145,
    damage: 16,
    moveSpeed: 68,
    exp: 5,
    radius: 14,
    tint: 0x6ecf4a,
    score: 32,
    spriteKey: "enemy-poison-cult",
    behaviorArchetype: "ranger"
  },
  minorBoss: {
    id: "minorBoss",
    name: "Rival Sect Captain",
    hp: 13500,
    damage: 24,
    moveSpeed: 72,
    exp: 26,
    radius: 34,
    tint: 0xff8f70,
    score: 220,
    spriteKey: "boss-rival-captain",
    isBoss: true,
    canDash: true
  },
  midBoss: {
    id: "midBoss",
    name: "Renegade Master",
    hp: 31000,
    damage: 32,
    moveSpeed: 66,
    exp: 50,
    radius: 42,
    tint: 0xff4f64,
    score: 600,
    spriteKey: "boss-renegade-master",
    isBoss: true,
    canDash: true,
    canFanStrike: true
  },
  greatBoss: {
    id: "greatBoss",
    name: "Grand Sword Elder",
    hp: 62000,
    damage: 42,
    moveSpeed: 58,
    exp: 95,
    radius: 50,
    tint: 0xd9b45f,
    score: 1200,
    spriteKey: "boss-grand-elder",
    isBoss: true,
    canDash: true,
    canFanStrike: true,
    canSummon: true
  },
  megaBoss: {
    id: "megaBoss",
    name: "Demonic Sect Overlord",
    hp: 106000,
    damage: 54,
    moveSpeed: 54,
    exp: 150,
    radius: 58,
    tint: 0xb86bff,
    score: 2200,
    spriteKey: "boss-demonic-overlord",
    isBoss: true,
    canDash: true,
    canFanStrike: true,
    canSummon: true
  },
  finalBoss: {
    id: "finalBoss",
    name: "Eastern Invincible",
    hp: 182000,
    damage: 68,
    moveSpeed: 60,
    exp: 300,
    radius: 68,
    tint: 0xff2f86,
    score: 5000,
    spriteKey: "boss-eastern-invincible",
    isBoss: true,
    canDash: true,
    canFanStrike: true,
    canSummon: true,
    endsRunOnDefeat: true
  }
};
