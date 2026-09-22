import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2400 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220); };

// ===== 1. easy runs counted and shown ====================================
await boot(st({ days: {
  '2026-09-21': { runs: [{ km: 5, secs: 1482, type: 'easy' }] },
  '2026-09-22': { runs: [{ km: 7.2, secs: 2300, type: 'easy' }] } } }));
let wk = await p.evaluate(() => trainingModel().week);
ok('every easy run is counted', wk.easy === 2, JSON.stringify({ easy: wk.easy, easy5k: wk.easy5k }));
ok('and only the ~5 km ones count toward the slot', wk.easy5k === 1, String(wk.easy5k));
await p.click('[data-t="training"]');
let t = await p.textContent('#tWeek');
ok('the week shows an easy runs row', /Easy runs/.test(t), t.slice(0, 300));
ok('with the count', /Easy runs\s*2/.test(t.replace(/\s+/g, ' ')), t.replace(/\s+/g, ' ').slice(0, 300));
ok('and says which count toward the slot', /counting toward the five-mile slot/.test(t));

// ===== 2. the deficit is on the week panel ===============================
await boot(st({ days: {
  '2026-09-21': { kcal: 1799, steps: 15000, runs: [{ km: 5, secs: 1482, type: 'easy' }] },
  '2026-09-22': { kcal: 1799, steps: 12000 } } }));
await p.click('[data-t="training"]');
t = await p.textContent('#tWeek');
ok('the week panel shows the deficit', /Deficit so far/.test(t), t.slice(0, 400));
ok('as a negative number', /−[\d,]+/.test(t), (t.match(/−[\d,]+/g) || []).join(','));
ok('with the pounds it equals', /lb ·/.test(t));
ok('and the per-day average', /a day across \d+ logged day/.test(t));
// a blank day is excluded here too
await boot(st({ days: { '2026-09-21': { kcal: 1799, steps: 15000 }, '2026-09-22': { sleep: 7 } } }));
await p.click('[data-t="training"]');
ok('and a blank day is left out', /1 not logged, left out/.test(await p.textContent('#tWeek')),
  (await p.textContent('#tWeek')).slice(0, 400));

// ===== 3. the gym split ==================================================
await boot(st({ days: {
  '2026-09-19': { gym: true, split: 'legs' },
  '2026-09-20': { gym: true, split: 'chest' },
  '2026-09-21': { gym: true, split: 'back' },
  '2026-09-22': { gym: true, split: 'calis', push: 180, pull: 42 } } }));
const m = await p.evaluate(() => splitModel());
ok('the four core days are tracked', m.core.length === 4, JSON.stringify(m.core.map(c => c.k)));
ok('legs is recorded', m.core.filter(c => c.k === 'legs')[0].n === 1);
ok('with how long since', m.core.filter(c => c.k === 'legs')[0].since === 3,
  String(m.core.filter(c => c.k === 'legs')[0].since));
ok('shoulders has never been done', m.core.filter(c => c.k === 'delts')[0].last === null);
ok('so shoulders is what is due', m.due.k === 'delts', JSON.stringify(m.due));
ok('calisthenics is an extra, not a core day', m.extra.some(e => e.k === 'calis') && SPLITCORE(m));
function SPLITCORE(mm) { return !mm.core.some(c => c.k === 'calis'); }
ok('push-up best is kept', m.push && m.push.v === 180, JSON.stringify(m.push));
ok('and pull-up best', m.pull && m.pull.v === 42, JSON.stringify(m.pull));

await p.click('[data-t="training"]');
t = await p.textContent('#tSplit');
['Shoulders + forearms', 'Chest + triceps', 'Back + biceps', 'Legs'].forEach(k =>
  ok('the split lists ' + k, t.indexOf(k) >= 0));
ok('it marks what is up next', /up next/.test(t));
ok('and what was done this week', /this week/.test(t));
ok('the fifth day is called free', /The fifth day is free/.test(t));
ok('naming the three options', /a second go at any of the four, arms, or calisthenics/.test(t));
ok('calisthenics has its own panel', /Calisthenics/.test(t) && /most push-ups/i.test(t));
ok('showing the best', /180/.test(t) && /42/.test(t), t.slice(-400));
ok('and why it suits a cut', /costs almost nothing to recover from/.test(t));

// logging a split from Today
await boot(st({ days: { '2026-09-22': {} } }));
await p.click('[data-t="today"]');
await p.selectOption('#inSplit', 'delts');
await p.waitForTimeout(150);
ok('picking a session saves it',
  (await p.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')).days['2026-09-22'].split)) === 'delts');
ok('the calisthenics boxes stay hidden for a weights day',
  await p.$eval('#s-today .f.calis', e => e.hidden));
await p.selectOption('#inSplit', 'calis');
await p.waitForTimeout(150);
ok('and appear when calisthenics is picked',
  !(await p.$eval('#s-today .f.calis', e => e.hidden)));
await p.fill('#inPush', '150');
await p.dispatchEvent('#inPush', 'change');
await p.waitForTimeout(150);
ok('a push-up count is stored',
  (await p.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')).days['2026-09-22'].push)) === 150);
ok('and reaches the board', (await p.evaluate(() => splitModel().push.v)) === 150);

// unlabelled sessions are chased, not guessed
await boot(st({ days: { '2026-09-21': { gym: true }, '2026-09-22': { gym: true } } }));
await p.click('[data-t="training"]');
ok('gym sessions with no split are flagged', /logged without saying which/.test(await p.textContent('#tSplit')),
  (await p.textContent('#tSplit')).slice(-300));
ok('and none is claimed as done', (await p.evaluate(() => splitModel().core.every(c => c.n === 0))) === true);

// ===== set volume per muscle ============================================
await boot(st({}));
await p.click('[data-t="training"]');
t = await p.textContent('#tSplit');
ok('there is a sets-per-week table', /Hard sets per muscle, per week/.test(t), t.slice(0, 200));
ok('it leads with the honest point', /You cannot build muscle in a real deficit/.test(t));
const splitHtml = await p.innerHTML('#tSplit');
['Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Forearms'].forEach(k =>
  ok('covers ' + k, new RegExp('<b>' + k + '</b>').test(splitHtml)));
const sets = await p.evaluate(() => CFG.sets);
ok('cut numbers are lower than reverse numbers everywhere',
  sets.every(x => x.cut[0] < x.rev[0] && x.cut[1] < x.rev[1]),
  JSON.stringify(sets.map(x => [x.m, x.cut, x.rev])));
ok('legs are the lowest of the big muscles',
  sets.filter(x => x.m === 'Legs')[0].cut[1] <= sets.filter(x => x.m === 'Chest')[0].cut[1],
  JSON.stringify(sets.filter(x => /Legs|Chest/.test(x.m)).map(x => [x.m, x.cut])));
ok('and it says why legs are low', /Legs are low on purpose/.test(t) && /12,800 steps a day/.test(t));
ok('a hard set is defined', /within one to three reps of failure/.test(t));
ok('junk volume is excluded', /Eight real sets beat fourteen soft ones/.test(t));
ok('the load rule is the headline', /drop sets, never load/.test(t));
ok('with the reason', /how people finish a cut smaller than they planned/.test(t));
ok('it warns against adding volume later', /Do not add volume as the block runs/.test(t));
ok('and names the scheduling trap', /heavy legs day next to a hard run day/.test(t));
ok('each muscle is mapped to a split day', /Chest \+ triceps/.test(t) && /Back \+ biceps/.test(t));
ok('and it points at the reverse for growth', /roughly double on the reverse/.test(t));

// on the reverse the growth column is the live one
await p.evaluate(() => { CFG.cutEnd = '2026-09-01'; REV_START = addD(CFG.cutEnd, 1); render(); });
t = await p.textContent('#tSplit');
ok('after the cut it switches to growth numbers', /You are on the reverse now/.test(t), t.slice(0, 200));

// ===== nothing broke =====================================================
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', r2 => r2.map(r => r.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
