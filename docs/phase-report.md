# Quality phase — final report

28 August 2026. The goal of this phase was not more features. It was
trustworthy, safe, calm, fast, reviewable and ready for real users.

Everything below was measured. Where something could not be verified, it says
so rather than rounding up.

**Ten commits. Seven of them exist because something turned out to be broken.**

---

## 1. What I changed

Ordered by how badly it was broken, not by the order I did it.

**"Delete everything permanently" did not delete everything.** Seeded all nine
stores plus a bump photo, clicked the button a user clicks, and inspected what
survived: the **bump photo**, the **movement journal**, the **maternity unit's
phone number**, the week reached, the intro flag, the app status and the
accessibility settings. Someone who had just lost a pregnancy and chose to
delete everything would still have had a bump photo on their phone. The cause
was a hard-coded list of three resets that nothing had been added to since.
`src/lib/wipe.ts` now enumerates every key under the app's prefixes and clears
the photo database, so a store added next year is covered without anyone
remembering. Re-tested in a browser: nothing survives.

**Then found the same bug a second time.** Settings has its own "Reset my
data", which called three hooks by hand — the identical failure. It goes
through `wipeAllLocalData()` now, and its wording says what actually goes.

**A cold load that failed left a blank white page.** If the entry script did
not download, React never ran, so the error boundary could not help. Someone
opening the app for the first time on hospital wifi got nothing at all. There
is now plain HTML inside `#root` that React replaces on mount, revealed after
four seconds by a **CSS animation delay rather than a timer** — a timer is
JavaScript and JavaScript is what has failed. It offers 111 and 999 and says
not to wait for the app.

**"difficulty breathing" matched no urgent entry.** The hint list had
"breathless" and not "breathing", so one of the most serious things a person
can type returned a reading list. "Feeling very unwell" matched nothing either,
despite "I just feel something's wrong" existing for exactly that. Adding
"breath" as a bare word would have fixed one and broken something else, because
the app contains a breathing exercise — so the match is now on the phrase.

**"chest pain" offered Back pain and Pelvic pain**, because "pain" is in both
names. Suggesting back pain to someone typing chest pain is worse than
suggesting nothing: it reads as the app having an opinion about what is wrong
with them. A name match now has to be on a word that tells the entries apart.

**The text size control changed no text**, for two stacked reasons. The hook
that writes `--user-font-scale` was called only by the four screens that
happened to want one of its other values, so on Get Help it never ran. And
every size in the app was in px, which the root scale cannot reach. The hook now
runs at the app root and all 253 sizes are in rem. Measured: Extra large takes
Get Help from 16.5px to 21.45px.

**Colour contrast failed on all twelve screens tested.** The inactive
navigation tabs were dimmed with opacity, computing to **3.92:1** against paper
— under the 4.5:1 floor, on every screen. Clay measured 3.79:1 as the active
tab and 2.98:1 as a note title on sand.

**A milestone celebration was standing in front of Get Help.** Found by walking
the usability plan's own first task in a browser: Playwright could not click
the Get Help tab because the celebration's full-screen backdrop was
intercepting pointer events. It is no longer a modal.

**The urgent search panel rendered broken English.** It folded a first-person
title into a sentence: _"don't read up on it — i'm bleeding is something to get
checked"_. And it sat outside the live region, so a screen reader user typing
"bleeding" heard "2 entries match" and nothing else.

Plus: guide rows had their padding on the card rather than the summary, so the
real tap target was a 25px strip inside a 52px box, on the library's main
browsing surface; footer and Get Help links were 13–16px tall runs of text
separated by dots; the deletion confirmation announced nothing when it opened.

**New tooling:** `npm run content-diff`, `npm run content-audit`,
`npm run clinical-review`. **New docs:** `content-safety.md`,
`privacy-and-resilience.md`, `usability-testing-plan.md`, `held-claims.md`,
`clinical-review-pack.md`.

## 2. What I verified

|                                  |                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Colour contrast, axe WCAG 2.1 AA | **0 violations on 12 screens**, in a real browser where contrast is genuinely computable                              |
| Keyboard                         | Every control reachable, every one with an accessible name, focus visible throughout, no positive tabindex, on all 12 |
| Reflow                           | No horizontal scroll at 320px, 390px, 430px, landscape, 195px, or at Extra large text on two widths                   |
| Touch targets                    | ≥44px on every screen tested                                                                                          |
| Deletion                         | Seeded, deleted, snapshotted — nothing survives                                                                       |
| Offline                          | Cold launch, Today, Get Help, urgent detail and lazily-loaded Guidance all render with the network off                |
| External hosts                   | Exactly one across nine screens: `fonts.googleapis.com`                                                               |
| Get Help first paint             | **77ms cold, 92ms with the font host hanging** (12,737ms before the async font fix)                                   |
| Search                           | All ten urgent phrases from the brief reach the urgent route; all five natural-language questions return something    |
| Content integrity                | `validateContent()` clean; 792 claims tracked                                                                         |
| Content-diff tooling             | Verified against three deliberate meaning changes, all three flagged                                                  |

## 3. What remains unverified

**The single largest gap in the whole project, stated plainly:**

- **111 of 122 sources have no link.** Only **11 are openable** (9%). Every one
  of those is a research paper with a DOI or PMC id that `sourceUrl()` derives
  automatically. **Not one NHS, NICE, RCOG, SACN or charity source has a URL** —
  61 NHS, 12 government, 4 college and 18 charity, plus the 16 research sources
  that carry no identifier. The app tells people its claims are checkable; for
  91% of its sources they currently are not.
- Only **46 of 122 state a date** (38%), and only **10 state a review date**
  (8%). The rest are blank rather than guessed.
- **No qualified clinician has reviewed any of this content.** The app says so
  in its own footer on every screen, and nothing in this phase changed that.
- **No user testing has happened.** `docs/usability-testing-plan.md` is a
  script, not results.
- **`anderson-2026-dairy` cannot be verified.** It was removed, then restored
  on your instruction and flagged instead. It has no DOI, journal or PMID
  because none was supplied and this environment has no outbound network
  access. It renders as plain text while every other citation on that screen is
  a link, and the entry says in bold that it cannot be checked.

**Why the URLs are missing is an environment limit, not a judgement call.**
Outbound network access is blocked here — `WebFetch` and `curl` to nhs.uk and
doi.org both return `EGRESS_BLOCKED`, verified twice. I could not open a single
NHS page to confirm a URL, and guessing one that looks right is exactly the
failure mode the brief forbids. This is the one task that needs a machine with
a network, and it is mostly mechanical.

## 4. Sources still needing manual verification

**All 111 unlinked ones**, but in this order:

1. **The 61 NHS sources.** Highest volume, easiest to confirm, and they carry
   most of the urgent guidance. An hour with a browser probably clears most.
2. **The 12 government and 4 college sources** (SACN, NICE, RCOG, HSE) — fewer,
   but they are what the app leans on when it says "UK guidance".
3. **The 18 charity sources** (Tommy's, NCT, Sands, PANDAS, Samaritans).
   Signposting a phone number that has changed is a live harm, not a citation
   tidy-up.
4. **The oldest dated sources**, judged on their own terms rather than by age:
   `hse-pregnant-workers` (1999), `daley-2010-grassfed` (2010),
   `bozzo-2011-cosmetics` (2011), `thorning-2017-matrix` (2017),
   `clemens-2017`, `kesikburun-2018`.
5. **`anderson-2026-dairy`** — needs a reference, not a check.

`npm run sources` prints the full list. Adding a `url` or a DOI to
`sources.ts` is all that is required; `sourceUrl()` resolves the rest.

## 5. Content needing clinical review

`docs/clinical-review-pack.md` (2,668 lines) and
`docs/clinical-review-urgent.md` (338 lines) exist for this, giving each item's
content ID, text, sources, evidence type, funding caveats, publication date and
review date. `npm run content-audit` ranks the same content by risk.

**Give a reviewer the urgent pack first.** It is 13 pathways and 338 lines —
about an hour — and it covers everything where being wrong means someone does
not phone.

Highest-scoring items on the worklist, all scoring 9:

`urgent:contractions` · `urgent:itching` · `urgent:leg` ·
`loss:assessment` · `loss:grief` · `loss:symptoms` · `loss:types` ·
`loss:what-helps` · `afterLoss:again` · `afterLoss:grief` ·
`guide:iron-anaemia` · `guide:feeding-benefits-calibrated`

Two things about that list. **The loss and after-loss content dominates it** —
it is the most emotionally consequential writing in the app and among the least
corroborated, and it needs a bereavement specialist (Sands, the Miscarriage
Association) rather than a general midwife. And **three urgent pathways score
9**, which is the combination the score is designed to catch: a single source,
no date, nothing openable, and a serious consequence if wrong.

**93 entries rest on a single source** (80 of the 111 guides). Not wrong — less
corroborated.

## 6. Privacy risks found

Full detail in `docs/privacy-and-resilience.md`. Measured, not read off the code.

- **The deletion bug**, described above. This was the real privacy finding of
  the phase, and it was found by testing rather than reading. Fixed twice.
- **One external host, on every screen: `fonts.googleapis.com`.** Recorded
  every outbound request across nine screens; nothing else is contacted — no
  analytics, no error reporting, no CDN, no third-party script. The font
  request carries what any HTTP request carries (IP, user agent, referrer) and
  no pregnancy data, because there is none in it and no code that would put it
  there.
  **Residual risk:** loading the app tells Google a browser at that IP loaded a
  page. Self-hosting the fonts would remove it. Not done.
- **No backend, no account, no upload path** anywhere in the codebase.
  Everything recorded stays in `localStorage` and IndexedDB.
- **The export is written entries only.** It does not contain photos, and the
  deletion screen now says so and links to the gallery.

## 7. Offline and performance findings

| Scenario                             | Result                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Offline cold launch after one visit  | **Works** — Today, Get Help, urgent detail and lazy Guidance all render |
| Font host hanging                    | **Get Help renders in 92ms** (12,737ms before the async font fix)       |
| Font host unreachable                | Works, falls back to system fonts                                       |
| `localStorage` throws on access      | Get Help renders                                                        |
| IndexedDB unavailable                | Gallery explains it rather than showing an empty grid                   |
| Lazy chunk fails mid-session         | Error boundary catches it, offers 111/999 and a reload                  |
| **Entry script fails on first load** | **Was a blank page. Now a static fallback with 111 and 999.**           |
| JavaScript disabled                  | Same static fallback                                                    |
| Corrupt stored state                 | App still renders                                                       |

Get Help is **77ms cold**. The guidance library at 111 entries is 365ms and is
lazily loaded, so it is not on the critical path.

**Not tested:** real devices, iOS Safari (which behaves differently around
IndexedDB in private mode and around `tel:` links), throttled-but-alive
networks as opposed to blocked ones, the installed PWA rather than a browser
tab, and an actual service-worker version-to-version upgrade on a device
holding an old worker.

## 8. Accessibility findings

Everything in §1 plus:

- **axe reports 0 violations across all 12 screens** at WCAG 2.1 AA, in a real
  browser. Before this phase it was 12 screens with contrast failures.
- **Reduced motion** is honoured, including the breathing pacer — nothing loops.
- **Forced colours** (Windows high contrast): the 999 button keeps a 2px
  border and survives. The **111 button on the urgent detail screen has no
  border** and is distinguished only by fill, which forced-colours mode
  overrides. That is a real remaining gap on a screen that matters, and it is
  the one accessibility item I did not fix.
- Two of my own test harness's checks were wrong and were corrected rather than
  worked around: CSS `zoom` does not shrink the CSS viewport so it does not
  test page zoom, and WCAG 2.5.8 exempts targets inline in text and controls
  wrapped in a large label.

**Not tested: a real screen reader.** Everything here is automated checks plus
DOM assertions about roles, names, live regions and focus. VoiceOver and
TalkBack on real hardware have not been used, and no automated check
substitutes for that.

## 9. Tests and results

All seven commands the brief lists, run on the final tree:

| Command                 | Result                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| `npm test`              | **224 passing, 21 files** — exit 0                                  |
| `npm run typecheck`     | Clean — exit 0                                                      |
| `npm run lint`          | Clean — exit 0                                                      |
| `npm run build`         | 48 precached entries, 764 KiB — exit 0                              |
| `npm run readability`   | 188 entries, mean grade **7.0** (reading age ~12); 60 above grade 8 |
| `npm run sources`       | 122 sources, 11 openable, 46 dated                                  |
| `npm run content-audit` | `validateContent()` clean; ranked worklist                          |

Tests added this phase: search safety (the brief's exact ten urgent and five
natural-language queries), deletion including the Settings path, and the
milestone celebration's non-modal properties. **28 new test blocks**, several
parameterised, taking the suite from 19 files to 21.

**No test was weakened to make it pass.** Twice a test failed because my own
copy was wrong and I changed the copy: once when the food-sort wording
contained "score" and failed my own no-scoring test, once when a food rule said
"tinned tuna" where the guidance says "limit tuna to 4 cans".

## 10. What should NOT be built yet

- **No new games or relaxation activities.** The intended set is Myth or Fact,
  Food Safety Sort, Pregnancy Terms, Breathing, Grounding and Quiet Minute.
  Five of the six exist. **Grounding does not** — that is the only gap, and it
  is one small addition, not ten.
- **No streaks, points, badges, leaderboards or guilt mechanics.** Still none in
  the codebase; a test asserts it.
- **No kick counting.** The Movement Journal records times and kinds, never a
  count or a total, and task C in the usability plan is designed to check that
  people believe the app when it says not to count.
- **No diagnosis and no risk scoring.** Search offers the urgent route and never
  says what is wrong; a test asserts the panel never contains "probably",
  "likely", "sounds like" or "this is normal".
- **No notifications.** The app cannot send any, and the deletion screen now
  says so instead of implying otherwise.
- **No accounts, no sync, no backend.** The privacy claim is only true because
  there is nowhere for data to go.
- **Do not fix task E's routing before the usability test.** Today does not link
  to the calming tool. That was a deliberate choice — offer calm where distress
  is expressed rather than advertise it. Whether it works is what the test is
  for, and pre-solving it is designing from assumption.

## 11. The exact next step before adding more features

**Verify the source URLs on a machine with a network.**

Not because it is the most interesting thing left, but because it is the one
thing blocking everything else. The app's entire proposition is that its claims
are checkable, and **91% of its sources currently are not**. A clinical
reviewer opening the pack today has to take 111 citations on trust, which makes
the review worth much less than the reviewer's time. It is mechanical work — no
judgement, no writing, just opening pages and pasting URLs into `sources.ts` —
and it cannot be done from here.

Then, in order:

1. **Send `docs/clinical-review-urgent.md` to a midwife.** 13 pathways, about
   an hour. Nothing else in the app matters if the urgent copy is wrong.
2. **Send the loss and after-loss content to a bereavement specialist** — Sands
   or the Miscarriage Association. It dominates the risk worklist and needs a
   different reviewer from the rest.
3. **Run the usability test.** Six to eight people, their own phones, the six
   tasks. Task A is pass/fail for the product.
4. **Close the forced-colours gap on the 111 button.**
5. Only then, build Grounding.

Nothing on that list is a feature. That is the point of the phase.
