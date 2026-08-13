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
    echo "Godot binary not found. Set GODOT_BIN." >&2
    exit 1
  fi
fi

IMPORT_TIMEOUT_SEC="${GODOT_IMPORT_TIMEOUT_SEC:-180}"
EXPORT_TIMEOUT_SEC="${GODOT_EXPORT_TIMEOUT_SEC:-300}"

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
  if [[ $code -eq 143 || $code -eq 137 ]]; then
    return 124
  fi
  return "$code"
}

# Fresh checkout: rebuild .godot class/import cache before export.
echo "== project import before export (timeout ${IMPORT_TIMEOUT_SEC}s) =="
IMPORT_LOG="$(mktemp)"
set +e
run_with_timeout "$IMPORT_TIMEOUT_SEC" "$GODOT_BIN" --headless --path "$ROOT/godot" --import >"$IMPORT_LOG" 2>&1
IMPORT_CODE=$?
set -e
if [[ $IMPORT_CODE -ne 0 ]]; then
  cat "$IMPORT_LOG"
  echo "Godot --import failed with code $IMPORT_CODE" >&2
  rm -f "$IMPORT_LOG"
  exit "$IMPORT_CODE"
fi
CACHE="$ROOT/godot/.godot/global_script_class_cache.cfg"
if [[ ! -f "$CACHE" ]]; then
  cat "$IMPORT_LOG"
  echo "Missing global_script_class_cache.cfg after --import" >&2
  rm -f "$IMPORT_LOG"
  exit 1
fi
rm -f "$IMPORT_LOG"
echo "Import OK (class cache ready)"

OUT="$ROOT/export/web"
mkdir -p "$OUT"
# Expect templates at Godot user export_templates/4.7.1.stable
echo "== web export (timeout ${EXPORT_TIMEOUT_SEC}s) =="
EXPORT_LOG="$(mktemp)"
set +e
run_with_timeout "$EXPORT_TIMEOUT_SEC" "$GODOT_BIN" --headless --path "$ROOT/godot" --export-release "Web" "$OUT/index.html" >"$EXPORT_LOG" 2>&1
EXPORT_CODE=$?
set -e
cat "$EXPORT_LOG"
rm -f "$EXPORT_LOG"
if [[ $EXPORT_CODE -ne 0 ]]; then
  echo "Web export failed with code $EXPORT_CODE" >&2
  exit "$EXPORT_CODE"
fi
if [[ ! -f "$OUT/index.html" ]]; then
  echo "Web export did not write $OUT/index.html" >&2
  exit 1
fi
echo "Web export written to $OUT"
