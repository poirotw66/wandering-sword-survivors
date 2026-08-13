import type { EnemyId } from "./enemies";

export type BossPresentation = {
  tier: number;
  auraColor: number;
  portraitFrameColor: number;
  idlePulseScale: number;
  portraitScale: number;
  titleColor: string;
};

const BOSS_PRESENTATION: Partial<Record<EnemyId, BossPresentation>> = {
  minorBoss: {
    tier: 1,
    auraColor: 0xff8f70,
    portraitFrameColor: 0xff9b7a,
    idlePulseScale: 1.05,
    portraitScale: 1.05,
    titleColor: "#ffb08f"
  },
  midBoss: {
    tier: 2,
    auraColor: 0xff4f64,
    portraitFrameColor: 0xff7687,
    idlePulseScale: 1.06,
    portraitScale: 1.12,
    titleColor: "#ff8f9f"
  },
  greatBoss: {
    tier: 3,
    auraColor: 0xd9b45f,
    portraitFrameColor: 0xf7c66b,
    idlePulseScale: 1.07,
    portraitScale: 1.18,
    titleColor: "#ffe09a"
  },
  megaBoss: {
    tier: 4,
    auraColor: 0xb86bff,
    portraitFrameColor: 0xd8b4ff,
    idlePulseScale: 1.08,
    portraitScale: 1.24,
    titleColor: "#d8b4ff"
  },
  finalBoss: {
    tier: 5,
    auraColor: 0xff2f86,
    portraitFrameColor: 0xff73b8,
    idlePulseScale: 1.1,
    portraitScale: 1.32,
    titleColor: "#ff9bd2"
  }
};

export function bossPresentationFor(enemyId: EnemyId): BossPresentation | undefined {
  return BOSS_PRESENTATION[enemyId];
}

export function isBossEnemyId(enemyId: EnemyId): boolean {
  return enemyId in BOSS_PRESENTATION;
}
