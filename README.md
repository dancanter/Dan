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

| Screen | What it does |
| --- | --- |
| **Home** | Week picker, this week's focus checklist, a daily myth card, and a prompt to save for your midwife |
| **Baby** | Week-by-week development and size, milestone timeline, optional nickname |
| **My Body** | 16-symptom explorer — why it's happening, what helps, and when it stops being routine |
| **Healthy Pregnancy** | Searchable reference: nutrition, supplements, food safety, exercise, sleep, wellbeing, weight & body image, medications, alcohol & smoking, travel, infections |
| **Appointments** | Your antenatal timeline, tailored to first vs subsequent pregnancy |
| **Get Help** | Red-flag symptoms, escalation levels, and movement guidance — reachable without onboarding |
| **Journal** | Mood, notes, questions and symptoms, with a mood history strip. Persists locally |
| **Sources** | Every reference, grouped by evidence tier, with conflicts flagged |

## Design decisions worth explaining

**Safety content is never gated.** `/help` renders without a due date set. Someone worried at 3am should not hit a setup screen.

**No kick counting.** NHS and RCOG guidance is explicit that there's no target number and counting isn't recommended — so the app deliberately does *not* ship a kick counter, and the myth deck says so directly. Same reasoning behind the home-doppler myth card.

**Engagement without guilt.** The source material is deliberately anti-diet-culture, so the mechanics match it: streaks never use loss-framing, days-visited is tracked separately so a gap erases nothing, badges are tied to weeks reached rather than perfect attendance, and milestone celebrations show **once** — someone installing at week 30 gets one warm moment, not five queued pop-ups.

**Citations are a registry, not inline strings.** Sources live in `src/content/sources.ts` and are referenced by id. A source can be corrected in one place; funding caveats (the dairy/iodine paper is National Dairy Council-funded) travel with the source and always render.

**Content is data, not JSX.** Everything lives in typed files under `src/content/`. Adding research means editing data — no component changes.

## Stack

React 18 · TypeScript · Vite · Tailwind v4 · `vite-plugin-pwa` (Workbox) · React Router · Framer Motion · Vitest + Testing Library + axe-core.

No backend. All content ships with the bundle; everything personal (due date, journal, streak, ticks) stays in `localStorage` on the device and is never transmitted.

## Content architecture

```
src/content/
  schema.ts        the contract — Source, Guide, Symptom, Myth, BabyWeek, …
  sources.ts       citation registry, tiered gov → nhs → college → charity → research
  guides/          the Healthy Pregnancy reference, grouped by section
  babyWeeks.ts     development + size for weeks 4–42, plus milestones
  symptoms.ts      the symptom explorer
  redFlags.ts      urgent escalation content
  myths.ts         the daily myth deck
  weeklyFocus.ts   rule-based weekly checklist (one rule, many weeks)
  index.ts         aggregation + validateContent()
```

`validateContent()` runs in dev and in CI. It fails on a dangling citation, a duplicate id, a symptom missing its "when to check" flag, or any week between 4 and 42 without baby data or focus items — so a content typo is a test failure, not a silently broken screen.

## Accessibility

WCAG 2.1 AA target: semantic landmarks, ≥44px touch targets, `prefers-reduced-motion` honoured throughout (celebrations skip confetti entirely), in-app text-size and high-contrast controls on top of OS scaling, `aria-live` for streaks and reveals, focus moved to each screen's heading on navigation, and focus moved into the symptom detail panel on selection. **axe-core runs against all ten screens in `npm test`.**

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
