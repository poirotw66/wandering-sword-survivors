# Godot Web deploy breakage (HTTPS)

## Symptom

After Pages deploy, opening the public site shows a Godot error / blank failure instead of the hub.

## Cause

Godot Web requires a **Secure Context (HTTPS)**.  
`http://www.bloss0m.com/wandering-sword-survivors/` returns **200 over plain HTTP** (no redirect). The engine then reports:

`Secure Context - Check web server configuration (use HTTPS)`

Secondary risks from #26:

- Forced `#canvas { width/height: 100% !important }` could fight Godot’s canvas resize policy
- Cross-origin isolation headers enabled without threads (unnecessary on GH Pages)

## Fix

1. Inject an HTTP→HTTPS `location.replace` in Web `head_include`
2. Soften canvas CSS (no forced 100% size)
3. Set `ensure_cross_origin_isolation_headers=false` (threads already off)
4. Portrait gate only on phone-like devices, after one frame

## Verify

Open **https://www.bloss0m.com/wandering-sword-survivors/** (not `http://`).  
Hard refresh after deploy.
