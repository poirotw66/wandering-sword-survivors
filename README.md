# Wandering Sword Survivors

A wuxia-themed TypeScript + Phaser 3 survivors-like roguelite prototype based on `ideate.md`.

The first playable hero is Linghu Chong, built around sword forms, footwork, inner-force skills, and martial-art upgrades.

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
- Automatic martial forms: Sword Qi, Circling Sword Guard, Breaking Palm Wave, Nine Swords Flash
- Martial skill upgrades: Dugu Nine Swords, Star Absorption Inner Force, Huashan Cloud Steps, Wine-Tempered Sword Heart
- Generated wuxia sprite art for Linghu Chong, enemies, boss, martial effects, EXP gem, and wine gourd pickup
- Experience gems, level-up choices, HP, score, kills, timer, best score
- Pause overlay, weapon-level HUD, damage shake, and kill score popups
- Health pickups, rising wave pressure, and a visible boss health bar
- GitHub Pages workflow at `.github/workflows/deploy.yml`
