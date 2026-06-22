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
  { startTimeSec: 0, endTimeSec: 90, enemyId: "slime", spawnIntervalMs: 1050, amountPerSpawn: 2 },
  { startTimeSec: 90, endTimeSec: 210, enemyId: "slime", spawnIntervalMs: 820, amountPerSpawn: 3 },
  { startTimeSec: 120, endTimeSec: 270, enemyId: "bat", spawnIntervalMs: 1280, amountPerSpawn: 2 },
  { startTimeSec: 210, endTimeSec: 390, enemyId: "bat", spawnIntervalMs: 900, amountPerSpawn: 3 },
  { startTimeSec: 240, endTimeSec: 420, enemyId: "golem", spawnIntervalMs: 1950, amountPerSpawn: 1 },
  { startTimeSec: 390, endTimeSec: 600, enemyId: "slime", spawnIntervalMs: 500, amountPerSpawn: 5 },
  { startTimeSec: 420, endTimeSec: 600, enemyId: "bat", spawnIntervalMs: 720, amountPerSpawn: 4 },
  { startTimeSec: 450, endTimeSec: 600, enemyId: "golem", spawnIntervalMs: 1280, amountPerSpawn: 2 }
];
