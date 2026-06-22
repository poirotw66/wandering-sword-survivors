import type { EnemyId } from "./enemies";

export type SpawnWave = {
  startTimeSec: number;
  endTimeSec: number;
  enemyId: EnemyId;
  spawnIntervalMs: number;
  amountPerSpawn: number;
};

export type BossScheduleEntry = {
  markSec: number;
  enemyId: EnemyId;
};

export const GAME_DURATION_SEC = 1800;

export const BOSS_SCHEDULE: BossScheduleEntry[] = [
  { markSec: 60, enemyId: "minorBoss" },
  { markSec: 120, enemyId: "minorBoss" },
  { markSec: 180, enemyId: "minorBoss" },
  { markSec: 240, enemyId: "minorBoss" },
  { markSec: 300, enemyId: "midBoss" },
  { markSec: 360, enemyId: "minorBoss" },
  { markSec: 420, enemyId: "minorBoss" },
  { markSec: 480, enemyId: "minorBoss" },
  { markSec: 540, enemyId: "minorBoss" },
  { markSec: 600, enemyId: "greatBoss" },
  { markSec: 660, enemyId: "minorBoss" },
  { markSec: 720, enemyId: "minorBoss" },
  { markSec: 780, enemyId: "minorBoss" },
  { markSec: 840, enemyId: "minorBoss" },
  { markSec: 900, enemyId: "megaBoss" },
  { markSec: 960, enemyId: "minorBoss" },
  { markSec: 1020, enemyId: "minorBoss" },
  { markSec: 1080, enemyId: "minorBoss" },
  { markSec: 1140, enemyId: "minorBoss" },
  { markSec: 1200, enemyId: "megaBoss" },
  { markSec: 1260, enemyId: "minorBoss" },
  { markSec: 1320, enemyId: "minorBoss" },
  { markSec: 1380, enemyId: "minorBoss" },
  { markSec: 1440, enemyId: "minorBoss" },
  { markSec: 1500, enemyId: "megaBoss" },
  { markSec: 1560, enemyId: "minorBoss" },
  { markSec: 1620, enemyId: "minorBoss" },
  { markSec: 1680, enemyId: "minorBoss" },
  { markSec: 1740, enemyId: "minorBoss" },
  { markSec: 1800, enemyId: "finalBoss" }
];

export const SPAWN_WAVES: SpawnWave[] = [
  { startTimeSec: 0, endTimeSec: 180, enemyId: "slime", spawnIntervalMs: 1050, amountPerSpawn: 2 },
  { startTimeSec: 90, endTimeSec: 420, enemyId: "slime", spawnIntervalMs: 820, amountPerSpawn: 3 },
  { startTimeSec: 120, endTimeSec: 540, enemyId: "bat", spawnIntervalMs: 1280, amountPerSpawn: 2 },
  { startTimeSec: 300, endTimeSec: 900, enemyId: "bat", spawnIntervalMs: 900, amountPerSpawn: 3 },
  { startTimeSec: 360, endTimeSec: 1080, enemyId: "golem", spawnIntervalMs: 1950, amountPerSpawn: 1 },
  { startTimeSec: 600, endTimeSec: 1500, enemyId: "slime", spawnIntervalMs: 560, amountPerSpawn: 5 },
  { startTimeSec: 720, endTimeSec: 1800, enemyId: "bat", spawnIntervalMs: 760, amountPerSpawn: 4 },
  { startTimeSec: 900, endTimeSec: 1800, enemyId: "golem", spawnIntervalMs: 1380, amountPerSpawn: 2 }
];
