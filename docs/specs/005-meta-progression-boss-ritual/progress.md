# Progress

## Phase

- [x] Planning draft
- [ ] Human review
- [ ] Implementation
- [ ] Verification
- [ ] Review
- [ ] Close

## Planned Scope

- Clarify renown/title progression on the menu.
- Show difficulty tier multipliers and unlock conditions.
- Add Boss defeat legacy ritual for heart-method inheritance.
- Improve Game Over/Victory chronicle with difficulty, rewards, records, and unlocked legacy.
- Keep old localStorage records backward compatible.

## Implementation Tasks

- [ ] Task 1: Meta progression data helpers.
- [ ] Task 2: Menu meta progression UI.
- [ ] Task 3: Boss legacy event and ritual UI.
- [ ] Task 4: Victory and Game Over chronicle.
- [ ] Task 5: Collection/record polish.
- [ ] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Preview menu meta panel, Boss ritual, and result chronicle.

## Decisions

- Start with passive unlock progression, not a spendable renown shop.
- Boss ritual should not pause combat except final victory.
- No new martial arts, Bosses, or generated assets in this spec.
