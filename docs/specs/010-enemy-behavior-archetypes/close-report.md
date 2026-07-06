# Close Report — 010 Enemy Behavior Archetypes

## Status

Closed.

## Delivered

- Four behavior archetypes: chaser, dasher, tank, ranger.
- All sixteen ordinary factions mapped in `minionBehaviors.ts`.
- Windup telegraphs for dash, block, and ranged shots.
- `EnemyProjectile` ranged attacks with player collision.
- Elite amplification for dash frequency, block duration, and ranger cooldown.

## Verification

- `npm test` — behavior mapping and elite amplification tests pass.
- `npm run build` — succeeds.

## Remaining Backlog

- Tune dash fairness vs player move speed after full playtest.
- Optional cast labels if telegraphs alone are unclear.
