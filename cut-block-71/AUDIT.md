# The Good Life: audit, 12 Nov 2026

Step 1 of the redesign Dan asked for ("deeper, not bigger": integrate, never remove). Nothing in the app
was changed for this audit. Method: the published build was loaded at phone width (390 × 844) with Dan's
real stored state, every tab was opened, and every visible card was recorded (title, height, text, inputs).
The targets each screen states were then pulled out of the rendered text and compared.

## Size
- 8 sections, 26 tabs, 226 cards, about 185 phone screens of scrolling in total.
- Today tab: 47 cards, 28 screens. The log panel starts 1.4 screens down and has 48 inputs; "what do I do
  today" starts at 3.3 screens; the running coach is at 15 screens; the daily check-in at 20.6.
- Food logging is in another section (Nutrition → Food), 2.2 screens down, under four other cards.
- One file: 11,600 lines, about 560 functions; the page is 2.87 MB (0.87 MB compressed), 9,500 elements on load.

## The five jobs, and what serves them on Today
| Job | Cards on Today |
|---|---|
| Log the morning / log food | 3 (and food is on another tab) |
| What do I do today | about 10, giving the day's call in 5 different places |
| Progress | about 30 |
| 9 pm review | 3–4 |

## Where screens disagree (rendered on 12 Nov, a run-free week, plan = 1,799 kcal)
| Number | What different screens say |
|---|---|
| Calories today | 1,799 (push card, strict line) · 1,899 ("👉 Today" plan, "Calorie call: hold at 1,899", Training log "1,899 a day", "no deeper deficit than 1,899") |
| Steps | 8k+ a day (longevity habits) · 8–13k (cortisol table) · 10–13k "by the scale" (cortisol fix, Skin) · 11–13k week average (push card) · 12–13k a day, 10,500 Saturday (run-free card, on Today, Coach, Training log) · 13k weekdays / 12k Sunday (Food) · 12,800 a day (Training log, Skin, Calories & reverse) · 80,000 a week (Review) |
| Weight goal | 122–124 (Today numbers, Review, Training log) · 123–124 (dashboard, push) · 122–123 → 122.5 (shred meter, badges, Data) · 123.5 (push line) |
| Protein target | 140 g (10 tabs) · 135 g (Calories & reverse, Diary & seasons) · about 95 g, 1.6 g/kg (longevity habits) · 105–140 (Diary & seasons) |
| Gym a week | 5–6 (new) · "Gym 3–4, legs 6–10 sets" and "Gym 4×" (Training log) · legs range 8–12 (Muscle) |
| Hard runs | run-free week (plan) · "0 hard runs this week, against a target of 2 and a ceiling of 3" (Today) |
| Recovery | "Recovered: a strong day" (day plan) · "Still recovering" (recovery clock: Camp, Muscle, Food) · "Fully landed: ready for a hard session" (running coach) |
| Phase and clocks | block day 55 of 75, 20 days to go · camp day 32 of 73 · "3 Dec optimisation, 21 days" · the push, 42 days · cortisol says "the push to 24 Dec" (the old push) · road says "London on 21 Nov" · "Trip and refuel 3–12 Dec" and a reverse from 3 Dec at 1,870 kcal (superseded: the shred runs to 24 Dec) |
| Sleep | 8–9 h (most) · 7.5 h+ (habits, health age) · 8 h (quest) |

## Duplicates
- Health age block (5 cards): Today and Health & longevity. Cortisol: Today and Stress & calm. Running coach
  and achievements: Today and Camp. Check-in: Today and Mind. "Your block so far": Today, Review, Wins.
- The run-free call appears 5 times across Today, Coach and Training log.
- Two food diaries (Glow "Food" and the older "Diary & seasons") and two "today's food" screens.
- Three recovery systems (day plan, recovery clock, absorption) with three verdicts.

## Dan's own questions as design bugs (this conversation)
1. Numbers that disagree: protein 118 vs 131 and "isn't my target 105?"; "1 hard run" in a run-free week; 14,500 steps.
2. Things he could not find: the Body page, the log ("put this near the top"), the strength boss fights.
3. Sync: a stale phone copy wiped the TMA, the run-free week, a BP reading, the protein target and astaxanthin.
4. Plans that changed in chat but not on every screen: the push, steps, gym count, 5-milers.

## Root causes
1. No single source of truth: targets are typed into sentences in many functions, so a plan change reaches some screens only.
2. Layered phases (cut block, camp, physique camp, old push, finish, reverse, new push) all still render.
3. Every new idea became a new card on Today; nothing was folded back in.
4. Whole-document sync: the last device to save wins, field by field patches were added only after losses.

## Plan (in order; each step ships on its own, nothing removed)
1. One plan object (`PLAN`): calories, protein, steps, gym, runs, weight goal, sleep, phase and dates, read by every
   card. A test renders every tab and fails if any screen states a different number.
2. One phase and one clock: retire the superseded phases from the screens (kept in history), so every card says the same "where am I".
3. Today rebuilt around the five jobs: log (morning + food in one place), today's session, then progress folded into
   one dashboard, review at 9 pm. Every existing card kept, grouped behind those five.
4. Sync by field with timestamps, plus a replay test with a stale phone copy.
5. Usage counters for a week, task timings, Lighthouse and axe-core, and the evidence table for the coaching rules.
