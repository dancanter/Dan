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

## Simple by default

The app opens with everything explanatory hidden. What stays on screen is the
recording surface — the week grid, weight, HR, tests, niggles, check-ins — plus
the handful of numbers that change what you do: the rolling targets, readiness,
the predicted mile and 5K, and what to train next.

A single **Show the reasoning** switch under the tabs brings all of it back:
the VO2max workings, training paces, equivalent performances, adaptation and
energy trends, the 2025 log, the eight pathways, and the whole Protocols tab,
which is reference from top to bottom and so is hidden with them. Nothing is
deleted, the choice is saved, and it roughly halves what there is to read.

Anything explanatory carries `data-detail`; one CSS rule hides it. Warnings that
need acting on are never tagged, so they show in both modes.

## What's in it

**Today** — the session pulled from the plan for the actual date, a readiness
verdict computed from morning HR against its own rolling baseline, recent
session-feel ratings and whether sleep was ticked, then the daily recovery
checklist with a 28-day completion grid and streak.

**This Week** — a rolling, count-based system rather than a day-locked one,
rebuilt to match the 2025 block that actually produced the PBs. Nothing is
assigned to a day: every day starts empty and you record what you did, on
whatever day you did it. The targets are counted over a **trailing seven days** —
roughly two effort runs, two easy runs, one 80–100m sprint session and four gym
sessions, against a 4–5 runs a week readout — so five sessions one
week and three the next is the same plan, not a failure. The window slides a day
at a time and never resets on a Sunday: a session leaves the count exactly seven
days after you ran it, and the window's dates sit beside the heading.

Weeks run **Monday to Sunday**. They used to run Sunday first, and the one-time
migration re-cuts every stored week by date rather than by position: the block
start steps forward to its Monday, Monday-to-Saturday keep the week number they
had, and each Sunday moves to the end of the week before it. No session changes
the calendar date it was logged on. The single day that cannot be placed — the
Sunday the block used to start on, now the day before week 1 — is kept as a
note on the Week tab with its contents spelled out, rather than dropped
quietly. The re-cut runs whether or not a block start is set, since it is
positional; only the date shift needs one.

Counting comes off the week grids, not the session log, so a session counts on
the day it happened rather than the day it was ticked, and a gym session counts
from the **+ Gym** button alone — a gym-only day never gets marked done, so
counting gym from the log missed it entirely. Nothing is pre-ticked: the toggle
is the record that you trained, not a plan to.

The effort menu is every distance from 100m to 10K, all out, full recovery, no
prescribed pace. The easy menu is the two runs actually used: 5km and 5 mile,
conversational. Sprints (100m flat or uphill) sit in their own bucket and are
never counted as effort — alactic work off full recovery, stopped while the reps
are still fast, so nothing is run to fatigue.

A 200m session is a hard effort *and* covers the sprint slot, so the sprint bar
reads "covered by your 200m session" rather than asking for both — which is what
the 2025 log actually did. The 80–100m sprints are the only running that is not
an effort session: relaxed rather than maximal, stopped the moment the pace
drops.

Two efforts is the aim, not a ceiling. Three in a week with nothing wrong in the
energy or morning-HR log is not flagged at all — the 2025 block had weeks like
that. Three *with* a fatigue marker, or four regardless, gets the pull-back
note. That check counts the same trailing seven days the targets do, so four
efforts spread across a Saturday and a Sunday still register.

**A bad energy rating blocks hard running.** Rate your energy 2 or below on the
Today tab and every effort session in the week gets a stop note, a banner sits
above the grid, and readiness says so outright — it overrides the score rather
than being one signal among several, because it is the one thing you reported
directly. Easy running is never blocked. The rating stands until a better one
replaces it, since feeling rough does not expire at midnight; it goes stale
after three days with nothing new logged, and clears the moment you log a 3 or
better.

**What To Do This Week** — each of the 13 weeks has a shape: which two efforts
it leans on and why, with the easy runs and the sprint slot under them. Which
day anything lands on is still free. Weeks 1–3 build the engine both goals sit
on; 5–7 sharpen (threshold for the 5K, ladders and 600s for the mile, a 3K to
see where you are); 9–11 go race-specific, one week leaning mile, one 5K, one
rehearsing the finish; 13 is the three attempts — mile Monday, 5K Thursday,
400m Sunday, with the 400m last because it is the least important of the three
and something has to pay for the order. The mile needs a higher fitness
than 16:50 does, so the speed work sits late, once the base under it exists.

**Deload weeks are 4, 8 and 12** — every fourth. The deload view replaces the
week's shape with what to do and what not to: one effort at half the usual reps
and full pace, two shorter easy runs, sprints optional; no time trials, no long
rep sets or threshold, no making up missed sessions, and no third effort because
you feel good — feeling good in a deload is the deload working.

**Easy runs are checked against your own easy pace.** Log an average pace on an
easy run and it is compared to the easy and threshold paces derived from your
logged times. Inside threshold and it says so outright — that run counted as one
of your two quality sessions, not as recovery. Training paces come from the
*most conservative* aerobic estimate rather than the median, because a single
800m rep always reads faster than the 5K that actually governs an easy pace, and
prescribing off the inflated number is what makes easy runs too fast in the
first place.

**A deload week knows what is already in it.** If the week has logged quality —
including an easy run actually run at threshold — the deload view leads with
that and says to make the rest of the week easy running only.

The heavier sessions (5 mile threshold, 10km threshold, 10K/5K/mile all-out) are
flagged `occasional`: benchmarks to rotate, not part of the weekly menu.

**Today's Fuel** (top of the Nutrition tab) — log what you actually ate and how
many steps you did. It shows the day against your number and a 7-day average,
says plainly whether a stall is intake drift or something else, and carries the
day's macro targets: protein fixed at 1g/lb, fat at the floor that keeps
hormones working, carbs taking whatever is left, since carbs are the only one
of the three you can afford to move. Steps show against 12,500 with the
shortfall converted to calories, because activity is the lever to pull before
intake. A salt-and-water note appears when the daily readings swing.

**Food Log** — type a food name and pick from the matches. 123 items covering
the meats, fish, dairy, grains, roots, vegetables, fruit, nuts and fats actually
eaten, or enter macros for anything not in the list. It totals the day: calorie, protein, carb and fat bars
against the day's targets, then thirteen micronutrients against their RDAs.
Under that sits the day's steer, argued from the numbers — how much protein or
carbohydrate is still owed and which food covers it, when fat has dropped below
its floor, which micronutrients the day is thin on and what fixes each, iron
logged without the vitamin C that makes it absorbable, and vitamin A stacking up
from liver. Each food carries a line on what it is actually for, behind the
reasoning switch.

Values are per 100g or per unit, approximate — enough to steer a day, not a lab
report. Each food carries its own note where there is something specific worth
saying; otherwise it inherits one from its category, which keeps 123 entries
readable.

**The reverse is locked** until the 7-day average has held at or below 123.5 lb
for a fortnight, or 1 November — whichever comes first.

**Steps go in beside each day** on the week grid as well as on Nutrition. Both
write the same record, keyed by the day's real date, so the number only ever
exists once. The 7-day average carries a verdict that reads the weight rate and
the fatigue markers together: under target with a flat scale says add steps
before cutting calories, and gives the gap in calories; 15,000+ with energy down
or HR up says dial back, because walking is cheap recovery-wise but not free;
under target while tired says get the recovery first rather than adding load.
It shows the running total, the daily average and the weekly rate, and the Week
Review carries that week's own total and average. Both readouts share one band
around the target so they cannot disagree with each other.

That feeds two things on Progress. **What Is Actually Happening** explains the
mechanism rather than only the verdict: how big the daily water swing is, whether
a flat scale is drift or cortisol holding water, whether a fast drop is fat or
glycogen, and why a gain in a deficit is almost never fat. **Refeeds** are
recommended only when two markers agree — flat while eating to target, low
energy, HR up on baseline, or a fortnight since the last one — and refused
outright when the average is over target, because a refeed releases an
accumulated deficit and there isn't one. Refeed days are excluded from the
adherence average, so a deliberate 2,500 doesn't read as overeating, and a
refeed inside four days explains the scale before anything else is diagnosed.

**Deload weeks name their sessions** like every other week — 4 × 200m in week 4,
3 × 400m in week 8, 3 × 300m at goal mile pace in the week-12 taper, each with
two easy 5ks, optional strides and rest. If the week has already had quality in
it, the effort is struck through and marked spent.

**Rest is deliberately not tracked.** There is no spacing check, no back-to-back
warning, and nothing that asks why you did not run yesterday. The 2025 log has
eight breaks of two or more days off and two pairs of back-to-back effort days,
and the PBs came anyway.

**The 2025 Block** — that log, kept as data so the figures under it are counted
rather than claimed: what it averaged per week (which is where the ~2 and ~2
targets come from), which effort formats kept recurring despite free choice
every session, and how the rest actually fell.

**Week Review** — the week you are looking at, read back off its own grid
rather than a rolling window, since a review is about a week that finished.
Every run with its average pace and best rep; the gym count broken down by split
(shoulders & forearms, chest & triceps, back & biceps, legs — logged from a
dropdown that appears when you tick **+ Gym**); lowest and average weight against
the week before; then a verdict.

The verdict counts recovery markers over that week — morning HR against
baseline, energy ratings, live niggles, average session feel, effort count. Two
or more agreeing says back off; one says hold; a quiet week with nothing
flagged says push. The suggested sessions for next week follow the verdict
rather than ignoring it: a back-off week gets one effort, two easy and rest,
and never an all-out time trial, and no week is ever offered two of them.
Ranking is by what has gone longest unrun, measured off the week grids so it
agrees with the review above it.

**What You Haven't Trained** — free choice drifts toward what is going well.
Ranking the menu by how long since each format was last run is what catches it.

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
