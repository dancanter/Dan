# Dan — athlete profile

The single source of truth for anyone (human or Claude) working on Dan's
tracker. Read this before changing the app or giving Dan advice. Last
updated 3 Nov 2026.

---

## 1. Who Dan is

| | |
|---|---|
| Age | 25 — born **28 Nov 2000** (turns 26 on the last day of the cut) |
| Height | 5'8" (172.7 cm) |
| Sex | Male |
| Weight | 7-day average **127.2 lb** (23 Oct 2026); cut low 126.6 (20 Oct) |
| Work | Model — the look is part of the job |
| Study | University (term started 28 Sep 2026) |
| Location | North Kesteven, Lincolnshire, UK (runs on the flat; hills on the Lincoln Edge) |
| Strava | Connected (read-only MCP) |

**What Dan wants, in order:** look shredded, chiselled and extremely healthy
(model face, glowing skin, no bloat) → maximum muscle → long-term health and
cellular ageing → faster race times → fun (XP, achievements). Low stress
throughout.

---

**Food philosophy (Dan, 3 Nov):** animal foods and animal products first (eggs, dairy, kefir, wild fish, shellfish, red meat, venison, heart and kidney; never liver): the most bioavailable nutrients. Plants are supporting (fruit, potatoes, root veg), not a target: no plant counting on the main screens.

**The five aims (Dan, 3 Nov):** maximise looks, health, longevity and performance, and keep stress low. Every suggestion should serve these together, ranked by how much difference it makes, and be offered as advice, never as an order.

**In one line (Dan, 5 Nov):** only health, improving his times, and looking utterly attractive — and **every calorie has to matter**: each one should bring protein, absorbed micronutrients, fuel for a session, or skin and recovery benefit. No empty calories, no filler.

**The main one (Dan, 4 Nov): low stress and low cortisol, to be the healthiest person he can be.** When aims pull against each other, the calmer option wins: no marathons or other crazy-volume goals, never stack hard sessions, rest over grinding, enough food and carbs around training, sleep first. Performance and looks are chased only in ways that keep cortisol down.

## 2. Hard rules — never break these

**Medical / food**
- **Coeliac.** Oats, grains, granola, collagen, chocolate and nuts must be certified gluten-free.
- Never recommend **beta-carotene, biotin or vitamin D tablets**, **liver**, or **high-dose vitamin C**.
- Excluded foods: broccoli, sprouts, cabbage, kale, rocket, watercress, spinach, olive oil, green tea, Brazil nuts, lentils, onion, leek, garlic.
- **The push, 16 Nov – 24 Dec (Dan, 12 Nov):** "I really want to push the running and times and really push the shred… shredded, optimising muscle and running times, and obviously health." Not the old push (5 Nov): nothing is dropped. The full week of runs (16–22 Nov back: Norwegian first, then 600 m+, then speed, no 2nd Norwegian; 23–29 Nov full: 2 hard + Norwegian + 2nd Norwegian if cortisol < 25; 30 Nov – 5 Dec France: one hard + one Norwegian before 3 Dec, walks there; 7–24 Dec sharpen with the trials, lighter 4–5 days before each). Gym 4+, beat last time. Calories as the shred, never lower. Precision: every gram weighed and logged in the app (MyFitnessPal entries overcounted protein). Protein 140 g in 4 feeds. Steps 11–13k as the week average. Oily fish 2–3×/wk. Sleep 8–9 h. Weight line from 128.3 (16 Nov) to 123.5 (24 Dec), about ¾ lb a week; above the line for a week → tighten logging and add a gym session, not steps or fewer calories. The one gate: cortisol 45+ eases the week. In the app: `PUSH2`, `push2HTML` (`#pushCard`, top of the Overview). The old `PUSH` stays off.
- **Gym 5 a week, 6 on a good week, whatever the scale (Dan, 12 Nov):** "I want 5 gym sessions anyway, even 6 — I want that look." `CFG.camp.tmpl.gym` is 5 (quest "Gym, 5–6 a week"). The extra session goes to what shows on camera (shoulders and arms, then upper chest, then back; `nextLift` falls back to these when every muscle is in range), never the same split two days running, legs never the day before a hard run, and one full day a week with no session. A 6th only on a good week (cortisol under the cap, sleep 8 h+, no session felt 9–10). The 127 check now only decides the 2nd Norwegian cap and steps.
- **Looking sculpted comes first (Dan, 12 Nov):** "I want this so bad… even if it does cause stress I want to look sculpted." Low cortisol stops being the tie-breaker; the look and the times win close calls. Never changes: calories ≥ 1,799, sleep 8–9 h, the 45+ cortisol gate. Watch for (and hold, not cut harder): binges back, always cold, sleep worse, low mood or libido, hair shedding, runs slower 2+ weeks. **The 127 check:** any morning below 127 (126.9 or less) from 12 to 16 Nov → only more gym (up to 5 a week). Not hit → from 16 Nov the full push: gym up to 5 (5th on a good week: shoulders, upper chest, arms, back), the 2nd Norwegian allowed under cortisol 35 (not 25), steps 12–13k week average. In the app: `push2Mode`, `norwCap`.
- **One-tap meals (Dan, 12 Nov):** `glow/src/data/meals.ts` (`MEAL_PRESETS`): collagen smoothie, 4 eggs + 4 Kallo cakes, chicken potatoes & veg, cacao porridge, yoghurt bowl. Buttons on Glow's Food tab ("What you ate"); today they go in the slot for the time of day. Dan: "you might not know all the varied possibilities I have" — so his own come first: **☆ Save as one-tap** on any logged meal (`S.glow.myMeals`), then **🔁 You keep having these** (`usualMeals`: any slot of 2+ foods logged the same way on 2+ days in 6 weeks, grams averaged), then the starters. Edit removes any (`S.glow.hiddenMeals`); both merge across devices by id. Dan, 12 Nov (later): he keeps sending MyFitnessPal screenshots and Claude logs them in the app (check each MyFitnessPal entry against the library: raw vs cooked chicken overcounted protein), tracks which meals he repeats and how often, and saves his favourites as one-tap meals (`S.glow.myMeals`) once a combination comes back.
- **Supplements (Dan, 11 Nov): astaxanthin is 8 mg a day** (food `uk-astaxanthin-8`, in `dailySupps`), not 16. Protein Works Collagen Whey (`uk-tpw-collagen-whey`, bovine collagen types I and III with added vitamin C and zinc; macros estimated from 67 kcal per 18 g until the label is sent).
- **Supplements (Dan, 5 Nov, superseded on dose):** astaxanthin, taken daily. He said "16,000 IU or mg"; astaxanthin is dosed in mg, so recorded as **16 mg a day** — to be confirmed on the label (if it is actually 16,000 IU of vitamin D or A, flag it: that is 4× the vitamin D upper limit, and vitamin A as retinol is stopped). In the app it is a daily supplement (`S.glow.profile.dailySupps`, food `uk-astaxanthin-16`): counted on every day with food logged, in the antioxidant and skin pillars, and shown under Supplements in What your food did. Advice given: trials used 4–12 mg, EFSA rates 8 mg/day safe long term; take it with a meal containing fat.
- Exception (Dan, 4 Nov): **Kallo lentil-and-rice cakes are fine** — they don't bloat him. Log them freely and don't flag them; whole lentils, beans and other pulses stay off the suggestions.
- **No processed food. No sweeteners.**
- **Salt:** once a day, steady. Never recommend cutting it (asked about heartburn and blood pressure — still no).
- **Retinol stopped for good (28 Oct 2026)** — it ruined his skin barrier. Tretinoin is out too. Do not suggest either.

**Food targets**
- **1,899 kcal every day** to the end of the cut (his choice, since 18 Oct).
- Protein **140 g** (4 feeds of ~35 g), fat **≥ 48 g** (floor ~45 in a push), carbs **≥ 200 g**.
- Never cut calories for a plateau shorter than 2 weeks. No strict calorie ceiling.
- **Fage 0%** is the protein base — 200–300 g a day.

**Training**
- **4 runs a week maximum.** Never 4 runs in a row. Never two hard days back to back.
- **Saturday is stress-free:** no runs, no weights, no study.
- **Never name days for runs.** Reveal a week's runs only when the week starts — Dan picks the days.
- No prescribed rest intervals; effort over the watch. Paces are given as ranges from his own fitness (Camp tab, `paceGuide`), a little quicker each week, never past goal pace, and moved by his last three runs of each kind (hard long, speed, Norwegian) (Dan asked for them, 3 Nov). Run records store the total time of all reps in `secs`; mark time trials `tt:true`.
- No hard run the day after a big legs session (10+ sets). When the signs pile up (`coachModel`: resting HR, sleep, journal mood and energy, sick days, binges, leg volume, run load against his usual, Norwegian runs too fast, niggles), call a day off, an easy week, or a **run-free week** (`S.settings.walkFrom`: steps, walking and gym, no runs). Health, shred and muscle come before the times (Dan, 3 Nov).
- Never flag a rest day as missed.

**Tone**
- No "behind" framing. Calm, honest, encouraging.
- Be honest when asked for honesty — Dan asks for it often.

---

## 3. The current block

| Date | What |
|---|---|
| 19 Sep 2026 | Cut started |
| 12 Oct | Race camp started |
| 26 Oct | **Physique camp** shape began (more emphasis on muscle and looks) |
| **5 Nov** | **No push** (Dan: "I never said to drop anything… forget the push"). The full physique week: **two hard runs** (one 600 m+, one 200–400 m speed run), **a Norwegian** with hill sprints, **a 2nd Norwegian only when recovered and cortisol is under 25**, the gym as the main driver of muscle. **Any session becomes a walk when stress or cortisol is too high** (cortisol 45+ = eased week). **Steps: aim 80,000 a week; minimum 8,000 a day on average** (range 8–13k), all year; sick days don't count against the average; reset days do (Dan, 5 Nov). If the weight stalls, the lever is an extra gym session and food, not more steps. Calories as the shred (1,799, Saturday 1,999, 1,899 at a 7-day average ≤124.9). Goal 123–124 lb by 24 Dec |
| 15 Nov | Reverse decision (`REV_DECIDE`) |
| 21 Nov | London trip (push ends the day before) |
| 28 Nov | Birthday (26). The shred carries on (plan changed 3 Nov: no reverse in November) |
| **3–5 Dec** | **France** — the first look goal: lean, shredded, 122–124 lb, muscle kept |
| 6–23 Dec | **PB window** — trials at every distance |
| **to 24 Dec** | **Shred ends** — 122–124 lb at its leanest, muscle and health kept |

---

## 4. Training — the physique camp week (from 26 Oct)

- **⚡ Hard run, 600 m and up** — 600s, 800s, 1 km or mile reps, a **timed 5 km**, or (rarely, by feel) a hard 5 miles / 10 km. The full menu shows on the Camp tab.
- **💨 Hard speed run, 200–400 m** — 200s, 300s or 400s.
- **🌊 One Norwegian sub-threshold run**, 30–40 min at a true 7/10 (short sentences), with **6–10 hill sprints (~10 s)** at the end.
- **➕ Optional 4th run** (a second Norwegian) — only on a 🟢 day, never owed.
- **🏋️ Gym ×4** — the priority. Split: shoulders + forearms, chest + triceps, back + biceps, legs. 6–12 reps, 1–2 short of failure, beat last time on one main lift each session.
- **Steps:** 13k weekdays, 12k Sunday, Saturday whatever comes naturally (ceiling ~10,500). 14.5k only in the push.
- **Eased week** (recovery flagged): one hard run, one Norwegian, no optional run.
- **No threshold run** in physique weeks.

**Sets per muscle per week on the cut:** chest 10–15, back 12–16, shoulders 10–15, **legs 8–12**, biceps 6–10, triceps 6–10, forearms 4–8.

**Norwegian runs keep coming out too fast** (8×400 at 80 s, 6×800 at 2:49) — jog the recoveries and hold the paces in the plan.

---

## 5. Times

| Event | 2026 best | Fitness now (est.) | All-time | Goal | Realistic Dec target |
|---|---|---|---|---|---|
| 200 | 28.1 | — | — | better | — |
| 400 | **59** (TT, 30 Oct) | 59 | 57 (4 Jun 2025) | sub-55 | 56.5–58 |
| 600 | 1:40 | ~1:36 | — | better | — |
| 800 | 2:32 (never trialled fresh) | ~2:17 | 2:12 (4 Jun 2025) | sub-2:00 | 2:12–2:18 |
| 1 km | **2:59** (TT, 23 Oct) | 2:59 | 2:48 (4 Jun 2025) | sub-2:45 | 2:50–2:55 |
| Mile | 5:27 | ~5:05 | 4:54 (22 May 2025) | sub-4:50 | 5:00–5:10 |
| 5 km | 18:05; 3 km 10:30 (20 Sep) ≈ 18:03 | ~18:00 | 17:17 (1 May 2025) | sub-17:00 | 17:30–17:50 |

Sub-17 and sub-4:50 are honestly more likely in the **spring 2026–27 camp** (Apr–Jun, when the 2025 bests came).

---

## 6. What has worked for Dan before

- **Sep 2024 – Mar 2025** was his best look ("insanely shredded" by March): 1,699–1,899 kcal, Fage 0%, 7k–13k steps, 2–3 runs a week and an almost run-free winter (treadmill only, 21 Oct 2024 – 27 Jan 2025). Carbs swung 160–220 g day to day. Lesson: less total stress, not more activity.
- **2025 race bests** came off a few staples: 4 × 1 km (3:20 → 3:02 a rep Feb–Jun), 5–6 × 400, uphill 200s, 4 × 800, and easy 5-milers.
- **Trials** — Dan loves them and feels they make him improve. At most one a week.
- Two easy 5-milers a week felt pointless; replaced by Norwegian runs.

---

## 7. Body and health

- **Maintenance (real, from the scale):** ~2,150–2,300 kcal. Textbook says 2,350–2,500 — trust the scale.
- **Rate on the cut:** ~0.5 lb/week on the 7-day average (deficit ~300–400 a day once camp water is allowed for).
- **Resting HR:** normally mid-50s; spikes to 70–71 (22 and 27 Oct) followed stacked days and late nights.
- **Blood pressure:** one reading of 134/82 (Oct 2026) — advised 7 days of home readings; GP if the average is ≥ 135/85.
- **Mood:** has felt low with the darker nights (Oct 2026). Daylight, sleep, people; GP if it lasts over 2 weeks.
- **Heartburn:** only with savoury food; seasoning is just salt and herbs.
- **Water look:** Dan is sensitive to looking "watery" — usually carbs, potassium, cortisol or poor sleep, not fat.
- **Strength:** 26 strict pull-ups in one set; 164 in 45 min (29 Oct).
- **VO₂max estimate:** ~56–59 from his race times.

---

## 8. The look — model checklist

- Body fat is most of it: the jaw and abs show at **123–124 lb**.
- Puffiness: 8–9 h sleep, the same salt and water every day, no alcohol, last big meal 2–3 h before bed, potassium foods.
- Skin: gentle cleanser, ceramide moisturiser, SPF 30+ all year; niacinamide is optional. No retinol.
- Grooming: haircut every 3–4 weeks, brows tidied, a clean neckline.
- Posture: tall, chin slightly back; face pulls and band pull-aparts.
- Shoot day: the Model tab has the week. A little more carbs the day before, a pump before shooting, never cut water or salt hard.
- Daylight 10–15 min before noon every day.

---

## 9. After December (plan, Dan 3 Nov)

1. **Christmas** (25–26 Dec): maintenance (2,199), enjoy it, no tracking pressure.
2. **Reset cut** (27 Dec – 9 Jan, two weeks): 1,899 (Saturday 1,999). Clears the Christmas eating; the first mornings are water, judge it on the second week. Runs and gym as normal.
3. **Build** (from 10 Jan to end of Mar): a *very small* increase, maingaining (Dan, 4 Nov) — about maintenance + 100–200, protein 140 g, gym 4–6× (shoulders, upper chest, lats, arms; weighted pull-ups), 3–4 runs, weight roughly steady (≤ 0.5 lb a month). March: run times back.
4. **Spring:** lean down only if needed — if the maingain kept him lean, skip it and go straight to the spring race camp for sub-17 / sub-4:50.

**The year's shape (Dan, 4 Nov):** autumn and winter build the muscle and the running base while in a deficit; after Christmas maximise it with a very small surplus; spring sharpens. **Steps by season:** no reason to walk less in winter for health — the longevity benefit levels off at 8–10k all year — but it is fine that winter steps sit nearer 10k (the push target follows the scale) and summer drifts higher naturally, capped about 13k. In winter, get the walk in daylight (midday), which also sets the cortisol rhythm and helps mood.

---

## 10. The tracker (Cut Block 71)

- **Live:** https://claude.ai/artifact/Juj2MvWam6n4kg1JQ8G9Xp (private).
- **Source:** `cut-block-71/index.html` (single file). Branch `claude/training-recovery-nutrition-system-stt0sj`.
- **Data:** artifact database `state/main` — read, edit, then `set` with `if_version`. Weights in `weights`, days in `days[YYYY-MM-DD]` (`runs`, `gym`, `split`, `sets`, `sleep`, `bed`, `wake`, `rhr`, `steps`, `kcal`, `skinAM`/`skinPM`, `teeth`, `phoneOut`, `reset`).
- **One app with Glow (3 Nov):** Glow's source is `glow/` (React, Vite). It is the only copy. It runs inside the tracker on the same store through `window.__GLOW_HOST__` (`load`, `save`, `kcal`, `steps`, `verdict`; see `glow/src/host.ts`). It never shows its own boxes for weight, sleep, RHR, steps, study or training. The tracker always wins where they overlap.
- **New keys:** `days[d].glow` = Glow's day `{items, rituals, note, feelings, extras, outdoorMin, sleepQ}`. `days[d].glowSum` = Glow's day totals `{kcal, protein, carbs, fat, fibre, nutrition, glow, plants, names}`; `days[d].kcal` comes from it once (`kcalFrom:'glow'`). `days[d].binges` (the next 2 weigh-ins are noise), `days[d].ill` `{kind, severity}` (below the neck or severity ≥ 3 means a red light; mild means easy only), `days[d].journal` `{mood, energy, well, learned, tomorrow, free}`, `days[d].challenge` `{ex, kg, reps}`: the weekly strength challenge (`CHAL`, rotating pull-ups, bench, leg press, shoulder press; reps to failure, rated against bodyweight). Dan logs sets only, not every weight (3 Nov). The old `days[d].lifts` is still read. `S.glow` = `{profile, customFoods, favourites, breathMinutes, bp, labs, films}`. The old `days[d].eaten` is migrated into Glow's diary on load.
- **Navigation (3 Nov, Human Performance OS stage 1):** eight sections in `#secs` (Overview, Running, Physique, Nutrition, Longevity, Recovery, University, Goals & PBs); each page button in `#tabs` carries `data-sec`, and only the current section's pages show. Running opens on `runCoachHTML` (last run vs its pace range, the week, next, goals), `runWinsHTML` (level, achievements, best runs vs all-time and goals) and `muscleFunHTML` (each muscle snoozing / waking up / growing / overcooked); the run menus, paces and race detail sit in folds on the Training log. Longevity opens on `s-longev`: `healthLongHTML` (VO₂, RHR, BP, sleep, steps, strength, food quality, stress, each with its source) and Glow's health-age panel. Overview (3 Nov, redesign): Mission Control (who, phase, countdown, shred meter, green light, rings, week strip, ate to plan), then `homeCard` (Today: worth doing next; Your numbers: shred, muscle, running, health age, looks, study, food, stress, happy), `bankCard`, the log (the run form is folded: runs come from Strava when Dan says “sync”), alerts, binge/ill/journal, and More for today. Today’s food (`s-nutri`, Glow `home`), Stress & calm (`s-calm`), Muscle & strength (`s-phys`: strength challenge, muscles) open their sections. One visual style (3 Nov): Glow uses the tracker's tokens, 20 px cards, 19 px serif titles, olive pill buttons and pill tabs, full width on Mac; Glow is folded in, not added on, and **nothing is removed** (Dan, 3 Nov: "don't get rid of things"): Glow's Body & health page stays in Longevity with its coach, vitals, recovery clock, XP and streak; the recovery clock also sits under the running and lifting coaches, its keep-muscle guide in Physique; sets count Monday to Sunday everywhere. Overview (4 Nov): Mission Control, then the daily log, binge/ill/journal, Today, then the full round-up: stress score with its breakdown, health age, running coach (with the cortisol and longevity check) and best runs, health bank, every micronutrient today and this week. Coaches: `runCoachHTML` (Running), `liftCoachHTML` (Physique), `longCoachHTML` (Longevity), `studyCoachHTML` (University), all in the same shape: last, this week, next (with impact), goal. Norwegian runs switch to steadier formats (`NORW_CALM`) while `paceGuide().form.N` < 0.94. Earlier order: Mission Control, the log, goals, health & food, alerts, calm, strength challenge; the rest sits in `#moreToday`. Palette: charcoal, ivory, muted olive, bronze (dark by default). Sync merges days field by field (`mergeDayInto`). Legs can be split by muscle (`days[d].legs`).
- **Home (top of Today):** Mission Control, then `homeHTML` (goal tiles: Shred, Muscle, Running, Health age, Looks, Study, Happy; 3 "do next"; this week vs last), Glow's `home` view (health age, BP, blood tests, food search), then the strength challenge (`liftHTML`), then `calmHTML` (stress load from `coachModel`, destressers from `RESET_MENU`, this season, tonight's film) and Glow's `calm` view (8 pillars, breathing timer; breathing minutes also set `medMin`). The Review tab ends with `monthReviewHTML` (the road to 3 and 24 Dec, body, training, health and mind, next month's focus). Dark by default (`localStorage['cb71.theme']='light'` switches).
- **Cortisol score and in-depth coaches (4 Nov):** `cortisolScore()` (0–100) is narrower than the stress score: short sleep, late or irregular bedtimes, raised morning HR, hard runs stacked or the day after legs, no day off, eating 200+ under target, low carbs on training days, >14k steps, long study days, TMA week, low mood or energy, binges, illness, plus 5 for being in a cut. Each part names its fix and source. Shown on the Overview (after stress), at the top of Recovery → Calm, and as a tile. New coaches: `nutriCoachHTML` (Nutrition: today vs target, protein meal by meal, carbs vs training, the week, lowest absorbed nutrients via `GLOW.nutri(date)`, food options) and `skinCoachHTML` (Skin: sleep and cortisol for under-eyes, SPF and oily-fish days, vitamin C and zinc, the under-eye types, routine, eat-for-skin, shoot day). Every coach has a 🔎 In depth fold (`runDeepHTML`, `liftDeepHTML`, `longDeepHTML`, `studyDeepHTML`) and adapts to the phase, the push and TMA week (`tmaOn`). A TMA can carry `start` and `aim` (its own plan dates).
- **Health bank** (`bankHTML`, Overview): the week's protein, omega-3, nutrient coverage, sleep, steps, gym and runs against the same days last week; a load check on the last 3 days (`dayStress`); six longevity habits. **Stress tile** on the goals grid: a 0–100 score (`stressScore`: slow signs from `coachModel` at 10 points each, the last 3 days of `dayStress` at 5 per point), what that level does, and what takes each part off; 14 days of daily load. **What your food did** (`glow/src/components/FoodPower.tsx`): absorbed nutrients per food and what they do in the cell, animal foods first.
- **What to eat next** (`glow/src/engine/eatnext.ts`, on Home): recovery after training, protein to 140 g, the lowest micronutrient by absorbed amount, one anti-ageing food not had this week. Only allowed foods; no pulses (bloat-prone); vitamin D from oily fish. The daily check-in routine names 1–2 foods for tomorrow and, on Sundays, one new piece of evidence.
- **Glow rules:** `npm test` in `glow/` (includes `tests/rules.test.ts`); `build-app.mjs` refuses to build if banned advice reaches the page. `glowmerge.mjs` tests the merge in the built app (serve `mkapptest.py` output on :8765).
- **Run records:** reps `{k:'reps', dm, n, secs, tt?, up?, nodip?}`; continuous `{km, secs, type: easy|threshold|fun|subt}`. Reps are hard (except 100 m sprints); `fun` and `subt` are never hard.
- **Publish `app.html`, not `index.html`.** `index.html` is the tracker source; `node build-app.mjs` (after `npx vite build` in `../glow`) folds Glow into it and writes `app.html`, which is what goes live. Republish with `file_path` + `url` only, so capabilities carry forward.
- **Tests:** `python3 mktest.py <out>/cb71.test.html`, copy `*.mjs` beside it, run each with `node` (skip `peek*`/`dbg*`), and grep for FAIL or Error.
- **Key pieces:** `CFG` (goals, camp, sets, steps), `PUSH`/`pushState`, `PHYS`/`physOn`, `weekRunsModel`, `campGame` (quests, runs left, XP), `greenLight`, `calCall` (when to eat more or less), `revWatch`, `campWeekReview` (Sunday 8 pm review), `muscleMaxHTML` + `PHYS_PLAN`, `CAMP_SESS`, `norwMenu`.
- **Achievements are computed from his data** — never reset them. Bosses: a camp PB is +100 XP, all-time +250, goal +500.
- **Commits** end with the session's attribution lines. Never put a model identifier in pushed files. No PR unless asked.

---

## 11. The Human Performance OS brief (Dan, 3 Nov) — audit and stages

Dan's full brief: one premium, calm, evidence-led system across running,
physique, nutrition, longevity, recovery, University and goals. No invented
data, scores or integrations; estimates labelled; nothing decorative that
does nothing; simple daily logging; export and backup. Built in stages on
this tracker (not a rewrite), keeping his programme and rules above.

**Merged (3 Nov):** branch `claude/coding-capabilities-21nmif` (The Good Life
React app in `good-life/`, and the newer pregnancy guide) is merged into this
branch. Its University content (backwards TMA stages, Harvard builder) is now
in the tracker; its food, exercise, health and source data sit in
`good-life/src/data/` to draw on. Data Dan typed into The Good Life lives in
that browser only and cannot be read from here: export it there and use
Data & backup → Load to bring it across.

**Audit**

| | |
|---|---|
| Keep | Eight sections and the pages under them; Mission Control; the log card; the running coach, menus and pace ranges; the set-based gym log (sets only, by Dan's choice); Glow's food diary and nutrient view; the readiness light; reviews; field-by-field sync; achievements from his data. |
| Improved in stage 2 | Overview: name, age from DOB, height, weight (7-day avg or last, labelled), phase. University: TMA plan backwards from the due date, marks and feedback with OU bands, weekly study hours (8 weeks), critical-evaluation questions, Cite Them Right Harvard references (`S.uni.refs`; tasks carry `st`, `mark`, `fb`). Longevity: **How you compare** (`benchHTML`), each row with population, source, year, limits; "no valid percentile" where none exists; no overall score. Data: a real backup file download. |
| Fixed | The food deep dive still recommended olive oil, spinach, rocket and watercress (all excluded). Removed. |
| Still to do | Stage 3: weekly review page as the single Sunday summary; nutrient gaps against UK reference values with "estimate, not a blood test" on each; lab entry (lipids, HbA1c, FBC, ferritin, B12, folate, vitamin D) in Glow's `labs`, shown only once entered. Stage 4: body measurements beyond the waist, progress photos (local only), optional weights per set for e1RM. Stage 5: the coach answering the brief's eleven questions from his own data, each answer tagged fact / estimate / suggestion. Check the FRIEND cut-offs against the original paper's table. |
| Remove or question | The Glow "health age" headline is a composite and conflicts with "no pseudoscientific scores": it is labelled as motivational; ask Dan whether to keep it. |
| Needs Dan | Module titles for SK297 / SK298; TMA dates; any marks so far; whether olive oil is now allowed (the brief lists extra-virgin olive oil, his excluded list says no — the exclusion stands until he says otherwise); home BP week; grip strength if he can measure it. |

**Tests:** `hpos2.mjs` (served `app.html` on :8765) covers stage 2.
