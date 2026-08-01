# Bump — a day-by-day, week-by-week pregnancy guide

A prototype PWA that turns carefully-sourced maternal health research (NHS, NICE, SACN, NCT, and peer-reviewed meta-analyses) into a warm, accessible, day-by-day companion for pregnancy — instead of another wall of text to scroll through.

**Live demo:** _add your deployed URL here after connecting the repo to Vercel/Netlify_

## The problem this solves

Good maternal health information exists, but it's scattered across PDFs, NHS pages, and academic papers, and it's rarely presented in a way that's genuinely pleasant to keep coming back to during 40 weeks of pregnancy. This project takes a growing body of cited research and turns it into a week-by-week guide that:

- surfaces one relevant, evidence-based tip a day instead of front-loading everything at once,
- keeps every claim traceable to its source (NHS, NICE, SACN, NCT, or a named study), so trust is earned rather than assumed,
- is built for a reader who may be tired, nauseous, on one hand with a phone, or simply new to using apps like this,
- installs like a native app with no App Store friction and works offline.

## Why a PWA, not a native app

"Download app" here means an installable Progressive Web App: one React codebase, installs to a home screen/desktop via the browser's native install prompt, works fully offline after first load, and deploys to a free public URL in minutes — no App Store review, developer account, or native toolchain. A native app would roughly double the build effort for this stage without adding to what the project demonstrates engineering-wise.

## Tech stack and why

- **React 18 + TypeScript + Vite** — fast iteration, and TypeScript makes the content data model (below) compiler-enforced rather than trusted by convention.
- **Tailwind CSS v4** — fast to build a consistent, accessible-by-default UI (focus rings, spacing scale, `prefers-reduced-motion` support are built in).
- **`vite-plugin-pwa`** — generates the manifest and offline service worker from a few lines of config rather than hand-rolled caching logic.
- **React Router v6** — plain client-side routing; no SSR/SEO requirement here, so a static SPA keeps hosting free and deployment a one-command affair.
- **Framer Motion** — for the "reveal today's tip" interaction, with first-class `prefers-reduced-motion` support.
- **No backend** — all content is static, bundled data; personal state (due date, streak, viewed articles) lives in `localStorage`. This is a deliberate scope decision for a prototype stage, not an oversight — see "Next steps" below.
- **Vitest + React Testing Library + axe-core** — component tests plus automated accessibility checks in CI, not just claimed accessibility.

## Content architecture — designed to grow

All research lives in `src/content/` as typed data, decoupled from the UI:

```
src/content/
  schema.ts        // the contract: Source, ContentItem, WeekPlan, Badge
  sources.ts        // one citation object per source — referenced by id, never inlined in prose
  topics/*.ts        // one file per research theme (iron, dairy, omega-3, hormones, stress, weight & body image, supplements, ...)
  weeks/week-NN.ts   // one file per pregnancy week, referencing ContentItem ids from topics/
  weeks/placeholders.ts // lightweight stand-ins for weeks not yet written, so the timeline never has gaps
  index.ts           // aggregates everything + a dev-time integrity check
```

Adding a new research batch later means adding to a `topics/` file and referencing it from a `weeks/week-NN.ts` file — no component code changes required. A dev-time validation pass (`validateContentIntegrity`, also covered by `tests/content.integrity.test.ts`) checks that every source and content reference actually resolves, so a typo in a content file surfaces immediately instead of silently breaking a screen.

Two weeks are fully populated end-to-end right now as a working demonstration:

- **Week 9** — hormones and "why symptoms happen" explainers, the stress & mental health module, and core supplement guidance.
- **Week 20** — iron & anaemia, dairy & birth outcomes, dairy & iodine, oily fish/omega-3, fruit/veg/fibre gaps, and the weight & body image module.

Every other week (4–8, 10–19, 21–42) has a lightweight placeholder so the timeline browses end-to-end without broken links, ready to be filled in the same way.

## Engagement, without guilt

The source content is deliberately anti-diet-culture and anti-guilt (see the weight & body image and "don't diet" material), so the app's engagement mechanics were designed to match that tone rather than undermine it:

- a daily "tap to reveal" tip card instead of a wall of text,
- a streak counter that never uses loss-framing on a missed day — total days visited is tracked separately from the current streak, so a gap doesn't erase visible progress,
- milestone badges tied to pregnancy weeks/trimesters, never gated or punishing,
- no paywalls, no artificial locking of future content.

## Accessibility

Built to a WCAG 2.1 AA target for an audience that may be dealing with fatigue, nausea, one-handed phone use, or unfamiliarity with apps like this: semantic HTML, ≥44×44px touch targets, ≥4.5:1 text contrast, `prefers-reduced-motion` respected throughout, an in-app text-size setting on top of OS-level scaling, aria-live announcements for streak/reveal updates, visible focus rings, and focus moved to each screen's heading on navigation. `axe-core` accessibility checks run automatically in `npm test` and in CI.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # production build, generates the PWA manifest + service worker
npm run preview     # serve the production build locally
npm test            # component, accessibility, and content-integrity tests
npm run typecheck
npm run lint
```

## Next steps

- Populate the remaining placeholder weeks as more research is compiled.
- Optional cross-device sync (e.g. Supabase) if this moves beyond a single-device prototype — deliberately out of scope for now to keep hosting free and the architecture simple.
- Expand automated accessibility coverage to every screen, and add end-to-end tests for the onboarding → daily-tip → article flow.
