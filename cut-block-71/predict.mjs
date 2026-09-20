import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const p = await b.newPage({ viewport: { width: 430, height: 2200 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
await p.goto(FILE);
await p.evaluate(() => localStorage.clear());
await p.reload(); await p.waitForTimeout(200);
await p.click('[data-t="training"]');

const cards = () => p.$$eval('#tPredict .goal', els => els.map(e => ({
  k: e.querySelector('.gn').textContent.trim(),
  v: e.querySelector('.gl').textContent.trim(),
  s: e.querySelector('.gs').textContent.trim() })));

// ---- the maths is Riegel, off the 5 km reference -------------------------
const math = await p.evaluate(() => {
  const ref = S.settings.fiveK;
  return {
    ref: ref,
    k3: predictAt(3000), k3want: ref * Math.pow(3000 / 5000, 1.06),
    mile: predictAt(1609), milewant: ref * Math.pow(1609 / 5000, 1.06),
    m800: predictAt(800),
    m400: predictAt(400), m200: predictAt(200),
    identity: predictAt(5000)
  };
});
ok('the reference is his 18:05', math.ref === 1085, String(math.ref));
ok('3 km is Riegel off it', Math.abs(math.k3 - math.k3want) < 1e-9, String(math.k3));
ok('and that is about 10:31', Math.abs(math.k3 - 631) < 4, mmssOf(math.k3));
ok('the mile predicts about 5:26', Math.abs(math.mile - 326) < 3, mmssOf(math.mile));
// and that lands within a second of the 5:27 he actually ran, which is the
// closest thing to a validation of the model against his own data
ok('which is within a second of his real 5:27',
  Math.abs(math.mile - 327) < 3, mmssOf(math.mile) + ' vs 5:27');
ok('predicting 5 km returns the reference itself', Math.abs(math.identity - 1085) < 1e-9, String(math.identity));
ok('800m is predicted', math.m800 !== null && math.m800 > 0, String(math.m800));
ok('but 400m is not', math.m400 === null, String(math.m400));
ok('and nor is 200m', math.m200 === null, String(math.m200));
function mmssOf(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

// ---- the default is 3 km, which he has never run -------------------------
let c = await cards();
ok('it defaults to 3 km', (await p.inputValue('#predDist')) === '3000', await p.inputValue('#predDist'));
ok('three cards: fitness, best, and target where there is one', c.length === 2 || c.length === 3, JSON.stringify(c.map(x => x.k)));
ok('it gives a time for today\'s fitness', /^\d+:\d\d$/.test(c[0].v), JSON.stringify(c[0]));
ok('with the pace it implies', /\/km/.test(c[0].s), c[0].s);
ok('and says it came off the 5 km', /off your 18:05 5 km/.test(c[0].s), c[0].s);
ok('his best at 3 km is empty, honestly', /—/.test(c[1].v) && /nothing at this distance yet/.test(c[1].s), JSON.stringify(c[1]));

// ---- switching distance --------------------------------------------------
await p.selectOption('#predDist', '1609');
await p.waitForTimeout(100);
c = await cards();
ok('the picker changes the distance', (await p.evaluate(() => PRED_DM)) === 1609);
ok('the mile predicts a time', /^\d+:\d\d$/.test(c[0].v), JSON.stringify(c[0]));
ok('his 5:27 shows as his best', /5:27/.test(c[1].v), JSON.stringify(c[1]));
ok('and the sub-4:45 target is shown', c.length === 3 && /4:45/.test(c[2].v), JSON.stringify(c.map(x => x.v)));
ok('with the gap to it', /to go/.test(c[2].s), c[2].s);

// a distance with a target already met would say so; 5 km is not met
await p.selectOption('#predDist', '5000');
await p.waitForTimeout(100);
c = await cards();
ok('5 km predicts itself back', /18:05/.test(c[0].v), JSON.stringify(c[0]));
ok('and best and prediction agreeing is called out',
  /agree, which means that best is a fair reflection/.test(await p.textContent('#tPredict')),
  (await p.textContent('#tPredict')).slice(0, 500));

// short distances refuse to guess
await p.selectOption('#predDist', '200');
await p.waitForTimeout(100);
c = await cards();
let t = await p.textContent('#tPredict');
ok('200m gives no prediction', c[0].v === '—', JSON.stringify(c[0]));
ok('and says why it will not guess', /there is no prediction, on purpose/.test(t), t.slice(t.indexOf('Under'), t.indexOf('Under') + 260));
ok('naming speed rather than endurance', /decided by top-end speed/.test(t));
ok('while still showing his own best', /28\.1 s|28\.0 s/.test(c[1].v), JSON.stringify(c[1]));

// the "cheapest PB" call, where he has never run the distance hard
await p.selectOption('#predDist', '1000');
await p.waitForTimeout(100);
t = await p.textContent('#tPredict');
const cmp = await p.evaluate(() => {
  const rec = records(); const bst = bestAt(1000, rec[1000]).best;
  return { best: bst.t, pred: predictAt(1000), kind: bst.kind };
});
ok('1 km compares his 3:00 against the prediction', cmp.best === 180, JSON.stringify(cmp));
if (cmp.best < cmp.pred) {
  ok('a best quicker than predicted is explained', /quicker<\/b> than your 5 km fitness predicts/.test(await p.innerHTML('#tPredict')), t.slice(0, 400));
  ok('including that it may be a rep, not an effort', /session with recovery in it rather than as a single effort/.test(t));
} else {
  ok('a best slower than predicted is called the cheapest PB', /cheapest personal best on the board/.test(t), t.slice(0, 400));
}

// ---- the caveats that keep this from becoming a prescribed pace ----------
t = await p.textContent('#tPredict');
ok('it says this is not a rep target', /This is a single all-out effort, not a rep target/.test(t));
ok('and why reps are deliberately slower', /the point of reps is repeating them/.test(t));
ok('and not to take it into a session', /Do not take this number into a 5 × 1 km/.test(t));
ok('it flags the deficit', /expect the slow end of it/.test(t));
ok('and names the dial to change', /the 5 km reference below it is the dial/.test(t));

// changing the reference moves every prediction
const before = await p.evaluate(() => predictAt(3000));
await p.fill('#in5k', '17:30');
await p.click('#btn5k');
await p.waitForTimeout(150);
const after = await p.evaluate(() => predictAt(3000));
ok('a faster 5 km reference speeds up every prediction', after < before - 10, before.toFixed(1) + ' → ' + after.toFixed(1));
ok('and it persists', (await p.evaluate(() => S.settings.fiveK)) === 1050);

// ---- nothing broke -------------------------------------------------------
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
