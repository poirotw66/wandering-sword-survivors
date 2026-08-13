class_name WeaponDef
extends Resource

@export var id: String = ""
@export var name_key: String = ""
@export var tag: String = Tags.JIAN
@export var base_damage: float = 20.0
@export var cooldown_sec: float = 0.7
@export var projectile_speed: float = 420.0
@export var projectile_count: int = 1
@export var pierce: int = 1
@export var radius: float = 8.0
@export var pattern: String = "bolt" ## bolt | orbit | nova | strike
@export var starter: bool = false
