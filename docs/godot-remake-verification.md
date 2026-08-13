# Godot Remake Verification Notes

Date: 2026-08-13

## Supervisor browser-test fixes (uncommitted)

### CJK tofu / font
- Bundled `godot/assets/fonts/NotoSansTC-Regular.ttf` (Noto Sans TC subset + OFL) including fullwidth punctuation (`：，`).
- Project default theme `godot/resources/ui/default_theme.tres` wired via `project.godot` `[gui] theme/custom`.
- Desktop hub screenshot `docs/artifacts/hub-zh-desktop.png` shows readable Traditional Chinese (no tofu).
- Glyph proof `docs/artifacts/cjk-font-glyph-check.png` from the same bundled face.
- Headless Chrome Web shot could not past Godot splash here (WebGL2/SwiftShader limits); font is present inside `export/web/index.pck`.

### Physics / pooling errors
- `PoolManager.release` / `transfer` defer all CollisionObject2D tree, `process_mode`, and monitoring mutations.
- Projectile / pickup / enemy_projectile use spent/_alive guards; enemy death aftermath is deferred.
- Shape radius changes duplicate `CircleShape2D` instead of mutating shared shapes mid-query.

### Smoke test
- `godot/tests/run_smoke.tscn` advances ~12s game time (time_scale 3), auto-picks upgrades, exercises spawn/hit/pool.
- `scripts/godot-headless-tests.sh` fails on physics-callback / script error log lines.

## Tests run

| Check | Result |
| --- | --- |
| `npm test` (legacy vitest) | 84 passed |
| `npm run build` (legacy Vite) | OK |
| `npm run godot:test` | ALL_TESTS_PASSED + SMOKE_PASSED + ALL_GODOT_CHECKS_PASSED |
| `npm run godot:export-web` | wrote `export/web/index.html` + wasm/pck (font packed) |
| Godot version | 4.7.1.stable.official |

## Remaining gaps

- Placeholder geometry only; no final art pass.
- Not a full port of Phaser meta shop / 30-minute timeline / codex — intentionally first public 15-minute chapter.
- Automated headless Chrome WebGL2 play screenshots are environment-limited; use desktop hub artifact + packed font evidence.
- Work left **uncommitted** per dispatch instructions.

## Conformance close (task_20be86c1e9fe)

Closed supervisor static-audit gaps for the approved first-chapter plan:

- Exactly four martial arts; eight `ManualDef` manuals; four hub start styles with preferred-tag tie-break
- Locked weapons/manuals/start styles filtered from pools/choices until unlocked; boss mutations unlock immediately
- Mid-bosses offer two behavior-changing mutations (no accept/skip); final boss ends chapter with no mutation panel
- Distinct data-driven boss signatures: `rush_cleave` / `brand_ring` / `frost_needles`

| Check | Result |
| --- | --- |
| `npm test` | 84 passed |
| `npm run build` | OK |
| `npm run godot:test` | ALL_TESTS_PASSED + SMOKE_PASSED + ALL_GODOT_CHECKS_PASSED |
| `npm run godot:export-web` | wrote `export/web/` |
