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

export const SPAWN_DENSITY = {
  intervalScale: 0.84,
  amountBonus: 1,
  timeAmountScaleStepSec: 300,
  timeAmountScaleCap: 8
};

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
  { startTimeSec: 0, endTimeSec: 210, enemyId: "slime", spawnIntervalMs: 1050, amountPerSpawn: 2 },
  { startTimeSec: 30, endTimeSec: 420, enemyId: "emeiDisciple", spawnIntervalMs: 1120, amountPerSpawn: 2 },
  { startTimeSec: 60, endTimeSec: 360, enemyId: "huashanSwordsman", spawnIntervalMs: 1180, amountPerSpawn: 2 },
  { startTimeSec: 90, endTimeSec: 480, enemyId: "wudangMonk", spawnIntervalMs: 1250, amountPerSpawn: 2 },
  { startTimeSec: 120, endTimeSec: 540, enemyId: "bat", spawnIntervalMs: 1280, amountPerSpawn: 2 },
  { startTimeSec: 150, endTimeSec: 600, enemyId: "beggarSect", spawnIntervalMs: 1100, amountPerSpawn: 2 },
  { startTimeSec: 180, endTimeSec: 620, enemyId: "riverBandit", spawnIntervalMs: 980, amountPerSpawn: 3 },
  { startTimeSec: 240, endTimeSec: 900, enemyId: "shaolinMonk", spawnIntervalMs: 1520, amountPerSpawn: 1 },
  { startTimeSec: 300, endTimeSec: 780, enemyId: "hengshanNun", spawnIntervalMs: 1380, amountPerSpawn: 2 },
  { startTimeSec: 360, endTimeSec: 1080, enemyId: "golem", spawnIntervalMs: 1950, amountPerSpawn: 1 },
  { startTimeSec: 360, endTimeSec: 1200, enemyId: "northernRider", spawnIntervalMs: 1050, amountPerSpawn: 3 },
  { startTimeSec: 480, endTimeSec: 1140, enemyId: "taishanAcolyte", spawnIntervalMs: 1680, amountPerSpawn: 2 },
  { startTimeSec: 480, endTimeSec: 1500, enemyId: "poisonMaster", spawnIntervalMs: 1320, amountPerSpawn: 2 },
  { startTimeSec: 600, endTimeSec: 1320, enemyId: "medicineHeretic", spawnIntervalMs: 1420, amountPerSpawn: 2 },
  { startTimeSec: 720, endTimeSec: 1500, enemyId: "sunMoonCultist", spawnIntervalMs: 1180, amountPerSpawn: 3 },
  { startTimeSec: 900, endTimeSec: 1800, enemyId: "royalGuard", spawnIntervalMs: 1780, amountPerSpawn: 2 },
  { startTimeSec: 600, endTimeSec: 1500, enemyId: "slime", spawnIntervalMs: 640, amountPerSpawn: 4 },
  { startTimeSec: 780, endTimeSec: 1800, enemyId: "bat", spawnIntervalMs: 820, amountPerSpawn: 4 },
  { startTimeSec: 960, endTimeSec: 1800, enemyId: "emeiDisciple", spawnIntervalMs: 920, amountPerSpawn: 3 },
  { startTimeSec: 1020, endTimeSec: 1800, enemyId: "golem", spawnIntervalMs: 1480, amountPerSpawn: 2 },
  { startTimeSec: 1140, endTimeSec: 1800, enemyId: "northernRider", spawnIntervalMs: 1180, amountPerSpawn: 3 },
  { startTimeSec: 1260, endTimeSec: 1800, enemyId: "shaolinMonk", spawnIntervalMs: 1380, amountPerSpawn: 2 },
  { startTimeSec: 1380, endTimeSec: 1800, enemyId: "poisonMaster", spawnIntervalMs: 1080, amountPerSpawn: 3 }
];
