class_name MathUtil
extends Object

static func clamp_f(v: float, lo: float, hi: float) -> float:
	return clampf(v, lo, hi)

static func exp_to_next(level: int) -> int:
	## Gentle early curve for a 15-minute chapter.
	return int(round(12.0 + level * 6.0 + pow(level, 1.35) * 2.2))
