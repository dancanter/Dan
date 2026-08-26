# Phase 1 audit — August 2026

Written against commit `1b32e29`, by inspection rather than from the README. Where the
README and the code disagreed, the code won and the README is listed as a finding.

Measured, not assumed: `npm run build`, `npm test`, `npm run readability`, and a script
that counts the content registry directly.

## What the app actually contains

| | |
| --- | --- |
| Routes | 21, of which 6 render without onboarding |
| Screens | 21 components, 21 covered by axe |
| Guides | 111 |
| Sources | 122 |
| Urgent symptoms | 13 |
| Symptoms · myths · glossary terms | 16 · 16 · 28 |
| Tests | 65 passing, 8 files |
| Readability | mean grade 7.0, worst 10.1, 59 of 183 entries above grade 8 |
| First paint | ~197 kB gzipped |

## What works, and should be reused rather than rebuilt

**The content layer is the strongest thing here.** Everything is typed data under
`src/content/`, citations are a registry keyed by id, and `validateContent()` runs 27
distinct structural checks that fail the build — dangling citation, duplicate id, a week
with no baby data, a reading rule pointing at a deleted guide, an urgent entry missing its
action line, the inequalities module losing its actionable section. Every later phase
should extend this file rather than work around it. Phase 6's interactive learning can be
built entirely on top of it without hard-coding a single medical claim, which is exactly
what the brief asks for.

**Safety really is ungated.** Verified in `App.tsx`: `/help`, `/help/:symptomId`,
`/help/number`, `/loss`, `/inequalities` and `/changed` all sit outside the onboarding
redirect, and `/help` is eagerly imported rather than lazy — it never waits on a network
fetch for a chunk. This is not just documented, it's true.

**The three-part urgent structure holds.** Action, then explanation, then reassurance —
enforced by `validateContent()` and by a test, on all 13 entries.

**`usePersistedState` is sound.** `useSyncExternalStore` over a shared module cache, with a
real `storage` listener so an installed PWA open in two places stays consistent. Reuse
as-is; don't introduce a second storage pattern.

**No guilt mechanics, verifiably.** `useProgress` holds no streak, score or badge state and
nothing in `src/` references one. The brief's hardest constraint is already met.

**The readability harness works.** Four enforced ceilings, a clinical-term allowlist, and a
CLI report separated from the test so importing it prints nothing.

**The glossary auto-links.** Adding a term to `glossary.ts` makes it tappable everywhere it
already appears in body copy, with no content-file edits. That is the right shape for
Phase 3's glossary work.

## Findings, ranked

### P0 — fix before anything else

**1. Not one of the 122 sources has a URL.**
`Source.url` exists in the schema. `SourceList` and `SourcesScreen` both already render an
`<a>` when it's present. Zero sources populate it. So the app's central claim — every entry
sourced, evidence inspectable — currently terminates in a name a reader cannot check. This
is the highest value-per-hour fix in the entire brief and it needs no new code, only data.

**2. Focus is not moved on 8 of 21 screens.**
`useAutoFocusHeading` returns a ref. Explore, Appointments, Journal, Guidance, Settings, My
Body, Sources and Methodology all *call the hook and discard the return value* — the effect
runs and focuses nothing. These are precisely the screens that use `ScreenTitle`, which
sets `tabIndex={-1}` and an id but has no way to accept a ref. A keyboard or screen-reader
user navigating to Guidance is left at the previous screen's focus position. WCAG 2.4.3,
and the README claims it's handled throughout.

**3. The urgent detail screen is not in the axe suite.**
21 screens are tested. `UrgentDetailScreen` is not — the most safety-critical screen in the
app, and the only one carrying the glossary buttons and the read-aloud control.

### P1 — fix during Phase 2/7

**4. First paint is ~197 kB gzipped, not the ~105 kB the README claims.**
Measured: entry chunk 109.3 kB + content 55.4 kB + router 17.0 kB + ~15 kB across fourteen
smaller `modulepreload`s. Two root causes, both precise:

- `main.tsx` does `import './content'` for the dev-time `validateContent()` side effect.
  In production that side effect is dead code behind `import.meta.env.DEV`, but the import
  still drags the entire 111-guide library into the eager graph, where Vite emits a
  `modulepreload` for it. Today needs about four entries.
- Framer Motion sits inside the eager entry chunk, because `TodayScreen` statically imports
  `MythCard` and `MilestoneCelebration`. Roughly 100 kB raw for two decorative animations
  on one screen.

**5. IndexedDB failure is unhandled.** `photoStore.openDb()` rejects and nothing catches it.
It surfaces today as an unhandled rejection in the test run, and in Firefox private
browsing or a locked-down iOS profile it is a blank gallery plus a console error. Needs a
caught failure and an honest message.

**6. The a11y suite's `beforeEach` does not actually reset state.** `localStorage.clear()`
fires no `StorageEvent` for same-window writes in jsdom, so `usePersistedState`'s module
cache survives between tests. It passes only because every test writes an identical
profile. The first test that needs a different one will silently get the first one's.

**7. There is no error boundary anywhere.** A throw inside any lazily-loaded screen blanks
the whole app — including on the way to `/help`.

### P2 — Phase 3/4 work

**8. Search is substring-only.** `HealthyScreen` filters with `includes()`. "brie" finds the
entry; "can I eat brie" finds nothing. The brief's Phase 4 natural-language search can
reuse the existing filter shape.

**9. Source review dates cover 10 of 122.** Honestly left blank rather than guessed, which
is right — but 8% coverage cannot support the freshness signal Phase 3 wants.

**10. Nothing explains *why* a given source.** `SourceList` names it and shows its tier
colour; `methodology.ts` explains the process globally; no individual entry links the two.

**11. Screen furniture is duplicated.** Twelve screens hand-roll their own `<main>` + `<h1>`
instead of using `ScreenTitle`, and there are three separate hand-written quick-link footer
blocks (`App`, `TodayScreen`'s paused state, `GetHelpScreen`). Phase 2's visual-calm work
gets several times cheaper after one shared screen shell — and finding 2 disappears with it.

### P3 — worth knowing

**12. The readability tail is still there.** Mean 7.0 is good; 59 of 183 entries remain
above grade 8, worst 10.1.

**13. The README overstates three things** — bundle size, focus management, and an
`aria-live` announcement for streaks that no longer exist. It is the CV-facing artefact, so
a claim a reviewer can disprove in thirty seconds costs more than a smaller true one.

## Architectural risks

**The content barrel is the perf ceiling.** `src/content/index.ts` re-exports everything, so
any screen importing one symbol pulls the whole 55 kB chunk. Breaking it up touches every
screen — worth doing *before* Phase 6 adds more content, not after.

**`GuideSection` is a 27-member union** that must stay in sync with `GUIDE_SECTIONS`.
`validateContent()` catches drift in both directions, so this is a maintenance cost rather
than a hazard.

**Guidance is one page rendering 111 `<details>` elements.** Fine now; it will not stay fine
as the library grows.

## Recommended order

1. Source URLs (P0-1) — data only, largest trust gain.
2. Shared screen shell, which fixes focus on 8 screens (P0-2, P2-11) and unblocks Phase 2.
3. Urgent screen into the axe suite; error boundary; IndexedDB failure path (P0-3, P1-5, P1-7).
4. Break the content barrel and lazy the motion components (P1-4) — before Phase 6.
5. Correct the README (P3-13).

Then Phase 2 proper.
