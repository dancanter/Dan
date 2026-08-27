# Held claims

Content that was removed from the app because it could not be verified, kept
here so it can be restored if the missing evidence turns up.

Removing a claim is a deliberate weakening of medical copy, which is normally
exactly what shouldn't happen silently — so each one is recorded with what was
removed, why, and precisely what would be needed to put it back.

---

## `anderson-2026-dairy` — full-fat dairy RCT

**Held:** 27 August 2026
**Affected content:** `dairy-fat-level` (Guidance → Nutrition, "Full-fat or lower-fat dairy?")

### What the citation claimed

> Full-fat dairy and cardiometabolic risk factors — 12-week randomised controlled
> trial. Anderson GH, et al. University of Toronto, 2026.

### What the app said on the strength of it

Two paragraphs, now removed:

- That the best evidence on dairy fat level is a randomised trial from the
  University of Toronto published in 2026, in which women ate three servings of
  full-fat dairy a day for 12 weeks.
- That the trial found no adverse effect on weight, body shape or cholesterol;
  that blood pressure improved; and that calcium, protein and vitamin D intake
  rose.
- That because participants were randomised, it avoids the confounding that
  limits the observational dairy literature.

### Why it was held

No formal reference was ever supplied — no DOI, no journal, no PMID. Repeated
requests for one went unanswered, and this environment has no outbound network
access, so it could not be looked up either.

That leaves three options: invent a plausible reference, keep an unverifiable
one, or remove the claim. The first is fabrication. The second is worse than it
looks: the trial was doing real work in that entry, carrying specific numerical
findings about blood pressure and cholesterol on nothing but a name and a year.

### What the entry says now

The entry keeps only what is independently sourced: that UK guidance favours
lower-fat dairy, that the **dairy matrix** is an open question discussed in the
literature (Thorning 2017, itself flagged as a narrative review in a
frequently industry-funded field), that it has not been tested in pregnancy,
and that calcium, iodine and protein are identical regardless of fat level.

It now says explicitly that this is **not a reason to go against UK guidance**,
which the previous version arguably implied.

### To restore it

Supply a DOI, PMID or PMC id. `sourceUrl()` will resolve it automatically, and
the removed paragraphs are quoted above verbatim. If the trial turns out to be
real but not in pregnancy — which is what the original text said — the honest
version keeps the "not tested in pregnancy" caveat prominent rather than
leading with the findings.
