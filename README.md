# Wandering Sword Survivors

Original wuxia survivors-like. The **public product line is Godot 4.7.1** under `godot/`. The Phaser / TypeScript prototype is preserved under `legacy/` and still builds for comparison.

## Godot (primary)

Requirements: Godot **4.7.1** (Compatibility / GL Compatibility renderer), gameplay viewport **1280×720**.

```bash
# Optional local binary used by repo scripts
# tools/godot/Godot.app  (macOS) or set GODOT_BIN

npm run godot:test
npm run godot:export-web
```

Open `godot/project.godot` in the Godot editor to play. Hub → 15-minute Mist Ravine chapter.

### First public build features

- Desktop WASD / arrows + landscape touch stick / dash / rage buttons
- Automatic martial weapons, two-charge invulnerable dash, resonance-colored rage ultimate
- XP gems, heal pickups, level-up choices, four tags with tier + cross-tag resonance
- Waves, four enemy archetypes, three timed bosses with telegraphs, boss mutation unlocks
- Win / death results, content-unlock-only versioned JSON save, Traditional Chinese UI keys
- Object pools + data-driven defs with stable string IDs (original names only in UI)

## Legacy Phaser archive

```bash
npm install          # installs via package work at legacy/ when using root proxies
npm --prefix legacy ci
npm test             # vitest in legacy/
npm run build        # Vite build in legacy/
npm run dev          # legacy Vite dev server
```

Deployed Pages layout:

- `/` — Godot Web export
- `/legacy/` — Phaser prototype

## CI

`.github/workflows/deploy.yml` runs on `push` and `pull_request` to `main`: legacy tests/build, Godot headless tests, and Godot Web export. Pages artifact upload and deploy run only on `push` to `main`.

## Docs

- `docs/godot-migration-brief.md` — migration + remake status
- `docs/game-content.md` — Phaser-era content reference (historical)
- `godot/assets/placeholders/` — isolated geometric stand-ins only (not legacy IP art)
