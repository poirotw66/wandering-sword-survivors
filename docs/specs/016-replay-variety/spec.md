---
id: 016-replay-variety
title: Replay Variety
status: in_progress
owner: openab
created: 2026-07-03
updated: 2026-07-03
prd: prd-001-nightfall-survivors
---

# Replay Variety Spec

## 1. Context

Meta choices (start style, renown shop, difficulty) exist, but each run still feels similar once combat begins. Lightweight **run modifiers** add replay motivation without new content art.

## 2. Goals

- Offer three rolled **江湖際遇** modifiers before each run; player picks one.
- Unlock more modifiers through renown and boss milestones.
- Apply modifiers via existing combat/spawn systems.

## 3. Scope

### 3.1 In Scope

- `src/data/runModifiers.ts` with six modifiers, unlock rules, and effect helpers.
- Menu picker row and GameScene application + toast.
- Elite chance, exp, score, theme spawn, and player stat hooks.
- i18n and Vitest coverage.

### 3.2 Out of Scope

- Daily challenges, seeded runs, or new weapons.

## 4. Verification

- `npm test`
- `npm run build`

## 5. Approval

Approved for implementation.
