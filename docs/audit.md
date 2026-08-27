# Phase 1 audit — August 2026

> **Status, after Phases 1–3.** Twelve of fourteen findings are fixed, each marked ✅
> below with what was done. Finding 14 was not in the original audit — it turned up
> while measuring Phase 3, and was the most serious thing found all session.
>
> Two remain open: the ~60 unverified source URLs (finding 1, blocked on network
> access) and the content barrel (finding 4, a refactor best done before more
> content lands). Finding 8, natural-language search, belongs to Phase 4.

Written against commit `1b32e29`, by inspection rather than from the README. Where the
README and the code disagreed, the code won and the README is listed as a finding.

Measured, not assumed: `npm run build`, `npm test`, `npm run readability`, and a script
that counts the content registry directly.

## What the app actually contains

| | |
| --- | --- |
| Routes | 21, of which 6 render without onboarding |
| Screens | 21 components, 21 covered by axe (now 22) |
| Guides | 111 |
| Sources | 122 |
| Urgent symptoms | 13 |
| Symptoms · myths · glossary terms | 16 · 16 · 28 |
| Tests | 65 passing, 8 files (now 122 across 13) |
| Readability | mean grade 7.0, worst 10.1, 59 of 183 entries above grade 8 |
| First paint | ~197 kB gzipped (now 150 kB) |

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

## The fourteen findings

### P0 — fix before anything else

**1. Not one of the 122 sources has a URL.** ✅ *partly fixed*
`Source.url` exists in the schema. `SourceList` and `SourcesScreen` both already render an
`<a>` when it's present. Zero sources populate it. So the app's central claim — every entry
sourced, evidence inspectable — currently terminates in a name a reader cannot check.

*Done:* `sourceLinks.ts` derives a link from the permanent identifier the citation already
carries — DOI, PMC or PubMed id — preferring free full text over the paywalled version of
record. Nothing is hand-typed, so nothing can drift, and a new paper added with a PMC id
becomes checkable automatically. 11 of 122 now open.

*Not done, and deliberately:* the NHS, NICE, RCOG and charity pages carry no such
identifier, so a link for them has to be a real URL someone has checked. This session had no
network egress, so checking was impossible, and a guessed slug looks identical to a real one
until someone taps it. They are left unlinked, and the Sources screen now says how many open
and why the rest don't. **This is the single highest-value piece of work still outstanding**
— roughly 60 URLs, each needing one visit to confirm. `validateContent()` already rejects
anything that isn't a valid https address.

**2. Focus is not moved on 8 of 21 screens.** ✅ *fixed*
`ScreenTitle` now owns focus management, so there is no ref for a screen to forget. The eight
dead hook calls are gone, and `tests/a11y/screens.test.tsx` asserts focus lands on the `<h1>`
for the screens that were broken. Verified in a real browser as well as in jsdom.

*The problem was:* `useAutoFocusHeading` returns a ref. Explore, Appointments, Journal,
Guidance, Settings, My Body, Sources and Methodology all *called the hook and discarded the
return value* — the effect ran and focused nothing. These were precisely the screens using
`ScreenTitle`, which set `tabIndex={-1}` and an id but had no way to accept a ref. Every one
of those files looked correct, which is what made it survive. WCAG 2.4.3.

**3. The urgent detail screen is not in the axe suite.** ✅ *fixed*
21 screens were tested. `UrgentDetailScreen` was not — the most safety-critical screen in the
app, and the only one carrying the glossary buttons and the read-aloud control. Now covered;
it passed without changes, but it was passing untested.

### P1 — fix during Phase 2/7

**4. First paint is ~197 kB gzipped, not the ~105 kB the README claims.** ✅ *half fixed —
now 150 kB*
Measured: entry chunk 109.3 kB + content 55.4 kB + router 17.0 kB + ~15 kB across fourteen
smaller `modulepreload`s. Two root causes, both precise:

- `main.tsx` does `import './content'` for the dev-time `validateContent()` side effect.
  In production that side effect is dead code behind `import.meta.env.DEV`, but the import
  still drags the entire 111-guide library into the eager graph, where Vite emits a
  `modulepreload` for it. Today needs about four entries.
- Framer Motion sits inside the eager entry chunk, because `TodayScreen` statically imports
  `MythCard` and `MilestoneCelebration`. Roughly 100 kB raw for two decorative animations
  on one screen.

*Done:* the myth card's reveal is now a CSS animation, and `MilestoneCelebration` — the only
remaining Framer Motion consumer, and one that mounts seven times in a whole pregnancy — is
lazily loaded behind `Suspense`. The dev-only `import './content'` in `main.tsx` is now a
dynamic dev-only import. The entry chunk went 109 → 67 kB gzipped and first-paint JS went
197 → 150 kB.

*Still open:* the content chunk (54 kB) remains in the first-paint graph, because Today and
Get Help import through the `src/content/index.ts` barrel, which re-exports all 111 guides
with their full bodies. Today needs about four titles. Fixing it properly means separating a
lightweight guide index (id, title, summary, section) from the bodies, which touches every
content file — the "giant rewrite" the brief warns against doing early. It is the right next
performance job, and it should happen before Phase 6 adds more content.

**5. IndexedDB failure is unhandled.** ✅ *fixed* — `photoStore` now throws a typed
`PhotoStoreUnavailable` for a browser that refuses to open a database (private windows,
managed devices, and the `onblocked` path Firefox uses), and the gallery says so rather than
rendering an empty grid that reads as *your photos are gone*. The unhandled rejection that
was polluting the test run is gone.

**6. The a11y suite's `beforeEach` does not actually reset state.** ✅ *fixed* — the helper
now dispatches a `StorageEvent`, which is what invalidates `usePersistedState`'s module
cache. It was passing only because every test happened to write an identical profile.

**7. There is no error boundary anywhere.** ✅ *fixed* — every route is wrapped, keyed on
pathname so navigating away clears the failure. The fallback is not a generic apology: it
offers 111 and 999 as plain `tel:` anchors, because routing is one of the things that might
have thrown.

### P2 — Phase 3/4 work

**8. Search is substring-only.** `HealthyScreen` filters with `includes()`. "brie" finds the
entry; "can I eat brie" finds nothing. The brief's Phase 4 natural-language search can
reuse the existing filter shape.

**9. Source review dates cover 10 of 122.** ✅ *mostly fixed — now 46*
Honestly left blank rather than guessed, which is right — but 8% coverage could not support
the freshness signal Phase 3 wants. Deriving the year from what each citation already states
("NICE, August 2021", "Nutrients 2024;16(19):3231") took it to 46 without inventing anything.
The remaining 76 are standing NHS and charity pages that publish no date in-line; they still
show nothing rather than a guess. `npm run sources` reports the registry's health, and
deliberately prints **no stale/fresh verdict** — the oldest source is the 1999 Management of
Health and Safety at Work Regulations, which is legislation and exactly as current as the day
it was written, so "old = out of date" would have been confidently wrong about the first
entry it flagged.

**10. Nothing explains *why* a given source.** ✅ *fixed*
Every entry now carries an evidence label derived from its sources — *UK guidance*,
*guidance + research*, *research not guidance*, *charity guidance* — with a "Why we say this"
disclosure explaining what that means, and funding conflicts lifted above the citation list
rather than buried in it. The urgent flow keeps the plain list on purpose.

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

### Found later, during Phase 3

**14. The font stylesheet was holding the entire app hostage.** ✅ *fixed*
Measuring the render cost of the evidence layer turned up something much worse than the thing
being measured. The Google Fonts stylesheet was a render-blocking `<link>`, so a slow or
unreachable font host delayed **first paint of the whole app**. Measured on Get help:
**12,737ms when the request hung, against 280ms when it failed fast.**

That breaks the app's central promise — that Get help is one tap away and never waits on
anything — and it fails in exactly the conditions where someone is most likely to need it: a
bad signal, a captive portal, a restricted network. All the eager-chunk work in finding 4 was
being undermined by a third-party stylesheet in `index.html`.

Loading it asynchronously (`media="print"` + `onload`, with a `<noscript>` copy) brings Get
help to **122ms with the host unreachable**. Text renders immediately in the fallback stacks
and swaps when the font arrives.

Worth noting how this was found: not by a test, and not by reading the code. It only appeared
when the page was loaded in a real browser on a network where that host does not resolve.

## Architectural risks

**The content barrel is the perf ceiling.** `src/content/index.ts` re-exports everything, so
any screen importing one symbol pulls the whole 55 kB chunk. Breaking it up touches every
screen — worth doing *before* Phase 6 adds more content, not after.

**`GuideSection` is a 27-member union** that must stay in sync with `GUIDE_SECTIONS`.
`validateContent()` catches drift in both directions, so this is a maintenance cost rather
than a hazard.

**Guidance is one page rendering 111 `<details>` elements.** Fine now; it will not stay fine
as the library grows.

## What's left

In order:

1. **The ~60 unlinked source URLs** (rest of P0-1). Needs network access to verify each one.
   Highest remaining trust gain in the whole brief, and it's data entry, not engineering.
2. **Break the content barrel** (rest of P1-4) — before Phase 6 adds more content, not after.
3. **A shared screen shell** (P2-11) — eleven screens still hand-roll their own `<main>` and
   `<h1>`. Phase 2's visual-calm work gets several times cheaper afterwards.
4. Then Phase 3 (evidence labels, freshness, "why we say this" — P2-8, P2-9, P2-10) and
   Phase 4 (natural-language search — P2-7).

Findings 12 and 13 are handled: the README's three overstatements are corrected, and the
readability tail is recorded as a known, measured position rather than a claim.
