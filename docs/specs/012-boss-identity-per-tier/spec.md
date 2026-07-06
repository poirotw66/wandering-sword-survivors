---
id: 012-boss-identity-per-tier
title: Boss Identity Per Tier
status: done
owner: openab
created: 2026-07-03
updated: 2026-07-03
prd: prd-001-nightfall-survivors
---

# Boss Identity Per Tier Spec

## 1. Context

Five Boss tiers share overlapping skill kits (dash, fan strike, summon, needle storm). Players recognize Bosses mainly by portrait and HP, not by how they fight. Spec `006-boss-combat-depth` added data-driven profiles and telegraphs; this spec gives each tier a **unique combat identity**.

## 2. Goals

- Each Boss tier has one readable signature mechanic.
- Mechanics reuse existing telegraphs, projectiles, and summon infrastructure.
- Boss bar continues to show the active technique name.
- Keep behavior config pure and testable in `bossIdentity.ts`.

## 3. Tier Mechanics

| Boss | Identity | Mechanic |
| --- | --- | --- |
| Minor — Rival Sect Captain | Pursuit lock | Dash marks player position for 1.2s, then lunges to that spot |
| Mid — Renegade Master | Lingering fan qi | Fan strike leaves 2s damage zones |
| Great — Grand Sword Elder | Guard formation | Summons 2 tank guards; Boss takes 35% less damage while guards live |
| Mega — Demonic Sect Overlord | Sector needle storm | Needle storm covers a 90° sector toward the player |
| Final — Eastern Invincible | Final stand + orbiting needles | Phase at 30% HP (−40% cooldowns); orbiting needles in final phase |

## 4. Scope

### 4.1 In Scope

- `src/data/bossIdentity.ts` with per-tier identity config.
- `EnemySystem` branches for each identity mechanic.
- `CollisionSystem` applies guard-formation damage reduction.
- Mega Boss gains `needleStorm` in skill profile.
- Final Boss phase threshold moves from 45% to 30% HP; cooldown multiplier 0.6.
- i18n labels for identity-specific technique names where needed.
- Vitest coverage for identity config.

### 4.2 Out of Scope

- New Boss sprites or animations.
- New Boss families or schedule changes.
- Full combat balance pass.

## 5. Verification

- `npm test`
- `npm run build`
- Dev mode `B` spawns next Boss; each tier shows distinct behavior.

## 6. Approval

Approved for implementation.
