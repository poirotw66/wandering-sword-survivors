import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./game/BootScene";
import { CollectionScene } from "./game/CollectionScene";
import { GameOverScene } from "./game/GameOverScene";
import { GameScene } from "./game/GameScene";
import { MenuScene } from "./game/MenuScene";
import { UIScene } from "./game/UIScene";
import { getRenderResolution } from "./utils/display";

const renderResolution = getRenderResolution();

const config = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#10121f",
  resolution: renderResolution,
  render: {
    antialias: true,
    roundPixels: false,
    powerPreference: "high-performance"
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  input: {
    activePointers: 2,
    touch: {
      capture: true
    }
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [BootScene, MenuScene, CollectionScene, GameScene, UIScene, GameOverScene]
} as Phaser.Types.Core.GameConfig;

new Phaser.Game(config);
