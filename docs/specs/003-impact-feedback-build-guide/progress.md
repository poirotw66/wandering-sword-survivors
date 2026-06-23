# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [x] Implementation
- [x] Verification
- [x] Review
- [x] Close

## Implementation Notes

- [x] Added `src/data/evolutionProgress.ts` for build-route progress calculation.
- [x] Added upgrade card badges, recipe hints, and progress text.
- [x] Added HUD martial-route tracking for the closest ultimate arts.
- [x] Added `evolution-fired`, `evolution-learned`, and `boss-defeated` audio events.
- [x] Added distinct hit flash colors for martial forms.
- [x] Added evolution-learned screen feedback.
- [x] Added evolution and standalone manual achievements.
- [x] Added Boss unlock feedback for potential ultimate arts.
- [x] Persisted discovered ultimate arts and standalone manuals in run records.
- [x] Added regression tests for progress sorting, card hints, achievements, Boss feedback, and persistence.

## Verification

- `npm test -- --run`
- `npm run build`

## Close Notes

- Closed on 2026-06-23 after implementation, verification, and preview entry check.
- Preview confirmed at `http://127.0.0.1:5173/` with HTTP 200.
- Feature implementation committed as `6f28ac7 feat: add impact feedback and build guidance`.

## Deferred Scope

- [ ] More elaborate per-ultimate VFX beyond color, flash, tint, and simple ring effects.
- [ ] Audio settings menu for enabling/disabling generated sound effects.

## Planned Scope

- Add build-route guidance for martial evolution recipes.
- Improve upgrade card clarity with badges and recipe progress.
- Add HUD tracking for the closest ultimate martial arts.
- Add VFX and audio feedback for ultimate martial arts.
- Add evolution and standalone manual achievements.
- Improve Boss unlock feedback.

## Pending Decisions

- Players cannot pin a preferred martial route in this MVP.
- HUD shows up to 3 tracked routes.
- Evolution feedback uses flash/ring feedback instead of heavy slow motion.
- Audio settings are deferred.
