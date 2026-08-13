class_name UpgradeService
extends RefCounted

static func roll_options(count: int = 3) -> Array:
	var pool: Array = []
	for id in ContentDB.upgrades.keys():
		var u: UpgradeDef = ContentDB.upgrades[id]
		if not _is_pool_eligible(u):
			continue
		pool.append(u)
	pool.shuffle()
	var out: Array = []
	for u in pool:
		out.append(u)
		if out.size() >= count:
			break
	return out

static func _is_pool_eligible(u: UpgradeDef) -> bool:
	match u.kind:
		"weapon":
			if u.weapon_id == "":
				return false
			if u.weapon_id in GameState.owned_weapon_ids:
				return false
			## Locked martial arts stay out of future-run pools until unlocked.
			return SaveService.is_unlocked(u.weapon_id)
		"manual":
			if u.manual_id == "":
				return false
			if u.manual_id in GameState.owned_manual_ids:
				return false
			return SaveService.is_unlocked(u.manual_id)
		_:
			return true

static func apply(upgrade: UpgradeDef) -> void:
	GameState.resonance.add_tag(upgrade.tag, 1)
	match upgrade.kind:
		"weapon":
			if upgrade.weapon_id != "" and upgrade.weapon_id not in GameState.owned_weapon_ids:
				GameState.owned_weapon_ids.append(upgrade.weapon_id)
		"manual":
			_apply_manual(upgrade.manual_id)
		"stat":
			match upgrade.stat:
				"damage_mult":
					GameState.player_stats["damage_mult"] = float(GameState.player_stats["damage_mult"]) + upgrade.amount
				"max_hp":
					GameState.player_stats["max_hp"] = float(GameState.player_stats["max_hp"]) + upgrade.amount
					GameState.player_stats["hp"] = float(GameState.player_stats["hp"]) + upgrade.amount
				"move_speed":
					GameState.player_stats["move_speed"] = float(GameState.player_stats["move_speed"]) + upgrade.amount
				"cooldown_mult":
					GameState.player_stats["cooldown_mult"] = maxf(0.5, float(GameState.player_stats["cooldown_mult"]) + upgrade.amount)
		"resonance":
			pass
	GameState.apply_resonance_to_stats()

static func _apply_manual(manual_id: String) -> void:
	if manual_id == "" or not ContentDB.manuals.has(manual_id):
		return
	if manual_id in GameState.owned_manual_ids:
		return
	GameState.owned_manual_ids.append(manual_id)
	var man: ManualDef = ContentDB.manuals[manual_id]
	if man.hook_kind == "trigger":
		match man.hook_id:
			"on_dash_iframe":
				GameState.dash_iframe_bonus += man.amount
			"on_pickup_heal_bonus":
				GameState.heal_pickup_bonus += man.amount

static func apply_mutation(m: MutationDef) -> void:
	## Persist discovery / content unlocks only — never permanent raw stats.
	SaveService.unlock_mutation(m.id)
	for cid in m.unlock_content_ids:
		SaveService.unlock_content(str(cid))
	if m.id not in GameState.active_mutation_ids:
		GameState.active_mutation_ids.append(m.id)
	if m.grant_weapon_in_run and m.target_weapon_id != "" and m.target_weapon_id not in GameState.owned_weapon_ids:
		GameState.owned_weapon_ids.append(m.target_weapon_id)
	if m.target_weapon_id != "":
		var merged: Dictionary = GameState.weapon_mutation_flags.get(m.target_weapon_id, {}).duplicate(true)
		for k in m.behavior_flags.keys():
			merged[k] = m.behavior_flags[k]
		GameState.weapon_mutation_flags[m.target_weapon_id] = merged
	GameState.hud_dirty.emit()
