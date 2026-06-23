# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [x] Implementation
- [x] Verification
- [x] Review
- [ ] Close

## Planned Scope

- Clarify renown/title progression on the menu.
- Show difficulty tier multipliers and unlock conditions.
- Add Boss defeat legacy ritual for heart-method inheritance.
- Improve Game Over/Victory chronicle with difficulty, rewards, records, and unlocked legacy.
- Keep old localStorage records backward compatible.

## Implementation Tasks

- [x] Task 1: Meta progression data helpers.
- [x] Task 2: Menu meta progression UI.
- [x] Task 3: Boss legacy event and ritual UI.
- [x] Task 4: Victory and Game Over chronicle.
- [x] Task 5: Collection/record polish.
- [x] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Preview menu meta panel, Boss ritual, and result chronicle.

## Verification Result

- `npm test -- --run`: passed, 22 tests.
- `npm run build`: passed.
- Local Vite entry check: `http://127.0.0.1:5173/` returned HTTP 200.

## Decisions

- Start with passive unlock progression, not a spendable renown shop.
- Boss ritual should not pause combat except final victory.
- No new martial arts, Bosses, or generated assets in this spec.
- God Mode implemented Phase 1-4; Phase 5 Close remains separate.
