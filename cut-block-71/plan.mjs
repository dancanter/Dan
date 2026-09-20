import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2400 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d); };
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(200); await p.click('[data-t="training"]'); };

await boot(st({}));

// ===================== the per-distance plan ===============================
let t = await p.textContent('#tPlan');
ok('the plan panel renders', t.length > 500, String(t.length));
ok('it says no paces or rest intervals, deliberately',
  /no paces and no rest intervals/.test(t), t.slice(0, 400));
ok('and that it is his call', /How hard and how long you stand around is yours/.test(t));

const summaries = await p.$$eval('#tPlan details summary', els => els.map(e => e.textContent.trim()));
ok('one collapsible per target', summaries.length === 6, JSON.stringify(summaries));
ok('closest first', /^200m/.test(summaries[0]), summaries[0]);
ok('each names the gap', summaries.every(s => /to go|target met|nothing logged/.test(s)), JSON.stringify(summaries));
ok('and all six targets are covered',
  ['200m', '400m', '800m', '1 km', '1 mile', '5 km'].every(k => summaries.some(s => s.indexOf(k) === 0)),
  JSON.stringify(summaries));

await p.$$eval('#tPlan details', els => els.forEach(e => { e.open = true; }));
t = await p.textContent('#tPlan');
ok('the 400 limiter is speed endurance', /Speed endurance/.test(t));
ok('and it recommends 300s as the classic 400 session', /300m reps<\/b> — the classic 400 session|300m reps. — the classic/.test(await p.innerHTML('#tPlan')) || /the classic 400 session/.test(t));
ok('it cites his own 59 from the 4 x 600 as evidence', /Your 59 came inside a 4 × 600/.test(t));
ok('the 5 km limiter is the engine, from his own 3:00',
  /3:00, which is 15:00 5 km pace/.test(t), t.slice(t.indexOf('5 km'), t.indexOf('5 km') + 300));
ok('and it says so honestly for a deficit', /mostly a reverse-phase target and it is honest to say so/.test(t));
ok('it flags he has never run a flat-out 800', /never run a flat-out 800 in 2026/.test(t));
ok('and that the 5:27 mile was not a mile effort', /Treat it as a floor, not a best/.test(t));
ok('each distance reports his own session count', /Your own record at this distance/.test(t));

// no prescribed paces or rest intervals anywhere in the new panels
const all = (await p.textContent('#tPlan')) + (await p.textContent('#tMix')) + (await p.textContent('#tRest'));
ok('no prescribed rest seconds', !/\b\d+\s*(s|sec|seconds|min|minutes)\s+(rest|recovery)\b/i.test(all),
  (all.match(/\b\d+\s*(s|sec|seconds|min|minutes)\s+(rest|recovery)\b/i) || [])[0]);
ok('no prescribed per-km paces', !/\brun (it|them|these) at \d/i.test(all));
ok('no "at X pace" instructions', !/\bat \d:\d\d\s*\/?\s*km\b/i.test(all), (all.match(/at \d:\d\d\s*\/?\s*km/i) || [])[0]);

// ===================== gone cold, from his own log =========================
const cold = await p.evaluate(() => goneCold().map(c => ({ dm: c.dm, n: c.n, last: c.last, age: c.age })));
ok('it finds distances he has stopped doing', cold.length > 0, JSON.stringify(cold));
ok('each has at least two sessions on record', cold.every(c => c.n >= 2), JSON.stringify(cold));
ok('and all are over the cold threshold', cold.every(c => c.age >= 42), JSON.stringify(cold.map(c => c.age)));
ok('500m is one of them', cold.some(c => c.dm === 500), JSON.stringify(cold.map(c => c.dm)));
const freq = await p.evaluate(() => distFreq());
ok('500m was last done in February', freq['500'].last === '2026-02-16', JSON.stringify(freq['500']));
ok('and he has done two of them', freq['500'].n === 2, JSON.stringify(freq['500']));
ok('400m is not cold', !cold.some(c => c.dm === 400), JSON.stringify(cold.map(c => c.dm)));
t = await p.textContent('#tPlan');
ok('the cold list is shown with why each matters', /Sessions you used to do and have stopped/.test(t));
ok('and framed as drift, not a telling-off', /Not a telling-off/.test(t));

// ===================== the mix ============================================
const mx = await p.evaluate(() => mixModel());
t = await p.textContent('#tMix');
ok('every 2026 session is categorised', mx.total >= 60, String(mx.total));
ok('the categories sum to the total',
  ['speed', 'speedEnd', 'vo2', 'threshold', 'aerobic'].reduce((a, k) => a + mx.counts[k], 0) === mx.total,
  JSON.stringify(mx.counts));
ok('speed endurance is his biggest block', mx.counts.speedEnd >= mx.counts.aerobic, JSON.stringify(mx.counts));
ok('easy volume is thin', mx.counts.aerobic <= 6, String(mx.counts.aerobic));
ok('the panel names that honestly', /under-trained for the 5 km/.test(t), t.slice(-400));
ok('and gives his longest run of the year', /longest run of 2026 is 9\.5 km/.test(t), (t.match(/longest run of 2026 is [\d.]+ km/) || [])[0]);
ok('without telling him to drop the reps', /not an argument for abandoning the reps/.test(t));
ok('each category shows a count and a share', /%/.test(t) && /Speed endurance/.test(t));

// ===================== rest and adaptation =================================
t = await p.textContent('#tRest');
ok('it says the fitness is made in the gap', /fitness is built in the 24–72 hours afterwards/.test(t), t.slice(0, 200));
ok('supercompensation is explained', /Supercompensation/.test(t) && /testing yourself in the dip/.test(t));
ok('and why 48 hours', /Why 48 hours/.test(t) && /one good session and one session run on the fatigue/.test(t));
ok('it says a deficit slows recovery', /On a deficit it is slower/.test(t));
ok('but is not a reason to do fewer sessions', /a reason to space them, not a reason to do fewer/.test(t));
ok('the deloads are named', /Weeks 4 and 8 exist for this/.test(t));
ok('sleep is named as the biggest lever', /largest recovery lever/.test(t));
ok('there are signs of under-recovery', /How to tell you have not recovered/.test(t));
ok('including motivation dropping first', /Motivation drops before performance does/.test(t));
ok('and a taper before a time trial', /Before you actually go for a time/.test(t));
ok('which points at the reverse staging', /the 400 at weeks three to four/.test(t));

// the back-to-back finding, from his own data
const b2b = await p.evaluate(() => backToBack());
ok('consecutive hard days are found in his log', b2b.length > 0, JSON.stringify(b2b.slice(0, 3)));
ok('each pair really is consecutive',
  b2b.every(x => (new Date(x.b) - new Date(x.a)) === 864e5), JSON.stringify(b2b.slice(0, 2)));
ok('it is surfaced with the dates', /hard sessions on consecutive days/.test(t), t.slice(t.indexOf('consecutive') - 80, t.indexOf('consecutive') + 200));
ok('and quotes his own session note back', /very intense day after legs and a hard session/.test(t));
ok('framed as the cheapest improvement', /costs no extra work/.test(t));

// ===================== nothing broke =======================================
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', rows => rows.map(r => r.children[0].textContent.trim()));
ok('every self-check passes', checks.every(c => c === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
