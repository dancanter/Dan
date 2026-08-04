export interface MethodologySection {
  id: string;
  title: string;
  body: string[];
}

/**
 * This is the one page in the app that's about the *process* rather than
 * a citable claim — so it deliberately doesn't carry sourceIds or go
 * through validateContent(). It should stay true regardless of how much
 * content gets added later; if a claim here stops being true, that's a
 * signal to rewrite the section, not just add more sources elsewhere.
 */
export const methodologySections: MethodologySection[] = [
  {
    id: 'why',
    title: 'Why this page exists',
    body: [
      "Every recommendation in Field Notes traces back to a named source, visible on the entry itself and listed in full on the Sources screen. That's a claim worth being able to check — so this page explains the process behind it: how sources are chosen, how conflicts of interest are handled, and where the real limits of this project are.",
    ],
  },
  {
    id: 'hierarchy',
    title: 'The evidence hierarchy',
    body: [
      'Sources are tiered, and the tiering does real work — it decides which source wins when two disagree, and it decides tone. **UK government evidence reviews (SACN, NICE)** sit at the top: population-level analyses commissioned specifically to set policy. **NHS guidance** translates that into patient-facing advice and is the default for anything clinical. **Royal college guidelines** (RCOG) fill in specialist detail NHS pages don’t cover. **Charities** (NCT, Tommy’s) are used for "what’s happening in your body" and emotional-support content — appropriate for that register, not treated as clinical authority. **Individual peer-reviewed studies** sit below all of those: useful for filling gaps the top tiers haven’t addressed yet, but never used to override NHS or NICE guidance where the two overlap.',
      'If a peer-reviewed finding and NHS guidance ever point in different directions, NHS guidance wins in the app copy, and that’s a deliberate editorial choice, not an oversight.',
    ],
  },
  {
    id: 'conflicts',
    title: 'Conflicts of interest are flagged, not hidden',
    body: [
      'Some of the best available evidence comes from industry-funded research, and excluding it entirely would mean losing genuinely useful, methodologically sound findings. The approach here instead: use the numbers, flag the funder, and read the framing with appropriate caution.',
      'Worked example: the dairy-and-iodine research cited in Healthy Pregnancy is funded by the National Dairy Council, and its authors work for a firm that provides paid services to Dairy Management Inc. The core statistic — the odds ratio for iodine deficiency — has zero heterogeneity across the 11 pooled studies and is rated moderate certainty, so it’s treated as trustworthy. The paper’s *discussion* section leans favourably toward dairy in ways the raw numbers don’t fully support, so that framing isn’t repeated. This exact caveat is attached to the source itself, not buried in a footnote — you’ll see it wherever that source is cited.',
    ],
  },
  {
    id: 'uncertainty',
    title: 'Uncertainty is stated, not smoothed over',
    body: [
      'Two different situations get described differently on purpose. "The evidence doesn’t support one number working for everyone" (UK weight-gain guidance) is not the same claim as "the evidence says don’t do this" (drinking alcohol, sleeping on your back after 28 weeks) — and the app never collapses that distinction for the sake of a tidier sentence.',
      'Where a research area is described as "still developing" — the sunlight-and-vitamin-D research is the clearest example — that phrase is doing real work: it means the settled clinical advice (take the supplement) stands regardless of how the newer research turns out.',
    ],
  },
  {
    id: 'omissions',
    title: 'What’s deliberately left out',
    body: [
      'A pregnancy app is expected to have a kick counter. This one doesn’t, on purpose: NHS and RCOG guidance is explicit that there’s no target number to count toward and that counting isn’t recommended, so building one would contradict the app’s own sourcing. The myth deck says this directly, alongside the same reasoning for why a home doppler isn’t a substitute for getting checked.',
      'Where the evidence genuinely doesn’t support an intervention — a fixed weight-gain target, for instance — the app says so rather than inventing a number for the sake of having something to display.',
    ],
  },
  {
    id: 'architecture',
    title: 'How this is checked, structurally',
    body: [
      'Content lives as typed data, not hardcoded page text, and every entry is required to carry at least one source id that resolves to a real entry in the source registry. An automated check runs on every change and fails the build if a citation is missing, a source id doesn’t exist, an id is duplicated, or a symptom entry has no "when to check" guidance — so a broken reference is a build failure, not a silent gap a reader might not notice.',
    ],
  },
  {
    id: 'limits',
    title: 'The honest limits of this project',
    body: [
      'This is a personal, evidence-led project — **not clinically reviewed**, not affiliated with or endorsed by the NHS, and not a substitute for medical advice. Sourcing is currently curated by one person rather than a review board, guidance is written for a UK audience and may not transfer elsewhere, and "peer-reviewed" describes the individual studies cited, not this app’s summaries of them.',
      'If you spot something that looks wrong or out of date, that’s useful information, not an inconvenience — the whole point of naming every source is so it can be checked.',
    ],
  },
];
