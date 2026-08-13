class_name Resonance
extends RefCounted

## Tag stacks and dominant / cross-tag rules for the public build.

const TIER_THRESHOLDS: Array[int] = [2, 4, 6]
const CROSS_MIN := 2

var stacks: Dictionary = {
	Tags.JIAN: 0,
	Tags.QI: 0,
	Tags.SHEN: 0,
	Tags.YI: 0,
}
var preferred_tag: String = ""

func set_preferred_tag(tag: String) -> void:
	preferred_tag = tag if Tags.is_valid(tag) else ""

func add_tag(tag: String, amount: int = 1) -> void:
	if not Tags.is_valid(tag):
		return
	stacks[tag] = int(stacks.get(tag, 0)) + amount

func tier_for(tag: String) -> int:
	var n: int = int(stacks.get(tag, 0))
	var tier := 0
	for t in TIER_THRESHOLDS:
		if n >= t:
			tier += 1
	return tier

func total_stacks() -> int:
	var s := 0
	for tag in Tags.ALL:
		s += int(stacks.get(tag, 0))
	return s

## Dominant tag by stack count. Ties prefer start-style preferred_tag, else Tags.ALL order.
func dominant_tag() -> String:
	var top := -1
	for tag in Tags.ALL:
		top = maxi(top, int(stacks.get(tag, 0)))
	if top <= 0:
		if Tags.is_valid(preferred_tag):
			return preferred_tag
		return Tags.JIAN
	var tied: Array[String] = []
	for tag in Tags.ALL:
		if int(stacks.get(tag, 0)) == top:
			tied.append(tag)
	if preferred_tag in tied:
		return preferred_tag
	return tied[0]

func is_tie_for_dominant() -> bool:
	var top := -1
	var count := 0
	for tag in Tags.ALL:
		var n: int = int(stacks.get(tag, 0))
		if n > top:
			top = n
			count = 1
		elif n == top:
			count += 1
	return count > 1 and top > 0

func cross_pairs() -> Array[String]:
	var pairs: Array[String] = []
	for i in range(Tags.ALL.size()):
		for j in range(i + 1, Tags.ALL.size()):
			var a: String = Tags.ALL[i]
			var b: String = Tags.ALL[j]
			if int(stacks.get(a, 0)) >= CROSS_MIN and int(stacks.get(b, 0)) >= CROSS_MIN:
				pairs.append("%s+%s" % [a, b])
	return pairs

func damage_multiplier() -> float:
	var m := 1.0
	for tag in Tags.ALL:
		m += 0.04 * tier_for(tag)
	m += 0.06 * cross_pairs().size()
	return m

func cooldown_multiplier() -> float:
	var m := 1.0
	m -= 0.03 * tier_for(Tags.YI)
	m -= 0.02 * tier_for(Tags.SHEN)
	return maxf(0.55, m)

func move_speed_bonus() -> float:
	return 12.0 * tier_for(Tags.SHEN)

func max_hp_bonus() -> float:
	return 18.0 * tier_for(Tags.QI)

func rage_profile() -> String:
	match dominant_tag():
		Tags.QI:
			return "pulse"
		Tags.SHEN:
			return "gale"
		Tags.YI:
			return "echo"
		_:
			return "blade"
