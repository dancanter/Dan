# Held claims

Content whose evidence could not be verified, recorded here with what is
missing and exactly what would settle it.

Weakening or removing medical copy is normally the thing that must never
happen quietly, so each case is written down: what the claim is, what state
its citation is in, and what would be needed to put it beyond doubt.

---

## `anderson-2026-dairy` — full-fat dairy RCT

**Status: RESTORED and flagged in the app, 28 August 2026.**
Previously removed on 27 August; that was reversed on the author's instruction.

**Affected content:** `dairy-fat-level` (Guidance → Nutrition, "Full-fat or
lower-fat dairy?")

### The citation, exactly as supplied

> Full-fat dairy and cardiometabolic risk factors — 12-week randomised
> controlled trial. Anderson GH, et al. University of Toronto, 2026.

No DOI, no journal, no PMID, no PMC id. This environment has no outbound
network access, so it could not be looked up here either.

### What was done, and why

There were three options and only two of them are honest.

1. **Invent a plausible reference** so it resolves and looks checkable.
   Fabrication. Never an option.
2. **Remove the claim.** This is what was done first, following the brief's
   instruction to remove or hold anything unverifiable. It is safe, and it is
   also lossy: it silently deletes something that may well be true, and the
   reader never learns the question was ever asked.
3. **Keep the claim and tell the reader precisely what is wrong with it.**
   This is what the entry does now.

Option 3 is only honest if the flag is as prominent as the claim. So:

- The source carries a caveat that renders wherever it is cited: _"We have not
  been able to verify this reference… unlike every other source here you cannot
  open it and check."_
- The entry says the same thing in its own body copy, in bold, in the paragraph
  immediately after the findings — not in a footnote.
- It keeps the two caveats that were true of the trial as described anyway:
  **it was not a study in pregnancy**, and **it is not a reason to go against UK
  guidance**, which is checkable.
- `sourceUrl()` returns nothing for it, so it renders as plain text while every
  other citation on the screen is a link. The difference is visible.

### The argument for keeping it visible

An unverified source that is _labelled_ unverified is not the same failure as an
unverified source that is presented as evidence. The first tells the reader
something useful about the state of the evidence; the second is the thing this
app exists not to do. The entry now leads with the UK guidance, reports the
trial as reported, and says plainly that it cannot be checked.

The alternative — deletion — has its own cost, and it is not obviously smaller:
the claim disappears with no trace, and nobody reading the app can tell that a
question was raised and dropped.

### To settle it

Supply a DOI, PMID or PMC id. `sourceUrl()` resolves any of them automatically,
the caveat comes off, and the entry can drop its "cannot be verified"
paragraph. Until then it stays flagged, and a clinical reviewer should be
pointed straight at it — `npm run content-audit` ranks it near the top for
exactly this reason.

If the trial turns out to be real but not in pregnancy, which is what the
original text said, the honest version keeps the "not tested in pregnancy"
caveat prominent rather than leading with the findings. That is already how the
entry is written.
