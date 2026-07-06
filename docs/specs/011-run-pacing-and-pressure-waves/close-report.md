# Close Report — 011 Run Pacing and Pressure Waves

## Status

Closed.

## Delivered

- `runPacing.ts` helpers for pressure waves, respite, segment themes, and enemy cap.
- Five-minute pressure wave announcements and spawn modifiers.
- Post-Boss respite with exp bonus toast.
- Segment-themed faction spawn weighting (0–10 / 10–20 / 20–30 min).
- 120 ordinary minion on-screen cap.

## Verification

- `npm test` — pacing overlay and cap tests pass.
- `npm run build` — succeeds.

## Remaining Backlog

- Tune wave intensity after 30-minute playtest.
