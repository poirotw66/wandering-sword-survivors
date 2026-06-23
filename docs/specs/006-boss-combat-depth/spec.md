---
id: 006-boss-combat-depth
title: Boss Combat Depth
status: implemented
owner: openab
created: 2026-06-23
updated: 2026-06-23
prd: prd-001-nightfall-survivors
---

# Boss Combat Depth Spec

## 1. Context

The game now has martial builds, ultimate-art evolution, codex planning, meta progression, difficulty tiers, and a Boss legacy ritual. Boss fights already have early skill behavior such as dash, fan strike, and summon, but the experience still needs stronger clarity and identity. The next step should make Boss encounters feel like named wuxia masters with readable techniques, danger windows, and distinct progression across difficulty and time.

This spec focuses on combat depth and telegraph quality. It does not add new martial arts, new meta systems, or new art generation.

## 2. Goals

- Make each Boss skill readable before it hits.
- Make Bosses feel different from ordinary enemies and from each other.
- Give elite enemies clearer sect identity and combat behavior.
- Improve danger feedback through warning zones, cast labels, Boss bar status, and hit feedback.
- Keep Boss combat deterministic enough to test and tune.

## 3. Scope

### 3.1 In Scope

- Boss skill data model:
  - Centralize Boss skill cooldowns, windups, range, damage multiplier, and visual label keys.
  - Keep current skills: dash, fan strike, summon.
  - Add room for final Boss phase behavior without a full new AI system.
- Boss telegraphs:
  - Dash line warning should clearly show direction and charge timing.
  - Fan strike should show a readable wedge/arc danger zone before damage.
  - Summon should show a ritual pulse before minions appear.
  - Final Boss should show a stronger phase or enraged cue at low HP.
- Boss bar status:
  - Show current or upcoming Boss technique name near the Boss health bar.
  - Clear status after the cast window.
- Elite enemy polish:
  - Qingcheng disciples: faster surround pressure.
  - Songshan experts: slower, tougher, heavier hit feel.
  - Demonic cult assassins: faster approach and more threatening burst identity.
  - Existing elite labels remain visible.
- Dev/test support:
  - Keep dev mode Boss spawning usable for quick testing.
  - Add pure helper tests for Boss skill config and timing rules.
- Localization:
  - Add Traditional Chinese default labels for techniques.
  - Preserve English locale parity.

### 3.2 Out of Scope

- New Boss entities or new map arenas.
- New weapons, heart methods, or ultimate arts.
- Complex pathfinding or obstacle avoidance.
- Full animation sprite sheets.
- New generated art assets.
- Multiplayer or networked combat.

## 4. Impact Analysis

### 4.1 UI

| Area | Change | Impact |
| --- | --- | --- |
| `UIScene` Boss bar | Add technique/cast status text. | Players can read what the Boss is doing. |
| World telegraphs | Improve dash/fan/summon warning visuals. | Players can dodge intentionally instead of guessing. |
| Hit feedback | Add stronger camera or screen feedback for Boss technique hits. | Boss attacks feel weightier. |

### 4.2 Data

| Data | Change | Impact |
| --- | --- | --- |
| `EnemyConfig` | May add skill profile IDs or phase thresholds. | Boss behavior becomes data-driven. |
| New Boss skill config helper | Defines cooldown, windup, range, width, damage multiplier, and label key. | Rules become testable outside Phaser scenes. |
| i18n | Add technique names and Boss status strings. | Traditional Chinese/English parity remains protected. |

### 4.3 Systems

| System | Change | Impact |
| --- | --- | --- |
| `EnemySystem` | Use Boss skill config for timers, telegraphs, and effects. | Less hard-coded behavior and easier balancing. |
| `UIScene` | Listen for Boss technique events and show status. | Boss bar becomes more informative. |
| `CollisionSystem` | Existing damage flow remains mostly unchanged. | Boss direct skill hits may still call player damage events. |
| Tests | Add regression coverage for skill config and Boss profile mapping. | Prevents future tuning from breaking identity rules. |

## 5. Functional Requirements

### 5.1 Boss Skill Config

- Each Boss skill must define:
  - `id`
  - cooldown milliseconds
  - windup milliseconds
  - damage multiplier
  - visual label key
  - optional range/width/arc values
- Bosses must use a profile that lists available skills.
- Final Boss profile must include all core techniques and a low-HP phase cue.
- Config helpers should be pure and unit-testable.

### 5.2 Telegraphs and Damage Windows

- Dash:
  - Shows a long line in the dash direction during windup.
  - Dash velocity applies only after windup.
  - Emits Boss technique status while charging.
- Fan strike:
  - Shows multiple arcs or a single readable wedge before damage.
  - Damage is applied only after windup if player is inside the danger cone.
  - Emits Boss technique status while casting.
- Summon:
  - Shows a pulse circle during ritual windup.
  - Minions spawn after windup.
  - Final Boss summons elite minions.

### 5.3 Boss Bar Technique Status

- Boss bar should show technique name while a technique is preparing or resolving.
- Status should clear after the cast completes.
- Status must not overlap the Boss health label in common desktop viewports.

### 5.4 Elite Enemy Identity

- Elite Qingcheng, Songshan, and Demonic enemies should keep distinct multipliers and labels.
- Elite behavior differences should remain readable and not overwhelm early waves.
- Elite traits should be data-driven or documented in a helper.

### 5.5 Final Boss Phase Cue

- Final Boss should visibly enter an intensified state below a configured HP threshold.
- The phase cue may be:
  - tint/flash/pulse,
  - shorter cooldowns,
  - status label,
  - or a combination.
- The phase state should trigger once per final Boss instance.

## 6. UX Requirements

- Technique names should use wuxia-flavored Traditional Chinese by default.
- Warning zones must be visible against the current floor and combat effects.
- Warning zones should be brief but not unfair.
- Boss status text should be concise.
- Avoid adding persistent UI clutter.

## 7. Implementation Plan

### Task 1: Boss Skill Config Helpers

- Add `src/data/bossSkills.ts`.
- Define skill configs for dash, fan strike, summon, and final phase.
- Define Boss profiles by `EnemyId`.
- Add helper functions:
  - `bossSkillProfileFor(enemyId)`
  - `bossSkillConfig(skillId)`
  - `finalPhaseFor(enemyId)`

### Task 2: Refactor EnemySystem Boss Skills

- Replace hard-coded cooldown/windup values with config.
- Emit Boss technique status events:
  - `boss-technique-started`
  - `boss-technique-ended`
- Preserve current behavior while improving readability.

### Task 3: Improve Telegraph Visuals

- Dash line warning scales toward the player.
- Fan strike uses clearer cone/arc visuals.
- Summon ritual pulse is clearer and timed to spawn.
- Final Boss phase cue triggers under threshold.

### Task 4: Boss Bar Status UI

- Add technique status text to `UIScene` near Boss bar.
- Clear status after technique ends or Boss health reaches zero.
- Keep Boss health label readable.

### Task 5: Elite Trait Helper

- Document or extract elite trait multipliers.
- Add tests for elite multipliers by enemy family.
- Keep current labels and improve readability if needed.

### Task 6: Tests and Verification

- Add regression tests for:
  - Boss skill profile contents by Boss tier.
  - Skill cooldown/windup values are positive.
  - Final Boss has final phase config.
  - Elite trait multipliers are distinct.
  - Locale key parity.
- Run:
  - `npm test -- --run`
  - `npm run build`
- Preview:
  - Dev mode Boss spawn.
  - Boss bar technique status.
  - Dash/fan/summon telegraphs.

## 8. Acceptance Criteria

- Boss skills are driven by a config/helper instead of scattered magic values.
- Boss telegraphs are visibly clearer than the previous implementation.
- Boss bar shows the current technique name during casts.
- Final Boss has a visible phase cue.
- Elite family traits remain distinct and test-covered.
- Traditional Chinese remains default and English remains available.
- `npm test -- --run` passes.
- `npm run build` passes.

## 9. Risks and Mitigations

- Risk: Extra telegraphs make the screen too busy.
  - Mitigation: Keep effects short-lived and use restrained opacity.
- Risk: Boss fights become too easy if warnings are too long.
  - Mitigation: Keep windups tunable in config and verify dev mode quickly.
- Risk: Refactor changes existing Boss balance too much.
  - Mitigation: Preserve current approximate cooldowns and damage values first.
- Risk: Final Boss phase overlaps with other Boss events.
  - Mitigation: Track phase trigger per instance and clear status on defeat.

## 10. Review Notes

This spec is a draft. Review should confirm whether 006 should stay as a polish/refactor pass or also introduce a new final Boss exclusive attack.
