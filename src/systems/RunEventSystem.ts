import Phaser from "phaser";
import {
  RUN_EVENT_CONFIG,
  canRollRunEvent,
  rollRunEventId,
  runEventDurationSec,
  type RunEventId
} from "../data/runEvents";
import { isPressureWaveActive, RUN_PACING, segmentFor } from "../data/runPacing";
import type { GameState } from "../game/GameState";
import { enemyName, t } from "../i18n";
import type { EnemySystem } from "./EnemySystem";
import type { PickupSystem } from "./PickupSystem";
import type { Player } from "../entities/Player";
import { pickOne } from "../utils/random";

export class RunEventSystem {
  private lastRollSec = 0;
  private lastTriggeredSec = -RUN_EVENT_CONFIG.minGapSec;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemySystem: EnemySystem,
    private readonly pickupSystem: PickupSystem,
    private readonly state: GameState
  ) {}

  update(elapsedSec: number): void {
    if (elapsedSec - this.lastRollSec < RUN_EVENT_CONFIG.rollIntervalSec) {
      return;
    }
    this.lastRollSec = elapsedSec;

    const nowMs = this.scene.time.now;
    if (isPressureWaveActive(elapsedSec)) {
      return;
    }
    if (
      !canRollRunEvent(
        elapsedSec,
        this.lastTriggeredSec,
        this.state.activeRunEventId,
        this.state.activeRunEventUntilMs,
        nowMs
      )
    ) {
      return;
    }

    const eventId = rollRunEventId();
    this.lastTriggeredSec = elapsedSec;
    this.triggerEvent(eventId, elapsedSec, nowMs);
  }

  private triggerEvent(eventId: RunEventId, elapsedSec: number, nowMs: number): void {
    switch (eventId) {
      case "ambush":
        this.triggerAmbush(elapsedSec);
        break;
      case "qiSurge":
        this.startTimedEvent("qiSurge", nowMs);
        this.scene.events.emit("milestone-unlocked", t("runEventQiSurge"));
        break;
      case "formationLull":
        this.startTimedEvent("formationLull", nowMs);
        this.scene.events.emit("milestone-unlocked", t("runEventFormationLull"));
        break;
      case "hermitGift":
        this.triggerHermitGift();
        break;
      case "banditCache":
        this.triggerBanditCache();
        break;
      default:
        break;
    }
  }

  private startTimedEvent(eventId: RunEventId, nowMs: number): void {
    const durationSec = runEventDurationSec(eventId);
    this.state.activeRunEventId = eventId;
    this.state.activeRunEventUntilMs = nowMs + durationSec * 1000;
  }

  private triggerAmbush(elapsedSec: number): void {
    const pool = segmentFor(elapsedSec).themeEnemyIds;
    const featuredEnemyId = pickOne(pool);
    this.scene.events.emit("milestone-unlocked", t("runEventAmbush", { name: enemyName(featuredEnemyId) }));

    for (let index = 0; index < RUN_EVENT_CONFIG.ambushCount; index += 1) {
      if (this.enemySystem.activeMinionCount() >= RUN_PACING.ordinaryEnemyCap) {
        break;
      }
      const enemyId = index < 3 ? featuredEnemyId : pickOne(pool);
      const point = this.randomSpawnPoint(420 + index * 8);
      const elite = Math.random() < RUN_EVENT_CONFIG.ambushEliteChance;
      this.enemySystem.spawn(enemyId, point.x, point.y, elite);
    }
  }

  private triggerHermitGift(): void {
    const healAmount = Math.max(8, Math.round(this.player.stats.maxHp * RUN_EVENT_CONFIG.hermitHealRatio));
    this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + healAmount);
    this.scene.events.emit("player-healed", healAmount);
    this.scene.events.emit("milestone-unlocked", t("runEventHermitGift"));
  }

  private triggerBanditCache(): void {
    this.scene.events.emit("milestone-unlocked", t("runEventBanditCache"));
    for (let index = 0; index < RUN_EVENT_CONFIG.banditCacheCount; index += 1) {
      const point = this.randomSpawnPoint(120 + index * 36);
      this.pickupSystem.spawnHealthAt(point.x, point.y, RUN_EVENT_CONFIG.banditCacheHeal);
    }
  }

  private randomSpawnPoint(distance: number): Phaser.Math.Vector2 {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    return new Phaser.Math.Vector2(
      this.player.x + Math.cos(angle) * distance,
      this.player.y + Math.sin(angle) * distance
    );
  }
}
