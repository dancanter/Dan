import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2400 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220); };
const sq = s => s.replace(/\s+/g, ' ');

// Dates derive from the page's own today(), so this suite does not rot.
await boot(st());
const D = await p.evaluate(() => { const m = mondayOf(today()); return { t: today(), mon: m, tue: addD(m, 1), wed: addD(m, 2), pre: isPreBlock(today()) }; });

// ===== the week is 2 hard + 1 uphill sprints = 3; the easy run is a bonus =====
const cfg = await p.evaluate(() => ({ tmpl: CFG.tmpl, runs: CFG.goals.runs, hard: CFG.goals.hard }));
ok('the weekly run target is 3', cfg.tmpl.runs === 3 && cfg.tmpl.hard + cfg.tmpl.sprints === 3, JSON.stringify(cfg.tmpl));
ok('the easy run owes nothing', cfg.tmpl.easy === 0);
ok('the block runs goal lost one easy run a week: 33', cfg.runs === 33 && cfg.hard === 21, JSON.stringify(cfg));

if (!D.pre) {
  // hard + hard + sprints, no easy run: the week is done
  await boot(st({ days: {
    [D.mon]: { runs: [{ k: 'reps', dm: 400, n: 6, secs: 62 }] },
    [D.tue]: { runs: [{ k: 'reps', dm: 100, n: 8, up: true }] },
    [D.wed]: { runs: [{ k: 'reps', dm: 200, n: 6, secs: 29 }] } } }));
  let wk = await p.evaluate(() => trainingModel().week);
  ok('two reps sessions are the two hard runs, the hills are the sprints', wk.hard === 2 && wk.sprints === 1 && wk.runs === 3, JSON.stringify(wk));
  const owes = await p.evaluate(() => weekOwes(trainingModel()).map(o => o.k));
  ok('with no easy run, nothing running is owed', !owes.some(k => k === 'easy' || k === 'hard' || k === 'sprint'), JSON.stringify(owes));
  await p.click('[data-t="training"]');
  let t = sq(await p.innerText('#tWeek'));
  ok('the week card shows runs all in 3 / 3, done', /Runs, all in 3 \/ 3 done/i.test(t), t.slice(0, 400));
  ok('the easy run is marked optional, never "to go"', /Easy runs optional 0 if you fancy it/i.test(t) && !/Easy runs[^G]*to go/i.test(t), t.slice(0, 400));
  ok('the rule is said in plain words', /The week is 3 runs: your 2 hard runs and the short uphill sprints/.test(t));

  // one hard run and an easy one: the easy run is a bonus, not a stand-in
  await boot(st({ days: {
    [D.mon]: { runs: [{ k: 'reps', dm: 400, n: 6, secs: 62 }] },
    [D.tue]: { runs: [{ km: 5, secs: 1500, type: 'easy' }] } } }));
  await p.click('[data-t="training"]');
  t = sq(await p.innerText('#tWeek'));
  ok('an easy run shows as a bonus', /Easy runs optional 1 bonus/i.test(t), t.slice(0, 400));
  ok('and still counts toward the runs total', /Runs, all in 2 \/ 3 1 to go/i.test(t), t.slice(0, 400));
  ok('the hard run and the sprints still say what is left', /Hard runs 1 \/ 2 1 to go/i.test(t) && /Uphill sprints 0 \/ 1 1 to go/i.test(t));
}

// ===== a refeed is planned, and the scale jump after it is explained =====
const yday = await p.evaluate(() => addD(today(), -1)), y2 = await p.evaluate(() => addD(today(), -2));
await boot(st({ weights: { [y2]: 128.4, [D.t]: 130.1 }, days: { [yday]: { kcal: 2400, refeed: true } } }));
let fb = await p.evaluate(d => dayFeedback(d), yday);
let food = fb.find(r => r[0] === 'Food');
ok('a refeed day is not "over budget"', food && !/over budget/.test(food[2]) && /Refeed day — planned, not a slip/.test(food[2]), JSON.stringify(food));
ok('it says what it costs, honestly', /about 0\.2 lb of the week/.test(food[2]), food[2]);
ok('and warns about the scale', /expect the scale to jump/.test(food[2]));
ok('and says how close to maintenance it was', /over what you burned today<\/b> — close to maintenance/.test(food[2]), food[2]);
ok('shown as a good row, not a warning', food[3] === 'g');
fb = await p.evaluate(d => dayFeedback(d), D.t);
let wt = fb.find(r => r[0] === 'Weight');
ok('the morning after: glycogen and water, not fat', wt && /\+1\.7 after the refeed/.test(wt[2]) && /glycogen and water, not fat/.test(wt[2]), JSON.stringify(wt));
// a normal over-budget day still says over budget
await boot(st({ days: { [yday]: { kcal: 2400 } } }));
food = (await p.evaluate(d => dayFeedback(d), yday)).find(r => r[0] === 'Food');
ok('a day without the refeed toggle still reads as over', /601 over budget/.test(food[2]), food[2]);
// a drop after a refeed is still just good news
await boot(st({ weights: { [y2]: 128.4, [D.t]: 128.2 }, days: { [yday]: { kcal: 2400, refeed: true } } }));
wt = (await p.evaluate(d => dayFeedback(d), D.t)).find(r => r[0] === 'Weight');
ok('down after a refeed gets no refeed excuse', wt && !/after the refeed/.test(wt[2]), JSON.stringify(wt));
// the Today tile says refeed day
await boot(st({ days: { [D.t]: { kcal: 2400, refeed: true } } }));
await p.click('[data-t="today"]');
ok('Today says refeed day on the eaten tile', /\+601 · refeed day/.test(sq(await p.textContent('#s-today'))));

// ===== the week review: deficit, study, how it went, next week ==========
{
  const ws = await p.evaluate(() => reviewWeeks().filter(w => typeof w.k === 'number'));
  const wk = ws[ws.length - 1];
  const dd = i => new Date(Date.parse(wk.start + 'T12:00:00Z') + i * 864e5).toISOString().slice(0, 10);
  const days = {};
  for (let i = 0; i < 7; i++) days[dd(i)] = { kcal: 1799, steps: 15000, sleep: 6.5, skinAM: true, skinPM: i < 3 };
  days[dd(0)].study = 3; days[dd(0)].deep = 2; days[dd(1)].study = 1.5;
  days[dd(5)].kcal = 2400; days[dd(5)].refeed = true;
  days[dd(1)].runs = [{ k: 'reps', dm: 200, n: 6, secs: 29 }];
  await boot(st({ days }));
  const R = await p.evaluate(k => buildReview(reviewWeeks().find(w => w.k === k)), wk.k);
  const logged = Object.keys(days).filter(d => d <= D.t).length;
  ok('the review carries the week deficit', R.def.n === logged && R.def.total !== 0, JSON.stringify(R.def));
  ok('and the refeed in it', R.def.refeeds.length === (dd(5) <= D.t ? 1 : 0));
  await p.click('[data-t="review"]'); await p.selectOption('#revPick', String(wk.k)); await p.waitForTimeout(150);
  const t = sq(await p.innerText('#revBody'));
  ok('Food and deficit card with the week total and per day', /FOOD AND DEFICIT/i.test(t) && /DEFICIT, THE WEEK/i.test(t) && /PER DAY/i.test(t), t.slice(0, 300));
  ok('it says it is an estimate and the weight is the judge', /The weight average is the real judge/.test(t));
  ok('study hours show even before term', /STUDY HOURS 4\.5 h/i.test(t), (t.match(/STUDY.{0,80}/i) || [''])[0]);
  ok('a feedback card', /(HOW IT WENT|HOW IT IS GOING)/i.test(t));
  ok('sleep under the line comes first in what to do', /1 Sleep first\. 6\.5 h a night is 1\.0 h under the line/i.test(t), (t.match(/(NEXT WEEK|REST OF THE WEEK).{0,200}/i) || [''])[0]);
  ok('never tells him to eat less', !/eat less|cut (your )?calories|lower your calories/i.test(t));
  const FB = await p.evaluate(k => { const w = reviewWeeks().find(x => x.k === k); return reviewFeedback(buildReview(w), w); }, wk.k);
  ok('at most four things to work on', FB.next.length <= 4, FB.next.length);
  ok('a hard run left is named', FB.next.some(x => /hard run/.test(x)));
  ok('the sprints are asked for when missing', FB.next.some(x => /Uphill sprints/.test(x)));
}
await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
