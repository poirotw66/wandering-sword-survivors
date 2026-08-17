extends CanvasLayer

const SLOT := 48.0
const SLOT_GAP := 6.0
const BAR_H := 14.0
const BAR_W := 220.0

var _run: Node = null
var _root: Control
var _timer: Label
var _meta: Label
var _hp_fill: ColorRect
var _xp_fill: ColorRect
var _hp_label: Label
var _xp_label: Label
var _rage_fill: ColorRect
var _skill_row: HBoxContainer
var _manual_row: HBoxContainer
var _res_row: HBoxContainer
var _skill_slots: Dictionary = {} ## weapon_id -> {icon, overlay, bg}
var _manual_slots: Array = []
var _res_chips: Dictionary = {} ## tag -> {icon, label}
var _upgrade_panel: Control
var _mutation_panel: Control
var _result_panel: Control
var _touch_origin: Vector2 = Vector2.ZERO
var _touching := false
var _joystick: Control
var _knob: Control
var _dash_btn: Button
var _rage_btn: Button
var _owned_sig: String = ""

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	layer = 10
	_build()
	get_viewport().size_changed.connect(_layout)
	_layout()
	GameState.hud_dirty.connect(_refresh)
	GameState.upgrade_choices_ready.connect(_show_upgrades)
	GameState.mutation_choices_ready.connect(_show_mutations)

func bind_run(run: Node) -> void:
	_run = run

func _build() -> void:
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.process_mode = Node.PROCESS_MODE_ALWAYS
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)

	_hp_fill = _make_bar(_root, Color(0.78, 0.22, 0.28), "HpFill")
	_xp_fill = _make_bar(_root, Color(0.28, 0.62, 0.92), "XpFill")
	_hp_label = _label(_root, "")
	_xp_label = _label(_root, "")
	_timer = _label(_root, "00:00")
	_timer.add_theme_font_size_override("font_size", 22)
	_meta = _label(_root, "")
	_meta.add_theme_font_size_override("font_size", 15)

	_skill_row = HBoxContainer.new()
	_skill_row.add_theme_constant_override("separation", int(SLOT_GAP))
	_skill_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_skill_row)

	_manual_row = HBoxContainer.new()
	_manual_row.add_theme_constant_override("separation", int(SLOT_GAP))
	_manual_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_manual_row)

	_res_row = HBoxContainer.new()
	_res_row.add_theme_constant_override("separation", 8)
	_res_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_res_row)
	_build_resonance_chips()

	_upgrade_panel = _panel(_root, LocaleService.t("ui.upgrade_title", "秘笈領悟"), 3)
	_mutation_panel = _panel(_root, LocaleService.t("ui.mutation_title", "Boss 變異賜福"), 2)
	_result_panel = _panel(_root, LocaleService.t("ui.result_title", "結算"), 1)
	_upgrade_panel.visible = false
	_mutation_panel.visible = false
	_result_panel.visible = false

	_joystick = Control.new()
	_joystick.custom_minimum_size = Vector2(128, 128)
	_joystick.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_joystick)
	var joy_bg := ColorRect.new()
	joy_bg.name = "JoyBg"
	joy_bg.size = Vector2(128, 128)
	joy_bg.color = Color(1, 1, 1, 0.12)
	joy_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_joystick.add_child(joy_bg)
	_knob = ColorRect.new()
	_knob.size = Vector2(40, 40)
	_knob.position = Vector2(44, 44)
	_knob.color = Color(1, 1, 1, 0.35)
	_knob.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_joystick.add_child(_knob)

	_dash_btn = Button.new()
	_dash_btn.text = LocaleService.t("ui.dash", "縱步")
	_dash_btn.custom_minimum_size = Vector2(120, 56)
	_dash_btn.pressed.connect(func():
		var p := get_tree().get_first_node_in_group("player")
		if p and p.has_method("try_dash"):
			p.call("try_dash")
	)
	_root.add_child(_dash_btn)

	_rage_btn = Button.new()
	_rage_btn.text = LocaleService.t("ui.rage", "怒意")
	_rage_btn.custom_minimum_size = Vector2(120, 56)
	_rage_btn.pressed.connect(func():
		var p := get_tree().get_first_node_in_group("player")
		if p and p.has_method("try_rage"):
			p.call("try_rage")
	)
	_root.add_child(_rage_btn)

	var rage_track := ColorRect.new()
	rage_track.name = "RageTrack"
	rage_track.color = Color(0.08, 0.08, 0.1, 0.65)
	rage_track.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(rage_track)
	_rage_fill = ColorRect.new()
	_rage_fill.name = "RageFill"
	_rage_fill.color = Color(0.92, 0.45, 0.18)
	_rage_fill.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rage_track.add_child(_rage_fill)

func _make_bar(parent: Control, fill_color: Color, fill_name: String) -> ColorRect:
	var track := ColorRect.new()
	track.color = Color(0.06, 0.07, 0.1, 0.72)
	track.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(track)
	var fill := ColorRect.new()
	fill.name = fill_name
	fill.color = fill_color
	fill.mouse_filter = Control.MOUSE_FILTER_IGNORE
	track.add_child(fill)
	return fill

func _build_resonance_chips() -> void:
	for tag in Tags.ALL:
		var chip := HBoxContainer.new()
		chip.add_theme_constant_override("separation", 4)
		chip.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var bg := ColorRect.new()
		bg.custom_minimum_size = Vector2(52, 28)
		bg.color = Color(0.08, 0.1, 0.14, 0.7)
		bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		## Chip layout: icon + count over a shared row (bg is visual only behind via modulate on icon).
		var icon := TextureRect.new()
		icon.custom_minimum_size = Vector2(24, 24)
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
		ArtCatalog.apply_texture_rect(icon, "icon_tag_%s" % tag)
		if icon.texture == null:
			icon.custom_minimum_size = Vector2(0, 0)
			icon.visible = false
		var count := Label.new()
		count.add_theme_font_size_override("font_size", 16)
		count.text = "0"
		count.mouse_filter = Control.MOUSE_FILTER_IGNORE
		chip.add_child(icon)
		chip.add_child(count)
		_res_row.add_child(chip)
		_res_chips[tag] = {"icon": icon, "label": count, "chip": chip}

func _layout() -> void:
	var safe := DisplayFit.safe_margin(get_viewport())
	var left := safe.position.x
	var top := safe.position.y
	var right := safe.position.x + safe.size.x
	var bottom := safe.position.y + safe.size.y
	var bar_w := minf(BAR_W, safe.size.x * 0.42)

	var hp_track: ColorRect = _hp_fill.get_parent()
	var xp_track: ColorRect = _xp_fill.get_parent()
	hp_track.position = Vector2(left, top)
	hp_track.size = Vector2(bar_w, BAR_H)
	_hp_fill.size.y = BAR_H
	_hp_label.position = Vector2(left, top + BAR_H + 2.0)
	_hp_label.size = Vector2(bar_w, 22)

	xp_track.position = Vector2(left, top + BAR_H + 24.0)
	xp_track.size = Vector2(bar_w, BAR_H)
	_xp_fill.size.y = BAR_H
	_xp_label.position = Vector2(left, top + BAR_H * 2.0 + 26.0)
	_xp_label.size = Vector2(bar_w + 80.0, 22)

	_timer.position = Vector2(safe.position.x + safe.size.x * 0.5 - 40.0, top)
	_timer.size = Vector2(80, 28)
	_meta.position = Vector2(right - 200.0, top)
	_meta.size = Vector2(188, 48)
	_meta.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT

	var skill_y := top + BAR_H * 2.0 + 52.0
	_skill_row.position = Vector2(left, skill_y)
	_manual_row.position = Vector2(left, skill_y + SLOT + 8.0)
	_res_row.position = Vector2(left, skill_y + SLOT * 2.0 + 16.0)

	var panel_w := minf(720.0, safe.size.x - 24.0)
	var panel_h := minf(460.0, safe.size.y - 24.0)
	for panel in [_upgrade_panel, _mutation_panel, _result_panel]:
		panel.size = Vector2(panel_w, panel_h)
		panel.position = Vector2(safe.position.x + (safe.size.x - panel_w) * 0.5, safe.position.y + (safe.size.y - panel_h) * 0.5)

	_joystick.position = Vector2(left + 24.0, bottom - 152.0)
	_joystick.size = Vector2(128, 128)
	_rage_btn.position = Vector2(right - 144.0, bottom - 220.0)
	_rage_btn.size = Vector2(120, 56)
	_dash_btn.position = Vector2(right - 144.0, bottom - 152.0)
	_dash_btn.size = Vector2(120, 56)

	var rage_track: ColorRect = _rage_fill.get_parent()
	rage_track.position = Vector2(right - 144.0, bottom - 236.0)
	rage_track.size = Vector2(120, 8)
	_rage_fill.size.y = 8

func _label(parent: Control, text: String) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", 16)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(l)
	return l

func _panel(parent: Control, title: String, button_count: int) -> Control:
	var panel := PanelContainer.new()
	panel.process_mode = Node.PROCESS_MODE_ALWAYS
	var v := VBoxContainer.new()
	panel.add_child(v)
	var art := TextureRect.new()
	art.name = "PanelArt"
	art.custom_minimum_size = Vector2(0, 120)
	art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	art.visible = false
	v.add_child(art)
	var t := Label.new()
	t.text = title
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(t)
	for i in range(button_count):
		var b := Button.new()
		b.text = "-"
		b.custom_minimum_size = Vector2(0, 72)
		b.expand_icon = true
		var idx := i
		b.pressed.connect(func(): _on_choice(panel, idx))
		v.add_child(b)
	parent.add_child(panel)
	return panel

func _on_choice(panel: Control, idx: int) -> void:
	if panel == _upgrade_panel and _run:
		_upgrade_panel.visible = false
		_run.call("choose_upgrade", idx)
	elif panel == _mutation_panel and _run:
		_mutation_panel.visible = false
		_run.call("choose_mutation", idx)
	elif panel == _result_panel:
		get_tree().paused = false
		get_tree().change_scene_to_file("res://scenes/hub/hub.tscn")

func _refresh() -> void:
	var hp := float(GameState.player_stats.get("hp", 0))
	var mx := float(GameState.player_stats.get("max_hp", 1))
	_hp_label.text = "%s %d/%d" % [LocaleService.t("ui.hp", "氣血"), int(hp), int(mx)]
	_set_bar_ratio(_hp_fill, hp / maxf(mx, 1.0))
	_xp_label.text = "%s Lv%d  %d/%d" % [LocaleService.t("ui.xp", "修為"), GameState.level, GameState.xp, GameState.xp_to_next]
	_set_bar_ratio(_xp_fill, float(GameState.xp) / maxf(float(GameState.xp_to_next), 1.0))
	var tsec := int(GameState.elapsed_sec)
	_timer.text = "%02d:%02d" % [tsec / 60, tsec % 60]
	var player := get_tree().get_first_node_in_group("player")
	var charges := 2
	if player:
		charges = int(player.get("dash_charges"))
	_meta.text = "%s %d\n%s %d · %s %d/2" % [
		LocaleService.t("ui.kills", "擊殺"), GameState.kills,
		LocaleService.t("ui.score", "積分"), GameState.score,
		LocaleService.t("ui.dash", "縱步"), charges
	]
	_refresh_resonance()
	_sync_owned_slots()
	_refresh_live_bars()
	_refresh_skill_cds()

func _refresh_live_bars() -> void:
	var player := get_tree().get_first_node_in_group("player")
	var ratio := 0.0
	if player and player.has_method("rage_ratio"):
		ratio = float(player.call("rage_ratio"))
	elif player:
		ratio = clampf(float(player.get("rage_meter")) / 100.0, 0.0, 1.0)
	_set_bar_ratio(_rage_fill, ratio)
	var profile := GameState.resonance.rage_profile()
	_rage_btn.text = "%s\n%s" % [
		LocaleService.t("ui.rage", "怒意"),
		LocaleService.t("rage.%s" % profile, profile)
	]

func _refresh_resonance() -> void:
	for tag in Tags.ALL:
		var stacks := int(GameState.resonance.stacks.get(tag, 0))
		var chip: Dictionary = _res_chips[tag]
		var label: Label = chip["label"]
		label.text = "%s%d" % [LocaleService.t(Tags.display_key(tag), tag), stacks]
		var node: Control = chip["chip"]
		node.modulate = Color(1, 1, 1, 1) if stacks > 0 else Color(1, 1, 1, 0.45)

func _owned_signature() -> String:
	return ",".join(GameState.owned_weapon_ids) + "|" + ",".join(GameState.owned_manual_ids)

func _sync_owned_slots() -> void:
	var sig := _owned_signature()
	if sig == _owned_sig:
		return
	_owned_sig = sig
	_rebuild_skill_slots()
	_rebuild_manual_slots()

func _rebuild_skill_slots() -> void:
	for child in _skill_row.get_children():
		child.queue_free()
	_skill_slots.clear()
	for wid in GameState.owned_weapon_ids:
		var slot := _make_skill_slot(str(wid))
		_skill_row.add_child(slot["root"])
		_skill_slots[str(wid)] = slot

func _rebuild_manual_slots() -> void:
	for child in _manual_row.get_children():
		child.queue_free()
	_manual_slots.clear()
	for mid in GameState.owned_manual_ids:
		var root := Control.new()
		root.custom_minimum_size = Vector2(SLOT * 0.72, SLOT * 0.72)
		root.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var bg := ColorRect.new()
		bg.size = Vector2(SLOT * 0.72, SLOT * 0.72)
		bg.color = Color(0.12, 0.1, 0.06, 0.75)
		bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		root.add_child(bg)
		var icon := TextureRect.new()
		icon.position = Vector2(4, 4)
		icon.size = Vector2(SLOT * 0.72 - 8.0, SLOT * 0.72 - 8.0)
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
		ArtCatalog.apply_texture_rect(icon, "icon_manual_scroll")
		root.add_child(icon)
		_manual_row.add_child(root)
		_manual_slots.append(mid)

func _make_skill_slot(weapon_id: String) -> Dictionary:
	var root := Control.new()
	root.custom_minimum_size = Vector2(SLOT, SLOT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var bg := ColorRect.new()
	bg.size = Vector2(SLOT, SLOT)
	bg.color = Color(0.08, 0.1, 0.14, 0.82)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(bg)
	var icon := TextureRect.new()
	icon.position = Vector2(4, 4)
	icon.size = Vector2(SLOT - 8.0, SLOT - 8.0)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var icon_id := ArtCatalog.icon_id_for_weapon(weapon_id)
	if ArtCatalog.apply_texture_rect(icon, icon_id):
		root.add_child(icon)
	else:
		## Fallback: first glyph of localized weapon name.
		var fallback := Label.new()
		fallback.size = Vector2(SLOT, SLOT)
		fallback.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		fallback.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		var wname := weapon_id
		if ContentDB.weapons.has(weapon_id):
			var def: WeaponDef = ContentDB.weapons[weapon_id]
			wname = LocaleService.t(def.name_key, weapon_id)
		fallback.text = wname.substr(0, 1)
		fallback.add_theme_font_size_override("font_size", 18)
		fallback.mouse_filter = Control.MOUSE_FILTER_IGNORE
		root.add_child(fallback)
	var overlay := ColorRect.new()
	overlay.color = Color(0.02, 0.04, 0.08, 0.72)
	overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	overlay.position = Vector2(0, 0)
	overlay.size = Vector2(SLOT, 0)
	root.add_child(overlay)
	var frame := ColorRect.new()
	frame.color = Color(0.75, 0.82, 0.9, 0.35)
	frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	## Thin top accent only (not a card stack).
	frame.size = Vector2(SLOT, 2)
	root.add_child(frame)
	return {"root": root, "icon": icon, "overlay": overlay, "weapon_id": weapon_id}

func _refresh_skill_cds() -> void:
	var player := get_tree().get_first_node_in_group("player")
	for wid in _skill_slots.keys():
		var slot: Dictionary = _skill_slots[wid]
		var overlay: ColorRect = slot["overlay"]
		var ratio := 0.0
		if player and player.has_method("weapon_cooldown_ratio"):
			ratio = float(player.call("weapon_cooldown_ratio", wid))
		overlay.size = Vector2(SLOT, SLOT * ratio)
		overlay.position = Vector2(0, SLOT - overlay.size.y)

func _set_bar_ratio(fill: ColorRect, ratio: float) -> void:
	var track: ColorRect = fill.get_parent()
	var w := track.size.x
	fill.position = Vector2.ZERO
	fill.size = Vector2(w * clampf(ratio, 0.0, 1.0), track.size.y)

func _show_upgrades(options: Array) -> void:
	_upgrade_panel.visible = true
	var v: VBoxContainer = _upgrade_panel.get_child(0)
	var art: TextureRect = v.get_node("PanelArt")
	art.visible = false
	art.texture = null
	for i in range(3):
		var b: Button = v.get_child(i + 2)
		if i < options.size():
			var u: UpgradeDef = options[i]
			b.text = "%s\n%s" % [LocaleService.t(u.name_key, u.id), LocaleService.t(u.desc_key, u.tag)]
			ArtCatalog.apply_button_icon(b, ArtCatalog.icon_id_for_upgrade(u), Vector2(48, 48))
			b.disabled = false
			b.visible = true
		else:
			b.text = "-"
			b.icon = null
			b.disabled = true

func _show_mutations(options: Array) -> void:
	_mutation_panel.visible = true
	var v: VBoxContainer = _mutation_panel.get_child(0)
	var art: TextureRect = v.get_node("PanelArt")
	art.visible = false
	art.texture = null
	var title: Label = v.get_child(1)
	title.text = LocaleService.t("ui.mutation_title", "Boss 變異賜福")
	for i in range(2):
		var b: Button = v.get_child(i + 2)
		if i < options.size():
			var m: MutationDef = options[i]
			b.text = "%s\n%s" % [LocaleService.t(m.name_key, m.id), LocaleService.t(m.desc_key, "")]
			ArtCatalog.apply_button_icon(b, "icon_mutation", Vector2(48, 48))
			b.disabled = false
			b.visible = true
		else:
			b.text = "-"
			b.icon = null
			b.disabled = true

func show_result() -> void:
	_result_panel.visible = true
	var v: VBoxContainer = _result_panel.get_child(0)
	var art: TextureRect = v.get_node("PanelArt")
	ArtCatalog.apply_texture_rect(art, "result_win" if GameState.won else "result_lose")
	art.custom_minimum_size = Vector2(0, 140)
	var title: Label = v.get_child(1)
	title.text = LocaleService.t("ui.win", "闖關成功") if GameState.won else LocaleService.t("ui.lose", "身死道消")
	var b: Button = v.get_child(2)
	b.icon = null
	b.text = "%s\n%s %d · %s %d · %s %02d:%02d" % [
		LocaleService.t("ui.back_hub", "返回江湖"),
		LocaleService.t("ui.kills", "擊殺"), GameState.kills,
		LocaleService.t("ui.score", "積分"), GameState.score,
		LocaleService.t("ui.time", "時間"), int(GameState.elapsed_sec) / 60, int(GameState.elapsed_sec) % 60
	]
	b.disabled = false
	b.visible = true

func _input(event: InputEvent) -> void:
	if GameState.phase == GameState.Phase.UPGRADE:
		if event.is_action_pressed("upgrade_1"):
			_on_choice(_upgrade_panel, 0)
		elif event.is_action_pressed("upgrade_2"):
			_on_choice(_upgrade_panel, 1)
		elif event.is_action_pressed("upgrade_3"):
			_on_choice(_upgrade_panel, 2)
	elif GameState.phase == GameState.Phase.MUTATION:
		if event.is_action_pressed("upgrade_1"):
			_on_choice(_mutation_panel, 0)
		elif event.is_action_pressed("upgrade_2"):
			_on_choice(_mutation_panel, 1)
	if event is InputEventScreenTouch:
		var st := event as InputEventScreenTouch
		var joy_rect := Rect2(_joystick.global_position, _joystick.size).grow(36.0)
		if st.pressed and joy_rect.has_point(st.position):
			_touching = true
			_touch_origin = st.position
		elif not st.pressed:
			_touching = false
			_set_touch_dir(Vector2.ZERO)
			_knob.position = Vector2(44, 44)
	elif event is InputEventScreenDrag and _touching:
		var sd := event as InputEventScreenDrag
		var delta: Vector2 = sd.position - _touch_origin
		if delta.length() > 60.0:
			delta = delta.normalized() * 60.0
		_knob.position = Vector2(44, 44) + delta * 0.5
		_set_touch_dir(delta / 60.0)

func _set_touch_dir(dir: Vector2) -> void:
	var p := get_tree().get_first_node_in_group("player")
	if p and p.has_method("set_touch_dir"):
		p.call("set_touch_dir", dir)
