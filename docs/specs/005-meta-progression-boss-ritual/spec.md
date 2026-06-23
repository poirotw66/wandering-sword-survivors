---
id: 005-meta-progression-boss-ritual
title: Meta Progression and Boss Ritual
status: done
owner: openab
created: 2026-06-23
updated: 2026-06-23
prd: prd-001-nightfall-survivors
---

# Meta Progression and Boss Ritual Spec

## 1. Context

The game now has a complete wuxia combat loop, ten martial evolution recipes, a Martial Codex, run records, total renown, difficulty selection, upgrade recommendation guidance, and one-run stat banish. The next step should make long-term progression feel more meaningful and make Boss victories feel like important jianghu milestones rather than only combat checkpoints.

This spec focuses on two linked goals:

- Outside a run, renown should unlock concrete starting advantages, titles, and higher difficulty stages.
- During and after Boss fights, players should see clearer martial inheritance moments, including what heart methods, routes, or records were advanced.

## 2. Goals

- Turn total renown into a clearer roguelite progression loop.
- Make starting bonuses feel chosen or earned, not only passively displayed.
- Make difficulty tiers feel distinct and worth pursuing.
- Add a stronger Boss defeat ritual that highlights heart-method inheritance and ultimate-art routes.
- Improve victory/game-over record presentation so each run feels like a martial chronicle.

## 3. Scope

### 3.1 In Scope

- Renown unlock presentation:
  - Show current title, next title threshold, and unlocked start bonuses.
  - Clarify which bonuses are active at run start.
  - Preserve existing localStorage record format with backward-compatible defaults.
- Starting bonus upgrades:
  - Life bonus path.
  - Movement speed bonus path.
  - Pickup range bonus path.
  - Extra reroll/upgrade-choice support.
  - Title unlock thresholds with visible names.
- Difficulty tier polish:
  - Display unlocked/locked tiers with conditions.
  - Show enemy health/speed and reward multipliers.
  - Show the selected difficulty multiplier in run result.
- Boss ritual:
  - On Boss defeat, show a short "Jianghu Legacy" panel or banner.
  - Display unlocked heart methods for that Boss.
  - Display related ultimate-art route hints when a new heart method unlocks.
  - Final Boss defeat should show a stronger victory transition.
- Record and collection polish:
  - Game Over/Victory screen shows selected difficulty, reward multiplier, unlocked legacy, and best/fastest records.
  - Martial Codex or record book can show title progression and Boss legacy progress.

### 3.2 Out of Scope

- New martial arts, new weapons, or new heart methods.
- New enemy families or full Boss AI redesign.
- Cloud save or account persistence.
- Full shop economy with spendable currency.
- Rebalancing every weapon or enemy wave.
- New generated art assets.

## 4. Impact Analysis

### 4.1 UI

| Area | Change | Impact |
| --- | --- | --- |
| `MenuScene` | Add clearer meta progression panel with title, renown thresholds, active bonuses, and difficulty details. | Players understand why total renown matters before starting a run. |
| `GameScene` | Trigger Boss ritual display after Boss defeat and stronger final victory transition. | Boss milestones feel more memorable. |
| `UIScene` | Render temporary legacy panel/banner. | Keeps Boss reward information visible without blocking normal flow too long. |
| `GameOverScene` | Add chronicle-style run summary for difficulty, multiplier, unlocked heart methods, and records. | Runs feel like recorded jianghu chapters. |
| `CollectionScene` | Optionally add title/Boss legacy progress details. | Collection becomes a long-term planning space. |

### 4.2 Data

| Data | Change | Impact |
| --- | --- | --- |
| `RunRecord` | May add best clear by difficulty, title progress, and Boss legacy seen markers if needed. | Must keep old saves loading with defaults. |
| `metaProgression` | Extend or clarify unlock thresholds and bonus labels. | Centralizes renown/title/difficulty logic. |
| `BOSS_SKILL_UNLOCKS` | Reuse existing helper for Boss ritual content. | Avoids duplicated Boss reward mapping. |
| `GameOverData` | Add fields for run legacy summary if not already available. | GameOverScene can show new chronicle details. |

### 4.3 Systems

| System | Change | Impact |
| --- | --- | --- |
| `AchievementSystem` | Record unlocked heart methods and difficulty records more explicitly. | Enables richer run summary and collection display. |
| `CollisionSystem` or Boss defeat path | Emit structured Boss legacy event after Boss defeat. | UI can render a ritual panel without scraping text. |
| `GameScene` | Aggregate run legacy data for final results. | Preserves result screen accuracy. |
| Tests | Add regression coverage for meta thresholds, difficulty unlocks, and Boss legacy mapping. | Protects roguelite progression rules. |

## 5. Functional Requirements

### 5.1 Renown and Title Progression

- Menu must show:
  - Total renown.
  - Current title.
  - Next title and required renown, if any.
  - Active starting bonuses.
- Existing bonuses remain valid:
  - Start HP +10.
  - Start move speed +8.
  - Start pickup range +12.
  - Initial extra reroll.
- Title thresholds should be data-driven and testable.
- If max title is reached, UI should show a completed state instead of a missing next threshold.

### 5.2 Difficulty Tiers

- Difficulty 1 remains always available.
- Difficulties 2-5 unlock through total renown and/or highest cleared difficulty.
- Difficulty cards/buttons must show:
  - Reward multiplier.
  - Enemy health multiplier.
  - Enemy speed multiplier.
  - Unlock condition when locked.
- Run result must show:
  - Selected difficulty.
  - Reward multiplier used.
  - Whether a new highest difficulty was achieved.

### 5.3 Boss Defeat Ritual

- When a Boss is defeated, show a compact legacy panel/banner.
- The panel must include:
  - Boss name.
  - Newly unlocked heart methods, if any.
  - Related ultimate-art route hints, if any.
  - Renown/experience reward feedback.
- If no new heart method is unlocked, show a meaningful record/renown message.
- The ritual must not permanently pause the game unless it is final victory.
- Final Boss defeat should transition into a victory chronicle state.

### 5.4 Game Over and Victory Chronicle

- Result screen must show:
  - Survival time.
  - Defeats/kills.
  - Renown earned.
  - Total renown after run.
  - Selected difficulty and reward multiplier.
  - Unlocked heart methods this run.
  - Ultimate arts mastered this run.
  - Best/fastest record changes.
- Victory copy should feel like a wuxia chronicle, not a generic score screen.

### 5.5 Persistence

- Old localStorage records must still load.
- Missing new record fields must default safely.
- No migration prompt is required.

## 6. UX Requirements

- Keep meta progression readable and compact on the menu; avoid turning the menu into a separate management game.
- Boss ritual should be brief, high contrast, and readable during action.
- Use Traditional Chinese as the default copy tone; preserve English locale parity.
- Avoid overlapping HUD elements with Boss bar, Boss warning, or upgrade panel.
- Use existing icon system where possible.

## 7. Implementation Plan

### Task 1: Meta Progression Data Helpers

- Refine or extend `metaProgression` helpers for:
  - Current title.
  - Next title threshold.
  - Active bonuses.
  - Difficulty unlock state.
  - Difficulty multiplier display data.
- Add regression tests for thresholds and locked/unlocked difficulty states.

### Task 2: Menu Meta Progression UI

- Add a compact progression panel to `MenuScene`.
- Show title, total renown, next threshold, active bonuses, and difficulty details.
- Keep language toggle and start flow intact.

### Task 3: Boss Legacy Event and Ritual UI

- Emit structured Boss legacy data when Boss defeat rewards are applied.
- Add UI rendering for Boss legacy panel/banner.
- Include Boss name, unlocked heart methods, related ultimate-art hints, and reward feedback.

### Task 4: Victory and Game Over Chronicle

- Extend `GameOverData` if needed.
- Update `GameOverScene` to show difficulty multiplier, unlocked legacy, mastered ultimate arts, and record changes.
- Keep restart/menu navigation unchanged.

### Task 5: Collection/Record Polish

- Add title progression or Boss legacy summary to the collection/record area if layout remains readable.
- Reuse codex detail helpers where possible.

### Task 6: Tests and Verification

- Add regression tests for:
  - Renown title thresholds.
  - Difficulty unlock conditions.
  - Boss legacy mapping.
  - Old record fallback defaults.
  - Locale key parity.
- Run:
  - `npm test -- --run`
  - `npm run build`
- Preview:
  - Menu meta panel.
  - Boss ritual after dev-spawned Boss.
  - Victory/Game Over chronicle.

## 8. Acceptance Criteria

- Menu clearly communicates current title, next title, total renown, active bonuses, and difficulty multipliers.
- Difficulty tiers 2-5 show locked/unlocked state and multiplier details.
- Boss defeat shows a wuxia-style legacy ritual with unlocked heart methods or meaningful fallback text.
- Victory/Game Over screen shows chronicle-style results with difficulty, multiplier, record, and legacy information.
- Existing saves continue loading.
- Traditional Chinese remains default and English remains available.
- `npm test -- --run` passes.
- `npm run build` passes.

## 9. Risks and Mitigations

- Risk: Menu becomes visually crowded.
  - Mitigation: Keep meta progression as a compact panel and avoid separate shop UI in this spec.
- Risk: Boss ritual blocks action or hides danger.
  - Mitigation: Use a short banner/panel and do not pause combat except final victory.
- Risk: Save data shape changes break older records.
  - Mitigation: Keep defaults in `readRecord` and add regression tests.
- Risk: Difficulty multipliers feel unclear or unbalanced.
  - Mitigation: Start with display clarity and light data tuning only; defer full balance pass.

## 10. Review Notes

This spec is a draft. Review should confirm whether meta progression remains passive unlocks or becomes a spendable renown shop in a later spec.
