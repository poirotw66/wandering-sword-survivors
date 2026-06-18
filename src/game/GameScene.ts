import Phaser from "phaser";
import { GAME_DURATION_SEC } from "../data/waves";
import { Player } from "../entities/Player";
import { CollisionSystem } from "../systems/CollisionSystem";
import { EnemySystem } from "../systems/EnemySystem";
import { ExpSystem } from "../systems/ExpSystem";
import { PlayerSystem } from "../systems/PlayerSystem";
import { PickupSystem } from "../systems/PickupSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { UpgradeSystem } from "../systems/UpgradeSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import type { UpgradeOption } from "../data/upgrades";
import type { GameOverData } from "./GameOverScene";
import type { GameState } from "./GameState";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private state!: GameState;
  private playerSystem!: PlayerSystem;
  private enemySystem!: EnemySystem;
  private spawnSystem!: SpawnSystem;
  private weaponSystem!: WeaponSystem;
  private expSystem!: ExpSystem;
  private pickupSystem!: PickupSystem;
  private upgradeSystem!: UpgradeSystem;
  private ended = false;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.ended = false;
    this.events.removeAllListeners("level-up");
    this.events.removeAllListeners("game-won");
    this.events.removeAllListeners("player-damaged");
    this.events.removeAllListeners("enemy-killed");
    this.events.removeAllListeners("player-healed");
    this.physics.world.setBounds(-3000, -3000, 6000, 6000);
    this.cameras.main.setBackgroundColor("#111421");

    this.createFloor();
    this.player = new Player(this, 0, 0);
    this.state = {
      player: this.player,
      level: 1,
      exp: 0,
      expToNext: 8,
      score: 0,
      kills: 0,
      elapsedSec: 0,
      pausedForUpgrade: false,
      pausedForMenu: false,
      weaponLevels: new Map()
    };

    this.playerSystem = new PlayerSystem(this, this.player);
    this.enemySystem = new EnemySystem(this, this.player);
    this.spawnSystem = new SpawnSystem(this, this.player, this.enemySystem);
    this.weaponSystem = new WeaponSystem(this, this.player, this.enemySystem, this.state.weaponLevels);
    this.expSystem = new ExpSystem(this, this.player, this.state);
    this.pickupSystem = new PickupSystem(this, this.player);
    this.upgradeSystem = new UpgradeSystem(this, this.state);
    new CollisionSystem(
      this,
      this.player,
      this.state,
      this.enemySystem,
      this.weaponSystem,
      this.expSystem,
      this.pickupSystem
    );

    this.scene.launch("UIScene", this.state);
    this.events.on("level-up", () => this.upgradeSystem.open());
    this.events.on("game-won", () => this.finish(true));
    this.events.on("player-damaged", () => {
      this.cameras.main.shake(120, 0.006);
      if (this.player.stats.hp <= 0) {
        this.finish(false);
      }
    });
    this.events.on("enemy-killed", (x: number, y: number, score: number) => this.showScorePop(x, y, score));
    this.events.on("player-healed", (amount: number) => this.showScorePop(this.player.x, this.player.y - 12, amount, "#84f7b2"));
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    const uiEvents = this.scene.get("UIScene").events;
    uiEvents.removeAllListeners("upgrade-picked");
    uiEvents.on("upgrade-picked", (option: UpgradeOption) => {
      this.upgradeSystem.apply(option);
    });
  }

  update(_time: number, delta: number): void {
    if (this.ended || this.state.pausedForUpgrade) {
      return;
    }

    if (this.state.pausedForMenu) {
      return;
    }

    this.state.elapsedSec += delta / 1000;
    this.playerSystem.update();
    this.spawnSystem.update(this.state.elapsedSec);
    this.enemySystem.update();
    this.weaponSystem.update();
    this.expSystem.update();
    this.pickupSystem.update();

    if (this.state.elapsedSec >= GAME_DURATION_SEC && this.enemySystem.activeCount() === 0) {
      this.finish(true);
    }
  }

  private createFloor(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x24283b, 0.45);
    for (let x = -3000; x <= 3000; x += 120) {
      graphics.lineBetween(x, -3000, x, 3000);
    }
    for (let y = -3000; y <= 3000; y += 120) {
      graphics.lineBetween(-3000, y, 3000, y);
    }
    graphics.setDepth(-10);
  }

  private finish(won: boolean): void {
    if (this.ended) {
      return;
    }
    this.ended = true;
    const data: GameOverData = {
      won,
      score: this.state.score,
      kills: this.state.kills,
      elapsedSec: this.state.elapsedSec
    };
    this.scene.stop("UIScene");
    this.scene.start("GameOverScene", data);
  }

  private togglePause(): void {
    if (this.ended || this.state.pausedForUpgrade) {
      return;
    }

    this.state.pausedForMenu = !this.state.pausedForMenu;
    if (this.state.pausedForMenu) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
    this.scene.get("UIScene").events.emit("pause-changed", this.state.pausedForMenu);
  }

  private showScorePop(x: number, y: number, score: number, color = "#f7c66b"): void {
    const text = this.add
      .text(x, y - 18, `+${score}`, {
        fontSize: "16px",
        color,
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(40);
    this.tweens.add({
      targets: text,
      y: y - 54,
      alpha: 0,
      duration: 520,
      ease: "Sine.easeOut",
      onComplete: () => text.destroy()
    });
  }
}
