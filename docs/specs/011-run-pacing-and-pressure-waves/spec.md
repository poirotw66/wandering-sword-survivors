---
id: 011-run-pacing-and-pressure-waves
title: Run Pacing and Pressure Waves
status: done
owner: openab
created: 2026-07-03
updated: 2026-07-03
prd: prd-001-nightfall-survivors
---

# Run Pacing and Pressure Waves Spec

## 1. Context

The game has a 30-minute run timeline with continuous enemy spawning and periodic Boss appearances. Moment-to-moment play can feel flat in the middle of a run because pressure rises gradually without clear peaks or recovery windows.

This spec adds readable pacing beats: pressure surges, post-Boss respite, segment-themed factions, and an ordinary-enemy cap for late-run clarity.

## 2. Goals

- Create a **pressure → recovery** rhythm every ~5 minutes.
- Reward Boss kills with a short **respite window** and bonus experience.
- Give each 10-minute act a **dominant faction theme** without replacing the full spawn table.
- Cap ordinary enemies on screen to preserve readability in dense late waves.
- Keep all pacing logic **data-driven and unit-testable**.

## 3. Scope

### 3.1 In Scope

- `src/data/runPacing.ts` with pure pacing helpers.
- Pressure waves every 5 minutes for 45 seconds (`spawn × 1.5`).
- Boss defeat respite for 8 seconds (`spawn × 0.5`, `exp × 1.5`).
- Three run segments (0–10 / 10–20 / 20–30 min) with themed enemy spawn boost.
- Ordinary enemy cap of 120 (Bosses excluded).
- In-run toasts for pressure wave start and Boss respite.
- Vitest coverage for pacing helpers.

### 3.2 Out of Scope

- New enemy types, Boss skills, or map events.
- Full combat balance pass.
- Analytics / localStorage telemetry.
- Mobile-specific pacing tuning.

## 4. Design

### 4.1 Pressure Wave

| Field | Value |
| --- | --- |
| Interval | 300s (5:00, 10:00, 15:00, …) |
| Duration | 45s |
| Effect | spawn interval ÷ 1.5, amount × 1.5 |

First pressure wave begins at 5:00, not at run start.

### 4.2 Boss Respite

| Field | Value |
| --- | --- |
| Trigger | any Boss defeat |
| Duration | 8s |
| Spawn effect | interval × 2, amount × 0.5 |
| Exp effect | drop value × 1.5 |

### 4.3 Segment Themes

| Segment | Time | Theme factions |
| --- | --- | --- |
| Early | 0–10 min | Qingcheng, Huashan, Emei, Beggar, Bat |
| Mid | 10–20 min | Shaolin, Songshan, Poison, Sun-Moon, Hengshan |
| Late | 20–30 min | Royal Guard, Northern Rider, Medicine Heretic, Wudang, Taishan |

Theme enemies spawn 25% faster (`interval × 0.75`) during their segment.

### 4.4 Enemy Cap

- Max 120 active ordinary enemies.
- Bosses do not count toward the cap.
- When at cap, skip ordinary spawns until count drops.

## 5. Integration

- `SpawnSystem` reads `spawnPacingModifiers()` per wave tick.
- `CollisionSystem` applies `expDropMultiplierFor()` on enemy kill.
- `GameScene` sets `state.respiteUntilMs` on `boss-defeated`.
- `EnemySystem.activeMinionCount()` reports non-Boss active enemies.

## 6. Verification

- `npm test`
- `npm run build`
- Dev mode `?dev=1`: use `N` to advance time and observe pressure toasts at 5:00+.

## 7. Approval

Approved for implementation.
