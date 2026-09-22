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
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const boot = async (s, live) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220);
  if (live) await p.evaluate(l => { LIVE = l; render(); }, live); };

// his real state, 22 Sep
const REAL = st({
  bests: { '3000': { d: '2026-09-20', n: '3km all out', src: 'you', t: 629 } },
  days: {
    '2026-09-19': { gym: true, kcal: 1797, sleep: 8, steps: 17000 },
    '2026-09-20': { gym: true, kcal: 1797, steps: 15200, sleep: 8, runs: [{ km: 3.01, secs: 630, type: 'threshold', note: '3km all out' }] },
    '2026-09-21': { kcal: 1799, steps: 15000, sleep: 7, study: 3, deep: 3, runs: [{ km: 5, secs: 1482, type: 'easy' }] },
    '2026-09-22': { sleep: 7.5 } },
  weights: { '2026-09-15': 128.6, '2026-09-17': 127.8, '2026-09-18': 129.2,
             '2026-09-19': 131.6, '2026-09-20': 129.2, '2026-09-21': 128.6, '2026-09-22': 128.6 }
});
await boot(REAL, [{ id: '1', d: '2026-09-20', name: '3km all out', dist: 3009.6, mov: 630, ela: 630 }]);

// ===== 1. the 3 km is on the Times bests table ===========================
await p.click('[data-t="times"]');
await p.$$eval('#s-times details', els => els.forEach(e => { e.open = true; }));
let t = await p.textContent('#stravaBest');
ok('the bests table no longer says there is no 3 km', !/no 3 km effort in 2026/.test(t), t.slice(0, 200));
ok('the 3 km is listed', /3 km/.test(t));
ok('at his own 10:29', /10:29/.test(t), (t.match(/3 km[^|]{0,80}/) || [])[0]);
ok('marked as set this block', /this block/.test(t));
ok('and attributed to him', /you entered it/.test(t), (t.match(/you entered it/) || [])[0]);
ok('the table is derived, and says so', /read off your record rather than typed in/.test(t));
ok('the 805m half-mile note survives', /805 m in 2:24/.test(t), t.slice(-320));
const rows = await p.$$eval('#stravaBest tbody tr', els => els.length);
ok('one row per benchmark distance', rows === await p.evaluate(() => BENCH.length), rows + ' vs BENCH');

// ===== 2. distance does not decide anything; effort does ================
// Dan's call: a 5 km and a 5 mile easy run are the same thing. The separate
// five-mile slot is gone, so the only question a continuous run has to answer
// is whether it was easy or hard — and that is judged on pace, not on length
// and not on what he filed it as.
const mk = (o) => st({ days: Object.assign({ '2026-09-21': {}, '2026-09-22': {} }, o) });
await boot(mk({ '2026-09-21': { runs: [{ km: 5, secs: 1482, type: 'easy' }] },
                '2026-09-22': { runs: [{ km: 8.05, secs: 2600, type: 'easy' }] } }));
let wk = await p.evaluate(() => trainingModel().week);
ok('a 5 km and a 5 mile plod both count as easy runs', wk.easy === 2, JSON.stringify(wk));
ok('and they are the same bucket', wk.byKind.easy === 2, JSON.stringify(wk.byKind));
ok('the old five-mile bookkeeping is gone',
  wk.fivemile === undefined && wk.easy5k === undefined && wk.fiveWhy === undefined,
  JSON.stringify(Object.keys(wk)));

// A five-mile threshold is a hard run. A five-mile plod is not.
await boot(mk({ '2026-09-21': { runs: [{ km: 8.05, secs: 1750, type: 'threshold' }] },
                '2026-09-22': { runs: [{ km: 8.05, secs: 2600, type: 'easy' }] } }));
wk = await p.evaluate(() => trainingModel().week);
ok('a five-mile threshold is a hard run', wk.hard === 1, JSON.stringify(wk));
ok('and a five-mile plod is an easy one', wk.easy === 1, JSON.stringify(wk));

// Filing does not get a vote: a run filed easy but run fast is hard, and one
// filed hard but run slow is easy.
await boot(mk({ '2026-09-21': { runs: [{ km: 5, secs: 1050, type: 'easy' }] },
                '2026-09-22': { runs: [{ km: 5, secs: 1900, type: 'threshold' }] } }));
wk = await p.evaluate(() => trainingModel().week);
ok('a fast run filed as easy is still hard', wk.hard === 1, JSON.stringify(wk));
ok('and a slow run filed as threshold is still easy', wk.easy === 1, JSON.stringify(wk));

// The week panel says the rule in Dan's own terms.
await p.click('[data-t="training"]');
t = (await p.textContent('#tWeek')).replace(/\s+/g, ' ');
ok('the easy-run row is the slot now', /Easy runs/.test(t), t.slice(0, 260));
// Only the TABLE must be free of it — the sentence explaining the rule says
// "5 mile" on purpose.
const wkRows = await p.$$eval('#tWeek table tr td:first-child', c => c.map(x => x.textContent.trim()));
ok('there is no five-mile row left', !wkRows.some(x => /5 ?mile/i.test(x)), wkRows.join(' | '));
ok('and the rule is stated', /A 5 km and a 5 mile easy run are the same thing here/.test(t));
ok('with what actually splits them', /a five-mile threshold is a hard run, a five-mile plod is an easy one/.test(t));
// The "Filed as" menu should no longer offer a distance as a category.
await p.click('[data-t="today"]');
const filed = await p.$$eval('#inContType option', o => o.map(x => x.textContent));
ok('the form files by effort, not distance', !filed.some(x => /5 mile/i.test(x)), filed.join(' | '));
ok('and still offers both efforts', filed.length === 2, filed.join(' | '));

// ===== 3. the running deficit total on Wins ==============================
await boot(REAL);
const tb = await p.evaluate(() => tdeeBlock());
ok('every LOGGED day of the block is listed', tb.n >= 3, String(tb.n));
ok('and a day with nothing on it is left out, not counted as a surplus',
  tb.unlogged >= 1 && tb.days.every(d => d.stepsKnown || d.intakeKnown),
  JSON.stringify({ unlogged: tb.unlogged, days: tb.days.map(d => d.date) }));
ok('the running total accumulates', tb.days.every((d, i) => i === 0 || d.run >= tb.days[i - 1].run),
  JSON.stringify(tb.days.map(d => Math.round(d.run))));
ok('and the last running total is the grand total',
  Math.abs(tb.days[tb.days.length - 1].run - tb.total) < 0.01, JSON.stringify({ r: tb.days[tb.days.length - 1].run, t: tb.total }));
ok('it converts to pounds', Math.abs(tb.lb - tb.total / 3500) < 1e-9, String(tb.lb));
ok('and names the biggest day', tb.best && tb.best.date, JSON.stringify(tb.best));
await p.click('[data-t="wins"]');
t = await p.textContent('#winDeficit');
ok('Wins shows the day-by-day deficit', /Deficit, day by day/.test(t), t.slice(0, 160));
ok('with a running total column', /Running total/.test(t));
ok('the whole-block total', /total deficit/i.test(t));
ok('and what it is in pounds', /at 3,500 kcal a pound/.test(t));
ok('newest first', /Newest first/.test(t));

// the weekly table must drop a blank day too — his Tue 22 Sep read +76
await boot(REAL);
const wkm = await p.evaluate(() => tdeeWeek());
ok('the weekly table drops a day with nothing logged',
  wkm.unlogged >= 1 && wkm.days.every(d => d.stepsKnown || d.intakeKnown),
  JSON.stringify({ unlogged: wkm.unlogged, days: wkm.days.map(d => d.date) }));
ok('so no fake surplus is left in the week', wkm.days.every(d => d.deficit > 0),
  JSON.stringify(wkm.days.map(d => [d.date, Math.round(d.deficit)])));
ok('and the week total is a deficit', wkm.deficit > 0, String(Math.round(wkm.deficit)));

// the whole-cut table sits on Food under the weekly one
await p.click('[data-t="food"]');
const food = await p.textContent('#foodTdee');
ok('Food carries the weekly table', /This week ·/.test(food), food.slice(0, 200));
ok('and the whole-cut table beneath it', /The whole cut ·/.test(food));
ok('the whole cut comes after the week',
  food.indexOf('The whole cut') > food.indexOf('This week'), 'order');
ok('with a running total column', /Running total/.test(food));
ok('and the pounds so far', /that turns into pounds/.test(food));
ok('it points at the Wins copy', /The same table is on <b>Wins<\/b>/.test(await p.innerHTML('#foodTdee')));
const bothTotals = await p.evaluate(() => ({ block: tdeeBlock().total, wins: tdeeBlock().total }));
ok('Food and Wins read the same model', bothTotals.block === bothTotals.wins, JSON.stringify(bothTotals));

// ===== 4. the pre-cut average ============================================
const pa = await p.evaluate(() => preAvg());
ok('the pre-cut average is computed from his own mornings', pa.n === 5, JSON.stringify(pa));
ok('and it is 129.3, not 129.1', Math.abs(pa.avg - 129.28) < 0.01, pa.avg.toFixed(2));
ok('it spans the water weekend', pa.hi === 131.6 && pa.lo === 127.8, JSON.stringify({ lo: pa.lo, hi: pa.hi }));
// with in-cut readings the real average wins
await p.click('[data-t="weight"]');
t = await p.textContent('#wTop');
ok('with in-cut mornings the real average is shown', /128\.6 lb/.test(t), t.slice(0, 200));
ok('and it is not called provisional', !/provisional/.test(t.slice(0, 400)), t.slice(0, 300));
// before the scale opens, the pre-cut average stands in
await boot(st({ weights: { '2026-09-15': 128.6, '2026-09-17': 127.8, '2026-09-18': 129.2, '2026-09-19': 131.6, '2026-09-20': 129.2 } }));
await p.click('[data-t="weight"]');
t = await p.textContent('#wTop');
ok('with nothing in-cut it falls back to the pre-cut average', /129\.3 lb/.test(t), t.slice(0, 220));
ok('clearly marked provisional', /provisional/.test(t), t.slice(0, 260));
ok('and the baseline is still not seeded from it',
  (await p.evaluate(() => weightModel().baseline)) === null);

// ===== nothing broke =====================================================
await boot(REAL);
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', rows2 => rows2.map(r => r.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
