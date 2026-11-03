# Usability testing plan

**No user testing has happened.** Nothing in this document is a finding. It is
the script for a test that has not been run, plus what was measured in a
browser about the routes each task depends on.

---

## Why this is written before the test rather than after

Everything verified so far has been verified by machine: axe, Playwright, 224
automated tests. All of that answers "does it work". None of it answers the
only question that matters here — **can a frightened person find the right
thing in the time they have.** A script cannot tell you that someone hesitated,
or read the right screen and did not believe it.

## Who to recruit

Six to eight people is enough to find most of what is wrong. Aim for:

- at least **four currently pregnant**, spread across trimesters — the app
  behaves differently at week 8, week 29 and week 39
- at least **two first pregnancies**, since the app assumes no prior knowledge
- at least **one person who has had a loss or a complication**, recruited and
  briefed with care, and given task A only if they choose to take it
- at least **one person using large text, a screen reader, or one-handed**
- a range of confidence with phones — not only people who are good at apps

Deliberately **not** midwives or clinicians. They are the right reviewers for
the content and the wrong testers for the interface: they know what the words
mean already. Clinical review is a separate exercise —
`docs/clinical-review-pack.md`.

## How to run it

- **On their own phone**, in a browser, on the live URL. Not a laptop, not a
  simulator. Half of what this app claims is about being usable one-handed on a
  bad connection.
- **Think aloud.** Ask them to say what they are looking at and what they
  expect to happen.
- **Do not coach.** No pointing, no "have you tried", no reading the screen out
  to them. If they get stuck, stay quiet and let them be stuck — how someone
  recovers is the finding. Only intervene if they are distressed.
- **Do not defend the design.** If they say something is confusing, the answer
  is "thank you", not an explanation.
- One facilitator, one note-taker, or record the screen with permission.
- Each task from a **fresh state** where the task requires it — clear site data
  between participants, or use a private window.
- 45 minutes per person, tasks in a rotated order so fatigue does not always
  land on F.

## Before the tasks

Set up the profile with them (due date only) and then say:

> "This is not a test of you. If something is confusing, that is the app's
> fault and it is exactly what I need to find out. I am going to be quiet and
> let you get on with it — that is not me being unhelpful, it is the point.
> Stop any time you want to."

For task A specifically, add:

> "One of the tasks asks you to imagine being worried about your pregnancy. If
> you would rather skip it, say so at any point and we move on. No explanation
> needed."

---

## What to record for every task

The seven the brief names, one line each, plus timing:

|                                      |                                                       |
| ------------------------------------ | ----------------------------------------------------- |
| **Completed independently**          | yes / no                                              |
| **Wrong route taken**                | where they went first, and what they expected to find |
| **Hesitation**                       | where they paused, and for how long                   |
| **Misunderstanding**                 | anything they read and took to mean something else    |
| **Assistance needed**                | what finally unblocked them, and who provided it      |
| **Could explain the next action**    | ask afterwards: "what would you do now?"              |
| **Unnecessary anxiety or confusion** | anything that worried them that did not need to       |

The sixth is the one people skip and the one that matters most on this app.
Finding the screen is not success. **Success is being able to say what you
would do next**, in your own words, without looking back at it.

---

## The tasks

Each is written as it should be read out. The route below each one was walked
in a browser at week 29 on 28 August 2026 — it says what the app currently
does, not what a participant is expected to do.

### A. "You've noticed something that worries you. Show me what you'd do."

**Shortest route: 2 taps.** Get Help (nav) → the entry that matches → lands on
"Call your maternity unit now — however light the bleeding is."

Deliberately vague: it does not say what is wrong. Whether they reach for Get
Help, the search box, the symptom explorer, or Google is the finding.

Watch for:

- do they use the **Get Help tab at all**, or search the guidance instead
- the urgent entries are titled in the first person — "I'm bleeding", "My baby
  is moving less". Does that read as a list to scan, or as the app telling them
  something
- when they land, do they **understand they should phone now**, and can they
  say who they would phone
- does anything make them **more** frightened than they arrived

### B. "You're 29 weeks pregnant. Show me what's useful to know this week."

**0 taps** — Today opens on it: _"Third trimester. Your baby can dream now —
and this is the week side-sleeping starts to matter."_

The test is not whether they can find it. It is whether the home screen reads
as **this week** rather than as a menu.

Watch for:

- do they treat Today as an answer, or start hunting through the tabs
- can they tell **what is new since last time** from what has always been there
- do they read the "why now" line under each suggestion, or skip it
- **a milestone celebration may appear on first open** at some weeks. Note
  their reaction, particularly if they arrived expecting information

### C. "Find out whether you should count your baby's movements."

**Shortest route: 2 taps.** Get Help → "My baby is moving less, or
differently".

This one is a trap on purpose, and it is the sharpest task in the set. The app
deliberately **has no kick counter** and says there is no target number. The
question presumes counting is a thing you do, because a lot of the internet
says so.

Watch for:

- do they look for a **counter or a timer** first, and where
- when they find "there is no target number of movements and no need to count
  kicks", do they **believe it** — or does it read as the app being unhelpful
- can they state the actual rule afterwards: _a change from your baby's normal
  is the thing, and you phone rather than count_
- the Movement Journal exists and records times, not totals. If they find it,
  do they read it as a counter anyway

### D. "There's something you want to remember to ask your midwife."

**Shortest route: 1 tap** — Appointments.

Watch for:

- do they go to **Appointments** or to **Journal** — both are defensible, and
  which one they pick says which mental model the labels create
- do they find the saved-questions list, and do they understand it is **kept on
  their phone** and not sent anywhere
- would they actually use it, or would they use their phone's notes app

### E. "You feel overwhelmed and want something calming."

**This is the task with the known problem, and it should not be fixed before
the test.**

Measured route: Today does not link to it. Today is 3,207px tall at a 390px
phone; the only route out is "Everything in the app" in the footer at y=2,872 —
**3.4 screens of scrolling** — then "Need a minute?" partway down /explore.
**2 taps and a lot of scrolling.** It is also linked from the Journal.

That placement was a deliberate decision: offer calm where distress is
expressed rather than advertise it on the home screen. It may be right. It may
also mean nobody ever finds it.

Watch for:

- where they look **first** — many will try the Journal, some the tab bar,
  some will give up
- if they never find it, **that is the result**; do not point at it
- if they do find it, does the breathing pacer work without instruction, and do
  they stop when they want to rather than when it ends
- the page routes a crisis away from itself before it offers anything. Do they
  read that, and does it land as care or as a brush-off

### F. "Show me where you'd look to find the evidence behind this advice."

**Shortest route: 3 taps.** Guidance → open an entry → "Why we say this".

The whole premise of the app is that every claim is checkable. This asks
whether that premise is _visible_.

Watch for:

- do they find the **evidence label** on each entry ("UK guidance", "Guidance +
  research"), and do they know what it means without being told
- do they open **"Why we say this"**, or is it invisible to them
- do they notice that some sources are **links and some are plain text** — one
  citation is deliberately unlinked because it cannot be verified, and whether
  anyone spots that is a genuine open question
- do they reach the **Sources** tab, and is it useful or overwhelming at 122
  entries
- ask afterwards: **"who wrote this app?"** The answer should be "one person,
  not a hospital", and the footer says so on every screen

---

## After the tasks

Three questions, asked plainly:

1. **"Would you use this?"** — and then the more useful version: _"would you
   use it at 3am?"_
2. **"Is there anything here you didn't trust?"** Ask it neutrally; people are
   reluctant to say this to the person who built the thing.
3. **"Was there anything that worried you that didn't need to?"**

Then, only if they raise it themselves, ask what they thought the app was for.

## What would count as failing

Set the bar before the test rather than after, or every result becomes a
success:

- **Task A is pass/fail for the product.** If a participant cannot reach an
  urgent entry independently, or reaches it and cannot say they should phone,
  that is not a tweak. The rest of the app does not matter until it is fixed.
- **Task C fails if they leave believing they should count kicks.** Getting to
  the screen is not enough.
- **Task F fails if the evidence is invisible.** An app whose whole claim is
  transparency, where nobody finds the citations, has not delivered it.
- Tasks B, D and E are diagnostic rather than pass/fail — they tell you where
  the navigation model is wrong.

## What must not be done with the results

- **Do not average them.** Six people is a sample for finding problems, not for
  measuring anything. "4 out of 6 completed task C" is not a statistic.
- **Do not describe this as validation.** It is a way of finding what is
  broken, not evidence that the rest is right.
- **Do not fix a route as soon as one person misses it.** Two people missing
  the same thing the same way is a finding; one is a person.
- **Do not change medical copy in response to a usability finding** without
  running `npm run content-diff` and reading `docs/content-safety.md`. "People
  found this confusing" is a good reason to change wording and never a reason
  to change meaning.

## Where to write the results

`docs/usability-findings.md`, which does not exist yet and should not until
there is something to put in it.
