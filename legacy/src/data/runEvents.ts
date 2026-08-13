import { BOSS_SCHEDULE } from "./waves";
import { pickOne } from "../utils/random";

export type RunEventId = "ambush" | "qiSurge" | "formationLull" | "hermitGift" | "banditCache";

export const RUN_EVENT_CONFIG = {
  firstEligibleSec: 90,
  rollIntervalSec: 45,
  minGapSec: 120,
  bossAvoidSec: 18,
  pressureAvoidSec: 20,
  ambushCount: 10,
  ambushEliteChance: 0.35,
  qiSurgeDurationSec: 10,
  qiSurgeExpMultiplier: 1.6,
  lullDurationSec: 8,
  lullSpawnMultiplier: 0.45,
  hermitHealRatio: 0.18,
  banditCacheCount: 4,
  banditCacheHeal: 14
} as const;

const RUN_EVENT_POOL: readonly RunEventId[] = [
  "ambush",
  "ambush",
  "qiSurge",
  "qiSurge",
  "formationLull",
  "formationLull",
  "hermitGift",
  "hermitGift",
  "banditCache"
];

const MAJOR_BOSS_MARKS = BOSS_SCHEDULE.filter(
  (entry) =>
    entry.enemyId === "midBoss" ||
    entry.enemyId === "greatBoss" ||
    entry.enemyId === "megaBoss" ||
    entry.enemyId === "finalBoss"
).map((entry) => entry.markSec);

export function isRunEventActive(activeRunEventId: RunEventId | null, activeRunEventUntilMs: number, nowMs: number): boolean {
  return Boolean(activeRunEventId) && activeRunEventUntilMs > nowMs;
}

export function isNearBossMark(elapsedSec: number, avoidSec = RUN_EVENT_CONFIG.bossAvoidSec): boolean {
  return MAJOR_BOSS_MARKS.some((markSec) => Math.abs(elapsedSec - markSec) <= avoidSec);
}

export function isNearPressureWaveStart(elapsedSec: number, avoidSec = RUN_EVENT_CONFIG.pressureAvoidSec): boolean {
  if (elapsedSec < 300) {
    return false;
  }
  const offsetInCycle = elapsedSec % 300;
  return offsetInCycle <= avoidSec;
}

export function shouldAttemptRunEventRoll(elapsedSec: number, lastRollSec: number): boolean {
  if (elapsedSec < RUN_EVENT_CONFIG.firstEligibleSec) {
    return false;
  }
  return elapsedSec - lastRollSec >= RUN_EVENT_CONFIG.rollIntervalSec;
}

export function canRollRunEvent(
  elapsedSec: number,
  lastTriggeredSec: number,
  activeRunEventId: RunEventId | null,
  activeRunEventUntilMs: number,
  nowMs: number
): boolean {
  if (elapsedSec < RUN_EVENT_CONFIG.firstEligibleSec) {
    return false;
  }
  if (elapsedSec - lastTriggeredSec < RUN_EVENT_CONFIG.minGapSec) {
    return false;
  }
  if (isRunEventActive(activeRunEventId, activeRunEventUntilMs, nowMs)) {
    return false;
  }
  if (isNearBossMark(elapsedSec)) {
    return false;
  }
  if (isNearPressureWaveStart(elapsedSec)) {
    return false;
  }
  return true;
}

export function rollRunEventId(): RunEventId {
  return pickOne(RUN_EVENT_POOL);
}

export type RunEventPacingOverlay = {
  spawnRateMultiplier: number;
  expDropMultiplier: number;
};

export function runEventDurationSec(eventId: RunEventId): number {
  switch (eventId) {
    case "qiSurge":
      return RUN_EVENT_CONFIG.qiSurgeDurationSec;
    case "formationLull":
      return RUN_EVENT_CONFIG.lullDurationSec;
    default:
      return 0;
  }
}

export function runEventPacingOverlay(
  activeRunEventId: RunEventId | null,
  activeRunEventUntilMs: number,
  nowMs: number
): RunEventPacingOverlay {
  if (!isRunEventActive(activeRunEventId, activeRunEventUntilMs, nowMs)) {
    return { spawnRateMultiplier: 1, expDropMultiplier: 1 };
  }

  if (activeRunEventId === "qiSurge") {
    return { spawnRateMultiplier: 1, expDropMultiplier: RUN_EVENT_CONFIG.qiSurgeExpMultiplier };
  }

  if (activeRunEventId === "formationLull") {
    return { spawnRateMultiplier: RUN_EVENT_CONFIG.lullSpawnMultiplier, expDropMultiplier: 1 };
  }

  return { spawnRateMultiplier: 1, expDropMultiplier: 1 };
}
