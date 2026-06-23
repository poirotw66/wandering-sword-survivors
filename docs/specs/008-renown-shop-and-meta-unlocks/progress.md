# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [x] Implementation
- [x] Verification
- [x] Review
- [x] Close

## Planned Scope

- Add spendable renown and shop upgrade levels to saved records.
- Add purchasable opening bonuses.
- Replace passive meta bonus thresholds with purchased shop effects.
- Show compact shop rows on the menu.
- Show spendable renown and next shop goal after settlement.

## Implementation Tasks

- [x] Task 1: Shop data helpers.
- [x] Task 2: Save migration.
- [x] Task 3: Replace passive bonus calculation.
- [x] Task 4: Menu shop UX.
- [x] Task 5: Settlement UX.
- [x] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Manual menu smoke check for purchase/disabled/max states.

## Verification Result

- `npm test -- --run`: passed, 36 tests.
- `npm run build`: passed.
- Local Vite smoke check: HTTP 200 from `http://127.0.0.1:5173/`.

## Decisions

- Keep 008 as a compact menu shop, not a full separate shop scene.
- Add spendable renown while preserving lifetime total renown.
- Use existing run score as renown gain for both lifetime and spendable totals.
- Defer refund/respec to a later spec.
- Old saves without shop fields migrate spendable renown from lifetime total renown.
- Closed 008 after God Mode implementation, verification, and review reports.
