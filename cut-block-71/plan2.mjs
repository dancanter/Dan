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

// ===== no fixed deloads (29 Sep): every week is 2 hard + 2 easy =====
let { ctx, p, boot } = await at('2026-10-14');   // week 4, which used to be a deload
await boot(st());
const T = await p.evaluate(() => ({ g: CFG.goals, w4: tmplFor(addD(WEIGH_START, 21)), w8: tmplFor(addD(WEIGH_START, 49)),
  sum: (() => { let h = 0, e = 0; for (let k = 1; k <= W_WEEKS; k++) { const t = tmplFor(addD(WEIGH_START, (k - 1) * 7)); h += t.hard; e += t.easy; } return { h, e }; })() }));
ok('no week is a scheduled deload any more', !T.w4.deload && !T.w8.deload && T.w4.hard === 2 && T.w4.runs === 3, JSON.stringify(T.w4));
ok('the block hard-run total is the weeks added up, plus the pre-block one', T.g.hard === T.sum.h + 1 && T.g.hard === 21, JSON.stringify(T));
ok('runs = hard + the easy five-milers', T.g.runs === T.g.hard + T.sum.e && T.g.runs === 31, JSON.stringify(T));
let t = sq(await p.evaluate(() => weekRunsHTML()));
ok('week 4 is a normal week now', !/deload/i.test(t) && /Hard run · longer/.test(t), t.slice(0, 200));
// an easy week he chooses to take cuts the runs card to one hard run
await boot(st({ settings: { hideDaily: false, fiveK: 1085, easyFrom: '2026-10-13' } }));
t = sq(await p.innerText('#runsCard'));
ok('while an easy week is on, the runs card is one hard run and no trials', !/Hard run · longer/.test(t) && /An easier week: one hard run/.test(t) && /No time trials while something is flagged/.test(t), t.slice(0, 400));
await ctx.close();

// ===== the weekly runs card: which runs, how many, never which day =====
({ ctx, p, boot } = await at('2026-09-30'));   // week 2, Wednesday
await boot(st({ days: { '2026-09-28': { runs: [{ k: 'reps', dm: 300, n: 6, secs: 300, rpe: 7 }] } } }));
await p.click('[data-t="today"]');
t = sq(await p.innerText('#runsCard'));
ok('Today shows this week’s run ideas', /RUNS THIS WEEK · IDEAS · WEEK 2/i.test(t), t.slice(0, 200));
ok('as a good week, not an order', /A good week, 3–4 runs: a longer and a shorter hard run, an easy 5 miles, and an easy 5 km only if you feel fresh\. 4 gym sessions\./.test(t) && /Any days\. Hard runs never the day after legs or each other/.test(t) && /one full day a week with no session/.test(t) && !/\b(need to|must|owes?)\b/i.test(t));
ok('week 2 is 4 × 1 km and 6 × 300 m', /4 × 1 km/.test(t) && /6 × 300 m/.test(t));
ok('with sprints as the option, on the end of an easy run', /Uphill sprints optional/i.test(t) && /8 × ~100 m uphill — best at the end of an easy 5 miles/.test(t));
ok('two easy five-milers, with a wide easy pace and what they burn', /Easy 5 miles the fat-loss run · plus an easy 5 km only if you feel fresh/.test(t) && /5:00–5:45 a km, and slower is never wrong/.test(t), t.slice(0, 900));
ok('the counts sit at the top: 1 hard of 2, 0 easy of 2, plan is 4', /HARD RUNS 1 of 2/i.test(t) && /EASY 5 MILES 0 of 1/i.test(t) && /the plan is 3–4/.test(t), t.slice(0, 500));
ok('no days of the week are named', !/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/.test(t));
ok('no rest times, and no per-km paces', !/\/km|min rest|seconds? rest|recover(y)? of \d/.test(t));
ok('rep guides are wide ranges from his best session: 1 km 3:13–3:24', /4 × 1 km — 3:13–3:24 a rep \(best 1 km session 3:13\)/.test(t), (t.match(/Guide[^B]*/g) || []).join(' | '));
ok('300s: 45–48 s', /6 × 300 m — 45–48 s a rep/.test(t));
const tAll = sq(await p.evaluate(() => { const e = document.createElement('div'); e.innerHTML = weekRunsHTML(); return e.textContent; }));
ok('and effort overrides the watch (folded away)', /Effort overrides the watch/.test(tAll) && /How the guide times work/.test(t));
let M = await p.evaluate(() => weekRunsModel());
ok('a 300 m session ticks the short-speed slot, not long reps', M.shortDone && !M.longDone, JSON.stringify(M));
ok('the rule for not getting ahead is there', /Move up only if last week felt controlled/.test(tAll));
ok('and the low-stress rule for a deficit', /a rep or two in hand/.test(tAll) && /stop when a rep feels clearly worse/.test(tAll));
ok('each hard slot is a menu with a good pick marked', /Hard run · longer pick one, if you fancy it ★ good pick this week 4 × 1 km/i.test(t) && /Hard run · shorter pick one, if you fancy it ★ good pick this week 6 × 300 m/i.test(t), t.slice(0, 500));
ok('every option says what it does for him', /Raises the pace you can hold for a mile and 5 km/.test(t) && /Speed endurance: the last 100 m of your 400 gets stronger/.test(t) && /the biggest single lever for your 5 km/.test(t));
ok('with alternatives', /5 × 800 m — 2:32–2:41 a rep/.test(t) && /8 × 200 m — 28\.1–29\.8 s a rep/.test(t) && /Threshold run — comfortably hard/.test(t));
ok('and time trials on the menu in a clear week, on one line', /• Time trial — 800 m 2:29–2:35 · 1 km 2:56–3:04 · a mile 5:20–5:34/.test(t) && /Time trial — 200 m 27\.5–28\.6 s · 400 m 58–60 s · 600 m 1:38–1:42/.test(t) && /one at most, in place of a hard run, never on top/.test(t), (t.match(/Time trial.{0,120}/g) || []).join(' | '));
ok('with what a time trial does', /practises racing/.test(t));
ok('weight first, then build — and holding times on the cut is winning', /Weight first, then build/.test(t) && /holding and nudging your times is winning/.test(t));
ok('it explains why two hard runs is the most on a deficit', /Why this shape, on a deficit/.test(t) && /cortisol up, testosterone down/.test(tAll));
ok('no long session is more than 5 km of reps', await p.evaluate(() => CUT_RUNS.filter(Boolean).every(w => { const m = /(\d+) × (\d+) (k?m)/.exec(w.long || ''); return !m || (+m[1]) * (+m[2]) * (m[3] === 'km' ? 1000 : 1) <= 5000; })));
// a stress flag cuts the week to one hard run, the short one
await boot(st({ days: { '2026-09-30': { niggle: true, niggleWhat: 'calf' } } }));
M = await p.evaluate(() => weekRunsModel());
t = sq(await p.innerText('#runsCard'));
ok('a stress flag drops the week to one hard run', M.easeOff && !M.P.long && /An easier week: one hard run and an easy 5 miles/.test(t) && /one hard run/.test(t) && /Back off: rest what hurts/.test(t), t.slice(0, 400));
ok('and takes time trials off the menu', !/Time trial —/.test(t) && /No time trials while something is flagged/.test(t));
ok('with no longer session that week', !/Hard run · longer/.test(t));
ok('and the easy runs turn into a walk while it hurts', /Legs flagged: make the next one a brisk walk/.test(t));
// an easy run shows what it burned, from his weight
await boot(st({ weights: { '2026-09-29': 127.6, '2026-09-30': 127.4 }, days: { '2026-09-29': { runs: [{ km: 8.05, secs: 2460, type: 'easy' }] } } }));
t = sq(await p.innerText('#runsCard'));
ok('an easy 5 miles is about 470 kcal at his weight, and ticks 1 of 2', /about 470 kcal each/.test(t) && /✓ done/i.test(t), t.slice(0, 900));
// six runs in seven days on a deficit is a back-off
const six = {}; for (let i = 0; i < 6; i++) six['2026-09-' + (25 + i)] = { runs: [{ km: 8, secs: 2500, type: 'easy' }] };
await boot(st({ days: six }));
ok('six runs in a week on a deficit says back off', await p.evaluate(() => { const s = weekStatus(); return s && s.k === 'rest' && /a lot of running on a deficit/.test(s.t); }));
// last week's hard runs felt like a 9: repeat, don't move up
await boot(st({ days: { '2026-09-23': { runs: [{ k: 'reps', dm: 200, n: 5, secs: 150, rpe: 9 }] } } }));
M = await p.evaluate(() => weekRunsModel());
t = sq(await p.innerText('#runsCard'));
ok('a 9 last week means repeat last week’s sessions', M.repeat && /this week’s pick is last week’s session again/.test(t) && /★ good pick this week 5 × 800 m/i.test(t), t.slice(0, 400));
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
ok('a long trial last week: only short trials this week', /Time trial — 200 m/.test(t) && !/Time trial — 800 m/.test(t) && !/a mile 5:/.test(t) && /longer ones \(800 m and up\) are every other week/.test(t), t.slice(-900));
await boot(st({ days: { '2026-09-24': { runs: [{ k: 'reps', dm: 200, n: 1, secs: 27.9 }] } } }));
t = sq(await p.innerText('#runsCard'));
ok('a short trial last week leaves all trials on', /Time trial — 800 m/.test(t) && /Time trial — 200 m/.test(t));
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
ok('his nuts are on it: walnuts and hazelnuts', /Walnuts/.test(names) && /Hazelnuts/.test(names));
ok('Fage 0%, 2% and 5% are each on it, with kefir', /Fage 0%/.test(names) && /Fage 2%/.test(names) && /Fage 5%/.test(names) && /Kefir/.test(names));
ok('mainly animal foods and fruit', await p.evaluate(() => HF.filter(f => f.s === 'also').length <= 8 && HF.filter(f => f.s === 'fruit').length >= 15 && HF.filter(f => f.s === 'meat' || f.s === 'fish' || f.s === 'dairy').length >= 20));
ok('oats and chocolate say certified GF', /Oats \(certified GF\)/.test(names) && /Dark chocolate 85% \(certified GF\)/.test(names));
ok('medium and large eggs share the eggs target', await p.evaluate(() => { const w = hfWeek(); return w.pools.eggs === 3; }));
await put('eggm', 2);
ok('medium eggs add to the same pool', await p.evaluate(() => hfWeek().pools.eggs === 5));
// the diary is off Today, the healthy foods are on both Today and the Food tab
ok('the food diary is no longer on Today', await p.evaluate(() => !document.querySelector('#s-today #foodList') && !!document.querySelector('#s-food #diaryWrap #foodList')));
ok('and it is folded on the Food tab', await p.evaluate(() => !E('diaryWrap').open));
await p.click('[data-t="food"]');
let ft = sq(await p.innerText('#hfFood'));
const fn = sq(await p.innerText('#foodNums'));
ok('the Food tab opens with numbers: eaten, burned, deficit, the block', /FOOD IN NUMBERS/i.test(fn) && /BURNED TODAY/i.test(fn) && /DEFICIT TODAY/i.test(fn) && /WHOLE BLOCK/i.test(fn), fn.slice(0, 300));
ok('with healthy foods against the week and what to add', /Berries 220 g \/ 560 g/.test(fn) && /more handful/.test(fn) && /Eggs 5 eggs \/ 10 eggs/.test(fn), fn.slice(0, 900));
ok('and the lowest vitamins with foods that fix them', /Lowest:/.test(fn));
ok('the report below says what each food did', /WHAT YOUR HEALTHY FOODS DID/i.test(ft));
ok('what it did, by body system', /Skin and glow — omega-3/.test(ft));
ok('and the vitamins and minerals shown open', await p.evaluate(() => [...E('hfFood').querySelectorAll('details')].some(d => d.open && /Vitamins and minerals/.test(d.textContent))) && /Omega-3 \(EPA\+DHA\)/.test(ft));
await p.evaluate(() => { E('hfFood').querySelector('details').open = true; const s = E('hfFood').querySelector('details[data-hfsec="also"]'); if (s) s.open = true; });
await p.fill('#hfFood input[data-hfin="walnut"]', '30'); await p.press('#hfFood input[data-hfin="walnut"]', 'Tab'); await p.waitForTimeout(100);
ok('the Food-tab inputs save too', await p.evaluate(() => S.days[today()].hf.walnut === 30));
await p.click('[data-t="today"]');
// a past day, via the log date
await p.evaluate(() => { E('logDate').value = addD(today(), -1); paintForm(); });
await put('beef', 125);
ok('the counter follows the log date', await p.evaluate(() => S.days[addD(today(), -1)].hf.beef === 125 && !S.days[today()].hf.beef));
await ctx.close();

// ===== testosterone support =====
({ ctx, p, boot } = await at(null));
{
  await boot(st());
  const ago = async k => p.evaluate(n => addD(today(), -n), k);
  const days = {};
  for (let i = 0; i < 7; i++) days[await ago(i)] = { sleep: 8.3, steps: 15000, kcal: 1799 };
  days[await ago(1)].refeed = true;
  days[await ago(2)].hf = { salmon: 150, mackerel: 180, egg: 4, beef: 250, pumpkin: 30 };
  await boot(st({ days }));
  const R = await p.evaluate(() => tSupport(addD(today(), -6), today()));
  const row = n => R.find(r => r.n === n) || {};
  ok('sleep at 8.3 h supports it', row('Sleep').ok === true, JSON.stringify(row('Sleep')));
  ok('the sleep line is now 8 h', await p.evaluate(() => CFG.sleep.line === 8));
  ok('fat is 48 g, carbs still over the floor', await p.evaluate(() => MACRO.fat === 48 && CARB_AT >= CARB_FLOOR));
  ok('the refeed is credited under carbs and fat', row('Carbs and fat').ok === true && /refeed this week/.test(row('Carbs and fat').w));
  ok('vitamin D foods read the oily fish and eggs', row('Vitamin D foods').ok === true && /330 g oily fish · 4 eggs/.test(row('Vitamin D foods').v), JSON.stringify(row('Vitamin D foods')));
  ok('zinc foods: 14.8 mg from beef and pumpkin seeds supports it', row('Zinc foods').ok === true && /14\.8 mg/.test(row('Zinc foods').v) && /Beef, lean/.test(row('Zinc foods').w) && /Pumpkin seeds/.test(row('Zinc foods').w), JSON.stringify(row('Zinc foods')));
  ok('the winter vitamin D point is made honestly', /too weak to make vitamin D/.test(row('Vitamin D foods').w));
  await p.click('[data-t="today"]');
  const tc = sq(await p.innerText('#tCard'));
  ok('Today shows the card', /TESTOSTERONE SUPPORT · LAST 7 DAYS/i.test(tc) && /not targets/.test(tc), tc.slice(0, 200));
  // short sleep and nothing logged
  const d2 = {};
  for (let i = 0; i < 7; i++) d2[await ago(i)] = { sleep: 6.8 };
  await boot(st({ days: d2 }));
  const R2 = await p.evaluate(() => tSupport(addD(today(), -6), today()));
  ok('short sleep is flagged, with why', R2[0].ok === false && /10–15%/.test(R2[0].w), JSON.stringify(R2[0]));
  ok('with no healthy foods logged, those lines just say so', R2.find(r => r.n === 'Zinc foods').ok === null && /Log healthy foods/.test(R2.find(r => r.n === 'Zinc foods').w));
}
await ctx.close();

await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
