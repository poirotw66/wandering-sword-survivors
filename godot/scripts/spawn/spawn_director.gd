class_name SpawnDirector
extends Node

const MINION_CAP := 90

var _wave_timers: Dictionary = {}
var _boss_fired: Dictionary = {}
var _enemy_scene: PackedScene
var _elapsed_snapshot: float = 0.0

func _ready() -> void:
	_enemy_scene = preload("res://scenes/run/enemy.tscn")
	for w in ContentDB.waves:
		_wave_timers[w.id] = 0.0
	for b in ContentDB.bosses:
		_boss_fired[b.id] = false
	PoolManager.warm("enemy", _enemy_scene, 24)

func reset() -> void:
	for w in ContentDB.waves:
		_wave_timers[w.id] = 0.0
	for b in ContentDB.bosses:
		_boss_fired[b.id] = false

func tick(delta: float, elapsed: float, world: Node2D, player: Node2D) -> void:
	_elapsed_snapshot = elapsed
	if GameState.phase != GameState.Phase.RUN:
		return
	_tick_waves(delta, elapsed, world, player)
	_tick_bosses(elapsed, world, player)

func _alive_minions() -> int:
	var n := 0
	for e in get_tree().get_nodes_in_group("enemies"):
		if is_instance_valid(e) and e.visible and e.get("def") and not e.def.is_boss:
			n += 1
	return n

func _tick_waves(delta: float, elapsed: float, world: Node2D, player: Node2D) -> void:
	for w in ContentDB.waves:
		if elapsed < w.start_sec or elapsed > w.end_sec:
			continue
		_wave_timers[w.id] = float(_wave_timers.get(w.id, 0.0)) - delta
		if float(_wave_timers[w.id]) > 0.0:
			continue
		_wave_timers[w.id] = w.interval_sec
		if _alive_minions() >= MINION_CAP:
			continue
		for i in range(w.amount):
			_spawn_enemy(w.enemy_id, world, player, false)

func _tick_bosses(elapsed: float, world: Node2D, player: Node2D) -> void:
	for b in ContentDB.bosses:
		if _boss_fired[b.id]:
			continue
		if elapsed >= b.mark_sec:
			_boss_fired[b.id] = true
			_spawn_enemy(b.enemy_id, world, player, true)
			GameState.boss_spawned.emit(b.enemy_id)

func _spawn_enemy(enemy_id: String, world: Node2D, player: Node2D, is_boss: bool) -> void:
	if not ContentDB.enemies.has(enemy_id):
		return
	var def: EnemyDef = ContentDB.enemies[enemy_id]
	var node: Node2D = PoolManager.acquire("enemy", _enemy_scene)
	PoolManager.transfer(node, world)
	var pos := _spawn_point(player.global_position, 420.0 if not is_boss else 360.0)
	node.call("activate", def, pos)

func _spawn_point(center: Vector2, dist: float) -> Vector2:
	var ang := randf() * TAU
	return center + Vector2.RIGHT.rotated(ang) * dist
