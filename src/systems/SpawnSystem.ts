import Phaser from "phaser";
import { BOSS_SCHEDULE, SPAWN_DENSITY, SPAWN_WAVES, type BossScheduleEntry } from "../data/waves";
import { pressureWaveIndex, RUN_PACING, spawnPacingModifiers } from "../data/runPacing";
import { eliteSpawnChance, spawnPressureMultiplier } from "../data/runBalance";
import type { GameState } from "../game/GameState";
import type { EnemySystem } from "./EnemySystem";
import type { Player } from "../entities/Player";
import { enemyName, t } from "../i18n";

export class SpawnSystem {
  private readonly lastSpawn = new Map<string, number>();
  private readonly spawnedBossMarks = new Set<number>();
  private lastElapsedSec = 0;
  private lastPressureWaveIndex = -1;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemySystem: EnemySystem,
    private readonly state: GameState
  ) {
    this.scene.events.on("boss-defeated", () => {
      this.state.respiteUntilMs = this.scene.time.now + RUN_PACING.respiteDurationSec * 1000;
      this.scene.events.emit("milestone-unlocked", t("respiteStart"));
    });
  }

  update(elapsedSec: number): void {
    this.lastElapsedSec = elapsedSec;
    this.announcePressureWave(elapsedSec);

    for (const wave of SPAWN_WAVES) {
      if (elapsedSec < wave.startTimeSec || elapsedSec > wave.endTimeSec) {
        continue;
      }

      const pacing = spawnPacingModifiers(
        elapsedSec,
        this.scene.time.now,
        this.state.respiteUntilMs,
        this.enemySystem.activeMinionCount(),
        wave.enemyId
      );
      if (pacing.atEnemyCap) {
        continue;
      }

      const key = `${wave.enemyId}-${wave.startTimeSec}`;
      const last = this.lastSpawn.get(key) ?? -Infinity;
      const pressureMultiplier = spawnPressureMultiplier(elapsedSec);
      const spawnInterval =
        wave.spawnIntervalMs * pressureMultiplier * SPAWN_DENSITY.intervalScale * pacing.intervalMultiplier;
      if (this.scene.time.now - last < spawnInterval) {
        continue;
      }

      this.lastSpawn.set(key, this.scene.time.now);
      const amount = Math.max(
        1,
        Math.round(
          (wave.amountPerSpawn +
            SPAWN_DENSITY.amountBonus +
            Math.min(SPAWN_DENSITY.timeAmountScaleCap, Math.floor(elapsedSec / SPAWN_DENSITY.timeAmountScaleStepSec))) *
            pacing.amountMultiplier
        )
      );
      for (let i = 0; i < amount; i += 1) {
        if (this.enemySystem.activeMinionCount() >= RUN_PACING.ordinaryEnemyCap) {
          break;
        }
        const point = this.randomSpawnPoint();
        const eliteChance = eliteSpawnChance(elapsedSec);
        this.enemySystem.spawn(wave.enemyId, point.x, point.y, Math.random() < eliteChance);
      }
    }

    for (const entry of BOSS_SCHEDULE) {
      if (elapsedSec >= entry.markSec && !this.spawnedBossMarks.has(entry.markSec)) {
        this.spawnScheduledBoss(entry);
      }
    }
  }

  spawnBossNow(): void {
    const nextEntry =
      BOSS_SCHEDULE.find((entry) => !this.spawnedBossMarks.has(entry.markSec) && entry.markSec >= this.lastElapsedSec) ??
      BOSS_SCHEDULE.find((entry) => !this.spawnedBossMarks.has(entry.markSec));

    if (!nextEntry) {
      return;
    }

    this.spawnScheduledBoss(nextEntry);
  }

  private announcePressureWave(elapsedSec: number): void {
    const waveIndex = pressureWaveIndex(elapsedSec);
    if (waveIndex < 0 || waveIndex === this.lastPressureWaveIndex) {
      return;
    }

    const offsetInCycle = elapsedSec % RUN_PACING.pressureWaveIntervalSec;
    if (offsetInCycle >= RUN_PACING.pressureWaveDurationSec) {
      return;
    }

    this.lastPressureWaveIndex = waveIndex;
    this.scene.events.emit("milestone-unlocked", t("pressureWaveStart"));
  }

  private spawnScheduledBoss(entry: BossScheduleEntry): void {
    if (this.spawnedBossMarks.has(entry.markSec)) {
      return;
    }

    this.spawnedBossMarks.add(entry.markSec);
    const point = this.randomSpawnPoint(520);
    const boss = this.enemySystem.spawn(entry.enemyId, point.x, point.y);
    this.scene.events.emit("boss-health-changed", boss.hp, boss.maxHp, enemyName(boss.enemyId));
    this.scene.events.emit("boss-spawned", enemyName(boss.enemyId), entry.markSec, boss.enemyId);
  }

  private randomSpawnPoint(distance = 460): Phaser.Math.Vector2 {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    return new Phaser.Math.Vector2(
      this.player.x + Math.cos(angle) * distance,
      this.player.y + Math.sin(angle) * distance
    );
  }
}
