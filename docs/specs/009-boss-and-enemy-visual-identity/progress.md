# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [ ] Implementation
- [ ] Verification
- [ ] Review
- [ ] Close

## Planned Scope

- Add sprite key mapping to enemy configs.
- Give each Boss a unique sprite key and fallback texture.
- Improve elite visual marker readability.
- Keep combat balance unchanged.
- Prepare for generated or hand-authored wuxia sprite assets.

## Implementation Tasks

- [ ] Task 1: Data mapping.
- [ ] Task 2: Boot asset loading.
- [ ] Task 3: Enemy entity rendering.
- [ ] Task 4: Elite marker polish.
- [ ] Task 5: Asset pass.
- [ ] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Local smoke check.
- Manual dev-mode Boss visual check.

## Decisions

- Keep 009 focused on visual identity, not combat behavior.
- Add safe fallbacks before relying on final art files.
- Bosses should no longer share only `boss-master` as their primary identity.
