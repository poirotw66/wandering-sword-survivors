class_name BossScheduleEntry
extends Resource

@export var id: String = ""
@export var mark_sec: float = 300.0
@export var enemy_id: String = ""
## Two eligible mutation choices for mid-chapter bosses; empty for final win boss.
@export var mutation_reward_ids: PackedStringArray = PackedStringArray()
