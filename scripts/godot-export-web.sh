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
OUT="$ROOT/export/web"
mkdir -p "$OUT"
# Expect templates at Godot user export_templates/4.7.1.stable
"$GODOT_BIN" --headless --path "$ROOT/godot" --export-release "Web" "$OUT/index.html"
echo "Web export written to $OUT"
