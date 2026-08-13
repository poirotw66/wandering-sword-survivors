extends Node

## Content-unlock-only versioned JSON save. No run stats / currency inflation.

const SAVE_PATH := "user://wss_save_v1.json"
const SAVE_VERSION := 1

var data: Dictionary = {}

func _ready() -> void:
	load_or_default()

func default_save() -> Dictionary:
	return {
		"version": SAVE_VERSION,
		"unlocked_content_ids": [
			"weapon.sword_qi",
			"chapter.mist_ravine",
			"start_style.jian",
			"manual.cloud_edge",
			"manual.crane_stride",
		],
		"unlocked_mutations": [],
		"chapter_clears": {},
	}

func load_or_default() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		data = default_save()
		save()
		return
	var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		data = default_save()
		save()
		return
	data = _migrate(parsed)

func _migrate(raw: Dictionary) -> Dictionary:
	var out := default_save()
	var ver := int(raw.get("version", 0))
	if ver <= 0:
		return out
	if ver > SAVE_VERSION:
		return out
	out["version"] = SAVE_VERSION
	var unlocks: Array = raw.get("unlocked_content_ids", [])
	var merged: Array = out["unlocked_content_ids"]
	for id in unlocks:
		if id not in merged:
			merged.append(str(id))
	out["unlocked_content_ids"] = merged
	var muts: Array = raw.get("unlocked_mutations", [])
	out["unlocked_mutations"] = muts.map(func(x): return str(x))
	var clears: Variant = raw.get("chapter_clears", {})
	if typeof(clears) == TYPE_DICTIONARY:
		out["chapter_clears"] = clears
	return out

func migrate_for_test(raw: Dictionary) -> Dictionary:
	return _migrate(raw)

func save() -> void:
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	f.store_string(JSON.stringify(data, "\t"))

func is_unlocked(content_id: String) -> bool:
	var arr: Array = data.get("unlocked_content_ids", [])
	return content_id in arr

func unlock_content(content_id: String) -> void:
	var arr: Array = data.get("unlocked_content_ids", [])
	if content_id not in arr:
		arr.append(content_id)
		data["unlocked_content_ids"] = arr
		save()

func unlock_mutation(mutation_id: String) -> void:
	var arr: Array = data.get("unlocked_mutations", [])
	if mutation_id not in arr:
		arr.append(mutation_id)
		data["unlocked_mutations"] = arr
		save()

func record_chapter_clear(chapter_id: String) -> void:
	var clears: Dictionary = data.get("chapter_clears", {})
	clears[chapter_id] = int(clears.get(chapter_id, 0)) + 1
	data["chapter_clears"] = clears
	save()

func chapter_clears(chapter_id: String) -> int:
	var clears: Dictionary = data.get("chapter_clears", {})
	return int(clears.get(chapter_id, 0))

## Test helper: replace save data without touching disk permanently when caller restores.
func replace_data_for_test(next: Dictionary) -> void:
	data = next.duplicate(true)
