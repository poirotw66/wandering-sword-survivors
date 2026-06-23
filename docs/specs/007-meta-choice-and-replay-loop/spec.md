---
id: 007-meta-choice-and-replay-loop
title: Meta Choice and Replay Loop
status: done
owner: openab
created: 2026-06-23
updated: 2026-06-23
prd: prd-001-nightfall-survivors
---

# Meta Choice and Replay Loop Spec

## 1. Context

The game already has renown, titles, difficulty tiers, Boss legacy unlocks, martial codex records, and run settlement. These systems explain what the player has done, but the next run still needs a stronger pull: what should I unlock next, which style should I start with, and why should I try a harder difficulty?

This spec turns meta progression from a record display into a lightweight roguelite loop.

## 2. Goals

- Make finishing a run naturally point toward the next run.
- Add a renown shop display that shows earned and upcoming start bonuses.
- Add start-style choices for Sword Sect, Qi Sect, Footwork Path, and Wine Sword Path.
- Let Boss defeats and renown unlock new starting options.
- Reward high-difficulty progress with clearer challenge titles and goals.
- Show a concise next-run recommended objective on menu and settlement screens.

## 3. Scope

### 3.1 In Scope

- Meta choice data helpers:
  - Start style definitions and unlock rules.
  - Renown shop rows for start bonuses.
  - Next-run goal recommendation helper.
- Menu UX:
  - Compact start-style selector.
  - Renown shop summary.
  - Next-run goal line.
- Run start:
  - Pass chosen start style to `GameScene`.
  - Apply one build-path level as the run's opening stance.
  - Record the chosen style as the likely favorite build if no later build surpasses it.
- Settlement UX:
  - Show next-run recommendation after saving the run.
- Tests:
  - Start-style unlock rules.
  - Renown shop earned/upcoming rows.
  - Next-run recommendation priority.
  - Start-style bonus application.

### 3.2 Out of Scope

- Spendable currency deductions or refund flow.
- Full shop inventory screens.
- New characters.
- New Bosses or weapons.
- New generated art.
- Cloud saves.

## 4. Impact Analysis

### 4.1 UI

| Area | Change | Impact |
| --- | --- | --- |
| `MenuScene` | Add compact start-style choices and renown shop/goal text. | Players choose an opening route before a run. |
| `GameOverScene` | Add next-run recommendation. | Settlement points toward a concrete follow-up. |
| Existing codex | No structural change. | Codex remains collection-focused. |

### 4.2 Data

| Data | Change | Impact |
| --- | --- | --- |
| New meta choice helper | Defines start styles, shop rows, and next goals. | Rules become testable outside Phaser scenes. |
| `GameState` | Store selected start style. | Start route can influence run record. |
| i18n | Add menu/shop/goal/start-style labels. | Traditional Chinese default and English parity remain intact. |

### 4.3 Systems

| System | Change | Impact |
| --- | --- | --- |
| `GameScene` | Apply chosen opening style. | Runs start with an immediate build identity. |
| `AchievementSystem` | No storage migration required. | Existing `RunRecord` fields are enough for unlock logic. |
| Tests | Add pure helper tests. | Future balance tuning is safer. |

## 5. Functional Requirements

### 5.1 Renown Shop

- Menu must show a concise "renown shop" summary.
- Shop rows must show:
  - bonus name,
  - renown threshold,
  - earned or locked state.
- Existing passive bonuses remain:
  - HP +10 at 500 total renown,
  - Move speed +8 at 1500 total renown,
  - Pickup range +12 at 3000 total renown,
  - Reroll +1 at 5000 total renown.
- No renown spending is required in this phase.

### 5.2 Start Style Choice

- Menu must offer four start styles:
  - Sword Sect: always unlocked.
  - Qi Sect: unlocked by 1000 renown or defeating the first Boss tier.
  - Footwork Path: unlocked by 2500 renown or defeating the mid Boss tier.
  - Wine Sword Path: unlocked by 5000 renown or defeating the mega Boss tier.
- Locked styles should remain visible with a compact unlock clue.
- Starting a run with a style should apply that build path at level 1.
- If a previously selected style becomes locked due to save changes, the menu should fall back to Sword Sect.

### 5.3 Boss Unlocks and Challenge Rewards

- Boss defeat history may unlock start styles.
- Higher difficulties should be reflected in next-run goals.
- Difficulty 5 clear remains the main "jianghu mastered" milestone.
- This phase does not add new persistent reward fields; it uses existing title, difficulty, and record data.

### 5.4 Next-Run Recommendation

- Menu and settlement should show one recommended next target.
- Recommendation priority:
  1. Unlock the next start style.
  2. Clear the next difficulty tier.
  3. Discover remaining ultimate arts.
  4. Improve fastest clear or total renown.
- Recommendation text should be short enough for current screens.

## 6. UX Requirements

- Traditional Chinese remains the default tone.
- Start style choices should feel like choosing a martial route, not a settings panel.
- Menu should stay compact and readable on the existing first screen.
- Locked options should invite progress without feeling like an error.
- Settlement text should not crowd the existing run record.

## 7. Implementation Plan

### Task 1: Spec and Progress

- Add `docs/specs/007-meta-choice-and-replay-loop/spec.md`.
- Add `progress.md`.
- Update `specs-overview.md`.

### Task 2: Meta Choice Helpers

- Add `src/data/metaChoices.ts`.
- Define start style configs and unlock rules.
- Define renown shop row helpers.
- Define next-run recommendation helper.
- Define a start-style application helper.

### Task 3: Menu Start Choice

- Add selected start-style state to `MenuScene`.
- Render a compact style row.
- Show renown shop summary and next-run goal.
- Pass the selected style into `GameScene`.

### Task 4: Run Start Integration

- Extend `GameSceneData`.
- Add `startStyleId` to `GameState`.
- Apply the selected start style as an opening build-path level.
- Show a concise start-style toast.

### Task 5: Settlement Recommendation

- Show the next-run recommended goal in `GameOverScene`.
- Preserve existing restart flow.

### Task 6: Tests and Verification

- Add regression tests for helper behavior and state mutation.
- Run:
  - `npm test -- --run`
  - `npm run build`
- Smoke check:
  - Menu loads.
  - Style choice starts a run.
  - Settlement shows next goal.

## 8. Acceptance Criteria

- Menu shows renown shop information.
- Menu shows four start styles with locked/unlocked states.
- Choosing a start style applies its opening build bonus in a run.
- Boss defeats and renown can unlock start styles.
- Settlement and menu both show a next-run recommended target.
- Regression tests cover the new meta helper rules.
- `npm test -- --run` passes.
- `npm run build` passes.

## 9. Risks and Mitigations

- Risk: Menu becomes too crowded.
  - Mitigation: Use compact rows and one-line summaries.
- Risk: Start style bonuses overpower early runs.
  - Mitigation: Apply only one existing build-path level.
- Risk: Unlock logic becomes hard to understand.
  - Mitigation: Keep each locked option visible with one short clue.
- Risk: Future spendable shop conflicts with passive shop display.
  - Mitigation: Treat this phase as "renown shop tier display"; a later spec can add spend/refund.

## 10. Review Notes

God Mode decision: use current `RunRecord` data instead of adding a save migration. This keeps 007 focused on replay motivation and avoids destabilizing existing records.
