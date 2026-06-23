# Verification Report

## Commands

- `npm test -- --run`: passed, 36 tests.
- `npm run build`: passed.
- Local Vite smoke check: HTTP 200 from `http://127.0.0.1:5173/`.

## Coverage Added

- Old-record migration to `spendableRenown` and `renownShopLevels`.
- Run settlement adds score to spendable renown.
- Purchase success, unaffordable, and max-level failure paths.
- Meta bonus calculation from purchased shop levels.
- Next-run goal prioritizes affordable shop purchases.
- Shop config cost curves are valid.

## Notes

- Build completed with the existing Vite chunk-size warning.
