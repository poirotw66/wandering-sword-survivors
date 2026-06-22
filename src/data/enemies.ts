export type EnemyId = "slime" | "bat" | "golem" | "minorBoss" | "midBoss" | "greatBoss" | "megaBoss" | "finalBoss";

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
    score: 10
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
    score: 15
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
    score: 40
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
    isBoss: true,
    canDash: true,
    canFanStrike: true,
    canSummon: true,
    endsRunOnDefeat: true
  }
};
