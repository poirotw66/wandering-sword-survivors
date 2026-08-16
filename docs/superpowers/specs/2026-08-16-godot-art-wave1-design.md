# Godot Art Wave 1 Design

**Status:** Approved  
**Date:** 2026-08-16  
**Scope:** Wave 1 combat readability art for the Godot remake

## Goals

Replace geometric `Polygon2D` stand-ins for in-run combat entities with AI-generated Q-version (chibi) PNG sprites, while keeping Hub / results / upgrade icons for Wave 2.

## Constraints

- Original wuxia naming only (e.g. 雲鶴, 青崖執法). No legacy copyrighted character names in UI, filenames, or prompts.
- Do not copy or re-export art from `legacy/`.
- Missing textures must not break gameplay or headless tests.
- Collision / pooling behavior stays as today; art is display-only.

## Approach

Content-id → PNG path catalog + `Sprite2D`, with silent fallback to existing polygons when a file is absent.

## Directory contract

Root: `godot/assets/art/`

| Subdir | Contents |
| --- | --- |
| `characters/` | Player, minions, bosses |
| `projectiles/` | Player and enemy projectiles |
| `pickups/` | XP and heal |

Filename rule: ContentDB id with `.` → `_`, plus `.png`.  
Examples: `enemy.green_cliff` → `enemy_green_cliff.png`; player → `player_yunhe.png`.

Technical sizes: characters 512×512 (bosses 768×768), projectiles/pickups 256×256; transparent background; chibi SD; 3/4 view facing right.

## Runtime wiring

- `ArtCatalog` maps ids to `res://assets/art/...` and returns `Texture2D` or null.
- Player, enemy, projectile, enemy projectile, and pickup each own a `Sprite2D` beside the existing `Polygon2D`.
- Texture present → show sprite, hide polygon; else keep polygon + tint.
- Apply on `_ready` / `activate` / `launch`; clear or hide safely on pool release.
- Optional `flip_h` from facing/velocity; default on for player/enemies.
- Sprite scale tuned to approximate existing visual size; hitboxes unchanged.

## Wave 1 asset list

| File stem | Role |
| --- | --- |
| `player_yunhe` | Player |
| `enemy_green_cliff`, `enemy_crimson_sand`, `enemy_frost_peak`, `enemy_ink_river`, `enemy_mist_bandit`, `enemy_reed_knife` | Minions |
| `boss_ravine_enforcer`, `boss_sand_hierarch`, `boss_frost_blade_fiend` | Bosses |
| `proj_sword_qi`, `proj_enemy` | Projectiles |
| `pickup_xp`, `pickup_heal` | Pickups |

Prompts live in `docs/godot-art-prompts.md` (Godot-only; not the legacy Phaser prompt doc).

## Wave 2 boundary (out of scope)

Hub background, start-style portraits, upgrade/manual icons, results art, animation atlases.

## Error handling and tests

- Missing/failed load → polygon fallback; no assert; optional one-shot debug log.
- `npm run godot:test` must stay green without requiring all PNGs.
- Light check: any file that exists on the Wave 1 manifest must load; absence is not a failure unless `STRICT_ART=1`.

## Definition of done (Wave 1)

1. Directory contract + `ArtCatalog` + unit skinning shipped.
2. `docs/godot-art-prompts.md` covers Wave 1.
3. All Wave 1 PNGs listed above are in repo.
4. Pooling does not leave wrong skins; collisions unchanged.
5. `godot:test` passes.
