class_name DisplayFit
extends RefCounted

## Shared helpers for mobile / ultrawide viewport fitting.

## Portrait-phone combat tuning: tighter FOV + slightly larger actors.
const PORTRAIT_PHONE_CAMERA_ZOOM := 1.85
const PORTRAIT_PHONE_SPRITE_MULT := 1.35


static func design_size() -> Vector2:
	return Vector2(1280, 720)


static func is_portrait(viewport: Viewport) -> bool:
	var s := viewport.get_visible_rect().size
	return s.y > s.x * 1.05


static func is_landscape(viewport: Viewport) -> bool:
	return not is_portrait(viewport)


static func is_phone_like(viewport: Viewport) -> bool:
	if OS.has_feature("mobile"):
		return true
	if OS.has_feature("web_android") or OS.has_feature("web_ios"):
		return true
	## Touch + short edge heuristic for mobile web browsers.
	if DisplayServer.is_touchscreen_available():
		var s := viewport.get_visible_rect().size
		return mini(s.x, s.y) <= 900.0
	return false


static func combat_camera_zoom(viewport: Viewport) -> float:
	if is_phone_like(viewport) and is_portrait(viewport):
		return PORTRAIT_PHONE_CAMERA_ZOOM
	return 1.0


static func combat_sprite_mult(viewport: Viewport) -> float:
	## Visual only — hitboxes stay on gameplay radii.
	if is_phone_like(viewport) and is_portrait(viewport):
		return PORTRAIT_PHONE_SPRITE_MULT
	return 1.0


static func safe_margin(viewport: Viewport) -> Rect2:
	## Returns a margin rect (position = inset top-left, size = usable area).
	var visible := viewport.get_visible_rect()
	var safe := DisplayServer.get_display_safe_area()
	var win := DisplayServer.window_get_size()
	if win.x <= 0 or win.y <= 0:
		return Rect2(Vector2.ZERO, visible.size)
	## Map display safe area into viewport coordinates.
	var sx := visible.size.x / float(win.x)
	var sy := visible.size.y / float(win.y)
	var left := maxf(0.0, float(safe.position.x) * sx)
	var top := maxf(0.0, float(safe.position.y) * sy)
	var right := maxf(0.0, float(win.x - safe.end.x) * sx)
	var bottom := maxf(0.0, float(win.y - safe.end.y) * sy)
	## Always keep a small pad for thumbs.
	left = maxf(left, 12.0)
	top = maxf(top, 12.0)
	right = maxf(right, 12.0)
	bottom = maxf(bottom, 18.0)
	return Rect2(Vector2(left, top), visible.size - Vector2(left + right, top + bottom))


static func scale_from_design(viewport: Viewport) -> Vector2:
	var s := viewport.get_visible_rect().size
	var d := design_size()
	return Vector2(s.x / d.x, s.y / d.y)
