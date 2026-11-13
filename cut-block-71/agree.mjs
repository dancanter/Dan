// Every screen agrees with the plan (Dan, 12 Nov; AUDIT.md). Opens every tab at phone size and reads every
// card, including Glow's, then checks that each statement of a target is the plan's. Two weeks are checked:
// a run-free week and a normal push week. Serve mkapptest.py's output on :8765.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const URL = 'http://localhost:8765/app.html';
let pass = 0; const fails = []; const errs = [];
const ok = (n, c, d) => { if (c) { pass++; console.log('ok  ' + n); } else { fails.push(n + (d ? ' — ' + d : '')); console.log('FAIL ' + n + (d ? ' — ' + d : '')); } };
const b = await chromium.launch();
const iso = (d) => d.toISOString().slice(0, 10);
function seed(today, walk) {
  const days = {}, weights = {}; const t = new Date(today + 'T12:00:00Z');
  for (let i = 0; i < 24; i++) { const d = iso(new Date(t - i * 864e5));
    weights[d] = 128.4 - (24 - i) * 0.01;
    days[d] = { sleep: 8.2, bed: '23:10', wake: '07:20', rhr: 48, steps: 11800, kcal: 1799, skinAM: true, skinPM: true,
      glowSum: { kcal: 1799, protein: 138, carbs: 200, fat: 50, fibre: 30, coverage: 85, nutrition: 70, glow: 75, plants: 8, omega3: i % 3 ? 0.1 : 2, n: 12, names: [] } };
    if (i % 2 === 0) Object.assign(days[d], { gym: true, split: ['chest', 'back', 'delts', 'legs'][(i / 2) % 4], sets: { Chest: 12 } }); }
  const mon = new Date(t); mon.setUTCDate(mon.getUTCDate() - ((mon.getUTCDay() + 6) % 7));
  return { weights, days, bests: {}, settings: walk ? { walkFrom: iso(mon) } : {}, uni: { mods: [], tasks: [], topics: [], refs: [] } };
}
async function crawl(today, walk) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.clock.setFixedTime(new Date(today + 'T12:00:00')); await p.goto(URL);
  await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('cutblock71.v1', JSON.stringify(v)); }, seed(today, walk));
  await p.reload(); await p.waitForFunction(() => !!window.GLOW, null, { timeout: 20000 }); await p.waitForTimeout(800);
  const tabs = await p.$$eval('button[role="tab"][data-sec]', (xs) => xs.map((x) => ({ t: x.dataset.t, g: x.dataset.g || '', name: x.textContent.trim() })));
  const plan = await p.evaluate(() => ({ kcal: pKcal(), base: pKcalBase(), protein: PLANV.protein, steps: pSteps(), goal: pGoal(), gym: pGymShort(), gymLong: pGym(), walk: planNow().walk, hostPlan: window.__PLAN__() }));
  const out = [];
  for (const T of tabs) {
    await p.evaluate((T) => { const x = [...document.querySelectorAll('button[role="tab"]')].find((e) => e.dataset.t === T.t && (e.dataset.g || '') === T.g); if (x) x.click(); }, T);
    await p.waitForTimeout(T.t === 'glow' ? 2500 : 500);
    const text = await p.evaluate(() => { const deep = (root, acc) => { root.querySelectorAll('*').forEach((e) => { if (e.shadowRoot) deep(e.shadowRoot, acc); }); acc.push(root); return acc; };
      let s = ''; for (const R of deep(document, [])) R.querySelectorAll(R === document ? '.p' : '.card').forEach((c) => { const r = c.getBoundingClientRect(); if (r.width && r.height) s += '\n' + c.textContent; }); return s.replace(/[ \t]+/g, ' '); });
    out.push({ name: T.name + (T.g ? ' (' + T.g + ')' : ''), text });
  }
  await ctx.close(); return { plan, tabs: out };
}
const all = (R, re) => { const hits = []; for (const T of R.tabs) for (const m of T.text.matchAll(re)) hits.push({ tab: T.name, m, ctx: T.text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).replace(/\n/g, ' ') }); return hits; };
const wrong = (hits, good) => hits.filter((h) => !good(h)).slice(0, 4).map((h) => `[${h.tab}] …${h.ctx}…`).join(' | ');

for (const [label, today, walk] of [['a run-free week', '2026-11-12', true], ['a push week', '2026-11-25', false]]) {
  const R = await crawl(today, walk); const P = R.plan;
  ok(`${label}: ${R.tabs.length} tabs read, plan is ${P.kcal} kcal · ${P.protein} g · steps ${P.steps} · gym ${P.gym} · goal ${P.goal}`, R.tabs.length >= 24 && R.tabs.every((t) => t.text.length > 200), R.tabs.filter((t) => t.text.length <= 200).map((t) => t.name).join(', '));
  ok(`${label}: Glow is handed the same plan`, P.hostPlan.protein === P.protein && P.hostPlan.steps === P.steps && P.hostPlan.goal === P.goal && P.hostPlan.gym === P.gym);
  // calories: every statement of the day's number
  let h = all(R, /(?:hold at|Eat normally —|Calories:?|Strict:|Keep) (\d,\d{3})\b|(\d,\d{3}) — protein at every meal/g);
  ok(`${label}: the day’s calories are ${P.kcal} wherever they are stated (${h.length} places)`, h.length >= 3 && !wrong(h, (x) => (x.m[1] || x.m[2]) === P.kcal), wrong(h, (x) => (x.m[1] || x.m[2]) === P.kcal));
  // steps: every range said about steps is the plan's, an evidence figure, or the single-day band
  h = all(R, /\b(\d{1,2})–(\d{1,2})k\b/g).filter((x) => /step|walk/i.test(x.ctx));
  const stepsOK = new Set([P.steps, '13–14k', '8–10k', '8–12k', '15–18k', '8–14k', '12–15k', '12–13k']);
  ok(`${label}: every steps range is the plan’s ${P.steps} or an evidence figure (${h.length} places)`, h.length >= 3 && !wrong(h, (x) => stepsOK.has(x.m[0])), wrong(h, (x) => stepsOK.has(x.m[0])));
  ok(`${label}: the plan’s steps are on Today, the Coach, the Training log and the Food tab`, ['Today', 'Coach', 'Training log', 'Food (today)'].every((n) => (R.tabs.find((t) => t.name === n) || { text: '' }).text.includes(P.steps) || (!walk && n === 'Coach')), ['Today', 'Coach', 'Training log', 'Food (today)'].filter((n) => !(R.tabs.find((t) => t.name === n) || { text: '' }).text.includes(P.steps)).join(', '));
  // the weight goal
  h = all(R, /\b12[1-5](?:\.\d)?–12[2-6](?:\.\d)?\b/g).filter((x) => !/\d{2}:\d{2}|kg|bpm|\/\d/.test(x.m[0]));
  ok(`${label}: the weight goal is ${P.goal} everywhere (${h.length} places)`, h.length >= 3 && !wrong(h, (x) => x.m[0] === P.goal), wrong(h, (x) => x.m[0] === P.goal));
  // protein targets
  h = all(R, /(?:[Pp]rotein(?: —| to| at| of| near your| within 15% of your)?|aim) (1\d\d) g(?: protein)?(?= a day| every day|,| in | ·|\.|\)| on logged| across)/g).filter((x) => !/so far|logged \d|average|yesterday:|today:/.test(x.ctx.slice(0, 40)));
  ok(`${label}: the protein target is ${P.protein} g wherever it is stated (${h.length} places)`, h.length >= 3 && !wrong(h, (x) => +x.m[1] === P.protein), wrong(h, (x) => +x.m[1] === P.protein));
  // gym a week
  h = all(R, /\b[Gg]ym,? (\d(?:–\d)?)(?: a week|×| this week| times a week)|\blift (\d(?:–\d)?)×/g);
  ok(`${label}: gym is ${P.gym} a week wherever it is stated (${h.length} places)`, h.length >= 2 && !wrong(h, (x) => { const v = x.m[1] || x.m[2]; return v === P.gym || v === P.gym[0]; }), wrong(h, (x) => { const v = x.m[1] || x.m[2]; return v === P.gym || v === P.gym[0]; }));
  // the audit's stale phrases never come back
  const stale = ['12,800', '10,500', '14,500', '13k on weekdays', '10–13k', '122–124', '122–123', 'Gym 3–4', '4 gym sessions', 'four days — the priority', 'about 95 g', 'lift 4×', 'hold at 1,899'];
  const seen = stale.filter((s) => R.tabs.some((t) => t.text.includes(s)));
  ok(`${label}: none of the audit’s stale targets is on any screen`, !seen.length, seen.map((s) => s + ' on ' + R.tabs.filter((t) => t.text.includes(s)).map((t) => t.name).join('/')).join(' · '));
  if (walk) { const bad = ['against a target of', 'One hard run this week, not two'].filter((s) => R.tabs.some((t) => t.text.includes(s)));
    ok('a run-free week: no screen asks for a hard run', P.walk && !bad.length, bad.join(' · ')); }
}
ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
await b.close(); process.exit(fails.length ? 1 : 0);
