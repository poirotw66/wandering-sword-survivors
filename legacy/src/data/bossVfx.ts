import Phaser from "phaser";
import type { BossSkillConfig } from "./bossSkills";
import { bossVfxFor } from "./bossVfxProfiles";
import { playSlashDepth } from "./evolutionVfx";

export { BOSS_VFX, bossVfxFor, type BossVfxProfile } from "./bossVfxProfiles";

function fadeAndDestroy(
  scene: Phaser.Scene,
  targets: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[],
  durationMs: number,
  extra?: Omit<Phaser.Types.Tweens.TweenBuilderConfig, "targets" | "onComplete">
): void {
  scene.tweens.add({
    ...extra,
    targets,
    alpha: 0,
    duration: durationMs,
    ease: "Sine.easeOut",
    onComplete: () => {
      const list = Array.isArray(targets) ? targets : [targets];
      for (const target of list) {
        target.destroy();
      }
    }
  });
}

function drawWedge(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  fillColor: number,
  fillAlpha: number,
  strokeColor: number,
  strokeAlpha: number
): void {
  graphics.clear();
  graphics.fillStyle(fillColor, fillAlpha);
  graphics.beginPath();
  graphics.moveTo(x, y);
  graphics.arc(x, y, radius, startAngle, endAngle, false);
  graphics.closePath();
  graphics.fillPath();
  graphics.lineStyle(2, strokeColor, strokeAlpha);
  graphics.strokePath();
}

export function playBossDashTelegraph(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  config: BossSkillConfig,
  windupMs: number,
  lockX?: number,
  lockY?: number
): void {
  const profile = bossVfxFor("dash");
  const warning = scene.add
    .rectangle(x, y, config.range, config.width + 4, profile.primaryColor, 0.34)
    .setRotation(angle)
    .setDepth(profile.telegraphDepth);
  scene.tweens.add({
    targets: warning,
    alpha: { from: 0.42, to: 0.1 },
    scaleX: { from: 0.3, to: 1 },
    duration: windupMs,
    yoyo: true,
    onComplete: () => warning.destroy()
  });

  const edge = scene.add
    .rectangle(x, y, config.range * 0.92, 2, profile.accentColor, 0.75)
    .setRotation(angle)
    .setDepth(profile.telegraphDepth + 1);
  scene.tweens.add({
    targets: edge,
    alpha: 0,
    scaleX: 1.08,
    duration: windupMs,
    onComplete: () => edge.destroy()
  });

  if (lockX !== undefined && lockY !== undefined) {
    const marker = scene.add.graphics().setDepth(profile.telegraphDepth + 2);
    const drawCrosshair = (scale: number, alpha: number): void => {
      marker.clear();
      marker.lineStyle(2, profile.accentColor, alpha);
      marker.strokeCircle(lockX, lockY, 22 * scale);
      marker.lineBetween(lockX - 18 * scale, lockY, lockX + 18 * scale, lockY);
      marker.lineBetween(lockX, lockY - 18 * scale, lockX, lockY + 18 * scale);
    };
    drawCrosshair(0.75, 0.85);
    scene.tweens.add({
      targets: { scale: 0.75 },
      scale: 1.2,
      duration: windupMs,
      yoyo: true,
      onUpdate: (_tween, target) => drawCrosshair(target.scale, 0.85 - (target.scale - 0.75) * 0.35),
      onComplete: () => marker.destroy()
    });
  }
}

export function playBossDashLunge(scene: Phaser.Scene, x: number, y: number, angle: number, color: number): void {
  for (let i = 0; i < 4; i += 1) {
    const trail = scene.add
      .rectangle(x - Math.cos(angle) * i * 14, y - Math.sin(angle) * i * 14, 54 - i * 8, 10, color, 0.34 - i * 0.06)
      .setRotation(angle)
      .setDepth(14);
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 1.35,
      duration: 180 + i * 40,
      onComplete: () => trail.destroy()
    });
  }
  playSlashDepth(scene, x, y, color, angle, true);
}

export function playBossFanTelegraph(
  scene: Phaser.Scene,
  x: number,
  y: number,
  angle: number,
  config: BossSkillConfig,
  windupMs: number
): Phaser.GameObjects.Graphics {
  const profile = bossVfxFor("fanStrike");
  const wedge = scene.add.graphics().setDepth(profile.telegraphDepth);
  const start = angle - config.arcRadians / 2;
  const end = angle + config.arcRadians / 2;
  drawWedge(wedge, x, y, config.range, start, end, profile.primaryColor, 0.2, profile.accentColor, 0.62);

  const pulse = { alpha: 0.2 };
  scene.tweens.add({
    targets: pulse,
    alpha: 0.38,
    duration: windupMs * 0.45,
    yoyo: true,
    repeat: 1,
    onUpdate: () => drawWedge(wedge, x, y, config.range, start, end, profile.primaryColor, pulse.alpha, profile.accentColor, 0.62)
  });

  for (let i = -2; i <= 2; i += 1) {
    const slashAngle = angle + i * (config.arcRadians / 6);
    const tipX = x + Math.cos(slashAngle) * config.range * 0.82;
    const tipY = y + Math.sin(slashAngle) * config.range * 0.82;
    const slash = scene.add.rectangle(tipX, tipY, 36, 5, profile.accentColor, 0.45).setRotation(slashAngle).setDepth(profile.telegraphDepth + 1);
    scene.tweens.add({
      targets: slash,
      alpha: { from: 0.2, to: 0.55 },
      scaleX: { from: 0.6, to: 1.2 },
      duration: windupMs,
      yoyo: true,
      onComplete: () => slash.destroy()
    });
  }

  return wedge;
}

export function playBossFanImpact(scene: Phaser.Scene, x: number, y: number, angle: number, config: BossSkillConfig): void {
  const profile = bossVfxFor("fanStrike");
  playSlashDepth(scene, x, y, profile.hitColor, angle, true);
  for (let i = -1; i <= 1; i += 1) {
    const slashAngle = angle + i * 0.35;
    const slash = scene.add
      .rectangle(x + Math.cos(slashAngle) * 48, y + Math.sin(slashAngle) * 48, 72, 8, config.color, 0.5)
      .setRotation(slashAngle)
      .setDepth(profile.impactDepth);
    fadeAndDestroy(scene, slash, 220, { scaleX: 1.8 });
  }
}

export function playBossFanLingerZone(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color: number,
  lingerMs: number
): Phaser.GameObjects.Arc {
  const ring = scene.add.circle(x, y, radius, color, 0).setDepth(8).setStrokeStyle(2, color, 0.55);
  const fill = scene.add.circle(x, y, radius * 0.72, color, 0.14).setDepth(7);
  scene.tweens.add({
    targets: [ring, fill],
    alpha: { from: 0.55, to: 0.18 },
    duration: 360,
    yoyo: true,
    repeat: Math.max(0, Math.floor(lingerMs / 360) - 1)
  });
  scene.time.delayedCall(lingerMs, () => {
    ring.destroy();
    fill.destroy();
  });
  return ring;
}

export function playBossSummonTelegraph(scene: Phaser.Scene, x: number, y: number, range: number, windupMs: number): void {
  const profile = bossVfxFor("summon");
  const rune = scene.add.image(x, y, "boss-rune").setDepth(profile.telegraphDepth).setTint(profile.primaryColor).setAlpha(0.55);
  scene.tweens.add({
    targets: rune,
    alpha: { from: 0.35, to: 0.75 },
    scale: { from: range / 90, to: (range / 90) * 1.25 },
    angle: 90,
    duration: windupMs,
    yoyo: true,
    onComplete: () => rune.destroy()
  });

  for (let i = 0; i < 3; i += 1) {
    const ring = scene.add.circle(x, y, range * (0.45 + i * 0.18), profile.primaryColor, 0).setDepth(profile.telegraphDepth - 1).setStrokeStyle(2 - i * 0.4, profile.accentColor, 0.5 - i * 0.12);
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.25 + i * 0.1,
      duration: windupMs,
      delay: i * 80,
      onComplete: () => ring.destroy()
    });
  }
}

export function playBossSummonBurst(scene: Phaser.Scene, x: number, y: number, color: number, guard = false): void {
  const accent = guard ? 0xf7c66b : color;
  const burst = scene.add.circle(x, y, 28, accent, 0.38).setDepth(15);
  scene.tweens.add({
    targets: burst,
    alpha: 0,
    scale: guard ? 2.4 : 2,
    duration: 360,
    onComplete: () => burst.destroy()
  });
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6;
    const spark = scene.add.circle(x, y, guard ? 4 : 3, 0xffffff, 0.85).setDepth(16);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * (guard ? 72 : 58),
      y: y + Math.sin(angle) * (guard ? 72 : 58),
      alpha: 0,
      scale: 0.2,
      duration: 280,
      onComplete: () => spark.destroy()
    });
  }
}

export function playBossNeedleTelegraph(
  scene: Phaser.Scene,
  x: number,
  y: number,
  centerAngle: number,
  config: BossSkillConfig,
  windupMs: number,
  sectorRadians?: number,
  needleCount = 18
): void {
  const profile = bossVfxFor("needleStorm");
  if (sectorRadians) {
    const wedge = scene.add.graphics().setDepth(profile.telegraphDepth);
    const start = centerAngle - sectorRadians / 2;
    const end = centerAngle + sectorRadians / 2;
    drawWedge(wedge, x, y, config.range * 0.72, start, end, profile.primaryColor, 0.16, profile.accentColor, 0.5);
    scene.time.delayedCall(windupMs, () => wedge.destroy());
  }

  for (let i = 0; i < needleCount; i += 1) {
    const angle = sectorRadians
      ? centerAngle - sectorRadians / 2 + (sectorRadians * i) / Math.max(1, needleCount - 1)
      : (Math.PI * 2 * i) / needleCount;
    const length = sectorRadians ? 180 : 110;
    const line = scene.add
      .rectangle(x, y, length, 3, profile.primaryColor, 0.32)
      .setRotation(angle)
      .setDepth(profile.telegraphDepth);
    scene.tweens.add({
      targets: line,
      alpha: { from: 0.15, to: 0.5 },
      scaleX: { from: 0.55, to: 1 },
      duration: windupMs,
      yoyo: true,
      onComplete: () => line.destroy()
    });
  }

  const core = scene.add.image(x, y, "boss-needle").setDepth(profile.telegraphDepth + 1).setTint(profile.accentColor).setAlpha(0.7).setScale(2.2, 4);
  scene.tweens.add({
    targets: core,
    alpha: { from: 0.45, to: 0.85 },
    scaleX: 2.8,
    scaleY: 5,
    angle: 180,
    duration: windupMs,
    yoyo: true,
    onComplete: () => core.destroy()
  });
}

export function playBossNeedleLaunchBurst(scene: Phaser.Scene, x: number, y: number): void {
  const profile = bossVfxFor("needleStorm");
  const ring = scene.add.circle(x, y, 20, profile.hitColor, 0.42).setDepth(profile.impactDepth);
  scene.tweens.add({
    targets: ring,
    alpha: 0,
    scale: 2.2,
    duration: 180,
    ease: "Sine.easeOut",
    onComplete: () => ring.destroy()
  });
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    const shard = scene.add
      .image(x, y, "boss-needle")
      .setTint(profile.accentColor)
      .setRotation(angle)
      .setScale(1.2)
      .setDepth(profile.impactDepth + 1);
    scene.tweens.add({
      targets: shard,
      x: x + Math.cos(angle) * 36,
      y: y + Math.sin(angle) * 36,
      alpha: 0,
      duration: 200,
      onComplete: () => shard.destroy()
    });
  }
}

export function playBossOrbitCharge(scene: Phaser.Scene, x: number, y: number, windupMs: number): void {
  const profile = bossVfxFor("orbit");
  const ring = scene.add.circle(x, y, 16, profile.primaryColor, 0).setDepth(profile.telegraphDepth).setStrokeStyle(2, profile.accentColor, 0.75);
  const core = scene.add.image(x, y, "boss-needle").setTint(profile.primaryColor).setScale(1.4).setDepth(profile.telegraphDepth + 1);
  scene.tweens.add({
    targets: [ring, core],
    alpha: { from: 0.35, to: 0.9 },
    scale: { from: 0.7, to: 1.25 },
    duration: windupMs * 0.45,
    yoyo: true,
    onComplete: () => {
      ring.destroy();
      core.destroy();
    }
  });
}

export function playBossFinalPhaseBurst(scene: Phaser.Scene, x: number, y: number): void {
  const profile = bossVfxFor("phase");
  const pulse = scene.add.circle(x, y, 42, profile.primaryColor, 0.34).setDepth(profile.telegraphDepth);
  scene.tweens.add({
    targets: pulse,
    alpha: 0,
    scale: 4.2,
    duration: 720,
    ease: "Sine.easeOut",
    onComplete: () => pulse.destroy()
  });
  for (let i = 0; i < 3; i += 1) {
    const ring = scene.add.circle(x, y, 56 + i * 28, profile.primaryColor, 0).setDepth(profile.telegraphDepth - i).setStrokeStyle(3 - i, profile.accentColor, 0.55 - i * 0.12);
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.5 + i * 0.2,
      duration: 640 + i * 80,
      delay: i * 60,
      onComplete: () => ring.destroy()
    });
  }
}
