class_name EnemyDef
extends Resource

@export var id: String = ""
@export var name_key: String = ""
@export var hp: float = 40.0
@export var damage: float = 10.0
@export var move_speed: float = 80.0
@export var exp_reward: int = 2
@export var score: int = 10
@export var radius: float = 14.0
@export var behavior: String = "chaser" ## chaser | dasher | tank | ranger
@export var tint: Color = Color(0.4, 0.8, 0.5)
@export var is_boss: bool = false
@export var ends_run_on_defeat: bool = false
## Boss signature profile beyond shared fan shots: rush_cleave | brand_ring | frost_needles
@export var signature: String = ""
@export var telegraph_sec: float = 0.55
@export var signature_cooldown_sec: float = 3.2
@export var signature_shot_count: int = 5
@export var signature_spread: float = 0.5
