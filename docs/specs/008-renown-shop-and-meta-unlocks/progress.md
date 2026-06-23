# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [ ] Implementation
- [ ] Verification
- [ ] Review
- [ ] Close

## Planned Scope

- Add spendable renown and shop upgrade levels to saved records.
- Add purchasable opening bonuses.
- Replace passive meta bonus thresholds with purchased shop effects.
- Show compact shop rows on the menu.
- Show spendable renown and next shop goal after settlement.

## Implementation Tasks

- [ ] Task 1: Shop data helpers.
- [ ] Task 2: Save migration.
- [ ] Task 3: Replace passive bonus calculation.
- [ ] Task 4: Menu shop UX.
- [ ] Task 5: Settlement UX.
- [ ] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Manual menu smoke check for purchase/disabled/max states.

## Decisions

- Keep 008 as a compact menu shop, not a full separate shop scene.
- Add spendable renown while preserving lifetime total renown.
- Use existing run score as renown gain for both lifetime and spendable totals.
- Defer refund/respec to a later spec.
