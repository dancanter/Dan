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

const REAL = st({
  bests: { '3000': { d: '2026-09-20', n: '3km all out', src: 'you', t: 629 } },
  days: {
    '2026-09-19': { gym: true, kcal: 1797, sleep: 8, steps: 17000, phoneOut: true },
    '2026-09-20': { gym: true, kcal: 1797, steps: 15200, sleep: 8, phoneOut: true, runs: [{ km: 3.01, secs: 630, type: 'threshold' }] },
    '2026-09-21': { kcal: 1799, steps: 15000, sleep: 7, study: 3, deep: 3, phoneOut: true, runs: [{ km: 5, secs: 1482, type: 'easy' }] },
    '2026-09-22': { sleep: 7.5, study: 2, deep: 1 } },
  weights: { '2026-09-15': 128.6, '2026-09-17': 127.8, '2026-09-18': 129.2,
             '2026-09-19': 131.6, '2026-09-20': 129.2, '2026-09-21': 128.6, '2026-09-22': 128.6 }
});
const dsB = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const backB = n => { const d = new Date(); d.setDate(d.getDate() - n); return dsB(d); };
for (let i = 0; i < 3; i++) {
  const d = backB(i);
  REAL.days[d] = Object.assign({ sleep: 7.5, phoneOut: true }, REAL.days[d] || {}, { phoneOut: true });
}
await boot(REAL);

// ===== 1. Today's fuel card is short now =================================
let t = await p.textContent('#fuelCard');
ok('the fuel card is short', t.length < 900, String(t.length));
ok('it still names the day', /Fuel for/.test(t), t.slice(0, 120));
ok('with a one-liner, not a table', /Full detail on the Food tab/.test(t));
// the summary legitimately says "60-90 min before"; what must be gone is the
// expanded reasoning under each row
ok('no expanded reasoning on Today', !/~400 kcal and 66 g of carbohydrate/.test(t), t.slice(0, 400));
ok('and no essay about eggs', !/not something about eggs/.test(t));
ok('nor the stitch note, nor the window note',
  !/gastric distension/.test(t) && !/post-session window is oversold/.test(t));
ok('each session is one row of prose', await p.$$eval('#fuelCard tbody td', e => e.length) <= 8,
  String(await p.$$eval('#fuelCard tbody td', e => e.length)));
const rowsToday = await p.$$eval('#fuelCard tbody tr', e => e.length);
ok('at most one row per session type', rowsToday <= 4, String(rowsToday));
// but Food still has everything
await p.click('[data-t="food"]');
t = await p.textContent('#foodFuel');
ok('Food keeps the full detail', /60–90 min before/.test(t) && /not something about eggs/.test(t));
['Hard run', '100m uphill sprints', 'Easy run', 'Gym at 18:30', 'Rest day'].forEach(k =>
  ok('Food still lists ' + k, t.indexOf(k) >= 0));

// ===== 2. the PB card expires on the next hard run =======================
await boot(REAL);
let pbs = await p.evaluate(() => pbList());
ok('the 3 km best still stands', pbs.some(x => x.dm === 3000 && x.fresh), JSON.stringify(pbs.map(x => [x.dm, x.fresh])));
t = await p.textContent('#pbCard');
ok('so Today shows it', /New personal best/.test(t) && /10:29/.test(t), t.slice(0, 160));
ok('and says when it goes', /stays here until your next hard run/.test(t));

// log a hard run after it
await boot(st(Object.assign(JSON.parse(JSON.stringify(REAL)), {
  days: Object.assign(JSON.parse(JSON.stringify(REAL.days)), {
    '2026-09-22': { sleep: 7.5, study: 2, deep: 1, runs: [{ k: 'reps', dm: 400, n: 4, secs: 250 }] } }) })));
pbs = await p.evaluate(() => pbList());
ok('a later hard run retires it', pbs.filter(x => x.dm === 3000)[0].fresh === false,
  JSON.stringify(pbs.map(x => [x.dm, x.fresh])));
ok('and Today drops the card', (await p.textContent('#pbCard')).trim() === '', (await p.textContent('#pbCard')).slice(0, 120));
ok('an EASY run does not retire it',
  (await p.evaluate(() => hardRunAfter('2026-09-20'))) === true);
await boot(REAL);
ok('the easy 5 km on the 21st is not a hard run',
  (await p.evaluate(() => hardRunAfter('2026-09-20'))) === false);

// ===== 3. Wins: the board ================================================
await p.click('[data-t="wins"]');
t = await p.textContent('#winBoard');
ok('the board exists', /The board/.test(t), t.slice(0, 120));
ok('and carries the 3 km best', /3 km — 10:29/.test(t), t.slice(0, 400));
ok('starred while it still stands', /★/.test(t));
ok('it counts hard runs', /hard run/.test(t));
ok('and gym sessions', /gym session/.test(t));
ok('and the phone-free streak', /nights phone-free/.test(t));
ok('and study hours', /hours of study/.test(t));

// ===== 4. Wins: study ====================================================
t = await p.textContent('#winStudy');
const sb = await p.evaluate(() => studyBlock());
ok('study is totalled for the block', sb.total === 5 && sb.days === 2, JSON.stringify(sb));
ok('with deep hours', sb.deep === 4, String(sb.deep));
ok('and the deep share', Math.abs(sb.deepShare - 0.8) < 1e-9, String(sb.deepShare));
ok('the panel shows the hours', /5\.0 h/.test(t), t.slice(0, 200));
ok('and the biggest day', /Biggest day/.test(t) && /3\.0 h/.test(t), t.slice(-200));
ok('it says it is the whole block, not the week', /whole block, not the rolling week/.test(t));

// empty state
await boot(st({ weights: { '2026-09-21': 128.6 } }));
await p.click('[data-t="wins"]');
ok('the board has an honest empty state', /Nothing on it yet/.test(await p.textContent('#winBoard')),
  (await p.textContent('#winBoard')).slice(0, 160));
ok('and study still renders at zero', /0\.0 h/.test(await p.textContent('#winStudy')));

// ===== nothing broke =====================================================
await boot(REAL);
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', r2 => r2.map(r => r.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
