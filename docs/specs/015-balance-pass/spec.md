---
id: 015-balance-pass
title: Balance Pass
status: done
owner: openab
created: 2026-07-03
updated: 2026-07-03
prd: prd-001-nightfall-survivors
---

# Balance Pass Spec

## 1. Context

Specs 010–014 added behavior archetypes, pacing waves, boss identity, build synergy, and mid-run events. Player power now spikes earlier while late-run enemy scaling and elite density can feel punishing.

## 2. Goals

- Centralize balance knobs in one data module.
- Smooth elite density, boss durability, and late enemy scaling.
- Nudge the four build paths toward parity.
- Keep early leveling rewarding without runaway snowball.

## 3. Scope

### 3.1 In Scope

- `src/data/runBalance.ts` with elite curve, boss HP/skill tuning, time scaling, spawn pressure, exp, and build-path combat constants.
- Wire balance helpers into spawn, combat, exp, and boss systems.
- Vitest guardrails for TTK and curve bounds.

### 3.2 Out of Scope

- New weapons, bosses, or events.
- Difficulty tier renown thresholds.
- Art or audio.

## 4. Verification

- `npm test`
- `npm run build`

## 5. Approval

Approved for implementation.
