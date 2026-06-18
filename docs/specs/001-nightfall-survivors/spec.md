---
id: 001-nightfall-survivors
status: done
prd: prd-001-nightfall-survivors
---

# Nightfall Survivors Spec

## Architecture

- Vite hosts a Phaser 3 game mounted in `#app`.
- Phaser scenes handle boot, menu, gameplay, HUD, and game over.
- Gameplay is split into small systems under `src/systems`.
- Tunable game content lives under `src/data`.
- Wuxia theme data lives in weapon and skill configuration.

## Gameplay Loop

1. Start a run from the menu.
2. Move the player while enemies spawn around the camera.
3. Weapons automatically target or emit attacks.
4. Enemies drop EXP gems on death.
5. Level-up opens a three-choice upgrade panel.
6. Run ends when HP reaches zero or the boss is defeated.

## Wuxia Content

- First hero: Linghu Chong.
- Martial forms: Sword Qi, Circling Sword Guard, Breaking Palm Wave, Nine Swords Flash.
- Martial skills: Dugu Nine Swords, Star Absorption Inner Force, Huashan Cloud Steps, Wine-Tempered Sword Heart.
- Martial skills have independent levels and apply persistent stat changes.

## Deployment

GitHub Pages deployment is configured through `.github/workflows/deploy.yml`.

## Acceptance Criteria

- Player can start a run from the menu.
- Player can move with WASD or arrow keys.
- Enemies spawn in timed waves and chase the player.
- Weapons fire automatically and damage enemies.
- Enemies drop EXP gems; collecting enough EXP opens upgrade choices.
- Upgrade choices can improve martial forms or martial skills.
- HP, EXP, level, timer, score, kills, weapons, pause state, and boss HP are visible where relevant.
- Run ends on player death or boss defeat.
- Project builds successfully with `npm run build`.
