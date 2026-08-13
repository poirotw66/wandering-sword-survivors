class_name WaveValidation
extends Object

static func validate(wave_list: Array) -> PackedStringArray:
	var errors: PackedStringArray = PackedStringArray()
	var ids: Dictionary = {}
	for w in wave_list:
		if w.id == "":
			errors.append("wave missing id")
			continue
		if ids.has(w.id):
			errors.append("duplicate wave id: %s" % w.id)
		ids[w.id] = true
		if w.end_sec <= w.start_sec:
			errors.append("wave %s end<=start" % w.id)
		if w.interval_sec <= 0.0:
			errors.append("wave %s bad interval" % w.id)
		if w.amount < 1:
			errors.append("wave %s bad amount" % w.id)
		if w.enemy_id == "":
			errors.append("wave %s missing enemy" % w.id)
	return errors
