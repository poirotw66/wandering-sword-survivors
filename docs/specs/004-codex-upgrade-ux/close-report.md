# Close Report

## Status

Closed `004-codex-upgrade-ux`.

## Completed

- Martial Codex recipe detail.
- Boss Codex unlock detail.
- Upgrade recommendation markers and reasons.
- One current-run stat banish/seal charge.
- Reroll behavior respecting banished options.
- Regression coverage for codex helpers, recommendation, banish, and locale parity.

## Verification

- `npm test -- --run`: passed, 19 tests.
- `npm run build`: passed.
- Local Vite smoke check: HTTP 200 from `http://127.0.0.1:5173/`.

## Handoff

Next spec opened as `005-meta-progression-boss-ritual`.
