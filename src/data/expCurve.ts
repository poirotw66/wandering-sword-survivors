export function expToNextForLevel(level: number): number {
  return Math.floor(8 + level * 5.5 + level ** 1.5);
}
