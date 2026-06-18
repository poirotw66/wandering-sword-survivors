---
id: 001-nightfall-survivors
status: in-progress
prd: prd-001-nightfall-survivors
---

# Nightfall Survivors Spec

## Architecture

- Vite hosts a Phaser 3 game mounted in `#app`.
- Phaser scenes handle boot, menu, gameplay, HUD, and game over.
- Gameplay is split into small systems under `src/systems`.
- Tunable game content lives under `src/data`.

## Gameplay Loop

1. Start a run from the menu.
2. Move the player while enemies spawn around the camera.
3. Weapons automatically target or emit attacks.
4. Enemies drop EXP gems on death.
5. Level-up opens a three-choice upgrade panel.
6. Run ends when HP reaches zero or the boss is defeated.

## Deployment

GitHub Pages deployment is configured through `.github/workflows/deploy.yml`.
