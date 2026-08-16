# Godot Web Startup Investigation

**Date:** 2026-08-16  
**Symptom:** Godot (Pages / browser) feels like it takes a long time to start.

## Root cause

Latest Pages artifact (post Wave 1+2 art) unpacks to ~76MB. Critical path for `/`:

| File | Raw size | Notes |
| --- | --- | --- |
| `index.wasm` | ~38MB | Godot 4.7 web engine (≈10MB gzip) |
| `index.pck` | ~12MB | Game data; barely gzip-friendly |
| `legacy/` | ~27MB | Only fetched when visiting `/legacy/` |

`index.pck` grew mainly from Wave art (~12MB poorly compressed AI PNGs) + full-ish CJK font (~3.7MB). Texture imports used `compress/mode=0` (lossless).

Editor “slow first open” is the same pile: reimporting large lossless textures.

## Fixes in this change

1. Downscale combat/UI PNGs to display-appropriate sizes (256/384/128, hub 960×540).
2. Re-optimize PNGs (`compress_level=9`).
3. Switch art `.import` to lossy (`compress/mode=1`, quality 0.8).
4. Rebuild CJK font as a ~200KB subset of locale glyphs.
5. Enable `vram_texture_compression/for_mobile` on Web export preset.

## Expected impact

- Source art+font roughly **16MB → ~5MB**.
- Measured re-export: `index.pck` **12.07MB → ~1.10MB** (tests/docs excluded from Web pack).
- `index.wasm` remains ~39.5MB raw (~10MB gzip); first visit still dominated by engine download.

## Residual (not fixed here)

- Godot Web wasm size is structural; only a custom smaller engine build would shrink it further.
- `/legacy/` still ships Phaser assets for the archive path.
- Add a clearer TC loading splash later if desired (engine already has `#status-progress`).
