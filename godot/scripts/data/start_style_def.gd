class_name StartStyleDef
extends Resource

## Hub opening route: starter weapons/tags/stats + preferred resonance tag for ties.

@export var id: String = ""
@export var name_key: String = ""
@export var desc_key: String = ""
@export var preferred_tag: String = Tags.JIAN
@export var starter_weapon_ids: PackedStringArray = PackedStringArray(["weapon.sword_qi"])
@export var starter_tag_stacks: Dictionary = {} ## tag -> int
@export var starter_stat_bonuses: Dictionary = {} ## stat -> float
@export var unlock_content_id: String = "" ## empty = always choosable
