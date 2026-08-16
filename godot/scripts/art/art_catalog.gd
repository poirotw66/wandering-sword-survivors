class_name ArtCatalog
extends RefCounted

## Resolves content ids to optional textures under res://assets/art/.
## Missing files return null so callers keep Polygon2D fallbacks.

const ROOT := "res://assets/art/"

static var _cache: Dictionary = {}

static func wave1_manifest() -> PackedStringArray:
	return PackedStringArray([
		"player_yunhe",
		"enemy.green_cliff",
		"enemy.crimson_sand",
		"enemy.frost_peak",
		"enemy.ink_river",
		"enemy.mist_bandit",
		"enemy.reed_knife",
		"boss.ravine_enforcer",
		"boss.sand_hierarch",
		"boss.frost_blade_fiend",
		"proj_sword_qi",
		"proj_enemy",
		"pickup_xp",
		"pickup_heal",
	])


static func file_stem(content_id: String) -> String:
	return content_id.replace(".", "_")


static func path_for(content_id: String) -> String:
	var stem := file_stem(content_id)
	if stem == "player_yunhe" or stem.begins_with("enemy_") or stem.begins_with("boss_"):
		return ROOT + "characters/" + stem + ".png"
	if stem.begins_with("proj_"):
		return ROOT + "projectiles/" + stem + ".png"
	if stem.begins_with("pickup_"):
		return ROOT + "pickups/" + stem + ".png"
	return ""


static func texture_for(content_id: String) -> Texture2D:
	if _cache.has(content_id):
		return _cache[content_id] as Texture2D
	var path := path_for(content_id)
	if path.is_empty() or not ResourceLoader.exists(path):
		_cache[content_id] = null
		return null
	var tex := load(path) as Texture2D
	_cache[content_id] = tex
	return tex


static func apply(sprite: Sprite2D, poly: CanvasItem, content_id: String, px_height: float) -> bool:
	var tex := texture_for(content_id)
	if sprite == null:
		return false
	if tex == null:
		sprite.visible = false
		sprite.texture = null
		if poly:
			poly.visible = true
		return false
	sprite.texture = tex
	sprite.centered = true
	var th := float(tex.get_height())
	var s := px_height / th if th > 0.0 else 1.0
	sprite.scale = Vector2(s, s)
	sprite.visible = true
	if poly:
		poly.visible = false
	return true


static func clear(sprite: Sprite2D, poly: CanvasItem) -> void:
	if sprite:
		sprite.visible = false
		sprite.texture = null
	if poly:
		poly.visible = true
