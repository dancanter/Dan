// Coaches, second pass (11 Nov): the full gym session with an optional lift log, run sessions spelled
// out, a run-free week's return plan, and coaches that share notes. Serve mkapptest.py's output on :8765.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const URL = 'http://localhost:8765/app.html';
let pass = 0; const fails = []; const errs = [];
const ok = (n, c, d) => { if (c) { pass++; console.log('ok  ' + n); } else { fails.push(n + (d ? ' — ' + d : '')); console.log('FAIL ' + n + (d ? ' — ' + d : '')); } };
const b = await chromium.launch();
const open = async (seed, when = '2026-11-11T12:00:00') => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.clock.setFixedTime(new Date(when)); await p.goto(URL);
  await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(500);
  await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('cutblock71.v1', JSON.stringify(v)); }, seed);
  await p.reload(); await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 }); await p.waitForTimeout(600);
  return { ctx, p };
};
const text = (p, id) => p.evaluate((i) => { const e = document.getElementById(i); e.querySelectorAll('details').forEach((d) => { d.open = true; }); return e.innerText; }, id);
const base = { weights: { '2026-11-09': 128.4, '2026-11-10': 128.2, '2026-11-11': 128 },
  days: { '2026-11-06': { gym: true, split: 'chest', sets: { Chest: 15, Triceps: 8 }, challenge: { ex: 'bench', kg: 80, reps: 5 } },
    '2026-11-09': { gym: true, split: 'back', sets: { Back: 15, Biceps: 8 } }, '2026-11-11': { sleep: 8.4, rhr: 48 } },
  bests: {}, settings: {}, uni: { mods: [], tasks: [], topics: [], refs: [] } };

// ---- the gym coach: the session, the number to beat, the optional log ----
let { ctx, p } = await open(base);
await p.evaluate(() => document.querySelector('[data-t="phys"]').click()); await p.waitForTimeout(300);
let lc = await text(p, 'liftCoach');
ok('the lifting coach gives the next session exercise by exercise', /Next session: Chest & triceps/i.test(lc) && /Bench press/.test(lc) && /Incline dumbbell press/.test(lc) && /3 × 6–10/.test(lc), lc.slice(0, 300));
ok('it names the number to beat from the last logged lift', /Last: 80 kg × 5/.test(lc) && /80 kg × 6/.test(lc), lc.match(/Last:[^\n]*/)?.[0]);
ok('logging is optional and says so', /Log it \(optional\)/.test(lc) && /Logging is optional/.test(lc));
await p.fill('#liftCoach input[data-lift="bench"][data-f="kg"]', '80');
await p.fill('#liftCoach input[data-lift="bench"][data-f="reps"]', '6');
await p.keyboard.press('Tab'); await p.waitForTimeout(300);
let L = await p.evaluate(() => ({ l: S.days[today()].lifts, pr: S.days[today()].pr }));
ok('weight then reps both save (the card holds still while typing)', L.l && L.l[0].ex === 'bench' && L.l[0].kg === 80 && L.l[0].reps === 6, JSON.stringify(L));
ok('beating last time ticks itself', L.pr === true);
await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.waitForTimeout(2000);
lc = await text(p, 'liftCoach');
ok('and the card shows it was beaten', /beat it/i.test(lc), lc.match(/Bench[\s\S]{0,200}/)?.[0]);
ok('the front page lift bests read the same log', await p.evaluate(() => { const lb = liftBests(today()); return !!lb.bench && lb.bench.kg === 80 && lb.bench.reps === 6; }));
await ctx.close();

// ---- a run-free week: the coaches say so, and the return plan is there ----
({ ctx, p } = await open(Object.assign({}, base, { settings: { walkFrom: '2026-11-09' } })));
let rc = await text(p, 'runCoach');
ok('run-free week: the running coach says so and gives the first week back', /Run-free week to 15 Nov/i.test(rc) && /first week back/i.test(rc) && /Norwegian first/.test(rc) && /No running this week/.test(rc), rc.slice(0, 400));
ok('the road to the December trials is week by week', /road to the December trials/i.test(rc) && /Run-free: walks and gym/.test(rc) && /France 3–5 Dec/.test(rc) && /Trials:/.test(rc));
await p.evaluate(() => document.querySelector('[data-t="phys"]').click()); await p.waitForTimeout(300);
lc = await text(p, 'liftCoach');
ok('the lifting coach hears it from the running coach', /No runs this week \(running coach\)/.test(lc));
await ctx.close();

// ---- a normal week: every run session is spelled out ----
({ ctx, p } = await open(base, '2026-11-17T12:00:00'));
rc = await text(p, 'runCoach');
ok('each session to come has warm-up, main set, recovery, cool-down and a rule', /Warm-up:/.test(rc) && /Main set:/.test(rc) && /Recovery:/.test(rc) && /Cool-down:/.test(rc) && /The rule:/.test(rc) && /Fuel:/.test(rc), rc.slice(0, 500));
ok('the Norwegian carries its pace and the 7 out of 10 rule', /Norwegian:/.test(rc) && /7 out of 10/.test(rc));
await ctx.close();

// ---- a short night changes the ask ----
const tired = JSON.parse(JSON.stringify(base)); tired.days['2026-11-11'].sleep = 6.2;
({ ctx, p } = await open(tired));
await p.evaluate(() => document.querySelector('[data-t="phys"]').click()); await p.waitForTimeout(300);
lc = await text(p, 'liftCoach');
ok('short sleep: same weight, one set fewer', /Short night \(6\.2 h\)/.test(lc) && /one set fewer today/.test(lc) && /2 × 6–10/.test(lc), lc.match(/Short night[^\n]*/)?.[0]);
await ctx.close();

ok('no page errors', errs.length === 0, errs.join(' | '));
await b.close();
console.log(fails.length ? '\nFAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : '\nall passed');
process.exit(fails.length ? 1 : 0);
