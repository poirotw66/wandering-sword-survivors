---
id: 013-mid-run-build-synergy
title: Mid-Run Build Synergy
status: done
owner: openab
created: 2026-07-03
updated: 2026-07-03
prd: prd-001-nightfall-survivors
---

# Mid-Run Build Synergy Spec

## 1. Context

Build paths currently unlock only after mastering six weapons and six heart methods, which arrives too late for mid-run identity. Players also lack HUD guidance on near evolutions and receive little feedback when investing in a build path.

## 2. Goals

- Unlock build paths earlier in a run.
- Add milestone passives at build path levels 3, 5, and 8.
- Show evolution preview text in the HUD.
- Softly guide specialization when two build paths are already active.

## 3. Scope

### 3.1 In Scope

- `src/data/buildPathSynergy.ts` with unlock rules, milestone helpers, and combat trigger predicates.
- Build path unlock after first minor Boss **or** 2 weapons Lv3+ and 1 skill Lv2+.
- Milestone stat bonuses and combat triggers:
  - Sword Lv5+: crit burst
  - Qi Lv3+: kill heal
  - Footwork Lv5+: dodge speed boost
  - Wine Lv5+: combo cooldown shave
- HUD evolution preview line under the loadout bar.
- Build upgrade weight ×0.5 for a third untouched path once two paths are active.
- Vitest coverage.

### 3.2 Out of Scope

- New weapons, evolutions, or build paths.
- Hard-locking players out of a third path.
- Full balance pass.

## 4. Verification

- `npm test`
- `npm run build`
- Dev mode: defeat first Boss or reach weapon/skill thresholds and confirm build cards appear.

## 5. Approval

Approved for implementation.
