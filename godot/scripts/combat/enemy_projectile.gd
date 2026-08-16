extends Area2D

var damage: float = 10.0
var speed: float = 200.0
var lifetime: float = 2.2
var _dir: Vector2 = Vector2.RIGHT
var _spent := false
var _poly: Polygon2D
var _sprite: Sprite2D

func _ready() -> void:
	collision_layer = 16
	collision_mask = 1
	set_meta("enemy_damage", damage)
	if not body_entered.is_connected(_on_body):
		body_entered.connect(_on_body)
	if not has_node("Poly"):
		_poly = Polygon2D.new()
		_poly.name = "Poly"
		_poly.polygon = PackedVector2Array([Vector2(-3, -3), Vector2(5, 0), Vector2(-3, 3)])
		_poly.color = Color(0.9, 0.4, 0.45)
		add_child(_poly)
	else:
		_poly = $Poly
	if not has_node("BodySprite"):
		_sprite = Sprite2D.new()
		_sprite.name = "BodySprite"
		_sprite.z_index = 1
		add_child(_sprite)
	else:
		_sprite = $BodySprite
	if not has_node("CollisionShape2D"):
		var cs := CollisionShape2D.new()
		cs.name = "CollisionShape2D"
		var sh := CircleShape2D.new()
		sh.radius = 5
		cs.shape = sh
		add_child(cs)

func on_pool_release() -> void:
	_spent = false
	ArtCatalog.clear(_sprite, _poly)

func launch(origin: Vector2, dir: Vector2, dmg: float, spd: float) -> void:
	_spent = false
	global_position = origin
	_dir = dir.normalized()
	damage = dmg
	speed = spd
	lifetime = 2.2
	set_meta("enemy_damage", damage)
	visible = true
	set_deferred("monitoring", true)
	var cs := get_node_or_null("CollisionShape2D") as CollisionShape2D
	if cs:
		cs.set_deferred("disabled", false)
	ArtCatalog.apply(_sprite, _poly, "proj_enemy", 14.0)
	if _sprite and _sprite.visible and _dir.x != 0.0:
		_sprite.flip_h = _dir.x < 0.0

func _physics_process(delta: float) -> void:
	if _spent:
		return
	lifetime -= delta
	if lifetime <= 0.0:
		_release()
		return
	global_position += _dir * speed * delta

func _on_body(body: Node2D) -> void:
	if _spent:
		return
	if body.is_in_group("player") and body.has_method("take_damage"):
		body.call("take_damage", damage)
		_release()

func _release() -> void:
	if _spent:
		return
	_spent = true
	PoolManager.release(self)
