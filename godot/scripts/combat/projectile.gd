extends Area2D

var damage: float = 10.0
var speed: float = 400.0
var pierce_left: int = 1
var lifetime: float = 1.6
var _dir: Vector2 = Vector2.RIGHT
var _orbit_host: Node2D
var _orbit_angle: float = 0.0
var _orbit_radius: float = 40.0
var _is_orbit := false
var _is_strike := false
var _poly: Polygon2D
var _sprite: Sprite2D
var _pull_strength: float = 0.0
var _heal_on_hit: float = 0.0
var _heal_target: Node = null
var _return_damage_mult: float = 0.0

func _ready() -> void:
	_ensure_built()

func _ensure_built() -> void:
	collision_layer = 4
	collision_mask = 2
	monitorable = true
	if not body_entered.is_connected(_on_body):
		body_entered.connect(_on_body)
	if not area_entered.is_connected(_on_area):
		area_entered.connect(_on_area)
	if not has_node("Poly"):
		_poly = Polygon2D.new()
		_poly.name = "Poly"
		_poly.polygon = PackedVector2Array([Vector2(-4, -4), Vector2(6, 0), Vector2(-4, 4)])
		_poly.color = Color(0.95, 0.85, 0.35)
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
		sh.radius = 6
		cs.shape = sh
		add_child(cs)

func on_pool_release() -> void:
	_is_orbit = false
	_is_strike = false
	_orbit_host = null
	_pull_strength = 0.0
	_heal_on_hit = 0.0
	_heal_target = null
	_return_damage_mult = 0.0
	set_meta("spent", false)
	ArtCatalog.clear(_sprite, _poly)

func launch(origin: Vector2, dir: Vector2, dmg: float, spd: float, pierce: int, radius: float, strike: bool) -> void:
	_ensure_built()
	set_meta("spent", false)
	global_position = origin
	_dir = dir.normalized() if dir.length() > 0.0 else Vector2.ZERO
	damage = dmg
	speed = spd
	pierce_left = pierce
	_is_strike = strike
	_is_orbit = false
	lifetime = 0.22 if strike else 1.6
	visible = true
	set_deferred("monitoring", true)
	var cs := get_node_or_null("CollisionShape2D") as CollisionShape2D
	if cs:
		cs.set_deferred("disabled", false)
		if cs.shape is CircleShape2D:
			var sh := CircleShape2D.new()
			sh.radius = maxf(4.0, radius * 0.5)
			cs.shape = sh
	if _poly:
		_poly.color = Color(1.0, 0.55, 0.3) if strike else Color(0.95, 0.85, 0.35)
	ArtCatalog.apply(_sprite, _poly, "proj_sword_qi", maxf(14.0, radius * 1.2))
	if _sprite and _sprite.visible and _dir.x != 0.0:
		_sprite.flip_h = _dir.x < 0.0

func launch_orbit(host: Node2D, dmg: float, radius: float, duration: float, start_angle: float = -1.0) -> void:
	_ensure_built()
	set_meta("spent", false)
	_orbit_host = host
	_is_orbit = true
	_is_strike = false
	damage = dmg
	_orbit_radius = radius
	_orbit_angle = start_angle if start_angle >= 0.0 else randf() * TAU
	lifetime = duration
	pierce_left = 99
	visible = true
	set_deferred("monitoring", true)
	var cs := get_node_or_null("CollisionShape2D") as CollisionShape2D
	if cs:
		cs.set_deferred("disabled", false)
	if _poly:
		_poly.color = Color(0.7, 0.9, 1.0)
	ArtCatalog.apply(_sprite, _poly, "proj_sword_qi", 16.0)

func configure_effects(pull: float, heal_on_hit: float, heal_target: Node) -> void:
	_pull_strength = pull
	_heal_on_hit = heal_on_hit
	_heal_target = heal_target

func configure_return_damage(mult: float) -> void:
	_return_damage_mult = mult

func _physics_process(delta: float) -> void:
	if bool(get_meta("spent", false)):
		return
	lifetime -= delta
	if lifetime <= 0.0:
		_release()
		return
	if _is_orbit and is_instance_valid(_orbit_host):
		_orbit_angle += delta * 4.5
		global_position = _orbit_host.global_position + Vector2.RIGHT.rotated(_orbit_angle) * _orbit_radius
		return
	if _is_strike:
		return
	global_position += _dir * speed * delta

func _on_body(body: Node2D) -> void:
	_hit(body)

func _on_area(area: Area2D) -> void:
	if area.get_parent() and area.get_parent().is_in_group("enemies"):
		_hit(area.get_parent())

func _hit(target: Node) -> void:
	if bool(get_meta("spent", false)):
		return
	if not is_instance_valid(target):
		return
	if target.has_method("apply_damage"):
		target.call("apply_damage", damage)
		if _pull_strength > 0.0 and target is Node2D and is_instance_valid(_orbit_host) == false:
			## Pull toward projectile origin direction reverse (toward player-ish).
			var node2 := target as Node2D
			var toward := -_dir
			if toward.length() < 0.1 and _heal_target is Node2D:
				toward = ((_heal_target as Node2D).global_position - node2.global_position).normalized()
			node2.global_position += toward * _pull_strength * 0.08
		if _heal_on_hit > 0.0 and is_instance_valid(_heal_target) and _heal_target.has_method("heal"):
			_heal_target.call("heal", _heal_on_hit)
		if _return_damage_mult > 0.0 and is_instance_valid(_orbit_host) and _orbit_host.has_method("heal"):
			## ponytail: return-damage heals a sliver as "thorn absorb"; ceiling = reflect onto attacker only
			_orbit_host.call("heal", damage * _return_damage_mult * 0.05)
		pierce_left -= 1
		if pierce_left <= 0:
			_release()

func _release() -> void:
	if bool(get_meta("spent", false)):
		return
	set_meta("spent", true)
	PoolManager.release(self)
