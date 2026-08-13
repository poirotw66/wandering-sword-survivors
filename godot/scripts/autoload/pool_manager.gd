extends Node

## Lightweight node pools for projectiles, enemies, pickups.
## Never mutate CollisionObject2D / process_mode / tree from physics callbacks —
## release() and transfer() always defer those mutations.

var _pools: Dictionary = {}
var _releasing: Dictionary = {} # instance_id -> true

func warm(key: String, scene: PackedScene, count: int) -> void:
	if not _pools.has(key):
		_pools[key] = []
	var bucket: Array = _pools[key]
	while bucket.size() < count:
		var n: Node = scene.instantiate()
		n.set_meta("pool_key", key)
		add_child(n)
		_park_node(n)
		bucket.append(n)

func acquire(key: String, scene: PackedScene) -> Node:
	if not _pools.has(key):
		_pools[key] = []
	var bucket: Array = _pools[key]
	var node: Node
	if bucket.is_empty():
		node = scene.instantiate()
		node.set_meta("pool_key", key)
		add_child(node)
	else:
		node = bucket.pop_back()
	_releasing.erase(node.get_instance_id())
	if node.has_meta("_pool_releasing"):
		node.remove_meta("_pool_releasing")
	node.process_mode = Node.PROCESS_MODE_INHERIT
	if node is CanvasItem:
		(node as CanvasItem).visible = true
	## Collision enable is deferred-safe even outside callbacks.
	_set_collision_enabled(node, true)
	return node

func transfer(node: Node, new_parent: Node) -> void:
	if not is_instance_valid(node) or not is_instance_valid(new_parent):
		return
	if node.get_parent() == new_parent:
		return
	call_deferred("_transfer_deferred", node, new_parent)

func release(node: Node) -> void:
	if not is_instance_valid(node):
		return
	var id := node.get_instance_id()
	if _releasing.has(id) or node.has_meta("_pool_releasing"):
		return
	_releasing[id] = true
	node.set_meta("_pool_releasing", true)
	## IMPORTANT: do not touch process_mode / monitoring / tree here — Godot
	## forbids disabling CollisionObject2D during physics callbacks.
	call_deferred("_release_deferred", node)

func _transfer_deferred(node: Node, new_parent: Node) -> void:
	if not is_instance_valid(node) or not is_instance_valid(new_parent):
		return
	if node.get_parent() == new_parent:
		return
	if node.get_parent() == null:
		new_parent.add_child(node)
		return
	node.reparent(new_parent, true)

func _release_deferred(node: Node) -> void:
	if not is_instance_valid(node):
		return
	var id := node.get_instance_id()
	_releasing.erase(id)
	if node.has_meta("_pool_releasing"):
		node.remove_meta("_pool_releasing")
	var key := str(node.get_meta("pool_key", ""))
	if key == "":
		node.queue_free()
		return
	if node.get_parent() != self:
		if node.get_parent():
			node.reparent(self, false)
		else:
			add_child(node)
	_park_node(node)
	if node.has_method("on_pool_release"):
		node.call("on_pool_release")
	if not _pools.has(key):
		_pools[key] = []
	if node not in _pools[key]:
		_pools[key].append(node)

func _park_node(node: Node) -> void:
	if node is CanvasItem:
		(node as CanvasItem).visible = false
	node.process_mode = Node.PROCESS_MODE_DISABLED
	_set_collision_enabled(node, false)

func _set_collision_enabled(node: Node, enabled: bool) -> void:
	if node is Area2D:
		node.set_deferred("monitoring", enabled)
		node.set_deferred("monitorable", enabled)
	for child in node.get_children():
		if child is CollisionShape2D:
			child.set_deferred("disabled", not enabled)
		elif child is Area2D:
			child.set_deferred("monitoring", enabled)
			for sub in child.get_children():
				if sub is CollisionShape2D:
					sub.set_deferred("disabled", not enabled)
