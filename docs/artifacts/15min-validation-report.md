# 15-minute validation package — worker report

Task: `task_486b4ff8dcb1`
Date: 2026-08-13
Branch: `agent/godot-remake` (uncommitted)

## What shipped

1. **Accelerated full-run harness** — `godot/tests/run_full_validation.gd` (+ `.tscn`)
   - All four start styles (`jian` / `qi` / `shen` / `yi`)
   - Clock-jump to 300 / 600 / 900s (5 / 10 / 15 min)
   - Asserts boss spawn order, mid-boss mutation panels (2 choices), final boss victory with **no** mutation panel
   - Asserts victory unlocks + chapter clear recording
   - Harness-only god HP / time jump — **no production combat weakening**

2. **Rules contracts** added to `godot/tests/test_runner.gd`
   - Milestone boss schedule order
   - Victory vs defeat unlock contract
   - Start-style runtime preferred-tag / bonus seeding

3. **CI wiring** — `scripts/godot-headless-tests.sh` runs full validation after smoke; `npm run godot:test` unchanged entrypoint

4. **Manual playtest** — `docs/playtest-15min-zh.md` (Traditional Chinese)
   - Desktop + landscape mobile checklists
   - Balance matrix with metrics and pass/fail bands
   - `docs/playtest-checklist.md` points Godot work at the new doc

## Verification

```text
npm run godot:test
→ ALL_TESTS_PASSED
→ SMOKE_PASSED
→ FULL_VALIDATION_PASSED (4 styles × 300/600/900)
→ ALL_GODOT_CHECKS_PASSED
Wall time ≈ 7s
```

## Limitations

- Full validation **defeats bosses by script damage** and **jumps elapsed**; it does not prove human-reachable TTK or touch UX.
- Mid-boss mutation *behavior feel* and balance bands remain manual (`docs/playtest-15min-zh.md`).
- Did not edit `.github/workflows/deploy.yml`; did not commit or push.

## Files touched

- `godot/tests/run_full_validation.gd`
- `godot/tests/run_full_validation.tscn`
- `godot/tests/test_runner.gd`
- `scripts/godot-headless-tests.sh`
- `docs/playtest-15min-zh.md`
- `docs/playtest-checklist.md`
- `docs/godot-migration-brief.md`
- `docs/artifacts/15min-validation-report.md`
