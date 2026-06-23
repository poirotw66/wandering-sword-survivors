---
id: 004-codex-upgrade-ux
title: Martial Codex and Upgrade UX Polish
status: done
owner: openab
created: 2026-06-23
updated: 2026-06-23
prd: prd-001-nightfall-survivors
---

# Martial Codex and Upgrade UX Polish Spec

## 1. Context

The game now has wuxia martial arts, ultimate-art evolution, generated icons, Boss unlocks, run records, a martial codex, total renown, difficulty selection, and one reroll bonus. The next improvement should make this information easier to understand during two key moments:

- Outside a run, players need a clear codex that shows what they have discovered, what is still hidden, and what routes they can pursue next.
- During level-up, players need clearer guidance on which upgrade choices move them toward an ultimate art or current build route.

This spec focuses on UI/UX clarity and light gameplay affordances. It does not add new weapons, new bosses, or a full balance pass.

## 2. Goals

- Make the Martial Codex useful as a planning tool, not only a collection screen.
- Show ultimate-art recipes in a way that helps players chase builds without spoiling everything too early.
- Make Boss codex entries explain which heart methods they can unlock.
- Improve upgrade choices with recommendation labels and stronger route explanations.
- Add a limited banish/seal option so players can suppress unwanted ordinary stat choices during a run.
- Keep the implementation small enough to preserve current game flow.

## 3. Scope

### 3.1 In Scope

- Martial Codex recipe detail:
  - Selecting or focusing an ultimate art shows its base weapon/form and required heart method.
  - Discovered ultimate arts show full recipe names.
  - Undiscovered ultimate arts show partial clues.
  - Ready or near-ready routes show clear status text.
- Boss Codex unlock detail:
  - Boss entries show which heart methods they can unlock.
  - Defeated Boss entries show complete names.
  - Undefeated Boss entries show thematic hints.
- Upgrade recommendation UX:
  - Upgrade cards can show a `recommended` marker.
  - Cards can show a short reason, such as "near ultimate art", "supports Sword Sect", or "completes recipe".
  - Existing recipe progress text remains visible.
- Banish/seal UX:
  - Player can banish one ordinary stat option category during a run.
  - Banish applies only to the current run.
  - Banish cannot hide evolution, weapon, skill, build, or standalone manual options.
  - Banish state is visible in the upgrade panel.
- Existing reroll UX polish:
  - Reroll button remains available when `state.rerolls > 0`.
  - Reroll should preserve banished categories.
  - Reroll should not consume/alter player stats or close the upgrade panel.
- Persistence and records:
  - Existing localStorage record remains backward compatible.
  - No migration screen is required.

### 3.2 Out of Scope

- New martial arts, new heart methods, or new ultimate arts.
- New generated art assets.
- Full keyboard/controller navigation for the codex.
- Mobile touch layout redesign.
- Cloud save or server-side persistence.
- Full rebalance of renown thresholds or difficulty multipliers.

## 4. Impact Analysis

### 4.1 UI

| Area | Change | Impact |
| --- | --- | --- |
| `CollectionScene` | Add selected-detail panel for ultimate arts and Boss entries. | Existing codex becomes more interactive and informative. |
| `UpgradePanel` | Add recommended marker, reason text, banish button/state, and clearer reroll placement. | Level-up choices become more readable. |
| `MenuScene` | No required structural change. | Existing entry to Martial Codex remains. |
| `GameOverScene` | No required structural change. | Existing record display remains. |

### 4.2 Data

| Data | Change | Impact |
| --- | --- | --- |
| `UpgradeOption` | Add optional `recommendedText?: string`, `recommendationReason?: string`, and `banishable?: boolean`. | Upgrade rendering can explain why a card is useful. |
| `GameState` | Add `banishedUpgradeIds` or `banishedKinds` for current-run banish state. | Upgrade pool filtering can respect banish. |
| `AchievementSystem.RunRecord` | No required schema change. | Codex can use existing `skillsSeen`, `evolvedArtsSeen`, `bossDefeatsSeen`. |
| `EVOLUTION_CONFIGS` | Reuse `baseWeaponId`, `requiredSkillId`, `preferredBuildPathId`. | No new recipe data needed. |
| `BOSS_SKILL_UNLOCKS` | May need export or helper accessor. | Boss codex can display unlocks without duplicating config. |

### 4.3 Systems

| System | Change | Impact |
| --- | --- | --- |
| `UpgradeSystem` | Filter banished stat options and expose banish action. | Upgrade pool stays focused for the current run. |
| `buildUpgradePool` | Annotate recommended cards based on near-route progress. | Existing weighted selection becomes visible to players. |
| `chooseUpgradeOptions` | Respect banished ordinary stats. | Prevents sealed stat options from returning after reroll. |
| `UIScene` | Relay banish/reroll/pick actions from `UpgradePanel` to `GameScene`. | Keeps GameScene as source of game-state mutation. |

## 5. Functional Requirements

### 5.1 Martial Codex Recipe Detail

- The codex must show a detail area when an ultimate-art entry is selected.
- For discovered ultimate arts:
  - Display full ultimate art name.
  - Display exact weapon/form requirement.
  - Display exact heart-method requirement.
  - Display preferred build path if present.
- For undiscovered ultimate arts:
  - Display ultimate-art name as hidden or partially hinted.
  - Display weapon/form clue.
  - Display heart-method clue only if the heart method has been seen or its Boss source has been defeated.
  - Display a short route hint, not a full tutorial paragraph.
- Detail content must fit at common desktop widths and must not overlap other codex rows.

### 5.2 Boss Codex Unlock Detail

- Boss entries must show unlockable heart methods.
- Defeated Bosses show exact heart method names.
- Undefeated Bosses show a hint such as "hidden heart method" or a thematic clue.
- Final Boss entry may show no heart-method unlocks but should still show record status.
- Boss codex must use the existing `BOSS_SKILL_UNLOCKS` mapping through an exported helper or public function.

### 5.3 Upgrade Recommendation Labels

- Upgrade cards can show:
  - `recommendedText`, e.g. "推薦".
  - `recommendationReason`, e.g. "距離獨孤絕學 7/8".
- Cards should be recommended when:
  - The option completes an ultimate-art recipe.
  - The option improves a route with progress score close to completion.
  - The option matches the preferred build path of the closest tracked route.
- At most two non-evolution cards should be marked recommended in one upgrade panel.
- Evolution cards are always visually higher priority and do not need the same recommendation cap.

### 5.4 Banish Ordinary Stat Options

- Each upgrade panel can expose a banish action only for ordinary stat choices.
- Banish removes the option id/category from the current run's future upgrade pools.
- Banish should not pick the card.
- Banish should immediately reroll the visible panel if possible.
- Player starts each run with one banish charge.
- Banish charges do not persist between runs.
- Banish should not apply to:
  - `weapon`
  - `skill`
  - `build`
  - `evolution`
  - `standaloneSkill`

### 5.5 Reroll Polish

- Reroll button must display remaining count.
- Reroll uses the same selection rules as normal upgrade opening.
- Reroll respects banished stat options.
- Reroll should refresh recommendation labels and reasons.
- Reroll should not close the upgrade panel.

## 6. UX Requirements

### 6.1 Upgrade Panel Layout

- Recommendation marker should be compact and near the card badge area.
- Recommendation reason should be short and readable at 12-13px.
- Banish action should not compete visually with picking the upgrade.
- Suggested banish UI:
  - A small seal button on stat cards.
  - Text: `封印` / `Seal`.
  - Disabled or hidden if no banish charges remain.
- Reroll action should stay below the cards and show remaining count.

### 6.2 Codex Layout

- Keep the first screen useful:
  - Records at top.
  - Martial sections below.
  - Detail panel should appear beside or below the selected item depending on width.
- Avoid modal-heavy navigation.
- Support mouse click/tap selection.
- Keyboard support is optional for this spec.

## 7. Implementation Plan

### Task 1: Add Codex Detail Helpers

- Add helper functions for:
  - `formatEvolutionRecipeDetail(record, evolutionId)`
  - `formatBossUnlockDetail(record, enemyId)`
- Export Boss unlock data through `AchievementSystem` or a data helper.
- Keep functions pure enough to test.

### Task 2: Upgrade `CollectionScene`

- Track selected codex item.
- Render selected ultimate-art recipe detail.
- Render selected Boss unlock detail.
- Preserve scroll behavior.
- Ensure locked items show clues instead of blank data.

### Task 3: Add Upgrade Recommendation Metadata

- Extend `UpgradeOption`.
- Annotate options in `buildUpgradePool` using `computeEvolutionProgress`.
- Cap recommendation count in selection/rendering path.
- Add i18n keys for recommendation labels/reasons.

### Task 4: Add Banish State and Actions

- Extend `GameState` with:
  - `banishedUpgradeIds: Set<string>`
  - `banishCharges: number`
- Initialize one banish charge per run.
- Filter banished ordinary stat options in upgrade pool or selection.
- Add `UpgradeSystem.banish(option)`.
- Wire `UpgradePanel -> UIScene -> GameScene -> UpgradeSystem`.

### Task 5: Reroll and Banish UI Polish

- Update `UpgradePanel.show` signature if needed.
- Add compact recommendation marker/reason rendering.
- Add stat-card seal button.
- Ensure pointer handling does not accidentally pick a card when sealing.
- Keep number-key picking behavior unchanged.

### Task 6: Tests and Verification

- Add regression tests for:
  - Codex recipe helper reveals full discovered recipe.
  - Codex recipe helper hides undiscovered heart method when appropriate.
  - Boss helper returns unlockable heart methods.
  - Recommended options appear for near-complete routes.
  - Banish removes ordinary stat options from future choices.
  - Reroll respects banished options.
  - Locale keys remain in sync.
- Run:
  - `npm test -- --run`
  - `npm run build`
- Preview:
  - Start local Vite server.
  - Confirm menu, codex, and upgrade panel still load.

## 8. Acceptance Criteria

- Martial Codex lets players inspect ultimate-art recipes or meaningful clues.
- Boss Codex shows which heart methods defeated Bosses unlock.
- Upgrade panel visibly recommends route-relevant choices.
- Ordinary stat options can be banished once per run.
- Banish does not remove non-stat options.
- Reroll keeps working and respects banish.
- Existing save records continue to load without errors.
- Traditional Chinese remains the default locale.
- English locale remains available.
- `npm test -- --run` passes.
- `npm run build` passes.

## 9. Risks and Mitigations

- Risk: Upgrade cards become visually crowded.
  - Mitigation: Keep recommendation text short and cap markers.
- Risk: Banish makes the pool too small.
  - Mitigation: Only one banish charge and fallback selection can still fill fewer than three options if the pool is exhausted.
- Risk: Codex detail panel overlaps at smaller widths.
  - Mitigation: Use responsive below-list detail layout under narrow widths.
- Risk: Recipe clues reveal too much.
  - Mitigation: Use record-based reveal rules and preserve thematic hints for undiscovered content.

## 10. God Mode Notes

This spec is approved for `$vif-god` implementation. Keep work scoped to codex detail, recommendation UX, banish, reroll polish, tests, and verification. Do not add new martial arts, new assets, or unrelated balance changes.
