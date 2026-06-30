export function expToNextForLevel(level: number): number {
  const base = Math.floor((12 + level * 7 + level ** 1.52) * 10);
  if (level < 30) {
    // ponytail: level 1 ~30% less exp, tapering to ~5% less by level 29
    const earlyEase = 0.7 + (level / 30) * 0.25;
    return Math.max(72, Math.floor(base * earlyEase));
  }
  // Level 30+: each tier needs noticeably more exp
  const latePressure = 1.12 + Math.min(0.55, ((level - 30) / 18) * 0.55);
  return Math.floor(base * latePressure);
}
