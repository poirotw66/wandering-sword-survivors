class_name Tags
extends Object

## Four resonance tags. Stable string IDs used across resources and saves.
const JIAN := "jian"
const QI := "qi"
const SHEN := "shen"
const YI := "yi"

const ALL: Array[String] = [JIAN, QI, SHEN, YI]

static func is_valid(tag: String) -> bool:
	return tag in ALL

static func display_key(tag: String) -> String:
	return "tag.%s" % tag
