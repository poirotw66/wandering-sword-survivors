extends CanvasLayer

var _run: Node = null
var _hp: Label
var _timer: Label
var _xp: Label
var _kills: Label
var _dash: Label
var _rage: Label
var _res: Label
var _upgrade_panel: Control
var _mutation_panel: Control
var _result_panel: Control
var _touch_origin: Vector2 = Vector2.ZERO
var _touching := false
var _joystick: Control
var _knob: Control
var _dash_btn: Button
var _rage_btn: Button

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	layer = 10
	_build()
	GameState.hud_dirty.connect(_refresh)
	GameState.upgrade_choices_ready.connect(_show_upgrades)
	GameState.mutation_choices_ready.connect(_show_mutations)

func bind_run(run: Node) -> void:
	_run = run

func _build() -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(root)

	_hp = _label(root, Vector2(16, 12), "HP")
	_timer = _label(root, Vector2(560, 12), "00:00")
	_xp = _label(root, Vector2(16, 40), "XP")
	_kills = _label(root, Vector2(16, 68), "Kills")
	_dash = _label(root, Vector2(16, 96), "Dash")
	_rage = _label(root, Vector2(16, 124), "Rage")
	_res = _label(root, Vector2(16, 152), "Resonance")

	_upgrade_panel = _panel(root, LocaleService.t("ui.upgrade_title", "秘笈領悟"), 3)
	_mutation_panel = _panel(root, LocaleService.t("ui.mutation_title", "Boss 變異賜福"), 2)
	_result_panel = _panel(root, LocaleService.t("ui.result_title", "結算"), 1)
	_upgrade_panel.visible = false
	_mutation_panel.visible = false
	_result_panel.visible = false

	_joystick = Control.new()
	_joystick.position = Vector2(90, 560)
	_joystick.custom_minimum_size = Vector2(120, 120)
	root.add_child(_joystick)
	var joy_bg := ColorRect.new()
	joy_bg.size = Vector2(120, 120)
	joy_bg.color = Color(1, 1, 1, 0.12)
	_joystick.add_child(joy_bg)
	_knob = ColorRect.new()
	_knob.size = Vector2(36, 36)
	_knob.position = Vector2(42, 42)
	_knob.color = Color(1, 1, 1, 0.35)
	_joystick.add_child(_knob)

	_dash_btn = Button.new()
	_dash_btn.text = LocaleService.t("ui.dash", "縱步")
	_dash_btn.position = Vector2(1080, 560)
	_dash_btn.size = Vector2(120, 56)
	_dash_btn.pressed.connect(func():
		var p := get_tree().get_first_node_in_group("player")
		if p and p.has_method("try_dash"):
			p.call("try_dash")
	)
	root.add_child(_dash_btn)

	_rage_btn = Button.new()
	_rage_btn.text = LocaleService.t("ui.rage", "怒意")
	_rage_btn.position = Vector2(1080, 480)
	_rage_btn.size = Vector2(120, 56)
	_rage_btn.pressed.connect(func():
		var p := get_tree().get_first_node_in_group("player")
		if p and p.has_method("try_rage"):
			p.call("try_rage")
	)
	root.add_child(_rage_btn)

func _label(parent: Control, pos: Vector2, text: String) -> Label:
	var l := Label.new()
	l.position = pos
	l.text = text
	l.add_theme_font_size_override("font_size", 18)
	parent.add_child(l)
	return l

func _panel(parent: Control, title: String, button_count: int) -> Control:
	var panel := PanelContainer.new()
	panel.position = Vector2(280, 140)
	panel.size = Vector2(720, 400)
	panel.process_mode = Node.PROCESS_MODE_ALWAYS
	var v := VBoxContainer.new()
	panel.add_child(v)
	var t := Label.new()
	t.text = title
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(t)
	for i in range(button_count):
		var b := Button.new()
		b.text = "-"
		b.custom_minimum_size = Vector2(0, 64)
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
	_hp.text = "%s: %d/%d" % [LocaleService.t("ui.hp", "氣血"), int(hp), int(mx)]
	var tsec := int(GameState.elapsed_sec)
	_timer.text = "%02d:%02d" % [tsec / 60, tsec % 60]
	_xp.text = "%s Lv%d (%d/%d)" % [LocaleService.t("ui.xp", "修為"), GameState.level, GameState.xp, GameState.xp_to_next]
	_kills.text = "%s: %d  %s: %d" % [LocaleService.t("ui.kills", "擊殺"), GameState.kills, LocaleService.t("ui.score", "積分"), GameState.score]
	var player := get_tree().get_first_node_in_group("player")
	var charges := 2
	var rage := 0.0
	if player:
		charges = int(player.get("dash_charges"))
		rage = float(player.get("rage_meter"))
	_dash.text = "%s: %d/2" % [LocaleService.t("ui.dash", "縱步"), charges]
	_rage.text = "%s: %d%% (%s)" % [LocaleService.t("ui.rage", "怒意"), int(rage), LocaleService.t("rage.%s" % GameState.resonance.rage_profile(), GameState.resonance.rage_profile())]
	var parts: PackedStringArray = PackedStringArray()
	for tag in Tags.ALL:
		parts.append("%s%d" % [LocaleService.t(Tags.display_key(tag), tag), int(GameState.resonance.stacks.get(tag, 0))])
	_res.text = "%s: %s" % [LocaleService.t("ui.resonance", "共鳴"), " / ".join(parts)]

func _show_upgrades(options: Array) -> void:
	_upgrade_panel.visible = true
	var v: VBoxContainer = _upgrade_panel.get_child(0)
	for i in range(3):
		var b: Button = v.get_child(i + 1)
		if i < options.size():
			var u: UpgradeDef = options[i]
			b.text = "%s\n%s" % [LocaleService.t(u.name_key, u.id), LocaleService.t(u.desc_key, u.tag)]
			b.disabled = false
			b.visible = true
		else:
			b.text = "-"
			b.disabled = true

func _show_mutations(options: Array) -> void:
	_mutation_panel.visible = true
	var v: VBoxContainer = _mutation_panel.get_child(0)
	var title: Label = v.get_child(0)
	title.text = LocaleService.t("ui.mutation_title", "Boss 變異賜福")
	for i in range(2):
		var b: Button = v.get_child(i + 1)
		if i < options.size():
			var m: MutationDef = options[i]
			b.text = "%s\n%s" % [LocaleService.t(m.name_key, m.id), LocaleService.t(m.desc_key, "")]
			b.disabled = false
			b.visible = true
		else:
			b.text = "-"
			b.disabled = true

func show_result() -> void:
	_result_panel.visible = true
	var v: VBoxContainer = _result_panel.get_child(0)
	var title: Label = v.get_child(0)
	title.text = LocaleService.t("ui.win", "闖關成功") if GameState.won else LocaleService.t("ui.lose", "身死道消")
	var b: Button = v.get_child(1)
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
		if st.pressed and st.position.x < 420.0:
			_touching = true
			_touch_origin = st.position
		elif not st.pressed:
			_touching = false
			_set_touch_dir(Vector2.ZERO)
			_knob.position = Vector2(42, 42)
	elif event is InputEventScreenDrag and _touching:
		var sd := event as InputEventScreenDrag
		var delta: Vector2 = sd.position - _touch_origin
		if delta.length() > 60.0:
			delta = delta.normalized() * 60.0
		_knob.position = Vector2(42, 42) + delta * 0.5
		_set_touch_dir(delta / 60.0)

func _set_touch_dir(dir: Vector2) -> void:
	var p := get_tree().get_first_node_in_group("player")
	if p and p.has_method("set_touch_dir"):
		p.call("set_touch_dir", dir)
