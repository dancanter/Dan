import { sources, sourceUrl, sourceYear, evidenceFor, guides, sourceById } from '../src/content';

/**
 * A maintenance report on the citation registry, run with `npm run sources`.
 *
 * The counterpart to `npm run readability`: it does not check whether the
 * content is right, it checks whether the *evidence behind it* is still in
 * good order — what can be opened, what carries a date, what is oldest, and
 * which entries rest on a single source.
 *
 * It deliberately does not print a stale/fresh verdict. A year is not the same
 * as freshness: the oldest source in the registry is the 1999 Management of
 * Health and Safety at Work Regulations, which is legislation and exactly as
 * current as it was the day it was written. Sorting by age and letting a human
 * judge is honest; automating "old = out of date" would be confidently wrong
 * about the very entry it flagged first.
 */

const pct = (n: number) => `${Math.round((n / sources.length) * 100)}%`;

const openable = sources.filter((s) => sourceUrl(s));
const dated = sources.filter((s) => sourceYear(s) !== undefined);
const caveated = sources.filter((s) => s.caveat);

console.log(`\nSOURCES — ${sources.length} in the registry\n`);
console.log(`  openable        ${String(openable.length).padStart(3)}  ${pct(openable.length)}`);
console.log(`  carry a date    ${String(dated.length).padStart(3)}  ${pct(dated.length)}`);
console.log(`  have a caveat   ${String(caveated.length).padStart(3)}  ${pct(caveated.length)}`);

console.log('\nBY TIER');
for (const tier of ['gov', 'nhs', 'college', 'charity', 'research'] as const) {
  const inTier = sources.filter((s) => s.tier === tier);
  const linked = inTier.filter((s) => sourceUrl(s)).length;
  console.log(
    `  ${tier.padEnd(9)} ${String(inTier.length).padStart(3)}   ${String(linked).padStart(3)} openable`,
  );
}

console.log('\nOLDEST DATED SOURCES — check these first, judging each on its own terms');
[...dated]
  .sort((a, b) => sourceYear(a)! - sourceYear(b)!)
  .slice(0, 10)
  .forEach((s) => {
    console.log(`  ${sourceYear(s)}  ${s.id.padEnd(28)} ${s.organisation.slice(0, 46)}`);
  });

console.log('\nNO DATE IN THE CITATION');
const undatedIds = sources.filter((s) => sourceYear(s) === undefined).map((s) => s.id);
console.log(`  ${undatedIds.length} sources. Mostly standing pages that publish no date in-line.`);
console.log(`  ${undatedIds.slice(0, 12).join(', ')}${undatedIds.length > 12 ? ', …' : ''}`);

console.log('\nEVIDENCE SPREAD ACROSS THE GUIDANCE');
const spread = new Map<string, number>();
for (const g of guides) {
  const resolved = g.sourceIds.map((id) => sourceById.get(id)).filter((s) => s !== undefined);
  const label = evidenceFor(resolved)?.label ?? '(none)';
  spread.set(label, (spread.get(label) ?? 0) + 1);
}
[...spread.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([label, n]) => console.log(`  ${String(n).padStart(3)}  ${label}`));

console.log('\nENTRIES RESTING ON A SINGLE SOURCE');
const single = guides.filter((g) => g.sourceIds.length === 1);
console.log(`  ${single.length} of ${guides.length}. Not wrong, but the least corroborated.`);
single.slice(0, 10).forEach((g) => console.log(`  ${g.id.padEnd(30)} ${g.sourceIds[0]}`));

console.log('');
