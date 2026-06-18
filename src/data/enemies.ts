export type EnemyId = "slime" | "bat" | "golem" | "boss";

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
};

export const ENEMY_CONFIGS: Record<EnemyId, EnemyConfig> = {
  slime: {
    id: "slime",
    name: "Slime",
    hp: 20,
    damage: 10,
    moveSpeed: 70,
    exp: 1,
    radius: 14,
    tint: 0x61d394,
    score: 10
  },
  bat: {
    id: "bat",
    name: "Bat",
    hp: 12,
    damage: 8,
    moveSpeed: 122,
    exp: 1,
    radius: 10,
    tint: 0xd17de8,
    score: 15
  },
  golem: {
    id: "golem",
    name: "Golem",
    hp: 80,
    damage: 20,
    moveSpeed: 45,
    exp: 5,
    radius: 20,
    tint: 0xc0a46b,
    score: 40
  },
  boss: {
    id: "boss",
    name: "Renegade Master",
    hp: 1400,
    damage: 35,
    moveSpeed: 64,
    exp: 50,
    radius: 42,
    tint: 0xff4f64,
    score: 600
  }
};
