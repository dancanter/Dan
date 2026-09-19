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
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.click('[data-t="reverse"]'); };

// ---- before it starts, it says when and why ------------------------------
await boot(st({}));
let t = await p.textContent('#revTop');
ok('the tab exists and renders', t.length > 200, String(t.length));
ok('it names the start date', /Sunday 29 November/.test(t), t.slice(0, 160));
ok('and counts the days', /\d+ days? away/.test(t), (t.match(/\d+ days? away/) || [])[0]);
ok('it says this is where the times come from', /Sub-55 and sub-17 do not happen on a deficit/.test(t));
let m = await p.evaluate(() => reverseModel());
ok('starts the day after the cut ends', m.start === '2026-11-29', m.start);
ok('before it starts, it is not live', m.live === false);
ok('with no data it falls back to the plan', m.est.from === 'planned', m.est.from);
ok('and says so rather than pretending', /Sized off the taper for now/.test(t) && /Do not write these figures down yet/.test(t));

// ---- with real weights, maintenance is measured, not guessed -------------
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d); };
const shift = (iso) => p.evaluate(s2 => {
  CFG.cutStart = s2; CUT_DAYS = diffD(CFG.cutStart, CFG.cutEnd) + 1;
  WEIGH_START = mondayOnOrAfter(CFG.cutStart);
  W_WEEKS = Math.ceil((diffD(WEIGH_START, CFG.cutEnd) + 1) / 7);
  PRE_END = addD(WEIGH_START, -1); PRE_DAYS = diffD(CFG.cutStart, WEIGH_START);
  render(); return { elapsed: cutTally().elapsed, week: weekOf(today()) };
}, iso);

// 40 mornings ending today, dropping ~0.75 lb/wk, with the block moved back so
// they all fall inside the cut. Nothing may be dated after today.
const wts = {};
for (let i = 0; i < 40; i++) wts[back(39 - i)] = +(128.4 - i * 0.107).toFixed(1);
await boot(st({ weights: wts }));
await shift(back(44));
m = await p.evaluate(() => reverseModel());
t = await p.textContent('#revTop');
ok('with a fortnight of mornings it measures the deficit', m.est.from === 'measured', JSON.stringify(m.est));
ok('the measured loss is about 0.75 lb a week', Math.abs(m.est.lbWk - 0.75) < 0.12, JSON.stringify(m.est));
ok('which is a deficit of roughly 375 kcal', Math.abs(m.est.deficit - 375) < 60, String(Math.round(m.est.deficit)));
ok('so maintenance lands near 2,175', Math.abs(m.maint - 2175) < 70, String(m.maint));
ok('maintenance is above the cut number', m.maint > 1799, String(m.maint));
ok('it shows the working rather than a formula', /is not from a formula/.test(t) && /3,500 kcal a pound/.test(t), t.slice(-320));
ok('and warns the number will move', /more accurate every morning/.test(t));

// ---- the ladder ----------------------------------------------------------
t = await p.textContent('#revLadder');
ok('the ladder climbs 100 a week', m.rungs[0].kcal === 1899 && m.rungs[1].kcal === 1999, JSON.stringify(m.rungs.slice(0, 2)));
ok('it never overshoots maintenance', m.rungs.every(r => r.kcal <= m.maint), String(m.maint));
ok('and the last rung is maintenance exactly', m.top.kcal === m.maint && m.top.atTop === true, JSON.stringify(m.top));
ok('the number of rungs matches the climb', m.weeks === Math.ceil((m.maint - 1799) / 100), m.weeks + ' vs ' + Math.ceil((m.maint - 1799) / 100));
ok('each week is seven days', m.rungs.every(r => r.from < r.to));
ok('week 1 starts on the start date', m.rungs[0].from === '2026-11-29', m.rungs[0].from);
ok('every step is carbohydrate', m.rungs.every(r => r.carb === 25), JSON.stringify(m.rungs.map(r => r.carb)));
ok('protein and fat are pinned', /Protein stays at 135 g and fat stays at 42 g/.test(t), t.slice(0, 200));
ok('the foods are his, not packets', /certified GF oats/.test(t) && /Potatoes, rice/.test(t));
ok('and it says to hold a rung rather than push', /hold that rung a second week/.test(t));

// ---- the bit that would otherwise ruin his week --------------------------
t = await p.textContent('#revWater');
ok('it warns about the first fortnight up front', /\+3 to \+6 lb/.test(t), t.slice(0, 160));
ok('and says plainly none of it is fat', /None of it is fat/.test(t));
ok('glycogen water is explained', /3 g of water/.test(t));
ok('creatine water is called intracellular', /intracellular water/.test(t));
ok('it does the surplus arithmetic', /3,500 kcal of surplus/.test(t) && /700 kcal across a whole week/.test(t), t.slice(-400));
ok('and tells him not to judge it for two weeks', /do not judge anything for 2 weeks/i.test(t));
ok('flat weight is named as the best outcome', /best outcome there is/.test(t));

// ---- creatine, steps, and when to race -----------------------------------
t = await p.textContent('#revRest');
ok('creatine is 5 g with no loading', /5 g of creatine monohydrate a day/.test(t) && /No loading phase/.test(t));
ok('and it must be certified gluten-free', /certified gluten-free/.test(t));
ok('steps come down on the reverse', /8,000–10,000 is plenty/.test(t));
ok('the 400 is attempted first', /The 400 first/.test(t));
ok('and the 5 km last', /The 5 km.*goes last|5 km/.test(t));
ok('nothing is a test in week one', /nothing is a test/.test(t));

// ---- it is not offering a reverse mid-cut --------------------------------
ok('the ladder is dated after the cut ends', m.rungs[0].from > '2026-11-28', m.rungs[0].from);
ok('and nothing is marked as this week yet', m.cur === 0, String(m.cur));

// ---- earned rest now carries the refeed size -----------------------------
// 0.13 lb/day is ~0.71%/wk: inside the safe band, but faster than the 0.6%
// taper, so he drifts under the curve and is genuinely ahead without the
// "too fast" branch taking over. Week 4 and 8 are deloads, which return early
// from restModel, so the block is moved back far enough to clear them.
const fast = {}; for (let i = 0; i < 40; i++) fast[back(39 - i)] = +(129 - i * 0.13).toFixed(1);
const days = {};
for (let i = 0; i < 38; i++) {
  const d = back(i);
  days[d] = { gym: true };
  if (i % 2 === 0) days[d].runs = [{ k: 'reps', dm: 400, n: 4, secs: 260 }];
}
await boot(st({ weights: fast, days: days }));
const where = await shift(back(44));
ok('the rest fixture is not sitting in a deload week', [4, 8].indexOf(where.week) < 0, JSON.stringify(where));
const state = await p.evaluate(() => {
  const w = weightModel(), tr = trainingModel();
  const r = restModel(w, tr), ah = aheadEnough(w, tr);
  return { fire: r.fire, tooFast: r.tooFast, ahOk: ah.ok, band: w.band };
});
const restTxt = await p.textContent('#restCard');
ok('earned rest fires when he is ahead', state.fire === true, JSON.stringify(state));
if (state.ahOk) {
  ok('and it says the refeed is earned, right there', /you have earned a refeed/i.test(restTxt) || /eat more on them/i.test(restTxt),
    restTxt.slice(0, 300));
  ok('with the actual number of calories', /Eat \+[\d,]+ kcal/.test(restTxt), (restTxt.match(/Eat \+[^.]*/) || [])[0]);
  ok('and the grams of carbohydrate', /about \d+ g/.test(restTxt), (restTxt.match(/about \d+ g/) || [])[0]);
  ok('and what the day totals', /for the day/.test(restTxt));
} else {
  ok('or says exactly why it is not a refeed day', /Not a refeed day/.test(restTxt), restTxt.slice(0, 300));
}
ok('rest never says eat less', !/eat less/.test(restTxt.replace(/not a day to eat less/g, '')), restTxt.slice(0, 200));

// ---- nothing else broke --------------------------------------------------
await boot(st({ weights: wts }));
await shift(back(44));
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
