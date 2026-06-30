import Phaser from "phaser";
import { WuxiaBgmSystem } from "./WuxiaBgmSystem";

export function mountHubBgm(scene: Phaser.Scene): void {
  const bgm = WuxiaBgmSystem.shared();
  bgm.setMode("hub");

  if (bgm.isUnlocked()) {
    return;
  }

  const unlock = () => {
    void bgm.unlock();
  };
  scene.input.once("pointerdown", unlock);
  scene.input.keyboard?.once("keydown", unlock);
}
