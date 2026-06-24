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
  | "minorBoss"
  | "midBoss"
  | "greatBoss"
  | "megaBoss"
  | "finalBoss";

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
    hp: 18,
    damage: 10,
    moveSpeed: 72,
    exp: 2,
    radius: 14,
    tint: 0x61d394,
    score: 10,
    spriteKey: "enemy-green"
  },
  bat: {
    id: "bat",
    name: "Demonic Cult Assassin",
    hp: 14,
    damage: 8,
    moveSpeed: 118,
    exp: 2,
    radius: 10,
    tint: 0xd17de8,
    score: 15,
    spriteKey: "enemy-purple"
  },
  golem: {
    id: "golem",
    name: "Songshan Expert",
    hp: 72,
    damage: 20,
    moveSpeed: 48,
    exp: 7,
    radius: 20,
    tint: 0xc0a46b,
    score: 40,
    spriteKey: "enemy-red"
  },
  huashanSwordsman: {
    id: "huashanSwordsman",
    name: "Huashan Sword Trainee",
    hp: 24,
    damage: 12,
    moveSpeed: 82,
    exp: 3,
    radius: 13,
    tint: 0x9ee7ff,
    score: 18,
    spriteKey: "enemy-huashan"
  },
  hengshanNun: {
    id: "hengshanNun",
    name: "Hengshan Guard Nun",
    hp: 30,
    damage: 10,
    moveSpeed: 64,
    exp: 4,
    radius: 14,
    tint: 0xb8f7ff,
    score: 20,
    spriteKey: "enemy-hengshan"
  },
  taishanAcolyte: {
    id: "taishanAcolyte",
    name: "Taishan Acolyte",
    hp: 46,
    damage: 16,
    moveSpeed: 58,
    exp: 5,
    radius: 17,
    tint: 0xd9b45f,
    score: 28,
    spriteKey: "enemy-taishan"
  },
  riverBandit: {
    id: "riverBandit",
    name: "River Bandit",
    hp: 20,
    damage: 11,
    moveSpeed: 96,
    exp: 3,
    radius: 12,
    tint: 0xb9824d,
    score: 18,
    spriteKey: "enemy-river-bandit"
  },
  medicineHeretic: {
    id: "medicineHeretic",
    name: "Medicine Valley Heretic",
    hp: 34,
    damage: 14,
    moveSpeed: 70,
    exp: 5,
    radius: 14,
    tint: 0x84f7b2,
    score: 30,
    spriteKey: "enemy-medicine-heretic"
  },
  sunMoonCultist: {
    id: "sunMoonCultist",
    name: "Sun Moon Cultist",
    hp: 42,
    damage: 18,
    moveSpeed: 88,
    exp: 6,
    radius: 16,
    tint: 0xff73d2,
    score: 36,
    spriteKey: "enemy-sun-moon"
  },
  royalGuard: {
    id: "royalGuard",
    name: "Imperial Brocade Guard",
    hp: 88,
    damage: 24,
    moveSpeed: 54,
    exp: 8,
    radius: 21,
    tint: 0x6aa8ff,
    score: 55,
    spriteKey: "enemy-royal-guard"
  },
  minorBoss: {
    id: "minorBoss",
    name: "Rival Sect Captain",
    hp: 460,
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
    hp: 1050,
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
    hp: 2100,
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
    hp: 3600,
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
    hp: 6200,
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
