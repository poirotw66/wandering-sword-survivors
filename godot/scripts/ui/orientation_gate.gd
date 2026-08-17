extends CanvasLayer

## On phones, blocks play while held in landscape and asks for portrait.
## Desktop windows are not gated.

var _root: Control
var _label: Label

func _ready() -> void:
	layer = 100
	process_mode = Node.PROCESS_MODE_ALWAYS
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.visible = false
	add_child(_root)
	var dim := ColorRect.new()
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0.04, 0.06, 0.09, 0.92)
	_root.add_child(dim)
	_label = Label.new()
	_label.set_anchors_preset(Control.PRESET_FULL_RECT)
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_label.add_theme_font_size_override("font_size", 28)
	_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_root.add_child(_label)
	get_viewport().size_changed.connect(_refresh)
	## Wait one frame so web canvas size is real before gating.
	await get_tree().process_frame
	_refresh()

func _is_phone_like() -> bool:
	return DisplayFit.is_phone_like(get_viewport())

func _refresh() -> void:
	## Portrait-only on phones: gate when landscape.
	var enforce := _is_phone_like() and not DisplayFit.is_portrait(get_viewport())
	_root.visible = enforce
	_root.mouse_filter = Control.MOUSE_FILTER_STOP if enforce else Control.MOUSE_FILTER_IGNORE
	if enforce:
		_label.text = LocaleService.t("ui.rotate_portrait", "請直向持機遊玩\nRotate to portrait")
