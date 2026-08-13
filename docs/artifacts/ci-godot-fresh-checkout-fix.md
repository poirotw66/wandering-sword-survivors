# CI follow-up: Godot fresh-checkout hang fix

Task: `task_1b048043496c`
Run: GitHub Actions `31670973261` (cancelled while hung in Godot headless tests)

## Root cause

CI checked out a clean tree with `godot/.godot/` gitignored (no `global_script_class_cache.cfg`). Workflow invoked Godot directly on `test_runner.tscn` without `--import`. Autoloads/tests then failed to resolve `class_name` types (`Tags`, `EnemyDef`, …). After SCRIPT/Parse errors Godot stayed alive, so the runner hung until cancelled.

## Fix

1. `scripts/godot-headless-tests.sh`
   - `--headless --import` first; assert class cache contains known types
   - Per-step wall timeouts via synchronous portable `run_with_timeout` only
   - Capture/print logs, then inspect success markers + physics/script error patterns after exit
   - No background parse-error monitor (removed after supervisor review)
2. `scripts/godot-export-web.sh` — same import + bounded export timeout; print export log
3. `.github/workflows/deploy.yml` — use `npm run godot:test` / `godot:export-web` with `GODOT_BIN` + `timeout-minutes: 10`
4. `README.md` — note that scripts import before run on fresh checkouts

No committed `.godot` cache. Local macOS path unchanged (`tools/godot/...` or `GODOT_BIN`).

## Verification (local)

- Wiped `godot/.godot` → `npm run godot:test` → `ALL_GODOT_CHECKS_PASSED`
- Wiped `godot/.godot` → `npm run godot:export-web` → `export/web/index.html` written

## Not done

- Commit / push (per task)
- Did not re-run the remote Actions job
