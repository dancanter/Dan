import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const sq = s => s.replace(/\s+/g, ' ');
// A page with its clock pinned, so week-dependent plans can be checked on any date.
const at = async (when) => {
  const ctx = await b.newContext({ viewport: { width: 430, height: 2400 } });
  if (when) await ctx.clock.setFixedTime(new Date(when + 'T12:00:00'));
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  const boot = async (s) => { await p.goto(FILE);
    await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
    await p.reload(); await p.waitForTimeout(220); };
  return { ctx, p, boot };
};

// ===== block targets and the deload weeks =====
let { ctx, p, boot } = await at('2026-10-14');   // week 4, a deload
await boot(st());
const T = await p.evaluate(() => ({ g: CFG.goals, w4: tmplFor(addD(WEIGH_START, 21)), w3: tmplFor(addD(WEIGH_START, 14)), w8: tmplFor(addD(WEIGH_START, 49)),
  sum: (() => { let h = 0, s = 0; for (let k = 1; k <= W_WEEKS; k++) { const t = tmplFor(addD(WEIGH_START, (k - 1) * 7)); h += t.hard; s += t.sprints; } return { h, s }; })() }));
ok('a deload week is 1 hard + sprints = 2 runs', T.w4.hard === 1 && T.w4.runs === 2 && T.w4.deload && T.w8.hard === 1, JSON.stringify(T.w4));
ok('a normal week is 2 hard + sprints = 3 runs', T.w3.hard === 2 && T.w3.runs === 3 && !T.w3.deload);
ok('the block hard-run goal is the weeks added up, plus the pre-block one', T.g.hard === T.sum.h + 1, JSON.stringify(T));
ok('the sprint goal is one a week', T.g.sprints === T.sum.s);
ok('runs = hard + sprints', T.g.runs === T.g.hard + T.g.sprints);
// the week card and the review follow the deload target
await boot(st({ days: { '2026-10-12': { runs: [{ k: 'reps', dm: 200, n: 6, secs: 180 }] } } }));
await p.click('[data-t="training"]');
let t = sq(await p.innerText('#tWeek'));
ok('in a deload week one hard run is done', /Hard runs 1 \/ 1 done/i.test(t), t.slice(0, 300));
ok('and the week says deload', /deload/i.test(t));
const owes = await p.evaluate(() => weekOwes(trainingModel()).map(o => o.k));
ok('a deload week does not ask for a second hard run', !owes.includes('hard'), JSON.stringify(owes));
// the runs card in a deload: one hard slot, the short one
t = sq(await p.innerText('#tRuns'));
ok('the runs card names the deload', /week 4 · deload/i.test(t), t.slice(0, 200));
ok('a deload has no long-rep session', !/long reps/.test(t) && /short speed/.test(t));
ok('and says 2 runs', /2 runs: 1 hard \+ 1 uphill sprints/.test(t));
await ctx.close();

// ===== the weekly runs card: which runs, how many, never which day =====
({ ctx, p, boot } = await at('2026-09-30'));   // week 2, Wednesday
await boot(st({ days: { '2026-09-28': { runs: [{ k: 'reps', dm: 300, n: 6, secs: 300, rpe: 7 }] } } }));
await p.click('[data-t="today"]');
t = sq(await p.innerText('#runsCard'));
ok('Today shows this week’s runs', /THIS WEEK’S RUNS · WEEK 2/i.test(t), t.slice(0, 200));
ok('3 runs: 2 hard + 1 uphill sprints', /3 runs: 2 hard \+ 1 uphill sprints/.test(t));
ok('week 2 is 4 × 1 km and 6 × 300 m', /4 × 1 km/.test(t) && /6 × 300 m/.test(t));
ok('with sprints to count', /8 × about 100 m uphill/.test(t));
ok('no days of the week are named', !/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/.test(t));
ok('no rest times, and no per-km paces', !/\/km|min rest|seconds? rest|recover(y)? of \d/.test(t));
ok('rep guides are wide ranges from his best session: 1 km 3:13–3:24', /Guide: 3:13–3:24 a rep \(best 1 km session 3:13\)/.test(t), (t.match(/Guide[^B]*/g) || []).join(' | '));
ok('300s: 45–48 s', /Guide: 45–48 s a rep/.test(t));
ok('and effort overrides the watch', /Effort overrides the watch/.test(t));
let M = await p.evaluate(() => weekRunsModel());
ok('a 300 m session ticks the short-speed slot, not long reps', M.shortDone && !M.longDone, JSON.stringify(M));
ok('the rule for not getting ahead is there', /Move up only if last week’s version felt controlled/.test(t));
ok('and the low-stress rule for a deficit', /one or two more reps in you/.test(t) && /fatigue a deficit cannot pay back/.test(t));
ok('no long session is more than 5 km of reps', await p.evaluate(() => CUT_RUNS.filter(Boolean).every(w => { const m = /(\d+) × (\d+) (k?m)/.exec(w.long || ''); return !m || (+m[1]) * (+m[2]) * (m[3] === 'km' ? 1000 : 1) <= 5000; })));
// a stress flag cuts the week to one hard run, the short one
await boot(st({ days: { '2026-09-30': { niggle: true, niggleWhat: 'calf' } } }));
M = await p.evaluate(() => weekRunsModel());
t = sq(await p.innerText('#runsCard'));
ok('a stress flag drops the week to one hard run', M.easeOff && !M.P.long && /2 runs: 1 hard \+ 1 uphill sprints/.test(t) && /one hard run/.test(t) && /Rest what hurts/.test(t), t.slice(0, 400));
ok('with no long-rep session that week', !/Hard · long reps/.test(t));
// last week's hard runs felt like a 9: repeat, don't move up
await boot(st({ days: { '2026-09-23': { runs: [{ k: 'reps', dm: 200, n: 5, secs: 150, rpe: 9 }] } } }));
M = await p.evaluate(() => weekRunsModel());
t = sq(await p.innerText('#runsCard'));
ok('a 9 last week means repeat last week’s sessions', M.repeat && /repeat last week’s sessions/.test(t) && /5 × 800 m/.test(t), t.slice(0, 400));
// a long session ticks long reps
await boot(st({ days: { '2026-09-28': { runs: [{ k: 'reps', dm: 1000, n: 5, secs: 900 }] } } }));
M = await p.evaluate(() => weekRunsModel());
ok('1 km reps tick the long-rep slot', M.longDone && !M.shortDone, JSON.stringify(M));
// the guide moves when he logs a faster session: 5 × 1 km at 3:00 a rep
t = sq(await p.innerText('#runsCard'));
ok('a faster logged session moves the guide: 3:00–3:11', /Guide: 3:00–3:11 a rep \(best 1 km session 3:00\)/.test(t), (t.match(/Guide[^B]*/g) || []).join(' | '));
// uphill reps never move it
await boot(st({ days: { '2026-09-28': { runs: [{ k: 'reps', dm: 1000, n: 5, secs: 800, up: true }] } } }));
ok('an uphill session does not move the guide', /Guide: 3:13–3:24 a rep/.test(sq(await p.innerText('#runsCard'))));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-21'));   // week 5, tests
await boot(st());
t = sq(await p.evaluate(() => weekRunsHTML()));
ok('week 5 is a test week with a 400 and a 1 km trial', /test week/.test(t) && /Time trial — 400 m/.test(t) && /Time trial — 1 km/.test(t));
ok('and the test only if the week is clear', /only if the week is clear/.test(t));
t = t.replace(/<[^>]+>/g, '');
ok('time trials get ±2% of the best: 400 m 58–60 s', /400m 58–60 s \(best 59\.0 s\)/.test(t), (t.match(/Guide[^B]*/g) || []).join(' | '));
ok('and 1 km 2:56–3:04', /1 km 2:56–3:04 \(best 3:00\)/.test(t));
await ctx.close();

// ===== healthy foods: tap, add up, say what it did =====
({ ctx, p, boot } = await at(null));
await boot(st());
await p.click('[data-t="today"]');
const tap = async (k, n) => { for (let i = 0; i < n; i++) { await p.click(`#hfPanel button[data-hf="${k}"][data-by="1"]`); await p.waitForTimeout(40); } };
await tap('egg', 3); await tap('oily', 1); await tap('brazil', 2); await tap('kiwi', 2);
let hf = await p.evaluate(() => S.days[today()].hf);
ok('taps are saved per day', hf.egg === 3 && hf.oily === 1 && hf.brazil === 2 && hf.kiwi === 2, JSON.stringify(hf));
await p.click('#hfPanel button[data-hf="egg"][data-by="-1"]');
hf = await p.evaluate(() => S.days[today()].hf);
ok('minus takes one off', hf.egg === 2);
ok('the kcal is left alone', await p.evaluate(() => S.days[today()].kcal === undefined));
t = sq(await p.innerText('#hfPanel'));
ok('it counts different healthy foods today', /4 different healthy foods today/.test(t), t.slice(0, 200));
ok('the week adds up with targets', /Eggs 2 \/ 10/.test(t) && /Oily fish 1 \/ 3/.test(t));
await tap('eggm', 2);
t = sq(await p.innerText('#hfPanel'));
ok('medium eggs count toward the same eggs target', /Eggs 4 \/ 10 2 large, 2 medium/.test(t), (t.match(/This week.{0,120}/) || [''])[0]);
ok('both egg tiles show the shared weekly count', (t.match(/4\/10 wk/g) || []).length === 2);
ok('a medium egg is about 85% of a large one', await p.evaluate(() => { const L = hfById('egg'), M = hfById('eggm'); return Math.abs(M.m[5] / L.m[5] - 0.87) < 0.05; }));
ok('and the food diary has a medium egg at 66 kcal', await p.evaluate(() => foodById('x:eggm').kcal === 66 && !!foodById('x:eggm').mic));
for (let i = 0; i < 2; i++) { await p.click('#hfPanel button[data-hf="eggm"][data-by="-1"]'); await p.waitForTimeout(60); }
ok('medium eggs back to none', await p.evaluate(() => !S.days[today()].hf.eggm));
t = sq(await p.innerText('#hfPanel'));
ok('and says what each did', /EPA and DHA calm redness/.test(t));
ok('by body system: hormones names the foods behind it', /Hormones — testosterone and thyroid/.test(t) && /From eggs \(large\) ×2, oily fish ×1, brazil nuts ×2/.test(t), (t.match(/Hormones.{0,200}/) || [''])[0]);
ok('a system with nothing says so', /Gut — nothing from the list yet this week/.test(t));
const W = await p.evaluate(() => hfWeek());
ok('micronutrients add up: omega-3 = 2×30 + 2500', Math.round(W.mic.o3) === 2560, String(W.mic.o3));
ok('selenium: 2×15 + 45 + 2×70', Math.round(W.mic.se) === 215, String(W.mic.se));
ok('vitamins and minerals are in a fold with the honest note', /only these foods are counted — your real totals are higher/.test(await p.innerHTML('#hfPanel')));
// the rules: gluten free, no brassicas, no liver
const names = await p.evaluate(() => HF.map(f => f.n + ' ' + f.u).join(' | '));
ok('no brassicas or liver on the list', !/broccoli|sprout|cabbage|kale|rocket|watercress|liver/i.test(names), names);
ok('oats, chocolate say certified GF', /Oats 50 g — certified GF/.test(names) && /Dark chocolate 85% 20 g — certified GF/.test(names));
ok('Brazil nuts carry the 2-a-day limit', /max 2 a day/.test(names));
// a past day, via the log date
await p.evaluate(() => { E('logDate').value = addD(today(), -1); paintForm(); });
await tap('egg', 1);
ok('the counter follows the log date', await p.evaluate(() => S.days[addD(today(), -1)].hf.egg === 1 && S.days[today()].hf.egg === 2));
await ctx.close();

await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
