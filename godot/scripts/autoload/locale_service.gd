extends Node

## Traditional Chinese first; keys stay stable for later English.

var _locale := "zh_TW"
var _table: Dictionary = {}

func _ready() -> void:
	_load_table()
	TranslationServer.set_locale(_locale)

func _load_table() -> void:
	var path := "res://locales/ui_zh_TW.json"
	if not FileAccess.file_exists(path):
		push_warning("Missing locale file: %s" % path)
		return
	var f := FileAccess.open(path, FileAccess.READ)
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	if typeof(parsed) == TYPE_DICTIONARY:
		_table = parsed
	else:
		push_warning("Locale JSON invalid")

func t(key: String, fallback: String = "") -> String:
	if _table.has(key):
		return str(_table[key])
	return fallback if fallback != "" else key

func set_locale(code: String) -> void:
	_locale = code
	_load_table()
