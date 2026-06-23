# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [x] Implementation
- [x] Verification
- [x] Review
- [x] Close

## Planned Scope

- Add renown shop tier display.
- Add start-style choices for Sword Sect, Qi Sect, Footwork Path, and Wine Sword Path.
- Unlock styles through renown or Boss defeat history.
- Apply selected style as an opening build-path bonus.
- Show next-run recommendations on menu and settlement.

## Implementation Tasks

- [x] Task 1: Spec and progress files.
- [x] Task 2: Meta choice helpers.
- [x] Task 3: Menu start choice.
- [x] Task 4: Run start integration.
- [x] Task 5: Settlement recommendation.
- [x] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Preview menu style choices and Game Over recommendation.

## Verification Result

- `npm test -- --run`: passed, 30 tests.
- `npm run build`: passed.
- Local Vite smoke check: `http://127.0.0.1:5173/` returned HTTP 200.

## Decisions

- Use existing total renown and Boss defeat record as unlock conditions.
- Keep renown shop passive in this phase; no spend/refund flow yet.
- Apply one existing build-path level at run start to keep balance simple.
- Closed 007 after verification, review report, and God Mode report were completed.
