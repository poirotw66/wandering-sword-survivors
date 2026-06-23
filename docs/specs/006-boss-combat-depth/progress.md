# Progress

## Phase

- [x] Planning draft
- [ ] Human review
- [ ] Implementation
- [ ] Verification
- [ ] Review
- [ ] Close

## Planned Scope

- Add data-driven Boss skill config and profiles.
- Improve Boss dash, fan strike, summon, and final phase telegraphs.
- Show current Boss technique status in the Boss bar.
- Preserve and test elite family identity.
- Keep existing martial arts, meta progression, and art assets unchanged.

## Implementation Tasks

- [ ] Task 1: Boss skill config helpers.
- [ ] Task 2: Refactor `EnemySystem` Boss skill usage.
- [ ] Task 3: Improve telegraph visuals.
- [ ] Task 4: Boss bar status UI.
- [ ] Task 5: Elite trait helper.
- [ ] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Preview dev mode Boss spawn, Boss technique status, and telegraphs.

## Decisions

- Keep 006 focused on Boss combat depth and clarity.
- Do not add new martial arts, new Bosses, or generated art assets.
- Preserve current Boss skill concepts while making them data-driven and clearer.
