# Godot Art Wave 2 Implementation Plan

> **For agentic workers:** Checkbox tracking.

**Goal:** Hub backdrop, start-style portraits, upgrade/mutation icons, and result banners for Godot Wave 2.

**Architecture:** Extend `ArtCatalog` paths + UI helpers; wire Hub/`hud.gd` TextureRect and Button icons.

**Tech Stack:** Godot 4.7.1 GDScript, PNG under `godot/assets/art/{ui,icons}/`

---

- [x] Design + prompts
- [x] ArtCatalog wave2 + UI helpers
- [x] Hub + HUD wiring
- [x] Generate/process PNGs
- [ ] `STRICT_ART=1 npm run godot:test`
- [ ] Commit, push, PR
