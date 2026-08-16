extends CharacterBody2D

signal died

const DASH_SPEED := 520.0
const DASH_DURATION := 0.18
const DASH_IFRAME := 0.28
const DASH_RECHARGE := 2.4
const RAGE_COST_NEED := 100.0

var dash_charges: int = 2
var _dash_cd: Array[float] = [0.0, 0.0]
var _dash_time: float = 0.0
var _iframe: float = 0.0
var _facing: Vector2 = Vector2.RIGHT
var _touch_dir: Vector2 = Vector2.ZERO
var rage_meter: float = 0.0
var _weapon_cds: Dictionary = {}
var _body: Polygon2D
var _sprite: Sprite2D
var _hurtbox: Area2D

func _ready() -> void:
	add_to_group("player")
	collision_layer = 1
	collision_mask = 0
	_body = Polygon2D.new()
	_body.polygon = PackedVector2Array([Vector2(0, -16), Vector2(12, 12), Vector2(-12, 12)])
	_body.color = Color(0.92, 0.86, 0.7)
	add_child(_body)
	_sprite = Sprite2D.new()
	_sprite.name = "BodySprite"
	_sprite.z_index = 1
	add_child(_sprite)
	ArtCatalog.apply(_sprite, _body, "player_yunhe", 36.0)
	var cs := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = 12
	cs.shape = circle
	add_child(cs)
	_hurtbox = Area2D.new()
	_hurtbox.collision_layer = 0
	_hurtbox.collision_mask = 2 | 16
	_hurtbox.monitoring = true
	var hcs := CollisionShape2D.new()
	var hshape := CircleShape2D.new()
	hshape.radius = 12
	hcs.shape = hshape
	_hurtbox.add_child(hcs)
	add_child(_hurtbox)
	_hurtbox.area_entered.connect(_on_hurt_area)
	_hurtbox.body_entered.connect(_on_hurt_body)

func set_touch_dir(dir: Vector2) -> void:
	_touch_dir = dir

func _physics_process(delta: float) -> void:
	if GameState.phase != GameState.Phase.RUN:
		velocity = Vector2.ZERO
		return
	_tick_dash(delta)
	var input_dir := Vector2(
		Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
		Input.get_action_strength("move_down") - Input.get_action_strength("move_up")
	)
	if _touch_dir.length() > 0.15:
		input_dir = _touch_dir
	if input_dir.length() > 1.0:
		input_dir = input_dir.normalized()
	if input_dir.length() > 0.1:
		_facing = input_dir.normalized()
	if _dash_time > 0.0:
		velocity = _facing * DASH_SPEED
	else:
		var speed: float = float(GameState.player_stats.get("move_speed", 190.0))
		velocity = input_dir * speed
	move_and_slide()
	if Input.is_action_just_pressed("dash"):
		try_dash()
	if Input.is_action_just_pressed("rage"):
		try_rage()
	_fire_weapons(delta)
	_iframe = maxf(0.0, _iframe - delta)
	var flash := Color(1.4, 1.4, 1.6) if _iframe > 0.0 else Color.WHITE
	_body.modulate = flash
	if _sprite:
		_sprite.modulate = flash
		_sprite.flip_h = _facing.x < 0.0

func _tick_dash(delta: float) -> void:
	_dash_time = maxf(0.0, _dash_time - delta)
	var max_charges: int = int(GameState.player_stats.get("dash_charges_max", 2))
	for i in range(_dash_cd.size()):
		if _dash_cd[i] > 0.0:
			_dash_cd[i] = maxf(0.0, _dash_cd[i] - delta)
			if _dash_cd[i] <= 0.0 and dash_charges < max_charges:
				dash_charges += 1

func try_dash() -> void:
	if dash_charges <= 0 or _dash_time > 0.0:
		return
	dash_charges -= 1
	_dash_time = DASH_DURATION
	_iframe = DASH_IFRAME + GameState.dash_iframe_bonus
	for i in range(_dash_cd.size()):
		if _dash_cd[i] <= 0.0:
			_dash_cd[i] = DASH_RECHARGE
			break
	GameState.hud_dirty.emit()

func try_rage() -> void:
	if rage_meter < RAGE_COST_NEED:
		return
	rage_meter = 0.0
	var profile := GameState.resonance.rage_profile()
	var dmg: float = 40.0 * float(GameState.player_stats.get("damage_mult", 1.0))
	match profile:
		"pulse":
			_spawn_nova(dmg * 1.2, 120.0, 8, 0.0, 0.0)
		"gale":
			_iframe = 0.45
			_dash_time = 0.35
			_spawn_bolts(dmg * 0.7, 8)
		"echo":
			_spawn_strikes(dmg * 1.4, 3)
		_:
			_spawn_bolts(dmg, 12)
	GameState.hud_dirty.emit()

func add_rage(amount: float) -> void:
	rage_meter = minf(RAGE_COST_NEED, rage_meter + amount)
	GameState.hud_dirty.emit()

func _fire_weapons(delta: float) -> void:
	var cd_mult: float = float(GameState.player_stats.get("cooldown_mult", 1.0))
	var dmg_mult: float = float(GameState.player_stats.get("damage_mult", 1.0))
	for wid in GameState.owned_weapon_ids:
		if not ContentDB.weapons.has(wid):
			continue
		var def: WeaponDef = ContentDB.weapons[wid]
		var left: float = float(_weapon_cds.get(wid, 0.0)) - delta
		if left > 0.0:
			_weapon_cds[wid] = left
			continue
		_weapon_cds[wid] = def.cooldown_sec * cd_mult
		var dmg := def.base_damage * dmg_mult
		match def.pattern:
			"orbit":
				_spawn_orbit(dmg, def, wid)
			"nova":
				var count := int(GameState.mutation_flag(wid, "nova_count", def.projectile_count))
				var radius := float(GameState.mutation_flag(wid, "nova_radius", 90.0))
				var pull := float(GameState.mutation_flag(wid, "pull_strength", 0.0))
				var heal := float(GameState.mutation_flag(wid, "heal_on_hit", 0.0))
				_spawn_nova(dmg, radius, count, pull, heal)
			"strike":
				_spawn_strikes(dmg, 1)
			_:
				_spawn_bolts(dmg, def.projectile_count, def)

func _spawn_bolts(damage: float, count: int, def: WeaponDef = null) -> void:
	var scene: PackedScene = preload("res://scenes/run/projectile.tscn")
	var nearest := _nearest_enemy()
	var base_dir := _facing
	if nearest:
		base_dir = (nearest.global_position - global_position).normalized()
	for i in range(count):
		var ang := 0.0
		if count > 1:
			ang = lerp(-0.35, 0.35, float(i) / float(count - 1))
		var dir := base_dir.rotated(ang)
		var p: Node2D = PoolManager.acquire("projectile", scene)
		var host := get_tree().get_first_node_in_group("run_world")
		if host:
			PoolManager.transfer(p, host)
		elif get_parent():
			PoolManager.transfer(p, get_parent())
		var speed := 420.0
		var pierce := 1
		var radius := 8.0
		if def:
			speed = def.projectile_speed if def.projectile_speed > 0.0 else 420.0
			pierce = def.pierce
			radius = def.radius
		p.call("launch", global_position, dir, damage, speed, pierce, radius, false)

func _spawn_nova(damage: float, radius: float, count: int = 8, pull: float = 0.0, heal_on_hit: float = 0.0) -> void:
	var scene: PackedScene = preload("res://scenes/run/projectile.tscn")
	var n := maxi(1, count)
	for i in range(n):
		var dir := Vector2.RIGHT.rotated(TAU * float(i) / float(n))
		var p: Node2D = PoolManager.acquire("projectile", scene)
		var host := get_tree().get_first_node_in_group("run_world")
		if host:
			PoolManager.transfer(p, host)
		p.call("launch", global_position, dir, damage, 280.0, 2, radius * 0.15, false)
		if pull > 0.0 or heal_on_hit > 0.0:
			p.call("configure_effects", pull, heal_on_hit, self)

func _spawn_orbit(damage: float, def: WeaponDef, weapon_id: String) -> void:
	var scene: PackedScene = preload("res://scenes/run/projectile.tscn")
	var count := int(GameState.mutation_flag(weapon_id, "orbit_count", 1))
	var radius := float(GameState.mutation_flag(weapon_id, "orbit_radius", def.radius))
	var return_damage := bool(GameState.mutation_flag(weapon_id, "return_damage", false))
	var return_mult := float(GameState.mutation_flag(weapon_id, "return_damage_mult", 0.0))
	for i in range(maxi(1, count)):
		var p: Node2D = PoolManager.acquire("projectile", scene)
		var host := get_tree().get_first_node_in_group("run_world")
		if host:
			PoolManager.transfer(p, host)
		var ang0 := TAU * float(i) / float(maxi(1, count))
		p.call("launch_orbit", self, damage, radius, 2.4, ang0)
		if return_damage:
			p.call("configure_return_damage", return_mult)

func _spawn_strikes(damage: float, count: int) -> void:
	var nearest := _nearest_enemy()
	var origin := global_position + _facing * 48.0
	if nearest:
		origin = nearest.global_position
	for i in range(count):
		var scene: PackedScene = preload("res://scenes/run/projectile.tscn")
		var p: Node2D = PoolManager.acquire("projectile", scene)
		var host := get_tree().get_first_node_in_group("run_world")
		if host:
			PoolManager.transfer(p, host)
		var pos := origin + Vector2(randf_range(-24, 24), randf_range(-24, 24))
		p.call("launch", pos, Vector2.ZERO, damage, 0.0, 1, 36.0, true)

func _nearest_enemy() -> Node2D:
	var best: Node2D = null
	var best_d := INF
	for n in get_tree().get_nodes_in_group("enemies"):
		if not is_instance_valid(n) or not n.visible:
			continue
		var d := global_position.distance_squared_to(n.global_position)
		if d < best_d:
			best_d = d
			best = n
	return best

func take_damage(amount: float) -> void:
	if _iframe > 0.0 or GameState.phase != GameState.Phase.RUN:
		return
	var mitigated := amount * maxf(0.0, 1.0 - GameState.contact_resist)
	GameState.player_stats["hp"] = float(GameState.player_stats["hp"]) - mitigated
	_iframe = 0.55
	GameState.hud_dirty.emit()
	if float(GameState.player_stats["hp"]) <= 0.0:
		died.emit()
		GameState.end_run(false)

func _on_hurt_area(area: Area2D) -> void:
	if area.has_meta("enemy_damage"):
		take_damage(float(area.get_meta("enemy_damage")))

func _on_hurt_body(body: Node2D) -> void:
	if body.is_in_group("enemies") and body.has_method("get_contact_damage"):
		take_damage(float(body.call("get_contact_damage")))

func heal(amount: float) -> void:
	var mx: float = float(GameState.player_stats["max_hp"])
	var bonus := GameState.heal_pickup_bonus
	GameState.player_stats["hp"] = minf(mx, float(GameState.player_stats["hp"]) + amount + bonus)
	GameState.hud_dirty.emit()
