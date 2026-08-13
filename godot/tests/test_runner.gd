extends Node

func _ready() -> void:
	var failures: PackedStringArray = PackedStringArray()
	failures.append_array(_test_content_ids())
	failures.append_array(_test_catalog_counts())
	failures.append_array(_test_resonance_rules())
	failures.append_array(_test_start_style_tie_precedence())
	failures.append_array(_test_locked_pool_filtering())
	failures.append_array(_test_mutation_eligibility_and_choices())
	failures.append_array(_test_mutation_behavior_flags())
	failures.append_array(_test_final_boss_win_ordering())
	failures.append_array(_test_distinct_boss_profiles())
	failures.append_array(_test_wave_validity())
	failures.append_array(_test_milestone_boss_schedule())
	failures.append_array(_test_victory_unlock_contract())
	failures.append_array(_test_start_style_runtime_bonuses())
	failures.append_array(_test_save_fallback())
	failures.append_array(_test_cjk_theme_font())
	if failures.is_empty():
		print("ALL_TESTS_PASSED")
		get_tree().quit(0)
	else:
		print("TESTS_FAILED:")
		for f in failures:
			print(" - ", f)
		get_tree().quit(1)

func _test_content_ids() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var ids: Array[String] = ContentDB.all_content_ids()
	var seen: Dictionary = {}
	for id in ids:
		if id == "":
			errs.append("empty content id")
			continue
		if seen.has(id):
			errs.append("duplicate content id: %s" % id)
		seen[id] = true
	if ids.size() < 20:
		errs.append("expected richer content catalog, got %d" % ids.size())
	var behaviors: Dictionary = {}
	for eid in ContentDB.enemies.keys():
		var e: EnemyDef = ContentDB.enemies[eid]
		behaviors[e.behavior] = true
	for need in ["chaser", "dasher", "tank", "ranger"]:
		if not behaviors.has(need):
			errs.append("missing behavior archetype: %s" % need)
	return errs

func _test_catalog_counts() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var weapons := ContentDB.chapter_weapon_ids()
	if weapons.size() != 4:
		errs.append("expected exactly 4 chapter weapons, got %d" % weapons.size())
	for need in ["weapon.sword_qi", "weapon.guard_ring", "weapon.palm_wave", "weapon.nine_flash"]:
		if need not in weapons or not ContentDB.weapons.has(need):
			errs.append("missing martial art id: %s" % need)
	if ContentDB.weapons.has("weapon.crane_step"):
		errs.append("crane_step must not remain as a fifth martial art")
	if ContentDB.manuals.size() != 8:
		errs.append("expected 8 manuals, got %d" % ContentDB.manuals.size())
	var tags_seen: Dictionary = {}
	for mid in ContentDB.manuals.keys():
		var m: ManualDef = ContentDB.manuals[mid]
		if not Tags.is_valid(m.tag):
			errs.append("manual tag invalid: %s" % mid)
		if m.hook_kind == "" or m.hook_id == "":
			errs.append("manual missing hook: %s" % mid)
		tags_seen[m.tag] = int(tags_seen.get(m.tag, 0)) + 1
	for tag in Tags.ALL:
		if int(tags_seen.get(tag, 0)) < 1:
			errs.append("manuals missing tag coverage: %s" % tag)
	if ContentDB.start_styles.size() != 4:
		errs.append("expected 4 start styles, got %d" % ContentDB.start_styles.size())
	for sid in ["start_style.jian", "start_style.qi", "start_style.shen", "start_style.yi"]:
		if not ContentDB.start_styles.has(sid):
			errs.append("missing start style: %s" % sid)
		else:
			var s: StartStyleDef = ContentDB.start_styles[sid]
			if s.preferred_tag == "" or s.starter_weapon_ids.is_empty():
				errs.append("start style incomplete: %s" % sid)
	return errs

func _test_resonance_rules() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var r := Resonance.new()
	r.add_tag(Tags.JIAN, 2)
	r.add_tag(Tags.QI, 2)
	if r.dominant_tag() != Tags.JIAN:
		errs.append("tie without preference should break to jian, got %s" % r.dominant_tag())
	if not r.is_tie_for_dominant():
		errs.append("expected tie for dominant")
	if r.cross_pairs().is_empty():
		errs.append("expected cross pair jian+qi")
	r.add_tag(Tags.QI, 3)
	if r.dominant_tag() != Tags.QI:
		errs.append("qi should dominate after lead")
	if r.rage_profile() != "pulse":
		errs.append("qi dominant rage should be pulse")
	if r.tier_for(Tags.QI) < 2:
		errs.append("qi tier expected >=2")
	return errs

func _test_start_style_tie_precedence() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var r := Resonance.new()
	r.set_preferred_tag(Tags.QI)
	r.add_tag(Tags.JIAN, 2)
	r.add_tag(Tags.QI, 2)
	if r.dominant_tag() != Tags.QI:
		errs.append("tie should prefer start style qi, got %s" % r.dominant_tag())
	r.set_preferred_tag(Tags.SHEN)
	r.add_tag(Tags.SHEN, 2)
	## jian=2 qi=2 shen=2 → preferred shen
	if r.dominant_tag() != Tags.SHEN:
		errs.append("tie should prefer start style shen, got %s" % r.dominant_tag())
	var r2 := Resonance.new()
	r2.add_tag(Tags.YI, 2)
	r2.add_tag(Tags.SHEN, 2)
	if r2.dominant_tag() != Tags.SHEN:
		errs.append("no preference should keep Tags.ALL order (shen before yi), got %s" % r2.dominant_tag())
	return errs

func _test_locked_pool_filtering() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var backup: Dictionary = SaveService.data.duplicate(true)
	SaveService.replace_data_for_test(SaveService.default_save())
	GameState.owned_weapon_ids = ["weapon.sword_qi"]
	GameState.owned_manual_ids = []
	var pool: Array = UpgradeService.roll_options(12)
	for u in pool:
		var up: UpgradeDef = u
		if up.kind == "weapon" and not SaveService.is_unlocked(up.weapon_id):
			errs.append("locked weapon leaked into pool: %s" % up.weapon_id)
		if up.kind == "manual" and not SaveService.is_unlocked(up.manual_id):
			errs.append("locked manual leaked into pool: %s" % up.manual_id)
	## Explicitly ensure locked guard/palm/flash upgrades are filtered.
	for id in ["upgrade.unlock_guard", "upgrade.unlock_palm", "upgrade.unlock_flash"]:
		var u: UpgradeDef = ContentDB.upgrades[id]
		if UpgradeService._is_pool_eligible(u):
			errs.append("locked unlock-upgrade should be ineligible: %s" % id)
	var styles: Array = ContentDB.unlocked_start_styles()
	for s in styles:
		if s.id != "start_style.jian" and s.unlock_content_id != "" and not SaveService.is_unlocked(s.unlock_content_id) and not SaveService.is_unlocked(s.id):
			errs.append("locked start style should be absent: %s" % s.id)
	var style_ids: Array = styles.map(func(s): return s.id)
	if "start_style.qi" in style_ids:
		errs.append("qi start style must stay locked until palm unlock")
	SaveService.unlock_content("weapon.palm_wave")
	styles = ContentDB.unlocked_start_styles()
	style_ids = styles.map(func(s): return s.id)
	if "start_style.qi" not in style_ids:
		errs.append("qi start style should unlock with palm_wave")
	SaveService.replace_data_for_test(backup)
	SaveService.save()
	return errs

func _test_mutation_eligibility_and_choices() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var enforcer := ContentDB.eligible_mutations_for_boss("boss.ravine_enforcer", "chapter.mist_ravine")
	if enforcer.size() != 2:
		errs.append("enforcer should offer 2 mutations, got %d" % enforcer.size())
	var hierarch := ContentDB.eligible_mutations_for_boss("boss.sand_hierarch", "chapter.mist_ravine")
	if hierarch.size() != 2:
		errs.append("hierarch should offer 2 mutations, got %d" % hierarch.size())
	var fiend := ContentDB.eligible_mutations_for_boss("boss.frost_blade_fiend", "chapter.mist_ravine")
	if fiend.size() != 0:
		errs.append("final boss must not open mutation choices, got %d" % fiend.size())
	if not ContentDB.mutation_eligible("mutation.ravine_orbit_blades", "boss.ravine_enforcer", "chapter.mist_ravine"):
		errs.append("ravine orbit mutation should be eligible")
	if ContentDB.mutation_eligible("mutation.ravine_orbit_blades", "boss.sand_hierarch", "chapter.mist_ravine"):
		errs.append("ravine mutation should reject wrong boss")
	if ContentDB.mutation_eligible("mutation.missing", "boss.ravine_enforcer", "chapter.mist_ravine"):
		errs.append("missing mutation must be ineligible")
	return errs

func _test_mutation_behavior_flags() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var backup: Dictionary = SaveService.data.duplicate(true)
	SaveService.replace_data_for_test(SaveService.default_save())
	GameState.reset_run()
	var m: MutationDef = ContentDB.mutations["mutation.ravine_orbit_blades"]
	UpgradeService.apply_mutation(m)
	if "weapon.guard_ring" not in GameState.owned_weapon_ids:
		errs.append("mutation should grant guard_ring in-run")
	if int(GameState.mutation_flag("weapon.guard_ring", "orbit_count", 0)) != 3:
		errs.append("orbit_count behavior flag missing")
	if not SaveService.is_unlocked("weapon.guard_ring"):
		errs.append("mutation should unlock guard_ring content")
	var m2: MutationDef = ContentDB.mutations["mutation.sand_palm_tide"]
	UpgradeService.apply_mutation(m2)
	if float(GameState.mutation_flag("weapon.palm_wave", "pull_strength", 0.0)) <= 0.0:
		errs.append("palm tide pull_strength flag missing")
	if float(GameState.mutation_flag("weapon.palm_wave", "heal_on_hit", 0.0)) <= 0.0:
		errs.append("palm tide heal_on_hit flag missing")
	if m.behavior_flags.is_empty() or m2.behavior_flags.is_empty():
		errs.append("mutations must carry behavior flags")
	## Ensure save did not persist raw player stats keys.
	if SaveService.data.has("player_stats") or SaveService.data.has("damage_mult"):
		errs.append("save must not persist permanent raw stats")
	SaveService.replace_data_for_test(backup)
	SaveService.save()
	return errs

func _test_final_boss_win_ordering() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var final_entry: BossScheduleEntry = null
	for b in ContentDB.bosses:
		if b.enemy_id == "boss.frost_blade_fiend":
			final_entry = b
			break
	if final_entry == null:
		errs.append("final boss schedule missing")
		return errs
	if final_entry.mutation_reward_ids.size() != 0:
		errs.append("final boss schedule must have empty mutation rewards")
	var edef: EnemyDef = ContentDB.enemies["boss.frost_blade_fiend"]
	if not edef.ends_run_on_defeat:
		errs.append("final boss must end run on defeat")
	var ch: ChapterDef = ContentDB.chapters["chapter.mist_ravine"]
	if ch.win_boss_id != "boss.frost_blade_fiend":
		errs.append("chapter win boss mismatch")
	return errs

func _test_distinct_boss_profiles() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var sigs: Dictionary = {}
	for id in ["boss.ravine_enforcer", "boss.sand_hierarch", "boss.frost_blade_fiend"]:
		var e: EnemyDef = ContentDB.enemies[id]
		if e.signature == "":
			errs.append("boss missing signature: %s" % id)
		if sigs.has(e.signature):
			errs.append("boss signatures must be distinct, duplicate %s" % e.signature)
		sigs[e.signature] = id
		if e.telegraph_sec <= 0.0 or e.signature_cooldown_sec <= 0.0:
			errs.append("boss signature timing invalid: %s" % id)
		if e.signature_shot_count <= 0:
			errs.append("boss signature shot count invalid: %s" % id)
	if sigs.size() != 3:
		errs.append("expected 3 distinct boss signatures")
	return errs

func _test_wave_validity() -> PackedStringArray:
	var errs: PackedStringArray = WaveValidation.validate(ContentDB.waves)
	for b in ContentDB.bosses:
		if b.mark_sec <= 0.0:
			errs.append("boss mark invalid: %s" % b.id)
		if not ContentDB.enemies.has(b.enemy_id):
			errs.append("boss enemy missing: %s" % b.enemy_id)
	if ContentDB.bosses.size() != 3:
		errs.append("expected 3 timed bosses")
	var ch: ChapterDef = ContentDB.chapters["chapter.mist_ravine"]
	if abs(ch.duration_sec - 900.0) > 0.1:
		errs.append("chapter duration must be 900s")
	for w in ContentDB.waves:
		if not ContentDB.enemies.has(w.enemy_id):
			errs.append("wave enemy missing: %s" % w.enemy_id)
	return errs

func _test_milestone_boss_schedule() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var expected := [
		{"mark": 300.0, "enemy": "boss.ravine_enforcer"},
		{"mark": 600.0, "enemy": "boss.sand_hierarch"},
		{"mark": 900.0, "enemy": "boss.frost_blade_fiend"},
	]
	if ContentDB.bosses.size() != expected.size():
		errs.append("expected %d boss marks, got %d" % [expected.size(), ContentDB.bosses.size()])
		return errs
	var prev := -1.0
	for i in range(expected.size()):
		var b: BossScheduleEntry = ContentDB.bosses[i]
		var want: Dictionary = expected[i]
		if abs(b.mark_sec - float(want["mark"])) > 0.1:
			errs.append("boss mark[%d] want %.0f got %.1f" % [i, float(want["mark"]), b.mark_sec])
		if b.enemy_id != str(want["enemy"]):
			errs.append("boss mark[%d] enemy want %s got %s" % [i, want["enemy"], b.enemy_id])
		if b.mark_sec <= prev:
			errs.append("boss marks must be strictly increasing")
		prev = b.mark_sec
	return errs

func _test_victory_unlock_contract() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var backup: Dictionary = SaveService.data.duplicate(true)
	SaveService.replace_data_for_test(SaveService.default_save())
	var before_clears := SaveService.chapter_clears("chapter.mist_ravine")
	GameState.reset_run()
	GameState.end_run(true)
	if not GameState.won:
		errs.append("end_run(true) must set won")
	if GameState.phase != GameState.Phase.RESULT:
		errs.append("victory must enter RESULT phase")
	for need in ["weapon.nine_flash", "start_style.yi", "manual.clear_mind", "manual.echo_focus"]:
		if not SaveService.is_unlocked(need):
			errs.append("victory must unlock %s" % need)
	if SaveService.chapter_clears("chapter.mist_ravine") != before_clears + 1:
		errs.append("victory must increment chapter clears")
	## Defeat path must not grant the same unlocks.
	SaveService.replace_data_for_test(SaveService.default_save())
	GameState.reset_run()
	GameState.end_run(false)
	if SaveService.is_unlocked("weapon.nine_flash"):
		errs.append("defeat must not unlock nine_flash")
	if SaveService.chapter_clears("chapter.mist_ravine") != 0:
		errs.append("defeat must not record chapter clear")
	SaveService.replace_data_for_test(backup)
	SaveService.save()
	return errs

func _test_start_style_runtime_bonuses() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var backup: Dictionary = SaveService.data.duplicate(true)
	var data: Dictionary = SaveService.default_save()
	var unlocks: Array = data["unlocked_content_ids"]
	for id in ["weapon.palm_wave", "weapon.guard_ring", "weapon.nine_flash"]:
		if id not in unlocks:
			unlocks.append(id)
	data["unlocked_content_ids"] = unlocks
	SaveService.replace_data_for_test(data)
	var cases := [
		{"id": "start_style.jian", "tag": Tags.JIAN},
		{"id": "start_style.qi", "tag": Tags.QI, "stat": "max_hp", "min": 111.0},
		{"id": "start_style.shen", "tag": Tags.SHEN, "stat": "move_speed", "min": 205.0},
		{"id": "start_style.yi", "tag": Tags.YI, "stat": "cooldown_mult", "max": 0.96},
	]
	for c in cases:
		GameState.select_start_style(str(c["id"]))
		GameState.reset_run()
		if GameState.resonance.preferred_tag != str(c["tag"]):
			errs.append("%s preferred tag want %s got %s" % [c["id"], c["tag"], GameState.resonance.preferred_tag])
		if int(GameState.resonance.stacks.get(str(c["tag"]), 0)) < 1:
			errs.append("%s should seed preferred tag stack" % c["id"])
		if c.has("stat") and c.has("min"):
			if float(GameState.player_stats[str(c["stat"])]) < float(c["min"]):
				errs.append("%s %s too low" % [c["id"], c["stat"]])
		if c.has("stat") and c.has("max"):
			if float(GameState.player_stats[str(c["stat"])]) > float(c["max"]):
				errs.append("%s %s too high" % [c["id"], c["stat"]])
	SaveService.replace_data_for_test(backup)
	SaveService.save()
	return errs

func _test_save_fallback() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var bad := {"version": 0, "unlocked_content_ids": ["x"]}
	var migrated: Dictionary = SaveService.migrate_for_test(bad)
	if int(migrated.get("version", -1)) != 1:
		errs.append("save fallback version")
	var unlocks: Array = migrated.get("unlocked_content_ids", [])
	if "weapon.sword_qi" not in unlocks:
		errs.append("save fallback must restore starter unlocks")
	var future := {"version": 99, "unlocked_content_ids": ["future.only"]}
	var mig2: Dictionary = SaveService.migrate_for_test(future)
	if "future.only" in mig2.get("unlocked_content_ids", []):
		errs.append("future save must not be trusted blindly")
	var ok := {
		"version": 1,
		"unlocked_content_ids": ["weapon.sword_qi", "weapon.guard_ring"],
		"unlocked_mutations": ["mutation.ravine_orbit_blades"],
		"chapter_clears": {"chapter.mist_ravine": 2}
	}
	var mig3: Dictionary = SaveService.migrate_for_test(ok)
	if "weapon.guard_ring" not in mig3.get("unlocked_content_ids", []):
		errs.append("valid save should keep unlocks")
	return errs

func _test_cjk_theme_font() -> PackedStringArray:
	var errs: PackedStringArray = PackedStringArray()
	var theme: Theme = load("res://resources/ui/default_theme.tres")
	if theme == null or theme.default_font == null:
		errs.append("default theme / CJK font missing")
		return errs
	var samples := PackedStringArray(["雲鶴遊俠", "開局 · 霧峽十五刻", "遊俠雲鶴：以劍氣自立，縱步避劫。", "開局路數"])
	for s in samples:
		var sz: Vector2 = theme.default_font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, 24)
		if sz.x < float(s.length()) * 8.0:
			errs.append("CJK string too narrow (possible missing glyphs): %s" % s)
	return errs
