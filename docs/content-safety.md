# Content safety: the rule for editing medical copy

**A readability edit must not change what a sentence claims.**

This is the one rule in the project that is not about code, and it is the one
most likely to be broken with good intentions. Everything here is enforceable
in part by `npm run content-diff`; the rest is enforceable only by a person
who knows what they are agreeing to.

---

## The rule

> Medical copy must not be semantically strengthened or weakened during a
> readability or UX edit. If a content edit changes clinical meaning, it stops
> being a wording change and needs a human who is qualified to agree with it.

Two examples, both of which read better than the original and both of which are
different claims:

| Written                  | Rewritten as     | What changed                       |
| ------------------------ | ---------------- | ---------------------------------- |
| "may be associated with" | "causes"         | A correlation became a cause       |
| "this can happen"        | "this is normal" | A possibility became a reassurance |

Neither is a typo, a tidy-up or a plain-English improvement. Each is a new
clinical claim, and neither is supported by the source the entry cites.

## Why this is the rule that needs writing down

Every other pressure in this project pushes the other way. Shorter sentences
score better on readability. Confident copy reads as more helpful. Hedged
language ("may", "some evidence", "in some people") is exactly what a plain
English pass is trained to delete — and it is exactly where the meaning is.

The audience makes the cost asymmetric. Someone anxious at 3am reading "this
is normal" stops looking. Someone reading "this can happen" does not
necessarily stop, and that difference is sometimes the whole point of the
sentence.

## The lines that count as meaning

An edit that crosses any of these is a content change, not a wording change:

1. **Certainty.** Hedged → asserted, or asserted → hedged.
   _may, might, can be, associated with, linked to, some evidence, thought to_
   versus _causes, leads to, always, never, proven, is normal._
2. **Advice strength.** Permissive → directive, or directive → permissive.
   _fine, safe, no need, up to you_ versus _must, should, avoid, don't, call,
   immediately, straight away._
3. **How common something is.** _rare, uncommon, unlikely_ versus _common,
   often, usually, most._
4. **Any number.** Weeks, doses, portions, thresholds, phone numbers, times.
   A changed number is never a style change.
5. **Any negation.** A flipped "not" reverses a sentence while leaving nearly
   all of its words in place — the edit a line diff makes look smallest.

## What is always a wording change

Reordering clauses, splitting a long sentence, replacing a clinical term with
its plain-English equivalent _and keeping the term alongside it_, removing
filler, fixing punctuation, changing "you may wish to" to "you can" **where
the sentence is about a choice rather than a risk**.

## What the tooling does

```
npm run content-diff              # working tree vs HEAD
npm run content-diff -- HEAD~5    # working tree vs an older commit
npm run content-diff -- --strict  # exit 1 if anything needs review
```

It reads both versions of the content **as data, not as text**, matches every
claim by a stable id, and reports each edit as: the claim id, the entry it
belongs to, the text before, the text after, the sources that entry cites, and
which of the five lines above it crossed.

It currently tracks **790 claims** across guides, urgent entries, symptoms,
myths, food rules, help topics, red flags, the glossary, the loss, equity and
after-loss sections, the privacy copy and the calm exercises.

Three things it deliberately does not do:

- **It does not decide whether a change is correct.** It decides whether a
  change is reviewable. Only a clinician can do the first.
- **It does not block CI.** A genuine correction _should_ change meaning, and
  a gate that punishes that teaches people to route around it. It runs on every
  pull request as a report, so the change is visible next to the diff that
  made it.
- **It does not read prose diffs.** Content files reflow, entries get inserted,
  ids get renamed. A line diff cannot tell a rewording from a rewrite; matching
  by id can.

**Every edit to urgent copy is flagged, whatever it says.** The `/help` entries
are the ones someone reads while deciding whether to call, and there is no such
thing as a cosmetic change to them.

## What a reviewer is being asked

Not "does this read well" — the readability report answers that. The question
is narrower and harder:

> Does this sentence still say the same thing to a frightened person as the
> source it cites?

If the answer is no, the edit is wrong even when the new sentence is true,
because the entry claims to be reporting that source.

## What this does not cover

Nothing here checks whether the _original_ wording was right. That is the job
of `npm run clinical-review`, `docs/clinical-review-pack.md` and a real
reviewer — and as of this writing **no qualified clinician has reviewed any of
this content**. See `docs/held-claims.md` for what is currently held back for
want of a verifiable source.
