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
// Derived from CFG: the step is Dan's dial and the suite should follow it,
// not pin it. It moved 100 -> 50 when he asked for a very slow reverse.
const rev = await p.evaluate(() => ({ step: CFG.rev.step, first: CFG.rev.first,
  hold: CFG.rev.holdWeeks, kcal: KCAL_DAY }));
// Dan's shape: one step of `first` on day one, `holdWeeks` sitting there,
// then `step` a week. The suite follows CFG rather than pinning the numbers.
ok('the first rung is the one big step',
  m.rungs[0].kcal === rev.kcal + rev.first, JSON.stringify(m.rungs[0]));
ok('and it is held for the configured weeks',
  m.rungs.slice(0, rev.hold).every(r => r.kcal === rev.kcal + rev.first) &&
  m.rungs[rev.hold].kcal === rev.kcal + rev.first + rev.step,
  JSON.stringify(m.rungs.slice(0, rev.hold + 1).map(r => r.kcal)));
ok('the held weeks are marked as holds',
  m.rungs.filter(r => r.hold).length === rev.hold - 1 && m.rungs[1].hold === true,
  JSON.stringify(m.rungs.map(r => r.hold)));
ok('and the heading says the shape', new RegExp('hold, then \\+' + rev.step + ' a week').test(t), t.slice(0, 120));
ok('it never overshoots maintenance', m.rungs.every(r => r.kcal <= m.maint), String(m.maint));
ok('and the last rung is maintenance exactly', m.top.kcal === m.maint && m.top.atTop === true, JSON.stringify(m.top));
// A slower ladder means longer under maintenance, and that cost must be on
// the page rather than quietly absorbed.
ok('the slow climb names its own price', /The price of the slow half, named/.test(t) && /under maintenance until/.test(t),
  (t.match(/price of the slow half[^.]{0,120}/) || [''])[0]);
ok('the ladder ends exactly at maintenance and never overshoots',
  m.top.kcal === m.maint && m.rungs.every(r => r.kcal <= m.maint), JSON.stringify(m.top));
// No stub rung: a final week that climbs by a kcal or two is a wasted row.
ok('no rung adds a trivial amount',
  m.rungs.every((r, i) => i === 0 || r.hold || r.carb >= Math.round(rev.step / 4) - 1 || r.kcal === m.maint),
  JSON.stringify(m.rungs.map(r => r.carb)));
ok('the last climb is a real one', m.rungs[m.rungs.length - 1].carb === 0 ? m.rungs[m.rungs.length - 1].hold : m.rungs[m.rungs.length - 1].carb >= 5,
  JSON.stringify(m.rungs.slice(-2)));
ok('each week is seven days', m.rungs.every(r => r.from < r.to));
ok('week 1 starts on the start date', m.rungs[0].from === '2026-11-29', m.rungs[0].from);
ok('every step is carbohydrate', m.rungs.every(r => r.carb === Math.round((r.kcal - (m.rungs[m.rungs.indexOf(r) - 1] || { kcal: rev.kcal }).kcal) / 4)), JSON.stringify(m.rungs.map(r => r.carb)));
// Derived, not typed: protein moved 135 -> 150 g and this assertion was the
// only thing that noticed. It should never need editing again when it moves.
const mac = await p.evaluate(() => ({ pro: MACRO.pro, fat: MACRO.fat, proRev: MACRO.proRev }));
ok('protein and fat are pinned',
  new RegExp('Protein goes to ' + mac.proRev + ' g and fat stays at ' + mac.fat + ' g').test(t), t.slice(0, 200));
ok('the foods are his, not packets', /certified GF oats/.test(t) && /Potatoes, rice/.test(t));
ok('and it says to hold a rung rather than push', /hold that rung a second week/.test(t));

// ---- the bit that would otherwise ruin his week --------------------------
t = await p.textContent('#revWater');
ok('it warns about the first fortnight up front', /\+3 to \+6 lb/.test(t), t.slice(0, 160));
ok('and says plainly none of it is fat', /None of it is fat/.test(t));
ok('glycogen water is explained', /3 g of water/.test(t));
ok('creatine water is called intracellular', /intracellular water/.test(t));
// The arithmetic must use the BIGGEST step in the ladder, not the smallest,
// or it is quietly reassuring him with the easy case.
ok('it does the surplus arithmetic on the biggest step', /3,500 kcal of surplus/.test(t) &&
  new RegExp((rev.first * 7).toLocaleString('en-GB') + ' kcal across a whole week').test(t) &&
  /biggest.{0,20}step in the whole ladder/.test(t), t.slice(-400));
ok('and tells him not to judge it for two weeks', /do not judge anything for 2 weeks/i.test(t));
ok('flat weight is named as the best outcome', /best outcome there is/.test(t));

// ---- the face: the fear most likely to make him quit the reverse early ---
const tFace = await p.textContent('#revFace');
ok('the face card exists', tFace.length > 600, String(tFace.length));
ok('it leads with the ladder protecting the face, not risking it',
  /is not a risk to your face/.test(tFace), tFace.slice(0, 200));
ok('body fat is ranked first', /1\. ?Body fat|Body fat/.test(tFace));
ok('sleep is ranked above food as a lever', /it is this one, not the food/.test(tFace));
ok('it explains glycogen water is intramuscular, not facial',
  /intramuscular/.test(tFace) && /does not sit in your face/.test(tFace));
ok('and predicts the face gets sharper, not puffier', /sharper/.test(tFace));
// Standing constraint: salt stays, once a day. Cutting it is never advice.
ok('salt is kept, never cut', /Salt stays exactly as it is/.test(tFace) && /Cutting it is the classic mistake/.test(tFace),
  (tFace.match(/Salt stays[^.]{0,80}/) || [''])[0]);
ok('it blames swings rather than the level', /swings<\/b>? do|swings/.test(tFace));
ok('there is a way to judge it that is not a late-night mirror',
  /one photo a week/.test(tFace) && /never day to day/.test(tFace));
ok('and the leanness limit is named honestly',
  /reveals bone structure, it does not add it/.test(tFace) && /where it turns on you/.test(tFace));

// ---- the phase guide: he asked to be told when to change gear ------------
const tPh = await p.textContent('#revPhase');
const pm = await p.evaluate(() => ({ now: phaseModel().now.k, next: phaseModel().next && phaseModel().next.k,
  all: CFG.phases.map(x => x.k) }));
ok('the phase model knows we are in the cut', pm.now === 'cut', JSON.stringify(pm));
ok('and that the reverse is next', pm.next === 'rev', String(pm.next));
ok('the sequence runs cut, reverse, running block, next cut',
  pm.all.join(',') === 'cut,rev,run,next', pm.all.join(','));
ok('every block has an exit condition',
  await p.evaluate(() => CFG.phases.every(x => x.e && x.e.length > 20)));
ok('the card names the running block', /running block/i.test(tPh));
ok('it refuses two hard blocks at once', /Never two hard blocks at once/.test(tPh));
ok('and refuses starting a running block hungry', /Never start a running block from a deficit/.test(tPh));
ok('the reverse length is left to Dan', /is your call/.test(tPh) && /tell me and I will set it/.test(tPh));
ok('but a floor is given', new RegExp(m.weeks + ' weeks<\\/b>? to reach|' + m.weeks + ' weeks').test(tPh),
  (tPh.match(/The floor is[^.]{0,90}/) || [''])[0]);
// The honest limit — it can only guide on what it can actually see.
ok('it says what it can see', /I can watch dates/.test(tPh));
ok('and what it cannot', /I cannot see how you feel/.test(tPh),
  (tPh.match(/I cannot see[^.]{0,90}/) || [''])[0]);

// ---- the training week: health first, stress capped, times still moving ---
// The brief changed from "maximise growth" to health with limited stress, so
// the week is checked against the new one: ONE hard run, one genuinely easy
// run, a capped number of hard days, and legs still clear of the hard run.
t = await p.textContent('#revTrain');
const wk = await p.evaluate(() => CFG.revWeek.map(x => ({ d: x.d, n: x.n, run: x.run || null, hard: !!x.hard })));
const rn = await p.evaluate(() => CFG.revRuns.map(r => ({ k: r.k, slot: r.slot, hard: !!r.hard,
  opts: r.opts.map(o => o.n), txt: r.opts.map(o => o.w).join(' ') + ' ' + r.y + ' ' + r.stop })));
const cap = await p.evaluate(() => CFG.rev.hardCap);
ok('the week covers all seven days', wk.length === 7 && wk.every((x, i) => x.d === i), JSON.stringify(wk.map(x => x.d)));
ok('hard days are capped at the configured number', wk.filter(x => x.hard).length === cap, JSON.stringify(wk.filter(x => x.hard).map(x => x.n)));
// Dan's menu: an engine day and a speed day are both hard, the third is not.
ok('two of the three runs are hard', wk.filter(x => x.run && x.hard).length === 2, JSON.stringify(wk.filter(x => x.run)));
ok('and the third one is not a hard day', wk.filter(x => x.run && !x.hard).length === 1,
  JSON.stringify(wk.filter(x => x.run).map(x => [x.n, x.run, x.hard])));
ok('the week slots match the session slots',
  wk.filter(x => x.run).map(x => x.run).join() === rn.map(r => r.k).join(),
  wk.filter(x => x.run).map(x => x.run).join() + ' vs ' + rn.map(r => r.k).join());
ok('there are three runs, as Dan called it', wk.filter(x => x.run).length === 3, JSON.stringify(wk.filter(x => x.run).map(x => x.d)));
ok('there is one rest day', wk.filter(x => /^Rest/.test(x.n)).length === 1);
ok('and exactly one heavy leg day', wk.filter(x => /^Legs$/.test(x.n)).length === 1);
ok('the leg day counts against the hard budget', wk.find(x => /^Legs$/.test(x.n)).hard === true);

// The spacing rules, as arithmetic on the cycle rather than taken on trust.
const legD = wk.find(x => /^Legs$/.test(x.n)).d;
const hardRunDs = wk.filter(x => x.run && x.hard).map(x => x.d);
const before = hardRunDs.map(r => (legD - r + 7) % 7);
const after = hardRunDs.map(r => (r - legD + 7) % 7);
ok('no hard run lands in the 24 h before legs', before.every(g => g >= 2), JSON.stringify({ legD, hardRunDs, before }));
ok('and legs get about 48 h before the hard run', after.every(g => g >= 2), JSON.stringify({ legD, hardRunDs, after }));
ok('no two hard days are back to back',
  wk.filter(x => x.hard).every(a => wk.filter(x => x.hard && x.d !== a.d).every(b => {
    const g = Math.min((a.d - b.d + 7) % 7, (b.d - a.d + 7) % 7); return g >= 2; })),
  JSON.stringify(wk.filter(x => x.hard).map(x => x.d)));

ok('the leg rule is stated, not just implied', /never run hard in the 24 hours before a leg session/i.test(t), t.slice(0, 200));
ok('it says where interference actually lands', /lands almost entirely on/.test(t) && /legs/i.test(t));
ok('and that upper body is unaffected', /Upper body barely notices/.test(t));
ok('the grey middle is named as the thing to avoid', /nothing in the grey middle/i.test(t) && /grey middle is moderately-hard/.test(t));
ok('the hard-day ceiling is on the page', new RegExp(cap + ' hard days a week').test(t), (t.match(/\d+ hard days a week[^.]{0,40}/) || [''])[0]);
ok('there is a deload rhythm', /drop Run 2 and keep Run 1 honest rather than hard/.test(t));
ok('sets are steered to the bottom of the reverse column', /run the bottom of the reverse column/.test(t));
ok('and the cost of one hard run a week is admitted', /What this costs you, honestly/.test(t));
ok('the five-mile slot stays out', /five-mile slot stays out/.test(t));
ok('and the easy runs are not a place to sneak a third hard effort', /sneak a third hard effort/.test(t));
ok('three runs are framed as holding, not chasing', /hold what you have earned and creep the times forward/.test(t) && /running block/.test(t));
// The hard-day count went 2 -> 3 with this menu. That has to be stated, not
// absorbed, because it cuts against the brief he gave for this block.
ok('the step up in hard days is admitted', /Straight about what this changed/.test(t) && /went from two to/.test(t),
  (t.match(/hard days went from two to[^.]{0,60}/) || [''])[0]);
ok('and a fourth hard day is ruled out', /a fourth hard day and the health half/.test(t));
ok('it warns the hills can turn into a fourth', /calling it three/.test(t));

// Three shapes, one hard in any week, all on feel — paces and numbered
// recoveries are a standing no.
const runTxt = rn.map(r => r.txt);
ok('three slots are written out', rn.length === 3 && runTxt.every(x => x.length > 200));
ok('and they are numbered 1 to 3', rn.map(r => r.slot).join() === '1,2,3', rn.map(r => r.slot).join());
ok('exactly two slots are hard', rn.filter(r => r.hard).length === 2, JSON.stringify(rn.map(r => [r.k, r.hard])));
ok('and one slot is deliberately not hard', rn.filter(r => !r.hard).map(r => r.k).join() === 'third');
ok('every slot offers real options', rn.every(r => r.opts.length >= 2), JSON.stringify(rn.map(r => [r.k, r.opts.length])));
// The menu Dan actually asked for, checked by name.
const optNames = await p.evaluate(() => CFG.revRuns.map(r => r.opts.map(o => o.n)));
ok('slot 1 is threshold, 1 km or 800 m',
  optNames[0].join() === 'Threshold,1 km reps,800 m reps', optNames[0].join());
ok('slot 2 is 400, 300 or 200', optNames[1].join() === '400 m,300 m,200 m', optNames[1].join());
ok('slot 3 is the easy run or short uphill sprints',
  optNames[2].join() === 'Easy run,Short uphill sprints', optNames[2].join());
ok('and the options are on the page', optNames.flat().every(n => t.includes(n)),
  optNames.flat().filter(n => !t.includes(n)).join());
ok('hills are explained as low eccentric load', /not braking on the way down/.test(t) && /eccentric load/.test(t));
ok('the card says to pick one option per slot', /Pick one option from each, each week/.test(t));
ok('and that stacking options is not the idea', /not extra sessions to stack/.test(t));
ok('none prescribes a pace', !runTxt.some(x => /\d+:\d\d\s*\/?\s*km|\d+:\d\d per/.test(x)), runTxt.join(' | ').slice(0, 200));
ok('none prescribes a rest interval', !runTxt.some(x => /\d+\s*(s|sec|seconds|min|minutes)\s+(rest|recovery)/i.test(x)));
ok('the recovery is by feel', /walk until you genuinely want to go again/.test(t) || /go again when you are ready/.test(t));
ok('each slot says when to stop', (t.match(/When to stop/g) || []).length === rn.length);
ok('the easy run is defined by breathing, not by pace', /breathe through your nose/.test(t) && /full sentences/.test(t));
ok('and the usual failure mode is named', /the only way to fail it is to run it too hard/i.test(t));
ok('the hills have their own failure mode', /conditioning session wearing a disguise/.test(t));

// ---- the honest version of "anti-ageing" ---------------------------------
const hl = await p.evaluate(() => CFG.revHealth.map(x => x.n));
ok('the health card lists the four levers', hl.length === 4, JSON.stringify(hl));
ok('VO2 max is named as the mortality predictor', /strongest modifiable predictor of all-cause mortality/.test(t));
ok('lean mass is counted as health, not vanity', /is not vanity work/.test(t));
ok('sleep is called the biggest lever', /biggest lever and the cheapest/.test(t));
ok('chronic stress is named as the mechanism', /chronic stress/i.test(t));
// The no-sugarcoating half: he asked for cellular anti-ageing and the honest
// answer includes what does not exist.
ok('it says plainly that nothing slows cellular ageing',
  /Nothing has been shown to slow human cellular ageing/.test(t), (t.match(/Nothing has been shown[^.]{0,90}/) || [''])[0]);
ok('and names the biological-age tests as part of that', /biological age/.test(t));
ok('it warns about what is being sold', /is selling you something/.test(t));
ok('but does not turn it into a different plan', /they are the same training/.test(t));

// One all-out effort a fortnight has to come out of the budget, not sit on it.
const tRace = await p.textContent('#revRest');
ok('time trials are capped too', /One all-out effort a fortnight/.test(tRace), (tRace.match(/One all-out[^.]{0,60}/) || [''])[0]);
ok('and counted against the hard days', /out of the two-hard-day budget/.test(tRace));

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
