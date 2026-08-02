# Full System — training, recovery, nutrition

A single-file tracker for a 13-week block aimed at a sub-55 400m, a sub-4:50 mile
and a sub-16:50 5K, plus the recovery, nutrition and skincare routines around it.

Open `index.html` in a browser. No build step, no server, no account — everything
is saved in the browser's `localStorage` as you type.

## Files

| File | What it is |
|---|---|
| `index.html` | The app. Self-contained: fonts, styles and script are all inlined. This is the file you open and the file that gets published. |
| `source.html` | The editable source. Identical to `index.html` except the fonts are a `/*@FONTS@*/` placeholder, so it stays readable. |
| `build.py` | Inlines the `.woff2` files into `source.html` → `index.html`. Run after editing the source. |
| `*.woff2` | Bebas Neue, IBM Plex Mono and Inter, latin subsets from Google Fonts. |

```
python3 build.py   # source.html + fonts -> index.html
```

The fonts have to be inlined rather than linked: the app is published as a Claude
Artifact, where a strict CSP blocks requests to external hosts, so a
`@import url(fonts.googleapis.com/...)` silently falls back to a system face.

## What's in it

**Today** — the session pulled from the plan for the actual date, a readiness
verdict computed from morning HR against its own rolling baseline, recent
session-feel ratings and whether sleep was ticked, then the daily recovery
checklist with a 28-day completion grid and streak.

**This Week** — the seven-day plan for any of the 13 weeks, with per-session
target splits derived from the session text, a result field, a 1–5 feel rating
and notes. Weeks 1–3 progress by shrinking recovery intervals, week 4 deloads and
benchmarks, and that four-week cycle repeats until week 13's PB attempts.

**Timer** — an interval timer for track sessions. Loads the rep target and
recovery straight from the day's session, times each rep against the target with
the delta colour-coded, and runs the recovery countdown by itself with an audio
cue. Holds a screen wake lock while it runs. A pace converter sits underneath it.

**Progress** — benchmark bars showing how much of the gap between the block-start
time and the target has closed, morning HR against its baseline-plus-5 flag line,
weight against the 122–124 lb goal band with a 7-day average overlay, and the
trend readout that says whether to hold, step up or step back.

**Nutrition** — the calorie stepper for the reverse diet, which reads the weight
trend and says whether it's time to add 75 kcal, plus the staples, timing,
rotation and trend-reading reference.

**Protocols / Skincare** — the morning, warm-up, nervous system, sleep, recovery
and pull-back protocols, and the AM/PM routines with a retinol-night counter.

## Backing it up

`localStorage` is per-browser and per-device. Clearing browser data, using
private browsing, or switching phones loses everything. The Backup section on the
Progress tab exports the whole state as a JSON file and restores from one — worth
doing every few weeks. If the browser blocks storage entirely, the status bar at
the bottom says so instead of failing quietly.
