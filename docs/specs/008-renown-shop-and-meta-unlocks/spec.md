---
id: 008-renown-shop-and-meta-unlocks
title: Renown Shop and Meta Unlocks
status: done
owner: openab
created: 2026-06-23
updated: 2026-06-23
prd: prd-001-nightfall-survivors
---

# Renown Shop and Meta Unlocks Spec

## 1. Context

The current meta loop has total renown, titles, difficulty unlocks, opening style choices, and a renown shop summary. However, the shop is still a passive milestone display: players earn total renown and bonuses appear automatically.

This spec turns renown into an active spendable resource. Players should choose which permanent start bonuses to buy or upgrade, making the end of each run feel like a real roguelite progression step.

## 2. Goals

- Add spendable renown separate from lifetime total renown.
- Convert the current passive shop into purchasable and upgradeable meta bonuses.
- Let players decide which opening advantages to invest in.
- Preserve existing records, titles, difficulty unlocks, and collection data.
- Keep the first implementation compact enough for the existing menu.

## 3. Scope

### 3.1 In Scope

- Save data migration:
  - Add spendable renown.
  - Add purchased upgrade levels.
  - Preserve old saves without data loss.
- Renown shop data model:
  - Define upgrade IDs, max levels, costs, and effects.
  - Support level-based cost curves.
  - Provide pure helpers for affordability and applying purchases.
- Purchasable upgrades:
  - Opening HP.
  - Opening move speed.
  - Opening pickup range.
  - Opening reroll count.
  - Opening seal/banish charge.
  - Opening style mastery bonus.
- Menu shop UX:
  - Show spendable renown.
  - Show upgrade level, next cost, and current effect.
  - Add purchase button behavior.
  - Disable locked or unaffordable purchases.
- Settlement UX:
  - Show renown gained this run.
  - Show spendable renown after settlement.
  - Keep next-run recommendation aware of affordable upgrades.
- Tests:
  - Save migration.
  - Cost and max level rules.
  - Purchase success/failure.
  - Bonus calculation from purchased levels.
  - Settlement adds spendable renown.

### 3.2 Out of Scope

- Real-money currency.
- Cloud sync.
- Full separate shop scene with tabs.
- Refund/respec in the first pass.
- New art assets.
- New combat skills or enemies.

## 4. Impact Analysis

### 4.1 UI

| Area | Change | Impact |
| --- | --- | --- |
| `MenuScene` meta panel | Show spendable renown and compact purchase rows. | Players can spend renown before starting a run. |
| `GameOverScene` | Show gained and available spendable renown. | Settlement becomes a bridge to the next run. |
| Existing opening style row | May show style-linked shop upgrade state. | Opening choices feel connected to meta progression. |

### 4.2 Data

| Data | Change | Impact |
| --- | --- | --- |
| `RunRecord` | Add `spendableRenown` and `renownShopLevels`. | Enables active purchases while preserving lifetime totals. |
| `metaChoices.ts` or new `renownShop.ts` | Add shop config and helper functions. | Shop logic becomes testable. |
| `metaProgression.ts` | Read purchased levels for meta bonuses. | Passive thresholds should be replaced or bridged. |

### 4.3 Systems

| System | Change | Impact |
| --- | --- | --- |
| `AchievementSystem.saveRun` | Add score to spendable renown as well as total renown. | Runs feed the shop economy. |
| `GameScene.applyMetaBonuses` | Use purchased shop levels instead of only total renown thresholds. | Opening stats reflect player choices. |
| Tests | Add persistence and economy rules. | Prevents save/currency regressions. |

## 5. Functional Requirements

### 5.1 Spendable Renown

- `totalRenown` remains lifetime earned renown.
- Add `spendableRenown` as current currency.
- On run settlement, add run score to both:
  - `totalRenown`
  - `spendableRenown`
- Existing saves without `spendableRenown` should initialize it safely:
  - MVP migration: set `spendableRenown` to `totalRenown` if no shop purchases exist.
  - If future purchase records exist, never overwrite spendable balance.

### 5.2 Shop Upgrade Model

Each upgrade must define:

- `id`
- display title/body
- max level
- cost per next level
- effect per level
- optional unlock requirement

Initial upgrades:

| Upgrade | Max | Effect |
| --- | --- | --- |
| Opening HP | 5 | +8 max HP per level |
| Opening speed | 5 | +5 move speed per level |
| Opening pickup | 5 | +8 pickup range per level |
| Opening reroll | 3 | +1 reroll at each level |
| Opening seal order | 2 | +1 banish charge per level |
| Style mastery | 4 | Selected opening style starts with a small extra identity bonus |

### 5.3 Purchase Rules

- Purchase succeeds only when:
  - upgrade is unlocked,
  - current level is below max,
  - spendable renown is enough for the next cost.
- On purchase:
  - subtract cost from `spendableRenown`,
  - increment the upgrade level,
  - persist immediately.
- Purchase should be idempotent per click/tap and not double-spend.

### 5.4 Bonus Calculation

- Opening bonuses should be derived from purchased levels.
- Existing passive total-renown bonus display should be replaced by purchased shop effects.
- Titles and difficulty unlocks should continue using lifetime `totalRenown`.
- Opening style choices remain unlocked through existing renown/Boss rules.

### 5.5 Next-Run Recommendation

- Recommendation priority becomes:
  1. Buy an affordable shop upgrade.
  2. Unlock the next opening style.
  3. Clear the next difficulty tier.
  4. Discover remaining ultimate arts.
  5. Improve fastest clear or higher renown.

## 6. UX Requirements

- The shop must clearly distinguish lifetime renown from spendable renown.
- Each row should show current level and next cost.
- Maxed upgrades should show a completed state.
- Unaffordable upgrades should still show their next cost.
- Purchase feedback should be immediate and short.
- Menu must remain readable at the current desktop viewport.

## 7. Implementation Plan

### Task 1: Shop Data Helpers

- Add `src/data/renownShop.ts`.
- Define shop upgrade configs.
- Add helpers:
  - `renownShopState(record)`
  - `canPurchaseRenownUpgrade(record, upgradeId)`
  - `purchaseRenownUpgrade(record, upgradeId)`
  - `metaBonusesFromShop(record)`
  - `nextAffordableRenownUpgrade(record)`

### Task 2: Save Migration

- Extend `RunRecord` with:
  - `spendableRenown`
  - `renownShopLevels`
- Update `AchievementSystem.readRecord`.
- Update `AchievementSystem.saveRun`.
- Add tests for old-save migration.

### Task 3: Replace Passive Bonus Calculation

- Update `metaBonusesFor` or add a record-aware replacement.
- Keep title progress using lifetime total renown.
- Update `GameScene.applyMetaBonuses`.

### Task 4: Menu Shop UX

- Replace passive shop summary with compact purchasable rows.
- Show spendable renown.
- Add purchase interaction.
- Restart or refresh menu after purchase.

### Task 5: Settlement UX

- Show run renown gained and spendable renown.
- Update next-run recommendation to prefer affordable purchases.

### Task 6: Tests and Verification

- Add regression tests for:
  - old save migration,
  - run settlement spendable renown gain,
  - purchase cost and level rules,
  - max-level blocking,
  - meta bonus calculation from shop levels,
  - next-run goal prioritizing affordable upgrade.
- Run:
  - `npm test -- --run`
  - `npm run build`

## 8. Acceptance Criteria

- Players can spend renown on persistent shop upgrades.
- Shop upgrades persist across sessions.
- Run settlement increases spendable renown.
- Lifetime total renown still powers titles and difficulty unlocks.
- Opening bonuses come from purchased shop levels.
- Old saves continue working.
- Tests cover migration, purchase rules, and bonus calculation.
- `npm test -- --run` passes.
- `npm run build` passes.

## 9. Risks and Mitigations

- Risk: Existing players get too much free currency on migration.
  - Mitigation: For MVP, this is acceptable because the game is in development; later balancing can add migration versioning.
- Risk: Menu becomes too crowded.
  - Mitigation: Keep only compact rows in this spec; a full shop scene can be a later spec.
- Risk: Confusion between lifetime and spendable renown.
  - Mitigation: Label both separately.
- Risk: Shop bonuses stack too strongly with opening style bonuses.
  - Mitigation: Start with small per-level values and test early run feel.

## 10. Review Notes

Recommended next implementation path: run Vif God on this spec, then immediately playtest early difficulty 1 and 2 to tune first-upgrade costs.

## 11. Implementation Notes

- Implemented as a compact menu shop rather than a separate shop scene.
- Added `src/data/renownShop.ts` for upgrade config, purchase rules, bonus calculation, and display helpers.
- Added `spendableRenown` and `renownShopLevels` to saved records with old-save migration.
- Opening bonuses now come from purchased shop levels.
- Lifetime `totalRenown` still drives titles, difficulty unlocks, and opening-style unlock rules.
