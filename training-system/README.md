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

**Every tab leads with one thing.** Twenty-four secondary sections are folded:
the heading is the control, so a tab reads as a short list you tap open rather
than a wall you scroll past. Open state is remembered per section. Nothing is
folded that you have to type into on the way in — the lead section on each tab
is always the one you came for.

**The three block targets sit in the header**, each showing the best you have
actually run against it, ticking green when it is met.

Visible text in simple mode is about 1,660 words across seven tabs, down from
3,530 before the fold.

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

## Trimmed to six things

The app grew to 55 sections across 7 tabs and he said, fairly, that it was too
much. It is now **37 sections across 6 tabs**, cut against the six things he
actually named: beat the times this block, the model look, the cut to 7
November, the reverse, keep the data, and studying.

**Gone:** the whole Protocols tab (ten sections, reference top to bottom), the
recovery checklist and weekly reflection, calisthenics, week review, the pace
converter, fortnightly check-ins, the long game, adaptation and energy charts,
the eight-pathway table, the vital-bits and honest-verdict essays, the retinol
counter (he does not use retinol and never will), and the standalone potassium
and targets sections — the live guidance from those lives in The Protocol.

**Nothing in `localStorage` was touched.** Only display surfaces were removed,
so every weight, PB, session, test and niggle is exactly where it was. Two
sections were pulled back after the first pass proved them load-bearing: the
session suggestion engine, which is the thing that serves beating his times, and
the PB entry form, which is how records get in at all. Your Day came back too —
the four-meal rotation is his plan, not reference.

Removing a section used to be dangerous because listeners attached straight to
`$("id")`, which throws the moment the element is gone and takes every listener
below it with it. They now go through `on(id, ev, fn)`, which no-ops on a
missing element, and the render functions that drew removed sections carry an
early return. A `tabs.mjs` suite opens every tab and every fold and fails on any
console error, which is what caught the three real breakages in this change.

## What's in it

**Today** — the session pulled from the plan for the actual date, a readiness
verdict computed from morning HR against its own rolling baseline, recent
session-feel ratings and whether sleep was ticked, then the daily recovery
checklist with a 28-day completion grid and streak.

**This Week** — a rolling, count-based system rather than a day-locked one,
rebuilt to match the 2025 block that actually produced the PBs. Nothing is
assigned to a day: every day starts empty and you record what you did, on
whatever day you did it. The targets are counted over a **trailing seven days** —
**two to three effort sessions**, one 5–8 × 100m sprint day, and four to five gym
sessions. The bars read as bands — `of 2–3`, `of 4–5` — and fill to the bottom of
the band, because two is the number that means the week happened and the third
is allowed rather than owed — so four sessions one week and two the next is the same plan, not a
failure. The readout names the runs and the gym sessions together, and says how
many of the runs were efforts.

**Nothing is required and nothing is removed.** The menu carries every format —
200m through 1km reps, mixed sets, uphill sprints, single all-out efforts at
400m, the mile, 3K, 5K and 10K, plus threshold, fartlek, progression runs,
ladders, mile reps, strides, the two easy runs and an optional long run. You can
log whatever you actually did.

What changed is that **nothing asks for any of them**. There is no easy-run
target and no long-run target, and the absence of either is never flagged — skip
the long run for a month and nothing mentions it. Slow jogging is never offered
as recovery, on a normal week, a deload week or a flagged one; the recovery
options are 5–8 × 100m if you want to run and brisk walking if you do not.

Loggable and suggested are separate. The formats carrying `offMenu` — threshold,
fartlek, progression, both ladders, mile reps — are on the menu so a session can
be recorded, and the rotation prompt and next-week shortlist skip them, ranking
only the formats you named. A menu you cannot record what you did into is worse
than useless; a suggestion engine that keeps offering what you have dropped is
just noise.

The window slides a day
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

Sprints (5–8 × 100m, flat or uphill) sit in their own bucket and are
never counted as effort — alactic work off full recovery, stopped while the reps
are still fast, so nothing is run to fatigue. A 200m session is a hard effort
*and* covers that slot, so the sprint bar reads "covered by your 200m session"
rather than asking for both.

Two to three efforts is the band, not a ceiling. Four in a week with nothing
wrong in the energy or morning-HR log is not flagged at all. Four *with* a
fatigue marker, or five regardless, gets the pull-back note, and the pull-back
is sprints or rest — never an easy run. That check counts the same trailing
seven days the targets do, so four efforts spread across a Saturday and a Sunday
still register.

**The gym is protected.** Four to five sessions a week is a target the running
works around, never something trimmed to make room for a run. No advice anywhere
suggests dropping gym volume to fit the running in.

`LEGACY_GROUP` maps any session id with no pool entry to the group it was
counted under, so a week already logged never changes shape because the menu
did.

**A bad energy rating blocks hard running.** Rate your energy 2 or below on the
Today tab and every effort session in the week gets a stop note, a banner sits
above the grid, and readiness says so outright — it overrides the score rather
than being one signal among several, because it is the one thing you reported
directly. Sprints are never blocked. The rating stands until a better one
replaces it, since feeling rough does not expire at midnight; it goes stale
after three days with nothing new logged, and clears the moment you log a 3 or
better.

**What To Do This Week** — each of the 13 weeks has a shape: which two efforts
it leans on and why, with an optional third under them. Which
day anything lands on is still free. Weeks 1–3 build the engine both goals sit
on; 5–7 sharpen (kilometre reps for the 5K, 600s and mixed sets for the mile, a 3K to
see where you are); 9–11 go race-specific, one week leaning mile, one 5K, one
rehearsing the finish; 13 is the three attempts — mile Monday, 5K Thursday,
400m Sunday, with the 400m last because it is the least important of the three
and something has to pay for the order. The mile needs a higher fitness
than 16:50 does, so the speed work sits late, once the base under it exists.

**Deload weeks are 4, 8 and 12** — every fourth. The deload view replaces the
week's shape with what to do and what not to: one effort at half the usual reps
and full pace, sprints if the legs feel fresh, brisk walking otherwise; no time
trials, no long rep sets, no making up missed sessions, and no second effort because
you feel good — feeling good in a deload is the deload working.

**A day can hold more than one session.** A 5km then sprints afterwards, or
400m reps with a couple of 200s tacked on the end — **+ Another session this
day** adds a block with its own session, pace fields, feel and done tick. The
first session stays exactly where it always was, so nothing already logged
moves; the rest live alongside it and count in their own right: rolling targets,
the monthly hard-session cap, the week review, day type, and session history all
walk every session in a day rather than just the first.

**Every effort session gets read back the moment you type the number in.** It
sits under the pace fields on the card and says three things where it can: how
the pace compares to your own best for that same session and when you set it;
what a single all-out rep of 800m or more is worth as a mile and 5K if you held
the shape, with the VDOT gap to the 16:50; and whether the pace was a genuine
max or sat outside effort pace entirely — slower than threshold reads as a
steady run, not a quality session. It is deliberately hedged: one rep is a
direction, not a prediction, and one slow session is a day, not a trend.

**Carbs around a session, from bodyweight.** Before an effort session the day
card says how much to eat and when — about 1g per kg one to two hours out, half
that if eating closer, low fat and low fibre with it. It comes out of the day's
carb band rather than on top, which is why the band is already set higher on a
hard day. The note disappears once the session is ticked, because after the fact
the number is no longer actionable.

**When a session is logged it says how to recover it** — carbs and protein
within the hour, rehydration, salt if the day's one has not been had, and
whether tomorrow should be nothing. A session rated 4 or 5, or any single
all-out effort, gets the harder version of that advice.

**The AGEs check** fires on a combination, never on volume alone. Training
normally *lowers* glycation — faster glucose disposal, quicker protein turnover
— so a warning that fired whenever you trained a lot would be both wrong and
ignored. It needs heavy load (four efforts in seven days, or a 28-day average
above 3.5 a week) **and** at least one recovery marker failing: energy at 2 or
below twice, morning HR up on two of four mornings, or three bad nights. It says
which, and says it reverses within a week.

**A deload week knows what is already in it.** If the week has logged an effort
session, the deload view leads with that and says to make the rest of the week
sprints or nothing. Sprints never count against a deload — they are what a
deload is made of.

The single all-out efforts (10K, 5K, 3K, mile) are flagged `occasional`:
benchmarks to rotate, not part of the weekly menu.

**Today's Fuel** (top of the Nutrition tab) — log what you actually ate and how
many steps you did. It shows the day against your number and a 7-day average,
says plainly whether a stall is intake drift or something else, and carries the
day's macro targets: protein fixed at 1g/lb, fat at the floor that keeps
hormones working, carbs taking whatever is left, since carbs are the only one
of the three you can afford to move. Steps show against 12,500 with the
shortfall converted to calories, because activity is the lever to pull before
intake. A salt-and-water note appears when the daily readings swing.

**Food Log** — macros per meal, typed straight in. An optional name, then
calories, protein, carbs and fat; leave calories blank and they are worked out
from the macros. The day totals into bars against its targets, with a steer
underneath: what protein or carbohydrate is still owed and roughly what covers
it, fat below its floor, calories over.

There was a 123-food table with micronutrients attached here. It went because
looking a food up is more friction than reading the number off the packet, and
a micronutrient total is only as good as the lookup behind it.

Nutrition in simple mode is now four sections — fuel, food log, where you are,
and the locked reverse — about 270 words against the 1,980 it started at. The
meal plan, weekly food checklist, eight pathways, health notes, honest verdict
and targets are all behind the reasoning switch rather than deleted.

**The reverse is locked** until the 7-day average has held at or below 123.5 lb
for a fortnight, or 28 November — whichever comes first.

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
sprints if the legs feel fresh and brisk walking or rest otherwise. If the week has already had quality in
it, the effort is struck through and marked spent.

**Study** — a daily hours box on Today, totalled over the trailing seven days
against a 16–20 band for two 30-credit modules. It is in a training app for one
reason: study load and training load draw on the same recovery, and an app that
can only see the running will tell you to push in a week you are already buried.
When effort sessions **and** study hours are both high at once, the week view
says so and says which to drop — the session, not the hours, because the
deadline does not move and the session does. Before term starts (SK297 and
SK298, 28 September) the section counts down instead of reporting a shortfall —
a bar reading "16 hours short" every morning for a fortnight is noise, and noise
gets ignored right up until the week it matters.

**Days since your last hard session** sits at the top of the week with the
answer attached rather than the number alone. Rest requirements come from the
block that produced every PB: two days after a rep set, three after an all-out
5K, 10K or mile. Under that it says how many more days to wait; over six days it
flags the deep-rest window that preceded the 1km and 800m bests.

**The deload case is made with his own results, not general advice.** A deload
week leads with the five best performances in the log and what preceded each —
a week with zero hard sessions, seven days since the last one, the day after a
deload ended, two 3-run 15km weeks — and the point that skipping the week costs
the test that follows it, since the tests only work off the back of one. A
general argument for deloading is easy to ignore; your own PB table is not.

**Strava Import** — paste a block of activities and they land on the days they
were run, with the session type, rep count, average pace and best rep worked
out. Re-pasting the same block is a no-op: imported activity ids are remembered.

**There is no in-app OAuth and there cannot be**, which is worth stating plainly
rather than half-building. Three separate walls, any one of which is fatal:

1. The artifact runs under a CSP that blocks every outbound request. A `fetch`
   to strava.com fails silently — no prompt, no visible error, just nothing.
2. OAuth needs a registered redirect URI that receives the callback and a server
   to exchange the code for a token. A single HTML file has neither.
3. The exchange requires the client secret. In a one-file page that secret sits
   in plain text in something anyone with the link can read, which leaks it and
   breaches Strava's API terms.

So the transport is a paste and the mapping is the part that carries the value.
Classification reads the activity **name** first, since a name like "4 × 600m"
is more reliable than anything inferrable from distance and time: an explicit
`N × D` sets both session and rep count; ladders are caught whether written
`200-400-600-400-200` or with spaces; threshold, fartlek, progression, hills,
strides, sprints and long runs match on keyword. Only when the name says nothing
does distance decide, with pace separating a 5K test from a 5K jog.

Strava's **best efforts** need filtering, not trusting: on a set of 400s the
"fastest 1K" spans the recovery jog between reps and reads as nonsense. One is
only used if its distance fits inside the distance actually covered and its pace
is quick enough to have been run rather than jogged through.

An import never overwrites a day that already has something on it — it becomes
the second session on that day. Imported days are marked done without passing
through `toggleDone`, so session history is rebuilt from the grids afterwards or
Block Bests, the PB board and the rolling counts would all miss them.

**Heart rate is not imported**, because it is not there: the activities carry
`has_heartrate: false`. Nothing in the app invents a number that was never
recorded.

**Model** — Nutrition and Skincare are one tab now, led by **The Look**: a
countdown to 28 November and a phase that changes as it approaches.

- **Working phase** (over three weeks out) — almost entirely one thing, get the
  weight down at the rate on Progress, and it names the weight that lands you.
- **Hold** (inside three weeks) — stop changing variables. No new supplements,
  no new actives, no extra sessions, no deeper deficit.
- **Final week** — nothing new, nothing harder, nothing lower. Carbs up about
  50g for the last three days, out of the existing band rather than on top,
  because glycogen pulls water into muscle and that is the difference between
  full and flat. Salt and water do not move.

Under it, the levers in the order the evidence puts them: body fat, then
shoulder-to-waist, then posture, then the neck (a jaw only reads as strong
against the neck under it, and the neck thins early on a cut — the same
mechanism that hollows the under-eye), then skin (one intervention — SPF daily —
beats the rest combined), then sleep, then not dehydrating. Plus the things
not to do, all of which are the classic ways people ruin a date they have
worked seven weeks for.

**The Protocol** is the same material as one list rather than eight sections —
every day, every week, what each food is actually doing, sleep, and skin. It
exists because the tab had all of it and none of it in one place, and a thing
you have to remember across eight sections is a thing you stop doing. It also
answers the under-eye question directly: salt can shadow the eye indirectly
(sodium holds fluid, fluid pools overnight, the swelling casts a shadow), but
that is the puffy kind and a once-a-day salt habit is not high — short sleep
dilates the vessels under skin that is already thin, and a cut takes the little
fat the area has. So the answer is sleep, and cutting salt fixes none of it.

It also carries **the carb floor**, computed from current weight rather than
fixed: the bands he is aiming at, 3 g/kg as the line where session quality
starts going, and 2 g/kg as the line where it stops being a diet. Under it,
seven things that break and why — glycolytic sessions first, then T3 and the
stall it causes, leptin and the NEAT it silently costs, cortisol (which puffs
the face he is cutting to sharpen), muscle spent in-session, muscle gone flat
because glycogen carries three times its weight in water, and sleep. The rule
that falls out: the deficit comes from total calories, and if something has to
give it is fat to its floor and then steps, never carbs.

And **a year of higher salt is not a year of stored water** — the kidney adapts
within days to a couple of weeks, so there is no backlog. Cutting it would buy
1–3 lb of water in four days and then stop, while raising aldosterone and renin
so the rebound is worse, and costing blood volume in the middle of a block built
on hard running. Salt holds at once a day; the levers that move how watery he
looks are potassium up, cortisol down, and fat off.

**Ask** leads the Model tab: a box you type a question into in your own words,
over an indexed set of the answers actually arrived at — the jaw and cheek
differential, the salt and under-eye questions, the carb floor, the weight
floor, refeeds, deloads, creatine, vascularity, stalls, sprints, the reverse,
uni load. It scores whole-word and stem hits against each entry's keywords and
question, shows the best match plus up to three near ones, and requires at least
one whole-word hit so a loose stem match cannot pass as an answer.

It says plainly what it is: a search over real answers, **not a model thinking**
— a published artifact cannot run one. The capabilities available to this
account are `downloads`, `mcp` and `self`, and none of them is a completion, so
rather than fake it the page is honest and useful instead. A question it cannot
answer is parked in `localStorage` with its date and listed under "waiting on a
real answer", to be brought to a real conversation and added.

It replaced a static section on the jaw and cheek question, at his request —
the content survives as one of the entries, reachable by asking rather than by
scrolling.

**Does It Fit** checks the intake against the macros rather than against a
target rate. Protein and fat are floors, so they take 1,154 kcal before a gram
of carbohydrate; whatever is left is carbs, and on a hard day there may not be
enough left. At 1,799 there isn't — it affords 161g against the 200g a hard
session wants, which is 2.7 g/kg, under the 3 g/kg line where quality starts
going. The fix it gives is redistribution, not more food: ~1,954 on hard days,
~1,694 on rest days, which averages within a few kcal of the flat number and
leaves the weekly deficit untouched. Protein and fat never move; only the carbs
do, and only between days.

It also predicts maintenance from real stats — Mifflin-St Jeor on 5'8", the DOB
(28 November 2000, so age is derived rather than stored) and current weight,
with a 1.5–1.6 multiplier because the running volume is genuinely low. It is
labelled a prediction, and says plainly that the measured TDEE from fourteen
days of weights beats it.

**Three Plans** is the same rotation under three different jobs, because the
foods barely move between them and the energy does. **Shred** (now to 7
November) is a deficit: protein fixed, fat at its floor, carbs the only dial and
spent where the sessions are, beetroot daily because vascularity is low body
fat plus full glycogen plus nitric oxide and food only controls the third.
**Model** (the final fortnight, or any held weight) is maintenance, where the
face pathways live — collagen with vitamin C an hour pre-training, anti-glycation
as a cooking rule rather than a shopping list, the lipid barrier that makes
"glow" mean skin holding water, carbs up ~50g for fullness. **Rebuild** (7
November on) is the slow surplus: carbs back before fat because carbohydrate
restores T3 and leptin per calorie and fat restores almost none of it, creatine
finally allowed in now the weight trend no longer has to be read cleanly, beef
heart for CoQ10, pomegranate for urolithin A.

Each card names what it does, what it holds back and why, and a comparison
table puts the three side by side. The rule underneath is pathway 8: **you
cannot build and clear at the same time.** mTOR and autophagy are opposing
switches, which is why this is three plans rather than one — a cut cannot also
be an anti-ageing protocol, and the reverse is not a reward but the half of the
plan where building happens. The app knows which plan is live from the same
phase logic that drives The Look.

**Your Day** is the rotation as actually eaten, four numbered meals in order:
oats with Estate Dairy milk and raw honey (or eggs), the collagen smoothie,
meat and roots, the yoghurt bowl. Oats and rice cakes both **certified
gluten-free**, always. It is labelled as the *cut* version, because breakfast
changes on 28 November — from the reverse onwards it is 5 eggs and 5 lentil rice
cakes, which carries the calories and suits training better. Nothing else in
the day moves.

There was a Shape section tracking waist and shoulders weekly; it came out at
his request. The ratio it derived was a good number, but a tracker nobody fills
in is worse than no tracker, because it reads as an outstanding task forever.

**Skin** is its own section, built around skin that reacts. Glow is framed as
what it physically is — light off a smooth hydrated surface — so barrier is
ranked first and the boring instruction (moisturiser onto damp skin, twice a
day) is the one that does the most. The single named active is **niacinamide
4–5%**, because it builds barrier, calms redness and evens tone while being
tolerated by skin that cannot take retinoids; exfoliation is **PHA only**, twice
a week, never glycolic or salicylic.

**Tinted SPF is treated as the headline product, not a cosmetic preference.**
Tinted sunscreens carry iron oxides, which block visible light where plain SPF
does not — and visible light drives pigmentation and worsens facial redness. So
for him it is the better sunscreen, it evens tone optically, and it supplies the
warm colour he wants daily with no UV. One step, three jobs.

On the tan: tinted SPF first, facial gradual self-tan (DHA, which never reaches
living tissue) as an honest second, actual sunbathing refused with the reason —
80% of facial ageing is UV, so chasing a real tan and anti-ageing at once is the
most self-contradictory thing available. Beta carotene stays off the list.

A countdown says how many days remain before the month-out cut-off, after which
nothing new goes on his face — with the instruction to start one thing at a time,
a fortnight apart. The section ends by naming what products cannot do: sleep,
being too lean and water retention decide more than any bottle, and a flat face
at 120 lb is not rescued by a serum.

**The window is Saturday 19 September to Saturday 28 November**, his birthday —
ten weeks rather than seven. The taper came down with it: **0.6% of bodyweight a
week easing to 0.4%**, not 0.9% to 0.5%. The old rates over the new window would
have hit the target in week seven and left three weeks of holding; these arrive
at the deadline, which costs less muscle and less cortisol for the same landing
weight. The too-fast/too-slow band moved with them (0.3%–0.8%), because the old
0.5%–1.0% band would have read a correct, gentle rate as too slow every week.

The deadline is no longer a literal string in twenty-five places. `deadlineLabel()`
and `deadlineShort()` derive it from `REVERSE_DEADLINE`, so moving the date moves
the words. It has now moved twice.

**The Cut** projects forward as well as back. Every week of the cut gets a row,
oldest first, with **Should be** — the average the taper asks of that week — and
**You were**, the average actually logged, with the count and how far off target
it landed. Weeks ahead carry only the number to aim at, so the column reads as a
line going down and a week that drifts is visible immediately.

The projected average is the **midpoint** of the week, not its endpoint, because
that is where a week's average sits when weight comes off evenly.

**The start line is an average, not a morning.** `cutBaseline()` builds it, and
the note above the table shows what it was built from. Every row of the table
judges a weekly average, so the line it judges against has to be built the same
way — otherwise the first comparison is decided by whatever the scale happened to
say on one day. His own three readings that week spanned 1.4 lb (128.6 / 127.8 /
129.2); seeded from the high one the whole curve sits half a pound high, from the
low one half a pound low, and week one reads wrong either way for no reason but
luck.

The baseline uses the **first seven days inside the cut** and needs two readings
before it will draw anything. Nothing from before the start day counts, and that
is deliberate rather than tidy-mindedness: he refeeds the night before he starts,
so the last pre-cut morning is carbohydrate and water. Seeding ten weeks of
targets on it would build the whole curve off a number that was never bodyweight.
Until the second morning is logged the panel says what it is waiting for and why.

The isolation goes further than the projection. `cutCurrentLb()` and
`weeklyRateOf()` mean **every number in the cut panel reads in-cut mornings
only** — the 7-day average, the rate, the BMI line. A rolling average that
reaches back across the start day blends a refeed into the number the whole panel
works from, and a rate measured across that edge compares a week of eating
normally against a week of not. Both would say the cut is going better than it is
during its first fortnight, which is exactly when he is most likely to act on the
number.

Nothing is deleted to achieve this. The pre-cut weigh-ins stay in the log and
still appear in Every Week and on the chart; the cut simply does not read them.

Readings are **walked back to the start day** at the opening rate, because an
average sits at the middle of the days it came from rather than the first of
them. The note shows both numbers — the measured average as the headline, the
walked-back figure named separately as what the curve actually starts from.

The final row's label is clamped to the deadline — its length always was, but
the label read as ending after the cut it belonged to.

**A countdown** sits at the top of the section: days to 28 November, the same in
weeks, and either how long until the cut opens or how far into it he is.
`cutCountdown()` derives all of it from `REVERSE_DEADLINE` and `cutStart()`.

`fmtD()` and `fmtDate()` now build **day-first dates by hand** instead of calling
`toLocaleDateString`. `deadlineLabel()` always spelled out "28 November", so on
any device not set to British English the page read "28 November" in one sentence
and "September 19" in the next.

## Did the Day

Two ticks a day — calories and steps — on the Model tab under The Cut. The
distinction it draws is between being on a cut and saying you are.

The numbers are **his own template from the last time he got shredded**, not a
generic one: 15,000 steps Monday to Friday, a deliberate low Saturday, 10,000 on
Sunday, two hard runs, a five mile, and either sprints or an easy 5km. Copying a
week that demonstrably worked for him beats inventing a better one.

Saturday is a **ceiling rather than a floor** — under 8,000. A 15,000-step
Saturday is not a better week, it is a missing rest day.

Calories cycle with the training: `cutKcalFor()` returns `targetKcal() + 200` on
a day with a hard run and `targetKcal() - 80` otherwise, which averages back to
the number he set, so the cycle never quietly becomes a bigger deficit than he
chose. Hard days are read off `cutSessionsOn()` — the week grids, by date — so
the sheet follows the week he actually did rather than the one he planned.

Steps **tick themselves** from the count already logged on the Nutrition tab, so
he is not entering a number and then ticking a box for the same number. The tick
stays overridable in both directions: `stepOk` is tri-state, and an explicit
`false` survives a step count that would otherwise pass.

The verdict is **5 of 7 days clean**, not 7 of 7. A rule you break once and
abandon is worse than one you can hold, and two ordinary days off target across a
week do not undo a deficit. When the week is short of the mark it names whether
calories or steps is the lower of the two, because that is the one to fix.

Future days render disabled — a day that has not happened cannot be a missed one.

Building it surfaced a real mis-calibration. The taper's own rates (0.9% easing
to 0.5%) land at **121.6 lb** on 28 November — which is exactly BMI 18.5, the
clinical underweight line, with no margin whatever. The projection now clamps at
**122.5**, the middle of the stated 122–123 target, which means it reaches the
target at the end of week 7 and holds through week 8. The note says so plainly:
the target binds before the deadline does, arriving early with time to settle
beats still losing weight on the day, and the underweight line is quoted
separately as the thing the plan deliberately does not aim at.

Its weeks end on a **Sunday**: week 1 is a stub
from the start day (a Tuesday) to that week's Sunday, and every week after it is
a clean Monday-to-Sunday, so cut weeks line up with block weeks instead of
straddling two of them. Part-weeks are visible rather than hidden — the reading
count is shown, so a six-day first week cannot be mistaken for a quiet one.

It is the same week-by-week idea as Every Week, but
counted from the cut's own start and with the column that matters being what the
average did against **what it was supposed to do**. Target drop walks the taper
forward a week at a time — 0.9% of bodyweight at the start easing to 0.5% by the
end, because the same percentage is fewer pounds as you get lighter — and a week
reads *on*, *under* or *short* against it. The summary line gives pounds down,
weeks left and the projected landing; the footer says that two short weeks in a
row is a signal and one is noise.

The Model tab is now five things and nothing else, at his request: **the cut,
the reverse, tracking, nutrition, skincare** — Ask, The Cut, The Protocol
(which carries the daily list, sleep and skincare), Today's Fuel, Food Log, Your
Day and Reversing. The Look, Three Plans and Does It Fit came out; their
guidance either lives in The Protocol or is reachable through Ask.

**This Week So Far** answers the question the trim accidentally removed with
the Week Review: what have I actually done *this* week. It reads the **calendar
week**, not the trailing seven days, because that is what the question means —
every run in day order with its detail, pace and feel rating, the gym sessions
with their splits, the date range and the week's steps. Empty weeks say so
rather than rendering nothing.

**Rolling Targets** now opens with a counts strip — **runs, efforts, sprints,
gym** as four plain numbers. The run total deliberately has no bar and no
target: nothing in the plan asks for a number of runs, so it sits there as a
count because he wants to see it beside the efforts, not because anything is
owed.

**Every Week** is the block as one table, newest first: runs (and how many of
those were efforts), gym sessions, total steps, and the week's **average**
weight with the change against the week before. Each row opens to the sessions
themselves. Deload weeks and the current week are labelled, and a totals line
sums the block.

The weight column is deliberately an average rather than a reading. Two single
mornings a week apart are mostly water; seven readings against seven readings is
the comparison that means something. Steps show how many days of the week
actually carry a number, so a part-logged week cannot masquerade as a low one.
It reuses `reviewData` and `weekSteps`, which already did all of this for one
week at a time.

**Deload weeks are 4, 7 and 12.** Week 7 was pulled forward from 8 — back from
Rome and he called it himself, which is the right way round: a deload taken
because you feel you need it beats one taken because the calendar said so. Week
12 sits three weeks before the week-13 attempts, the spacing that preceded his
1km and 800m bests. The field in Setup overrides the default.

**The Cut** — a bounded window on the Progress tab, opening 15 September and
closing on 28 November whatever happens. The start line is **whatever you first
weigh on or after the opening date**, not a number set in advance, because the
weight you come back from a trip at is not knowable beforehand. From there it
reports the loss, the days left, **this week's target loss**, and the rate against
a **0.5–1% of bodyweight a week** band, with the reason attached: under the band is not a stall and is
never answered with fewer calories; over it means part of what is leaving is
muscle and glycogen, and the answer is to eat more. The target **tapers** — 0.9% of bodyweight a week at the start,
0.5% by the end — because the leaner you get the more of each pound comes out of
muscle rather than fat, so the same percentage costs more in the last week than
the first. Hitting a smaller number later is the plan working. The 28 November
landing is projected by walking that taper forward a week at a time rather than
multiplying today's rate by the weeks left, which would overstate the finish.

**The floor is a named weight.** At 5'8" BMI 18.5 — the clinical underweight
line — is **121.6 lb**, and the 122 target sits at BMI 18.6: about a pound of
headroom. Stating it turns a cautious-sounding limit into a real one. It is a
hard stop rather than a target — the real floor is whichever arrives first, that
weight or two or three of morning HR drifting up, strength dropping rather than
stalling, sprints going backwards, sleep breaking up, libido gone, always cold.

**Every weigh-in is read back.** Under the weight box: today's number against
the 7-day average, what the average is doing, and whether to change anything.
The point is to stop one morning being treated as a trend.

It accounts for the lag. A trailing average sits behind a falling trend by
roughly half a week's loss, so on a working cut today *should* read under it —
calling that water would be wrong and would train you to discount the one number
that is real. Only deviation beyond what the trend explains is called water.

**The refeed call** fires on markers, never on a schedule, and never before day
fourteen. It needs a genuine stall (the 7-day average barely moving across a
fortnight), three low energy ratings in seven days, or morning HR up on three of
seven mornings. A refeed taken while the rate is fine just slows the cut for
nothing.

The amount comes from `tdeeEstimate`, so it is the real gap between measured
maintenance and actual intake rather than a rule of thumb, converted to grams of
carbohydrate and capped at 300–800 kcal. It says to hold fat and protein where
they are, since carbs are what restore leptin, T3 and training quality and fat
added on a high-carb day buys none of that; to place it on a hard day or before
a test; and to expect 1–2 lb on the scale the next morning that is gone within
three days.

**A chart of you against the target.** `cutTargetCurve` walks the taper forward
a day at a time from whatever the first weigh-in actually was, and the chart
draws your logged weights as a solid line against that target as a dashed one,
with the 28 November figure marked. Above the dashed line is behind, below is
ahead, and the readout says which and by how much rather than leaving it to the
eye.

The verdict is **suppressed for the first ten days**, because a cut that starts
the day you land from a trip spends its first week shedding food volume, sodium
and glycogen. A flattering first week read as a rate is what produces the
correction that wrecks the second one.

The **Where You Are** step box on the Nutrition tab is now phase-aware. It was
written for the reverse and rendered during the cut, so a flat week mid-cut was
answered with "add 75 kcal" — the exact opposite of the right call. While the
reverse is locked it compares the week against the tapering target instead:
too fast says add carbs, on-rate says change nothing, and a slow week says wait
a fortnight rather than cut.

It also refuses to name a lowest safe weight, because that number does not exist
without height and body fat, and the scale keeps moving long after the point
where it stops being worth it. The floor is stated as a set of markers instead —
morning HR drifting up, strength dropping rather than stalling, sprint times
going backwards at unchanged effort, sleep breaking, libido gone, always cold —
and two or three of those together is the bottom whatever the number says.

**Potassium** — a daily target on the Nutrition tab: 3,500 mg floor, 4,700 mg
ideal, against a typical intake of 2,000–2,500. It matters more on a cut than
off one, since glycogen binds potassium and a cut drains both, and it is what
balances sodium — which is the whole of the watery-feeling question for someone
salting once a day and not sweating much. The section carries a food table
(a large baked potato with the skin on is ~1,600 mg and closes most gaps alone)
and one hard rule: **food only, no potassium tablets**, since supplements are
capped at 99 mg a tablet because a large single dose can trigger an arrhythmia.

**Reversing** now leads with guidance rather than the ladder. It states the
target — 0.25 lb of muscle a month, which is near the ceiling for someone
already trained, on a surplus of about 125 kcal a day — and then the three
things that go wrong for someone who has never done it:

- **The scale jumps 2–4 lb in the first fortnight and none of it is fat.**
  Glycogen carries about three parts water per part stored. Neither muscle nor
  fat moves that fast on 125 spare calories. This is where people panic and cut
  again; the section says not to judge it before week three.
- **The puffy face is aldosterone, not fat.** Weeks of restriction up-regulate
  sodium retention and it does not switch off on day one. The protocol is: raise
  carbs without raising salt, keep potassium up *through* the reverse, do not
  cut water (that raises vasopressin and makes it worse), keep steps and sleep.
- **The slow ramp does not repair your metabolism.** Eating more does, and that
  happens on a fast ramp too. The ramp limits fat regain and keeps the water
  swing manageable, which are good enough reasons — but the section says what
  you are actually buying rather than repeating the claim.

Two numbers decide whether the surplus is too big, after the water settles:
more than 0.5 lb a week, or a moving waist. At 0.25 lb a month the scale should
barely show it, and that is the point.

**Calisthenics** — the optional fifth session, treated as records rather than a
workout. Three formats: 40 minutes of max push-ups and pull-ups, max push-ups in
one set, max pull-ups in one set. Each carries its best, and logging one says
whether it beat the record and by how much, or how far off it was. The
40-minute PB of 392 push-ups and 138 pull-ups is seeded as a standing record and
stands until a logged session beats it, after which the log takes over entirely.

**Hard sessions are capped at ~10 a month**, counted over a trailing 30 days —
his own sustainable rate, checked against a full block that worked. Gym counts
as load alongside them, and a 40-minute calisthenics test counts as a hard day
in its own right rather than free volume.

**The deload trigger is his, set in advance**: morning HR 8+ over the rolling
baseline for two days running, energy rated 2 or below two days running, or poor
sleep on two of the last three nights. Any of those and the week becomes easy
running only, said outright at the top of the week.

**Macros follow the day type.** Protein 158g and fat 58g are floors hit every
day; carbs are the dial — 200g+ on a hard day, 150–170 on a gym day, 120–150 on
rest. The day type comes from what is actually logged, and a 40-minute
calisthenics test makes it a hard day whatever the running says.

**A plateau under two weeks never triggers a cut.** His history has genuine
four-week stalls in the 126–128 range that broke on their own, so inside two
weeks the app says change nothing rather than reaching for the calories.

**The Long Game** — the all-time targets (sub-51 400m, sub-4:30 mile, sub-15:00
5K) priced honestly in VDOT and years at a pessimistic 2.5 points a year, with
the 400m explicitly left unpriced because VDOT cannot model an anaerobic event.
It says plainly that sub-15:00 is a different athlete and that none of it
changes what happens next Tuesday.

**Benchmark prompt** — after 21 days with no logged test, it asks for one,
rotating 400m, mile, 5K.

**Rest is deliberately not tracked.** There is no spacing check, no back-to-back
warning, and nothing that asks why you did not run yesterday. The 2025 log has
eight breaks of two or more days off and two pairs of back-to-back effort days,
and the PBs came anyway.

**The 2025 Block** — that log, kept as data so the figures under it are counted
rather than claimed: what it averaged per week (which is where the ~2 and ~2
targets come from), which effort formats kept recurring despite free choice
every session, and how the rest actually fell.

**Week Review** opens itself on a Sunday, with a line saying why: it is the end
of the week and the review is the point of the page. It covers the whole week,
not only the running — every run with pace and best rep, gym by split, steps
total and average, weight against the week before, then food and protein
averages, energy, morning HR against baseline, sleep nights ticked, and any
calisthenics test.

Under that, **Next week** is argued against every goal rather than just the
training: the weight rate and how many weeks remain at it, whether protein held
the 158g floor that protects the muscle, steps as the lever before calories,
what shape the running should take and which sessions to pick from, whether a
benchmark is due, and what the recovery markers are asking for.

It reads the week you are looking at off its own grid
rather than a rolling window, since a review is about a week that finished.
Every run with its average pace and best rep; the gym count broken down by split
(shoulders & forearms, chest & triceps, back & biceps, legs — logged from a
dropdown that appears when you tick **+ Gym**); lowest and average weight against
the week before; then a verdict.

The verdict counts recovery markers over that week — morning HR against
baseline, energy ratings, live niggles, average session feel, effort count. Two
or more agreeing says back off; one says hold; a quiet week with nothing
flagged says push. The suggested sessions for next week follow the verdict
rather than ignoring it: a back-off week gets one effort, sprints and rest,
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

**Personal Bests** sits under it: one row per distance — 100, 200, 300, 400,
500, 600, 800, 1000, mile, 3K, 5K, 10K — showing the best ever run at each, the
date it was run, and the block target where one exists. It is best-ever, not
latest, so a slower run never displaces a PB, and a distance beaten past its
block target is marked. Nothing is seeded: the board is empty until times are
entered, and the log field carries a date so an old PB goes in with the date it
was actually run rather than today's.

It reads **both** sources — benchmark tests and the sessions ticked off on This
Week — because a time is a time wherever it was run. The effort sessions are
all out off full recovery, so the fastest rep of a set is real evidence; it is
labelled *fastest rep* with the session it came from, since a 300m out of six
is not the same thing as a 300m the day was built around. A benchmark test
displaces a slower rep and stops carrying the label.

For that to work the app has to know what distance a session was run at, and it
now takes that **from the session itself** — `eff_300` is run at 300m — rather
than requiring the distance to be retyped into the detail box first. That
requirement was silently dropping logged sessions: reps entered under "300m
reps" with the detail box left empty produced no rep distance and reached
nothing downstream. The detail box still wins when filled in, so "4 × 200m"
inside a 300m session records 200s. The single all-out sessions (400m, mile,
3K, 5K, 10K) carry their distance the same way and are marked `solo`: their
finishing time is the result, and the numbers in the splits box are laps, so
the fastest of them is never read as a best rep.

Sessions already logged under the old rule kept their null `repDist` in stored
history, so fixing the rule alone left every past session still invisible.
`backfillDistances` runs once at boot and recovers them from what the row
already holds — the detail box first, then the session id, then the session's
name for rows old enough to predate the id — and writes the result back. It
fills gaps only: a best rep or average pace typed by hand is not recoverable
from what the row stores, so it is never overwritten. Distance is taken by name
from an explicit list rather than a pattern, because "5 mile threshold" is 8km
and a regex that read a mile out of it would put a fictional mile PB on the
board. Whether a row was a set is decided by its detail box, not by whether a
distance was found, so a mile session stays one effort and its laps stay laps.

Distances outside the twelve get an **Other distances** table under the main
one. A 2300m rep is as real as any other time; it just has no target to sit
beside, which is not a reason to drop it.

Benchmark bars sit under that. There are **no seeded block-start times**: a bar
measured from a number that was never run measures nothing, so the first test
logged at a distance becomes that distance's start line, and the bar stays empty
and says so until then. The six distances with no block target (100, 300, 500,
600, 3K, 10K) show a PB line instead of a bar, and stay out of the section
entirely until something is logged at them.

Below that, an estimated VDOT and VO2max charted across the block. Only aerobic tests
(800m, 1000m, mile, 3K, 5K, 10K) feed it; anything shorter is largely anaerobic
and would produce a meaningless number, so it is excluded and the section says
why. It also derives
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

**Model** — the merged Nutrition and Skincare tab. rebuilt around eight biological pathways rather than food
groups: collagen hydroxylation, anti-glycation, eNOS microcirculation, Nrf2,
lipid barrier, intracellular hydration, mitophagy and pulsed mTOR. Each carries
what it does, what feeds it, and the one lever that decides whether it works at
all — garlic crushed and rested ten minutes before heat or the allicin never
forms, nitrate needs the oral bacteria that antibacterial mouthwash destroys,
collagen is inert without vitamin C. Broccoli sprouts are deliberately absent
from every one of these: they are the most potent dietary Nrf2 activator there
is, and they sit badly with him, so pathway 4 is carried by training, garlic,
green tea and coffee instead, and the tab says as much rather than pretending
the substitution is equivalent. Alongside: what each meal of the actual diet is feeding, coeliac
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

## The reset — a 10-week cut block

The 13-week block is gone. `BLOCK_WEEKS` is 10 and the block runs with the cut
instead of across it, so the two no longer disagree about what week it is.
Saturday 19 and Sunday 20 September are pre-block: the weigh-ins that build the
start line, and a 3km to test where the fitness actually is.

**The benchmarks now carry evidence.** Each `BENCH` row has a `y26` field pulled
off Strava rather than retyped from memory — `avg` is the best session average at
that distance, which is the number he asked to be judged on, and `best` is
Strava's single fastest effort where it computes one. A target with nothing
underneath it is a wish.

Two targets changed. 800m went to **sub-2:10** at his request. The 1000m he gave
alongside it was 2:40, which is 64.0 s/400 against the 800's 65.0 s/400 — a
faster pace over a longer distance, which is not a thing that happens. It is set
to **2:46**, the same fitness expressed over 1000m, and the reason is in a
comment beside it.

**The goals are his, and they carry a pace.** `CUT_GOALS` holds 48 gym, 21 hard
runs, 43 runs all in, 13,000 steps a day and 122–123 lb, counted from the start
of the cut by `cutTally()` off the same week grids everything else reads. A total
with no pace attached is how you arrive at the last fortnight owing eleven gym
sessions, so `goalPace()` gives each bar a faint marker at where it should be
*today* and names the weekly rate needed to finish from here.

**The steps reconciled themselves.** His remembered pattern (15k Mon–Fri, low
Saturday, 10k Sunday) comes to 91,000 a week, which is 13,000 a day — the average
he asked for. Both numbers were the same number. Saturday's ceiling tightened to
6,000 to make the arithmetic exact.

The easy 5km is off the weekly template at his own call, and he is right: 5km
easy is ~300 kcal and 45 minutes where the same time walking moves more and costs
no recovery. It still counts as a run; it no longer owes him a slot. Gym went to
a flat 5.

## The days it goes up

He has said twice that the mornings the scale does not move make him angry, and
that is the failure mode most likely to end this cut — not hunger, not the
training. `patienceNote()` answers it with his own numbers rather than with
encouragement: how often the scale actually rose over his last fortnight, what
the average did across those same days, and how far apart his own new lows have
been while it fell anyway. Expecting a new low every morning is expecting
something that has never happened, on a cut that was working.

`lowHistory()` finds every morning that set a new low and the gaps between them.
A new low gets its own line above everything else, with what it beat and how long
ago — and `WEIGHT_MARKS` names the round numbers so 127 and 125 are things you go
*through* rather than past.
