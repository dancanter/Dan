// One source of truth (Dan, 12 Nov): fails if a target number is typed anywhere but the plan.
// Targets live in PLANV / CFG / STRICT (index.html) and glow/src/plan.ts; every sentence says them through the
// p…() helpers. A line that must keep a literal (history, an evidence figure, a threshold being defined) carries
// "plan-ok: why". Run: node planlint.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const here = (p) => new URL(p, import.meta.url).pathname;
const RULES = [
  ['calories', /\b[12],[1-9]99\b/],
  ['steps', /\b\d{1,2}(?:[–-]\d{1,2})?k\b|\b(?:[89]|1[0-5]),\d{3}\b[^'"`<]{0,25}\bsteps?\b|\bsteps?\b[^'"`<]{0,40}\b(?:[89]|1[0-5]),\d{3}\b|\b80,000\b/i, /steps?|walk/i],
  ['weight goal', /\b12[2-4](?:\.5)?[–-]12[2-5]\b|\b122\.5\b/],
  ['protein', /\b1[2-5]\d g\b[^'"`<]{0,20}protein|protein[^'"`<]{0,30}\b1[2-5]\d g\b|about 95 g/i],
  ['protein (code)', /protein\s*[<>]=?\s*1[2-5]\d\b|\b1[2-5]\d\s*-\s*\w+\.protein|g<\/b> of 1[2-5]\d|'protein' \? 1[2-5]\d/],
  ['gym a week', /\b[Gg]ym,? [3-6](?:[–-][3-6])?[×+ .]|\b[3-6](?:[–-][3-6])?\+? gym\b|[Ff]our gym|\blift [3-6]×/],
];
function walk(d, out = []) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p, out); else if (/\.(ts|tsx)$/.test(f)) out.push(p); } return out; }
const files = [here('./index.html'), ...walk(here('../glow/src'))].filter((f) => !/\/data\/(foods|ukFoods|usda|swaps|units)\./.test(f) && !/plan\.ts$/.test(f));
let bad = 0;
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n'); let inBlock = false;
  lines.forEach((raw, i) => {
    let l = raw;
    if (inBlock) { const e = l.indexOf('*/'); if (e < 0) return; l = l.slice(e + 2); inBlock = false; }
    if (/plan-ok|plan-def/.test(raw)) return;
    l = l.replace(/\/\*.*?\*\//g, '').replace(/<!--.*?-->/g, '');
    const o = l.indexOf('/*'); if (o >= 0) { inBlock = true; l = l.slice(0, o); }
    l = l.replace(/(^|[^:'"])\/\/.*$/, '$1');
    for (const [name, re, only] of RULES) { if (only && !only.test(l)) continue; const m = l.match(re); if (m) { bad++; console.log(`${f.replace(here('../'), '')}:${i + 1}  [${name}]  …${l.slice(Math.max(0, m.index - 50), m.index + m[0].length + 30).trim()}…`); } }
  });
}
console.log(bad ? `FAIL: ${bad} target${bad === 1 ? '' : 's'} typed outside the plan` : 'all passed: every target comes from the plan');
process.exit(bad ? 1 : 0);
