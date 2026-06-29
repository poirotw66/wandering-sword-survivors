export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString();
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function formatCompactNumber(value: number): string {
  const safe = Math.max(0, value);
  if (safe >= 1_000_000) {
    return `${(safe / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (safe >= 10_000) {
    return `${(safe / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  if (safe >= 1_000) {
    return `${(safe / 1_000).toFixed(1)}k`;
  }
  return String(Math.ceil(safe));
}

export function angleToVector(angle: number): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
}
