import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2200 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d); };
const TODAY = back(0);
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(150); };
const shift = (iso) => p.evaluate(s2 => {
  CFG.cutStart = s2; CUT_DAYS = diffD(CFG.cutStart, CFG.cutEnd) + 1;
  WEIGH_START = mondayOnOrAfter(CFG.cutStart);
  W_WEEKS = Math.ceil((diffD(WEIGH_START, CFG.cutEnd) + 1) / 7);
  PRE_END = addD(WEIGH_START, -1); PRE_DAYS = diffD(CFG.cutStart, WEIGH_START);
  render(); return { elapsed: cutTally().elapsed, week: weekOf(today()) };
}, iso);

// ===================== the arithmetic ======================================
await boot(st({ weights: { [TODAY]: 128.0 },
  days: { [TODAY]: { steps: 15000, kcal: 1799, gym: true, runs: [{ type: 'easy', km: 8.0, secs: 2400 }] } } }));
let x = await p.evaluate(t => tdeeFor(t), TODAY);

ok('age is derived, not hard-coded', x.age === 25, JSON.stringify({ age: x.age, dob: '2000-11-28' }));
ok('weight comes off the day itself', Math.abs(x.lb - 128) < 0.001 && Math.abs(x.kg - 58.06) < 0.02, JSON.stringify({ lb: x.lb, kg: x.kg }));
// Mifflin-St Jeor, male: 10kg + 6.25cm - 5age + 5
const wantBmr = 10 * 58.0600 + 6.25 * 172.7 - 5 * 25 + 5;
ok('resting rate is Mifflin-St Jeor', Math.abs(x.bmr - wantBmr) < 2, x.bmr.toFixed(1) + ' vs ' + wantBmr.toFixed(1));
ok('TEF is 10% of what was eaten', Math.abs(x.tef - 179.9) < 0.5, String(x.tef));
ok('running is 1 kcal per kg per km', Math.abs(x.runKcal - 8 * 58.06) < 1, String(x.runKcal));
ok('gym is 3.5 METs net for an hour', Math.abs(x.gymKcal - 3.5 * 58.06) < 1, String(x.gymKcal));

// the double-count: an 8 km run is ~7,000 of the day's steps
ok('run steps are estimated', Math.abs(x.runSteps - 6957) < 20, String(x.runSteps));
ok('and taken out of the walking total', x.walkSteps === 15000 - x.runSteps, JSON.stringify({ steps: x.steps, walk: x.walkSteps, run: x.runSteps }));
ok('so the run is not counted twice', Math.abs(x.walkKcal - x.walkSteps / 1000 * 0.375 * 58.06) < 1, String(x.walkKcal));
const naive = 15000 / 1000 * 0.375 * 58.06 + 8 * 58.06;
ok('which is materially less than double counting', x.walkKcal + x.runKcal < naive - 140,
  (x.walkKcal + x.runKcal).toFixed(0) + ' vs naive ' + naive.toFixed(0));

ok('the total is the sum of its parts',
  Math.abs(x.total - (x.bmr + x.tef + x.walkKcal + x.runKcal + x.gymKcal)) < 0.01, String(x.total));
ok('the deficit is burn minus eaten', Math.abs(x.deficit - (x.total - 1799)) < 0.01, String(x.deficit));
ok('and a hard day really is a big deficit', x.deficit > 500 && x.deficit < 1100, String(Math.round(x.deficit)));

// a rest day
await boot(st({ weights: { [TODAY]: 128.0 }, days: { [TODAY]: { steps: 9000, kcal: 1799 } } }));
let r = await p.evaluate(t => tdeeFor(t), TODAY);
ok('a rest day burns far less', r.total < x.total - 550, Math.round(r.total) + ' vs ' + Math.round(x.total));
ok('but is still a deficit', r.deficit > 0, String(Math.round(r.deficit)));
ok('walking on a rest day is all of the steps', r.walkSteps === 9000 && r.runSteps === 0, JSON.stringify(r.walkSteps));

// honesty about unlogged inputs
await boot(st({ weights: { [TODAY]: 128.0 }, days: {} }));
let u = await p.evaluate(t => tdeeFor(t), TODAY);
ok('with nothing logged, steps are unknown not zero', u.steps === null && u.walkKcal === null, JSON.stringify({ s: u.steps, w: u.walkKcal }));
ok('and intake falls back to the target, flagged', u.intakeKnown === false && u.against === 1799, JSON.stringify(u.against));
ok('the card says walking is missing', /No step count on today yet/.test(await p.textContent('#tdeeCard')),
  (await p.textContent('#tdeeCard')).slice(0, 220));
ok('and says roughly what it would add', /it will rise by roughly/.test(await p.textContent('#tdeeCard')));

// ===================== the day card ========================================
await boot(st({ weights: { [TODAY]: 128.0 },
  days: { [TODAY]: { steps: 15000, kcal: 1799, gym: true, runs: [{ type: 'easy', km: 8.0, secs: 2400 }] } } }));
let t = await p.textContent('#tdeeCard');
ok('Today shows what he burns', /burning today/i.test(t), t.slice(0, 160));
ok('and the deficit for the day', /deficit today/i.test(t));
ok('with a minus sign on a deficit', /−[\d,]+/.test(t), (t.match(/−[\d,]+/g) || []).join(','));
ok('and the week so far', /this week so far|pre-block so far/i.test(t));
ok('it points at the full breakdown', /Full breakdown on the/.test(t));

// ===================== the Food breakdown ==================================
await p.click('[data-t="food"]');
t = await p.textContent('#foodTdee');
['Resting (Mifflin-St Jeor)', 'Digesting the food', 'Walking', 'Running', 'Gym', 'TDEE today', 'Deficit'].forEach(k =>
  ok('breakdown row: ' + k, t.indexOf(k) >= 0));
ok('it shows the run steps being subtracted', /minus about [\d,]+ taken during the run/.test(t), t.slice(0, 500));
ok('the week table totals', /Total/.test(t) && /week deficit/i.test(t));
ok('per-day average is given', /per day/i.test(t));
ok('and the pounds it equals', /at 3,500 kcal a pound/.test(t));

// the honesty section
ok('it says the resting rate is ±10%', /Resting rate: ±10%/.test(t));
ok('and that watches overstate steps', /routinely claim double that/.test(t));
ok('and that lifting is not a calorie burn', /not the calorie burn people think/.test(t));
ok('and that none of it is a ceiling', /Nothing here is a ceiling to eat to/.test(t));

// ===================== the model against the scale =========================
ok('with no measured rate it says so', /needs two full 7-day weight windows/.test(t), t.slice(-400));

// now give it a real measured rate: ~0.13 lb/day, inside the band
const wts = {}, days = {};
for (let i = 0; i < 30; i++) {
  const d = back(29 - i);
  wts[d] = +(129 - i * 0.13).toFixed(1);
  days[d] = { steps: 12800, kcal: 1799 };
}
await boot(st({ weights: wts, days: days }));
await shift(back(34));
const ck = await p.evaluate(() => tdeeCheck());
ok('the check appears once there is a measured rate', ck !== null, JSON.stringify(ck));
ok('measured comes from the scale', Math.abs(ck.measuredLbWk - 0.91) < 0.25, JSON.stringify({ m: ck.measuredLbWk }));
ok('modelled comes from the day model', ck.modelled > 0, String(Math.round(ck.modelled)));
ok('the gap is the difference', Math.abs(ck.diff - (ck.modelled - ck.measured)) < 0.01);
await p.click('[data-t="food"]');
t = await p.textContent('#foodTdee');
ok('it says the scale wins where they disagree', /the scale is right/.test(t), t.slice(t.indexOf('Does this estimate'), t.indexOf('Does this estimate') + 400));
ok('and names why the formula can be out', /population formula/.test(t));
if (ck.off) {
  ok('a big gap is explained in both directions',
    /under-counted|burning more than the averages/.test(t), t.slice(t.indexOf('scale is right'), t.indexOf('scale is right') + 500));
} else {
  ok('a small gap is called close enough', /as good as it gets/.test(t));
}

// ===================== steps on Wins =======================================
await p.click('[data-t="wins"]');
const wins = await p.textContent('#s-wins');
ok('Wins now carries the step average', /Steps, daily average/.test(wins), wins.slice(0, 400));
ok('against the 12,800 target', /12,800/.test(wins));
ok('with how many days are logged', /days logged/.test(wins));
ok('and the running total', /all in/.test(wins));
ok('it still counts the sessions', /Gym sessions/.test(wins) && /Hard runs/.test(wins));

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
