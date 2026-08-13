extends Node

## Loads data-driven defs. Stable string IDs are authoritative.

var weapons: Dictionary = {} ## id -> WeaponDef
var enemies: Dictionary = {}
var upgrades: Dictionary = {}
var manuals: Dictionary = {}
var start_styles: Dictionary = {}
var waves: Array[WaveDef] = []
var bosses: Array[BossScheduleEntry] = []
var mutations: Dictionary = {}
var chapters: Dictionary = {}

func _ready() -> void:
	_build_builtin_content()

func _build_builtin_content() -> void:
	## ponytail: content is code-authored Resources for the first public build;
	## .tres mirrors can be exported later without changing IDs.
	## Exactly four automatic martial arts for chapter one.
	_add_weapon(_w("weapon.sword_qi", "weapon.sword_qi.name", Tags.JIAN, 24, 0.65, 460, 1, 1, 8, "bolt", true))
	_add_weapon(_w("weapon.guard_ring", "weapon.guard_ring.name", Tags.JIAN, 12, 0.15, 0, 1, 99, 40, "orbit", false))
	_add_weapon(_w("weapon.palm_wave", "weapon.palm_wave.name", Tags.QI, 22, 2.4, 240, 6, 2, 18, "nova", false))
	_add_weapon(_w("weapon.nine_flash", "weapon.nine_flash.name", Tags.YI, 55, 2.1, 0, 1, 1, 36, "strike", false))

	_add_enemy(_e("enemy.green_cliff", "enemy.green_cliff.name", 48, 10, 74, 2, 10, 14, "chaser", Color(0.38, 0.78, 0.52)))
	_add_enemy(_e("enemy.crimson_sand", "enemy.crimson_sand.name", 38, 8, 118, 2, 15, 11, "dasher", Color(0.82, 0.35, 0.4)))
	_add_enemy(_e("enemy.frost_peak", "enemy.frost_peak.name", 260, 18, 48, 6, 35, 16, "tank", Color(0.7, 0.72, 0.85)))
	_add_enemy(_e("enemy.ink_river", "enemy.ink_river.name", 55, 12, 70, 3, 18, 12, "ranger", Color(0.45, 0.55, 0.9)))
	_add_enemy(_e("enemy.mist_bandit", "enemy.mist_bandit.name", 64, 12, 90, 3, 16, 13, "chaser", Color(0.55, 0.6, 0.45)))
	_add_enemy(_e("enemy.reed_knife", "enemy.reed_knife.name", 42, 9, 125, 2, 14, 10, "dasher", Color(0.75, 0.55, 0.2)))

	_add_enemy(_boss_e("boss.ravine_enforcer", "boss.ravine_enforcer.name", 2200, 22, 78, 40, 400, 28, "dasher", Color(0.9, 0.55, 0.2), "rush_cleave", 0.45, 2.8, 3, 0.25, false))
	_add_enemy(_boss_e("boss.sand_hierarch", "boss.sand_hierarch.name", 4800, 28, 70, 70, 900, 34, "tank", Color(0.75, 0.25, 0.3), "brand_ring", 0.7, 3.6, 8, 0.0, false))
	_add_enemy(_boss_e("boss.frost_blade_fiend", "boss.frost_blade_fiend.name", 9000, 34, 82, 120, 2000, 40, "dasher", Color(0.7, 0.85, 1.0), "frost_needles", 0.6, 3.0, 12, 0.85, true))

	## Eight original manuals — two per tag, each with one data-driven hook.
	_add_manual(_man("manual.cloud_edge", "manual.cloud_edge.name", "manual.cloud_edge.desc", Tags.JIAN, "stat", "damage_mult", 0.08))
	_add_manual(_man("manual.iron_guard", "manual.iron_guard.name", "manual.iron_guard.desc", Tags.JIAN, "passive", "contact_resist", 0.15))
	_add_manual(_man("manual.river_breath", "manual.river_breath.name", "manual.river_breath.desc", Tags.QI, "stat", "max_hp", 16))
	_add_manual(_man("manual.warm_pulse", "manual.warm_pulse.name", "manual.warm_pulse.desc", Tags.QI, "trigger", "on_pickup_heal_bonus", 8))
	_add_manual(_man("manual.crane_stride", "manual.crane_stride.name", "manual.crane_stride.desc", Tags.SHEN, "stat", "move_speed", 14))
	_add_manual(_man("manual.mist_veil", "manual.mist_veil.name", "manual.mist_veil.desc", Tags.SHEN, "trigger", "on_dash_iframe", 0.12))
	_add_manual(_man("manual.clear_mind", "manual.clear_mind.name", "manual.clear_mind.desc", Tags.YI, "stat", "cooldown_mult", -0.06))
	_add_manual(_man("manual.echo_focus", "manual.echo_focus.name", "manual.echo_focus.desc", Tags.YI, "passive", "pickup_range", 24))

	_add_upgrade(_u("upgrade.edge_focus", "upgrade.edge_focus.name", "upgrade.edge_focus.desc", Tags.JIAN, "stat", "", "", "damage_mult", 0.12))
	_add_upgrade(_u("upgrade.breath_widen", "upgrade.breath_widen.name", "upgrade.breath_widen.desc", Tags.QI, "stat", "", "", "max_hp", 20))
	_add_upgrade(_u("upgrade.cloud_step", "upgrade.cloud_step.name", "upgrade.cloud_step.desc", Tags.SHEN, "stat", "", "", "move_speed", 18))
	_add_upgrade(_u("upgrade.intent_haste", "upgrade.intent_haste.name", "upgrade.intent_haste.desc", Tags.YI, "stat", "", "", "cooldown_mult", -0.08))
	_add_upgrade(_u("upgrade.unlock_guard", "upgrade.unlock_guard.name", "upgrade.unlock_guard.desc", Tags.JIAN, "weapon", "weapon.guard_ring", "", "", 0))
	_add_upgrade(_u("upgrade.unlock_palm", "upgrade.unlock_palm.name", "upgrade.unlock_palm.desc", Tags.QI, "weapon", "weapon.palm_wave", "", "", 0))
	_add_upgrade(_u("upgrade.unlock_flash", "upgrade.unlock_flash.name", "upgrade.unlock_flash.desc", Tags.YI, "weapon", "weapon.nine_flash", "", "", 0))
	_add_upgrade(_u("upgrade.resonance_mark", "upgrade.resonance_mark.name", "upgrade.resonance_mark.desc", Tags.JIAN, "resonance", "", "", "", 1))
	_add_upgrade(_u("upgrade.qi_mark", "upgrade.qi_mark.name", "upgrade.qi_mark.desc", Tags.QI, "resonance", "", "", "", 1))
	_add_upgrade(_u("upgrade.shen_mark", "upgrade.shen_mark.name", "upgrade.shen_mark.desc", Tags.SHEN, "resonance", "", "", "", 1))
	_add_upgrade(_u("upgrade.yi_mark", "upgrade.yi_mark.name", "upgrade.yi_mark.desc", Tags.YI, "resonance", "", "", "", 1))
	_add_upgrade(_u("upgrade.manual_cloud_edge", "manual.cloud_edge.name", "manual.cloud_edge.desc", Tags.JIAN, "manual", "", "manual.cloud_edge", "", 0))
	_add_upgrade(_u("upgrade.manual_iron_guard", "manual.iron_guard.name", "manual.iron_guard.desc", Tags.JIAN, "manual", "", "manual.iron_guard", "", 0))
	_add_upgrade(_u("upgrade.manual_river_breath", "manual.river_breath.name", "manual.river_breath.desc", Tags.QI, "manual", "", "manual.river_breath", "", 0))
	_add_upgrade(_u("upgrade.manual_warm_pulse", "manual.warm_pulse.name", "manual.warm_pulse.desc", Tags.QI, "manual", "", "manual.warm_pulse", "", 0))
	_add_upgrade(_u("upgrade.manual_crane_stride", "manual.crane_stride.name", "manual.crane_stride.desc", Tags.SHEN, "manual", "", "manual.crane_stride", "", 0))
	_add_upgrade(_u("upgrade.manual_mist_veil", "manual.mist_veil.name", "manual.mist_veil.desc", Tags.SHEN, "manual", "", "manual.mist_veil", "", 0))
	_add_upgrade(_u("upgrade.manual_clear_mind", "manual.clear_mind.name", "manual.clear_mind.desc", Tags.YI, "manual", "", "manual.clear_mind", "", 0))
	_add_upgrade(_u("upgrade.manual_echo_focus", "manual.echo_focus.name", "manual.echo_focus.desc", Tags.YI, "manual", "", "manual.echo_focus", "", 0))

	_add_style(_style("start_style.jian", "start_style.jian.name", "start_style.jian.desc", Tags.JIAN, ["weapon.sword_qi"], {Tags.JIAN: 1}, {}, ""))
	_add_style(_style("start_style.qi", "start_style.qi.name", "start_style.qi.desc", Tags.QI, ["weapon.sword_qi"], {Tags.QI: 1}, {"max_hp": 12.0}, "weapon.palm_wave"))
	_add_style(_style("start_style.shen", "start_style.shen.name", "start_style.shen.desc", Tags.SHEN, ["weapon.sword_qi"], {Tags.SHEN: 1}, {"move_speed": 16.0}, "weapon.guard_ring"))
	_add_style(_style("start_style.yi", "start_style.yi.name", "start_style.yi.desc", Tags.YI, ["weapon.sword_qi"], {Tags.YI: 1}, {"cooldown_mult": -0.05}, "weapon.nine_flash"))

	waves = [
		_wave("wave.cliff_early", 0, 210, "enemy.green_cliff", 1.0, 2),
		_wave("wave.bandit_early", 20, 300, "enemy.mist_bandit", 1.2, 2),
		_wave("wave.sand_mid", 60, 420, "enemy.crimson_sand", 1.3, 2),
		_wave("wave.reed_mid", 120, 540, "enemy.reed_knife", 1.15, 2),
		_wave("wave.ink_mid", 150, 720, "enemy.ink_river", 1.5, 1),
		_wave("wave.frost_late", 240, 900, "enemy.frost_peak", 2.1, 1),
		_wave("wave.cliff_late", 360, 900, "enemy.green_cliff", 0.75, 3),
		_wave("wave.sand_late", 480, 900, "enemy.crimson_sand", 0.9, 3),
		_wave("wave.ink_late", 600, 900, "enemy.ink_river", 1.1, 2),
		_wave("wave.bandit_late", 660, 900, "enemy.mist_bandit", 0.85, 3),
	]

	bosses = [
		_boss("boss_mark.enforcer", 300, "boss.ravine_enforcer", ["mutation.ravine_orbit_blades", "mutation.ravine_thorn_ring"]),
		_boss("boss_mark.hierarch", 600, "boss.sand_hierarch", ["mutation.sand_palm_fan", "mutation.sand_palm_tide"]),
		_boss("boss_mark.fiend", 900, "boss.frost_blade_fiend", []),
	]

	_add_mutation(_m(
		"mutation.ravine_orbit_blades", "mutation.ravine_orbit_blades.name", "mutation.ravine_orbit_blades.desc",
		["weapon.guard_ring", "manual.iron_guard", "start_style.shen"],
		"boss.ravine_enforcer", 0, "weapon.guard_ring",
		{"orbit_count": 3, "orbit_radius": 52.0}, true
	))
	_add_mutation(_m(
		"mutation.ravine_thorn_ring", "mutation.ravine_thorn_ring.name", "mutation.ravine_thorn_ring.desc",
		["weapon.guard_ring", "manual.cloud_edge", "start_style.shen"],
		"boss.ravine_enforcer", 0, "weapon.guard_ring",
		{"orbit_radius": 64.0, "return_damage": true, "return_damage_mult": 0.45}, true
	))
	_add_mutation(_m(
		"mutation.sand_palm_fan", "mutation.sand_palm_fan.name", "mutation.sand_palm_fan.desc",
		["weapon.palm_wave", "manual.river_breath", "start_style.qi"],
		"boss.sand_hierarch", 0, "weapon.palm_wave",
		{"nova_count": 12, "nova_radius": 110.0}, true
	))
	_add_mutation(_m(
		"mutation.sand_palm_tide", "mutation.sand_palm_tide.name", "mutation.sand_palm_tide.desc",
		["weapon.palm_wave", "manual.warm_pulse", "start_style.qi", "weapon.nine_flash", "start_style.yi"],
		"boss.sand_hierarch", 0, "weapon.palm_wave",
		{"nova_count": 8, "nova_radius": 130.0, "pull_strength": 90.0, "heal_on_hit": 2.0}, true
	))

	var ch := ChapterDef.new()
	ch.id = "chapter.mist_ravine"
	ch.name_key = "chapter.mist_ravine.name"
	ch.duration_sec = 900.0
	ch.win_boss_id = "boss.frost_blade_fiend"
	chapters[ch.id] = ch

func _w(id, name_key, tag, dmg, cd, spd, count, pierce, radius, pattern, starter) -> WeaponDef:
	var w := WeaponDef.new()
	w.id = id
	w.name_key = name_key
	w.tag = tag
	w.base_damage = dmg
	w.cooldown_sec = cd
	w.projectile_speed = spd
	w.projectile_count = count
	w.pierce = pierce
	w.radius = radius
	w.pattern = pattern
	w.starter = starter
	return w

func _e(id, name_key, hp, dmg, spd, exp_r, score, radius, behavior, tint, is_boss=false, ends=false) -> EnemyDef:
	var e := EnemyDef.new()
	e.id = id
	e.name_key = name_key
	e.hp = hp
	e.damage = dmg
	e.move_speed = spd
	e.exp_reward = exp_r
	e.score = score
	e.radius = radius
	e.behavior = behavior
	e.tint = tint
	e.is_boss = is_boss
	e.ends_run_on_defeat = ends
	return e

func _boss_e(id, name_key, hp, dmg, spd, exp_r, score, radius, behavior, tint, signature, telegraph, cooldown, shots, spread, ends) -> EnemyDef:
	var e := _e(id, name_key, hp, dmg, spd, exp_r, score, radius, behavior, tint, true, ends)
	e.signature = signature
	e.telegraph_sec = telegraph
	e.signature_cooldown_sec = cooldown
	e.signature_shot_count = shots
	e.signature_spread = spread
	return e

func _u(id, name_key, desc_key, tag, kind, weapon_id, manual_id, stat, amount) -> UpgradeDef:
	var u := UpgradeDef.new()
	u.id = id
	u.name_key = name_key
	u.desc_key = desc_key
	u.tag = tag
	u.kind = kind
	u.weapon_id = weapon_id
	u.manual_id = manual_id
	u.stat = stat
	u.amount = amount
	return u

func _man(id, name_key, desc_key, tag, hook_kind, hook_id, amount) -> ManualDef:
	var m := ManualDef.new()
	m.id = id
	m.name_key = name_key
	m.desc_key = desc_key
	m.tag = tag
	m.hook_kind = hook_kind
	m.hook_id = hook_id
	m.amount = amount
	return m

func _style(id, name_key, desc_key, preferred, weapons, stacks, bonuses, unlock_id) -> StartStyleDef:
	var s := StartStyleDef.new()
	s.id = id
	s.name_key = name_key
	s.desc_key = desc_key
	s.preferred_tag = preferred
	s.starter_weapon_ids = PackedStringArray(weapons)
	s.starter_tag_stacks = stacks
	s.starter_stat_bonuses = bonuses
	s.unlock_content_id = unlock_id
	return s

func _wave(id, start_s, end_s, enemy_id, interval, amount) -> WaveDef:
	var w := WaveDef.new()
	w.id = id
	w.start_sec = start_s
	w.end_sec = end_s
	w.enemy_id = enemy_id
	w.interval_sec = interval
	w.amount = amount
	return w

func _boss(id, mark, enemy_id, mut_ids: Array) -> BossScheduleEntry:
	var b := BossScheduleEntry.new()
	b.id = id
	b.mark_sec = mark
	b.enemy_id = enemy_id
	b.mutation_reward_ids = PackedStringArray(mut_ids)
	return b

func _m(id, name_key, desc_key, unlocks, boss_id, clears, target_weapon, flags: Dictionary, grant_weapon) -> MutationDef:
	var m := MutationDef.new()
	m.id = id
	m.name_key = name_key
	m.desc_key = desc_key
	m.unlock_content_ids = PackedStringArray(unlocks)
	m.requires_boss_id = boss_id
	m.min_chapter_clears = clears
	m.target_weapon_id = target_weapon
	m.behavior_flags = flags
	m.grant_weapon_in_run = grant_weapon
	return m

func _add_weapon(w: WeaponDef) -> void:
	weapons[w.id] = w

func _add_enemy(e: EnemyDef) -> void:
	enemies[e.id] = e

func _add_upgrade(u: UpgradeDef) -> void:
	upgrades[u.id] = u

func _add_manual(m: ManualDef) -> void:
	manuals[m.id] = m

func _add_style(s: StartStyleDef) -> void:
	start_styles[s.id] = s

func _add_mutation(m: MutationDef) -> void:
	mutations[m.id] = m

func chapter_weapon_ids() -> Array[String]:
	return ["weapon.sword_qi", "weapon.guard_ring", "weapon.palm_wave", "weapon.nine_flash"]

func all_content_ids() -> Array[String]:
	var ids: Array[String] = []
	for k in weapons.keys():
		ids.append(str(k))
	for k in enemies.keys():
		ids.append(str(k))
	for k in upgrades.keys():
		ids.append(str(k))
	for k in manuals.keys():
		ids.append(str(k))
	for k in start_styles.keys():
		ids.append(str(k))
	for w in waves:
		ids.append(w.id)
	for b in bosses:
		ids.append(b.id)
	for k in mutations.keys():
		ids.append(str(k))
	for k in chapters.keys():
		ids.append(str(k))
	return ids

func mutation_eligible(mutation_id: String, defeated_boss_id: String, chapter_id: String) -> bool:
	if not mutations.has(mutation_id):
		return false
	var m: MutationDef = mutations[mutation_id]
	if m.requires_boss_id != "" and m.requires_boss_id != defeated_boss_id:
		return false
	if SaveService.chapter_clears(chapter_id) < m.min_chapter_clears:
		return false
	return true

func eligible_mutations_for_boss(boss_id: String, chapter_id: String) -> Array:
	var out: Array = []
	for b in bosses:
		if b.enemy_id != boss_id:
			continue
		for mid in b.mutation_reward_ids:
			if mutation_eligible(str(mid), boss_id, chapter_id):
				out.append(mutations[str(mid)])
		break
	return out

func unlocked_start_styles() -> Array:
	var out: Array = []
	for id in start_styles.keys():
		var s: StartStyleDef = start_styles[id]
		if s.unlock_content_id == "" or SaveService.is_unlocked(s.unlock_content_id) or SaveService.is_unlocked(s.id):
			out.append(s)
	return out
