extends Control

var _selected_style_id: String = "start_style.jian"
var _style_buttons: Array[Button] = []

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	GameState.phase = GameState.Phase.HUB
	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.color = Color(0.07, 0.09, 0.12)
	add_child(bg)

	var title := Label.new()
	title.text = LocaleService.t("game.title", "雲鶴遊俠")
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.position = Vector2(340, 80)
	title.size = Vector2(600, 50)
	title.add_theme_font_size_override("font_size", 42)
	add_child(title)

	var sub := Label.new()
	sub.text = LocaleService.t("game.subtitle", "十五分鐘霧峽篇章 · 原創武俠倖存者")
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.position = Vector2(340, 140)
	sub.size = Vector2(600, 40)
	add_child(sub)

	var hero := Label.new()
	hero.text = LocaleService.t("hero.yun_he.blurb", "遊俠雲鶴：以劍氣自立，縱步避劫，怒意隨共鳴而變。")
	hero.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hero.position = Vector2(240, 185)
	hero.size = Vector2(800, 40)
	add_child(hero)

	var style_title := Label.new()
	style_title.text = LocaleService.t("ui.start_style", "開局路數")
	style_title.position = Vector2(80, 240)
	style_title.size = Vector2(400, 30)
	add_child(style_title)

	var styles: Array = ContentDB.unlocked_start_styles()
	if styles.is_empty() and ContentDB.start_styles.has("start_style.jian"):
		styles = [ContentDB.start_styles["start_style.jian"]]
	_selected_style_id = str(styles[0].id)
	GameState.select_start_style(_selected_style_id)
	var x := 80.0
	for s in styles:
		var b := Button.new()
		b.set_meta("style_id", s.id)
		b.text = "%s\n%s" % [LocaleService.t(s.name_key, s.id), LocaleService.t(s.desc_key, s.preferred_tag)]
		b.position = Vector2(x, 280)
		b.size = Vector2(260, 90)
		var sid: String = s.id
		b.pressed.connect(func(): _pick_style(sid))
		add_child(b)
		_style_buttons.append(b)
		x += 280.0
	_refresh_style_buttons()

	var start_btn := Button.new()
	start_btn.text = LocaleService.t("ui.start", "開局 · 霧峽十五刻")
	start_btn.position = Vector2(460, 420)
	start_btn.size = Vector2(360, 64)
	start_btn.pressed.connect(_start_run)
	add_child(start_btn)

	var legacy := Button.new()
	legacy.text = LocaleService.t("ui.legacy_note", "Phaser 原型已封存於 /legacy/")
	legacy.position = Vector2(460, 500)
	legacy.size = Vector2(360, 48)
	legacy.disabled = true
	add_child(legacy)

	var unlocks := Label.new()
	var ids: Array = SaveService.data.get("unlocked_content_ids", [])
	unlocks.text = LocaleService.t("ui.unlocks", "已解鎖") + ": " + ", ".join(PackedStringArray(ids.map(func(x): return str(x))))
	unlocks.position = Vector2(80, 640)
	unlocks.size = Vector2(1120, 40)
	add_child(unlocks)

func _pick_style(style_id: String) -> void:
	_selected_style_id = style_id
	GameState.select_start_style(style_id)
	_refresh_style_buttons()

func _refresh_style_buttons() -> void:
	for b in _style_buttons:
		var sid := str(b.get_meta("style_id", ""))
		b.modulate = Color(1.15, 1.1, 0.85) if sid == _selected_style_id else Color.WHITE

func _start_run() -> void:
	GameState.select_start_style(_selected_style_id)
	get_tree().change_scene_to_file("res://scenes/run/run.tscn")
