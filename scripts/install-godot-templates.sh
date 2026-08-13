#!/usr/bin/env bash
set -euo pipefail
# Install Godot 4.7.1 export templates from tools/godot/*.tpz if present.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TPZ="$ROOT/tools/godot/Godot_v4.7.1-stable_export_templates.tpz"
DEST="${HOME}/Library/Application Support/Godot/export_templates/4.7.1.stable"
if [[ ! -f "$TPZ" ]]; then
  echo "Missing $TPZ" >&2
  exit 1
fi
mkdir -p "$DEST"
TMP="$(mktemp -d)"
unzip -qo "$TPZ" -d "$TMP"
# tpz unpacks to templates/*
if [[ -d "$TMP/templates" ]]; then
  rsync -a --delete "$TMP/templates/" "$DEST/"
else
  rsync -a --delete "$TMP/" "$DEST/"
fi
rm -rf "$TMP"
echo "Installed export templates to $DEST"
ls "$DEST" | head
