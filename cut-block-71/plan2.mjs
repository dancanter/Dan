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
ok('a deload has one hard slot, relaxed, and no time trials', !/Hard run · longer/.test(t) && /Hard run pick one/.test(t) && /fast but relaxed/.test(t) && !/Time trial —/.test(t) && /No time trials in a deload/.test(t));
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
ok('rep guides are wide ranges from his best session: 1 km 3:13–3:24', /4 × 1 km — 3:13–3:24 a rep \(best 1 km session 3:13\)/.test(t), (t.match(/Guide[^B]*/g) || []).join(' | '));
ok('300s: 45–48 s', /6 × 300 m — 45–48 s a rep/.test(t));
ok('and effort overrides the watch', /Effort overrides the watch/.test(t));
let M = await p.evaluate(() => weekRunsModel());
ok('a 300 m session ticks the short-speed slot, not long reps', M.shortDone && !M.longDone, JSON.stringify(M));
ok('the rule for not getting ahead is there', /Move up only if last week felt controlled/.test(t));
ok('and the low-stress rule for a deficit', /a rep or two in hand/.test(t) && /stop when a rep feels clearly worse/.test(t));
ok('each hard slot is a menu with this week’s pick marked', /Hard run · longer pick one ★ this week 4 × 1 km/i.test(t) && /Hard run · shorter pick one ★ this week 6 × 300 m/i.test(t), t.slice(0, 500));
ok('with alternatives', /5 × 800 m — 2:32–2:41 a rep/.test(t) && /8 × 200 m — 28\.1–29\.8 s a rep/.test(t) && /Threshold run — comfortably hard/.test(t));
ok('and time trials on the menu in a clear week', /Time trial — 400 m — 58–60 s/.test(t) && /Time trial — 1 km — 2:56–3:04/.test(t) && /one at most, in place of a hard run, never on top/.test(t));
ok('the cut comes first', /this block is for the look, shredded, and 122–124 lb/.test(t));
ok('no long session is more than 5 km of reps', await p.evaluate(() => CUT_RUNS.filter(Boolean).every(w => { const m = /(\d+) × (\d+) (k?m)/.exec(w.long || ''); return !m || (+m[1]) * (+m[2]) * (m[3] === 'km' ? 1000 : 1) <= 5000; })));
// a stress flag cuts the week to one hard run, the short one
await boot(st({ days: { '2026-09-30': { niggle: true, niggleWhat: 'calf' } } }));
M = await p.evaluate(() => weekRunsModel());
t = sq(await p.innerText('#runsCard'));
ok('a stress flag drops the week to one hard run', M.easeOff && !M.P.long && /2 runs: 1 hard \+ 1 uphill sprints/.test(t) && /one hard run/.test(t) && /Back off: rest what hurts/.test(t), t.slice(0, 400));
ok('and takes time trials off the menu', !/Time trial —/.test(t) && /No time trials while something is flagged/.test(t));
ok('with no longer session that week', !/Hard run · longer/.test(t));
// last week's hard runs felt like a 9: repeat, don't move up
await boot(st({ days: { '2026-09-23': { runs: [{ k: 'reps', dm: 200, n: 5, secs: 150, rpe: 9 }] } } }));
M = await p.evaluate(() => weekRunsModel());
t = sq(await p.innerText('#runsCard'));
ok('a 9 last week means repeat last week’s sessions', M.repeat && /this week’s pick is last week’s session again/.test(t) && /★ this week 5 × 800 m/i.test(t), t.slice(0, 400));
// a long session ticks long reps
await boot(st({ days: { '2026-09-28': { runs: [{ k: 'reps', dm: 1000, n: 5, secs: 900 }] } } }));
M = await p.evaluate(() => weekRunsModel());
ok('1 km reps tick the long-rep slot', M.longDone && !M.shortDone, JSON.stringify(M));
// the guide moves when he logs a faster session: 5 × 1 km at 3:00 a rep
t = sq(await p.innerText('#runsCard'));
ok('a faster logged session moves the guide: 3:00–3:11', /3:00–3:11 a rep \(best 1 km session 3:00\)/.test(t), (t.match(/Guide[^B]*/g) || []).join(' | '));
// uphill reps never move it
await boot(st({ days: { '2026-09-28': { runs: [{ k: 'reps', dm: 1000, n: 5, secs: 800, up: true }] } } }));
ok('an uphill session does not move the guide', /3:13–3:24 a rep/.test(sq(await p.innerText('#runsCard'))));
// time trials: one a week, and the long ones every other week
await boot(st({ days: { '2026-09-29': { runs: [{ k: 'reps', dm: 400, n: 1, secs: 58.5 }] } } }));
t = sq(await p.innerText('#runsCard'));
ok('a time trial logged this week takes the others off the menu', /You have had your time trial this week/.test(t) && !/• Time trial —/.test(t), t.slice(-900));
ok('and it ticked the shorter slot', (await p.evaluate(() => weekRunsModel())).shortDone);
await boot(st({ days: { '2026-09-24': { runs: [{ k: 'reps', dm: 1000, n: 1, secs: 178 }] } } }));
t = sq(await p.innerText('#runsCard'));
ok('a long trial last week: only short trials this week', /Time trial — 400 m/.test(t) && !/Time trial — 1 km/.test(t) && !/Time trial — a mile/.test(t) && /longer ones \(800 m and up\) are every other week/.test(t), t.slice(-900));
await boot(st({ days: { '2026-09-24': { runs: [{ k: 'reps', dm: 200, n: 1, secs: 27.9 }] } } }));
t = sq(await p.innerText('#runsCard'));
ok('a short trial last week leaves all trials on', /Time trial — 1 km/.test(t) && /Time trial — 200 m/.test(t));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-21'));   // week 5, tests
await boot(st());
t = sq(await p.evaluate(() => weekRunsHTML()));
ok('week 5 is a test week with a 400 and a 1 km trial', /test week/.test(t) && /Time trial — 400 m/.test(t) && /Time trial — 1 km/.test(t));
ok('and the test only if the week is clear', /only if the week is clear/.test(t));
t = t.replace(/<[^>]+>/g, '');
ok('time trials get ±2% of the best: 400 m 58–60 s', /Time trial — 400 m — 58–60 s \(best 59\.0 s\)/.test(t), t.slice(0, 600));
ok('and 1 km 2:56–3:04', /Time trial — 1 km — 2:56–3:04 \(best 3:00\)/.test(t));
ok('test week: both hard runs can be trials', /both hard runs can be time trials/.test(t));
await ctx.close();

// ===== healthy foods: grams in, the week added up, what it did =====
({ ctx, p, boot } = await at(null));
await boot(st());
await p.click('[data-t="today"]');
const put = async (k, v) => { const sec = await p.evaluate(k => HF.find(f => f.k === k).s, k);
  await p.evaluate(s => { const d = document.querySelector('#hfPanel details[data-hfsec="' + s + '"]'); if (d && !d.open) d.open = true; }, sec);
  await p.fill(`#hfPanel input[data-hfin="${k}"]`, String(v)); await p.press(`#hfPanel input[data-hfin="${k}"]`, 'Tab'); await p.waitForTimeout(80); };
await put('egg', 3); await put('salmon', 150); await put('blueberry', 100); await put('strawberry', 120); await put('honey', 20); await put('kefir', 200);
let hf = await p.evaluate(() => S.days[today()].hf);
ok('grams are saved per day, eggs as a count', hf.egg === 3 && hf.salmon === 150 && hf.blueberry === 100 && hf.honey === 20 && hf.kefir === 200, JSON.stringify(hf));
ok('the kcal is left alone', await p.evaluate(() => S.days[today()].kcal === undefined));
ok('a section stays open after a number is saved', await p.evaluate(() => document.querySelector('#hfPanel details[data-hfsec="fish"]').open));
await put('honey', 0);
hf = await p.evaluate(() => S.days[today()].hf);
ok('putting 0 clears it', !('honey' in hf));
await put('honey', 20);
t = sq(await p.innerText('#hfPanel'));
ok('it says it wants grams, raw for meat and fish', /raw weight for meat and fish/.test(t));
ok('the week adds up pools against targets: berries 220 g of 560 g', /Berries 220 g \/ 560 g/.test(t), (t.match(/This week.{0,300}/) || [''])[0]);
ok('oily fish 150 g of 400 g', /Oily fish 150 g \/ 400 g/.test(t));
ok('eggs as a count: 3 eggs of 10', /Eggs 3 eggs \/ 10 eggs/.test(t));
ok('and what each did', /EPA and DHA calm redness/.test(t) && /Raw honey 20 g/.test(t));
ok('body systems name the foods behind them', /Skin and glow — omega-3/.test(t) && /From Salmon 150 g, Eggs, large 3 eggs, Blueberries 100 g, Strawberries 120 g/.test(t), (t.match(/Skin and glow.{0,200}/) || [''])[0]);
const W = await p.evaluate(() => hfWeek());
ok('micronutrients scale with grams: omega-3 = 3×30 + 1.5×2150', Math.round(W.mic.o3) === 3315, String(W.mic.o3));
ok('vitamin C: 1.0×10 + 1.2×59 + 0.2×0.5 + 2×1 (kefir)', Math.round(W.mic.vc * 10) / 10 === 82.9, String(W.mic.vc));
const names = await p.evaluate(() => HF.map(f => f.n).join(' | '));
ok('the list is his: no oil, spinach, green tea, Brazil nuts or lentils', !/olive oil|spinach|green tea|brazil|lentil/i.test(names), names);
ok('no brassicas or liver', !/broccoli|sprout|cabbage|kale|rocket|watercress|liver/i.test(names));
ok('raw honey is on it', /Raw honey/.test(names));
ok('Fage 0%, 2% and 5% are each on it, with kefir', /Fage 0%/.test(names) && /Fage 2%/.test(names) && /Fage 5%/.test(names) && /Kefir/.test(names));
ok('mainly animal foods and fruit', await p.evaluate(() => HF.filter(f => f.s === 'also').length <= 6 && HF.filter(f => f.s === 'fruit').length >= 15 && HF.filter(f => f.s === 'meat' || f.s === 'fish' || f.s === 'dairy').length >= 20));
ok('oats and chocolate say certified GF', /Oats \(certified GF\)/.test(names) && /Dark chocolate 85% \(certified GF\)/.test(names));
ok('medium and large eggs share the eggs target', await p.evaluate(() => { const w = hfWeek(); return w.pools.eggs === 3; }));
await put('eggm', 2);
ok('medium eggs add to the same pool', await p.evaluate(() => hfWeek().pools.eggs === 5));
// a past day, via the log date
await p.evaluate(() => { E('logDate').value = addD(today(), -1); paintForm(); });
await put('beef', 125);
ok('the counter follows the log date', await p.evaluate(() => S.days[addD(today(), -1)].hf.beef === 125 && !S.days[today()].hf.beef));
await ctx.close();

await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
