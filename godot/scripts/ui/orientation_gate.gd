extends CanvasLayer

## Blocks play while the device is held in portrait; asks for landscape.

var _root: Control
var _label: Label

func _ready() -> void:
	layer = 100
	process_mode = Node.PROCESS_MODE_ALWAYS
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_STOP
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
	_refresh()

func _refresh() -> void:
	var portrait := DisplayFit.is_portrait(get_viewport())
	_root.visible = portrait
	_root.mouse_filter = Control.MOUSE_FILTER_STOP if portrait else Control.MOUSE_FILTER_IGNORE
	if portrait:
		_label.text = LocaleService.t("ui.rotate_landscape", "請橫向持機遊玩\nRotate to landscape")
