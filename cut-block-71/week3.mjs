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
const cfg = await p.evaluate(() => ({ tmpl: CFG.tmpl, runs: CFG.goals.runs, hard: CFG.goals.hard, sprints: CFG.goals.sprints }));
ok('the weekly run target is 3', cfg.tmpl.runs === 3 && cfg.tmpl.hard + cfg.tmpl.sprints === 3, JSON.stringify(cfg.tmpl));
ok('the easy run owes nothing', cfg.tmpl.easy === 0);
ok('block targets: 19 hard, 10 sprints, 29 runs', cfg.runs === 29 && cfg.hard === 19 && cfg.sprints === 10, JSON.stringify(cfg));

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
  ok('the week card shows counts with ticks, no quota', /Runs, all in 3 ✓/i.test(t) && !/3 \/ 3/.test(t), t.slice(0, 400));
  ok('the easy run is marked optional, never "to go"', /Easy runs optional 0 if you fancy it/i.test(t) && !/Easy runs[^G]*to go/i.test(t), t.slice(0, 400));
  ok('it says nothing is owed', /What you have done this week/.test(t) && /nothing is owed/.test(t));

  // one hard run and an easy one: the easy run is a bonus, not a stand-in
  await boot(st({ days: {
    [D.mon]: { runs: [{ k: 'reps', dm: 400, n: 6, secs: 62 }] },
    [D.tue]: { runs: [{ km: 5, secs: 1500, type: 'easy' }] } } }));
  await p.click('[data-t="training"]');
  t = sq(await p.innerText('#tWeek'));
  ok('an easy run shows as a bonus', /Easy runs optional 1 bonus/i.test(t), t.slice(0, 400));
  ok('and still counts toward the runs total', /Runs, all in 2 ✓/i.test(t), t.slice(0, 400));
  ok('and never says what is left to do', !/to go/i.test(t) && /Hard runs 1 ✓/i.test(t) && /Uphill sprints 0/i.test(t));
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

// ===== the refeed card sits at the top of Today, and the morning after is not counted =====
await boot(st({ days: { [D.t]: { kcal: 2400, refeed: true, steps: 11000 } } }));
await p.click('[data-t="today"]');
let rc = sq(await p.innerText('#refeedCard'));
ok('a refeed day gets its own card at the top of Today', /REFEED DAY/i.test(rc) && /2,400 kcal/.test(rc), rc);
ok('it says a bit above, not a binge', /A bit above, not a binge/.test(rc));
ok('and to skip the scale tomorrow', /Tomorrow: skip the scale/.test(rc));
ok('the card comes before the read-back', await p.evaluate(() => {
  const a = document.getElementById('refeedCard'), b = document.getElementById('gainCard');
  return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); }));
await boot(st({ weights: { [y2]: 128.4, [D.t]: 130.4 }, days: { [yday]: { kcal: 2400, refeed: true } } }));
await p.click('[data-t="today"]');
rc = sq(await p.innerText('#refeedCard'));
ok('the morning after gets its own card', /DAY AFTER THE REFEED/i.test(rc) && /left out of your averages/.test(rc), rc);
const cr = await p.evaluate(() => cutReadings().map(r => r.d));
ok('the morning-after reading is left out of the averages', !cr.includes(D.t), JSON.stringify(cr));
ok('but kept in the log', await p.evaluate(d => S.weights[d] === 130.4, D.t));
wt = (await p.evaluate(d => dayFeedback(d), D.t)).find(r => r[0] === 'Weight');
ok('and the read-back says so', /Left out of your averages/.test(wt[2]), wt[2]);
await boot(st({ weights: { [y2]: 128.4 }, days: { [yday]: { kcal: 2400, refeed: true } } }));
await p.click('[data-t="today"]');
ok('not weighed the morning after: says no weigh-in today', /No weigh-in today/.test(await p.innerText('#refeedCard')));
await boot(st({ days: { [D.t]: { kcal: 1799 } } }));
await p.click('[data-t="today"]');
ok('an ordinary day has no refeed card', (await p.innerText('#refeedCard')).trim() === '');

// ===== better than last week: his numbers against his numbers ==========
// The week-on-week lines need two weeks of cut behind them, so this block runs
// on a page whose clock is pinned mid-block rather than on the real date.
{
  const ctxB = await b.newContext({ viewport: { width: 430, height: 2400 } });
  await ctxB.clock.setFixedTime(new Date('2026-10-14T12:00:00'));
  const pB = await ctxB.newPage();
  pB.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  const p = pB;
  const boot = async (s) => { await p.goto(FILE);
    await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
    await p.reload(); await p.waitForTimeout(220); };
  await boot(st());
  ok('the pinned clock took', await p.evaluate(() => today()) === '2026-10-14');
  const D = { t: '2026-10-14' };
  const days = {}, weights = {};
  for (let i = 0; i < 14; i++) {
    const d = await p.evaluate(k => addD(today(), -k), i);
    const thisWk = i < 7;
    days[d] = { sleep: thisWk ? 8 : 7, steps: thisWk ? 16000 : 14000, skinAM: true, skinPM: thisWk || i % 2 === 0, study: thisWk ? 2 : 1 };
    weights[d] = thisWk ? 127.5 : 128.3;
  }
  const d9 = await p.evaluate(() => addD(today(), -9)), d2 = await p.evaluate(() => addD(today(), -2));
  days[d9].runs = [{ k: 'reps', dm: 400, n: 6, secs: 372 }];     // 62.0 a rep
  days[d2].runs = [{ k: 'reps', dm: 400, n: 6, secs: 360 }];     // 60.0 a rep
  await boot(st({ weights, days }));
  const BM = await p.evaluate(() => betterModel());
  const row = a => BM.rows.find(r => r.area === a) || {};
  const cutOK = true;
  ok('running: quicker than the last 400s, as a real percentage', row('Running').tone === 'up' && /\+3\.2% quicker than last time at 400m/.test(row('Running').change), JSON.stringify(row('Running')));
  if (cutOK) {
    ok('sleep: +1.0 h a night on last week', row('Sleep').tone === 'up' && /\+1\.0 h a night on last week/.test(row('Sleep').change), JSON.stringify(row('Sleep')));
    ok('steps: +14% on last week', row('Steps').tone === 'up' && /\+14% on last week/.test(row('Steps').change), JSON.stringify(row('Steps')));
    ok('weight: −0.8 lb on last week', row('Weight').tone === 'up' && /−0\.8 lb on last week/.test(row('Weight').change), JSON.stringify(row('Weight')));
    ok('skin: more full days than last week', row('Skin').tone === 'up', JSON.stringify(row('Skin')));
    ok('study: +7 h on last week', row('Study').tone === 'up' && /\+7\.0 h on last week/.test(row('Study').change), JSON.stringify(row('Study')));
  }
  await p.click('[data-t="today"]');
  const bt = sq(await p.innerText('#betterCard'));
  ok('the card says how many things got better', /Better in \d+ of \d+/.test(bt), bt.slice(0, 200));
  ok('the overall figure is the capped average: +7%', Math.round(BM.overall * 100) === 7, String(BM.overall));
  ok('and the card leads with it', /\+7% better than last week/.test(bt), bt.slice(0, 200));
  ok('with nothing wrong, it says you are getting better', /You’re getting better\./.test(bt));
  ok('and says how the % is worked out', /capped at 10%/.test(bt));
  ok('and has an Improve next list', /Improve next/.test(bt));
  // a slower session is said plainly, and not made into a trend
  days[d2].runs = [{ k: 'reps', dm: 400, n: 6, secs: 384 }];
  await boot(st({ weights, days }));
  const R2 = (await p.evaluate(() => betterModel())).rows.find(r => r.area === 'Running');
  ok('a slower session says so, as one session', R2.tone === 'down' && /slower than last time — one session, not a trend/.test(R2.change), JSON.stringify(R2));
  // nothing to compare: baseline, never an invented percentage
  await boot(st({ days: { [D.t]: { sleep: 8, steps: 15000 } } }));
  const B0 = await p.evaluate(() => betterModel());
  ok('with nothing to compare, lines say baseline', B0.n === 0 && B0.rows.every(r => r.tone === 'base') && !B0.rows.some(r => r.area === 'Skin'), JSON.stringify(B0.rows));
  await p.click('[data-t="today"]');
  ok('and the card says week one is the baseline', /Week one is your baseline/.test(await p.innerText('#betterCard')));
  await ctxB.close();
}

// ===== the week's status: rest, legs, overtraining, overworking ==========
{
  const ago = async k => p.evaluate(n => addD(today(), -n), k);
  const status = async () => p.evaluate(() => weekStatus());
  let days = {};
  for (let i = 0; i < 6; i++) days[await ago(i)] = { gym: true, split: 'chest' };
  await boot(st({ days }));
  ok('six days straight: time for a rest day', /Time for a rest day/.test((await status() || {}).t), JSON.stringify(await status()));
  days = {};
  for (let i = 1; i < 8; i++) days[await ago(i)] = { gym: true, split: 'chest' };
  await boot(st({ days }));
  ok('seven straight and nothing today: the rest day is well timed', /Rest day today — well timed/.test((await status() || {}).t) && /7 days in a row/.test((await status() || {}).w), JSON.stringify(await status()));
  days = { [await ago(0)]: { runs: [{ k: 'reps', dm: 400, n: 6, secs: 372 }] }, [await ago(2)]: { runs: [{ k: 'reps', dm: 200, n: 6, secs: 180 }] },
           [await ago(4)]: { runs: [{ k: 'reps', dm: 800, n: 4, secs: 600 }] } };
  await boot(st({ days }));
  ok('three hard runs in a week: you have done loads', /done loads/.test((await status() || {}).t), JSON.stringify(await status()));
  days = { [await ago(0)]: { runs: [{ k: 'reps', dm: 100, n: 8, up: true }] }, [await ago(1)]: { gym: true, split: 'legs' },
           [await ago(2)]: { runs: [{ k: 'reps', dm: 400, n: 6, secs: 372 }] } };
  await boot(st({ days }));
  ok('legs, a hard run and sprints in three days: rest your legs', /rest your legs/.test((await status() || {}).t), JSON.stringify(await status()));
  await boot(st({ days: { [await ago(0)]: { niggle: true, niggleWhat: 'calf' } } }));
  const ng = await status();
  ok('something hurts: rest it, and it names it', /Rest what hurts/.test(ng.t) && /calf/.test(ng.w), JSON.stringify(ng));
  days = {};
  for (let i = 0; i < 7; i++) days[await ago(i)] = { study: 3.2, sleep: 7.0 };
  await boot(st({ days }));
  ok('lots of study and sleep slipping: overworking', /overworking/.test((await status() || {}).t), JSON.stringify(await status()));
  await boot(st({ days: { [await ago(1)]: { gym: true, split: 'back' } } }));
  ok('an ordinary week raises nothing', (await status()) === null);
  await p.click('[data-t="today"]');
  ok('no warning shows when there is nothing to warn about', !/(rest|overtrain|overwork|overstress)/i.test((await p.innerText('#betterCard')).split('Improve next')[0]));
}

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
  ok('no session nags in what to do next', !FB.next.some(x => /hard run|Uphill sprints|Gym \d/.test(x)), JSON.stringify(FB.next));
  ok('the hard runs done are credited instead', FB.win.some(x => /1 hard run/.test(x)), JSON.stringify(FB.win));
}
await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
