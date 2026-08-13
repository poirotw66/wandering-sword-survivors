extends Area2D

var kind: String = "xp"
var amount: int = 2
var _alive := false
var _poly: Polygon2D

func _ready() -> void:
	collision_layer = 8
	collision_mask = 1
	if not body_entered.is_connected(_on_body):
		body_entered.connect(_on_body)
	_poly = Polygon2D.new()
	_poly.polygon = PackedVector2Array([Vector2(0, -6), Vector2(5, 0), Vector2(0, 6), Vector2(-5, 0)])
	add_child(_poly)
	var cs := CollisionShape2D.new()
	cs.name = "CollisionShape2D"
	var sh := CircleShape2D.new()
	sh.radius = 8
	cs.shape = sh
	add_child(cs)

func on_pool_release() -> void:
	_alive = false

func activate(pos: Vector2, pickup_kind: String, xp_amount: int) -> void:
	global_position = pos
	kind = pickup_kind
	amount = xp_amount
	_alive = true
	_poly.color = Color(0.35, 0.95, 0.55) if kind == "xp" else Color(0.95, 0.35, 0.4)
	visible = true
	set_deferred("monitoring", true)
	var cs := get_node_or_null("CollisionShape2D") as CollisionShape2D
	if cs:
		cs.set_deferred("disabled", false)

func _physics_process(delta: float) -> void:
	if not _alive or GameState.phase != GameState.Phase.RUN:
		return
	var player := get_tree().get_first_node_in_group("player") as Node2D
	if player == null:
		return
	var range_px: float = float(GameState.player_stats.get("pickup_range", 70.0))
	var d := global_position.distance_to(player.global_position)
	if d < range_px:
		global_position = global_position.move_toward(player.global_position, 320.0 * delta)
	if d < 14.0:
		_collect(player)

func _on_body(body: Node2D) -> void:
	if body.is_in_group("player"):
		_collect(body)

func _collect(player: Node2D) -> void:
	if not _alive:
		return
	_alive = false
	if kind == "heal" and player.has_method("heal"):
		player.call("heal", 18.0)
	else:
		GameState.add_xp(amount)
	PoolManager.release(self)
