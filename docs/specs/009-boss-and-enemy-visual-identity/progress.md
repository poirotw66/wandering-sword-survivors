# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [x] Implementation
- [x] Verification
- [x] Review
- [x] Close

## Planned Scope

- Add sprite key mapping to enemy configs. Done.
- Give each Boss a unique sprite key and fallback texture. Done.
- Expand ordinary enemies to ten wuxia archetypes with configured sprite keys. Done.
- Improve elite visual marker readability. Done with data-driven elite traits and labels.
- Keep combat balance unchanged apart from wave variety and enemy stat identities. Done.
- Prepare for generated or hand-authored wuxia sprite assets. Done with sprite-key pipeline and fallback textures.

## Implementation Tasks

- [x] Task 1: Data mapping.
- [x] Task 2: Boot asset loading.
- [x] Task 3: Enemy entity rendering.
- [x] Task 4: Elite marker polish.
- [x] Task 5: Asset pass.
- [x] Task 6: Tests and verification.

## Verification Plan

- `npm test -- --run`
- `npm run build`
- Local smoke check through production preview.
- Manual dev-mode Boss visual check.

## Decisions

- Keep 009 focused on visual identity, not combat behavior.
- Add safe fallbacks before relying on final art files.
- Bosses should no longer share only `boss-master` as their primary identity.
- Use Phaser-generated fallback sprites for this pass; replace with model-generated PNGs in a later art pass.
- Vite dev root is fixed to `__dirname` to avoid raw TypeScript being served from the mounted shell environment.

## Close Summary

- Implemented ten ordinary wuxia enemy archetypes.
- Implemented five unique Boss sprite keys and fallback silhouettes.
- Updated Boss codex icons to use configured Boss sprite keys.
- Added regression coverage for ordinary enemy and Boss sprite mapping.
- Verification passed on 2026-06-24.
