import Phaser from "phaser";

export const HUB = {
  inkDeep: 0x060810,
  inkMid: 0x0d121c,
  scrollFill: 0x101620,
  scrollInner: 0x0c1018,
  gold: 0xc9a24d,
  goldBright: 0xf7c66b,
  goldDim: 0x5f4a2a,
  jade: 0x84f7b2,
  mist: 0xaac7d8,
  parchment: 0xf7efd8,
  swordBlue: 0x6f8aa8,
  qiPurple: 0xb86bff
} as const;

export function paintMenuBackdrop(scene: Phaser.Scene, width: number, height: number): void {
  const base = scene.add.graphics().setDepth(0);
  base.fillGradientStyle(HUB.inkDeep, HUB.inkDeep, HUB.inkMid, 0x162030, 1);
  base.fillRect(0, 0, width, height);

  const mountains = scene.add.graphics().setDepth(1).setAlpha(0.55);
  mountains.fillStyle(0x0a1018, 0.95);
  mountains.beginPath();
  mountains.moveTo(0, height);
  mountains.lineTo(0, height * 0.72);
  mountains.lineTo(width * 0.18, height * 0.58);
  mountains.lineTo(width * 0.34, height * 0.68);
  mountains.lineTo(width * 0.52, height * 0.5);
  mountains.lineTo(width * 0.7, height * 0.64);
  mountains.lineTo(width * 0.88, height * 0.54);
  mountains.lineTo(width, height * 0.66);
  mountains.lineTo(width, height);
  mountains.closePath();
  mountains.fillPath();

  mountains.fillStyle(0x121a26, 0.85);
  mountains.beginPath();
  mountains.moveTo(0, height);
  mountains.lineTo(0, height * 0.8);
  mountains.lineTo(width * 0.24, height * 0.7);
  mountains.lineTo(width * 0.46, height * 0.78);
  mountains.lineTo(width * 0.62, height * 0.66);
  mountains.lineTo(width * 0.82, height * 0.74);
  mountains.lineTo(width, height * 0.68);
  mountains.lineTo(width, height);
  mountains.closePath();
  mountains.fillPath();

  scene.add.circle(width * 0.84, height * 0.14, Math.min(54, width * 0.05), 0xf7efd8, 0.07).setDepth(1);
  scene.add.circle(width * 0.84, height * 0.14, Math.min(70, width * 0.065), HUB.mist, 0.04).setDepth(1);

  const vignette = scene.add.graphics().setDepth(2);
  vignette.fillStyle(0x000000, 0.28);
  vignette.fillRect(0, 0, width, height * 0.12);
  vignette.fillStyle(0x000000, 0.35);
  vignette.fillRect(0, height * 0.88, width, height * 0.12);

  for (let i = 0; i < 5; i += 1) {
    const mist = scene.add
      .ellipse(Phaser.Math.Between(40, width - 40), Phaser.Math.Between(Math.floor(height * 0.2), Math.floor(height * 0.75)), 120, 28, HUB.mist, 0.035)
      .setDepth(1);
    scene.tweens.add({
      targets: mist,
      x: mist.x + Phaser.Math.Between(-30, 30),
      alpha: { from: 0.02, to: 0.06 },
      duration: Phaser.Math.Between(4200, 6800),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }
}

export function drawScrollPanel(
  scene: Phaser.Scene,
  centerX: number,
  zoneY: number,
  zoneHeight: number,
  panelWidth: number,
  depth = 5
): { contentTop: number; innerWidth: number; innerLeft: number; panelBottom: number } {
  const centerY = zoneY + zoneHeight / 2;
  const innerLeft = centerX - panelWidth / 2 + 20;
  const innerWidth = panelWidth - 40;
  const panelBottom = zoneY + zoneHeight;

  const shadow = scene.add.rectangle(centerX + 3, centerY + 4, panelWidth, zoneHeight, 0x000000, 0.35).setDepth(depth);
  shadow.setStrokeStyle(0);

  const body = scene.add.rectangle(centerX, centerY, panelWidth, zoneHeight, HUB.scrollFill, 0.94).setDepth(depth + 1);
  body.setStrokeStyle(2, HUB.goldDim, 0.95);

  const inner = scene.add
    .rectangle(centerX, centerY, panelWidth - 8, zoneHeight - 8, HUB.scrollInner, 0.55)
    .setDepth(depth + 2);
  inner.setStrokeStyle(1, HUB.gold, 0.22);

  scene.add.rectangle(centerX, zoneY + 2, panelWidth - 10, 4, HUB.gold, 0.5).setDepth(depth + 3);

  const corners = scene.add.graphics().setDepth(depth + 3);
  corners.lineStyle(2, HUB.gold, 0.75);
  const left = centerX - panelWidth / 2;
  const right = centerX + panelWidth / 2;
  const top = zoneY;
  const bottom = panelBottom;
  const tick = 14;
  corners.lineBetween(left + 6, top + 8, left + 6 + tick, top + 8);
  corners.lineBetween(left + 6, top + 8, left + 6, top + 8 + tick);
  corners.lineBetween(right - 6, top + 8, right - 6 - tick, top + 8);
  corners.lineBetween(right - 6, top + 8, right - 6, top + 8 + tick);
  corners.lineBetween(left + 6, bottom - 8, left + 6 + tick, bottom - 8);
  corners.lineBetween(left + 6, bottom - 8, left + 6, bottom - 8 - tick);
  corners.lineBetween(right - 6, bottom - 8, right - 6 - tick, bottom - 8);
  corners.lineBetween(right - 6, bottom - 8, right - 6, bottom - 8 - tick);

  return { contentTop: zoneY + 16, innerWidth, innerLeft, panelBottom };
}

export function drawSectionTab(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  fontFamily: string,
  depth = 8
): void {
  const tab = scene.add
    .text(x, y, `『 ${label} 』`, {
      fontFamily,
      fontSize: "15px",
      color: "#ffe09a",
      fontStyle: "700"
    })
    .setDepth(depth)
    .setOrigin(0, 0.5);
  const underline = scene.add.rectangle(x + tab.width / 2, y + 12, tab.width + 8, 1, HUB.gold, 0.45).setDepth(depth - 1);
  underline.setOrigin(0.5, 0);
}

export function drawGoalRibbon(scene: Phaser.Scene, centerX: number, zoneY: number, zoneHeight: number, panelWidth: number, depth = 6): number {
  const y = zoneY + zoneHeight / 2;
  scene.add.rectangle(centerX, y, panelWidth, zoneHeight, 0x0a1218, 0.72).setDepth(depth).setStrokeStyle(1, HUB.goldDim, 0.45);
  scene.add.rectangle(centerX, zoneY + 1, panelWidth - 24, 2, HUB.jade, 0.35).setDepth(depth + 1);
  return y;
}
