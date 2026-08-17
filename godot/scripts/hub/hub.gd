extends Control

var _selected_style_id: String = "start_style.jian"
var _style_buttons: Array[Button] = []
var _content: Control

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	GameState.phase = GameState.Phase.HUB
	get_viewport().size_changed.connect(_layout)
	_build()
	_layout()

func _build() -> void:
	var bg := TextureRect.new()
	bg.name = "Bg"
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)
	if not ArtCatalog.apply_texture_rect(bg, "hub_bg_mist_ravine"):
		var fallback := ColorRect.new()
		fallback.set_anchors_preset(Control.PRESET_FULL_RECT)
		fallback.color = Color(0.07, 0.09, 0.12)
		fallback.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(fallback)
		move_child(fallback, 0)

	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0.02, 0.04, 0.08, 0.42)
	dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(dim)

	_content = Control.new()
	_content.name = "Content"
	_content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_content)

	var title := Label.new()
	title.name = "Title"
	title.text = LocaleService.t("game.title", "雲鶴遊俠")
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 40)
	_content.add_child(title)

	var sub := Label.new()
	sub.name = "Sub"
	sub.text = LocaleService.t("game.subtitle", "十五分鐘霧峽篇章 · 原創武俠倖存者")
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_content.add_child(sub)

	var hero_art := TextureRect.new()
	hero_art.name = "HeroArt"
	hero_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hero_art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_content.add_child(hero_art)
	ArtCatalog.apply_texture_rect(hero_art, "player_yunhe")

	var hero := Label.new()
	hero.name = "HeroBlurb"
	hero.text = LocaleService.t("hero.yun_he.blurb", "遊俠雲鶴：以劍氣自立，縱步避劫，怒意隨共鳴而變。")
	hero.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hero.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_content.add_child(hero)

	var style_title := Label.new()
	style_title.name = "StyleTitle"
	style_title.text = LocaleService.t("ui.start_style", "開局路數")
	_content.add_child(style_title)

	var styles: Array = ContentDB.unlocked_start_styles()
	if styles.is_empty() and ContentDB.start_styles.has("start_style.jian"):
		styles = [ContentDB.start_styles["start_style.jian"]]
	_selected_style_id = str(styles[0].id)
	GameState.select_start_style(_selected_style_id)
	var row := GridContainer.new()
	row.name = "StyleRow"
	row.columns = 2
	row.add_theme_constant_override("h_separation", 12)
	row.add_theme_constant_override("v_separation", 12)
	_content.add_child(row)
	for s in styles:
		var b := Button.new()
		b.set_meta("style_id", s.id)
		b.text = "%s\n%s" % [LocaleService.t(s.name_key, s.id), LocaleService.t(s.desc_key, s.preferred_tag)]
		b.custom_minimum_size = Vector2(140, 88)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.expand_icon = true
		ArtCatalog.apply_button_icon(b, s.id, Vector2(44, 44))
		var sid: String = s.id
		b.pressed.connect(func(): _pick_style(sid))
		row.add_child(b)
		_style_buttons.append(b)
	_refresh_style_buttons()

	var start_btn := Button.new()
	start_btn.name = "StartBtn"
	start_btn.text = LocaleService.t("ui.start", "開局 · 霧峽十五刻")
	start_btn.custom_minimum_size = Vector2(320, 56)
	start_btn.pressed.connect(_start_run)
	_content.add_child(start_btn)

	var legacy := Button.new()
	legacy.name = "LegacyBtn"
	legacy.text = LocaleService.t("ui.legacy_note", "Phaser 原型已封存於 /legacy/")
	legacy.custom_minimum_size = Vector2(320, 40)
	legacy.disabled = true
	_content.add_child(legacy)

	var unlocks := Label.new()
	unlocks.name = "Unlocks"
	var ids: Array = SaveService.data.get("unlocked_content_ids", [])
	unlocks.text = LocaleService.t("ui.unlocks", "已解鎖") + ": " + ", ".join(PackedStringArray(ids.map(func(x): return str(x))))
	unlocks.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	unlocks.add_theme_font_size_override("font_size", 14)
	_content.add_child(unlocks)

func _layout() -> void:
	var safe := DisplayFit.safe_margin(get_viewport())
	var portrait := DisplayFit.is_portrait(get_viewport())
	_content.set_anchors_preset(Control.PRESET_TOP_LEFT)
	_content.position = safe.position
	_content.size = safe.size
	var w := safe.size.x
	var y := 8.0
	var title: Label = _content.get_node("Title")
	title.position = Vector2(0, y)
	title.size = Vector2(w, 48)
	y += 52
	var sub: Label = _content.get_node("Sub")
	sub.position = Vector2(0, y)
	sub.size = Vector2(w, 36)
	y += 40
	var hero_art: TextureRect = _content.get_node("HeroArt")
	var art_h := minf(200.0 if portrait else 160.0, safe.size.y * (0.22 if portrait else 0.26))
	hero_art.position = Vector2((w - art_h) * 0.5, y)
	hero_art.size = Vector2(art_h, art_h)
	y += art_h + 8
	var blurb: Label = _content.get_node("HeroBlurb")
	blurb.position = Vector2(16, y)
	blurb.size = Vector2(w - 32, 48 if portrait else 40)
	y += 52 if portrait else 44
	var style_title: Label = _content.get_node("StyleTitle")
	style_title.position = Vector2(16, y)
	style_title.size = Vector2(w - 32, 28)
	y += 32
	var row: GridContainer = _content.get_node("StyleRow")
	row.columns = 2 if portrait or w < 900.0 else 4
	var row_h := 200.0 if row.columns == 2 else 100.0
	row.position = Vector2(8, y)
	row.size = Vector2(w - 16, row_h)
	y += row_h + 12
	var btn_w := minf(360.0, w - 32.0)
	var start_btn: Button = _content.get_node("StartBtn")
	start_btn.position = Vector2((w - btn_w) * 0.5, y)
	start_btn.size = Vector2(btn_w, 56)
	y += 64
	var legacy: Button = _content.get_node("LegacyBtn")
	legacy.position = Vector2((w - btn_w) * 0.5, y)
	legacy.size = Vector2(btn_w, 40)
	y += 48
	var unlocks: Label = _content.get_node("Unlocks")
	unlocks.position = Vector2(16, minf(y, safe.size.y - 48))
	unlocks.size = Vector2(w - 32, 40)

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
