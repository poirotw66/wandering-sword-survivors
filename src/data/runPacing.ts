import type { EnemyId } from "./enemies";
import { GAME_DURATION_SEC } from "./waves";
import type { RunEventPacingOverlay } from "./runEvents";

export const RUN_PACING = {
  pressureWaveIntervalSec: 300,
  pressureWaveDurationSec: 45,
  pressureSpawnMultiplier: 1.5,
  respiteDurationSec: 8,
  respiteSpawnMultiplier: 0.5,
  respiteExpMultiplier: 1.5,
  ordinaryEnemyCap: 120,
  segmentThemeIntervalMultiplier: 0.75
} as const;

export type RunSegment = {
  startSec: number;
  endSec: number;
  themeEnemyIds: readonly EnemyId[];
};

export const RUN_SEGMENTS: readonly RunSegment[] = [
  {
    startSec: 0,
    endSec: 600,
    themeEnemyIds: ["slime", "huashanSwordsman", "emeiDisciple", "beggarSect", "bat"]
  },
  {
    startSec: 600,
    endSec: 1200,
    themeEnemyIds: ["shaolinMonk", "golem", "poisonMaster", "sunMoonCultist", "hengshanNun"]
  },
  {
    startSec: 1200,
    endSec: GAME_DURATION_SEC,
    themeEnemyIds: ["royalGuard", "northernRider", "medicineHeretic", "wudangMonk", "taishanAcolyte"]
  }
];

export type SpawnPacingModifiers = {
  intervalMultiplier: number;
  amountMultiplier: number;
  expDropMultiplier: number;
  pressureWaveActive: boolean;
  respiteActive: boolean;
  atEnemyCap: boolean;
};

export function isPressureWaveActive(elapsedSec: number): boolean {
  if (elapsedSec < RUN_PACING.pressureWaveIntervalSec) {
    return false;
  }
  const offsetInCycle = elapsedSec % RUN_PACING.pressureWaveIntervalSec;
  return offsetInCycle < RUN_PACING.pressureWaveDurationSec;
}

export function isRespiteActive(respiteUntilMs: number, nowMs: number): boolean {
  return respiteUntilMs > nowMs;
}

export function segmentFor(elapsedSec: number): RunSegment {
  return RUN_SEGMENTS.find((segment) => elapsedSec >= segment.startSec && elapsedSec < segment.endSec) ?? RUN_SEGMENTS[RUN_SEGMENTS.length - 1];
}

export function isSegmentThemeEnemy(elapsedSec: number, enemyId: EnemyId): boolean {
  return segmentFor(elapsedSec).themeEnemyIds.includes(enemyId);
}

export function pressureWaveIndex(elapsedSec: number): number {
  if (elapsedSec < RUN_PACING.pressureWaveIntervalSec) {
    return -1;
  }
  return Math.floor(elapsedSec / RUN_PACING.pressureWaveIntervalSec);
}

export function spawnPacingModifiers(
  elapsedSec: number,
  nowMs: number,
  respiteUntilMs: number,
  activeMinionCount: number,
  enemyId: EnemyId,
  runEventOverlay: RunEventPacingOverlay = { spawnRateMultiplier: 1, expDropMultiplier: 1 }
): SpawnPacingModifiers {
  const pressureWaveActive = isPressureWaveActive(elapsedSec);
  const respiteActive = isRespiteActive(respiteUntilMs, nowMs);
  const atEnemyCap = activeMinionCount >= RUN_PACING.ordinaryEnemyCap;

  let intervalMultiplier = 1;
  let amountMultiplier = 1;

  if (pressureWaveActive) {
    intervalMultiplier /= RUN_PACING.pressureSpawnMultiplier;
    amountMultiplier *= RUN_PACING.pressureSpawnMultiplier;
  }

  if (respiteActive) {
    intervalMultiplier /= RUN_PACING.respiteSpawnMultiplier;
    amountMultiplier *= RUN_PACING.respiteSpawnMultiplier;
  }

  if (isSegmentThemeEnemy(elapsedSec, enemyId)) {
    intervalMultiplier *= RUN_PACING.segmentThemeIntervalMultiplier;
  }

  if (runEventOverlay.spawnRateMultiplier !== 1) {
    intervalMultiplier /= runEventOverlay.spawnRateMultiplier;
    amountMultiplier *= runEventOverlay.spawnRateMultiplier;
  }

  let expDropMultiplier = respiteActive ? RUN_PACING.respiteExpMultiplier : 1;
  expDropMultiplier *= runEventOverlay.expDropMultiplier;

  return {
    intervalMultiplier,
    amountMultiplier,
    expDropMultiplier,
    pressureWaveActive,
    respiteActive,
    atEnemyCap
  };
}

export function expDropMultiplierFor(
  elapsedSec: number,
  nowMs: number,
  respiteUntilMs: number,
  runEventOverlay: RunEventPacingOverlay = { spawnRateMultiplier: 1, expDropMultiplier: 1 }
): number {
  return spawnPacingModifiers(elapsedSec, nowMs, respiteUntilMs, 0, "slime", runEventOverlay).expDropMultiplier;
}
