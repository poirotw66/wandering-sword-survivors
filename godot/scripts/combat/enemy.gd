extends CharacterBody2D

var def: EnemyDef
var hp: float = 10.0
var _telegraph: float = 0.0
var _dash_cd: float = 0.0
var _range_cd: float = 0.0
var _tank_lock: float = 0.0
var _alive := false
var _poly: Polygon2D
var _sprite: Sprite2D
var _warn: Polygon2D
var _boss_skill_cd: float = 2.0
var _boss_cast: float = 0.0
var _boss_dir: Vector2 = Vector2.RIGHT
var _boss_signature: String = ""

func _ready() -> void:
	_ensure_built()

func _ensure_built() -> void:
	add_to_group("enemies")
	collision_layer = 2
	collision_mask = 0
	if _poly == null:
		_poly = Polygon2D.new()
		_poly.name = "BodyPoly"
		_poly.polygon = PackedVector2Array([Vector2(-10, -10), Vector2(10, -10), Vector2(10, 10), Vector2(-10, 10)])
		add_child(_poly)
	if _sprite == null:
		_sprite = Sprite2D.new()
		_sprite.name = "BodySprite"
		_sprite.z_index = 1
		add_child(_sprite)
	if _warn == null:
		_warn = Polygon2D.new()
		_warn.name = "WarnPoly"
		_warn.color = Color(1, 0.3, 0.2, 0.35)
		_warn.visible = false
		add_child(_warn)
	if get_node_or_null("CollisionShape2D") == null:
		var cs := CollisionShape2D.new()
		cs.name = "CollisionShape2D"
		var sh := CircleShape2D.new()
		sh.radius = 12
		cs.shape = sh
		add_child(cs)

func on_pool_release() -> void:
	_alive = false
	def = null
	_telegraph = 0.0
	_boss_cast = 0.0
	_boss_signature = ""
	velocity = Vector2.ZERO
	ArtCatalog.clear(_sprite, _poly)

func activate(enemy_def: EnemyDef, pos: Vector2) -> void:
	_ensure_built()
	def = enemy_def
	hp = enemy_def.hp
	global_position = pos
	_alive = true
	_boss_signature = enemy_def.signature
	_boss_skill_cd = enemy_def.signature_cooldown_sec * 0.5 if enemy_def.is_boss else 2.0
	_poly.color = enemy_def.tint
	var scale_v := 1.0 if not enemy_def.is_boss else 1.8
	_poly.scale = Vector2(scale_v, scale_v)
	var base_h := enemy_def.radius * (3.2 if not enemy_def.is_boss else 4.0)
	var px_h := base_h * DisplayFit.combat_sprite_mult(get_viewport())
	ArtCatalog.apply(_sprite, _poly, enemy_def.id, px_h)
	var cs := get_node("CollisionShape2D") as CollisionShape2D
	if cs:
		var sh := CircleShape2D.new()
		sh.radius = enemy_def.radius * (0.7 if not enemy_def.is_boss else 0.9)
		cs.shape = sh
		cs.set_deferred("disabled", false)
	visible = true
	process_mode = Node.PROCESS_MODE_INHERIT

func get_contact_damage() -> float:
	return def.damage if def else 10.0

func apply_damage(amount: float) -> void:
	if not _alive:
		return
	hp -= amount
	var player: Node = get_tree().get_first_node_in_group("player")
	if player and player.has_method("add_rage"):
		player.call("add_rage", 2.5 if not (def and def.is_boss) else 1.2)
	if hp <= 0.0:
		_die()

func _die() -> void:
	_alive = false
	var drop_pos := global_position
	var drop_xp := def.exp_reward if def else 2
	var was_boss := def.is_boss if def else false
	var boss_id := def.id if def else ""
	var ends := def.ends_run_on_defeat if def else false
	if def:
		GameState.register_kill(def.score, def.exp_reward)
	call_deferred("_die_aftermath", drop_pos, drop_xp, was_boss, boss_id, ends)

func _die_aftermath(drop_pos: Vector2, drop_xp: int, was_boss: bool, boss_id: String, ends: bool) -> void:
	_spawn_pickup_at(drop_pos, drop_xp)
	if was_boss:
		## Final boss: end chapter first so mutation UI never opens after the win.
		if ends:
			GameState.end_run(true)
		var run: Node = get_tree().get_first_node_in_group("run_root")
		if run and run.has_method("on_boss_defeated") and not ends:
			run.call("on_boss_defeated", boss_id)
	PoolManager.release(self)

func _spawn_pickup_at(pos: Vector2, xp_amount: int) -> void:
	var scene: PackedScene = preload("res://scenes/run/pickup.tscn")
	var p: Node2D = PoolManager.acquire("pickup", scene)
	var host: Node = get_tree().get_first_node_in_group("run_world")
	if host:
		PoolManager.transfer(p, host)
	var kind := "xp"
	if randf() < 0.08:
		kind = "heal"
	p.call("activate", pos, kind, xp_amount)

func _physics_process(delta: float) -> void:
	if not _alive or GameState.phase != GameState.Phase.RUN or def == null:
		return
	var player := get_tree().get_first_node_in_group("player") as Node2D
	if player == null:
		return
	var to_player: Vector2 = player.global_position - global_position
	var dist := to_player.length()
	var dir := to_player.normalized() if dist > 0.1 else Vector2.ZERO
	if _boss_cast > 0.0:
		_tick_boss_cast(delta, dir)
		move_and_slide()
		return
	match def.behavior:
		"dasher":
			_behavior_dasher(delta, dir, dist)
		"tank":
			_behavior_tank(delta, dir)
		"ranger":
			_behavior_ranger(delta, dir, dist)
		_:
			velocity = dir * def.move_speed
	if def.is_boss:
		_boss_skills(delta, dir)
	move_and_slide()
	if _sprite and _sprite.visible and absf(velocity.x) > 8.0:
		_sprite.flip_h = velocity.x < 0.0

func _tick_boss_cast(delta: float, dir: Vector2) -> void:
	_boss_cast -= delta
	velocity = Vector2.ZERO
	_warn.visible = true
	match _boss_signature:
		"rush_cleave":
			_warn.color = Color(1.0, 0.55, 0.15, 0.4)
			_warn.polygon = PackedVector2Array([Vector2(0, 0), _boss_dir.rotated(-0.55) * 140.0, _boss_dir.rotated(0.55) * 140.0])
		"brand_ring":
			_warn.color = Color(0.95, 0.2, 0.25, 0.35)
			var pts: PackedVector2Array = PackedVector2Array()
			for i in range(10):
				pts.append(Vector2.RIGHT.rotated(TAU * float(i) / 10.0) * 96.0)
			_warn.polygon = pts
		"frost_needles":
			_warn.color = Color(0.55, 0.8, 1.0, 0.4)
			_warn.polygon = PackedVector2Array([
				_boss_dir.rotated(-0.9) * 130.0,
				_boss_dir * 150.0,
				_boss_dir.rotated(0.9) * 130.0,
				Vector2.ZERO,
			])
		_:
			_warn.polygon = PackedVector2Array([Vector2(0, 0), _boss_dir.rotated(-0.4) * 110.0, _boss_dir.rotated(0.4) * 110.0])
	if _boss_cast <= 0.0:
		_warn.visible = false
		_resolve_boss_signature(dir)

func _resolve_boss_signature(dir: Vector2) -> void:
	var count := def.signature_shot_count if def else 5
	var spread := def.signature_spread if def else 0.5
	match _boss_signature:
		"rush_cleave":
			velocity = _boss_dir * def.move_speed * 2.8
			for i in range(maxi(1, count)):
				var a: float = lerpf(-spread, spread, float(i) / float(maxi(1, count - 1))) if count > 1 else 0.0
				_fire_enemy_shot(_boss_dir.rotated(a), 260.0)
		"brand_ring":
			for i in range(maxi(1, count)):
				_fire_enemy_shot(Vector2.RIGHT.rotated(TAU * float(i) / float(count)), 160.0)
		"frost_needles":
			for i in range(maxi(1, count)):
				var a: float = lerpf(-spread, spread, float(i) / float(maxi(1, count - 1))) if count > 1 else 0.0
				_fire_enemy_shot(_boss_dir.rotated(a), 300.0)
		_:
			for i in range(5):
				var a: float = lerpf(-0.5, 0.5, float(i) / 4.0)
				_fire_enemy_shot(_boss_dir.rotated(a), 220.0)

func _behavior_dasher(delta: float, dir: Vector2, dist: float) -> void:
	_dash_cd = maxf(0.0, _dash_cd - delta)
	if _telegraph > 0.0:
		_telegraph -= delta
		velocity = Vector2.ZERO
		_warn.visible = true
		_warn.polygon = PackedVector2Array([Vector2(0, 0), dir * 80.0 + Vector2(-10, -10), dir * 80.0 + Vector2(10, 10)])
		if _telegraph <= 0.0:
			_warn.visible = false
			velocity = dir * def.move_speed * 3.2
			_dash_cd = 2.2 if not def.is_boss else 1.4
		return
	_warn.visible = false
	if _dash_cd <= 0.0 and dist < 220.0:
		_telegraph = 0.45
		velocity = Vector2.ZERO
	else:
		velocity = dir * def.move_speed

func _behavior_tank(delta: float, dir: Vector2) -> void:
	_tank_lock = maxf(0.0, _tank_lock - delta)
	if _tank_lock > 0.0:
		velocity = Vector2.ZERO
		_warn.visible = true
		_warn.polygon = PackedVector2Array([Vector2(-18, -18), Vector2(18, -18), Vector2(18, 18), Vector2(-18, 18)])
		return
	_warn.visible = false
	velocity = dir * def.move_speed
	if randf() < delta * 0.35:
		_tank_lock = 0.7

func _behavior_ranger(delta: float, dir: Vector2, dist: float) -> void:
	_range_cd = maxf(0.0, _range_cd - delta)
	if dist < 160.0:
		velocity = -dir * def.move_speed
	elif dist > 260.0:
		velocity = dir * def.move_speed * 0.8
	else:
		velocity = dir.orthogonal() * def.move_speed * 0.6
	if _telegraph > 0.0:
		_telegraph -= delta
		_warn.visible = true
		_warn.polygon = PackedVector2Array([Vector2(0, -6), dir * 70.0, Vector2(0, 6)])
		if _telegraph <= 0.0:
			_warn.visible = false
			_fire_enemy_shot(dir, 220.0)
			_range_cd = 1.8
		return
	_warn.visible = false
	if _range_cd <= 0.0:
		_telegraph = 0.35

func _fire_enemy_shot(dir: Vector2, spd: float = 220.0) -> void:
	var scene: PackedScene = preload("res://scenes/run/enemy_projectile.tscn")
	var p: Node2D = PoolManager.acquire("enemy_projectile", scene)
	var host: Node = get_tree().get_first_node_in_group("run_world")
	if host:
		PoolManager.transfer(p, host)
	p.call("launch", global_position, dir, def.damage * 0.85, spd)

func _boss_skills(delta: float, dir: Vector2) -> void:
	_boss_skill_cd = maxf(0.0, _boss_skill_cd - delta)
	if _boss_skill_cd > 0.0 or _boss_cast > 0.0:
		return
	_boss_skill_cd = def.signature_cooldown_sec if def else 3.2
	_boss_dir = dir
	_boss_cast = def.telegraph_sec if def else 0.55
