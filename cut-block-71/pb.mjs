import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2000 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const boot = async (s, live) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(200);
  if (live) await p.evaluate(l => { LIVE = l; render(); }, live); };

// ===== his real state right now ==========================================
const REAL = st({
  bests: { '3000': { d: '2026-09-20', n: '3km all out', src: 'you', t: 629 } },
  days: { '2026-09-19': { gym: true, kcal: 1797, sleep: 8, steps: 17000 },
          '2026-09-20': { sleep: 8, runs: [{ km: 3.01, note: '3km all out', secs: 630, type: 'threshold' }] } },
  weights: { '2026-09-19': 131.6, '2026-09-20': 129.2 }
});
await boot(REAL, [{ id: '1', d: '2026-09-20', name: '3km all out', dist: 3009.6, mov: 630, ela: 630 }]);

const pbs = await p.evaluate(() => pbList());
ok('the 3 km shows up as a personal best', pbs.some(x => x.dm === 3000), JSON.stringify(pbs.map(x => x.dm)));
const k3 = pbs.filter(x => x.dm === 3000)[0];
ok('at his own 10:29, not the scaled 10:28', k3.now.t === 629, JSON.stringify(k3.now));
ok('marked a first, because he had no 3 km before', k3.first === true && k3.prior === null, JSON.stringify({ f: k3.first, p: k3.prior }));
ok('and flagged fresh, since it is today', k3.fresh === true, String(k3.fresh));

let t = await p.textContent('#pbCard');
ok('it is announced on Today', /New personal best/.test(t), t.slice(0, 160));
ok('naming the distance and the time', /3 km — 10:29/.test(t), t.slice(0, 200));
ok('and saying there was nothing to beat', /nothing to beat, so this <b>is<\/b> the mark now|nothing to beat/.test(t), t.slice(0, 320));
ok('with the date', /Sunday 20 September/.test(t), t.slice(0, 320));
ok('and says it stays until the next hard run', /stays here until your next hard run/.test(t));
// the full list lives on Wins now, not on Today
await p.click('[data-t="wins"]');
const board = await p.textContent('#winBoard');
ok('the full list is on the Wins board', /3 km — 10:29/.test(board), board.slice(0, 300));
ok('with what it beat', /first effort at this distance/.test(board));

// ===== beating an existing best ==========================================
// a 5 km of 17:30 beats the 18:05 on record
await boot(st({}), [{ id: '2', d: '2026-09-20', name: '5k time trial', dist: 5001, mov: 1050, ela: 1050 }]);
const five = await p.evaluate(() => pbList().filter(x => x.dm === 5000)[0]);
ok('a faster 5 km is caught', !!five, JSON.stringify(await p.evaluate(() => pbList().map(x => x.dm))));
ok('it knows the old mark was the 18:05', five.prior && five.prior.t === 1085, JSON.stringify(five.prior));
ok('and computes the gain', Math.abs(five.gain - 35) < 2, String(five.gain));
t = await p.textContent('#pbCard');
ok('the gain is stated in seconds', /35(\.\d)? s faster|0:35 faster/.test(t), t.slice(0, 300));
ok('against the previous best', /previous best of 18:05/.test(t), t.slice(0, 300));

// ===== a slower run is NOT a personal best ===============================
await boot(st({}), [{ id: '3', d: '2026-09-20', name: 'easy 5k', dist: 5004, mov: 1400, ela: 1400 }]);
const slow = await p.evaluate(() => pbList().filter(x => x.dm === 5000)[0]);
ok('a slower 5 km is not announced', !slow, JSON.stringify(slow || null));
ok('and the card stays quiet', (await p.textContent('#pbCard')).trim() === '', (await p.textContent('#pbCard')).slice(0, 120));

// ===== a pre-block effort is not a block best ============================
await boot(st({}), [{ id: '4', d: '2026-08-31', name: '5k', dist: 5013.8, mov: 1000, ela: 1000 }]);
ok('a fast run dated before the cut is not a block best',
  (await p.evaluate(() => pbList().filter(x => x.dm === 5000).length)) === 0);

// ===== it ages out of "new" but stays on the list ========================
await boot(st({ bests: { '3000': { d: '2026-09-20', n: 'x', src: 'you', t: 629 } } }));
const aged = await p.evaluate(() => {
  const x = pbList().filter(y => y.dm === 3000)[0];
  return { fresh: x.fresh, listed: !!x };
});
ok('a best from today is still fresh', aged.fresh === true, JSON.stringify(aged));
ok('and it is listed either way', aged.listed === true);

// ===== nothing broke =====================================================
await boot(REAL);
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', rows => rows.map(r => r.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
