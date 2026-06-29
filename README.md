# Wandering Sword Survivors

A wuxia-themed TypeScript + Phaser 3 survivors-like roguelite prototype based on `ideate.md`.

The first playable hero is Linghu Chong, built around sword forms, footwork, inner-force skills, and martial-art upgrades.

## Run

```bash
npm install
npm run dev
```

Dev playtest mode: open `http://127.0.0.1:5173/?dev=1` for `F1` / `L` / `B` / `N` shortcuts.

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
- Player movement and camera follow with `RESIZE` scaling and native-resolution map tiles
- 16 ordinary enemy factions (Qingcheng, Demonic Cult, Songshan, Huashan, Hengshan, Taishan, river bandits, medicine heretics, Sun-Moon cult, royal guards, Wudang, Shaolin, Emei, beggars, northern riders, poison cult) plus 5 Boss tiers on a 30-minute timeline
- Minion behavior archetypes: chaser, dasher, tank, ranger
- Elite enemies: faction tint, 1.22x scale, pulsing aura ring, and label
- Automatic martial forms: Sword Qi, Circling Sword Guard, Breaking Palm Wave, Nine Swords Flash
- Martial skill upgrades and 10 evolution forms
- Generated wuxia sprite art for hero, enemies, bosses, effects, icons, and map tiles
- Procedural wuxia SFX (`public/assets/audio/wuxia/`) with Web Audio synth fallback
- Experience gems, level-up choices, HP, score, kills, timer, best score
- Pause overlay, weapon-level HUD, damage shake, and kill score popups
- Health pickups, rising wave pressure, and visible boss health bars
- Meta progression, renown shop, achievements, and collection screen

## GitHub Pages

Workflow: `.github/workflows/deploy.yml` (build on push to `main`, deploy `dist/`).

If the site returns 404, enable Pages in the repo settings:

1. **Settings → Pages → Build and deployment**
2. Source: **GitHub Actions** (not legacy branch deploy)
3. Push to `main` or re-run the **Deploy to GitHub Pages** workflow

Regenerate SFX after editing `scripts/generate-sfx.py`:

```bash
python3 scripts/generate-sfx.py
```

## Docs

- `docs/game-content.md` — full content reference (Traditional Chinese)
- `docs/asset-image-prompts.md` — image generation prompts for sprites
- `docs/specs/` — feature specs and verification reports
