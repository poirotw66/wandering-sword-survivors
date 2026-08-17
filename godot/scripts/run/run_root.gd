extends Node2D

@onready var world: Node2D = $World
@onready var player: CharacterBody2D = $World/Player
@onready var camera: Camera2D = $World/Player/Camera2D
@onready var hud: CanvasLayer = $HUD
@onready var spawn_director: Node = $SpawnDirector

func _ready() -> void:
	add_to_group("run_root")
	world.add_to_group("run_world")
	_setup_arena()
	_apply_camera_fit()
	get_viewport().size_changed.connect(_apply_camera_fit)
	GameState.reset_run()
	spawn_director.reset()
	player.global_position = Vector2(640, 360)
	player.died.connect(_on_player_died)
	GameState.leveled_up.connect(_on_level_up)
	GameState.run_ended.connect(_on_run_ended)
	hud.call("bind_run", self)
	PoolManager.warm("projectile", preload("res://scenes/run/projectile.tscn"), 40)
	PoolManager.warm("pickup", preload("res://scenes/run/pickup.tscn"), 30)
	PoolManager.warm("enemy_projectile", preload("res://scenes/run/enemy_projectile.tscn"), 20)

func _setup_arena() -> void:
	var old := world.get_node_or_null("Ground")
	if old:
		old.visible = false
		old.queue_free()
	var arena := ArenaMap.new()
	arena.name = "ArenaMap"
	world.add_child(arena)
	world.move_child(arena, 0)
	arena.setup(camera)

func _apply_camera_fit() -> void:
	var z := DisplayFit.combat_camera_zoom(get_viewport())
	camera.zoom = Vector2(z, z)

func _process(delta: float) -> void:
	if GameState.phase == GameState.Phase.RUN:
		GameState.elapsed_sec += delta
		spawn_director.tick(delta, GameState.elapsed_sec, world, player)
		GameState.hud_dirty.emit()
	if Input.is_action_just_pressed("pause_game") and GameState.phase == GameState.Phase.RUN:
		get_tree().paused = not get_tree().paused

func _on_level_up(_level: int) -> void:
	GameState.phase = GameState.Phase.UPGRADE
	GameState.pending_upgrades = UpgradeService.roll_options(3)
	GameState.upgrade_choices_ready.emit(GameState.pending_upgrades)
	get_tree().paused = true

func choose_upgrade(index: int) -> void:
	if index < 0 or index >= GameState.pending_upgrades.size():
		return
	var u: UpgradeDef = GameState.pending_upgrades[index]
	UpgradeService.apply(u)
	GameState.pending_upgrades.clear()
	GameState.phase = GameState.Phase.RUN
	get_tree().paused = false
	GameState.hud_dirty.emit()

func on_boss_defeated(boss_id: String) -> void:
	## Final boss ends the chapter directly — no post-final mutation panel.
	if ContentDB.enemies.has(boss_id):
		var edef: EnemyDef = ContentDB.enemies[boss_id]
		if edef.ends_run_on_defeat:
			return
	var options: Array = ContentDB.eligible_mutations_for_boss(boss_id, GameState.chapter_id)
	if options.is_empty():
		return
	GameState.phase = GameState.Phase.MUTATION
	GameState.pending_mutations = options
	GameState.mutation_choices_ready.emit(GameState.pending_mutations)
	get_tree().paused = true

func choose_mutation(index: int) -> void:
	if index < 0 or index >= GameState.pending_mutations.size():
		get_tree().paused = false
		GameState.phase = GameState.Phase.RUN
		return
	var m: MutationDef = GameState.pending_mutations[index]
	UpgradeService.apply_mutation(m)
	GameState.pending_mutations.clear()
	if GameState.phase != GameState.Phase.RESULT:
		GameState.phase = GameState.Phase.RUN
		get_tree().paused = false

func _on_player_died() -> void:
	get_tree().paused = false

func _on_run_ended(_won: bool) -> void:
	get_tree().paused = false
	hud.call("show_result")
