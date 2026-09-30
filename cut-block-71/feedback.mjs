import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const sq = s => s.replace(/\s+/g, ' ');
const ctx = await b.newContext({ viewport: { width: 430, height: 2400 } });
await ctx.clock.setFixedTime(new Date('2026-10-14T12:00:00'));   // a Wednesday, week 4
const p = await ctx.newPage();
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220); };
const iso = n => { const d = new Date(Date.UTC(2026, 9, 14 - n)); return d.toISOString().slice(0, 10); };
const C = () => p.evaluate(() => { const c = coachModel(); return { rest: c.rest, refeed: c.refeed, good: c.good, sug: c.sug, pts: c.pts, strain: c.strain }; });
// weights: a healthy rate (~0.5%/wk), a fast one, a stalled one
const wts = (a, b2) => { const w = {}; for (let i = 0; i < 14; i++) w[iso(i)] = i < 7 ? a : b2; return w; };
const good = wts(127.4, 128.0), fast = wts(126.4, 128.0), slow = wts(127.95, 128.0);
// a clean week: 2 hard, 2 easy, gym most days, a day off on Sunday, 8 h sleep with the phone out
const clean = () => { const d = {};
  for (let i = 0; i < 14; i++) d[iso(i)] = { steps: 14000, sleep: 8.2, phoneOut: true, kcal: 1799, study: 3, mood: 4 };
  for (const i of [3, 10]) d[iso(i)] = { steps: 10000, sleep: 8.4, phoneOut: true, kcal: 1799, mood: 4 };   // Sundays off
  for (const i of [1, 2, 4, 5, 6, 8, 9, 11, 12]) d[iso(i)].gym = true;
  d[iso(1)].runs = [{ k: 'reps', dm: 1000, n: 4, secs: 790, rpe: 7 }];
  d[iso(5)].runs = [{ k: 'reps', dm: 300, n: 6, secs: 280, rpe: 7 }];
  d[iso(2)].runs = [{ km: 8.05, secs: 2500, type: 'easy' }];
  d[iso(6)].runs = [{ km: 8.05, secs: 2500, type: 'easy' }];
  return d; };

// ===== a good week: keep going, no refeed =====
await boot(st({ weights: good, days: clean() }));
let c = await C();
ok('a clean week: no rest needed', c.rest.k === 'go' && /No rest needed — keep going/.test(c.rest.t), JSON.stringify(c.rest) + ' ' + JSON.stringify(c.strain));
ok('and no refeed needed', c.refeed.k === 'no' && /No refeed needed/.test(c.refeed.t), JSON.stringify(c.refeed));
ok('what’s good names the rate, the runs, the gym, steps and sleep', c.good.some(x => /sweet spot/.test(x)) && c.good.some(x => /the week as planned/.test(x)) && c.good.some(x => /gym sessions/.test(x)) && c.good.some(x => /Steps averaging/.test(x)) && c.good.some(x => /Sleep averaging/.test(x)), JSON.stringify(c.good));
ok('nothing to suggest', c.sug.length === 0, JSON.stringify(c.sug));
await p.click('[data-t="feedback"]'); await p.waitForTimeout(120);
let t = sq(await p.innerText('#fbCard'));
ok('the Feedback tab: rest, refeed, what’s good, what I suggest', /FEEDBACK/i.test(t) && /🛌 Rest/.test(t) && /🍚 Refeed/.test(t) && /WHAT’S GOOD/i.test(t) && /WHAT I SUGGEST/i.test(t) && /Nothing to change\. Run the same week again\./.test(t), t.slice(0, 400));
ok('and says the calls are not on a calendar', /No rest weeks on a calendar/.test(await p.evaluate(() => feedbackHTML())));
await p.click('[data-t="today"]');
t = sq(await p.innerText('#glanceCard'));
ok('Today at a glance leads with the feedback', /💬 Feedback No rest needed · no refeed needed/.test(t), t.slice(0, 200));
await p.click('#glanceCard button[data-goto="feedback"]'); await p.waitForTimeout(100);
ok('and taps through to it', await p.evaluate(() => !E('s-feedback').hidden));

// ===== losing too fast: a refeed, sized =====
await boot(st({ weights: fast, days: clean() }));
c = await C();
ok('losing too fast: yes to a refeed', c.refeed.k === 'yes' && /Yes — have a refeed this week/.test(c.refeed.t), JSON.stringify(c.refeed));
ok('with the size, carbs, and Saturday', /\+[\d,]+ kcal, about \d+ g of carbs/.test(c.refeed.size || '') && /Saturday works/.test(c.refeed.size || ''), c.refeed.size);
ok('and a suggestion to eat a little more', c.sug.some(x => /Eat a little more/.test(x)), JSON.stringify(c.sug));
ok('the Today banner carries the refeed call too', /A refeed would help|have a refeed this week/.test(sq(await p.innerText('#alertCard'))));

// ===== stalled: no refeed =====
await boot(st({ weights: slow, days: clean() }));
c = await C();
ok('weight slowed: no refeed, and never cut food under two weeks', c.refeed.k === 'no' && /a refeed would slow it more/.test(c.refeed.w) && /never cut food for a plateau under two weeks/.test(c.refeed.w), JSON.stringify(c.refeed));

// ===== a refeed in the last three days =====
let d = clean(); d[iso(1)].refeed = true; d[iso(1)].kcal = 2300;
await boot(st({ weights: good, days: d }));
ok('a recent refeed reads as done', (await C()).refeed.k === 'done');

// ===== a couple of strains: a day or two off =====
d = clean(); for (let i = 0; i < 7; i++) { d[iso(i)].sleep = 6.8; d[iso(i)].study = 3.5; d[iso(i)].deep = 2.5; }
await boot(st({ weights: good, days: d }));
c = await C();
ok('short sleep and too much deep study: a day or two off', c.rest.k === 'days' && /Take a day or two off/.test(c.rest.t) && /sleep is averaging 6\.8 h/.test(c.rest.w), JSON.stringify(c.rest) + ' ' + c.pts);
ok('and says sleep first', /Sleep:/.test(c.sug[0] || ''), JSON.stringify(c.sug));

// ===== no day off in a week: the next day off =====
d = clean(); for (let i = 0; i < 9; i++) d[iso(i)].gym = true;
await boot(st({ weights: good, days: d }));
c = await C();
ok('no day off in 8 days: next day fully off', c.rest.k === 'day' || c.rest.k === 'days', JSON.stringify(c.rest));

// ===== lots of strain at once: an easy week, taken by a tap =====
d = clean(); for (let i = 0; i < 12; i++) { d[iso(i)].gym = true; d[iso(i)].sleep = 6.2; d[iso(i)].mood = 2; }
for (const i of [0, 1, 2]) { d[iso(i)].niggle = true; d[iso(i)].niggleWhat = 'calf'; }
await boot(st({ weights: fast, days: d }));
c = await C();
ok('many strains at once: take an easy week', c.rest.k === 'week' && /Take an easy week/.test(c.rest.t) && /Not a scheduled one/.test(c.rest.w), JSON.stringify(c.rest) + ' ' + c.pts);
await p.click('[data-t="feedback"]'); await p.waitForTimeout(100);
await p.click('#btnEasyWk'); await p.waitForTimeout(150);
ok('tapping “I’m taking it” starts it today', await p.evaluate(() => S.settings.easyFrom === today()));
t = sq(await p.innerText('#fbCard'));
ok('and the card counts it down', /Easy week — 7 days to go/.test(t), t.slice(0, 300));
ok('the runs card drops to one hard run', await p.evaluate(() => { const m = weekRunsModel(); return m.easeOff && !m.P.long; }));
await p.click('#btnEasyOff'); await p.waitForTimeout(150);
ok('and it can be ended early', await p.evaluate(() => !S.settings.easyFrom));

await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
