# Full System — training, recovery, nutrition

A single-file tracker for a 13-week block aimed at a sub-55 400m, a sub-4:45 mile
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

**This Week** — weeks 1–2 are a fixed seven-day grid. From week 3 the week is a
*pool* of sessions you assign to days, because which day a session lands on
depends on how recovery is actually going: two hard runs (5 × 1km at 5K pace, and
a rotating speed session), a threshold run, an easy long run, 80m sprints, and a
gym toggle on any day. Reassigning a session re-checks the spacing and warns if
two hard days end up back to back — including across the Saturday/Sunday
boundary. Weeks 8 and 12 deload — week 4 is left as a normal week, since Rome is the break.

The 100m sprint formats (`Uphill 100m sprints`, `Bonus sprints`) are marked
alactic and are **not counted as effort sessions** by the weekly intensity
check. They are run off full recovery and stopped while the reps are still fast,
so no rep is run to fatigue. What they do carry is hamstring risk, and the
niggle block handles that separately.

The speed session rotates one pace (2:57/km, just under mile pace) with the rep
length growing, and cycles 200m work back through:

| Week | Session |
|---|---|
| 3 | 6 × 200m @ 29–30s, 3–4 min recovery |
| 5 | 6 × 300m @ 53s, 400m jog |
| 6 | 6 × 400m @ 71s, equal-time jog |
| 7 | Ladder 200-400-600-400-200m @ mile pace |
| 9 | 4 × 200m @ 27.5s off 8–10 min — 400m race pace |
| 10 | 7 × 400m @ 71s, equal-time jog |
| 11 | Ladder 200-400-600-800-600-400-200m @ mile pace |

Those reps are mile-pace work, not 400m work: 300m in 53s and 400m in 71s both
come out at 2:57/km, while 400m race pace for a sub-55 goal is 2:17/km. They are
run controlled, never all-out. The pool carries two genuinely 400m-specific
sessions instead: `80m build-ups` (the on-ramp), `80m sprints — all out`
(alactic, full recovery, run fresh), `200m speed endurance — flat out`
(3 reps, 10 min recovery) and `400m speed endurance` (3 × 300m @ 43–44s).

Rep count and effort are locked together, which is why the rotation's 200s are
run controlled: six reps only works at a controlled pace, and flat-out 200s cap
out at three. Saturday is a full day off — the four gym sessions sit on Mon,
Tue, Wed and Thu alongside the three hard runs.

The repeating sessions progress across the block rather than repeating: the
1km recovery shrinks 90s → 75s and then a sixth rep is added and it shrinks
again; the threshold grows 25 → 32 min and then holds duration while the pace
drops to 3:35–3:40; the easy run grows 45 → 70 min. Each card shows the arc its
session sits on with the current week marked, and the last result you logged
for that same session. A Block Arc table at the foot of the tab lays out all
seven quality weeks side by side.

Every session's target splits are parsed out of its own text, so the volume, per-rep
target, pace and recovery under each card stay correct if the wording changes.

**Timer** — an interval timer for track sessions. Loads the rep target and
recovery straight from the day's session, times each rep against the target with
the delta colour-coded, and runs the recovery countdown by itself with an audio
cue. Holds a screen wake lock while it runs. A pace converter sits underneath it.

**Progress** — morning HR against its baseline-plus-5 flag line,
weight against the 122–124 lb goal band with a 7-day average overlay, and the
trend readout that says whether to hold, step up or step back.

**Fitness** — leads with **Closing On The Goal**: every aerobic effort logged is
read according to how it was actually *run* — a benchmark test as a race, a
continuous threshold run at 88% of VO2max, a single all-out rep of 800m or more
as a short time trial — and the median of those becomes the current fitness
estimate. The median rather than the best, because the best estimate is always
the one whose method flatters you most. From it: a predicted mile and 5K, the
VDOT each goal actually needs, how far along the bar you are, and a "work on
these" block argued from your own logged sessions — which goal is genuinely
harder, whether your speed or your engine is the limiter, what your last six
weeks are short of, and how many weeks the remaining points take at a realistic
rate of gain.

The average pace of a rep set is deliberately *not* used as evidence. The
textbook way of reading one assumes short recovery, which makes the set a
continuous aerobic stimulus; these sessions are run all out off full recovery,
which is a different thing — 4 × 800 at 2:24 off long rests reads as VDOT 67
through that formula, and as a 5K that cannot be run. Set averages stay in Block
Bests, where they are a training number rather than a fitness estimate.

Benchmark bars sit under it. There are **no seeded block-start times**: a bar
measured from a number that was never run measures nothing, so the first test
logged at a distance becomes that distance's start line, and the bar stays empty
and says so until then.

Below that, an estimated VDOT and VO2max charted across the block. Only aerobic tests
(800m upward) feed it; a 400m is largely anaerobic and would produce a
meaningless number, so it is excluded and the section says why. It also derives
the training paces that fitness implies — easy, threshold, interval, repetition
— and equivalent times at every distance. Comparisons are strictly
like-for-like: a new 5K is measured against the 5K baseline, never against a
mile baseline, since a speed-leaning athlete's mile VDOT sits well above their
5K VDOT and mixing them reports a personal best as a decline.

**Niggles** — log a body part and a severity (1 aware of it → 4 can't run on it)
on the days you feel something. It tracks each area's own run of entries, so it
can tell you it is worsening rather than just present. A live severity-2+ niggle
in a hamstring, calf, achilles, quad or groin puts a block directly on the
all-out sprint sessions in the week view, and readiness weights it heavily —
severity 3 is enough on its own to turn the day's verdict to back off.

**Adaptation** — the same session, at the same pace, plotted over the block from
the 1–5 feel ratings. Feel dropping means the work is landing; feel climbing
while the session has not got faster is the earliest pull-back signal available,
and it shows weeks before a benchmark test would.

**Nutrition** — rebuilt around eight biological pathways rather than food
groups: collagen hydroxylation, anti-glycation, eNOS microcirculation, Nrf2,
lipid barrier, intracellular hydration, mitophagy and pulsed mTOR. Each carries
what it does, what feeds it, and the one lever that decides whether it works at
all — sprouts raw or the sulforaphane never forms, nitrate needs the oral
bacteria that antibacterial mouthwash destroys, collagen is inert without
vitamin C. Alongside: what each meal of the actual diet is feeding, coeliac
notes (certified GF oats, the absorption deficits coeliacs carry, and gut
healing as an ageing lever in its own right), a weekly checklist of the items
easy to miss, the staged reverse with a gluten-free step ladder written against
those meals, and an honest ranking that puts sleep, training and not staying in
a deficit above every food on the page.

**Protocols / Skincare** — the morning, warm-up, nervous system, sleep, recovery
and pull-back protocols, a PB-week protocol covering the taper, pre-attempt
timing and how to pace each of the three attempts, and the AM/PM routines with a retinol-night counter.

## Backing it up

`localStorage` is per-browser and per-device. Clearing browser data, using
private browsing, or switching phones loses everything. The Backup section on the
Progress tab exports the whole state as a JSON file and restores from one — worth
doing every few weeks. If the browser blocks storage entirely, the status bar at
the bottom says so instead of failing quietly.
