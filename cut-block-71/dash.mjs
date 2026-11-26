// The dashboard (Dan, 27 Nov). Opens it at phone and laptop size on seeded data, renders all six views,
// and taps every way of logging: steppers and Save, ticks, gym with its two-tap undo, sets, puffiness,
// yesterday's weight, a planned camp and its deletion, the week review, the charts and the XP panel.
// Also checks his rules on every view: never "behind", none of his excluded foods, no snags, no sideways scroll.
// Serve mkapptest.py's output on :8765.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const URL = process.env.APP_URL || 'http://localhost:8765/app.html';
let pass = 0; const fails = []; const errs = [];
const ok = (n, c, d) => { if (c) { pass++; console.log('ok  ' + n); } else { fails.push(n + (d ? ' — ' + d : '')); console.log('FAIL ' + n + (d ? ' — ' + d : '')); } };
const iso = (d) => d.toISOString().slice(0, 10);
const TODAY = '2026-11-26';
function seed() {
  const days = {}, weights = {}; const t = new Date(TODAY + 'T12:00:00Z');
  for (let i = 1; i < 30; i++) { const d = iso(new Date(t - i * 864e5));
    weights[d] = 128.4 - (30 - i) * 0.04;
    days[d] = { sleep: i % 4 ? 8.2 : 7.4, bed: '23:10', wake: '07:20', rhr: 49 + (i % 3), steps: 12000, kcal: 1799, skinAM: true, skinPM: true, teeth: i % 2 === 0, study: i % 3 ? 2 : 0,
      glowSum: { kcal: 1799, protein: 118, carbs: 195, fat: 55, fibre: 26, coverage: 84, nutrition: 72, glow: 74, plants: 8, omega3: i % 3 ? 0.1 : 1.4, n: 14, names: ['Fage Total 0% Greek yoghurt', 'Potato, with skin', 'Salmon, wild (sockeye)'] } };
    if (i % 2 === 0) Object.assign(days[d], { gym: true, split: ['chest', 'back', 'delts', 'legs'][(i / 2) % 4], sets: { Chest: 12 } });
    if (i % 7 === 3) days[d].runs = [{ k: 'reps', dm: 400, n: 4, secs: 286, up: 'last 120 m' }];
    if (i % 7 === 5) days[d].runs = [{ km: 8, secs: 2367, type: 'easy' }]; }
  days['2026-11-22'].bf = 11.5; days['2026-11-22'].bfRange = [10, 13]; days['2026-11-22'].puff = 3;
  return { weights, days, bests: {}, settings: {}, waist: { '2026-11-22': 72.5 }, uni: { mods: [], tasks: [], topics: [], refs: [] } };
}
const b = await chromium.launch();
const EXCLUDED = /\b(broccoli|sprouts|cabbage|spring greens|pak choi|kale|rocket|watercress|spinach|olive oil|green tea|brazil nuts?|onions?|leeks?|garlic|lentils|beans|liver|beta-carotene|biotin|retinol|sweetener)\b/i;
for (const [label, vp] of [['phone', { width: 390, height: 844 }], ['laptop', { width: 1280, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(label + ': ' + e.message));
  await p.clock.setFixedTime(new Date(TODAY + 'T19:00:00')); await p.goto(URL);
  await p.waitForFunction(() => !!window.GLOW, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(600);
  await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('cutblock71.v1', JSON.stringify(v)); }, seed());
  await p.reload(); await p.waitForFunction(() => !!window.GLOW, null, { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelector('#tabs button[data-t="dash"]').click()); await p.waitForTimeout(300);
  ok(`${label}: the dashboard opens from its tab`, await p.isVisible('#s-dash') && !(await p.isVisible('#s-today')));
  const views = await p.$$eval('#dzNav [data-dzv]', (x) => x.map((e) => e.dataset.dzv));
  ok(`${label}: six views`, views.join(',') === 'today,food,train,body,camp,week', views.join(','));
  for (const v of views) {
    await p.evaluate((v) => document.querySelector('#dzNav [data-dzv="' + v + '"]').click(), v); await p.waitForTimeout(250);
    const r = await p.evaluate(() => ({ text: document.getElementById('dzBody').innerText, w: document.documentElement.scrollWidth, cards: document.querySelectorAll('#dzBody .dz-card').length }));
    ok(`${label} ${v}: renders (${r.cards} cards)`, r.cards >= 2 && !/hit a snag/.test(r.text), (r.text.match(/hit a snag[^.]*/) || [''])[0]);
    ok(`${label} ${v}: no sideways scroll`, r.w <= vp.width + 1, 'scrollWidth ' + r.w);
    ok(`${label} ${v}: never "behind"`, !/\bbehind\b/i.test(r.text));
    const ex = r.text.match(EXCLUDED); ok(`${label} ${v}: none of his excluded foods or banned supplements`, !ex, ex && ex[0]);
  }
  if (label === 'laptop') { await ctx.close(); continue; }
  const st = () => p.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')));
  await p.evaluate(() => document.querySelector('#dzNav [data-dzv="today"]').click()); await p.waitForTimeout(200);
  const big = await p.$$eval('.dz-big', (x) => x.map((e) => e.innerText.replace(/\s+/g, ' ')));
  ok('the three big numbers: longevity, health age, cortisol', big.length === 3 && /Longevity/.test(big[0]) && /Health age/.test(big[1]) && /Cortisol/.test(big[2]), big.join(' | '));
  // sleep is logged as bed and wake times plus the phone tick (Dan, 27 Nov), never as bare hours
  ok('sleep has no bare-hours box', !(await p.$('#dzIn-sleep')) && !!(await p.$('#dzIn-bed')) && !!(await p.$('#dzIn-wake')));
  await p.fill('#dzIn-bed', '23:15'); await p.fill('#dzIn-wake', '07:45'); await p.waitForTimeout(100);
  ok('sleep: the hours work themselves out as you type (in bed minus 15 min)', /8\.3 h asleep/.test(await p.textContent('#dzSleepCalc')), await p.textContent('#dzSleepCalc'));
  await p.click('.dz-sleep [data-dztg="phoneOut"]'); await p.waitForTimeout(200);
  ok('sleep: ticking the phone keeps the times you typed', (await p.inputValue('#dzIn-bed')) === '23:15' && (await p.inputValue('#dzIn-wake')) === '07:45');
  await p.click('[data-dzsave="sleeptimes"]'); await p.waitForTimeout(250);
  let S = await st(); const sd = S.days[TODAY] || {};
  ok('sleep: saves bed, wake, hours and phone-out to the Log panel’s fields', sd.bed === '23:15' && sd.wake === '07:45' && sd.sleep === 8.3 && sd.phoneOut === true, JSON.stringify(sd));
  ok('sleep score: 8.3 h, in bed 23:15, phone out, steady bed and wake times = 100', await p.evaluate((d) => sleepScoreOn(d) === 100, TODAY));
  ok('sleep score: 6.5 h, in bed at midnight, phone in bed, steady = 45 to 50', await p.evaluate(() => { const d = '2026-11-24', o = S.days[d]; S.days[d] = Object.assign({}, o, { sleep: 6.5, bed: '00:00', wake: '06:45' }); delete S.days[d].phoneOut; const v = sleepScoreOn(d); S.days[d] = o; return v >= 45 && v <= 50; }));
  ok('sleep score: consistency reads wake times too', await p.evaluate(() => { const d = '2026-11-20', keep = {}; for (let i = 0; i < 7; i++) { const k = addD(d, -i); keep[k] = S.days[k]; S.days[k] = Object.assign({}, keep[k], { wake: i % 2 ? '04:30' : '10:30' }); } const v = sleepScoreOn(d); for (const k in keep) S.days[k] = keep[k]; return v === sleepScoreOn(d) - 10; }));
  ok('the toast names the XP gained', /Sleep saved: 8\.3 h · \+\d+ XP/.test(await p.textContent('#dzToast')), await p.textContent('#dzToast'));
  await p.click('.dz-quests [data-dztg="teeth"]'); await p.waitForTimeout(200); S = await st(); ok('teeth ticks from the day list', S.days[TODAY].teeth === true);
  await p.click('[data-dzgym="back"]'); await p.waitForTimeout(200); S = await st(); ok('gym: one tap logs the split', S.days[TODAY].gym === true && S.days[TODAY].split === 'back');
  await p.fill('[data-dzsets="Back"]', '13'); await p.dispatchEvent('[data-dzsets="Back"]', 'change'); await p.waitForTimeout(200); S = await st(); ok('gym: sets save', S.days[TODAY].sets && S.days[TODAY].sets.Back === 13);
  await p.click('[data-dzgym="back"]'); await p.waitForTimeout(150); S = await st(); ok('gym: the first tap on a logged split only asks', S.days[TODAY].gym === true && /Tap again/.test(await p.textContent('[data-dzgym="back"]')));
  await p.click('[data-dzgym="back"]'); await p.waitForTimeout(200); S = await st(); ok('gym: the second tap removes it', !S.days[TODAY].gym && !S.days[TODAY].sets);
  await p.click('[data-dzpuff="2"]'); await p.waitForTimeout(200); S = await st(); ok('face puffiness saves', S.days[TODAY].puff === 2);
  await p.click('[data-dzld="-1"]'); await p.waitForTimeout(100); await p.fill('#dzIn-weight', '126.9'); await p.click('[data-dzsave="weight"]'); await p.waitForTimeout(200);
  S = await st(); ok('yesterday’s weight saves on yesterday', S.weights['2026-11-25'] === 126.9, String(S.weights['2026-11-25']));
  await p.fill('#dzIn-weight', '500'); await p.click('[data-dzsave="weight"]'); S = await st(); ok('a silly weight is refused', S.weights['2026-11-25'] === 126.9 && /between/.test(await p.textContent('#dzToast')));
  await p.evaluate(() => document.querySelector('#dzNav [data-dzv="body"]').click()); await p.waitForTimeout(200);
  const hits = await p.$$('.dz-hit'); await hits[hits.length - 1].dispatchEvent('pointerdown'); await p.waitForTimeout(100);
  const tip = await p.evaluate(() => { const x = document.querySelector('.dz-tt:not([hidden])'); return x ? x.textContent : ''; });
  ok('charts: tapping a day shows its value', /lb avg|Thursday 26 November/.test(tip), tip);
  await p.evaluate(() => document.querySelector('#dzNav [data-dzv="camp"]').click()); await p.waitForTimeout(200);
  ok('the mini camp is built in, with its countdown', /Mini camp/.test(await p.textContent('.dz-campcard')) && /11\s*days until it starts/.test(await p.textContent('.dz-campcard')));
  await p.click('[data-dzform="1"]'); await p.fill('#dzCfName', 'Spring build'); await p.fill('#dzCfFrom', '2027-01-10'); await p.fill('#dzCfTo', '2027-02-21'); await p.click('[data-dzcsave="1"]'); await p.waitForTimeout(250);
  S = await st(); ok('a new camp saves as an object', Array.isArray(S.camps) && S.camps.length === 1 && S.camps[0].goals.gymWk >= 1, JSON.stringify(S.camps));
  ok('the new camp is shown', /Spring build/.test(await p.textContent('.dz-campcard')));
  const merged = await p.evaluate(() => { const a = normalise(JSON.parse(JSON.stringify(S))), o = normalise(JSON.parse(JSON.stringify(S))); delete a.camps; return mergeByDate(o, a).s.camps; });
  ok('camps survive a sync with a copy that lacks them', Array.isArray(merged) && merged.length === 1);
  await p.click('[data-dzcdel]'); await p.click('[data-dzcdel]'); await p.waitForTimeout(200); S = await st(); ok('a camp deletes with two taps and stays deleted', S.camps.length === 0 && S.campsGone.length === 1);
  await p.evaluate(() => document.querySelector('#dzNav [data-dzv="week"]').click()); await p.click('[data-dzwk="-1"]'); await p.waitForTimeout(200);
  ok('week review steps back a week', /Last week/.test(await p.textContent('#dzBody')));
  const next = await p.evaluate(() => { const c = [...document.querySelectorAll('#dzBody .dz-card')].find((x) => /For next week/.test(x.textContent)); return c ? c.innerText : ''; });
  ok('next week’s advice never asks for more steps', next && !/Steps \(/.test(next), next.slice(0, 160));
  await p.click('.dz-hc[data-dztip]'); ok('week heat map: tapping a square explains it', /·/.test(await p.textContent('#dzHeatRead')));
  await p.evaluate(() => document.querySelector('#dzNav [data-dzv="today"]').click()); await p.click('[data-dzopen="xp"]'); ok('XP panel opens', /How XP works/.test(await p.textContent('#dzBody')));
  const xpSteps = await p.evaluate(() => { const d = '2026-11-20'; const a = dzXPday(d).xp; S.days[d].steps = 30000; const c = dzXPday(d).xp; return a === c; });
  ok('XP never rewards more steps', xpSteps);
  await p.click('#dzNav .dz-full'); ok('“Full app” opens the old Overview', await p.isVisible('#s-today'));
  await ctx.close();
}
ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed (' + pass + ')');
await b.close(); process.exit(fails.length ? 1 : 0);
