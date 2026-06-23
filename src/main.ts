import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./game/BootScene";
import { CollectionScene } from "./game/CollectionScene";
import { GameOverScene } from "./game/GameOverScene";
import { GameScene } from "./game/GameScene";
import { MenuScene } from "./game/MenuScene";
import { UIScene } from "./game/UIScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#10121f",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [BootScene, MenuScene, CollectionScene, GameScene, UIScene, GameOverScene]
};

new Phaser.Game(config);
