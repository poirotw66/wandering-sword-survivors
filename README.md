# Nightfall Survivors

A TypeScript + Phaser 3 survivors-like roguelite prototype based on `ideate.md`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Serve Build

```bash
npm run serve
```

## Controls

- Move: `WASD` or arrow keys
- Pick upgrade: mouse or number keys `1`-`3`
- Pause: `Esc`
- Restart after game over: `Space` or the button

## MVP Features

- Phaser 3 + Vite + TypeScript setup
- Player movement and camera follow
- Enemy waves with Slime, Bat, Golem, and a 10-minute boss
- Automatic weapons: Magic Bolt, Orbit Blade, Flame Wave, Thunder Strike
- Experience gems, level-up choices, HP, score, kills, timer, best score
- Pause overlay, weapon-level HUD, damage shake, and kill score popups
- Health pickups, rising wave pressure, and a visible boss health bar
- GitHub Pages workflow at `.github/workflows/deploy.yml`
