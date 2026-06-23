# Close Report

## Status

Closed `008-renown-shop-and-meta-unlocks`.

## Delivered

- Spendable renown currency.
- Purchasable permanent meta upgrades.
- Save migration for old records.
- Purchased opening bonuses for HP, speed, pickup range, rerolls, seal charges, and style mastery.
- Compact shop rows on the menu.
- Settlement display for gained and available renown.
- Next-run recommendations that prefer affordable shop purchases.

## Verification

- `npm test -- --run`: passed, 36 tests.
- `npm run build`: passed.
- Local Vite smoke check: HTTP 200 from `http://127.0.0.1:5173/`.

## Remaining Backlog

- Tune shop costs after playtesting.
- Add refund/respec.
- Consider a dedicated meta progression/shop scene.
