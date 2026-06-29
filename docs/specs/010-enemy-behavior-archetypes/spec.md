---
id: 010-enemy-behavior-archetypes
title: Enemy Behavior Archetypes
status: in_progress
owner: openab
created: 2026-06-29
updated: 2026-06-29
prd: prd-001-nightfall-survivors
---

# Enemy Behavior Archetypes Spec

## 1. Context

The game now has sixteen ordinary wuxia enemy factions, distinct sprites for most factions, Boss skill profiles, elite traits, and a thirty-minute spawn timeline. Ordinary enemies still share one combat behavior: chase the player with `physics.moveToObject` every frame. Stats, tint, and sprite differ, but moment-to-moment play still feels like one enemy type repeated at different speeds.

Spec `009-boss-and-enemy-visual-identity` improved readability through art. The next high-value step is behavioral identity: players should recognize threat types by how enemies move and attack, not only by color or portrait.

This spec introduces a small set of reusable minion behavior archetypes and maps every ordinary enemy to one of them. It does not add new enemy families, new Boss skills, or full animation.

## 2. Goals

- Give ordinary enemies four readable behavior archetypes: chaser, dasher, tank, ranger.
- Map all sixteen ordinary enemies to an archetype in data.
- Keep behavior config pure, testable, and separate from Phaser scene code where practical.
- Add lightweight telegraphs for dash and ranged attacks so players can react.
- Preserve current Boss combat, spawn schedule, elite spawn rate, and difficulty scaling.
- Improve play variety without increasing UI clutter.

## 3. Current State

### 3.1 Ordinary Enemy AI

- `EnemySystem.update()` calls `physics.moveToObject(enemy, player, speed)` for every active non-dashing enemy.
- Boss-only logic handles dash, fan strike, summon, and final phase.
- `EnemyConfig` stores stats and visuals only; there is no `behavior` field.
- Elite enemies differ through multipliers and tint in `eliteTraits.ts`, not movement logic.

### 3.2 Existing Building Blocks

- Boss dash already uses windup, warning rectangle, and temporary velocity override.
- `Projectile` supports generic texture, tint, velocity, and lifetime.
- `CollisionSystem` already resolves player damage from enemy contact.
- Dev mode (`?dev=1`) can spawn Bosses and advance time for manual verification.

### 3.3 Content Baseline

| Category | Count | Notes |
| --- | --- | --- |
| Ordinary enemies | 16 | All faction archetypes from `enemies.ts` |
| Bosses | 5 tiers + schedule | Unchanged in this spec |
| Elite chance | 2% to 14% over run | Unchanged in this spec |

## 4. Scope

### 4.1 In Scope

- Behavior data model:
  - Add `behaviorArchetype` to ordinary `EnemyConfig`.
  - Add `src/data/minionBehaviors.ts` with archetype definitions and per-enemy mapping helpers.
- Four ordinary enemy archetypes:
  - **Chaser**: direct pursuit, current default behavior.
  - **Dasher**: periodic short lunge toward player after brief windup.
  - **Tank**: slower pursuit, brief stop-and-plant before resuming chase.
  - **Ranger**: maintain preferred distance and fire a slow projectile on cooldown.
- Minion combat effects:
  - Reuse or extend `Projectile` for enemy ranged attacks.
  - Add enemy-contact damage rules unchanged.
  - Add short-lived telegraphs for dash and ranged windup.
- Elite behavior amplification:
  - Elite dasher: shorter cooldown or slightly longer lunge.
  - Elite ranger: shorter cooldown only.
  - Elite tank/chaser: no new mechanics beyond existing multipliers.
- System integration:
  - Refactor `EnemySystem` to route ordinary enemies through archetype handlers.
  - Keep Boss skill path isolated from minion behavior path.
- Tests:
  - Every ordinary enemy maps to a valid archetype.
  - Archetype config values are positive and within bounds.
  - At least one behavior helper test per archetype.
- Documentation:
  - Update `docs/game-content.md` enemy section with behavior archetypes.
  - Update `docs/specs/specs-overview.md` when implementation starts.

### 4.2 Out of Scope

- New enemy families or new Boss skills.
- Full animation sheets or attack combo trees.
- Complex pathfinding, obstacle avoidance, or flocking AI.
- Enemy count cap, spatial grid, or performance refactor (separate future spec).
- New generated art unless needed for a dedicated enemy projectile texture.
- Large combat balance pass beyond archetype tuning ranges defined here.
- Player-facing behavior tutorial UI.

## 5. Behavior Design

### 5.1 Archetype Summary

| Archetype | Player read | Core loop | Primary threat |
| --- | --- | --- | --- |
| Chaser | "Swarm pressure" | Always chase | Contact damage + numbers |
| Dasher | "Sudden lunges" | Chase, windup, dash, recover | Burst contact threat |
| Tank | "Heavy blockers" | Slow chase, brief plant | Body-blocks space |
| Ranger | "Keep your distance" | Kite band, periodic shot | Ranged chip damage |

### 5.2 Archetype Parameters

Each archetype config should define:

| Field | Chaser | Dasher | Tank | Ranger |
| --- | --- | --- | --- | --- |
| `cooldownMs` | n/a | 2200–3200 | n/a | 2800–4200 |
| `windupMs` | n/a | 320–480 | 500–800 plant | 400–600 |
| `actionMs` | n/a | 420–560 dash | 400–700 plant hold | projectile lifetime |
| `range` | n/a | 180–260 lunge distance feel | n/a | 260–340 preferred shot range |
| `projectileSpeed` | n/a | n/a | n/a | 180–240 |
| `speedMultiplier` | 1.0 | 1.0 chase / 2.2 dash | 0.78–0.9 | 0.92–1.0 |
| `telegraphColor` | n/a | faction tint | subtle ring | faction tint |

Exact numbers are tuning targets, not hard requirements for review. Implementation must centralize them in config helpers.

### 5.3 Enemy-to-Archetype Mapping

| Enemy id | Name (zh-TW) | Archetype | Flavor note |
| --- | --- | --- | --- |
| `slime` | 青城弟子 | chaser | Basic swarm unit |
| `huashanSwordsman` | 華山劍徒 | chaser | Standard sword pressure |
| `beggarSect` | 丐幫弟子 | chaser | Mobile stick fighter |
| `bat` | 魔教刺客 | dasher | Assassin lunge identity |
| `riverBandit` | 江湖水匪 | dasher | Aggressive raider rush |
| `northernRider` | 塞北馬賊 | dasher | Fast mounted charge feel |
| `sunMoonCultist` | 日月教眾 | dasher | Cultist pounce |
| `golem` | 嵩山高手 | tank | Heavy brawler |
| `taishanAcolyte` | 泰山門徒 | tank | Armored temple guard |
| `shaolinMonk` | 少林武僧 | tank | Rooted martial body |
| `hengshanNun` | 恆山持戒尼 | tank | Staff guard anchor |
| `royalGuard` | 錦衣衛士 | tank | Late-game elite blocker |
| `medicineHeretic` | 藥谷邪醫 | ranger | Poison bottle toss |
| `emeiDisciple` | 峨眉劍姬 | ranger | Needle projectile |
| `poisonMaster` | 五毒教徒 | ranger | Venom flask shot |
| `wudangMonk` | 武當道士 | ranger | Soft qi bolt at range |

Boss ids must not receive ordinary archetype behavior.

### 5.4 Elite Amplification Rules

| Archetype | Elite change |
| --- | --- |
| chaser | no behavior change |
| dasher | cooldown × 0.82 |
| tank | plant duration × 1.12 |
| ranger | cooldown × 0.85 |

Elite label, tint, HP multiplier, and scale rules from `eliteTraits.ts` remain unchanged.

## 6. Functional Requirements

### 6.1 Data Model

- Add `EnemyBehaviorArchetype = "chaser" | "dasher" | "tank" | "ranger"`.
- Add `behaviorArchetype` to ordinary `EnemyConfig`.
- Boss configs must omit `behaviorArchetype` or ignore it if present.
- Add `minionBehaviors.ts` with:
  - `minionBehaviorFor(enemyId)`
  - `archetypeConfigFor(archetype, elite: boolean)`
  - `ordinaryEnemyBehaviorMap()` for tests

### 6.2 Chaser Behavior

- Uses current direct pursuit.
- No windup or special telegraph.
- Must remain the default fallback if mapping is missing.

### 6.3 Dasher Behavior

- While outside dash recovery:
  - chase player at normal configured speed.
- On cooldown:
  - freeze movement briefly.
  - show a short line or wedge telegraph toward player.
  - after `windupMs`, apply burst velocity toward player for `actionMs`.
  - then return to chase and start cooldown.
- Dash must not chain back-to-back without cooldown.
- Dash damage uses existing contact damage rules only; no separate hitbox expansion.

### 6.4 Tank Behavior

- Move toward player at `moveSpeed * speedMultiplier`.
- Every `cooldownMs`, enter plant state for `windupMs + actionMs`:
  - velocity set to zero.
  - show a subtle ground ring telegraph.
  - resume chase afterward.
- Tank plant is a positioning threat, not a ranged attack.

### 6.5 Ranger Behavior

- If distance to player is below `range * 0.72`, move away slightly or strafe outward.
- If distance is above `range * 1.08`, move inward.
- If within preferred band and cooldown ready:
  - brief windup telegraph.
  - spawn one enemy projectile toward player.
- Projectile rules:
  - speed from archetype config.
  - damage = `enemy.config.damage * projectileDamageMultiplier` (default 0.55–0.7).
  - despawn on first player hit or timeout.
  - must not pierce.
  - use existing `bolt` texture or a small faction-tinted fallback texture.
- Rangers must not fire while inactive, off-screen despawned, or during Boss-only states.

### 6.6 Telegraph Rules

- Minion telegraphs must be:
  - shorter and smaller than Boss telegraphs.
  - faction-tinted where possible.
  - destroyed automatically after cast.
- Telegraphs must not obscure Boss telegraphs or upgrade UI.
- No cast label text above ordinary enemies unless playtest shows confusion; prefer shape-only feedback first.

### 6.7 Collision and Damage

- Contact damage remains in `CollisionSystem`.
- Enemy projectile damage routes through the same player damage event path as other hits.
- Enemy projectiles must not damage other enemies.
- Player i-frames / dodge rules remain unchanged.

## 7. Impact Analysis

### 7.1 Data

| File | Change | Impact |
| --- | --- | --- |
| `src/data/enemies.ts` | add `behaviorArchetype` | Designers can read threat type per faction |
| `src/data/minionBehaviors.ts` | new | Central behavior tuning |
| `src/data/eliteTraits.ts` | optional helper only | Elite amplification stays data-driven |
| `test/regression.test.ts` | new behavior coverage | Prevents unmapped enemies |

### 7.2 Systems

| System | Change | Impact |
| --- | --- | --- |
| `EnemySystem` | split ordinary update path | Main implementation surface |
| `CollisionSystem` | enemy projectile vs player overlap | Ranged archetype becomes real |
| `Projectile` or new `EnemyProjectile` | enemy-owned projectile pool | Must avoid weapon pierce semantics |
| `SpawnSystem` | no schedule change | Behavior attaches at spawn only |
| `UIScene` | no required change | Avoid extra HUD clutter |

### 7.3 UX

- Players can identify threat type within one to two seconds of engagement.
- Early waves remain approachable: chasers and a few dashers first.
- Late waves feel denser because rangers and tanks shape space, not only because stats scale.

## 8. UX Requirements

- Behavior feedback must be readable in dense waves on desktop viewport.
- Traditional Chinese remains default; no new user-facing strings required for MVP behavior pass.
- If technique labels are added for minions later, they must stay optional and off by default.
- Dev mode must remain sufficient to validate each archetype quickly.

## 9. Implementation Plan

### Task 1: Behavior Config

- Add `EnemyBehaviorArchetype` and `behaviorArchetype` to `EnemyConfig`.
- Create `src/data/minionBehaviors.ts`.
- Map all sixteen ordinary enemies.
- Add regression tests for complete mapping and positive config values.

### Task 2: EnemySystem Refactor

- Extract `updateOrdinaryBehavior(enemy)` from `update()`.
- Keep Boss branch unchanged.
- Store per-enemy timers in `WeakMap` instances similar to Boss cooldown maps.

### Task 3: Dasher and Tank Actions

- Implement dash windup, velocity burst, and recovery.
- Implement tank plant ring and hold state.
- Add short telegraph helpers with shared destroy timing.

### Task 4: Ranger Projectiles

- Add enemy projectile pool or dedicated lightweight sprite group.
- Hook ranged cooldown, preferred distance, and player collision.
- Emit `player-damaged` through existing damage path.

### Task 5: Elite Amplification

- Apply elite cooldown/plant modifiers from config helper.
- Verify elite tint and labels still render correctly during action states.

### Task 6: Docs and Verification

- Update `docs/game-content.md`.
- Run `npm test -- --run`.
- Run `npm run build`.
- Manual dev checklist:
  - spawn each archetype via wave timing or dev spawn helper if added,
  - verify dash telegraph and lunge,
  - verify tank plant pause,
  - verify ranger projectile and preferred distance,
  - confirm Boss behavior unchanged.

## 10. Acceptance Criteria

- All sixteen ordinary enemies have a configured `behaviorArchetype`.
- Ordinary enemies no longer all use identical chase-only logic.
- Four archetypes are implemented: chaser, dasher, tank, ranger.
- Dash and ranged attacks show brief telegraphs before resolving.
- Enemy projectiles damage the player and do not damage enemies.
- Boss skills, spawn schedule, and elite spawn chance remain unchanged unless explicitly tuned in config comments.
- Regression tests cover behavior mapping and archetype config validity.
- `npm test -- --run` passes.
- `npm run build` passes.

## 11. Test Plan

### 11.1 Automated

- `ordinaryEnemyBehaviorMap()` returns sixteen unique enemy ids.
- every ordinary enemy has a supported archetype.
- dasher/ranger/tank configs have positive `cooldownMs`, `windupMs`, and `actionMs`.
- boss ids are excluded from ordinary behavior map.
- optional pure helper tests for elite cooldown modifiers.

### 11.2 Manual

| Check | Expected |
| --- | --- |
| 0:00–2:00 early wave | mostly chasers, readable swarm |
| bat / northern rider encounter | visible lunge telegraph before contact |
| shaolin / golem encounter | slower movement and brief plant |
| medicine heretic / emei encounter | enemy keeps distance and shoots |
| Boss at 1:00 | Boss skills unchanged |
| elite dasher | noticeably more frequent lunges than normal |

## 12. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Screen becomes too noisy with minion telegraphs | Keep telegraphs smaller and shorter than Boss warnings |
| Rangers make early waves unfair | Assign ranger archetype to mid/late factions only |
| Enemy projectiles collide with player weapons confusingly | Separate collision group and simple circular hitbox |
| Refactor breaks Boss dash timing | Keep Boss logic in separate code path |
| Performance drops from many projectiles | Pool projectiles and cap simultaneous enemy projectiles per enemy |

## 13. Future Follow-Ups (Not in 010)

- `011-enemy-cap-and-spatial-optimization`
- `012-minion-animation-pass`
- `013-content-doc-sync` for README and outdated MVP copy

## 14. Review Notes

Recommended implementation order: config mapping and tests first, chaser/tank second, dasher third, ranger last. Ranger work touches collision and pooling, so it should land after the movement archetypes are stable.

Recommended first playtest focus: do dashers feel fair with current player speed, and do rangers create interesting spacing without forcing constant dodging in early waves?
