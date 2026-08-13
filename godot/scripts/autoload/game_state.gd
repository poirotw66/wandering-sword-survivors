extends Node

signal run_started
signal run_ended(won: bool)
signal leveled_up(level: int)
signal hud_dirty
signal upgrade_choices_ready(options: Array)
signal mutation_choices_ready(options: Array)
signal boss_spawned(boss_id: String)

enum Phase { HUB, RUN, UPGRADE, MUTATION, RESULT }

var phase: Phase = Phase.HUB
var elapsed_sec: float = 0.0
var kills: int = 0
var score: int = 0
var xp: int = 0
var level: int = 1
var xp_to_next: int = 18
var won: bool = false
var dead: bool = false
var chapter_id: String = "chapter.mist_ravine"
var resonance: Resonance = Resonance.new()
var owned_weapon_ids: Array[String] = ["weapon.sword_qi"]
var owned_manual_ids: Array[String] = []
var pending_upgrades: Array = []
var pending_mutations: Array = []
var player_stats: Dictionary = {}
var selected_start_style_id: String = "start_style.jian"
## Run-only mutation behavior flags keyed by weapon id.
var weapon_mutation_flags: Dictionary = {}
var active_mutation_ids: Array[String] = []
var contact_resist: float = 0.0
var dash_iframe_bonus: float = 0.0
var heal_pickup_bonus: float = 0.0

func select_start_style(style_id: String) -> void:
	if ContentDB.start_styles.has(style_id):
		selected_start_style_id = style_id

func reset_run() -> void:
	elapsed_sec = 0.0
	kills = 0
	score = 0
	xp = 0
	level = 1
	xp_to_next = MathUtil.exp_to_next(1)
	won = false
	dead = false
	resonance = Resonance.new()
	owned_weapon_ids = ["weapon.sword_qi"]
	owned_manual_ids = []
	pending_upgrades.clear()
	pending_mutations.clear()
	weapon_mutation_flags.clear()
	active_mutation_ids.clear()
	contact_resist = 0.0
	dash_iframe_bonus = 0.0
	heal_pickup_bonus = 0.0
	player_stats = {
		"max_hp": 100.0,
		"hp": 100.0,
		"move_speed": 190.0,
		"damage_mult": 1.0,
		"cooldown_mult": 1.0,
		"pickup_range": 70.0,
		"dash_charges_max": 2,
	}
	_apply_start_style()
	phase = Phase.RUN
	run_started.emit()
	hud_dirty.emit()

func _apply_start_style() -> void:
	var style_id := selected_start_style_id
	if not ContentDB.start_styles.has(style_id):
		style_id = "start_style.jian"
	var style: StartStyleDef = ContentDB.start_styles[style_id]
	selected_start_style_id = style.id
	resonance.set_preferred_tag(style.preferred_tag)
	owned_weapon_ids.clear()
	for wid in style.starter_weapon_ids:
		if SaveService.is_unlocked(str(wid)) or str(wid) == "weapon.sword_qi":
			if str(wid) not in owned_weapon_ids:
				owned_weapon_ids.append(str(wid))
	if owned_weapon_ids.is_empty():
		owned_weapon_ids.append("weapon.sword_qi")
	for tag in style.starter_tag_stacks.keys():
		resonance.add_tag(str(tag), int(style.starter_tag_stacks[tag]))
	for stat in style.starter_stat_bonuses.keys():
		var amount: float = float(style.starter_stat_bonuses[stat])
		match str(stat):
			"max_hp":
				player_stats["max_hp"] = float(player_stats["max_hp"]) + amount
				player_stats["hp"] = float(player_stats["hp"]) + amount
			"move_speed":
				player_stats["move_speed"] = float(player_stats["move_speed"]) + amount
			"cooldown_mult":
				player_stats["cooldown_mult"] = maxf(0.5, float(player_stats["cooldown_mult"]) + amount)
			"damage_mult":
				player_stats["damage_mult"] = float(player_stats["damage_mult"]) + amount
	apply_resonance_to_stats()

func add_xp(amount: int) -> void:
	if phase != Phase.RUN:
		return
	xp += amount
	while xp >= xp_to_next:
		xp -= xp_to_next
		level += 1
		xp_to_next = MathUtil.exp_to_next(level)
		leveled_up.emit(level)
	hud_dirty.emit()

func register_kill(score_gain: int, exp_gain: int) -> void:
	kills += 1
	score += score_gain
	add_xp(exp_gain)

func apply_resonance_to_stats() -> void:
	var base_damage := 1.0
	var base_cd := 1.0
	var base_speed := 190.0
	var base_hp := 100.0
	## Re-apply start-style flat bonuses under resonance-derived bases.
	if ContentDB.start_styles.has(selected_start_style_id):
		var style: StartStyleDef = ContentDB.start_styles[selected_start_style_id]
		base_hp += float(style.starter_stat_bonuses.get("max_hp", 0.0))
		base_speed += float(style.starter_stat_bonuses.get("move_speed", 0.0))
		base_cd += float(style.starter_stat_bonuses.get("cooldown_mult", 0.0))
		base_damage += float(style.starter_stat_bonuses.get("damage_mult", 0.0))
	contact_resist = 0.0
	player_stats["pickup_range"] = 70.0
	for mid in owned_manual_ids:
		if not ContentDB.manuals.has(mid):
			continue
		var man: ManualDef = ContentDB.manuals[mid]
		if man.hook_kind == "stat":
			match man.hook_id:
				"damage_mult":
					base_damage += man.amount
				"max_hp":
					base_hp += man.amount
				"move_speed":
					base_speed += man.amount
				"cooldown_mult":
					base_cd += man.amount
		elif man.hook_kind == "passive":
			match man.hook_id:
				"pickup_range":
					player_stats["pickup_range"] = float(player_stats["pickup_range"]) + man.amount
				"contact_resist":
					contact_resist += man.amount
	player_stats["damage_mult"] = base_damage * resonance.damage_multiplier()
	player_stats["cooldown_mult"] = maxf(0.5, base_cd * resonance.cooldown_multiplier())
	player_stats["move_speed"] = base_speed + resonance.move_speed_bonus()
	var hp_bonus := resonance.max_hp_bonus()
	var prev_max: float = float(player_stats.get("max_hp", 100.0))
	player_stats["max_hp"] = base_hp + hp_bonus
	if float(player_stats["max_hp"]) > prev_max:
		player_stats["hp"] = float(player_stats["hp"]) + (float(player_stats["max_hp"]) - prev_max)
	hud_dirty.emit()

func mutation_flag(weapon_id: String, key: String, default_value: Variant = null) -> Variant:
	var flags: Dictionary = weapon_mutation_flags.get(weapon_id, {})
	if flags.has(key):
		return flags[key]
	return default_value

func end_run(victory: bool) -> void:
	won = victory
	dead = not victory
	phase = Phase.RESULT
	if victory:
		SaveService.record_chapter_clear(chapter_id)
		## Final chapter clear unlocks Nine Flash route content without a post-final mutation.
		SaveService.unlock_content("weapon.nine_flash")
		SaveService.unlock_content("start_style.yi")
		SaveService.unlock_content("manual.clear_mind")
		SaveService.unlock_content("manual.echo_focus")
	run_ended.emit(victory)
