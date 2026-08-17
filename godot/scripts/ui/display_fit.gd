class_name DisplayFit
extends RefCounted

## Shared helpers for mobile / ultrawide viewport fitting.


static func design_size() -> Vector2:
	return Vector2(1280, 720)


static func is_portrait(viewport: Viewport) -> bool:
	var s := viewport.get_visible_rect().size
	return s.y > s.x * 1.05


static func is_landscape(viewport: Viewport) -> bool:
	return not is_portrait(viewport)


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
