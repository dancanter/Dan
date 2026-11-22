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
- **The dream after the shred: nutrient mode (Dan, 12 Nov):** "stop counting calories, focus way more on the micronutrients, have what I want, the world's most bioavailable foods." "I can always change my mind." On by itself from **10 Jan 2027**; his switch on the Overview always wins (`S.glow.profile.nutrientMode` true/false; `nutrientAnchor` = 7-day average when switched on). Calories hidden on Glow's food log, Fuel and one-tap meals; the day is judged on nutrient coverage, protein ~120–140 g across the day (**not every meal needs protein**: oats, milk and honey is fine and still ~19 g), oily fish or shellfish 2–3×/wk, 5+ plant foods most days. The one safety net: 7-day average more than 1.5 lb over the anchor → one week of slightly smaller carb and fat portions, still no counting. Weeks 1–2 protein only, then nothing. Bioavailable list: oysters, mussels, salmon roe, sardines with bones, mackerel, wild salmon, pasture egg yolks, red meat, venison, beef heart, full-fat/raw dairy, kefir, berries, cacao, kiwi, red peppers, citrus, cooked carrots and sweet potato with fat (never liver). In the app: `nutriModeHTML` (`#nutriModeCard`), `nutrientModeOn` in Glow.
- **Strength boss fights (Dan, 12 Nov):** on the dashboard under the race bosses (`STR_BOSS`, `strBossHTML`): best single set of strict pull-ups (goals 30 → 35 → 40 → 45; 30 beaten on 12 Nov: 30, 16, 14) and e1RM for bench (100 → 110 → 120; 80 × 5 on 6 Nov = 93), incline, shoulder press, row, squat — each appears once logged.
- **Easy 5-milers back (Dan, 12 Nov):** "I'm gonna do more 5-mile runs — mitochondria, and it's getting colder, so they beat a walk." From 16 Nov: up to 2 a week, in place of walking time (a 5-miler ≈ 8,000 steps), truly easy (`EASY_PACE`, full sentences; his old 5-milers drifted to 6–7/10, which is what wrecked recovery), never the day after legs or the day before a hard run, eat back about half (~250 kcal, carbs + protein). Cortisol over the cap or heavy legs → the walk instead. In the app: `EASY5`, a line on the push card.
- **Bloat list, his call (Dan, 14 Nov):** the Sainsbury's stir-fry mix (cabbage, carrot, mixed peppers, onion) is fine for him: "nah they are fine". Log it as about 33 kcal per 100 g dry-fried (no oil; the label's 66 kcal assumes 15 ml oil). Don't flag it again; the avoid list still guides what is suggested.
- **The scorecard (Dan, 13 Nov):** "give me the data and scores each day for everything, and each week together, with guidance." `scorecardHTML(ws)` on Today (`#scoreToday`) and Review (`#scoreReview`), this week open and last week folded: each day 0–100 for sleep (`sleepScoreOn`), food quality (Glow nutrition score), protein vs plan, calories vs `dayTarget`, steps vs the plan range (over the strain line scores 75), recovery (morning HR vs baseline), a day score (mean of what was logged), training icons; the week row, a grade (A+ 90, A 85, B+ 78, B 70, C 60) and the three weakest parts with the fix. Dumbbell lifts are logged with `db` describing the weights (shoulder press = both dumbbells added, so it compares with a bar).
- **Runway plan and runs not walks (Dan, 13 Nov):** "treat France and Christmas like a runway show… I'd rather run than walk now, too cold." `runwayHTML` on the push card: a 7-day countdown before France and again before Christmas Eve (sleep 9 h, nothing new, salt/water/fibre steady, haircut 3–5 days out, last exfoliation 4 days out, no heavy legs or new exercises in the last 3 days, oily fish/eggs/kiwi/potassium, ~200 kcal more carbs the day before, never cut water or salt, a pump and cold compress on the day). Easy runs replace walks: up to 3 a week (5 miles or 35–40 min, `EASY5.max`), no more than 6 runs a week in all (`EASY5.maxRuns`). This run-free week: treadmill incline walk, bike or cross-trainer if too cold.
- **Winter running (Dan, 13 Nov, Oct–Mar, `winterHTML` on the running coach):** warm-up 15–20 min + drills + 4–6 strides, jacket on and moving between reps; hard runs midday on the two mildest, calmest days; the 200–400 m session indoors or on a treadmill (1%) under about 2°C, icy or a gale; Norwegians and easy runs by effort (1–3% slower in the cold is normal); a buff below 0°C; never an ice bath within ~6 h after lifting; neck rule for colds; daylight before noon; 2.5–3 L water; trials in a calm midday window with a 25-min warm-up, moved if the weather is bad.
- **The food coach (Dan, 13 Nov):** "constantly give me, and adapt, the foods to add and limit, for health, longevity, bioavailability, my cells, the shred and the face." `foodCoach()` / `foodCoachHTML()` on Today (`#foodCoachToday`) and the Nutrition tab (`#foodCoach`): from the last 7 logged days, ADD = oily fish if under 2 and the 3 nutrients furthest behind (Glow's absorbed `nutri().week`), each with the best-absorbed foods he can eat and why (`FOOD_ADD`); NO amount limits on any food (Dan, 14 Nov: "don't be giving me limits on foods, what if some days I want more honey or more avocado"; `FOOD_LIMIT` removed). Never cap honey, nuts, chocolate, dried fruit, avocado or anything else by grams, in the app, the check-ins or chat; calories and protein do the steering. The hard rules (sweeteners, gluten, excluded foods) still stand. KEEP = what is working.
- **Health accomplishments (Dan, 13 Nov):** "when I achieve something or boost my longevity… give me an accomplishment, and say what it boosts." `healthWins()` joins `campAchievements()` (badge wall + celebration card): best sleep week / an 8-hour week, nutrition 80%+ covered or a best week, protein week (5+ days at target), oily fish twice in a week, steps in the plan's range, resting HR down 1.5+ bpm on the week before, and a new best on any strength-boss lift. Judged on finished Mon–Sun weeks, never one day. Each carries `boost` (what it does for him), shown as ⚡ Boosts on the card and the wall.
- **One phase, one clock (redesign step 2, 13 Nov):** the shred runs 19 Sep – 24 Dec (`CFG.cutEnd`, 97 days), then Christmas (25–26 Dec), the reset cut (to 9 Jan), the build (from 10 Jan, `REV_START`). `phaseList()`, `phaseNow(t)`, `phaseMarks()` (the push, London, France, the first trial, Christmas Eve, the build) and `pClock(t)` ("The shred · day 56 of 97 · 20 days to France · 41 days to Christmas Eve") are the only clock. The October reverse ladder is folded as history at the bottom of the "After the shred" tab (was "Calories & reverse"); `REV_DECIDE` is off. One weight line: from the week before the push the weekly plan curve is `push2Line`. `agree.mjs` also checks the clock, old dates and the weight line.
- **One plan, one set of numbers (redesign step 1, 12–13 Nov; see `AUDIT.md`):** every target lives in one place and every card says it through helpers, so screens cannot disagree. Calories: `dayTarget(t)` (`CFG.kcal`, `STRICT`); weight goal: `CFG.goals` 123–124, `CFG.w.target` 123.5, hold at 123, floor 122; everything else: `PLANV` (protein 140, gym 5–6, sleep 8–9, steps 11–13k as the week average, 12–13k in the full push, floor 8,000, about 80,000 a week, a single day over 14k counts as strain). Text helpers: `pKcal`, `pKcalBase`, `pKcalRule`, `pProtein`, `pSteps`, `pStepsLong`, `pGym`, `pGymShort`, `pGoal`, `pSleep`; `planNow(t)` for the values. Glow reads the same plan through `window.__PLAN__` (`glow/src/plan.ts`: `plan()`, `hostPlan()`). **Never type a target into a sentence.** `node planlint.mjs` fails on any target literal outside the plan (a line that must keep one carries `plan-ok: why`); `agree.mjs` opens all 26 tabs in a run-free week and a push week and checks every stated calorie, steps, goal, protein and gym number against the plan. Run both before publishing.
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

- **Xmas Camp Checklist (Dan, 15 Nov, from his door whiteboard):** "my goals till Christmas … with the countdown and all the goals and how close I am, making it really fun." `XCAMP` / `xcampModel()` / `xcampHTML()` → `#xcampCard` at the top of Today. 15 Nov – 24 Dec (39 days left on 15 Nov). His numbers, kept as he wrote them: runs 24, gym 25, cals 1,799–1,899 unless eating out (`days[d].eatOut` days don't count), weight 123–124 from a start of 127.6 (7-day average), finish assignments and all uni work (`S.uni.tasks` due by 24 Dec), teeth 3× plus floss (`days[d].teeth`), sleep 8–10 h without the phone (`days[d].sleep`, `days[d].noPhone`). Overall % with levels 🎁 / ❄️ 25 / 🔥 50 / ⭐ 75 / 🎄 90; "on pace" and "about N a week" from here. Mention it in check-ins.

- **Legs are one number (Dan, 15 Nov):** "take out the how many quads etc, I just want legs for sets and maybe calves to record." The per-muscle leg boxes are gone (`LEG_SPLIT=false`): log Legs as one sets number (`sets.Legs`) plus optional calves (`days[d].calves`, weekly total via `calvesWeek()`). Old `days[d].legs` records stay in the data but aren't shown or summed. Don't ask for quads/hamstrings/glutes.

- **Lost custom foods (16 Nov):** the foods I'd added to his own list (bean sprouts, swede/carrot mix, white cabbage, Arla pudding, konjac noodles) vanished when a stale phone copy saved. They are now built-in library foods (`glow/src/data/ukFoods.ts`: `uk-bean-sprouts`, `uk-swede-carrot`, `uk-carrot-swede-mash`, `uk-white-cabbage`, `uk-arla-protein-pudding`, `uk-konjac-noodles`, `uk-acai-unsweetened`), and `S.glow.customFoods` now merges by id like myMeals. Prefer built-in rows over custom foods when adding new ones. His "📵 No phone in bed" camp tick is the existing `days[d].phoneOut`.
- **Re-sent food screenshots:** when Dan says he put the wrong food in for a day, replace that day's `glow.items` wholesale from the new screenshots, drop the stale `glowSum` (the app recomputes it), and set `kcal` to the MFP total.

- **The push is cancelled (Dan, 17 Nov, ~3 am):** "gonna cancel the push, I'm still making progress with this Xmas camp and I'd rather want that." The 127 check ended with no morning below 127 (best 127.4), so the full push had started 16 Nov; from 17 Nov it is off (`PUSH2.off`, `push2Mode` → `'camp'`). Effects: the 2nd Norwegian is back under the normal cortisol cap (25, not 35); steps back to 11–13k as the week average (80,000 a week), not 12–13k. Unchanged: gym 5–6, calories, protein 140, sleep 8–9 h, the weight line as a pacing guide to 123–124, France/Christmas runway. The Xmas Camp Checklist (his whiteboard) is the plan. The old card is now "🎄 The camp plan"; the phase label reads "camp". Don't mention a "push" or the 127 check again.

- **Xmas camp card trimmed (Dan, 17 Nov):** "take off how many cals on the Xmas part, add how many hours I've studied since starting, and take out the assignment thing." The card no longer has the calories bar or the assignments row (and neither counts in the score, which is now runs, gym, weight, teeth, sleep). It gained a study chip and row: hours studied since 15 Nov (`days[d].study`, with deep-work hours), no goal. Steps stay with only the 80,000-a-week goal. Don't bring calories or assignments back onto the camp card or into the camp line of the check-in; calories are still steered by the plan (1,799 floor) in the food part of the check-in.

- **Weight on the camp card + weight check-ins (Dan, 17 Nov):** "on the weight say what the average is, down and by how much, and give me check-ins and what to do so my weight gets to 123–124." The camp card's weight row shows the 7-day average and how far down (or up) it is from his 127.6 start, plus a **Weight check-in** block (`xcampWeightHTML`): average and weigh-in count, lowest morning, lb needed to reach 123.5 (and 124) and the lb a week needed over the days left, the last 7 days vs the week before, and the verdict against the line, then what to do (on the line: change nothing; above it: log every gram weighed, base calories not the higher day, steps to the top of 11–13k, the extra gym session, sleep 8–10 h, same salt and water). **One line now:** the weight line runs from 127.6 (16 Nov) to 123.5 (24 Dec), about ¾ lb a week (`PUSH2.startAvg` 127.6; the old 128.3 start is retired). Check-ins: a weight line in every 9 pm check-in and a bigger one on Mondays (average, the week's change, the one lever). Never under 1,799, never cut salt or water, and no food-gram caps.

- **The three numbers on the main page (Dan, 17 Nov):** "on the main, make my longevity score, my age, my stress/cortisol score very, very clear." `vitalsHTML(t)` puts three big tiles at the very top of Overview, inside Mission Control (`#ccCard`): 🧬 Longevity score (overall /100 with band and today's score, plus the biggest lever), 🎂 Health age (Glow's `health()` against his real age: "N younger than you"), 🧪 Stress / cortisol (`cortisolScore()`, 0 is best, with the 25 / 45 thresholds and the biggest cause with its fix). Tapping a tile jumps to its detail card (`#ovLong`, `#glowHealthOv`, `#ovCort`). Mission Control re-renders on `glow-ready`. The cortisol score is the one the coaching gates use; the older training-strain "Your stress" card is still below.

- **Camp steps total (Dan, 17 Nov):** "along with the step average, do total steps altogether; my goal is 12,500 steps a day in this Xmas camp, calculate how much that is altogether and how close I am, like chipping away." The camp card has a **Camp steps, all together** row: total since 15 Nov out of 12,500 × the 40 camp days = **500,000**, the average against the 12,500 goal, steps ahead or behind pace, what is left and the daily average needed from here, and the next 100,000 milestone (`XCAMP.stepsAvg`). The weekly **80,000** bar stays; 12,500 a day is 87,500 a week. A "Σ total steps" chip sits beside the average chip. Mention the total, the ahead/behind and the next milestone in the camp line of each check-in.

- **The shred is short term (Dan, 17 Nov):** "this shred is short term, it'll get me to 123, then I will maintain and do less and focus more on longevity, recovery, cellular health and muscle." So: 123–124 is the finish line, not a starting point for going lower (floor 122 stays). Once the 7-day average is at 123–124 (or on 24 Dec) the check-ins switch to maintenance coaching: calories at maintenance (about 2,199), protein 140 g, steps back to about 8–10k (the 12,500 camp goal and the 500,000 total end with the camp), 3–4 solid gym sessions with progressive overload, sleep 8–9 h, oily fish 2–3×, plant variety, 1–2 hard runs for VO₂, a weekly rest day, low cortisol. **Decide on 24 Dec:** if he is already at 123–124, skip the reset cut (27 Dec – 9 Jan at 1,899) and go straight to maintenance, then the build from 10 Jan and nutrient mode. Bring this up in the check-in when the average reaches 124.

- **Weight is read from the start of last week, not all-time (Dan, 17 Nov):** "for the weight don't go on my all-time averages, go from the start of last week and do averages since then." `WREF.from = 2026-11-09` (Monday of the week before the camp); `wRef(t)` gives the average of each week since then, the average since 9 Nov, the lowest morning since, and `wRefStart()` = the average of the week of 9 Nov (127.9 on 17 Nov). That is now the start for: the camp card weight row (last week → this week so far, and the average since), the weight check-in ("down X from last week's average"), the shred meter on Mission Control, and the weight line (127.9 on 16 Nov to 123.5 on 24 Dec; `PUSH2.startAvg` 127.6 is only the fallback). The old cut-long baseline remains only inside the Weight tab model and the achievement milestones. In check-ins, quote the week averages (last week, this week so far), the average since 9 Nov, and the 7-day average; never the all-time average.

- **Hard runs first; the Norwegian is optional (Dan, 18 Nov):** "I'd rather the hard workout over the Norwegian, as harder runs always take priority, and if I don't feel great I will do an easy run rather than the Norwegian, can't lie." Week order: the two hard runs (one 600 m+, one 200–400 m speed) come first; the Norwegian is an optional extra after them, and an easy run is an equal swap whenever he does not feel great (resting HR 5+ up, short sleep, heavy legs). In the app the Norwegian items carry `opt:true` (tagged "optional", not counted as owed in the week-done count). Easy runs run 5:00–5:45/km (his last two came at 4:47 and 4:48: nudge him to slow down). Never push him to do the Norwegian; never call an easy run instead of it a miss.

- **Protein aim 130–140 g (Dan, 19 Nov):** "I'm gonna get protein up starting next week to 130 to 140 that's my aim, as I'm 126 there's no point really [going higher]." At about 57 kg, 130–140 g is 2.3–2.4 g/kg, the top of the evidence for keeping muscle in a deficit, so there is no reason to go above 140. `PLANV.protein` 140 stays the target; `PLANV.proteinMin` 130 now counts as on target (the old threshold was 135). His protein had run 112–125 g for three days: nudge him to start now rather than next week (eggs or Fage at breakfast), without nagging. Don't ask for more than 140 g.

- **Protein evidence, honestly (Dan, 19 Nov: "if you really look at research it's actually 0.8 grams per pound"):** he is right that about 0.8 g/lb (1.76 g/kg, about 100 g at 126 lb) is the commonly cited figure; Morton 2018 (BJSM meta-analysis, PubMed 28698222) puts the muscle-gain plateau near 1.6 g/kg (0.73 g/lb, about 92 g for him). In a deficit while lean and training hard there is a case for a cushion (the 2016 trial, PubMed 26817506, found 2.4 g/kg beat 1.2 g/kg, but did not test 1.8), so 130–140 g is a comfortable aim, not a requirement. **How to talk about it:** 100 g+ is fine, 130+ is his aim; never call 100–129 g a "weak spot" or a miss; no pressure to start before he has been shopping. Because calories are capped, more protein also means fewer carbs around hard sessions, which is a real cost.

- **Dan's weekly running template (20 Nov, from what he did in 2025):** (1) a longer interval session, rotating 1 km reps (4–5 × 1 km at 3:15–3:19) / mile reps / 800 m reps, with a fast 5 km only as the 13 Dec trial; (2) 400 m reps with the last 120 m uphill every week (4–5 reps, about 68–72 s; first done 20 Nov, 4 × 400 averaging 71.5 s, fastest 68 s); (3) one easy run at 5:00–5:45/km; (4) optional, only when he feels great (sleep 7.5 h+, resting HR about 52 or under, cortisol under 25): a 200 m sprint session, alternating with short sharp sprints (60–100 m, uphill); (5) a 5th run (easy or Norwegian) only when everything is green. So 4 runs a week, sometimes 5, which fits the 24-run camp goal. Spacing: 48 h between hard sessions, longer interval first in the week, never a hard run the day after legs, a full rest day, stress-free Saturday. Dec trials: 5 km 13 Dec, 1 km 16 Dec, 400 m 18 Dec, mile 20 Dec, 800 m 22 Dec, 200 m and 600 m 23 Dec. Offered to build it into the app's weekly plan: wait for his answer.

- **What Dan actually did, 24 Mar – 28 Jun 2025 (read from Strava, 20 Nov):** 3–4 runs a week (one 5-run week, 23 Jun; 2 in the flu week). Every week had: (A) a longer interval day, most often **4 × 1 km at 3:10–3:13/km** (3:02/km on 4 Jun), alternating with 4 × 800 m (4 × 800 "record" on 15 Jun, about 2:23 each), a fast mile (5:10 on 17 Apr; 4:53 "sub 5 min mile" on 22 May) and the odd 5 km trial; (B) **5–6 × 400 m, often uphill** (about 64–69 s a rep: 15 Apr 5 × 400 uphill averaged 66 s; 29 Apr 6 × 400 averaged 64 s; 8 Jun uphill and into the wind 69 s); (C) **short sharp uphill sprints almost weekly: 5–6 × 200 m uphill** (25 Mar, 6 Apr, 14 May, 11 Jun) and 6 × 200 + 2 × 100 uphill (29 May); (D) **one or two easy 5-milers (8 km at 4:17–4:42/km, mostly 4:20–4:35)** plus a recovery 5 km at 4:32–4:40. Test days: 5 km 17:18 (1 May), 10 km 36:56 (5 May), mile 4:53 (22 May), 4 × 800 record (15 Jun), a 5 km "way off" 18:25 (11 Apr) and 18:18 (25 Apr), 18:29 in heat (28 Jun). Typical order: easy 5-miler early in the week, 400s or 200s the next day, 1 km reps midweek, an easy or recovery run, sprints or a test at the end. Sessions were sometimes back to back. He ran through illness (2–6 Apr and again after the June flu); both stretches then ran slow. Easy runs after heavy legs (120 kg squats, 10 Jun; "4th run in row straight after legs", 26 Jun) were kept easy.
- **Easy pace corrected (Dan's own history):** his easy runs are 4:20–4:45/km, not 5:00–5:45. `EASY_PACE` is now 4:30–5:00 and only faster than about 4:20 is flagged. His 4:47 and 4:48 easy runs this month were normal-to-slow for him; I was wrong to flag them.
- **Compared with spring 2025:** 16 Nov 3 × 1 km at 3:17/km vs 3:10–3:13 then; 20 Nov 4 × 400 (last 120 m uphill) averaging 71.5 s, fastest 68 s, vs 64–69 s then. That is about 2–7% slower, consistent with a deficit, a run-free week just before, and the cold; not a regression.

- **Dan's 2025 program is in the app (20 Nov):** "that's the exact program I want ... adapt it with my running coach, make sure I know what I'm doing with what I've already done this week ... the running, gym, longevity and nutrition coaches all need to know it." `PROG25` (slots A longer interval rotating 1 km → 800 m → fast mile, B 400s with the last bit uphill, C short sharp uphill sprints, D one easy 5-miler), `prog25Week()` reads the Monday–Sunday week from the logged runs (reps ≥600 m or tt/threshold = A, 300–599 m = B, shorter = C, easy 4.5 km+ = D, Norwegian/fun = extra), `prog25Next()` decides what is next (hard sessions first, 48 h after the last hard session, not the day after legs, a yellow day swaps in the easy run or sprints, Saturday off), and `prog25HTML()` is the **"Your program · N of 4 done this week"** block at the top of the running coach, with each done session compared with his 2025 numbers (1 km 3:10–3:13/km, 800 m about 2:23, 400s 64–69 s, easy 4:20–4:35). `prog25StripHTML()` puts the week at a glance on the camp card. `prog25Notes()` feeds the lifting, nutrition and longevity coaches through `crossTalk()` (legs the day after a hard session, fuel and eat-back around the next session, VO₂ and rest). The Norwegian stays an optional extra (slot E). A 400 m rep set logged with the last 120 m uphill carries `up:'last 120 m'`. Test: `prog.mjs`.

- 20 Nov (Dan, after a Strava recheck): the 200 m sprints were NOT weekly. Strava Mar–Jun 2025 shows 6 x 200 m uphill (about 30 s a rep) only on 25 Mar, 6 Apr, 14 May, 29 May, 11 Jun (about every 2–4 weeks); the weekly short sharp sprints were 80 m uphill, which he did not record. C = 200 m uphill about every 2 weeks, 80 m uphill in between. Running coach has a "Where you are vs spring 2025" fold. Dan keeps weekends open: a full weekend off is the reward for finishing the week, not a rule. Plan: about 7 days completely off after the 23 Dec tests. After-camp block waits until he asks.

- 20 Nov (Dan): the overview needs ALL his data and the Xmas camp together without scrolling. Added "📋 Everything in one place" (#allCard, between Mission Control and the camp card): camp score, runs, gym, weight, steps (week + camp total), study, teeth, sleep, nutrition score, today, and the program strip. Longevity, health age and cortisol are the three tiles in Mission Control above it.

- 21 Nov (Dan): Claude can connect to his Strava any time without asking him first (read runs, laps and best efforts whenever it helps: logging, the 9 pm check-in, checking 2025 history). Read-only; log anything missing from the tracker.

- 21 Nov (Dan, MFP screenshots of 11, 12 and 19 May 2025): "I'm going back to the 2025 diet that got me looking the best, feeling the best and shredded; when I hit 123 I will eat more longevity." Until the 7-day average is 123–124 the base diet IS the 2025 diet. Read from MFP: about 1,793–1,803 kcal, protein 120 / 146 / 141 g, carbs about 190–200 g, fat about 50–55 g. Breakfast cacao porridge (Quaker oats 70 g, walnuts about 3 halves, honey 12 g, cacao 7 g, semi-skimmed 40–80 ml, about 370–390 kcal). Lunch bowl (strawberries 150 g, almond milk 150 ml, raisins 15 g, hazelnuts 8 g, cacao 7 g, 1 cup spinach, avocado 60 g, collagen 28 g, milk 40 ml; sometimes an egg and 8 g almond butter; about 400–450 kcal, 23–32 g protein). Dinner chicken breast 180 g raw + boiled potatoes 260–290 g (about 410–450 kcal, 60–63 g protein), with 90 g asparagus once; or sea bass 180 g + Asda sweet potato mash 380 g + 40 g chicken (435 kcal, 40 g protein). Snack bowl about 550–570 kcal, 41–44 g protein: Fage 0% 210–330 g, Biotiful kefir protein 100–110 g, blueberries 100 g, frozen grapes 60 g, Green & Blacks 85% 30 g, honey 18 g, milk 80 ml. These are the Glow one-tap meals (porridge, bowl, chicken, seabass, yog). He chooses the spinach himself in his lunch bowl: never flag it. After 123–124: longevity eating (more oily fish, plants, varied nutrients), maintenance about 2,199.

- 21 Nov (Dan): variations on the 2025 diet. Twice a week only, 4 eggs + Kallo lentil cakes instead of the porridge breakfast (Glow one-tap meal "4 eggs + 4 Kallo cakes"). Dinner alternates fish and chicken, both with potatoes. Everything else stays the same. Keep at least two fish dinners a week oily (trout, salmon, mackerel, sardines) for omega-3 and vitamin D; sea bass and redfish are lean white fish.

- 22 Nov (Dan, his history): spring 2025 shred on the diet saved above, then a Majorca trip and about a month of binge in summer 2025 (+10 lb, face puffy and watery). Recovery diet: more animal foods (heart, kidney, red meat, chicken, egg yolks, wild salmon), way less oats and potatoes, then potatoes back, salted meals, strict, always the yoghurt bowl; nearly back to shredded weight but the face never the same (watery). Summer 2026 shred: fewer oats, more yoghurt bowls, no collagen smoothie, fewer potatoes; face better but still puffier than 2025; same now. Coaching view given 22 Nov: most likely body composition at the same weight (facial fat leaves late), long dieting and cortisol, sleep; worth a GP blood panel (thyroid, coeliac, ferritin, B12, vitamin D, HbA1c, kidney function and a urine albumin test) because he is coeliac, and persistent puffiness plus feeling cold or hair shedding needs ruling out. Plan: weekly same-light morning face photo plus waist, and a 2-week maintenance break at 123-124 to see whether the face tightens.

- 22 Nov (Dan): "140 g protein is a load of crap, it should be at least 0.8 g per pound." PROTEIN PLAN CHANGED: aim 105 g (0.8 g/lb of about 127-130 lb), 100 g counts as on target, 130+ is a bonus (about 1 g/lb) and never a need. Three feeds of 30-40 g. PLANV.protein 105, proteinMin 100, proteinHi 130; MACRO.pro and Glow's target follow PLANV. The old 130-140 aim (his own, 17-18 Nov) is retired: never quote 140 or call 100-129 a miss. The 9 pm check-in quotes protein vs 100+ (aim about 105), with 130+ as a bonus.

- 22 Nov (Dan: "do the field-by-field sync but so I can easily go back"): SAFER SYNCING. Each value changed gets its own timestamp (S.ts keyed 'w|date' or 'd|date|field'); on a merge a value edited later wins whichever copy holds it; unstamped copies behave as before. Runs and the food diary keep their id merges. Switch: Data tab > Storage > "Safer syncing" (S.settings.fieldSync=false = the old way). Other ways back: republish Artifact version 285, or git tag pre-fieldsync. Test: fieldsync.mjs (10 checks).
- 22 Nov (Dan's MyFitnessPal exports, summarised by another tool; the zips themselves never reached Claude): median day Mar-May 2025 vs Aug 2025-Nov 2026: calories 1,796 vs 1,798, protein 139 vs 136 g, carbs 204 vs 190 g, fat 56 vs 61 g, fibre 25 vs 19 g, potassium 2,642 vs 1,963 (-26%), saturated fat 17 vs 22 g, steps about 13.2k vs 13.6k. Weights in MFP: 132 (15 Apr 2026) to 126.4-126.8 (Jun-Jul), 126.6 on 2 Sep. Sodium and vitamins in the export are unreliable. Reading: intake has been about 1,800 for 18 months with weight flat, so either logging runs light or his body has adapted; potassium and fibre fell after the 2025 shred diet (fewer potatoes, fruit, avocado).

- 22 Nov (Dan): "every Sunday along with the day review I want a total week review by 9 pm and what I can improve on for the following week." Scheduled task "Sunday week review" (trig_01FWzsDLZYP2MPC5GUc8m9qJ), every Sunday 20:50 UK, fires into the main session, ahead of the daily 20:56 check-in. Covers the week Mon-Sun: running program vs 2025, gym, steps, weight averages, recovery, food, camp, and the 3 best things to improve next week.

- 22 Nov (Dan): NEVER say he is "behind" on anything (the Xmas camp, a week, a measure): use ahead, on pace, or room to grow with the number and what to do next. He also said yes to progress photos: he will send a morning face photo and a body photo (and a waist at the navel), daily or weekly, same light and place. The image files stay on his phone (Claude cannot store them in the app): Claude looks at each one when sent, notes what it shows (puffiness, definition, waist number, weight average) and keeps that log here and in the tracker's waist data; the Sunday review compares them with earlier ones honestly.

- 22 Nov (Dan: "yh make that"): the app has a "📸 Progress check" card on Today (#progCard, under "Everything in one place"): face puffiness 1-5 (days[d].puff), waist at the navel in cm (S.waist[date], 50-110), face/body photo ticks (days[d].photoFace, photoBody), and this week against last. The photos themselves stay on his phone; Claude notes what each shows. Waist now merges by date across devices.
