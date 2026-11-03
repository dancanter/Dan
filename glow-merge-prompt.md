Finish merging Glow into Cut Block 71 so it works as one app: one store, one place to log, and every PROFILE.md hard rule respected. Read cut-block-71/PROFILE.md and CLAUDE.md first. Work on branch claude/training-recovery-nutrition-system-stt0sj, on top of your commit 87844fb ("Glow inside the tracker: a Glow tab with a two-way bridge").

## 0. Sync Glow's source first
Glow's latest code is on branch claude/nutrition-cellular-antiaging-hp6hno, folder glow/ (last commit 5b27511). Run `git diff <your glow/> origin/claude/nutrition-cellular-antiaging-hp6hno -- glow` and bring across anything your copy is missing. These are the newest pieces:
- src/engine/binge.ts and src/components/Binge.tsx: binge log, after-binge plan, triggers and pattern card
- src/engine/illness.ts and src/components/Illness.tsx: sick days with the neck check
- src/data/ideas.ts: daily ideas
- src/engine/review.ts: weekly review, cellular section, since-start, cut vs maintenance
- src/engine/dayplan.ts: DEFAULT_ROUTINE (run 12:45, gym 18:00) and the 4 meal slots
- uk-raw-honey (tsp 7 g / tbsp 21 g), the olive-oil tbsp fix (13.5 g) and spoon parsing in parse.ts
- Meal labels: Breakfast / 2pm (after walk/run) / Pre-gym / Post-gym

From now on, the glow/ folder on your branch is the only copy of Glow. Make all Glow changes there.

## 1. One store, nothing typed twice
The tracker's state (S, doc state/main) is the source of truth. Inside the tracker, Glow must read these from the tracker and must not show its own input boxes for them:

| Data | Tracker field | What changes in Glow |
|---|---|---|
| Weight | S.weights (already syncs) | Keep as is |
| Sleep | days[d].bed, wake, sleep, phoneOut | Hide Glow's CheckIn sleep form |
| Morning heart rate | days[d].rhr | Hide the HR box in Glow's Vitals |
| Steps | days[d].steps | Hide the steps box |
| Study and deep work | the tracker's study and deep hours fields | Glow's studyLoad reads them |
| Training | days[d].runs, gym, split, sets, gymRpe | Map into Glow's Session[] for the recovery clock, load and sets. Strava stays in the tracker |
| Refeed | days[d].refeed | Glow's noisyDates and refeed logic read it |
| Kcal eaten | Glow's diary totals → days[d].kcal | Already bridged. Keep exactly one diary feeding kcal (see section 3) |

Glow's own data (food items, binges, ill, journal, extras, rituals, feelings) is stored in the same tracker store, under days[d].glow or the keys you already use. Glow must not create a second document for it. Keep the bridge's merge-by-date rule so two devices can't wipe each other's days.

## 2. Log everything from the tracker's Today Log panel
Add these to the existing Log panel, next to Refeed, Skin AM and the others:
- **😵 Binge button:** opens the BingeLog chips (what, size, when, triggers) and saves days[d].binges[]. Then show the "Reset, don't restrict" after-binge card on Today. A binge day marks the next two weigh-ins as noise, the same way postRefeed does. Add `|| y.binges` to postRefeed. Note: a binge also makes the next 2 mornings water-noisy.
- **🤒 Ill button:** IllLog (kind and severity) saved to days[d].ill, plus the neck-check card. Fever, chest, stomach or a bad illness means greenLight shows stop: no run, no gym. A mild above-the-neck illness means easy only.
- **📓 Journal (new; nothing exists yet):** days[d].journal = { mood 1–5, energy 1–5, well: text, learned: text, tomorrow: text (tomorrow's first task), free: text }. Show a compact card on Today. Add a Journal history list (newest first, searchable) on the Mind tab. Feed mood and energy averages into the weekly review and the Sunday 8 pm campWeekReview. Ticking the journal also ticks the "journal" daily idea.
- **Daily ideas:** add Glow's "Ideas for today" (3 a day, shuffle, tick) below the Log panel.
- **Day plan:** add Glow's hour-by-hour plan to Today, collapsed by default.

## 3. Food: one diary
Glow's diary (the library of about 4,700 foods, raw/cooked, egg sizes, Kallo cakes, raw local honey, micronutrients, the pillars) becomes the diary. Keep the tracker's 📷 Scan a packet and "Or type it" Claude lookup, but they save into Glow as a custom food plus a log entry. Remove or fold away the tracker's separate eaten[] diary so kcal is never counted twice. Migrate any existing days[d].eaten entries into Glow items.

Meal slots and the Food tab's "Eating times" table must match Dan's real day (he said this on 2 Nov):
- breakfast on waking
- 2pm meal after the walk or run
- pre-gym meal at 17:30–18:00
- gym about 18:00
- post-gym meal as the last feed

Replace "gym 18:30, bowl 20:30, lunch 12:30".

## 4. PROFILE.md hard rules: make Glow obey them everywhere
Search all of glow/src (science.ts, swaps.ts, seasons.ts, ideas.ts, dayplan.ts, coach.ts, feelings.ts, binge.ts, review.ts, score.ts quests and warnings, Season.tsx, LookGood.tsx, FACE_GUIDE, BLOATING_GUIDE) and fix every recommendation that breaks these rules. Logging any food is always allowed; only advice changes.

- **Never recommend excluded foods:** broccoli, sprouts, cabbage, kale, rocket, watercress, spinach, olive oil, green tea, Brazil nuts, lentils, onion, leek, garlic.
  - Add an `excluded` flag in the food library.
  - bestFoodsFor() (the review's "best gluten-free fixes"), swaps, quests, the day plan and ideas must skip excluded foods.
  - Replacements: avocado or nuts for olive oil; egg yolk or sardines for selenium; asparagus, courgette, peppers or beetroot for the greens.
- **Never recommend liver**, beta-carotene, biotin or vitamin D tablets, or high-dose vitamin C. Vitamin D stays food-first: oily fish only.
- **No sweeteners and no processed food.** Glow's binge plan and "urge to binge" advice currently say "2–3 drops of sweetener". Change them to: no sweetener; sweeten with berries, cinnamon, vanilla or 1 tsp raw honey. Squash and sweetener tips must not suggest using them.
- **Retinol and tretinoin are stopped for good.** Remove every retinol mention from Glow's skin, rituals and day plan.
- **Salt once a day, steady.** Never advise cutting it. Glow's de-puff and sodium warnings must frame it as "keep salt steady, raise potassium".
- **Calories come from the tracker,** not Glow's season plan.
  - Glow's kcalForDate must read the tracker's own target and logic: strict block 1,799 with Saturday 1,999, 1,899 at a 124.9 average, the cut to 24 Dec with the trip free, maintenance from 25 Dec, reverse about +100 a week. Check the latest commits and CFG for the exact current rules.
  - Glow's own defaultSeason dates and goalCall/reverse must defer to the tracker's Reverse tab (revWatch, REV_DECIDE). Don't run two reverse plans.
- **Training rules:**
  - 4 runs a week maximum, never 4 in a row, never two hard days back to back.
  - **Saturday is stress-free:** no runs, no gym, no study in the day plan, ideas or coach calls.
  - **Never name days for runs.** The day plan must not say "run today". Show "Run slot (if today is one of your picked run days)" and use the tracker's greenLight for go, easy or stop.
  - Never flag a rest day as missed. No prescribed rest intervals or fixed paces.
- **Steps targets:** 13k on weekdays, 12k on Sunday, and Saturday is whatever comes naturally (about 10,500 at most). Glow's stepsVerdict currently says 10–13k.
- **Tone:** no "behind" framing. Glow's seasonProgress says "A little behind"; reword it calmly.
- **Training and recovery calls:** where Glow's coach calls (rest, ease, deload, refeed) overlap the tracker's greenLight, calCall, signals and restCard, the tracker's version wins. Inside the tracker, hide Glow's duplicates or feed them the tracker's verdict, so Dan never gets two different answers.

## 5. Weekly review
Glow's weekly review should be one section of the tracker's Review tab and of the Sunday campWeekReview. That covers:
- the cellular pillars, micronutrient coverage, strongest and lowest nutrients with allowed food fixes
- protective foods vs stressors, and the week's staples
- since your first week
- cut vs maintenance
- binges, sick days, and journal mood and energy

Don't keep a second standalone review.

## 6. Tests and acceptance
- **Glow:** `npm test` in glow/ passes. Add tests for:
  - excluded foods never appearing in bestFoodsFor, swaps, ideas or the day plan
  - no "sweetener", "retinol", "liver" or "olive oil" in any recommendation string (grep the built glow.html too)
  - the Saturday plan having no run, gym or study
  - the journal saving and reading back
- **Tracker:** run the existing mjs suites (python3 mktest.py, then each *.mjs). Add a new journal.mjs (or glowmerge.mjs) covering:
  - logging a binge, a sick day and a journal entry from the Today Log panel
  - the reload persisting them
  - a binge day making the next two weigh-ins noise
  - a below-the-neck illness turning greenLight to stop
  - sleep, RHR and steps typed once in the tracker showing up in Glow's recovery and review
  - kcal from the diary not being double counted
  - no horizontal scroll at 390 px
- Take screenshots of Today, the Glow tab and Review at phone width, and check them.

## 7. Ship
- Republish to https://claude.ai/artifact/Juj2MvWam6n4kg1JQ8G9Xp with file_path and url only (plus glow.html as a file), so capabilities carry forward.
- Update PROFILE.md section 10 with the new data keys (binges, ill, journal, glow items) and the fact that Glow lives in glow/.
- Commit with the session's attribution lines, no model identifiers, and push to claude/training-recovery-nutrition-system-stt0sj. No PR.
- Then tell Dan, in plain words:
  - what moved where
  - what he now logs only once
  - which Glow advice changed because of his rules
