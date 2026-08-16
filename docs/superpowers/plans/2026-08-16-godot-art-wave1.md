# Godot Art Wave 1 Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship chibi PNG combat art for Godot Wave 1 with id→texture catalog and polygon fallback.

**Architecture:** `ArtCatalog` resolves content ids to `res://assets/art/...`. Combat nodes add `Sprite2D` beside existing `Polygon2D` and prefer texture when present.

**Tech Stack:** Godot 4.7.1 GDScript, PNG imports, headless `npm run godot:test`

---

### Task 1: Spec + prompts doc

**Files:**
- Create: `docs/superpowers/specs/2026-08-16-godot-art-wave1-design.md`
- Create: `docs/godot-art-prompts.md`
- Create: `godot/assets/art/{characters,projectiles,pickups}/` (+ README)

- [x] Write approved design
- [x] Write Wave 1 prompts
- [x] Commit docs scaffolding

### Task 2: ArtCatalog

**Files:**
- Create: `godot/scripts/art/art_catalog.gd`
- Modify: `godot/tests/test_runner.gd` (optional art path check)

- [x] Implement id→path→Texture2D with cache and null on miss
- [x] Wave 1 manifest helper for tests

### Task 3: Wire combat nodes

**Files:**
- Modify: `godot/scripts/combat/player.gd`
- Modify: `godot/scripts/combat/enemy.gd`
- Modify: `godot/scripts/combat/projectile.gd`
- Modify: `godot/scripts/combat/enemy_projectile.gd`
- Modify: `godot/scripts/combat/pickup.gd`

- [x] Sprite2D + apply/clear helpers
- [x] Preserve pool release behavior

### Task 4: Generate PNGs

- [x] Generate all Wave 1 PNGs into art folders
- [x] Ensure Godot can import (commit `.import` if generated locally, or let editor/CI create)

### Task 5: Verify + PR

- [x] `npm run godot:test`
- [ ] Commit, push, open PR
