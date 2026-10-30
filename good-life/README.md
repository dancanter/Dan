# The Good Life

A personal performance and lifestyle operating system: an adaptive running coach, a hypertrophy programme designed to coexist with it, evidence-graded nutrition and longevity research, an Open University study system, a wardrobe and Vinted deal checker, films, and a nudge to actually enjoy life — in one local-first web app, with an optional Claude-powered coach.

It treats these areas as one system. Sleep feeds readiness; readiness changes today's session; the session sets today's carbohydrate; a deadline shrinks the gym; a sunny day moves the easy run outdoors. Nothing is optimised in isolation.

## Run it (MacBook)

You need [Node.js](https://nodejs.org/) 22 or newer.

```bash
cd good-life
npm install
npm run dev          # app on http://localhost:5180, coach API on :8787
```

First run offers three routes: set up a profile (about two minutes), import a file (a backup, or a starting-profile file), or explore with clearly-labelled demonstration data.

**AI coach (optional).** Copy `.env.example` to `.env` and add an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/). The key is read only by the small Node server in `server/`; the browser never sees it, and the server listens on `127.0.0.1` only. Without a key, a rules-based offline coach answers the common questions ("what should I do today", "my paces", "am I overtraining", "foods for bone health") from the same engines the rest of the app uses. The default model is `claude-opus-5-5` at medium effort; set `ANTHROPIC_MODEL=claude-sonnet-5-5` in `.env` to roughly halve the cost.

**Use it every day.** `npm run build && npm start` serves the built app and the coach from one address (http://localhost:8787). In Chrome or Safari, *Install* / *Add to Dock* turns it into a standalone app that works offline (the coach needs the server running).

**Online.** Each push to the default branch also publishes the app to GitHub Pages at `/good-life/`, beside the pregnancy guide. That copy is static: it has no coach server, so the offline coach answers. It holds no personal data; a starting profile can be loaded with a link of the form `…/good-life/#import=z.<data>`. The part after `#` is read by the browser and never sent to GitHub, but anyone holding the link can read the profile, so keep it private.

**Phone.** The app is responsive and installable, but your data lives in the browser it is used in. To move between devices, export a backup in Settings and import it on the other one. Cloud sync is deliberately not built yet (see below).

## The sections

| Section | What it does |
| --- | --- |
| **Today** | 20-second check-in; one-tap flags (*exhausted, brilliant, heavy legs, only 45 min, deadline, sunshine, social*); three options — optimal, balanced, recovery — with the recommended one marked and the trade-offs explained; nutrition, recovery, study and lifestyle lines for the day; the week at a glance |
| **Performance → Running** | Current fitness (from *recent* results, not lifetime bests), pace zones, honest goal horizons, "soft PB" detection, session ladders that climb, repeat or step down from what you log, a post-run analysis, weekly volume by intensity |
| **Performance → Gym** | Your four-day split, tuned for shoulders, upper chest, lat width, arms and abs; set-by-set logger pre-filled by double progression; weekly hard sets per muscle against target ranges; e1RM trends; a plateau check that looks at sleep, energy, running load and effort *before* suggesting more sets |
| **Performance → Weekly plan** | Template week (Saturday rest; legs after the second quality run) plus this-week moves and swaps, with clash warnings |
| **Physique** | Evidence-gated phases (assessment → approaching target → reassessment → long-term), 7-day averages and weekly tables, an assessment of whether the target is wise (BMI, leanness, energy availability, strength retention), energy-availability estimate, a REDs-informed self-check, local progress photos |
| **Nutrition** | 79 foods with raw/dry per-100 g values, gluten status, protein quality, iron type, GI and gut-tolerance notes; daily log against day-type targets and UK reference intakes; meal templates built from foods you tolerate; goal-based rankings; absorption and timing guide; coeliac-specific guidance |
| **Cellular Health** | 17 topics (mitochondria to cancer prevention), every claim graded *established / observational / mechanistic / speculative* with sources; a supplement truth table; a glossary; the full source list |
| **Recovery** | Sleep duration and consistency, readiness trend, resting HR against your own baseline, training state (productive stress vs accumulated fatigue vs lagging recovery vs genuine improvement), training load with caveats, why sleep matters |
| **University** | SK297 and SK298 with weekly hours; assignments planned backwards from the due date; topics with detailed notes, handwritten-summary tracking and spaced review; SM-2 flashcards; a POINT → EVIDENCE → EXPLAIN → LIMITATIONS → COMPARE → EVALUATE → LINK paragraph builder; a Cite Them Right Harvard reference builder; academic-integrity notes; a public-health career path |
| **Style** | Outfit builder from your own wardrobe by occasion and weather; wardrobe with cost-per-wear; a 21-piece capsule with gaps; palettes, fabrics, fit for your frame, looks, evidence-checked grooming |
| **Vinted** | Search builder that opens real Vinted searches; a deal checker (all-in price with buyer fee, fair range from RRP or your own recorded prices, fibre, fit, fake-risk, wardrobe duplicates); a price notebook; a brand and quality guide |
| **Culture** | 60+ films — Melville, Visconti, Antonioni, Connery-era Bond, Mikkelsen and Vinterberg, Riviera and espionage — with watchlist, ratings and a "choose for me" weighted by what you rate highly |
| **Lifestyle** | Ideas ranked by weather, rest day and what you have enjoyed; your own places (with gluten-free confidence); a log that the weekly review counts |
| **Analytics** | Trends (weight, volume, load, sleep, readiness, intake, study, strength); weekly and monthly reviews (improved, deteriorated, holding you back, change, keep, highest-value action); the five-phase roadmap; personal insights with sample sizes |
| **Coach** | Chat grounded in a labelled snapshot of your data, which you can read in full on the page |

## How the intelligence works

All coaching logic is in `src/engine/` as pure, tested functions; the UI only displays it.

- **Fitness and paces** — Daniels & Gilbert's VDOT equations from your best mile-to-10 km result in the last 90 days (older results are flagged *stale*). 800 m and shorter are kept as speed markers.
- **Run analysis** — pace against the zone, rep fade and spread, effort against what the session should cost, leg feel, and context words in your notes ("wind", "heat", "low carbs"). Verdicts: progress, repeat, regress, too fast, easy too fast. Ladders are rebuilt by replaying your logs, so editing or deleting a run just works.
- **Fitness changes** — one fast session proves nothing. Two of the last three quality sessions at the fast end of target, at normal effort, with no fatigue flags, prompts an offer to update paces; a time trial overrides everything.
- **Readiness** — a weighted heuristic from the check-in (sleep, quality, energy, soreness, legs, stress, a little motivation, RHR/HRV against your own baseline). Shown as a band with its drivers, never as a verdict.
- **Training state** — distinguishes a normal post-session dip, fatigue stacking across days, recovery that isn't keeping up (usually sleep), and repeated faster-at-the-same-effort improvement.
- **"I feel brilliant"** only brings a quality session forward when readiness, recent hard sessions and training state agree. Motivation alone never makes an easy day hard.
- **Energy availability** — (intake − exercise energy) ÷ fat-free mass, as a range, once food is logged on 4 of 7 days. An adaptive maintenance estimate appears after ~14 days of food logs alongside weigh-ins.
- **Phases** — both the five-phase roadmap and the physique phases advance on explicit criteria, which are shown; you confirm every move.

## Evidence

Every cited source is in `src/data/sources.ts` with its year, type (meta-analysis, RCT, cohort, consensus, guideline, narrative review, mechanistic) and DOI or official URL. `npm run verify-sources` checks each DOI against Crossref and fails if the registered title or year does not match. Food values are typical values compiled from USDA FoodData Central with UK conventions applied (carbohydrate excludes fibre) and are shown as estimates (±10–20%).

## Privacy and data

- Data is stored in this browser's IndexedDB. Nothing is sent anywhere except: weather lookups (latitude/longitude to Open-Meteo), and — only if you add an API key — the data snapshot shown on the Coach page, sent to Anthropic via your local server with each message. Progress photos never leave the device.
- Export a backup regularly (Settings → Data). Backups are plain JSON and can include photos.
- Demonstration data is flagged on every record, labelled on every screen, and removed in one tap without touching your own entries.

## Not built (yet), stated plainly

- **Strava / watch import** — log runs manually; rep times can be pasted in one line ("3:24 3:25 3:23").
- **Cloud sync and accounts** (e.g. Supabase) — use export/import between devices.
- **Live Vinted listings** — Vinted has no public API; the app builds searches that open on Vinted and never invents listings.
- **Streaming availability and critic ratings** — these change, so films link to JustWatch UK and Letterboxd instead.

## Development

```bash
npm test             # engine + UI tests (Vitest)
npm run typecheck
npm run lint
npm run build
npm run verify-sources   # needs network access to api.crossref.org
```

Stack: React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, Zustand (persisted to IndexedDB via idb-keyval), Framer Motion, lucide icons, self-hosted Inter and Instrument Serif, vite-plugin-pwa, and the Anthropic TypeScript SDK on a dependency-free Node HTTP server.

This app gives general, evidence-informed guidance. It is not medical advice and cannot diagnose anything; for symptoms, suspected deficiencies or anything hormonal, see your GP.
