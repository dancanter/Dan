// Dan's 2025 program in the app (20 Nov): four slots read from the logged week, the running coach spells out
// what is done and what is next, and the lifting, nutrition and longevity coaches know it. Serve mkapptest.py's output on :8765.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const URL = 'http://localhost:8765/app.html';
let pass = 0; const fails = []; const errs = [];
const ok = (n, c, d) => { if (c) { pass++; console.log('ok  ' + n); } else { fails.push(n + (d ? ' — ' + d : '')); console.log('FAIL ' + n + (d ? ' — ' + d : '')); } };
const b = await chromium.launch();
const open = async (seed, when) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.clock.setFixedTime(new Date(when)); await p.goto(URL);
  await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(500);
  await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('cutblock71.v1', JSON.stringify(v)); }, seed);
  await p.reload(); await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 }); await p.waitForTimeout(600);
  return { ctx, p };
};
const text = (p, id) => p.evaluate((i) => { const e = document.getElementById(i); e.querySelectorAll('details').forEach((d) => { d.open = true; }); return e.innerText; }, id);
const wk = (extra = {}) => ({ weights: { '2026-11-16': 127.6, '2026-11-17': 127.4, '2026-11-18': 126.8, '2026-11-19': 126.6, '2026-11-20': 128 },
  days: { '2026-11-15': { gym: true, split: 'legs', sets: { Legs: 16 } },
    '2026-11-16': { gym: true, split: 'back', sets: { Back: 15, Biceps: 7 }, runs: [{ k: 'reps', dm: 1000, n: 3, secs: 591 }], sleep: 8.8, rhr: 48 },
    '2026-11-18': { gym: true, split: 'chest', sets: { Chest: 18, Triceps: 10 }, runs: [{ km: 5.04, secs: 1453, type: 'easy' }], sleep: 8.3, rhr: 50 },
    '2026-11-19': { sleep: 6.4, rhr: 48 },
    '2026-11-20': { sleep: 8, rhr: 48, runs: [{ k: 'reps', dm: 400, n: 4, secs: 286, up: 'last 120 m' }], ...extra } },
  bests: {}, settings: {}, uni: { mods: [], tasks: [], topics: [], refs: [] } });

// ---- Friday evening: A, B and D are done, the sprints are next ----
let { ctx, p } = await open(wk(), '2026-11-20T19:00:00');
let rc = await text(p, 'runCoach');
ok('the running coach shows the program and what is done', /Your program/.test(rc) && /3 of 4 done this week/.test(rc), rc.slice(0, 600));
ok('the longer interval is read from the week and compared with 2025', /Longer interval/.test(rc) && /3 × 1 km/.test(rc) && /off 2025/.test(rc), rc.slice(0, 900));
ok('the 400s with the hill are read and compared with 2025', /400s, last bit uphill/.test(rc) && /4 × 400 ?m part uphill/.test(rc) && /s slower than 2025 \(64–69 s\)/.test(rc));
ok('the easy run is in and its pace is judged against his own easy pace', /Easy 5-miler/.test(rc) && /easy pace ✓/.test(rc));
ok('the sprints are the next session', /Short sharp uphill sprints/.test(rc) && /next/.test(rc));
let lc = await text(p, 'liftCoach');
ok('the lifting coach knows the program', /Your program this week \(running coach\)/.test(lc) && /legs can go any day/.test(lc), lc.slice(-500));
let nc = await text(p, 'nutriCoach');
ok('the nutrition coach knows the program', /Your program this week \(running coach\)/.test(nc), nc.slice(-400));
let gc = await text(p, 'longCoach');
ok('the longevity coach knows the program', /Your program this week \(running coach\)/.test(gc) && /VO₂/.test(gc), gc.slice(-400));
const strip = await p.evaluate(() => document.getElementById('xcampCard').innerText);
ok('the camp card carries the week at a glance', /This week:/.test(strip) && /3 of 4 this week/.test(strip), strip.slice(0, 400));
const ac = await p.evaluate(() => document.getElementById('allCard').innerText);
ok('the overview has one card with the camp, the data and the program together', /Everything in one place/.test(ac) && /Camp score/.test(ac) && /Weight/.test(ac) && /Steps/.test(ac) && /Nutrition score/.test(ac) && /Sleep 8/.test(ac) && /This week/.test(ac), ac.slice(0, 300));
await ctx.close();

ok('C is a fortnightly 200 m session with 80 m uphill sprints in between', /200 m uphill at about 30 s a rep/.test(rc) && /80 m uphill/.test(rc), rc.slice(0,200));
ok('the where-you-are table sets your latest next to spring 2025', /Where you are vs spring 2025/.test(rc) && /17:18/.test(rc) && /3:10–3:13/.test(rc));
ok('nutrition and sleep scores sit in the same table', /Nutrition score/.test(rc) && /Sleep score/.test(rc) && /14-day avg/.test(rc));
{ // the morning after a refeed is water: it stays in the log and is left out of the camp weight averages
  const o = await open(wk({}), '2026-11-22T08:00:00');
  await o.p.evaluate(() => { S.weights['2026-11-22'] = 130.2; S.days['2026-11-21'] = S.days['2026-11-21'] || {}; S.days['2026-11-21'].refeed = true; });
  const r = await o.p.evaluate(() => { const R = wRef('2026-11-22'), M = xcampModel('2026-11-22'); return { tw: R.thisWeek && R.thisWeek.avg, low: R.low, wa: M.wa, n: R.n }; });
  ok('a weigh-in the morning after a refeed is left out of the camp averages', r.tw < 128 && r.wa < 128 && r.low < 127, JSON.stringify(r));
  await o.ctx.close();
}
{ // the progress check: puffiness 1-5, waist, photo ticks, and this week against last
  const o = await open(wk({}), '2026-11-22T08:00:00');
  await o.p.evaluate(() => { S.days['2026-11-17'] = Object.assign(S.days['2026-11-17'] || {}, { puff: 4 }); S.days['2026-11-18'] = Object.assign(S.days['2026-11-18'] || {}, { puff: 4 }); S.waist = { '2026-11-17': 75.5 }; S.days['2026-11-21'] = Object.assign(S.days['2026-11-21'] || {}, { bf: 11.5, bfRange: [10, 13], bfNote: 'baseline photo' }); touch(); });
  await o.p.click('#progCard [data-pc="puff"][data-v="2"]');
  await o.p.waitForTimeout(500);
  await o.p.fill('#pcWaist', '74.5'); await o.p.click('#progCard [data-pc="waist"]');
  await o.p.click('#progCard [data-pc="photoFace"]');
  const r = await o.p.evaluate(() => ({ t: document.getElementById('progCard').innerText, s: S.days['2026-11-22'], w: S.waist['2026-11-22'] }));
  ok('the progress check saves puffiness, waist and the photo tick', r.s.puff === 2 && r.w === 74.5 && r.s.photoFace === true && /Progress check/.test(r.t) && /waist/i.test(r.t), JSON.stringify([r.s, r.w, r.t.slice(0,200)]));
  ok('the progress check shows the photo body-fat estimate', /11\.5%/.test(r.t) && /10.13%/.test(r.t), r.t.slice(0, 300));
  ok('the progress check compares this week with last', /This week/.test(r.t), r.t.slice(0, 300));
  await o.ctx.close();
}
{ // camp goals are 2 hard runs and 4 gym a week (12 and 23 over 40 days) plus study; calm mode shows just four things
  const o = await open(wk({}), '2026-11-22T08:00:00');
  const camp = await o.p.evaluate(() => document.getElementById('xcampCard').innerText);
  ok('the camp goals are 12 hard runs, 23 gym and 57 h of study', /\/ 12/.test(camp) && /\/ 23/.test(camp) && /57/.test(camp), camp.slice(0, 500));
  await o.p.evaluate(() => { S.settings.calm = true; touch(); });
  await o.p.waitForTimeout(400);
  const calm = await o.p.evaluate(() => ({ a: document.getElementById('allCard').innerText, x: document.getElementById('xcampCard').innerText }));
  ok('calm mode shows four things and hides the camp card', /Your four things/.test(calm.a) && /Sleep/i.test(calm.a) && /Protein/i.test(calm.a) && /hard runs/i.test(calm.a) && /Steps/i.test(calm.a) && calm.x.trim() === '', JSON.stringify(calm).slice(0, 400));
  await o.p.click('#btnCalmOff');
  await o.p.waitForTimeout(400);
  const back = await o.p.evaluate(() => document.getElementById('xcampCard').innerText);
  ok('the button brings the camp card back', /Xmas Camp/i.test(back), back.slice(0, 120));
  await o.ctx.close();
}
// ---- Tuesday: only Monday's 1 km reps are done; the 48 h rule holds the next hard session back ----
({ ctx, p } = await open({ weights: { '2026-11-16': 127.6 }, days: { '2026-11-16': { runs: [{ k: 'reps', dm: 1000, n: 3, secs: 591 }], sleep: 8.8, rhr: 48 }, '2026-11-17': { sleep: 8, rhr: 48 } }, bests: {}, settings: {}, uni: { mods: [], tasks: [], topics: [], refs: [] } }, '2026-11-17T12:00:00'));
rc = await text(p, 'runCoach');
ok('one of four done, and the next hard session waits 48 h after the last', /1 of 4 done this week/.test(rc) && /48 h after your last hard session/.test(rc) && /earliest 18 Nov/.test(rc), rc.slice(0, 700));
await ctx.close();

// ---- A fresh week: the interval rotates (last week 1 km reps, so this week 800 m reps) ----
({ ctx, p } = await open({ weights: {}, days: { '2026-11-16': { runs: [{ k: 'reps', dm: 1000, n: 3, secs: 591 }], sleep: 8.8, rhr: 48 }, '2026-11-24': { sleep: 8, rhr: 48 } }, bests: {}, settings: {}, uni: { mods: [], tasks: [], topics: [], refs: [] } }, '2026-11-24T12:00:00'));
rc = await text(p, 'runCoach');
ok('a new week rotates the longer interval to 800 m reps', /0 of 4 done this week/.test(rc) && /4 × 800 m/.test(rc), rc.slice(0, 700));
await ctx.close();

await b.close();
console.log('\n' + (fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed') + (errs.length ? '\npage errors: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(fails.length ? 1 : 0);
