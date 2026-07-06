---
id: 014-mid-run-events
title: Mid-Run Random Events
status: done
owner: openab
created: 2026-07-03
updated: 2026-07-03
prd: prd-001-nightfall-survivors
---

# Mid-Run Random Events Spec

## 1. Context

Runs already have pressure waves, boss respite, and segment themes, but mid-run variety still comes mostly from upgrades. Short random encounters add surprise without pausing combat.

## 2. Goals

- Roll ambient mid-run events on a cooldown after the early game.
- Offer risk/reward bursts: ambush spawns, exp surge, spawn lull, healing, and supply drops.
- Reuse existing toast, spawn, exp, and pickup systems.

## 3. Scope

### 3.1 In Scope

- `src/data/runEvents.ts` with eligibility, weights, and pacing overlays.
- `RunEventSystem` wired into `GameScene.update()`.
- Five events: ambush, qi surge, formation lull, hermit gift, bandit cache.
- i18n toasts and Vitest coverage.

### 3.2 Out of Scope

- Paused choice encounters or new UI panels.
- Map hazards, merchants, or new enemy types.
- Full balance pass.

## 4. Verification

- `npm test`
- `npm run build`
- Dev mode: advance time past 90s and confirm event toasts appear.

## 5. Approval

Approved for implementation.
