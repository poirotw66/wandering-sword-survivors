import Phaser from "phaser";
import type { EvolutionId } from "./evolutions";
import { evolutionVfxFor } from "./evolutionVfxProfiles";

export { EVOLUTION_VFX, evolutionVfxFor, type EvolutionVfxProfile } from "./evolutionVfxProfiles";

function playSlashDepth(scene: Phaser.Scene, x: number, y: number, color: number, angle: number, intense = false): void {
  const ghost = scene.add.rectangle(x, y, intense ? 84 : 68, intense ? 12 : 9, color, intense ? 0.28 : 0.2).setDepth(16).setRotation(angle);
  scene.tweens.add({
    targets: ghost,
    alpha: 0,
    scaleX: intense ? 2.6 : 2.1,
    duration: intense ? 320 : 260,
    ease: "Sine.easeOut",
    onComplete: () => ghost.destroy()
  });

  const sparkCount = intense ? 7 : 4;
  for (let i = 0; i < sparkCount; i += 1) {
    const offsetAngle = angle + Phaser.Math.FloatBetween(-0.7, 0.7);
    const distance = Phaser.Math.Between(8, intense ? 28 : 20);
    const spark = scene.add
      .circle(x + Math.cos(offsetAngle) * distance, y + Math.sin(offsetAngle) * distance, intense ? 3 : 2, 0xffffff, 0.82)
      .setDepth(18);
    scene.tweens.add({
      targets: spark,
      x: spark.x + Math.cos(offsetAngle) * Phaser.Math.Between(12, 24),
      y: spark.y + Math.sin(offsetAngle) * Phaser.Math.Between(12, 24),
      alpha: 0,
      scale: 0.2,
      duration: Phaser.Math.Between(140, 220),
      ease: "Sine.easeOut",
      onComplete: () => spark.destroy()
    });
  }
}

export function playEvolutionFireBurst(scene: Phaser.Scene, x: number, y: number, evolutionId: EvolutionId): void {
  const profile = evolutionVfxFor(evolutionId);
  const color = profile.primaryColor;

  const ring = scene.add.circle(x, y, 18, color, 0.34).setDepth(17);
  scene.tweens.add({
    targets: ring,
    alpha: 0,
    scale: profile.burstStyle === "vortex" || profile.burstStyle === "vajra" ? 3.2 : 2.4,
    duration: profile.burstStyle === "gale" ? 120 : 180,
    ease: "Sine.easeOut",
    onComplete: () => ring.destroy()
  });

  if (profile.burstStyle === "slash" || profile.burstStyle === "drunken") {
    for (let i = -1; i <= 1; i += 1) {
      const slashAngle = i * 0.42;
      const slash = scene.add.rectangle(x, y, 64, 8, color, 0.42).setDepth(17).setRotation(slashAngle);
      scene.tweens.add({ targets: slash, alpha: 0, scaleX: 1.8, duration: 140, onComplete: () => slash.destroy() });
      if (profile.burstStyle === "slash") {
        playSlashDepth(scene, x, y, color, slashAngle, i === 0);
      }
    }
  } else if (profile.burstStyle === "ring") {
    for (let i = 0; i < 3; i += 1) {
      const arc = scene.add.circle(x, y, 22 + i * 10, color, 0).setDepth(17).setStrokeStyle(2, color, 0.55 - i * 0.12);
      scene.tweens.add({ targets: arc, alpha: 0, scale: 1.6 + i * 0.2, duration: 200 + i * 40, onComplete: () => arc.destroy() });
    }
  } else if (profile.burstStyle === "palm" || profile.burstStyle === "vortex") {
    for (let i = 0; i < 5; i += 1) {
      const angle = (Math.PI * 2 * i) / 5;
      const line = scene.add.rectangle(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20, 28, 4, color, 0.5).setDepth(17).setRotation(angle);
      scene.tweens.add({ targets: line, alpha: 0, scaleX: 2, duration: 160, onComplete: () => line.destroy() });
    }
  } else if (profile.burstStyle === "petal") {
    for (let i = 0; i < 4; i += 1) {
      const petal = scene.add.ellipse(x, y, 10, 18, color, 0.45).setDepth(17).setRotation(i * 0.8);
      scene.tweens.add({ targets: petal, x: x + Phaser.Math.Between(-36, 36), y: y - Phaser.Math.Between(18, 42), alpha: 0, duration: 220, onComplete: () => petal.destroy() });
    }
  } else if (profile.burstStyle === "gale") {
    const streak = scene.add.rectangle(x - 28, y, 72, 6, color, 0.38).setDepth(17);
    scene.tweens.add({ targets: streak, x: x + 36, alpha: 0, duration: 130, onComplete: () => streak.destroy() });
  } else if (profile.burstStyle === "quake") {
    const crack = scene.add.rectangle(x, y + 8, 80, 4, color, 0.5).setDepth(16);
    scene.tweens.add({ targets: crack, scaleX: 1.8, alpha: 0, duration: 180, onComplete: () => crack.destroy() });
  } else if (profile.burstStyle === "frost") {
    const frost = scene.add.circle(x, y, 30, 0xc8f0ff, 0.22).setDepth(16);
    scene.tweens.add({ targets: frost, alpha: 0, scale: 1.7, duration: 200, onComplete: () => frost.destroy() });
  } else if (profile.burstStyle === "vajra") {
    const fist = scene.add.circle(x, y, 24, color, 0.4).setDepth(17);
    scene.tweens.add({ targets: fist, alpha: 0, scale: 2.2, duration: 150, onComplete: () => fist.destroy() });
  }
}

export function playEvolutionHitBurst(scene: Phaser.Scene, x: number, y: number, evolutionId: EvolutionId, crit: boolean): void {
  const profile = evolutionVfxFor(evolutionId);
  const radius = crit ? 18 : 12;
  const flash = scene.add.circle(x, y, radius, profile.hitColor, crit ? 0.62 : 0.48).setDepth(36);
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scale: crit ? 2.6 : 2,
    duration: crit ? 150 : 120,
    ease: "Sine.easeOut",
    onComplete: () => flash.destroy()
  });
  if (crit && profile.burstStyle === "slash") {
    const shardAngle = Phaser.Math.FloatBetween(-0.8, 0.8);
    const shard = scene.add.rectangle(x, y, 22, 3, 0xffffff, 0.7).setDepth(37).setRotation(shardAngle);
    scene.tweens.add({ targets: shard, alpha: 0, scaleX: 2.4, duration: 120, onComplete: () => shard.destroy() });
    playSlashDepth(scene, x, y, profile.hitColor, shardAngle, true);
  } else if (profile.burstStyle === "slash") {
    playSlashDepth(scene, x, y, profile.hitColor, Phaser.Math.FloatBetween(-0.5, 0.5), false);
  }
}
