extends Node

## Headless gameplay smoke: start style + spawn/hit/pool + mutation choice.

const TARGET_GAME_SEC := 12.0
const WALL_TIMEOUT_SEC := 45.0

var _wall := 0.0
var _done := false
var _mutation_exercised := false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	Engine.time_scale = 3.0
	GameState.select_start_style("start_style.jian")
	GameState.upgrade_choices_ready.connect(_auto_upgrade)
	GameState.mutation_choices_ready.connect(_auto_mutation)
	GameState.run_ended.connect(_on_run_ended)
	var packed: PackedScene = load("res://scenes/run/run.tscn")
	var run: Node = packed.instantiate()
	add_child(run)
	print("SMOKE_RUN_STARTED style=", GameState.selected_start_style_id)
	## Exercise mutation path without waiting for live boss clock.
	await get_tree().create_timer(0.4).timeout
	_force_mutation_choice()

func _force_mutation_choice() -> void:
	if _done or _mutation_exercised:
		return
	var run := get_tree().get_first_node_in_group("run_root")
	if run and run.has_method("on_boss_defeated") and GameState.phase == GameState.Phase.RUN:
		run.call("on_boss_defeated", "boss.ravine_enforcer")
		print("SMOKE_FORCE_MUTATION_PANEL")

func _process(delta: float) -> void:
	if _done:
		return
	_wall += delta / maxf(Engine.time_scale, 0.001)
	if _wall >= WALL_TIMEOUT_SEC:
		_finish(false, "wall timeout")
		return
	if GameState.phase == GameState.Phase.RUN and GameState.elapsed_sec >= TARGET_GAME_SEC:
		if not _mutation_exercised:
			_finish(false, "mutation was not exercised")
			return
		_finish(true, "elapsed=%.1f kills=%d style=%s mut=%s" % [
			GameState.elapsed_sec, GameState.kills, GameState.selected_start_style_id,
			",".join(GameState.active_mutation_ids)
		])

func _auto_upgrade(options: Array) -> void:
	await get_tree().process_frame
	var run := get_tree().get_first_node_in_group("run_root")
	if run and run.has_method("choose_upgrade") and options.size() > 0:
		run.call("choose_upgrade", 0)
		print("SMOKE_AUTO_UPGRADE")

func _auto_mutation(options: Array) -> void:
	await get_tree().process_frame
	var run := get_tree().get_first_node_in_group("run_root")
	var choice_count := options.size()
	if run and run.has_method("choose_mutation") and choice_count > 0:
		run.call("choose_mutation", 0)
		_mutation_exercised = true
		print("SMOKE_AUTO_MUTATION_CHOICE count=", choice_count)

func _on_run_ended(won: bool) -> void:
	_finish(true, "run ended won=%s kills=%d elapsed=%.1f" % [str(won), GameState.kills, GameState.elapsed_sec])

func _finish(ok: bool, detail: String) -> void:
	if _done:
		return
	_done = true
	Engine.time_scale = 1.0
	if ok:
		print("SMOKE_PASSED: ", detail)
		get_tree().quit(0)
	else:
		print("SMOKE_FAILED: ", detail)
		get_tree().quit(1)
