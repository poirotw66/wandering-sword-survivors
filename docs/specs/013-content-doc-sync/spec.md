---
id: 013-content-doc-sync
title: Content and Documentation Sync
status: done
owner: openab
created: 2026-06-24
updated: 2026-06-24
prd: prd-001-nightfall-survivors
---

# Content and Documentation Sync

## 1. Context

Gameplay content outpaced README and legacy spec references (Slime/Bat/Golem, 10-minute boss, 10 enemy types). This spec tracks documentation alignment with the current build.

## 2. Changes

| Area | Before | After |
| --- | --- | --- |
| README enemies | Slime, Bat, Golem | 16 wuxia factions + 5 Boss tiers |
| README duration | 10-minute boss | 30-minute Boss timeline |
| Spec 009 enemy count | 10 archetypes | 16 archetypes + unique Boss sprites |
| Elite readability | tint + scale only | tint + scale + pulsing aura ring |
| Audio | Web Audio synth only | `public/assets/audio/wuxia/*.wav` + synth fallback |
| Map rendering | 1254px stretched to 6000px | 5×5 native-resolution tile grid |
| High DPI | RESIZE only | RESIZE + native-resolution map tiles (no 6000px stretch) |
| GitHub Pages | workflow only | README setup steps for Actions source |

## 3. Verification

- [x] README reflects current enemy count, Boss schedule, and deploy notes
- [x] Spec 009 section 3 updated to current asset state
- [x] `docs/game-content.md` remains the detailed Traditional Chinese reference

## 4. Out of Scope

- Enabling GitHub Pages on the remote repository (requires repo admin)
- Replacing procedural SFX with licensed commercial libraries
