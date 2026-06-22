import Phaser from "phaser";
import { BOSS_SCHEDULE, SPAWN_WAVES, type BossScheduleEntry } from "../data/waves";
import type { EnemySystem } from "./EnemySystem";
import type { Player } from "../entities/Player";
import { clamp } from "../utils/math";

export class SpawnSystem {
  private readonly lastSpawn = new Map<string, number>();
  private readonly spawnedBossMarks = new Set<number>();
  private lastElapsedSec = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemySystem: EnemySystem
  ) {}

  update(elapsedSec: number): void {
    this.lastElapsedSec = elapsedSec;
    for (const wave of SPAWN_WAVES) {
      if (elapsedSec < wave.startTimeSec || elapsedSec > wave.endTimeSec) {
        continue;
      }

      const key = `${wave.enemyId}-${wave.startTimeSec}`;
      const last = this.lastSpawn.get(key) ?? -Infinity;
      const pressureMultiplier = clamp(1 - elapsedSec / 1800 * 0.42, 0.58, 1);
      if (this.scene.time.now - last < wave.spawnIntervalMs * pressureMultiplier) {
        continue;
      }

      this.lastSpawn.set(key, this.scene.time.now);
      const amount = wave.amountPerSpawn + Math.min(6, Math.floor(elapsedSec / 360));
      for (let i = 0; i < amount; i += 1) {
        const point = this.randomSpawnPoint();
        this.enemySystem.spawn(wave.enemyId, point.x, point.y);
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

  private spawnScheduledBoss(entry: BossScheduleEntry): void {
    if (this.spawnedBossMarks.has(entry.markSec)) {
      return;
    }

    this.spawnedBossMarks.add(entry.markSec);
    const point = this.randomSpawnPoint(520);
    const boss = this.enemySystem.spawn(entry.enemyId, point.x, point.y);
    this.scene.events.emit("boss-health-changed", boss.hp, boss.maxHp, boss.config.name);
    this.scene.events.emit("boss-spawned", boss.config.name, entry.markSec);
  }

  private randomSpawnPoint(distance = 460): Phaser.Math.Vector2 {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    return new Phaser.Math.Vector2(
      this.player.x + Math.cos(angle) * distance,
      this.player.y + Math.sin(angle) * distance
    );
  }
}
