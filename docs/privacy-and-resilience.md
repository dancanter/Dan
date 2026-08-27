# Privacy and resilience audit

27 August 2026. Everything below was **tested in a real browser**, not read off
the code. Where a claim could not be tested, it says so.

---

## What leaves the device

**One external host, on every screen: `fonts.googleapis.com`.**

Measured by recording every outbound request across Today, Guidance, Get help,
Journal, Gallery, Need a minute, Myth or fact and Sources. Nothing else was
contacted — no analytics, no error reporting, no CDN, no third-party script.

The font request carries what any HTTP request carries: IP address, user agent,
and the referring URL. It does **not** carry any pregnancy data, because there
is none in the request and no code anywhere that would put it there.

Everything a person records — journal, mood, questions, movements, photos, due
date, birth date, maternity unit — stays in `localStorage` and `IndexedDB` on
the device. There is no backend, no account and no upload path in the codebase.

**Residual risk:** the font host is a Google service, so loading the app tells
Google that a browser at that IP loaded a page. Removing it would mean
self-hosting the fonts. That is a real option and it is not done yet.

## What is stored, and where

| Key | Holds |
| --- | --- |
| `fieldnotes:profile` | due date, birth date, baby's nickname, first-pregnancy flag |
| `fieldnotes:journal` | notes, questions, mood entries, symptom entries |
| `fieldnotes:movements` | times and kinds of movement — never a count or a total |
| `fieldnotes:progress` | days visited, ticked items, guides read, myths turned over |
| `fieldnotes:status` | active / paused / after-loss |
| `fieldnotes:maternity-unit` | the unit's name and phone number, as typed |
| `fieldnotes:lastSeenWeek` | the week reached at the last visit |
| `fieldnotes:seenIntro` | whether the first-visit card was dismissed |
| `bump:accessibility` | text size, reduced motion, high contrast |
| IndexedDB `fieldnotes-photos` | bump photos as blobs |

## Deletion — a bug, now fixed

**"Delete everything permanently" did not delete everything.**

Tested by seeding every store including a bump photo, clicking the button a
user clicks, and inspecting what remained. Left behind:

- the **bump photo**
- the **movement journal**
- the **maternity unit's phone number**
- the week reached, the intro flag, the app status, accessibility settings

Someone who had just lost a pregnancy and chose to delete everything would
still have had a bump photo on their phone.

The cause was a hard-coded list of three stores; every store added afterwards
was never added to it. `src/lib/wipe.ts` now **enumerates** every key under the
app's prefixes and clears the photo database, so a store added later is covered
without anyone remembering. Re-tested in a browser: nothing survives.

The screen also now names what will go and counts the photos, rather than
promising "everything". The export it offers contains written entries only, so
it says photos are not in it and links to the gallery.

## Failure testing

| Scenario | Result |
| --- | --- |
| Offline cold launch, after one visit | **Works** — Today, Get help, urgent detail and lazily-loaded Guidance all render |
| Font host hanging | **Get help renders in 121ms** (was 12,737ms before the async font fix) |
| Font host unreachable | Works; falls back to system fonts |
| `localStorage` throws on access | **Get help renders** |
| IndexedDB unavailable | Gallery explains it rather than showing an empty grid |
| Lazy route chunk fails mid-session | Error boundary catches it, offers 111 / 999 and a reload |
| **Entry script fails on first load** | **Was a blank page. Now shows a static fallback with 111 and 999.** |
| JavaScript disabled entirely | Same static fallback |
| Corrupt stored state | App still renders |

**The blank page was the real find.** Before this, someone opening the app for
the first time on bad hospital wifi could get a completely white screen with no
route to anything. The error boundary cannot help, because React never runs. So
the fallback is plain HTML inside `#root` — React replaces it on mount — and it
stays hidden for four seconds using a **CSS animation delay rather than a
timer**, because a timer is JavaScript and JavaScript is what has failed.

## What was not tested

- **Real devices.** All of the above is Chromium via Playwright at a phone
  viewport. iOS Safari behaves differently around IndexedDB in private mode and
  around `tel:` links, and has not been checked.
- **A real slow network**, as opposed to blocked requests. Throttled-but-alive
  connections may behave differently from aborted ones.
- **The installed PWA** rather than the browser tab.
- **Service worker update behaviour** across versions — `skipWaiting` and
  `clientsClaim` are set, but an actual version-to-version upgrade on a device
  with an old worker has not been exercised.
