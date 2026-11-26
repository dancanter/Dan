# HANDOFF: The Good Life (Dan's tracker), 27 Nov 2026

Read `PROFILE.md` first (who Dan is, every hard rule, every decision, in date order; it overrides anything here).
This file says what exists, how it is built, how to change it safely, and the brief for the next version.

## 1. What exists today (live, published)
- One published artifact, "The Good Life": https://claude.ai/artifact/Juj2MvWam6n4kg1JQ8G9Xp (about version 295). Sharing is "anyone with the link".
- Data lives in the artifact's shared database: collection `state`, doc `main` (one JSON document: weights, days, settings, bests, foods, glow, waist, ts). Read and write it with the `ArtifactData` tool (`get` with `out_dir`, edit in Python, `set` with `file_path` and `if_version`; if the first `set` says "no approval record", just retry). A new session sees the same data, nothing is lost by starting a new session.
- Code: `cut-block-71/index.html` (the tracker, vanilla JS, about 12,300 lines) plus `glow/` (React/vite food and nutrition app, 107 vitest tests) embedded into one file by `node build-app.mjs`. Publish ONLY `cut-block-71/app.html` with the Artifact tool, using the same URL.
- Git branch `claude/training-recovery-nutrition-system-stt0sj` (fetch and merge before pushing). Roll-back: republish an older artifact version, or `git tag pre-fieldsync`, `pre-calm`, `pre-minicamp`.
- Foods: about 4,776 (213 curated in `glow/src/data/foods.ts`, 168 UK products in `ukFoods.ts`, 4,395 USDA rows in `usda.json`); every food carries macros and a micronutrient panel (many `?` for unknown micros). Add a UK food by one line in `ukFoods.ts` (see the existing lines for the field order), then run the Glow tests.

## 2. Dan's current plan (details in PROFILE.md)
- Calm mode is ON (S.settings.calm): the overview shows "Your four things" (sleep 8+ h, protein 100+ g, 2 hard runs and 4 gym a week, steps 11-12k) plus longevity score, nutrition score and micronutrients. Everything else is a bonus. Never say he is "behind". He said "it's all stressing me out": keep it simple.
- Now to France (leaves 3 Dec): recover from a cold (logged 26 Nov), eat the 2025 diet, sleep, lift 4 a week when well. France 3-5 Dec: maintain. MINI CAMP 7-24 Dec: 10 gym, 5 hard runs (3 tests: 5 km 13 Dec, mile 20 Dec, 400 m 23 Dec), 26 h study, sleep, protein 100+, oily fish 2 a week, weight 123-124. About 4 days full rest around Christmas (last workout 23 Dec). A second camp after 24 Dec is wanted (dates not set; the build from 10 Jan is the likely start).
- Food: the 2025 diet (cacao porridge, strawberry and avocado lunch bowl, chicken or fish or venison with potatoes, the yoghurt bowl; 4 eggs and Kallo cakes twice a week); carb cycling like 2025 from the mini camp (high days 200-215 g on hard-run and leg days, low days 150-160 g with more fat). Protein aim 105 g (0.8 g per lb), 100 counts, 130+ a bonus. Calories never under 1,799.
- Scheduled tasks (they fire into the original session, so a NEW session must recreate them): "Daily Good Life check-in" 20:56 UK (trig_013iJJ346RSCdv5qCdv9h5t4) and "Sunday week review" 20:50 UK Sundays (trig_01FWzsDLZYP2MPC5GUc8m9qJ). Their prompts are readable with the scheduled-task tools; their numbers lag the mini camp, PROFILE.md wins.

## 3. How to change and ship safely
1. Edit `cut-block-71/index.html` (or `glow/src/...`). If you edit Glow: `cd glow && npx vitest run && npx vite build`.
2. `cd cut-block-71 && node build-app.mjs`.
3. Test harness (all in the scratchpad dir): `python3 mkapptest.py $SP/srv/app.html` and `python3 mktest.py $SP/cb71.test.html`, serve `cd $SP/srv && python3 -m http.server 8765` (it dies often), copy `*.mjs` to `$SP`, then `node planlint.mjs` (every target must come from the plan object `PLANV`), `node agree.mjs`, `node prog.mjs`, `node fieldsync.mjs`, `node coach.mjs`, `node glowmerge.mjs`, and the slow `node life.mjs` (3-5 min, run in the background and wait for "all passed").
4. Commit with the attribution lines the session gives you, push, then publish `app.html`.
- One plan: all targets come from `PLANV` and `planNow()`; never type a target into a sentence (planlint fails the build). Camp goals: `XCAMP`. Weights read from `WREF` (9 Nov) with `wRef()`.
- Sync: "Safer syncing" stamps each changed value (S.ts); a stale phone copy cannot overwrite a later edit. Switch off on the Data tab.
- Weigh-ins the morning after a refeed or binge are left out of every average.

## 4. Brief for the next version (what Dan asked for on 27 Nov)
Dan wants a much simpler, dashboard-first app that is "unreal interactive and fun" and points at what to do for shreds, longevity and cellular anti-ageing, with EVERYTHING in it:
- Camps as first-class objects: a camp has a name, dates and goals (the mini camp 7-24 Dec now; a second camp after). Show days to go and a calm progress view, never "behind".
- Dashboards: longevity score, health age, cortisol; nutrition score with ALL micronutrients (bars, lowest first, with the best foods to fix each gap from the food library); sleep score and trend; running (the 4 slots A/B/C/D vs his 2025 numbers); gym (4 sessions, splits, sets, progressive overload); study hours (10 h a week); steps; weight averages (not single mornings); photos, waist, puffiness and body-fat estimate trend.
- Interactive and fun: tap-to-log, streaks and levels, a "what should I do today" card (green light from sleep, resting HR, cortisol, cold), a carb-cycling day tag, and a Sunday week review inside the app.
- Keep: the 4,776-food library with micronutrients, the plan object (one source of truth), the coach rules in PROFILE.md, the Strava read (the page declares the Strava connector), field-level sync.
- Do NOT: push counts or steps, cut calories below 1,799, flag food grams, suggest his excluded foods (see PROFILE.md hard rules).
- Suggested build: a new React/vite app inside `glow/` or a new folder, reading and writing the SAME `state/main` document so no data moves; ship as a separate artifact first, then swap. Start with 5 screens: Today, Food and micros, Training, Body and recovery, Camp.

## 5. Paste this to start a new session
"Read cut-block-71/PROFILE.md and cut-block-71/HANDOFF.md. Keep the live app working. Then build the simple dashboard-first version described in HANDOFF.md section 4, using the same data (artifact state/main). Recreate the two scheduled check-ins. Dan's artifact: https://claude.ai/artifact/Juj2MvWam6n4kg1JQ8G9Xp"

## 6. Open items
- Rebuild Today around five jobs (not started), usage counters and measurement (not started).
- Longevity, cortisol and health age are estimates with stated sources, not lab values.
- Dan's MyFitnessPal export zips never reached Claude; only a pasted summary did.
