export function expToNextForLevel(level: number): number {
  return Math.floor((12 + level * 7 + level ** 1.52) * 10);
}
