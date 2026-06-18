import Phaser from "phaser";
import type { Enemy } from "../entities/Enemy";
import type { ExpGem } from "../entities/ExpGem";
import type { HealthPickup } from "../entities/HealthPickup";
import type { Player } from "../entities/Player";
import type { Projectile } from "../entities/Projectile";
import type { GameState } from "../game/GameState";
import type { EnemySystem } from "./EnemySystem";
import type { ExpSystem } from "./ExpSystem";
import type { PickupSystem } from "./PickupSystem";
import type { WeaponSystem } from "./WeaponSystem";

type ArcadeOverlapObject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile;

export class CollisionSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly state: GameState,
    enemySystem: EnemySystem,
    weaponSystem: WeaponSystem,
    private readonly expSystem: ExpSystem,
    private readonly pickupSystem: PickupSystem
  ) {
    scene.physics.add.overlap(
      weaponSystem.projectiles,
      enemySystem.enemies,
      this.projectileHitsEnemy,
      undefined,
      this
    );
    scene.physics.add.overlap(player, enemySystem.enemies, this.enemyHitsPlayer, undefined, this);
    scene.physics.add.overlap(player, expSystem.gems, this.playerCollectsGem, undefined, this);
    scene.physics.add.overlap(player, pickupSystem.healthPickups, this.playerCollectsHealth, undefined, this);
  }

  private projectileHitsEnemy(projectileObject: ArcadeOverlapObject, enemyObject: ArcadeOverlapObject): void {
    const projectile = projectileObject as Projectile;
    const enemy = enemyObject as Enemy;
    if (!projectile.active || !enemy.active || projectile.hitIds.has(enemy)) {
      return;
    }

    projectile.hitIds.add(enemy);
    const killed = enemy.damage(projectile.damage);
    if (enemy.enemyId === "boss") {
      this.scene.events.emit("boss-health-changed", Math.max(0, enemy.hp), enemy.maxHp);
    }
    projectile.pierceLeft -= 1;
    if (projectile.pierceLeft <= 0 && projectile.weaponId !== "orbitBlade") {
      projectile.expire();
    }

    if (killed) {
      this.killEnemy(enemy);
    }
  }

  private enemyHitsPlayer(_playerObject: ArcadeOverlapObject, enemyObject: ArcadeOverlapObject): void {
    const enemy = enemyObject as Enemy;
    const tookDamage = this.player.takeDamage(enemy.config.damage, this.scene.time.now);
    if (tookDamage) {
      this.scene.events.emit("player-damaged");
    }
  }

  private playerCollectsGem(_playerObject: ArcadeOverlapObject, gemObject: ArcadeOverlapObject): void {
    this.expSystem.collect(gemObject as ExpGem);
  }

  private playerCollectsHealth(_playerObject: ArcadeOverlapObject, pickupObject: ArcadeOverlapObject): void {
    this.pickupSystem.collect(pickupObject as HealthPickup);
  }

  private killEnemy(enemy: Enemy): void {
    this.state.kills += 1;
    this.state.score += enemy.config.score;
    this.scene.events.emit("enemy-killed", enemy.x, enemy.y, enemy.config.score);
    this.expSystem.drop(enemy.x, enemy.y, enemy.config.exp);
    this.pickupSystem.maybeDropHealth(enemy.x, enemy.y, enemy.enemyId === "golem" ? 0.16 : 0.055);
    const wasBoss = enemy.enemyId === "boss";
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);

    if (wasBoss) {
      this.scene.events.emit("game-won");
    }
  }
}
