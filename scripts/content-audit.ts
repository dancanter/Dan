import {
  guides,
  sources,
  sourceById,
  sourceUrl,
  sourceYear,
  evidenceFor,
  urgentSymptoms,
  symptoms,
  myths,
  lossSections,
  equitySections,
  afterLossSections,
  calmExercises,
  validateContent,
  focusForWeek,
  MIN_WEEK,
  MAX_WEEK,
} from '../src/content';

/**
 * `npm run content-audit` — what still needs a human.
 *
 * The sources report answers "is the registry tidy". This answers the harder
 * question: which specific claims are resting on the least, and therefore
 * which ones a clinician should look at first if they only have an hour.
 *
 * It deliberately produces a *ranked worklist*, not a pass/fail. Nothing here
 * is broken — every entry is sourced and validates. The point is that "sourced"
 * covers a wide range, from four royal-college citations to a single narrative
 * review, and only the first kind should feel settled.
 */

const line = (n = 66) => console.log('─'.repeat(n));

/** Higher is more worth a human's time. */
function riskScore(sourceIds: string[], opts: { urgent?: boolean; warn?: boolean }): number {
  const resolved = sourceIds.map((id) => sourceById.get(id)).filter((s) => s !== undefined);
  const evidence = evidenceFor(resolved);
  let score = 0;

  // Fewer sources = less corroboration.
  if (resolved.length === 1) score += 3;
  else if (resolved.length === 2) score += 1;

  // Not official UK guidance.
  if (evidence?.strength === 'research-only') score += 3;
  if (evidence?.strength === 'charity') score += 2;

  // Carries a funding conflict or "background only" note.
  score += resolved.filter((s) => s.caveat).length * 2;

  // No date anywhere in the citation.
  if (resolved.every((s) => sourceYear(s) === undefined)) score += 1;

  // Nothing to open and check.
  if (resolved.every((s) => !sourceUrl(s))) score += 1;

  // Consequence of being wrong.
  if (opts.urgent) score += 4;
  if (opts.warn) score += 2;

  return score;
}

// ── Integrity first: nothing below means anything if this fails ──────
const issues = validateContent();
console.log(`\nCONTENT AUDIT — ${new Date().toISOString().slice(0, 10)}\n`);
line();
console.log(`validateContent(): ${issues.length === 0 ? 'clean' : `${issues.length} ISSUE(S)`}`);
issues.forEach((i) => console.log(`  ! ${i.kind}  ${i.detail}`));

// ── What can and cannot be checked by a reader ───────────────────────
const openable = sources.filter((s) => sourceUrl(s));
const dated = sources.filter((s) => sourceYear(s) !== undefined);
const reviewed = sources.filter((s) => s.reviewed);

line();
console.log('\nWHAT A READER CAN ACTUALLY CHECK');
console.log(`  sources                 ${sources.length}`);
console.log(`  openable                ${openable.length}  (${pct(openable.length)})`);
console.log(`  state a date            ${dated.length}  (${pct(dated.length)})`);
console.log(`  state a review date     ${reviewed.length}  (${pct(reviewed.length)})`);
console.log(`  UNVERIFIED, NO LINK     ${sources.length - openable.length}  <- needs a human`);

function pct(n: number) {
  return `${Math.round((n / sources.length) * 100)}%`;
}

// ── The ranked worklist ──────────────────────────────────────────────
interface Row {
  kind: string;
  id: string;
  score: number;
  detail: string;
}

const rows: Row[] = [];

for (const u of urgentSymptoms) {
  rows.push({
    kind: 'urgent',
    id: u.id,
    score: riskScore(u.sourceIds, { urgent: true }),
    detail: u.title,
  });
}
for (const g of guides) {
  rows.push({
    kind: 'guide',
    id: g.id,
    score: riskScore(g.sourceIds, { warn: g.emphasis === 'warn' }),
    detail: g.title,
  });
}
for (const s of symptoms) {
  rows.push({ kind: 'symptom', id: s.id, score: riskScore(s.sourceIds, {}), detail: s.name });
}
for (const m of myths) {
  rows.push({ kind: 'myth', id: m.id, score: riskScore(m.sourceIds, {}), detail: m.claim });
}
for (const s of lossSections) {
  rows.push({
    kind: 'loss',
    id: s.id,
    score: riskScore(s.sourceIds, { warn: true }),
    detail: s.title,
  });
}
for (const s of afterLossSections) {
  rows.push({
    kind: 'afterLoss',
    id: s.id,
    score: riskScore(s.sourceIds, { warn: true }),
    detail: s.title,
  });
}
for (const s of equitySections) {
  rows.push({ kind: 'equity', id: s.id, score: riskScore(s.sourceIds, {}), detail: s.title });
}
for (const c of calmExercises) {
  rows.push({ kind: 'calm', id: c.id, score: riskScore(c.sourceIds, {}), detail: c.title });
}

rows.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

line();
console.log('\nREVIEW WORKLIST — highest first');
console.log('Score combines: few sources, not UK guidance, funding caveats,');
console.log('no date, nothing openable, and the consequence of being wrong.\n');
console.log('  score  kind        id                             claim');
rows.slice(0, 25).forEach((r) => {
  console.log(
    `  ${String(r.score).padStart(5)}  ${r.kind.padEnd(10)}  ${r.id.slice(0, 28).padEnd(28)}  ${r.detail.slice(0, 40)}`,
  );
});

// ── Single-source entries, which the brief asked for by name ─────────
// Guides, symptoms and myths — the browsable library. Urgent entries are
// listed separately in the worklist above, where consequence dominates.
const single = [...guides, ...symptoms, ...myths].filter((e) => e.sourceIds.length === 1);
const singleRanked = single
  .map((e) => ({
    id: e.id,
    src: e.sourceIds[0],
    score: riskScore(e.sourceIds, { warn: 'emphasis' in e && e.emphasis === 'warn' }),
  }))
  .sort((a, b) => b.score - a.score);

line();
console.log(`\nSINGLE-SOURCE ENTRIES — ${single.length}`);
console.log('Not wrong. Least corroborated, so the first place a reviewer should look.\n');
singleRanked
  .slice(0, 15)
  .forEach((e) => console.log(`  ${String(e.score).padStart(5)}  ${e.id.padEnd(30)} ${e.src}`));

// ── Sources carrying a declared conflict ─────────────────────────────
line();
const caveated = sources.filter((s) => s.caveat);
// Every content type, not just guides — an earlier version of this counted
// only three of them and reported the MBRRACE citation as unused, which it
// very much is not.
const allCited = [
  ...guides,
  ...myths,
  ...symptoms,
  ...urgentSymptoms,
  ...lossSections,
  ...afterLossSections,
  ...equitySections,
  ...calmExercises,
  // Weekly focus items cite sources too — leaving them out reported the
  // NHS week-by-week page as orphaned when it backs the whole focus list.
  ...Array.from({ length: MAX_WEEK - MIN_WEEK + 1 }, (_, i) => focusForWeek(MIN_WEEK + i)).flat(),
];
console.log(`\nSOURCES WITH A DECLARED CAVEAT — ${caveated.length}`);
caveated.forEach((s) => {
  const users = allCited.filter((e) => e.sourceIds.includes(s.id));
  console.log(
    `  ${s.id.padEnd(26)} used by ${users.length}: ${users
      .map((u) => u.id)
      .join(', ')
      .slice(0, 60)}`,
  );
});

line();
const orphans = sources.filter((s) => !allCited.some((e) => e.sourceIds.includes(s.id)));
console.log(`\nSOURCES CITED BY NOTHING — ${orphans.length}`);
if (orphans.length) {
  console.log('  Either dead weight, or content that lost its citation.\n');
  orphans.forEach((s) => console.log(`  ${s.id.padEnd(28)} ${s.organisation.slice(0, 44)}`));
}

line();
console.log('\nNOTHING HERE IS A FAILURE. It is a worklist, ordered by where a');
console.log('qualified reviewer would get the most value from an hour.\n');
