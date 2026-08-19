# Field Notes — an evidence-based pregnancy guide

An independent, installable pregnancy guide that turns carefully-sourced maternal health research (NHS, NICE, RCOG, SACN, NCT and named peer-reviewed studies) into something genuinely pleasant to open every day — instead of another wall of text to scroll through.

**Live:** https://dancanter.github.io/Dan/ — auto-deployed on every push via GitHub Actions.

## The problem

Good maternal health information exists, but it's scattered across PDFs, NHS pages and academic papers, and it's rarely presented in a way you'd want to return to across 40 weeks. Field Notes takes that evidence and builds a week-by-week companion that:

- surfaces a handful of relevant things a day rather than front-loading everything,
- keeps **every claim traceable to a named source**, including funding conflicts — trust is earned rather than assumed,
- is built for a reader who may be exhausted, nauseous, one-handed on a phone, or new to apps like this,
- puts urgent "when to get help" guidance one tap away from every screen, with no setup wall in front of it,
- installs to a home screen and works fully offline.

## What's in it

Navigation is three layers — **Today**, **Explore**, and **Get Help** — with Get Help visually set apart and permanently one tap away rather than competing with browsing tabs.

| Screen | What it does |
| --- | --- |
| **Home** | Week picker, this week's focus checklist, timed reading suggestions, a daily myth card, and a prompt to save for your midwife |
| **Home, after birth** | The same route, switched over: days/weeks since birth, a postnatal checklist, recovery and feeding reads, and a mood check-in |
| **Baby** | Week-by-week development and size, milestone timeline, optional nickname |
| **My Body** | 16-symptom explorer — why it's happening, what helps, and when it stops being routine |
| **Guidance** | 110 searchable, individually-cited entries across four life phases — *During pregnancy* (nutrition, supplements, food safety, exercise, sleep, wellbeing, weight, medications, vaccinations, existing conditions, alcohol & smoking, **work rights**, everyday safety, skincare, travel, infections), *Birth & labour*, *After birth*, and *Feeding* |
| **Appointments** | Your antenatal timeline, tailored to first vs subsequent pregnancy |
| **Get Help** | 12 urgent symptoms in plain language, each opening to *what to do now* (one-tap call), *why it matters*, then reassurance where true |
| **Movement journal** | Times and kinds of movement. Explicitly **not** a kick counter — no count, no target, no verdict |
| **Bump gallery** | Optional weekly photos in IndexedDB, with a time-lapse. No prompts, no completeness indicator |
| **My pregnancy has changed** | Pause · support after loss · delete (export offered first) · go back. Never asks what happened |
| **Loss support** | Pregnancy and baby loss — its own quiet route, never surfaced on a daily screen |
| **Inequalities** | UK maternal health disparities, paired with what a reader can actually do about them |
| **Journal** | Mood, notes, questions and symptoms, with a mood history strip. Persists locally |
| **Sources** | All 115 references, grouped by evidence tier, with funding conflicts flagged |

## Design decisions worth explaining

**The daily screen is phase-aware, so the library reaches it.** 110 entries is more than anyone will browse. Rules in `weeklyReads.ts` decide what surfaces on Home in a given week, and each suggestion leads with *why now* rather than its title — "packed from around 37 weeks" is what makes someone tap. Birth prep appears from week 24, labour and feeding from 34, recovery from 37. Same content, arriving when it's useful.

**Once the baby arrives, Home becomes a different screen — on the same route.** Setting a birth date (not the due date passing, since babies arrive weeks either side) switches Home to weeks-since-birth: a postnatal checklist, recovery and feeding reads, and a mood check-in that surfaces postnatal depression guidance when it's needed. The pregnancy-only tabs disappear, because week-by-week foetal development is actively wrong at that point. Nothing bookmarked or installed breaks.

**Disparities are stated, then made actionable.** UK maternal mortality is unevenly distributed — MBRRACE-UK data shows Black women at roughly 2–2.3× the risk of White women, and women in the most deprived areas at ~1.9×. A statistic like that is the wrong thing to drop into a daily checklist, and useless on its own. So it lives on its own route, and every figure is followed by something a reader can use: self-refer without a GP, ask for a professional interpreter, ask for a second opinion, contact PALS, go back and ask again. `validateContent()` fails the build if the actionable section ever disappears.

**Safety content is never gated, and onboarding asks for one thing.** A due date, and nothing else — everything else is asked later, in context, where it first changes something. `/help`, `/loss`, `/inequalities` and `/changed` all render without any setup, and Get Help is linked from the onboarding screen itself.

**The app never assesses whether anyone is well, and says so.** That boundary drives real design decisions rather than sitting in a disclaimer: the Movement Journal stores times and kinds but no count or total, the "contact your maternity unit" line there is permanent rather than appearing when the app decides something looks wrong, and the statement itself renders on every urgent screen. A test asserts *what to do now* precedes *why this matters* on all 12 of them — an explanation above an instruction is the wrong way round for someone frightened.

**No streaks, points or badges.** They were built, then removed on reflection: a streak turns a missed day into a small failure for someone exhausted, and a badge for reaching week 24 rewards the passage of time as though it were earned. What survives is only what a reader gets something back from — entries read, myths turned over, focus items ticked.

**Loss support is deliberately separate.** It has no streaks, no checklists, no week context, and is never surfaced on a daily screen — reachable only when someone goes looking. Tone-shifting content shouldn't ambush anyone mid-checklist.

**Sources get excluded on judgement, not just included.** One observational cosmetics study was left out entirely: it named no specific ingredient, so a reader could do nothing with it except feel diffuse anxiety. Similarly, only the cross-confirmed practical guidance was taken from one wide-ranging review, not its single-study ingredient claims. Not every available citation improves an app.

**No kick counting.** NHS and RCOG guidance is explicit that there's no target number and counting isn't recommended — so the app deliberately does *not* ship a kick counter, and the myth deck says so directly. Same reasoning behind the home-doppler myth card.

**Engagement without guilt.** The source material is deliberately anti-diet-culture, so the mechanics match it: streaks never use loss-framing, days-visited is tracked separately so a gap erases nothing, badges are tied to weeks reached rather than perfect attendance, and milestone celebrations show **once** — someone installing at week 30 gets one warm moment, not five queued pop-ups.

**Citations are a registry, not inline strings.** Sources live in `src/content/sources.ts` and are referenced by id. A source can be corrected in one place; funding caveats (the dairy/iodine paper is National Dairy Council-funded) travel with the source and always render.

**Content is data, not JSX.** Everything lives in typed files under `src/content/`. Adding research means editing data — no component changes.

## Stack

React 18 · TypeScript · Vite · Tailwind v4 · `vite-plugin-pwa` (Workbox) · React Router · Framer Motion · Vitest + Testing Library + axe-core.

No backend. All content ships with the bundle; everything personal (due date, journal, streak, ticks) stays in `localStorage` on the device and is never transmitted.

Routes are code-split so the initial download stays ~105kB gzipped despite the content volume. Onboarding, Today and **Get Help** load eagerly — the daily entry point and the screen someone might need urgently should never wait on a chunk.

## Content architecture

```
src/content/
  schema.ts        the contract — Source, Guide, Symptom, Myth, BabyWeek, …
  sources.ts       citation registry, tiered gov → nhs → college → charity → research
  guides/          the Healthy Pregnancy reference, grouped by section
  babyWeeks.ts     development + size for weeks 1–42, plus milestones
  equity.ts        maternal health inequalities, and what to do about them
  urgent.ts        the urgent flow — action, then explanation, then reassurance
  afterLoss.ts     support-after-loss content
  privacy.ts       the plain-English privacy page
  symptoms.ts      the symptom explorer
  redFlags.ts      urgent escalation content
  myths.ts         the daily myth deck
  weeklyFocus.ts   rule-based weekly checklist (one rule, many weeks)
  weeklyReads.ts   what surfaces on Home in a given week, and why now
  afterBirth.ts    the same, keyed on weeks since birth
  index.ts         aggregation + validateContent()
```

`validateContent()` runs in dev and in CI. It fails on a dangling citation, a duplicate id, a symptom missing its "when to check" flag, any week between 1 and 42 without baby data, focus items or suggested reading, any of the 52 weeks after birth without the same, and any reading rule pointing at a guide id that no longer exists — so a content typo is a test failure, not a silently broken screen.

## Accessibility

WCAG 2.1 AA target: semantic landmarks, ≥44px touch targets, `prefers-reduced-motion` honoured throughout (celebrations skip confetti entirely), in-app text-size and high-contrast controls on top of OS scaling, `aria-live` for streaks and reveals, focus moved to each screen's heading on navigation, and focus moved into the symptom detail panel on selection. **axe-core runs against all twenty screens in `npm test`.**

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build + PWA manifest and service worker
npm run preview
npm test           # content integrity, component and accessibility tests
npm run typecheck
npm run lint
```

## Next

- Continue expanding the evidence base — the content layer is built for it.
- Partner/support-person view.
- Optional cross-device sync, deliberately out of scope while this stays private-by-default.
