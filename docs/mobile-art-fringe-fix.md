# Mobile + sprite fringe playtest fixes

## Sprite noise behind characters

AI PNGs retained opaque light-gray mats after lossy import. Cleanup punches edge-connected near-white to transparent and defringes halos; character/start-style imports use lossless again.

## Mobile aspect / feel

- Stretch aspect `expand` (fills ultrawide phones without giant letterbox).
- Handheld orientation `sensor landscape` + portrait gate overlay（請橫向持機）.
- Hub/HUD lay out from safe-area margins; touch stick uses the joystick rect instead of a hard-coded left third.
- Web export head include: full-bleed canvas, no page scroll, landscape-oriented PWA hint.
