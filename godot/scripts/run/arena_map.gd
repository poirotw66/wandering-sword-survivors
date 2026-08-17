class_name ArenaMap
extends Node2D

## Mist-ravine run arena: camera-locked scenic plate + tiled ground wash.

const WORLD_HALF := 4200.0

var _scenic: Sprite2D
var _camera: Camera2D

func setup(camera: Camera2D) -> void:
	_camera = camera
	z_index = -40
	_build_base()
	_build_scenic()
	_build_tiles()

func _build_base() -> void:
	## Fallback plate so the arena is never pure clear-color black.
	var base := Polygon2D.new()
	base.name = "BasePlate"
	base.z_index = -3
	base.color = Color(0.22, 0.32, 0.30, 1.0)
	base.polygon = PackedVector2Array([
		Vector2(-WORLD_HALF, -WORLD_HALF),
		Vector2(WORLD_HALF, -WORLD_HALF),
		Vector2(WORLD_HALF, WORLD_HALF),
		Vector2(-WORLD_HALF, WORLD_HALF),
	])
	add_child(base)

func _build_scenic() -> void:
	var tex := ArtCatalog.texture_for("run_bg_mist_ravine")
	if tex == null:
		tex = ArtCatalog.texture_for("hub_bg_mist_ravine")
	if tex == null:
		return
	_scenic = Sprite2D.new()
	_scenic.name = "Scenic"
	_scenic.texture = tex
	_scenic.centered = true
	_scenic.z_index = -2
	_scenic.modulate = Color(0.92, 0.95, 0.98, 1.0)
	add_child(_scenic)
	_fit_scenic()

func _build_tiles() -> void:
	var tex := ArtCatalog.texture_for("run_ground_mist_ravine")
	if tex == null:
		return
	var tile_w := float(tex.get_width())
	var tile_h := float(tex.get_height())
	if tile_w < 1.0 or tile_h < 1.0:
		return
	## One repeating sprite instead of hundreds of nodes.
	var ground := Sprite2D.new()
	ground.name = "GroundTiles"
	ground.texture = tex
	ground.centered = true
	ground.z_index = -1
	ground.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	ground.region_enabled = true
	ground.region_rect = Rect2(0.0, 0.0, WORLD_HALF * 2.0, WORLD_HALF * 2.0)
	## Let a bit of scenic atmosphere read through the tile wash.
	ground.modulate = Color(1.0, 1.0, 1.0, 0.78)
	add_child(ground)

func _process(_delta: float) -> void:
	if _scenic == null:
		return
	var center := Vector2.ZERO
	if _camera and is_instance_valid(_camera):
		center = _camera.get_screen_center_position()
	## Screen-locked plate: never leave clear-color gaps while roaming.
	_scenic.global_position = center
	_fit_scenic()

func _fit_scenic() -> void:
	if _scenic == null or _scenic.texture == null:
		return
	var vp := get_viewport().get_visible_rect().size
	var tw := float(_scenic.texture.get_width())
	var th := float(_scenic.texture.get_height())
	if tw < 1.0 or th < 1.0:
		return
	## Cover viewport with a little bleed for orientation changes.
	var sx := (vp.x * 1.4) / tw
	var sy := (vp.y * 1.4) / th
	var s := maxf(sx, sy)
	_scenic.scale = Vector2(s, s)
