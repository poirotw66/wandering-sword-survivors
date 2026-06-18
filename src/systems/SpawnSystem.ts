import Phaser from "phaser";
import { BOSS_SPAWN_SEC, SPAWN_WAVES } from "../data/waves";
import type { EnemySystem } from "./EnemySystem";
import type { Player } from "../entities/Player";
import { clamp } from "../utils/math";

export class SpawnSystem {
  private readonly lastSpawn = new Map<string, number>();
  private bossSpawned = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemySystem: EnemySystem
  ) {}

  update(elapsedSec: number): void {
    for (const wave of SPAWN_WAVES) {
      if (elapsedSec < wave.startTimeSec || elapsedSec > wave.endTimeSec) {
        continue;
      }

      const key = `${wave.enemyId}-${wave.startTimeSec}`;
      const last = this.lastSpawn.get(key) ?? -Infinity;
      const pressureMultiplier = clamp(1 - elapsedSec / 720 * 0.35, 0.62, 1);
      if (this.scene.time.now - last < wave.spawnIntervalMs * pressureMultiplier) {
        continue;
      }

      this.lastSpawn.set(key, this.scene.time.now);
      const amount = wave.amountPerSpawn + Math.floor(elapsedSec / 180);
      for (let i = 0; i < amount; i += 1) {
        const point = this.randomSpawnPoint();
        this.enemySystem.spawn(wave.enemyId, point.x, point.y);
      }
    }

    if (!this.bossSpawned && elapsedSec >= BOSS_SPAWN_SEC) {
      this.bossSpawned = true;
      const point = this.randomSpawnPoint(520);
      const boss = this.enemySystem.spawn("boss", point.x, point.y);
      this.scene.events.emit("boss-health-changed", boss.hp, boss.maxHp);
      this.scene.events.emit("boss-spawned");
    }
  }

  private randomSpawnPoint(distance = 460): Phaser.Math.Vector2 {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    return new Phaser.Math.Vector2(
      this.player.x + Math.cos(angle) * distance,
      this.player.y + Math.sin(angle) * distance
    );
  }
}
