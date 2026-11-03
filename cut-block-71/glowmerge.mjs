// One app (3 Nov): Glow lives inside the tracker, on one store.
// Checks the Log panel (binge, sick day, journal), reload persistence, binge
// noise, illness turning the green light to stop, sleep / RHR / steps reaching
// Glow, one food diary with kcal counted once, the review sections, and no
// horizontal scroll at 390 px.
//   node build-app.mjs && python3 mkapptest.py $SP/srv/app.html
//   (cd $SP/srv && python3 -m http.server 8765) & node glowmerge.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL = process.env.APP_URL || 'http://localhost:8765/app.html';
const SHOTS = process.env.SHOTS || '';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + String(x).slice(0, 300) : '')); else console.log('ok  ' + n); };
const D = '2026-11-03';
const seed = {
  weights: { '2026-11-02': 129.6, '2026-11-03': 129.2 },
  days: {
    '2026-11-03': { bed: '22:40', wake: '07:30', rhr: 50, steps: 9000, study: 2, deep: 1.5, gym: true, split: 'back', sets: { Back: 12, Biceps: 6 } },
    '2026-11-02': { runs: [{ k: 'reps', dm: 400, n: 5, secs: 330 }], eaten: [{ id: 'x', n: 'Old oats', a: 60, u: 'g', m: 'breakfast', kcal: 230, pro: 8, carb: 40, fat: 4 }] },
  },
  settings: {},
};
const open = async (when = '2026-11-03T12:00:00', s = seed) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await p.clock.setFixedTime(new Date(when));
  await p.goto(URL);
  await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('cutblock71.v1', JSON.stringify(v)); }, s);
  await p.reload();
  await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 });
  await p.waitForTimeout(600);
  return { ctx, p };
};
const shadow = (p, id) => p.evaluate((i) => { const h = document.getElementById(i); return h && h.shadowRoot ? h.shadowRoot.textContent : ''; }, id);
const tapIn = (p, id, re) => p.evaluate(([i, r]) => { const h = document.getElementById(i).shadowRoot; const btn = [...h.querySelectorAll('button')].find((x) => new RegExp(r).test(x.textContent)); if (btn) btn.click(); return !!btn; }, [id, re]);

let { ctx, p } = await open();

// ---- one store: what the tracker holds reaches Glow -------------------------
const H = await p.evaluate(() => window.__GLOW_HOST__.load());
ok('sleep reaches Glow from bed and wake', H.sleeps.some((x) => x.date === '2026-11-03' && x.bed === '22:40' && x.wake === '07:30'), JSON.stringify(H.sleeps));
ok('morning heart rate and steps reach Glow', H.vitals['2026-11-03'] && H.vitals['2026-11-03'].rhr === 50 && H.vitals['2026-11-03'].steps === 9000, JSON.stringify(H.vitals));
ok('study and deep hours reach Glow', H.vitals['2026-11-03'].studyHours === 2 && H.vitals['2026-11-03'].deepHours === 1.5);
ok('weight reaches Glow in kg', H.weights.some((w) => w.date === '2026-11-03' && Math.abs(w.kg - 129.2 / 2.20462) < 0.05), JSON.stringify(H.weights));
ok('training reaches Glow as sessions: the hard run and the back session', JSON.stringify(H).includes('"hard"') && JSON.stringify(H).includes('"lift"'));

// ---- one diary: the old list moved into Glow, kcal counted once --------------
let r2 = await p.evaluate(() => S.days['2026-11-02']);
ok('the old diary is folded into Glow', !r2.eaten && r2.glow && r2.glow.items.length === 1, JSON.stringify(r2));
ok('and its kcal is Glow’s total, counted once', r2.glowSum && r2.kcal === r2.glowSum.kcal && r2.kcal === 230 && r2.kcalFrom === 'glow', JSON.stringify({ k: r2.kcal, s: r2.glowSum }));
await p.evaluate(() => { const s = document.getElementById('inFood'); const o = [...s.options].find((o) => /Chicken breast, cooked/.test(o.textContent)); s.value = o.value; s.dispatchEvent(new Event('change'));
  document.getElementById('logDate').value = '2026-11-03'; document.getElementById('inAmt').value = '125'; document.getElementById('btnAddFood').click(); });
await p.waitForTimeout(800);
let r3 = await p.evaluate(() => S.days['2026-11-03']);
ok('adding a food from the tracker logs it in Glow', r3.glow && r3.glow.items.length === 1 && !r3.eaten, JSON.stringify(r3.glow));
ok('the day’s kcal is Glow’s total, not added twice', r3.kcal === r3.glowSum.kcal && r3.kcal === 206, JSON.stringify({ k: r3.kcal, s: r3.glowSum && r3.glowSum.kcal }));
ok('the tracker reads Glow’s protein back', await p.evaluate(() => Math.round(eatenTotals(S.days['2026-11-03']).pro)) === 39);

// ---- 😵 binge from the Log panel ----------------------------------------------
await p.click('#btBinge'); await p.waitForTimeout(400);
ok('the binge log opens on Today', /binge/i.test(await shadow(p, 'glowBinge')));
ok('it can be logged', await tapIn(p, 'glowBinge', 'Log it'));
await p.waitForTimeout(500);
ok('the binge is saved on the day', (await p.evaluate(() => (S.days['2026-11-03'].binges || []).length)) === 1);
ok('and the reset card shows', /Reset, don.t restrict/i.test(await shadow(p, 'glowBinge')), (await shadow(p, 'glowBinge')).slice(0, 200));
ok('the next two weigh-ins are noise', await p.evaluate(() => !!postRefeed('2026-11-04') && !!postRefeed('2026-11-05') && !postRefeed('2026-11-06')));

// ---- 🤒 sick day: below the neck stops training ------------------------------
await p.click('#btIll'); await p.waitForTimeout(400);
await tapIn(p, 'glowIll', 'Chest'); await p.waitForTimeout(100);
ok('a sick day can be logged', await tapIn(p, 'glowIll', 'Log sick day'));
await p.waitForTimeout(500);
let L = await p.evaluate(() => ({ ill: S.days['2026-11-03'].ill, g: greenLight() }));
ok('the sick day is saved', L.ill && L.ill.kind === 'chest', JSON.stringify(L.ill));
ok('below the neck turns the green light to stop', L.g.c === 'red' && /no run, no gym/.test(L.g.t), JSON.stringify(L.g));
L = await p.evaluate(() => { const r = S.days['2026-11-03'], keep = r.ill; r.ill = { kind: 'cold', severity: 1 }; const g = greenLight(); r.ill = keep; return g; });
ok('a mild head cold means easy only', L.c === 'amber' && /Easy only/.test(L.t), JSON.stringify(L));

// ---- a big legs day means no hard run the next day (3 Nov) --------------------
L = await p.evaluate(() => { const r = S.days['2026-11-03'], y = S.days['2026-11-02'] = S.days['2026-11-02'] || {}, keep = r.ill, ky = JSON.stringify(y);
  delete r.ill; Object.assign(y, { gym: true, split: 'legs', sets: { Legs: 21 }, runs: [] }); const g = greenLight(); r.ill = keep; Object.assign(S.days['2026-11-02'], JSON.parse(ky)); return g; });
ok('after 21 sets of legs the hard run waits a day', L.c === 'amber' && /big legs day yesterday \(21 sets\)/.test(L.w), JSON.stringify(L));
ok('and the paces are on the Camp tab', await p.evaluate(() => /Hard: long reps/.test(paceGuideHTML(false)) && /Jan → Mar/.test(paceGuideHTML(false))));

// ---- when not to run: a run-free week (3 Nov) ---------------------------------
L = await p.evaluate(() => { const keep = JSON.stringify(S); ['2026-10-25', '2026-10-30'].forEach((d) => { S.days[d] = Object.assign(S.days[d] || {}, { ill: { kind: 'cold', severity: 1 } }); });
  const r = S.days['2026-11-03'], ill = r.ill; delete r.ill; const c = coachModel().rest.k, g = greenLight().t;
  S.settings.walkFrom = '2026-11-03'; const on = coachModel().rest.k, g2 = greenLight().t; Object.assign(S, JSON.parse(keep)); return { c, g, on, g2 }; });
ok('two sick days in a fortnight calls a run-free week', L.c === 'walkweek' && /run-free week/.test(L.g), JSON.stringify(L));
ok('and once started, today is walk, steps and gym', L.on === 'walkon' && /Run-free week — walk, steps and gym/.test(L.g2), JSON.stringify(L));

// ---- 📓 journal ------------------------------------------------------------------
await p.click('#btJournal'); await p.waitForTimeout(200);
await p.click('button[data-jr="mood"][data-n="4"]'); await p.click('button[data-jr="energy"][data-n="3"]');
await p.fill('#jrWell', 'Good back session'); await p.fill('#jrTomorrow', 'TMA reading');
await p.click('button[data-jr="save"]'); await p.waitForTimeout(400);
let J = await p.evaluate(() => ({ j: S.days['2026-11-03'].journal, ex: (S.days['2026-11-03'].glow || {}).extras }));
ok('the journal saves mood, energy and the words', J.j && J.j.mood === 4 && J.j.energy === 3 && J.j.well === 'Good back session' && J.j.tomorrow === 'TMA reading', JSON.stringify(J.j));
ok('and ticks the journal idea in Glow', (J.ex || []).includes('journal'), JSON.stringify(J.ex));
ok('Today shows the compact card', /Good back session/.test(await p.innerText('#jrnlCard')));
if (SHOTS) await p.screenshot({ path: SHOTS + '/today.png', fullPage: true });
ok('no horizontal scroll at 390 px on Today', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390);

// ---- 🏠 Home: goals, health, food search, gym weights ------------------------
const hm = await p.innerText('#homeCard');
ok('Home shows the goals', ['Shred', 'Muscle', 'Running', 'Health age', 'Looks', 'Study', 'Happy'].every((k) => hm.includes(k)), hm.slice(0, 300));
ok('and up to three suggestions, each with how much it matters', /Worth doing next/.test(hm) && /(big difference|helps|small extra)/i.test(hm));
const gh = await shadow(p, 'glowHome');
ok('Glow’s health block is on Home: health age and the food search', /Health age/.test(gh) && /search 4,000\+ foods/.test(gh), gh.slice(0, 200));
await tapIn(p, 'glowHome', 'search 4,000'); await p.waitForTimeout(400);
ok('the food search opens from Home', /Add food|Search/i.test(await shadow(p, 'glowHome')));
await p.keyboard.press('Escape');
ok('this week’s strength challenge is the bench press, with no weights-and-reps log', /Strength challenge · Bench press/.test(await p.innerText('#liftCard')) && !(await p.$('#lfKg')));
await p.click('#tabs button[data-t="phys"]'); await p.waitForTimeout(200);
await p.fill('#chKg', '60'); await p.fill('#chReps', '8'); await p.click('button[data-chal="save"]'); await p.waitForTimeout(200);
ok('the result is saved', JSON.stringify(await p.evaluate(() => S.days['2026-11-03'].challenge)) === '{"ex":"bench","kg":60,"reps":8}');
let lc = await p.innerText('#liftCard');
ok('and rated, with health feedback and how to improve', /Very strong for a man your weight/.test(lc) && /healthy ageing/.test(lc) && /To improve/.test(lc), lc.slice(0, 400));
await p.evaluate(() => { S.days['2026-10-19'] = Object.assign(S.days['2026-10-19'] || {}, { challenge: { ex: 'bench', kg: 57.5, reps: 6 } }); E('liftCard').innerHTML = liftHTML(); });
ok('next time it says how much stronger', /% stronger than/.test(await p.innerText('#liftCard')));
await p.click('#tabs button[data-t="today"]'); await p.waitForTimeout(150);
ok('paces follow recent runs, Norwegian included', await p.evaluate(() => { const g = paceGuide(); return 'N' in g.form && 'L' in g.form; }));

// ---- bug sweep (3 Nov) ------------------------------------------------------------
await p.click('#homeCard summary:has-text("run paces")'); await p.click('#homeCard button[data-t="camp"]'); await p.waitForTimeout(200);
ok('the Full guide button on Home opens the Camp tab', await p.evaluate(() => !document.getElementById('s-camp').hidden));
await p.click('#tabs button[data-t="today"]'); await p.waitForTimeout(150);
ok('a mixed session (1 km + 2 × 500 m) is one hard run, not two', await p.evaluate(() => { const m = runMeta({ k: 'reps', laps: [1000, 500, 500], secs: 402 }); return m.hard && m.km === 2 && /ladder/.test(m.label); }));
await p.click('#tabs button[data-t="glow"][data-g="body"]'); await p.waitForTimeout(700);
ok('Glow’s training list is read-only inside the app', await p.evaluate(() => !document.getElementById('glow-host').shadowRoot.querySelector('select[aria-label="Intensity"], button[aria-label="Remove session"]')));
await p.evaluate(() => window.postMessage({ type: 'glow-screen', id: 'me' }, '*')); await p.waitForTimeout(500);
ok('and Glow cannot reset or overwrite the shared data', await p.evaluate(() => !/Reset everything|Import backup/.test(document.getElementById('glow-host').shadowRoot.textContent)));
await p.click('#tabs button[data-t="today"]'); await p.waitForTimeout(150);

// ---- calm, season, pillars, breathing, the month (3 Nov) -------------------------------
const cc = await p.innerText('#calmCard');
ok('Home has the calm card: stress load, destressers, the season, the film', /\d+\s*\/ 100/.test(cc) && /what brings it down/i.test(cc) && /Slow breathing/.test(cc) && /This season/.test(cc) && /film night/i.test(cc), cc.slice(0, 300));
const gc = await shadow(p, 'glowCalm');
ok('and the 8 pillars with the breathing timer', /Your 8 pillars today/i.test(gc) && /Breathe/.test(gc), gc.slice(0, 200));
await p.evaluate(() => { const st = window.__GLOW_HOST__.load(); st.breathMinutes = Object.assign({}, st.breathMinutes, { '2026-11-03': 10 }); window.__GLOW_HOST__.save(st, {}); });
ok('breathing in Glow counts as meditation in the tracker', (await p.evaluate(() => S.days['2026-11-03'].medMin)) === 10);
ok('the month review is on the Review tab', await p.evaluate(() => /November 2026/.test(monthReviewHTML('2026-11')) && /Ideas for next month/.test(monthReviewHTML('2026-11')) && /France in/.test(monthReviewHTML('2026-11'))));

// ---- eight sections (3 Nov) -------------------------------------------------------
ok('eight sections on top', (await p.$$eval('#secs button', (b) => b.map((x) => x.textContent))).join('|') === '☀️Overview|🏃Running|💪Physique|🍽️Nutrition|🧬Longevity|🌙Recovery|🎓University|🏆Goals & PBs');
await p.click('#secs button[data-sec="run"]'); await p.waitForTimeout(200);
ok('a section opens its first page and shows only its own pages', await p.evaluate(() => CUR === 'camp' && [...document.querySelectorAll('#tabs button.insec')].map((b) => b.dataset.t).join() === 'camp,times,training'));
ok('food, calm and strength live in their own sections; the run form is folded (runs come from sync)', await p.evaluate(() => !!document.querySelector('#s-nutri #glowHome') && !!document.querySelector('#s-calm #calmCard') && !!document.querySelector('#s-phys #liftCard') && !!document.querySelector('#runEntry #btnAddRun') && !document.querySelector('#s-today #calmCard')));
await p.click('#secs button[data-sec="over"]'); await p.waitForTimeout(200);
ok('the Overview keeps the extras in one fold', await p.evaluate(() => CUR === 'today' && !!E('moreToday') && !!E('moreToday').querySelector('#glanceCard')));

// ---- the running coach (3 Nov) ----------------------------------------------------
ok('Running opens on one coach card: last run, the week, next, goals', await p.evaluate(() => { const t = E('runCoach').innerText; return /Your running coach/.test(t) && /This week/.test(t) && /Next/.test(t); }));
ok('then achievements & best runs and the muscles card; the menus moved to the Training log', await p.evaluate(() => /Achievements & best runs/.test(E('runWins').innerText) && /How your muscles are doing/.test(E('muscleFun').innerText) && !!document.querySelector('#s-training #campCard') && !document.querySelector('#s-camp #campCard')));
ok('legs show by muscle, and the Legs total follows the split', await p.evaluate(() => { S.days['2026-11-02'] = Object.assign(S.days['2026-11-02'] || {}, { gym: true, split: 'legs', legs: { quads: 8, hamstrings: 5, glutes: 6, calves: 4 }, sets: { Legs: 20 } }); S = normalise(S); E('muscleFun').innerHTML = muscleFunHTML(); return S.days['2026-11-02'].sets.Legs === 23 && /Quads/.test(E('muscleFun').innerText) && /Hamstrings/.test(E('muscleFun').innerText); }));
await p.click('#secs button[data-sec="long"]'); await p.waitForTimeout(700);
ok('Longevity opens on the health & longevity card, with Glow’s health-age panel under it', await p.evaluate(() => CUR === 'longev' && /Resting heart rate/.test(E('longCardTop').innerText) && /Sleep/.test(E('longCardTop').innerText)) && /GLOW AGE|Glow age/i.test(await shadow(p, 'glowHealth')));
await p.click('#secs button[data-sec="over"]'); await p.waitForTimeout(200);

ok('the Overview shows stress: level, the reason, 14 days of bars', await p.evaluate(() => /Stress/.test(E('homeCard').innerText) && /last 14 days/.test(E('homeCard').innerText) && E('homeCard').querySelectorAll('.hm-t i[title]').length === 14));

ok('the health bank: the week added up, a load check, six longevity habits', await p.evaluate(() => { const t = E('bankCard').innerText; return /health bank/.test(t) && /Load check/.test(t) && /Longevity habits: \d of 6/.test(t); }));
ok('and what the food did, nutrient by nutrient, animal foods first', /What your food did for you today/.test(await shadow(p, 'glowHome')));

ok('three more coaches: lifting, longevity, study, each with last, this week, next and goal', await p.evaluate(() => ['liftCoach', 'longCoach', 'studyCoach'].every((id) => { const t = E(id).innerText; return /This week/.test(t) && /Next/.test(t) && /Goal|long game/i.test(t); }) && !!document.querySelector('#s-phys #liftCoach') && !!document.querySelector('#s-longev #longCoach') && !!document.querySelector('#s-study #studyCoach')));

// ---- reload: everything is still there -----------------------------------------
await p.reload(); await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 }); await p.waitForTimeout(600);
const R = await p.evaluate(() => { const r = S.days['2026-11-03']; return { b: (r.binges || []).length, ill: !!r.ill, j: r.journal && r.journal.mood, items: r.glow.items.length, k: r.kcal, l: r.challenge ? 1 : 0 }; });
ok('binge, sick day, journal, food and the challenge survive a reload', R.b === 1 && R.ill && R.j === 4 && R.items === 1 && R.k === 206 && R.l === 1, JSON.stringify(R));

// ---- the journal history on Mind, searchable -------------------------------------
await p.evaluate(() => { S.days['2026-11-01'] = Object.assign(S.days['2026-11-01'] || {}, { journal: { mood: 2, energy: 2, well: 'Long walk', learned: '', tomorrow: '', free: '' } }); touch(); });
await p.click('#tabs button[data-t="mind"]'); await p.waitForTimeout(200);
let hist = await p.innerText('#jrnlHist');
ok('Mind lists the journal, newest first', hist.indexOf('Good back session') >= 0 && hist.indexOf('Good back session') < hist.indexOf('Long walk'), hist.slice(0, 300));
await p.fill('#jrSearch', 'walk'); await p.waitForTimeout(200);
hist = await p.innerText('#jrnlHist');
ok('and the search finds an entry', /Long walk/.test(hist) && !/Good back session/.test(hist), hist.slice(0, 300));

// ---- 🍽️ the Glow tab: no second set of boxes --------------------------------------
await p.click('#tabs button[data-t="glow"][data-g="today"]'); await p.waitForTimeout(1200);
const gt = await shadow(p, 'glow-host');
ok('Glow’s Food screen opens in the app', gt.length > 200, gt.slice(0, 120));
ok('it has no steps or heart-rate boxes of its own', await p.evaluate(() => !document.getElementById('glow-host').shadowRoot.querySelector('input[aria-label*="Steps" i], input[aria-label*="heart" i]')));
if (SHOTS) await p.screenshot({ path: SHOTS + '/glow.png', fullPage: true });
ok('no horizontal scroll at 390 px on Glow', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390);
await ctx.close();

// ---- Sunday 8 pm review: Glow’s week is a section of it ---------------------------
({ ctx, p } = await open('2026-11-08T20:30:00', { ...seed, days: { ...seed.days,
  '2026-11-04': { journal: { mood: 4, energy: 4, well: 'x' } }, '2026-11-05': { journal: { mood: 2, energy: 3, well: 'y' }, binges: [{ at: '21:00', kind: 'sweet' }] }, '2026-11-06': { ill: { kind: 'cold', severity: 1 } } } }));
await p.click('#tabs button[data-t="review"]'); await p.waitForTimeout(1500);
const rv = await p.innerText('#revBody');
ok('the Review tab has the food, cells and mind section', /Food, cells & mind/.test(rv), rv.slice(0, 200));
ok('with the journal’s mood and energy', /mood 3\.0\/5/.test(rv) && /energy 3\.5\/5/.test(rv), (rv.match(/Journal[^\n]*/) || [''])[0]);
ok('binges and sick days', /1 binge/.test(rv) && /1 sick day/.test(rv));
const gr = await shadow(p, 'glowReview');
ok('Glow’s cellular review sits under it, for the same week', /Weekly review/.test(gr) && /Cut vs maintenance/i.test(gr), gr.slice(0, 160));
ok('there is no second, standalone review in Glow’s Me screen', await p.evaluate(() => { const h = document.getElementById('glow-host'); return !h.shadowRoot || !/Weekly review ·/.test(h.shadowRoot.textContent); }));
if (SHOTS) await p.screenshot({ path: SHOTS + '/review.png', fullPage: true });
ok('no horizontal scroll at 390 px on Review', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390);
const camp = await p.evaluate(() => campReviewHTML('2026-11-02'));
ok('the Sunday camp review carries the same section', /Food, cells &amp; mind/.test(camp) && /mood <b>3\.0<\/b>/.test(camp), camp.slice(-600));
await ctx.close();

// ---- food logged in the old, separate Glow is folded into the one diary (3 Nov) --------
({ ctx, p } = await open());
await p.evaluate(() => { localStorage.setItem('glow-state-v1', JSON.stringify({ days: { '2026-11-03': { items: [{ uid: 'old1', foodId: 'oats', grams: 70, meal: 'breakfast' }, { uid: 'old2', foodId: 'uk-hake', grams: 125, meal: 'lunch' }] } } })); });
await p.reload(); await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 }); await p.waitForTimeout(800);
const OG = await p.evaluate(() => ({ items: (S.days['2026-11-03'].glow || {}).items.map((i) => i.uid), k: S.days['2026-11-03'].kcal }));
ok('old Glow food shows up in the one diary', OG.items.includes('old1') && OG.items.includes('old2'), JSON.stringify(OG));
ok('and counts toward the day', OG.k > 300, JSON.stringify(OG));
await p.reload(); await p.waitForTimeout(800);
ok('without being added twice', (await p.evaluate(() => S.days['2026-11-03'].glow.items.filter((i) => i.uid === 'old1').length)) === 1);
await ctx.close();

await b.close();
ok('no page errors', errs.length === 0, errs.slice(0, 4).join(' | '));
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('all passed');
