class_name ManualDef
extends Resource

## Data-driven secret manual: one tag + one passive/stat/trigger hook.

@export var id: String = ""
@export var name_key: String = ""
@export var desc_key: String = ""
@export var tag: String = Tags.JIAN
@export var hook_kind: String = "stat" ## stat | passive | trigger
@export var hook_id: String = "" ## e.g. damage_mult | pickup_range | on_dash_iframe
@export var amount: float = 0.0
