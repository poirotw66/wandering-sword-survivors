extends Node

## Accelerated full-chapter validation (CI-safe).
## Covers all four start styles, 5/10/15-minute boss marks, mutation choices,
## and victory save-unlocks by jumping the run clock — no production cheats.

const STYLES: Array[String] = [
	"start_style.jian",
	"start_style.qi",
	"start_style.shen",
	"start_style.yi",
]

## Game-time milestones: 5 / 10 / 15 minutes.
const MILESTONES: Array[Dictionary] = [
	{"sec": 300.0, "boss": "boss.ravine_enforcer", "expect_mutation": true},
	{"sec": 600.0, "boss": "boss.sand_hierarch", "expect_mutation": true},
	{"sec": 900.0, "boss": "boss.frost_blade_fiend", "expect_mutation": false},
]

const WALL_TIMEOUT_SEC := 120.0
const BOSS_WAIT_SEC := 8.0
const MUTATION_WAIT_SEC := 6.0
const VICTORY_WAIT_SEC := 8.0

var _wall := 0.0
var _done := false
var _backup: Dictionary = {}
var _run: Node = null
var _spawned: Array[String] = []
var _last_mutation_count := 0
var _mutation_seen := false
var _style_id := ""
var _boss_order: Array[String] = []

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	Engine.time_scale = 6.0
	_backup = SaveService.data.duplicate(true)
	GameState.upgrade_choices_ready.connect(_auto_upgrade)
	GameState.mutation_choices_ready.connect(_auto_mutation)
	GameState.boss_spawned.connect(_on_boss_spawned)
	print("FULL_VALIDATION_STARTED")
	for style in STYLES:
		var err := await _validate_style(style)
		if err != "":
			_finish(false, err)
			return
	SaveService.replace_data_for_test(_backup)
	SaveService.save()
	_finish(true, "styles=%d milestones=300/600/900 mutations+victory ok" % STYLES.size())

func _process(delta: float) -> void:
	if _done:
		return
	_wall += delta / maxf(Engine.time_scale, 0.001)
	if _wall >= WALL_TIMEOUT_SEC:
		_finish(false, "wall timeout style=%s elapsed=%.1f" % [_style_id, GameState.elapsed_sec])
		return
	## Keep the harness player alive without changing production combat code.
	if GameState.phase == GameState.Phase.RUN or GameState.phase == GameState.Phase.UPGRADE or GameState.phase == GameState.Phase.MUTATION:
		GameState.player_stats["max_hp"] = 99999.0
		GameState.player_stats["hp"] = 99999.0

func _validate_style(style_id: String) -> String:
	_style_id = style_id
	_spawned.clear()
	_boss_order.clear()
	_mutation_seen = false
	get_tree().paused = false
	_prep_save_for_styles()
	if _run != null and is_instance_valid(_run):
		_run.queue_free()
		_run = null
		await get_tree().process_frame
	GameState.select_start_style(style_id)
	var packed: PackedScene = load("res://scenes/run/run.tscn")
	_run = packed.instantiate()
	add_child(_run)
	await get_tree().process_frame
	await get_tree().process_frame
	if GameState.selected_start_style_id != style_id:
		return "style not applied: want %s got %s" % [style_id, GameState.selected_start_style_id]
	var style: StartStyleDef = ContentDB.start_styles[style_id]
	if GameState.resonance.preferred_tag != style.preferred_tag:
		return "preferred tag mismatch for %s" % style_id
	print("FULL_VAL_STYLE_BEGIN ", style_id)
	for milestone in MILESTONES:
		var err := await _reach_milestone(milestone)
		if err != "":
			return err
	if not GameState.won:
		return "expected victory after final boss for %s" % style_id
	for need in ["weapon.nine_flash", "start_style.yi", "manual.clear_mind", "manual.echo_focus"]:
		if not SaveService.is_unlocked(need):
			return "victory unlock missing after %s: %s" % [style_id, need]
	if SaveService.chapter_clears("chapter.mist_ravine") < 1:
		return "chapter clear not recorded for %s" % style_id
	if _boss_order != ["boss.ravine_enforcer", "boss.sand_hierarch", "boss.frost_blade_fiend"]:
		return "boss order wrong for %s: %s" % [style_id, ",".join(_boss_order)]
	print("FULL_VAL_STYLE_OK ", style_id, " mut=", ",".join(GameState.active_mutation_ids))
	return ""

func _reach_milestone(m: Dictionary) -> String:
	var mark: float = float(m["sec"])
	var boss_id: String = str(m["boss"])
	var expect_mutation: bool = bool(m["expect_mutation"])
	## Drain pause from prior upgrade/mutation before advancing the clock.
	var drain := 0.0
	while GameState.phase != GameState.Phase.RUN and GameState.phase != GameState.Phase.RESULT:
		await get_tree().process_frame
		drain += 0.05
		if drain > MUTATION_WAIT_SEC:
			return "stuck leaving pause before mark %.0f style=%s phase=%s" % [mark, _style_id, str(GameState.phase)]
	if GameState.phase == GameState.Phase.RESULT:
		return "run already ended before mark %.0f style=%s" % [mark, _style_id]
	_mutation_seen = false
	_last_mutation_count = 0
	GameState.elapsed_sec = mark
	print("FULL_VAL_MARK ", mark, " style=", _style_id)
	var waited := 0.0
	while boss_id not in _spawned:
		await get_tree().process_frame
		waited += 0.05
		## Re-assert mark in case a frame raced before spawn director ticked.
		if GameState.elapsed_sec < mark:
			GameState.elapsed_sec = mark
		if waited > BOSS_WAIT_SEC:
			return "boss not spawned at %.0fs: %s style=%s" % [mark, boss_id, _style_id]
	_kill_named_boss(boss_id)
	await get_tree().process_frame
	await get_tree().process_frame
	if expect_mutation:
		waited = 0.0
		while not _mutation_seen:
			await get_tree().process_frame
			waited += 0.05
			if waited > MUTATION_WAIT_SEC:
				return "mutation panel missing after %s style=%s" % [boss_id, _style_id]
		if _last_mutation_count != 2:
			return "expected 2 mutations after %s, got %d" % [boss_id, _last_mutation_count]
		## Wait until mutation applied and run resumes.
		waited = 0.0
		while GameState.phase == GameState.Phase.MUTATION:
			await get_tree().process_frame
			waited += 0.05
			if waited > MUTATION_WAIT_SEC:
				return "mutation choice stuck after %s" % boss_id
	else:
		waited = 0.0
		while not GameState.won:
			await get_tree().process_frame
			waited += 0.05
			if waited > VICTORY_WAIT_SEC:
				return "final boss did not grant victory style=%s" % _style_id
		if GameState.phase == GameState.Phase.MUTATION or not GameState.pending_mutations.is_empty():
			return "final boss must not open mutation panel"
		if GameState.active_mutation_ids.size() < 2:
			return "expected mid-boss mutations retained into victory, got %d" % GameState.active_mutation_ids.size()
	return ""

func _prep_save_for_styles() -> void:
	var data: Dictionary = SaveService.default_save()
	var unlocks: Array = data["unlocked_content_ids"]
	for id in ["weapon.palm_wave", "weapon.guard_ring", "weapon.nine_flash", "start_style.qi", "start_style.shen", "start_style.yi"]:
		if id not in unlocks:
			unlocks.append(id)
	data["unlocked_content_ids"] = unlocks
	SaveService.replace_data_for_test(data)

func _on_boss_spawned(boss_id: String) -> void:
	if boss_id not in _spawned:
		_spawned.append(boss_id)
	_boss_order.append(boss_id)
	print("FULL_VAL_BOSS_SPAWNED ", boss_id, " at=", GameState.elapsed_sec)

func _kill_named_boss(boss_id: String) -> void:
	for e in get_tree().get_nodes_in_group("enemies"):
		if not is_instance_valid(e):
			continue
		var def: Variant = e.get("def")
		if def == null:
			continue
		if str(def.id) == boss_id and e.has_method("apply_damage"):
			e.call("apply_damage", 999999.0)
			print("FULL_VAL_BOSS_KILL ", boss_id)

func _auto_upgrade(options: Array) -> void:
	await get_tree().process_frame
	if _done or _run == null:
		return
	## Boss XP can level-up in the same frame as a mutation panel; never steal mutation.
	if GameState.phase != GameState.Phase.UPGRADE:
		return
	if _run.has_method("choose_upgrade") and options.size() > 0:
		_run.call("choose_upgrade", 0)

func _auto_mutation(options: Array) -> void:
	## Snapshot + choose immediately (options references pending_mutations).
	## Do not await first: a concurrent upgrade handler can leave the panel stuck.
	var count := options.size()
	_last_mutation_count = count
	_mutation_seen = true
	if _done or _run == null or count <= 0:
		return
	if _run.has_method("choose_mutation"):
		_run.call("choose_mutation", 0)
		print("FULL_VAL_MUTATION_PICK count=", count, " active=", ",".join(GameState.active_mutation_ids))

func _finish(ok: bool, detail: String) -> void:
	if _done:
		return
	_done = true
	get_tree().paused = false
	Engine.time_scale = 1.0
	SaveService.replace_data_for_test(_backup)
	SaveService.save()
	if ok:
		print("FULL_VALIDATION_PASSED: ", detail)
		get_tree().quit(0)
	else:
		print("FULL_VALIDATION_FAILED: ", detail)
		get_tree().quit(1)
