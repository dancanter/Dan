// Checks every DOI in src/data/sources.ts against Crossref: the DOI must
// resolve, and its registered title and year must match what the app says.
// Run with `npm run verify-sources`. Needs network access.
import { SOURCES } from '../src/data/sources.ts';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function similarity(a: string, b: string): number {
  const A = new Set(norm(a).split(' ').filter((w) => w.length > 3));
  const B = new Set(norm(b).split(' ').filter((w) => w.length > 3));
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const w of A) if (B.has(w)) hit++;
  return hit / Math.min(A.size, B.size);
}

let failures = 0;
const withDoi = SOURCES.filter((s) => s.doi);
for (const s of withDoi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(s.doi!)}`, {
      headers: { 'User-Agent': 'the-good-life/verify-sources (personal project)' },
    });
    if (!res.ok) {
      failures++;
      console.log(`✗ ${s.id}: HTTP ${res.status} for ${s.doi}`);
      continue;
    }
    const msg = ((await res.json()) as { message: { title?: string[]; issued?: { 'date-parts'?: number[][] }; published?: { 'date-parts'?: number[][] } } }).message;
    const title = msg.title?.[0] ?? '';
    const parts = msg.issued?.['date-parts']?.[0] ?? msg.published?.['date-parts']?.[0] ?? [];
    const year: number | undefined = parts[0];
    const sim = similarity(s.title, title);
    const yearOk = year == null || Math.abs(year - s.year) <= 1;
    if (sim < 0.6 || !yearOk) {
      failures++;
      console.log(`✗ ${s.id}: mismatch (title similarity ${sim.toFixed(2)}, Crossref year ${year})\n   ours:     ${s.title}\n   crossref: ${title}`);
    } else {
      console.log(`✓ ${s.id}`);
    }
  } catch (e) {
    failures++;
    console.log(`✗ ${s.id}: ${(e as Error).message}`);
  }
}
console.log(`\n${withDoi.length - failures}/${withDoi.length} DOIs verified.`);
process.exit(failures ? 1 : 0);
