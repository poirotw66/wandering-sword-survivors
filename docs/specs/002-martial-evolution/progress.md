# Progress

## Phase

- [x] Planning draft
- [x] Human review
- [x] Implementation
- [x] Verification
- [x] Review
- [ ] Close

## Implementation Notes

- [x] Added 10 martial evolution recipe definitions in `src/data/evolutions.ts`.
- [x] Added combo vs standalone heart-method classification.
- [x] Added 5 standalone heart methods with stronger passive effects.
- [x] Added evolution upgrade options with priority selection.
- [x] Added standalone heart-method upgrade options after mid-run unlock conditions.
- [x] Added special upgrade card styling for evolution and standalone heart methods.
- [x] Added HUD display for evolved martial art names.
- [x] Added localization keys for evolution names, descriptions, and standalone heart methods.
- [x] Added regression tests for recipe count, standalone exclusion, unlock rules, and icon coverage.
- [x] Implemented MVP combat effects for all 10 base forms and all 10 evolved forms.
- [x] Enabled all 10 base forms in the normal upgrade pool.
- [x] Expanded Boss skill unlocks so every combo heart method can be learned.

## Deferred Scope

- [ ] Add unique VFX/audio polish for each evolved martial art.
- [ ] Add achievements for first evolution, specific evolved forms, and standalone manual discovery.

## Planned Scope

- Define 10 martial evolution recipes.
- Combine weapon forms and martial skills into ultimate martial arts.
- Define rare standalone heart methods that cannot evolve with weapon forms.
- Balance standalone heart methods as stronger passive options with lower appearance rate.
- Add evolution upgrade options.
- Add standalone heart method upgrade options.
- Display evolved martial arts in HUD.
- Display standalone heart methods in HUD or martial skill list.
- Add localization keys for evolved names, standalone heart methods, and descriptions.
- Add regression tests for unlock, evolution, and standalone exclusion rules.

## Pending Decisions

- Whether evolution requires extra renown or insight currency.
- Whether a run should limit the total number of evolved martial arts.
- Whether evolved weapons can continue leveling after evolution.
- Standalone heart methods are currently capped at 2 per run.
- Standalone heart methods currently enter the pool after 5 minutes, after any boss defeat, or immediately in dev mode.
- Final VFX/audio polish level for each evolved martial art.
