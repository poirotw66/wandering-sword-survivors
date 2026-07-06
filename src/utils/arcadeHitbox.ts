/** Arcade circle hit radii kept in sync with scaled sprites. */
export function projectileHitRadius(displayWidth: number, displayHeight: number): number {
  return Math.max(10, Math.min(displayWidth, displayHeight) * 0.5);
}

export function enemyHitRadius(displayHeight: number, isElite: boolean): number {
  return displayHeight * (isElite ? 0.44 : 0.42);
}

export function sweepHitDistance(enemyRadius: number, projectileRadius: number): number {
  return enemyRadius + projectileRadius;
}

export function shouldSweepFastProjectile(speed: number, deltaMs: number, projectileRadius: number): boolean {
  return speed * (deltaMs / 1000) > projectileRadius * 0.35;
}

export function syncArcadeCircleBody(sprite: Phaser.Physics.Arcade.Sprite, radius: number): void {
  const hitRadius = Math.max(4, radius);
  sprite.setCircle(hitRadius, sprite.width / 2 - hitRadius, sprite.height / 2 - hitRadius);
  sprite.refreshBody();
}
