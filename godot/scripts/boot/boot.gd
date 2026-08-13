extends Node

func _ready() -> void:
	## Ensure content + save ready, then hub.
	await get_tree().process_frame
	get_tree().change_scene_to_file("res://scenes/hub/hub.tscn")
