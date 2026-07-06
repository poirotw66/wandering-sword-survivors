# Phase 5 Close Report

## Status

Closed gameplay expansion phase covering Specs `010`–`016`, plus follow-up mobile and balance polish merged through PR #12.

## Delivered (Specs 010–016)

| Spec | Summary |
| --- | --- |
| 010 | Four minion behavior archetypes, sixteen faction mapping, telegraphs, ranger projectiles |
| 011 | Five-minute pressure waves, post-Boss respite, segment themes, 120 minion cap |
| 012 | Signature mechanic per Boss tier (pursuit lock, fan linger, guard formation, needle storm, final orbit) |
| 013 | Earlier build-path unlocks, Lv3/5/8 milestones, evolution preview HUD, soft third-path weighting |
| 014 | Mid-run random events: ambush, qi surge, formation lull, hermit gift, bandit cache |
| 015 | Centralized `runBalance.ts` knobs for elites, bosses, time scaling, exp, build-path combat |
| 016 | Per-run Jianghu encounter modifiers rolled at menu with renown and boss unlocks |

## Follow-Up Polish (post-016)

| PR | Summary |
| --- | --- |
| #8–#9 | Mobile HUD zones, hub scroll layout, compact loadout, enemy size parity |
| #10 | Scrollable mobile upgrade panel |
| #11 | Early-run weapon damage boost for minion one-shots |
| #12 | Minion ranged projectile scale fix |

## Verification

- `npm test` — 82 tests pass
- `npm run build` — succeeds
- Manual: see `docs/playtest-checklist.md`

## Remaining Backlog (Phase 6+)

- Full 30-minute playtest pass using the checklist
- Second balance pass from playtest notes (four build paths, mid/late pressure, boss TTK)
- Higher-resolution art assets and combat BGM
- Optional: CollectionScene / renown shop mobile polish, bundle code-split
