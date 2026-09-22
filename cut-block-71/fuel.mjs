import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 430, height: 1600 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 240)); });
const fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };

const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d); };
const TODAY = back(0);

// boot with a given state object, no window.claude at all (the no-connector view)
const boot = async (state) => {
  await p.goto(FILE);
  await p.evaluate(([k, s]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(s)); }, [LS, state]);
  await p.reload();
};
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);

// Shift the block start so "days ago" lands inside the cut, re-deriving
// everything that hangs off it, then re-render. Also a live check that moving
// the start re-reads dates rather than stranding them.
const startAt = (isoStart) => p.evaluate(s2 => {
  CFG.cutStart = s2;
  CUT_DAYS = diffD(CFG.cutStart, CFG.cutEnd) + 1;
  WEIGH_START = mondayOnOrAfter(CFG.cutStart);
  W_WEEKS = Math.ceil((diffD(WEIGH_START, CFG.cutEnd) + 1) / 7);
  PRE_END = addD(WEIGH_START, -1);
  PRE_DAYS = diffD(CFG.cutStart, WEIGH_START);
  render();
  return { cutStart: CFG.cutStart, weighStart: WEIGH_START, days: CUT_DAYS, elapsed: cutTally().elapsed };
}, isoStart);

// ---- the fuel card reads the day that was actually logged -----------------
await boot(st({ days: { [TODAY]: { runs: [{ k: 'reps', dm: 400, n: 4, secs: 250 }], gym: true } } }));
let t = await p.textContent('#fuelCard');
ok('fuel card renders', t.length > 200, String(t.length));
ok('names what was logged', /Fuel for what you logged today/.test(t), t.slice(0, 120));
ok('picks the hard-run block', /Hard run/.test(t));
ok('and the gym block', /Gym at 18:30/.test(t));
ok('does not show the rest-day block', !/Rest day/.test(t));
ok('two sessions fires the lunch warning', /lunch is not optional/i.test(t), t.slice(0, 400));
// Today is a summary now, by his request — the weights, the reasoning and the
// timings all live on Food. Today keeps the one-liner and the pointer.
ok('gives the oats in the summary', /Oats 60–90 min before/.test(t));
ok('and the post-run protein and carbs', /30 g protein \+ 60 g carbs/.test(t));
ok('names the bowl timing', /bowl 20:30/.test(t));
ok('never adds to the total', /Spending the 1,799 differently, never adding to it/.test(t));
ok('and points at Food for the detail', /Full detail on the Food tab/.test(t));

// ---- an easy run alone is not a hard day ---------------------------------
await boot(st({ days: { [TODAY]: { runs: [{ type: 'easy', km: 8.01, secs: 2400 }] } } }));
t = await p.textContent('#fuelCard');
ok('easy run gets the easy block', /Easy run, or the five mile/.test(t));
ok('and not the hard one', !/Hard run/.test(t));
ok('no lunch warning without a second session', !/lunch is not optional/i.test(t));
ok('says it can be run fasted', /Fasted is fine at easy effort/.test(t));

// ---- a sprint session ----------------------------------------------------
await boot(st({ days: { [TODAY]: { runs: [{ k: 'reps', dm: 100, n: 8, secs: 120, up: true }] } } }));
t = await p.textContent('#fuelCard');
ok('sprints get their own block', /100m uphill sprints/.test(t));
ok('warns about the morning after', /expect the scale up tomorrow/i.test(t), t.slice(0, 200));
ok('and says it is water, not fat', /it is water not fat/.test(t));
// the full reasoning is on Food
await p.click('[data-t="food"]');
ok('with the full explanation on Food', /holds water in the legs for 24–48 hours/.test(await p.textContent('#foodFuel')));

// ---- nothing logged: it reads what the week still owes -------------------
await boot(st({}));
t = await p.textContent('#fuelCard');
const src = await p.evaluate(() => fuelToday(trainingModel()).src);
ok('with nothing logged it does not invent a session', src === 'open' || src === 'rest', src);
if (src === 'open') {
  ok('says the week still owes something', /the week still owes/i.test(t), t.slice(0, 200));
} else {
  ok('or calls it a rest day', /rest day/i.test(t), t.slice(0, 200));
}

// ---- the rest-day rules are the ones that must never drift ---------------
const book = await p.evaluate(() => fuelBook().rest.r.map(r => r[0] + ' :: ' + r[1]));
ok('rest day says the food does not come down', /The food does not come down/.test(book.join('|')), book.join(' | '));
ok('and quotes the real daily target', /1,799/.test(book.join('|')), book.join(' | '));
ok('and keeps the carb floor derived', /147 g|\d+ g is what/.test(book.join('|')), book[2]);

// ---- the Food tab carries the whole set ----------------------------------
await p.click('[data-t="food"]');
t = await p.textContent('#foodFuel');
['Hard run', '100m uphill sprints', 'Easy run', 'Gym at 18:30', 'Rest day'].forEach(k =>
  ok('food tab lists ' + k, t.indexOf(k) >= 0));
ok('and says the total never moves', /1,799 every day, hard session or not/.test(t), t.slice(-300));

// ================= the step-it-up call =====================================
const week = (n) => { const o = {}; for (let i = 0; i < n; i++) o[back(i)] = {}; return o; };

// a cut well under way, weight fine, almost no sessions logged
// ~0.07 lb/day is squarely inside the 0.3-0.8%/wk band: the weight is fine,
// which is the case the push card exists for.
const wts = {}; for (let i = 0; i < 26; i++) wts[back(25 - i)] = +(129 - i * 0.07).toFixed(1);
await boot(st({ weights: wts, days: { [back(3)]: { gym: true } } }));
let shifted = await startAt(back(28));
ok('the block start moved and the dates were re-read', shifted.elapsed === 29, JSON.stringify(shifted));
let push = await p.textContent('#pushCard');
ok('step-it-up fires when the sessions are miles behind', push.length > 100, String(push.length));
ok('it is headed as a push', /Step it up/.test(push), push.slice(0, 80));
ok('names the counts against the targets', /of 48/.test(push) && /of 21/.test(push), push.slice(0, 500));
ok('and the rate that closes it', /a week from here closes it/.test(push));
ok('it is never a reason to eat less', /Nothing here says eat less/.test(push));
ok('and a rest day is not one of the misses', /a rest day is never one of the misses/.test(push));
const band = await p.evaluate(() => weightModel().band);
if (band === 'in') ok('leads with the weight doing its job', /The weight is doing its job/.test(push), push.slice(0, 160));
else ok('leads with something about the weight', /weight/i.test(push.slice(0, 260)), 'band=' + band + ' :: ' + push.slice(0, 200));

// rest and push are mutually exclusive
const both = await p.evaluate(() => {
  const w = weightModel(), tr = trainingModel(), c = cutTally(), r = restModel(w, tr);
  return { rest: r.fire, push: pushCall(w, tr, c, r).length > 0 };
});
ok('earned rest and step-it-up never fire together', !(both.rest && both.push), JSON.stringify(both));

// early in the block it stays quiet
await boot(st({ weights: { [back(1)]: 128.0, [back(0)]: 127.8 } }));
const early = await p.evaluate(() => {
  const w = weightModel(), tr = trainingModel(), c = cutTally();
  return { elapsed: c.elapsed, push: pushCall(w, tr, c, restModel(w, tr)) };
});
if (early.elapsed < 7) ok('silent in the first week', early.push === '', early.push.slice(0, 120));
else ok('first week check skipped', true, 'block already ' + early.elapsed + ' days in');

// a soft effort is called out by pace, with evidence
await boot(st({
  weights: wts,
  days: {
    [back(2)]: { runs: [{ type: 'threshold', km: 8, secs: 2600 }] },
    [back(5)]: { runs: [{ type: 'threshold', km: 8, secs: 2700 }] }
  }
}));
await startAt(back(28));
push = await p.textContent('#pushCard');
const se = await p.evaluate(() => softEfforts(14));
ok('soft efforts are counted', se.tot === 2 && se.soft === 2, JSON.stringify(se));
ok('and named with the pace line', /came in over the effort line of/.test(push), push.slice(0, 600));
ok('that is the literal version of going harder', /that is the literal version of going harder/i.test(push));

// a genuinely hard threshold run is not called soft
await boot(st({ days: { [back(2)]: { runs: [{ type: 'threshold', km: 5, secs: 1100 }] } } }));
await startAt(back(28));
const se2 = await p.evaluate(() => softEfforts(14));
ok('a real effort is not counted as soft', se2.tot === 1 && se2.soft === 0, JSON.stringify(se2));

// ================= the corrected records ===================================
await boot(st({}));
const r300 = await p.evaluate(() => ({ avg: BESTAVG[300], date: BAKED_DATE[300], rec: records()[300] }));
ok('300m best session average is 45.2', r300.avg === 45.2, String(r300.avg));
ok('and it is dated 11 August', r300.date === '2026-08-11', r300.date);
ok('the derived record agrees', Math.abs(r300.rec.t - 45.18) < 0.02 && r300.rec.date === '2026-08-11', JSON.stringify(r300.rec));

await p.click('[data-t="times"]');
t = await p.textContent('#stravaBest');
ok('the bests table shows 45.2', /45\.2 s/.test(t), (t.match(/300m[^|]{0,60}/) || [])[0]);
ok('and no longer shows 45.5 as the best', !/45\.5 s/.test(t));
ok('the correction is spelled out', /Listed as 45\.5 s from 12 May/i.test(await p.textContent('#timesNotes')),
  (await p.textContent('#timesNotes')).slice(0, 200));
ok('and the six target cards lead the tab', (await p.$$('.six .t')).length === 6);

// an achievement cannot be unlocked by a row from the history table
await p.click('[data-t="wins"]');
const speed = await p.evaluate(() => achList().filter(g => g.g === 'Speed')[0].items
  .filter(a => /Beat the 2026 best/.test(a.n)).map(a => ({ n: a.n, got: a.got })));
ok('no 2026-best achievement is unlocked before anything is logged',
  speed.every(a => !a.got), JSON.stringify(speed.filter(a => a.got)));

// but a real session inside the cut does unlock it
const cutStart = await p.evaluate(() => CFG.cutStart);
const inCutDay = TODAY >= cutStart ? TODAY : null;
if (inCutDay) {
  await boot(st({ days: { [inCutDay]: { runs: [{ k: 'reps', dm: 400, n: 4, secs: 240 }] } } }));
  const got = await p.evaluate(() => achList().filter(g => g.g === 'Speed')[0].items
    .filter(a => /Beat the 2026 best at 400m/.test(a.n))[0]);
  ok('a fast session inside the cut does unlock it', got.got === true, JSON.stringify(got));
  const rec400 = await p.evaluate(() => records()[400]);
  ok('and the record grid shows the logged one', rec400.src === 'logged' && Math.abs(rec400.t - 60) < 0.01, JSON.stringify(rec400));
} else {
  ok('in-cut unlock check skipped', true, 'today is before the cut start');
}

// ================= nothing regressed =======================================
await boot(st({ weights: wts, days: { [back(1)]: { gym: true, steps: 15000, sleep: 7.75, kcal: 1799 } } }));
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  const vis = await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50);
  ok('tab renders: ' + tab, vis);
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks .pill', els => els.map(e => e.textContent.trim()));
ok('every self-check passes', checks.every(c => c === 'ok'), checks.join(','));

ok('no page errors', errs.length === 0, errs.join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
