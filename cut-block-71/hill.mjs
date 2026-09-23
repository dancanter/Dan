import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2400 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220); };

// Uphill used to be welded to the 100 m option, so a 200 m hill session could
// not be recorded at all — which matters now the reverse plan is built on
// short uphill sprints.
await boot(st());
await p.click('[data-t="today"]');
const dists = await p.$$eval('#inRepD option', o => o.map(x => x.value));
ok('there is no uphill-only distance left', !dists.includes('100u'), dists.join(','));
ok('uphill is its own control', (await p.$$eval('#inUp option', o => o.length)) === 3);
ok('and it offers a partial', (await p.$$eval('#inUp option', o => o.map(x => x.value))).includes('some'));

// Today's real session: 5 x 200, two of them half uphill.
await p.selectOption('#inKind', 'reps');
await p.selectOption('#inRepD', '200');
await p.fill('#inReps', '5');
await p.selectOption('#inUp', 'some');
await p.fill('#inTime', '2:30');
await p.click('#btnAddRun');
await p.waitForTimeout(200);
let r = await p.evaluate(() => S.days[today()].runs[0]);
ok('a 200 m session records as 200 m', r.dm === 200 && r.n === 5, JSON.stringify(r));
ok('the total rep time is kept', r.secs === 150, String(r.secs));
ok('and a partial hill is stored as such', r.up === 'some', JSON.stringify(r.up));
let lbl = await p.evaluate(() => runMeta(S.days[today()].runs[0]).label);
ok('the label says part uphill', lbl === '5 × 200m part uphill', lbl);
ok('the selector resets after adding', (await p.$eval('#inUp', e => e.value)) === '');

// All-uphill still reads as plain uphill, and flat says nothing.
await boot(st());
await p.click('[data-t="today"]');
await p.selectOption('#inRepD', '200'); await p.fill('#inReps', '6');
await p.selectOption('#inUp', 'all'); await p.fill('#inTime', '3:00');
await p.click('#btnAddRun'); await p.waitForTimeout(200);
ok('all-uphill stores true', (await p.evaluate(() => S.days[today()].runs[0].up)) === true);
ok('and labels plainly', (await p.evaluate(() => runMeta(S.days[today()].runs[0]).label)) === '6 × 200m uphill');
await boot(st());
await p.click('[data-t="today"]');
await p.selectOption('#inRepD', '400'); await p.fill('#inReps', '4'); await p.fill('#inTime', '4:40');
await p.click('#btnAddRun'); await p.waitForTimeout(200);
ok('a flat session carries no hill flag', (await p.evaluate(() => S.days[today()].runs[0].up)) === undefined);
ok('and says nothing about hills', (await p.evaluate(() => runMeta(S.days[today()].runs[0]).label)) === '4 × 400m');

// A 100 m session is still the sprint slot.
await boot(st());
await p.click('[data-t="today"]');
await p.selectOption('#inRepD', '100'); await p.fill('#inReps', '8'); await p.fill('#inTime', '2:00');
await p.click('#btnAddRun'); await p.waitForTimeout(200);
ok('100 m reps still count as sprints', (await p.evaluate(() => runMeta(S.days[today()].runs[0]).sprint)) === true);
ok('and a 200 m set does not', (await p.evaluate(() => runMeta({ k: 'reps', dm: 200, n: 5, secs: 150 }).sprint)) === false);
ok('a 200 m set is a hard run', (await p.evaluate(() => runMeta({ k: 'reps', dm: 200, n: 5, secs: 150 }).hard)) === true);

// ===== GAP and the recovery he actually took =============================
// A session with hills in it: raw pace flatters the flat reps and punishes
// the climbs, so the watch's grade-adjusted figure is the fair comparison.
// The recovery is REPORTED, never prescribed — "however long it takes" is
// Dan's rule and a number here would quietly become a target.
await boot(st({ days: { [await p.evaluate(() => today())]: { runs: [
  { k: 'reps', dm: 200, n: 5, secs: 150, up: 'some', ela: 1441, gap: 147, note: '2 half uphill, 3 flat' } ] } } }));
await p.click('[data-t="today"]');
const j = await p.evaluate(() => runMeta(S.days[today()].runs[0]));
ok('GAP is carried through', j.gap === 147, JSON.stringify(j.gap));
ok('the rep average is right', j.repAvg === 30, String(j.repAvg));
ok('and the recovery is derived from elapsed minus moving',
  Math.abs(j.rest - (1441 - 150) / 4) < 0.01, String(j.rest));
const row = (await p.textContent('#runList')).replace(/\s+/g, ' ');
ok('the row shows the grade-adjusted pace', /GAP 2:27/.test(row), row.slice(0, 220));
ok('and the raw pace beside it, off the nominal distance', /2:30\/km/.test(row), row.slice(0, 220));
ok('the recovery is stated', /About 5:23 between reps/.test(row), row.slice(0, 300));
ok('as a multiple of the rep', /10\.8. the rep itself/.test(row), row.slice(0, 320));
ok('and explicitly without a target', /No target, just what you took/.test(row));
ok('the label keeps the partial hill', /5 . 200m part uphill/.test(row), row.slice(0, 160));

// A session with no elapsed time says nothing about recovery rather than
// inventing one, and a flat session has no GAP to show.
await boot(st({ days: { [await p.evaluate(() => today())]: { runs: [
  { k: 'reps', dm: 400, n: 4, secs: 280 } ] } } }));
await p.click('[data-t="today"]');
const j2 = await p.evaluate(() => runMeta(S.days[today()].runs[0]));
ok('no elapsed means no recovery figure', j2.rest === null, String(j2.rest));
ok('and no GAP when the watch gave none', j2.gap === null, String(j2.gap));
const row2 = (await p.textContent('#runList')).replace(/\s+/g, ' ');
ok('so the row stays quiet about both', !/between reps/.test(row2) && !/GAP/.test(row2), row2.slice(0, 200));

await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', rs => rs.map(x => x.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
