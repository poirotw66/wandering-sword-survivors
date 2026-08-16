# Godot Art Wave 2 Design

**Status:** Approved (continuation of Wave 1)  
**Date:** 2026-08-16  
**Depends on:** `docs/superpowers/specs/2026-08-16-godot-art-wave1-design.md`

## Goals

Replace flat Hub / upgrade / mutation / result UI with chibi-consistent art: mist-ravine hub backdrop, four start-style portraits, category icons, and win/lose result art.

## Approach

Same as Wave 1: content id → PNG under `godot/assets/art/`, missing files silent-fallback. UI uses `TextureRect` / `Button.icon` instead of combat `Sprite2D`.

## Directories

| Path | Contents |
| --- | --- |
| `art/ui/` | Hub background, start-style portraits, result banners |
| `art/icons/` | Tag / weapon / manual / mutation icons |

## Wave 2 manifest

| Id | File |
| --- | --- |
| `hub_bg_mist_ravine` | `ui/hub_bg_mist_ravine.png` |
| `start_style.jian` … `yi` | `ui/start_style_{jian,qi,shen,yi}.png` |
| `result_win` / `result_lose` | `ui/result_*.png` |
| `icon_tag_{jian,qi,shen,yi}` | `icons/icon_tag_*.png` |
| `icon_weapon_{sword_qi,guard_ring,palm_wave,nine_flash}` | `icons/icon_weapon_*.png` |
| `icon_manual_scroll` | `icons/icon_manual_scroll.png` |
| `icon_mutation` | `icons/icon_mutation.png` |

Upgrade cards map icons by kind: weapon → weapon icon, manual → scroll, else → tag icon. Mutations use `icon_mutation`.

## Wiring

- Hub: full-rect `TextureRect` background; style buttons get portrait icons; optional hero portrait from `player_yunhe`.
- HUD panels: set `Button.icon` when showing upgrades/mutations; result panel shows win/lose art above the back button.

## Out of scope

Per-manual unique illustrations, animated hub, lore codex art, audio.
