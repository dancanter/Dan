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

Navigation is a single tab bar — Home · Baby · My Body · Guidance · Appointments · **Get Help** · Journal · Sources — with Get Help set apart in red and present on every screen. An **Explore** route lists everything in one place for anything not in the bar. The pregnancy-only tabs disappear once a birth date is set, or in support-after-loss mode.

| Screen | What it does |
| --- | --- |
| **Home** | Week picker, this week's focus checklist, timed reading suggestions, a daily myth card, and a prompt to save for your midwife |
| **Home, first visit** | One dismissible card: what the app cannot do, and where urgent help is. Not a tour |
| **Home, after birth** | The same route, switched over: days/weeks since birth, a postnatal checklist, recovery and feeding reads, and a mood check-in |
| **Baby** | Week-by-week development and size, milestone timeline, optional nickname |
| **My Body** | 16-symptom explorer — why it's happening, what helps, and when it stops being routine |
| **Guidance** | 111 searchable, individually-cited entries across four life phases — *During pregnancy* (nutrition, supplements, food safety, exercise, sleep, wellbeing, weight, medications, vaccinations, existing conditions, alcohol & smoking, **work rights**, everyday safety, skincare, travel, infections), *Birth & labour*, *After birth*, and *Feeding* |
| **Appointments** | Your antenatal timeline, tailored to first vs subsequent pregnancy |
| **Get Help** | 13 urgent symptoms in plain language, each opening to *what to do now* (one-tap call, read-aloud), *why it matters*, then reassurance where true |
| **Movement journal** | Times and kinds of movement. Explicitly **not** a kick counter — no count, no target, no verdict |
| **Bump gallery** | Optional weekly photos in IndexedDB, with a time-lapse. No prompts, no completeness indicator |
| **My pregnancy has changed** | Pause · support after loss · delete (export offered first) · go back. Never asks what happened |
| **Loss support** | Pregnancy and baby loss — its own quiet route, never surfaced on a daily screen |
| **Inequalities** | UK maternal health disparities, paired with what a reader can actually do about them |
| **Need a minute?** | Slow breathing and a noticing exercise. Names the crisis case first and routes it off the page |
| **Journal** | Mood, notes, questions and symptoms, with a mood history strip. Persists locally |
| **Sources** | All 122 references, grouped by evidence tier, with funding conflicts flagged. The research papers link straight through |

## Design decisions worth explaining

**The daily screen is phase-aware, so the library reaches it.** 111 entries is more than anyone will browse. Rules in `weeklyReads.ts` decide what surfaces on Home in a given week, and each suggestion leads with *why now* rather than its title — "packed from around 37 weeks" is what makes someone tap. Birth prep appears from week 24, labour and feeding from 34, recovery from 37. Same content, arriving when it's useful.

**One thing on Home is allowed to be big.** Today used to be six sections of identical visual weight, so nothing told you where to start — and on a screen opened by someone exhausted or nauseous, "everything is equally important" reads as "work out what matters yourself". Now the most relevant read for the week is promoted into its own card; the rest drop to a quiet list; and the myth card and midwife prompt move below the quick actions, because they were only competing with the week's guidance by being the same size.

**"Since you were last here" tracks the week, and deliberately never the date.** Someone who opens the app once a fortnight should get something useful rather than the same screen again — you're in a new week, here's what became relevant while you were away. What it never says is how long it's been: *"you haven't been here in 9 days"* is a streak wearing a different hat, aimed at exactly the wrong audience. A test asserts the banner never says *day*, *missed*, *behind* or *streak*, and never appears on a first visit, an unchanged week, or while browsing ahead.

**No guide appears twice on one screen.** Building the above produced the same bug twice — the promoted read relisted inside "since you were last here", then the newly-relevant reads relisted under "also relevant now". Both sides now read from one `newReadsBetween()` in the content layer instead of each deriving it, and a test holds the line. Neither was visible in jsdom; both were obvious in a screenshot.

**Once the baby arrives, Home becomes a different screen — on the same route.** Setting a birth date (not the due date passing, since babies arrive weeks either side) switches Home to weeks-since-birth: a postnatal checklist, recovery and feeding reads, and a mood check-in that surfaces postnatal depression guidance when it's needed. The pregnancy-only tabs disappear, because week-by-week foetal development is actively wrong at that point. Nothing bookmarked or installed breaks.

**Disparities are stated, then made actionable.** UK maternal mortality is unevenly distributed — MBRRACE-UK data shows Black women at roughly 2–2.3× the risk of White women, and women in the most deprived areas at ~1.9×. A statistic like that is the wrong thing to drop into a daily checklist, and useless on its own. So it lives on its own route, and every figure is followed by something a reader can use: self-refer without a GP, ask for a professional interpreter, ask for a second opinion, contact PALS, go back and ask again. `validateContent()` fails the build if the actionable section ever disappears.

**Safety content is never gated, and onboarding asks for one thing.** A due date, and nothing else — everything else is asked later, in context, where it first changes something. `/help`, `/loss`, `/inequalities` and `/changed` all render without any setup, and Get Help is linked from the onboarding screen itself. Since that leaves a first-time reader arriving at a full daily screen having been told nothing, one dismissible card says the two things easiest to get wrong about a pregnancy app — it cannot tell you whether you or your baby are well, and urgent guidance is one tap away. Not a modal and not a tour: a tour would put four screens between someone and the help they may have opened the app to find.

**Every screen is the same shell, and there are three widths.** Screens used to write their own `<main>` and `<h1>`, and they had drifted to six different max-widths, three heading sizes and three top paddings. Nothing was wrong on any one screen, but moving between them the page kept quietly resizing under you. Width is now chosen on what the content *is* — `focus` for a single decision, `reading` for prose, `default` for lists — rather than how much of it there happens to be.

**The app never assesses whether anyone is well, and says so.** That boundary drives real design decisions rather than sitting in a disclaimer: the Movement Journal stores times and kinds but no count or total, the "contact your maternity unit" line there is permanent rather than appearing when the app decides something looks wrong, and the statement itself renders on every urgent screen. A test asserts *what to do now* precedes *why this matters* on all 12 of them — an explanation above an instruction is the wrong way round for someone frightened.

**No streaks, points or badges.** They were built, then removed on reflection: a streak turns a missed day into a small failure for someone exhausted, and a badge for reaching week 24 rewards the passage of time as though it were earned. What survives is only what a reader gets something back from — entries read, myths turned over, focus items ticked.

**Loss support is deliberately separate.** It has no streaks, no checklists, no week context, and is never surfaced on a daily screen — reachable only when someone goes looking. Tone-shifting content shouldn't ambush anyone mid-checklist.

**Sources get excluded on judgement, not just included.** One observational cosmetics study was left out entirely: it named no specific ingredient, so a reader could do nothing with it except feel diffuse anxiety. Similarly, only the cross-confirmed practical guidance was taken from one wide-ranging review, not its single-study ingredient claims. Not every available citation improves an app.

**No kick counting.** NHS and RCOG guidance is explicit that there's no target number and counting isn't recommended — so the app deliberately does *not* ship a kick counter, and the myth deck says so directly. Same reasoning behind the home-doppler myth card.

**Engagement without guilt.** With the scoring gone, what's left has to earn its place honestly: milestone celebrations show **once** — someone installing at week 30 gets one warm moment, not five queued pop-ups — the bump gallery has no completeness indicator, and no screen ever implies you've fallen behind.

**Readability is measured, then enforced.** NHS guidance targets a reading age of about 9–11 for public-facing health information. An audit (`npm run readability`) scores every entry with Flesch–Kincaid: the content started at a **mean grade of 8.3 — reading age ~13 — with 99 of 183 entries above grade 8 and a worst case of 15.5.** Rewriting the worst offenders brought that to **mean 7.2, worst case 10.3**. Four tests now hold the line: a ceiling on the mean, a ceiling per entry, a stricter ceiling for the urgent flow (nobody frightened should have to parse a clause), and a 45-word sentence limit. Every future simplification should pull those ceilings down.

**The glossary is the other half of the readability work.** The audit caps the score penalty for terms like *pre-eclampsia* because they have no shorter accurate synonym — but capping a penalty does nothing for a reader who doesn't know the word. So the same terms carry plain-English definitions, and become tappable **automatically wherever they already appear** in body copy: adding an entry to `glossary.ts` needs no change to any content file. A test fails if a definition uses another glossary term inside itself.

**Read-aloud, on the urgent screens only.** Someone frightened at 3am, hands shaking, possibly without their glasses, should be able to be *told* what to do. It reads the action line before the explanation — the same order the screen uses — and is deliberately absent from the browsing screens, where it would be a gimmick rather than an accessibility feature. Where the browser can't speak, the control is hidden rather than shown dead.

**Citations are a registry, not inline strings.** Sources live in `src/content/sources.ts` and are referenced by id. A source can be corrected in one place; funding caveats (the dairy/iodine paper is National Dairy Council-funded) travel with the source and always render.

**"Need a minute?" routes a crisis away from itself before offering anything.** An app that cannot check whether you're well has no business running a wellbeing programme, so this is the narrowest possible version: two exercises, no mood tracking, no course, no streak. The order of the page *is* the design — a breathing exercise is the wrong answer to a crisis, and offering one first would be worse than offering nothing, because it implies the app has understood the problem and thinks this will fix it. So the harder case is named at the top and sent to `/help/mental-health` before anything else appears. A test asserts that ordering. What's deliberately **absent** matters too: there's no 5-4-3-2-1 grounding exercise, useful as it is elsewhere, because the review this page rests on covered breathing, music, muscle relaxation, yoga and mindfulness — and grounding isn't among them. Including it would have meant either an uncited technique on a page whose whole claim is that everything is cited, or attributing it to an NHS page nobody here has read.

**The reduced-motion breathing pacer is a real alternative, not a degraded one.** An expanding circle is the obvious way to pace breathing, and is also exactly the movement that worsens nausea or a migraine for some people — which in this audience is not a rare edge case. That version counts in plain numerals and paces just as well. It's offered from the mood check-in only after someone says they're anxious or low, and only as an offer: putting it on a screen unprompted would be the app deciding how you feel.

**Search survives being asked a question.** It used to be `includes(query)`: "brie" worked, "can I eat brie" returned nothing — and the second is how people type when they're worried. Now stop words are dropped, terms match word stems, and lay words are translated into the words the content uses (*booze* → alcohol, *cat litter* → toxoplasmosis). Terms are then weighted by how rare they are across the library, which is what stops "baby" — a word in almost every entry — from deciding the ranking. Three bugs in this only appeared when real queries were typed into a browser: `less` matching inside *unless*, "can I eat brie" returning 51 entries, and the stemmer reducing *bleed* to *bl* while *bleeding* became *bleed*, so the two forms stopped matching each other. **If a search sounds like a symptom happening now, the urgent route is offered above the results** — a reading list is a bad answer to "bleeding" — and the symptom explorer is searched too, since it sits outside the library and "heartburn" used to return nothing at all.

**Questions live where you'd look for them.** They were being saved into the general journal, mixed with moods and symptoms — so at the appointment, with ten minutes and a midwife waiting, you had to scroll a diary to find them. A saved question you can't retrieve at the moment it matters isn't really saved. They're now a list on Appointments: add, tick off, and ticking moves a question to *already asked* rather than deleting it, because the answer usually matters afterwards too. No count of unasked questions, no badge, no "3 still to ask" — a list of things you didn't manage to raise is not a score, and appointments get cut short for reasons that are nobody's fault.

**"The NHS recommends this" and "one study found this" are not the same claim.** The app showed *which* sources an entry cites; it never showed what kind of thing they are, and both were rendered in identical grey type at the foot of a card. Every entry now carries an evidence label — *UK guidance*, *guidance + research*, *research not guidance*, *charity guidance* — **derived from its sources rather than written per entry**, because 111 hand-written labels would be 111 things to keep in sync and the first to drift would be the one that mattered. The spread across the library: 84 UK guidance, 17 research-only, 5 both, 5 charity. Behind the label, *Why we say this* explains what it means, and funding conflicts are lifted **above** the citation list rather than buried in it. Collapsed by default — someone reading about heartburn at 2am doesn't need a paragraph on evidence tiers, but should be one tap from it. The urgent flow deliberately keeps the plain list; a collapsible evidence-tier control is the last thing a frightened reader needs.

**A citation you can't open is only half a citation.** "Every entry sourced" used to stop at a name — you could see a claim came from somewhere, but not go and check it. Links are now *derived* rather than typed in: every research citation already carries a permanent identifier, so `sourceUrl()` turns a DOI, PMC or PubMed id into a resolver URL, preferring free full text over the paywalled version of record. Nothing is hand-typed, so nothing drifts, and a new paper added with a PMC id becomes checkable with no extra work. The NHS, NICE and charity pages have no such identifier and are deliberately **not** linked yet — a guessed URL looks exactly like a real one right up until someone taps it, and a dead link on a sources page costs more trust than a missing one. The Sources screen says plainly how many of the 122 open and why the rest don't.

**Content is data, not JSX.** Everything lives in typed files under `src/content/`. Adding research means editing data — no component changes.

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · `vite-plugin-pwa` (Workbox) · React Router · Framer Motion · Vitest + Testing Library + axe-core.

No backend. All content ships with the bundle; everything personal (due date, journal, ticks, photos) stays in `localStorage` and IndexedDB on the device and is never transmitted.

Routes are code-split, and Onboarding, Today and **Get Help** load eagerly — the daily entry point and the screen someone might need urgently should never wait on a chunk. First paint is **150kB gzipped of JavaScript** across 20 modules. Two thirds of the remaining weight is the content library itself, which is still pulled in eagerly because Today imports it through a barrel that re-exports all 111 guides; splitting that is the next performance job and is written up in [`docs/audit.md`](docs/audit.md).

Framer Motion is used for exactly one thing — the milestone celebration — and is lazily loaded, because a milestone occurs seven times in a pregnancy and shows once each. The myth card's reveal is a CSS animation for the same reason: it sits on the eagerly-loaded home screen.

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

`validateContent()` runs in dev and in CI. It fails on a dangling citation, a duplicate id, a symptom missing its "when to check" flag, a hand-written source URL that isn't a valid https address, any week between 1 and 42 without baby data, focus items or suggested reading, any of the 52 weeks after birth without the same, and any reading rule pointing at a guide id that no longer exists — so a content typo is a test failure, not a silently broken screen.

**Nothing crashes to a blank page.** An error boundary wraps every route, and its fallback isn't a generic apology — it's the two things that matter when the app itself is broken: call 111, or call 999. Those are plain `tel:` anchors rather than routes, because routing is one of the things that might have failed. Same reasoning behind the bump gallery's IndexedDB handling: a browser that refuses to open a database (a private window, a managed device) gets told so explicitly, because an empty grid reads as *your photos are gone*.

## Accessibility

WCAG 2.1 AA target: semantic landmarks, ≥44px touch targets, `prefers-reduced-motion` honoured throughout (celebrations skip confetti entirely), in-app text-size and high-contrast controls on top of OS scaling, `aria-live` on reveals, and focus moved into the symptom detail panel on selection. **axe-core runs against all twenty-three screens in `npm test`**, including the urgent detail screen. Readability is checked in the same run.

**Focus management belongs to the heading, not to each screen.** It used to be every screen's own job — call the hook, attach the returned ref — and eight of them called it and dropped the ref, so the effect ran and focused nothing. Every one of those files looked correct. `ScreenTitle` now owns it, so there is no ref to forget, and a test asserts focus actually lands on the `<h1>` for the screens that used to be broken.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build + PWA manifest and service worker
npm run preview
npm test           # content integrity, component and accessibility tests (152)
npm run typecheck
npm run lint
npm run readability   # Flesch–Kincaid audit, worst entries first
npm run sources       # citation registry health — links, dates, evidence spread
```

`npm run sources` is the counterpart to the readability audit: it doesn't check whether the content is right, it checks whether the evidence behind it is still in good order. What can be opened, what carries a date, what's oldest, and which entries rest on a single source. It deliberately prints **no stale/fresh verdict** — a year is not the same as freshness, and the oldest source in the registry is a 1999 set of workplace regulations that is exactly as current as the day it was written. Sorting by age and letting a human judge is honest; automating "old = out of date" would be confidently wrong about the first entry it flagged.

## Next

- Continue expanding the evidence base — the content layer is built for it.
- Partner/support-person view.
- Optional cross-device sync, deliberately out of scope while this stays private-by-default.
