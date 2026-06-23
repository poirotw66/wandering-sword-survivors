---
id: 009-boss-and-enemy-visual-identity
title: Boss and Enemy Visual Identity
status: approved
owner: openab
created: 2026-06-23
updated: 2026-06-23
prd: prd-001-nightfall-survivors
---

# Boss and Enemy Visual Identity Spec

## 1. Context

The game now has playable combat, martial evolution, Boss skills, meta progression, and a spendable renown shop. Ordinary enemies already use different sprite assets, but Bosses still share `boss-master.png` and rely on tint, size, stats, and skill profiles for identity.

This spec focuses on making enemies and Bosses visually readable as different jianghu threats.

## 2. Goals

- Give each Boss tier a distinct visual silhouette.
- Make ordinary enemy factions easier to distinguish at a glance.
- Improve elite enemy readability without adding UI clutter.
- Preserve current combat rules and Boss schedules.
- Prepare a clear asset pipeline for generated or hand-authored wuxia sprites.

## 3. Current State

### 3.1 Existing Enemy Assets

- `enemy-green.png`: Qingcheng-style disciple.
- `enemy-purple.png`: Demonic cult assassin.
- `enemy-red.png`: Songshan-style expert.
- Enemies also differ through HP, movement speed, radius, tint, score, and elite traits.

### 3.2 Existing Boss Assets

- All Boss tiers currently use `boss-master.png`.
- Boss identity differs through:
  - size/radius,
  - tint,
  - HP/damage/speed,
  - skill profile,
  - Boss bar name,
  - telegraph behavior.

## 4. Scope

### 4.1 In Scope

- Boss sprite identity:
  - Add unique sprite keys for:
    - Rival Sect Captain,
    - Renegade Master,
    - Grand Sword Elder,
    - Demonic Sect Overlord,
    - Eastern Invincible.
  - Keep fallback to `boss-master.png` if a unique asset is missing.
- Enemy faction polish:
  - Keep three base enemy families.
  - Add clearer tint/outline/scale differences.
  - Improve elite marker visuals.
- Asset loading:
  - Extend `BootScene` asset preload.
  - Add fallback generated textures for missing Boss sprites.
- Data mapping:
  - Add sprite keys to `EnemyConfig`.
  - Ensure `Enemy` entity uses config sprite key.
- Tests:
  - Each Boss has a unique configured sprite key.
  - Each ordinary enemy has a configured sprite key.
  - Fallback key remains valid.
- Documentation:
  - Update `docs/game-content.md` with visual identity status.

### 4.2 Out of Scope

- Full animation sheets.
- Bone/rig animation.
- New Boss attacks.
- New enemy families.
- Generated art execution unless explicitly requested during implementation.
- Combat balance changes beyond visual readability.

## 5. Visual Direction

### 5.1 Boss Concepts

| Boss | Visual Direction |
| --- | --- |
| Rival Sect Captain | Orange/red young swordsman, rival sect banner detail, compact silhouette. |
| Renegade Master | Crimson robe, heavier stance, broad sleeve/weapon gesture. |
| Grand Sword Elder | Gold/white elder swordsman, long beard or high collar, dignified silhouette. |
| Demonic Sect Overlord | Purple/black overlord, wide shoulders, cult aura, aggressive outline. |
| Eastern Invincible | Pink/red final master, elegant and dangerous, sharp high-contrast silhouette. |

### 5.2 Enemy Concepts

| Enemy | Visual Direction |
| --- | --- |
| Qingcheng Disciple | Green robe, light weapon, fast readable small unit. |
| Demonic Cult Assassin | Purple/black, narrow silhouette, fast threat. |
| Songshan Expert | Red/gold, broader silhouette, heavier threat. |

### 5.3 Elite Marker

- Elite enemies should show:
  - a small ring or aura,
  - stronger outline,
  - existing elite label.
- Marker must not hide projectile or hit feedback.

## 6. Functional Requirements

### 6.1 Sprite Config

- Add `spriteKey` to `EnemyConfig`.
- Ordinary enemies must map to existing enemy assets.
- Bosses must map to unique Boss sprite keys.
- If a texture is missing, the runtime should fall back to generated texture or `boss-master`.

### 6.2 Boot Loading

- Preload expected Boss sprite files from `assets/sprites/wuxia`.
- Create fallback textures for each Boss sprite key when missing.
- Keep existing `boss-master` as a compatibility fallback.

### 6.3 Entity Rendering

- `Enemy` should instantiate using `config.spriteKey`.
- Tint can still apply for gameplay readability, but unique sprites must remain visible.
- Boss scaling should remain based on config radius.

### 6.4 Elite Visuals

- Elite marker should remain data-driven or centralized.
- It should work across all enemy sprite keys.
- It should be visible against the floor.

## 7. UX Requirements

- Bosses should be distinguishable without reading the Boss name.
- Ordinary enemies should remain readable in dense waves.
- Visual effects should not obscure telegraphs.
- The final Boss should feel special in the first second it appears.

## 8. Implementation Plan

### Task 1: Data Mapping

- Add `spriteKey` to `EnemyConfig`.
- Map every enemy and Boss to a sprite key.
- Add tests for sprite key coverage.

### Task 2: Boot Asset Loading

- Preload unique Boss sprite keys.
- Add fallback generated textures.
- Keep `boss-master` fallback.

### Task 3: Enemy Entity Rendering

- Update `Enemy` constructor/rendering to use `spriteKey`.
- Preserve tint, health bar, elite label, and Boss scaling.

### Task 4: Elite Marker Polish

- Add or improve aura/ring marker.
- Keep marker subtle and short of UI clutter.

### Task 5: Asset Pass

- Option A: use generated placeholder Boss sprites through Phaser fallback.
- Option B: use model-generated PNGs for Bosses and enemies if requested.
- Ensure files live under `public/assets/sprites/wuxia`.

### Task 6: Verification

- `npm test -- --run`
- `npm run build`
- Local smoke check.
- Manual dev mode:
  - spawn Boss with `B`,
  - advance time with `N`,
  - verify each Boss tier is visually distinct.

## 9. Acceptance Criteria

- Each enemy config has a sprite key.
- Each Boss config has a unique sprite key.
- Missing Boss art falls back safely.
- Enemy rendering uses configured sprite keys.
- Elite enemies remain visually marked.
- Tests cover sprite mapping.
- `npm test -- --run` passes.
- `npm run build` passes.

## 10. Risks and Mitigations

- Risk: Generated art style becomes inconsistent.
  - Mitigation: Define prompt style and keep fallback placeholders.
- Risk: Bigger sprites obscure hitboxes or telegraphs.
  - Mitigation: Keep physics radius unchanged and tune scale separately.
- Risk: Asset loading fails on missing files.
  - Mitigation: Fallback texture generation in `BootScene`.
- Risk: Dense waves become visually noisy.
  - Mitigation: Improve silhouettes first, avoid extra constant particles.

## 11. Review Notes

Recommended first implementation: add sprite-key mapping and fallback generated textures first, then optionally replace placeholders with model-generated PNG assets.
