class_name MutationDef
extends Resource

@export var id: String = ""
@export var name_key: String = ""
@export var desc_key: String = ""
@export var unlock_content_ids: PackedStringArray = PackedStringArray()
@export var requires_boss_id: String = ""
@export var min_chapter_clears: int = 0
@export var target_weapon_id: String = ""
## Behavior flags applied to the current run only (no permanent raw stats).
@export var behavior_flags: Dictionary = {}
@export var grant_weapon_in_run: bool = true
