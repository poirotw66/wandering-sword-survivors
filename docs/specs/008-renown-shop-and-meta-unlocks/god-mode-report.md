# God Mode Report

## Status

Completed Phase 1 through Phase 4 for `008-renown-shop-and-meta-unlocks`.

## Decisions Made

- Implemented a compact menu shop instead of a separate scene.
- Added spendable renown while preserving lifetime total renown.
- Migrated old records by initializing spendable renown from lifetime total renown when no shop data exists.
- Replaced passive opening bonuses with purchased shop-level bonuses.
- Kept opening-style unlock rules based on existing total renown and Boss defeat history.
- Deferred refund/respec to a later spec.

## Fixed During Implementation

- Added `renownShop.ts` with upgrade config, cost rules, purchase helper, bonus calculation, and UI formatting helpers.
- Extended `RunRecord` with `spendableRenown` and `renownShopLevels`.
- Added `AchievementSystem.writeRecord` for immediate shop purchases.
- Updated `GameScene` to apply purchased shop bonuses and style mastery.
- Updated `MenuScene` to show and purchase shop rows.
- Updated `GameOverScene` to show run renown gained and available spendable renown.
- Added regression tests for migration, purchase rules, bonus calculation, and recommendation priority.

## Verification

- `npm test -- --run`: passed, 36 tests.
- `npm run build`: passed.
- Local Vite smoke check: HTTP 200 from `http://127.0.0.1:5173/`.

## Manual Testing Checklist

- Open menu and confirm spendable/lifetime renown appears.
- Confirm affordable shop rows are highlighted and clickable.
- Buy an upgrade and confirm the menu refreshes with reduced spendable renown.
- Start a run and confirm purchased bonuses apply.
- Finish a run and confirm spendable renown increases.

## Close

Closed in this pass.
