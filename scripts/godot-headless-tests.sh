#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GODOT_BIN="${GODOT_BIN:-}"
if [[ -z "$GODOT_BIN" ]]; then
  if [[ -x "$ROOT/tools/godot/Godot.app/Contents/MacOS/Godot" ]]; then
    GODOT_BIN="$ROOT/tools/godot/Godot.app/Contents/MacOS/Godot"
  elif command -v godot >/dev/null 2>&1; then
    GODOT_BIN="$(command -v godot)"
  else
    echo "Godot binary not found. Set GODOT_BIN or install Godot 4.7.1 under tools/godot/." >&2
    exit 1
  fi
fi
echo "Using Godot: $GODOT_BIN"
"$GODOT_BIN" --version || true

echo "== content/rules tests =="
"$GODOT_BIN" --headless --path "$ROOT/godot" "res://tests/test_runner.tscn"

echo "== run-scene smoke (spawn/hit/pool) =="
LOG="$(mktemp)"
set +e
"$GODOT_BIN" --headless --path "$ROOT/godot" "res://tests/run_smoke.tscn" >"$LOG" 2>&1
CODE=$?
set -e
cat "$LOG"
if [[ $CODE -ne 0 ]]; then
  echo "Smoke exited with code $CODE" >&2
  exit "$CODE"
fi
if ! grep -q "SMOKE_PASSED" "$LOG"; then
  echo "Smoke did not report SMOKE_PASSED" >&2
  exit 1
fi
# Fail on physics-flush / script errors that supervisors flag in browser play.
if grep -Eiq "flushing queries|Can't change monitoring|Can't change this state while flushing|Can't change shapes|Disabling a CollisionObject|Removing a CollisionObject|SCRIPT ERROR|Parse Error" "$LOG"; then
  echo "Smoke log contains Godot physics/script errors" >&2
  exit 1
fi
echo "ALL_GODOT_CHECKS_PASSED"
