import type { EnemyId } from "./enemies";

export type SpawnWave = {
  startTimeSec: number;
  endTimeSec: number;
  enemyId: EnemyId;
  spawnIntervalMs: number;
  amountPerSpawn: number;
};

export const GAME_DURATION_SEC = 600;
export const BOSS_SPAWN_SEC = 600;

export const SPAWN_WAVES: SpawnWave[] = [
  { startTimeSec: 0, endTimeSec: 120, enemyId: "slime", spawnIntervalMs: 900, amountPerSpawn: 2 },
  { startTimeSec: 120, endTimeSec: 240, enemyId: "slime", spawnIntervalMs: 700, amountPerSpawn: 3 },
  { startTimeSec: 120, endTimeSec: 240, enemyId: "bat", spawnIntervalMs: 1200, amountPerSpawn: 2 },
  { startTimeSec: 240, endTimeSec: 420, enemyId: "bat", spawnIntervalMs: 850, amountPerSpawn: 3 },
  { startTimeSec: 240, endTimeSec: 420, enemyId: "golem", spawnIntervalMs: 1800, amountPerSpawn: 1 },
  { startTimeSec: 420, endTimeSec: 600, enemyId: "slime", spawnIntervalMs: 420, amountPerSpawn: 5 },
  { startTimeSec: 420, endTimeSec: 600, enemyId: "bat", spawnIntervalMs: 650, amountPerSpawn: 4 },
  { startTimeSec: 420, endTimeSec: 600, enemyId: "golem", spawnIntervalMs: 1100, amountPerSpawn: 2 }
];
