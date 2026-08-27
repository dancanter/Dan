import { writeFileSync } from 'node:fs';
import {
  guides,
  guidesInSection,
  sourceById,
  sourceUrl,
  sourceYear,
  evidenceFor,
  urgentSymptoms,
  symptoms,
  lossSections,
  afterLossSections,
  equitySections,
  calmExercises,
  URGENT_DISCLAIMER,
  type Source,
} from '../src/content';

/**
 * `npm run clinical-review` — a pack a UK clinician can actually work through.
 *
 * Written for someone with an hour and no interest in the codebase. It is
 * ordered by clinical consequence rather than by how the app is structured,
 * every claim carries its evidence inline so nothing has to be looked up
 * elsewhere, and it states plainly at the top that nothing here has been
 * reviewed yet.
 *
 * That last part is the point of the whole file. The app must never claim to
 * be clinically reviewed, and producing a review pack is not the same thing as
 * having had a review — so the document says so in its own first paragraph
 * rather than leaving it to be inferred.
 */

/**
 * `--urgent` writes only the 13 urgent pathways.
 *
 * The full pack runs to well over two thousand lines, which is the right size
 * for a thorough review and the wrong size for getting one started. Most
 * clinicians will give this an hour, and the hour is best spent on the content
 * someone frightened acts on — so that subset is available as its own short
 * document rather than buried at the top of a long one.
 */
const URGENT_ONLY = process.argv.includes('--urgent');
const OUT = URGENT_ONLY ? 'docs/clinical-review-urgent.md' : 'docs/clinical-review-pack.md';

function sourceLine(s: Source): string {
  const bits = [`**${s.label}** — ${s.organisation}`];
  bits.push(`tier: ${s.tier}`);
  const year = sourceYear(s);
  bits.push(year ? `date: ${year}` : 'date: *none stated*');
  bits.push(s.reviewed ? `reviewed: ${s.reviewed}` : 'reviewed: *not recorded*');
  const url = sourceUrl(s);
  bits.push(url ? `link: ${url}` : 'link: *none — needs manual verification*');
  let out = `  - ${bits.join(' · ')}`;
  if (s.caveat) out += `\n    - ⚠ **Declared conflict / caveat:** ${s.caveat}`;
  return out;
}

function block(id: string, claim: string, body: string[], sourceIds: string[]): string {
  const resolved = sourceIds.map((i) => sourceById.get(i)).filter((s) => s !== undefined);
  const evidence = evidenceFor(resolved);
  const lines: string[] = [];
  lines.push(`### \`${id}\` — ${claim}\n`);
  lines.push(`**Evidence type:** ${evidence?.label ?? '*none resolved*'}`);
  if (resolved.length === 1) lines.push('**⚠ Single source.**');
  lines.push('');
  lines.push('**Text as shown to the reader:**\n');
  body.filter(Boolean).forEach((p) => lines.push(`> ${p.replace(/\n/g, ' ')}\n`));
  lines.push('**Sources:**\n');
  resolved.forEach((s) => lines.push(sourceLine(s)));
  lines.push('');
  lines.push('**Reviewer:** ☐ accurate  ☐ needs change  ☐ remove — notes:');
  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

const out: string[] = [];

out.push('# Field Notes — clinical review pack\n');
out.push(`Generated ${new Date().toISOString().slice(0, 10)} from the shipped content.\n`);
out.push(
  '> **Nothing in this document has been clinically reviewed.** This pack exists so that a\n' +
    '> qualified UK clinician or registered midwife *can* review it. Until someone has, the app\n' +
    '> says it is not clinically reviewed, and that statement must not be removed on the strength\n' +
    '> of this file existing.\n',
);
out.push(
  'Ordered by clinical consequence, not by how the app is built. Every claim carries its\n' +
    'evidence inline, so nothing needs looking up elsewhere.\n',
);
out.push(`**Standing disclaimer shown on every urgent screen:** ${URGENT_DISCLAIMER}\n`);
out.push('---\n');

// ── 1. The urgent pathways ───────────────────────────────────────────
out.push('## 1. Urgent pathways\n');
out.push(
  `The highest-consequence content in the app: ${urgentSymptoms.length} entries, each reached\n` +
    'from a permanently visible Get help tab. Every one follows the same order — what to do now,\n' +
    'then why it matters, then reassurance only where it is true. Please check the **action line**\n' +
    'first; it is what someone frightened will read and act on.\n',
);
for (const u of urgentSymptoms) {
  const resolved = u.sourceIds.map((i) => sourceById.get(i)).filter((s) => s !== undefined);
  const evidence = evidenceFor(resolved);
  out.push(`### \`${u.id}\` — ${u.title}\n`);
  out.push(`**Routes to:** ${u.action}  ·  **Evidence type:** ${evidence?.label ?? '—'}\n`);
  out.push(`**ACTION LINE (shown first, largest):**\n`);
  out.push(`> ${u.now}\n`);
  if (u.dont?.length) {
    out.push('**Explicit "do not" items:**\n');
    u.dont.forEach((d) => out.push(`> - ${d}`));
    out.push('');
  }
  out.push('**Why it matters (shown after the action):**\n');
  out.push(`> ${u.why}\n`);
  if (u.reassurance) {
    out.push('**Reassurance (shown last, only where true):**\n');
    out.push(`> ${u.reassurance}\n`);
  }
  out.push('**Sources:**\n');
  resolved.forEach((s) => out.push(sourceLine(s)));
  out.push('');
  out.push('**Reviewer:** ☐ action correct  ☐ threshold correct  ☐ tone correct  ☐ needs change');
  out.push('');
  out.push('---');
  out.push('');
}

// Everything past the urgent pathways is skipped in the short pack.
if (!URGENT_ONLY) {
  // ── 2..n: the clinical areas the brief named ─────────────────────────
  const AREAS: { heading: string; note: string; sections: string[] }[] = [
    {
      heading: '2. Fetal movement',
      note: 'The app deliberately does **not** count kicks and states there is no target number. Please confirm that stance and the escalation threshold.',
      sections: ['movement'],
    },
    {
      heading: '3. Medications',
      note: 'Including the MHRA paracetamol position and what the app tells people to avoid.',
      sections: ['medications'],
    },
    {
      heading: '4. Vaccination',
      note: '',
      sections: ['vaccinations'],
    },
    {
      heading: '5. Labour and birth',
      note: 'Particularly the "when to call" thresholds.',
      sections: ['labour', 'birth-place', 'pain-relief', 'birth-prep'],
    },
    {
      heading: '6. Postnatal warning signs',
      note: 'Including postnatal bleeding thresholds and the 999 line.',
      sections: ['first-days', 'recovery', 'postnatal-mind', 'postnatal-support'],
    },
    {
      heading: '7. Feeding',
      note: 'Written to be calibrated rather than promotional. Please check that balance.',
      sections: ['feeding-basics', 'breastfeeding', 'bottle-feeding'],
    },
    {
      heading: '8. Mental health',
      note: 'Including the perinatal mental-health escalation routes.',
      sections: ['wellbeing'],
    },
    {
      heading: '9. Existing conditions, including pre-eclampsia and blood pressure',
      note: '',
      sections: ['health-conditions'],
    },
  ];

  for (const area of AREAS) {
    out.push(`## ${area.heading}\n`);
    if (area.note) out.push(`${area.note}\n`);
    const entries = area.sections.flatMap((s) => guidesInSection(s as never));
    if (entries.length === 0) out.push('*No entries in this area.*\n');
    entries.forEach((g) => out.push(block(g.id, g.title, [g.summary, ...g.body], g.sourceIds)));
  }

  // ── Loss, inequalities, calm ─────────────────────────────────────────
  out.push('## 10. Pregnancy and baby loss\n');
  out.push(
    'Its own route, never surfaced on a daily screen. **This section needs specialist review\n' +
      '(Sands or the Miscarriage Association) as well as clinical review** — the risk here is tone\n' +
      'and assumption as much as accuracy.\n',
  );
  lossSections.forEach((s) => out.push(block(s.id, s.title, s.body, s.sourceIds)));

  out.push('## 11. After loss — the support-mode home screen\n');
  afterLossSections.forEach((s) => out.push(block(s.id, s.title, s.body, s.sourceIds)));

  out.push('## 12. Inequalities in maternity care\n');
  out.push(
    'MBRRACE-UK figures paired with actions. Please check the figures are current and stated\n' +
      'with the right uncertainty — the published ratios move between annual reports.\n',
  );
  equitySections.forEach((s) => out.push(block(s.id, s.title, s.body, s.sourceIds)));

  out.push('## 13. Relaxation content\n');
  out.push(
    'Offered only from a mood check-in, and the page routes a crisis away from itself before\n' +
      'offering anything. Please check that escalation is worded correctly.\n',
  );
  calmExercises.forEach((c) =>
    out.push(block(c.id, c.title, [c.blurb, ...(c.steps ?? [])], c.sourceIds)),
  );

  // ── Symptom explorer, lower consequence but high volume ──────────────
  out.push('## 14. Symptom explorer\n');
  out.push(
    'Lower consequence individually, but every entry carries a "when this stops being routine"\n' +
      'flag, and those flags are the part worth checking.\n',
  );
  symptoms.forEach((s) =>
    out.push(
      block(s.id, s.name, [`Why: ${s.why}`, `Helps: ${s.help}`, `FLAG: ${s.flag}`], s.sourceIds),
    ),
  );

  // ── Closing summary ──────────────────────────────────────────────────
} // end !URGENT_ONLY

// Only what this particular document actually contains — the short pack said
// "93 of the entries above" when it holds thirteen, none of them single-source.
const reviewed = URGENT_ONLY
  ? [...urgentSymptoms]
  : [
      ...urgentSymptoms,
      ...guides,
      ...symptoms,
      ...lossSections,
      ...afterLossSections,
      ...equitySections,
    ];
// Computed outside the block: the short pack needs these figures too, and it
// is the same registry either way.
const singleSource = reviewed.filter((e) => e.sourceIds.length === 1).length;
const unlinked = [...sourceById.values()].filter((s) => !sourceUrl(s)).length;

out.push('## What the reviewer should know about the evidence itself\n');
out.push(
  singleSource === 0
    ? `- None of the ${reviewed.length} entries above rests on a single source.`
    : `- **${singleSource}** of the ${reviewed.length} entries above rest on a single source.`,
);
out.push(
  `- **${unlinked}** of ${sourceById.size} sources have no link a reader can open, and have not been machine-verified. Every one needs a human to confirm it says what the app claims.`,
);
out.push('- Sources marked ⚠ carry a declared funding conflict or a "background only" note.');
out.push(
  '- One claim has already been **held** rather than shipped unverified — see `docs/held-claims.md`.',
);
out.push('');
out.push(
  '**Please do not treat a completed pass over this document as sign-off** unless you are a\n' +
    'qualified UK clinician or registered midwife and are content to be named as the reviewer.\n',
);

writeFileSync(OUT, out.join('\n'));
console.log(`Wrote ${OUT}`);
console.log(`  urgent pathways   ${urgentSymptoms.length}`);
console.log(`  guides            ${guides.length}`);
console.log(`  symptoms          ${symptoms.length}`);
console.log(`  single-source     ${singleSource}`);
console.log(`  unlinked sources  ${unlinked}`);
