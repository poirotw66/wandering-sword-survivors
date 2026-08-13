# Godot Remake Status (Approved Plan)

Phaser / TypeScript remains a **frozen archive** under `legacy/`. The Godot 4.7.1 GDScript project under `godot/` is the Pages root and product line.

## Engine / delivery

| Item | Choice |
| --- | --- |
| Engine | Godot **4.7.1** GDScript |
| Renderer | Compatibility (`gl_compatibility`) |
| Gameplay viewport | Fixed **1280×720** (`canvas_items` + keep aspect) |
| Deploy | GitHub Pages: Godot Web at `/`, Phaser at `/legacy/` |
| CI | `.github/workflows/deploy.yml` builds both + headless Godot tests |

## First public chapter (15 minutes)

Chapter id: `chapter.mist_ravine` (霧峽十五刻). Duration **900s**. Boss marks at **300 / 600 / 900** with telegraphs. Final boss `boss.frost_blade_fiend` ends the run on defeat.

## Systems shipped

- Desktop + landscape touch (virtual stick, dash, rage)
- Exactly **four** automatic martial arts (Sword Qi / Guard Ring / Palm Wave / Nine Flash); dash with **2 charges** + i-frames; rage follows **dominant resonance**
- Eight `ManualDef` manuals in the upgrade pool (tag + passive/stat/trigger hook); hub **start styles** `jian/qi/shen/yi` with preferred-tag tie-break
- XP / heal pickups; level-up three-choose-one; mid-boss offers **two behavior mutations** (content unlocks only in save); final boss ends the chapter with no mutation panel
- Tags: `jian` / `qi` / `shen` / `yi` with tier thresholds and cross-tag bonuses; ties prefer start-style tag, else stable `Tags.ALL` order
- Four minion archetypes: chaser / dasher / tank / ranger
- PoolManager for enemies, projectiles, pickups
- Custom Resource defs + ContentDB stable string IDs
- Traditional Chinese strings in `godot/locales/ui_zh_TW.json` (keys stable for later locales)
- Versioned JSON save (`user://wss_save_v1.json`) — unlocks / mutations / chapter clears only

## Naming / art policy

- UI uses **original** wuxia names (e.g. 雲鶴, 青崖執法). Do not surface legacy copyrighted character names in the Godot UI.
- `godot/assets/placeholders/` are geometric stand-ins only, isolated from `legacy/` art.

## Headless tests

`godot/tests/run_tests.gd` covers:

1. Content ID uniqueness / required archetypes
2. Resonance dominant + tie + cross-tag + rage profile
3. Mutation eligibility
4. Wave / boss schedule validity + 900s chapter
5. Save migrate / fallback for corrupt & future versions

```bash
npm run godot:test
```

## Local export

```bash
# after templates installed for 4.7.1.stable
bash scripts/install-godot-templates.sh
npm run godot:export-web
```

## What stayed in legacy

Full 30-minute Phaser timeline, renown shop economy, codex UX, and generated sprite pipeline remain historical references. Port rules and feel goals — not Phaser API structure.

---

Document status: remake implementation in-repo (uncommitted until coordinator requests commit).
