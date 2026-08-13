#!/usr/bin/env bash
# Headless Godot content/rules + smoke + full-run validation.
# Fresh checkouts have no godot/.godot cache; --import rebuilds class/import
# cache before any scene run so class_name types resolve and Godot can quit.
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

# Bounded timeouts (seconds). Override via env for local debugging.
IMPORT_TIMEOUT_SEC="${GODOT_IMPORT_TIMEOUT_SEC:-180}"
TEST_TIMEOUT_SEC="${GODOT_TEST_TIMEOUT_SEC:-60}"
SMOKE_TIMEOUT_SEC="${GODOT_SMOKE_TIMEOUT_SEC:-120}"
FULL_TIMEOUT_SEC="${GODOT_FULL_TIMEOUT_SEC:-180}"

ERROR_PATTERN='flushing queries|Can'\''t change monitoring|Can'\''t change this state while flushing|Can'\''t change shapes|Disabling a CollisionObject|Removing a CollisionObject|SCRIPT ERROR|Parse Error'

echo "Using Godot: $GODOT_BIN"
"$GODOT_BIN" --version || true

# Portable timeout: GNU timeout / gtimeout, else a minimal macOS sleep watchdog.
run_with_timeout() {
  local secs="$1"
  shift
  if command -v timeout >/dev/null 2>&1; then
    timeout -k 5 "$secs" "$@"
    return $?
  fi
  if command -v gtimeout >/dev/null 2>&1; then
    gtimeout -k 5 "$secs" "$@"
    return $?
  fi
  "$@" &
  local pid=$!
  (
    sleep "$secs"
    if kill -0 "$pid" 2>/dev/null; then
      echo "TIMEOUT after ${secs}s; sending TERM to pid $pid" >&2
      kill -TERM "$pid" 2>/dev/null || true
      sleep 5
      kill -KILL "$pid" 2>/dev/null || true
    fi
  ) &
  local watchdog=$!
  set +e
  wait "$pid"
  local code=$?
  set -e
  kill "$watchdog" 2>/dev/null || true
  wait "$watchdog" 2>/dev/null || true
  # 143/137 often mean TERM/KILL; normalize hung runs to 124 (GNU timeout).
  if [[ $code -eq 143 || $code -eq 137 ]]; then
    return 124
  fi
  return "$code"
}

# Run Godot under timeout, print log, then inspect exit/marker/errors.
# Args: timeout_sec label success_marker godot_args...
run_godot_check() {
  local secs="$1"
  local label="$2"
  local marker="$3"
  shift 3
  local log
  log="$(mktemp)"
  echo "== $label (timeout ${secs}s) =="
  set +e
  run_with_timeout "$secs" "$GODOT_BIN" "$@" >"$log" 2>&1
  local code=$?
  set -e
  cat "$log"
  if [[ $code -eq 124 ]]; then
    echo "$label timed out after ${secs}s" >&2
    rm -f "$log"
    exit 124
  fi
  if [[ $code -ne 0 ]]; then
    echo "$label exited with code $code" >&2
    rm -f "$log"
    exit "$code"
  fi
  if [[ -n "$marker" ]] && ! grep -q "$marker" "$log"; then
    echo "$label did not report $marker" >&2
    rm -f "$log"
    exit 1
  fi
  if grep -Eiq "$ERROR_PATTERN" "$log"; then
    echo "$label log contains Godot physics/script errors" >&2
    rm -f "$log"
    exit 1
  fi
  rm -f "$log"
}

ensure_project_imported() {
  echo "== project import / class-cache scan (timeout ${IMPORT_TIMEOUT_SEC}s) =="
  local log
  log="$(mktemp)"
  set +e
  # --import rebuilds .godot/imported + global_script_class_cache.cfg then quits.
  # First-boot theme/font errors before reimport are expected; do not treat them
  # as failure — success is exit 0 + class cache containing known class_name types.
  run_with_timeout "$IMPORT_TIMEOUT_SEC" "$GODOT_BIN" --headless --path "$ROOT/godot" --import >"$log" 2>&1
  local code=$?
  set -e
  if [[ $code -ne 0 ]]; then
    cat "$log"
    if [[ $code -eq 124 ]]; then
      echo "Godot --import timed out after ${IMPORT_TIMEOUT_SEC}s" >&2
    else
      echo "Godot --import exited with code $code" >&2
    fi
    rm -f "$log"
    exit "$code"
  fi
  local cache="$ROOT/godot/.godot/global_script_class_cache.cfg"
  if [[ ! -f "$cache" ]]; then
    cat "$log"
    echo "Missing $cache after --import (fresh checkout class cache not built)" >&2
    rm -f "$log"
    exit 1
  fi
  for need in Tags EnemyDef WeaponDef ManualDef Resonance UpgradeService; do
    if ! grep -q "\"class\": &\"$need\"" "$cache"; then
      cat "$log"
      echo "global_script_class_cache.cfg missing class_name $need after --import" >&2
      rm -f "$log"
      exit 1
    fi
  done
  echo "Import OK (class cache ready)"
  rm -f "$log"
}

ensure_project_imported

run_godot_check "$TEST_TIMEOUT_SEC" "content/rules tests" "ALL_TESTS_PASSED" \
  --headless --path "$ROOT/godot" "res://tests/test_runner.tscn"

run_godot_check "$SMOKE_TIMEOUT_SEC" "run-scene smoke (spawn/hit/pool)" "SMOKE_PASSED" \
  --headless --path "$ROOT/godot" "res://tests/run_smoke.tscn"

run_godot_check "$FULL_TIMEOUT_SEC" "accelerated full-run validation (4 styles × 5/10/15 min)" "FULL_VALIDATION_PASSED" \
  --headless --path "$ROOT/godot" "res://tests/run_full_validation.tscn"

echo "ALL_GODOT_CHECKS_PASSED"
