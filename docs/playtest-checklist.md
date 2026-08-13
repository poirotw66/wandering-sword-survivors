# Playtest Checklists

## Godot first public chapter (15 minutes) — current

Use **`docs/playtest-15min-zh.md`** (Traditional Chinese) for desktop and landscape-mobile manual playtest, balance matrix, metrics, and pass/fail criteria for `chapter.mist_ravine`.

Automated accelerated coverage (all four start styles × 5/10/15 min marks, boss order, mutations, victory unlocks):

```bash
npm run godot:test
```

## Legacy Phaser archive (30 minutes) — historical

The checklist below targets the frozen Phaser build under `legacy/` and the old 30-minute timeline. Do not use it as the primary gate for the Godot remake.

---

# 30-Minute Playtest Checklist (legacy Phaser)

Use this checklist after Phase 5 close to validate pacing, balance, and mobile UX before a second balance pass.

## Setup

- Local: `npm run dev` → `http://127.0.0.1:5173/`
- Accelerated dev run: `http://127.0.0.1:5173/?dev=1`
- Mobile: same URL on phone, or narrow browser window (~390×844)

### Dev shortcuts (`?dev=1`)

| Key | Action |
| --- | --- |
| `F1` | Toggle dev mode |
| `L` | Level up |
| `B` | Spawn next Boss |
| `N` | Advance 60 seconds |

## A. Menu Hub (5 min)

- [ ] Difficulty, start style, and Jianghu encounter picker are readable on phone
- [ ] Run setup panel scrolls without blocking taps
- [ ] Renown shop opens, scrolls, and purchases work
- [ ] Language toggle and mute control do not overlap renown text

## B. Early Run 0–5 min (10 min)

- [ ] Starter sword qi one-shots ordinary minions (no elite)
- [ ] First upgrade panel readable on phone; three cards scroll if needed
- [ ] Build path choice feels meaningful by level 3
- [ ] Ranger minion projectiles are visible but not oversized
- [ ] Dasher telegraph readable; tank block feels fair

## C. Mid Run 5–15 min (15 min)

Use `N` to reach marks quickly, then play 2–3 minutes around each mark.

| Time | Check |
| --- | --- |
| 5:00 | Pressure wave toast; difficulty spike feels intentional |
| 5:00 | Mid Boss identity mechanic clear (pursuit / fan / etc.) |
| ~7:00 | Mid-run random event triggers and effect is noticeable |
| 10:00 | Great Boss; post-Boss respite window feels real |
| 10–15 min | Evolution preview HUD helps planning |
| 10–15 min | Elite density readable (not invisible wall of gold mobs) |

## D. Late Run 15–30 min (dev-accelerated)

| Time | Check |
| --- | --- |
| 15:00 | Mega Boss tier mechanic distinct from earlier bosses |
| 15–20 min | On-screen minion count stays readable (cap ~120) |
| 20:00+ | Build path milestones still matter |
| 25:00 | Pressure + events stack without soft-lock |
| 30:00 | Final Boss beatable with a reasonable mid-run build |

## E. Meta & Replay (5 min)

- [ ] Try two different Jianghu encounters; effect noticeable in-run
- [ ] Unlock at least one new encounter via renown or boss milestone
- [ ] Second run with different start style feels different
- [ ] Codex shows discovered enemies / bosses

## F. Record Notes

For each issue, note: **time mark**, **build path**, **difficulty**, **device**.

| Area | Too easy | Too hard | Just right | Notes |
| --- | --- | --- | --- | --- |
| Early damage | | | | |
| Elite frequency | | | | |
| Boss TTK | | | | |
| Exp / level pace | | | | |
| Sword sect | | | | |
| Qi sect | | | | |
| Footwork sect | | | | |
| Wine sword sect | | | | |
| Mobile HUD | | | | |
| Mobile hub | | | | |
| Mobile pause/status chips | | | | |
| Mobile upgrade scroll vs pick | | | | |
| Boss bar vs loadout overlap | | | | |

## Pass Criteria

- No blocking mobile layout bugs on upgrade or menu screens
- At least one full run reaches 30:00 final Boss with dev assist or real time
- No single build path dominates without trade-off
- Playtest notes filed for Spec 017 balance tuning
