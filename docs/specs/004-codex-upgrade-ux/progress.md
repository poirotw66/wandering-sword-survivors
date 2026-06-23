# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [x] Implementation
- [x] Verification
- [x] Review
- [x] Close

## Planned Scope

- Add Martial Codex recipe detail for ultimate arts.
- Add Boss Codex unlock detail for heart methods.
- Add recommendation markers and reasons to upgrade cards.
- Add one current-run banish/seal charge for ordinary stat options.
- Polish reroll so it respects banished options.
- Add focused regression tests and run build verification.

## Implementation Tasks

- [x] Task 1: Add codex detail helpers.
- [x] Task 2: Upgrade `CollectionScene` detail interactions.
- [x] Task 3: Add upgrade recommendation metadata.
- [x] Task 4: Add banish state and actions.
- [x] Task 5: Polish reroll and banish UI.
- [x] Task 6: Add tests and run verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Preview menu, codex, and upgrade panel in local Vite server.

## Verification Result

- `npm test -- --run`: passed, 19 tests.
- `npm run build`: passed.
- Local Vite entry check: `http://127.0.0.1:5173/` returned HTTP 200.

## Decisions

- This spec does not add new martial arts, bosses, art assets, or a balance pass.
- One banish charge per run is enough for MVP.
- Banish applies only to ordinary stat options.
- Recommendation markers are capped to keep the upgrade panel readable.

## Close Result

- Spec frontmatter status updated to `done`.
- Specs overview already marked this spec as `done`.
- God Mode report, verification report, and review report are present.
- Close commit prepared with the next spec draft.
