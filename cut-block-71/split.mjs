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
// No more length test: an easy run is an easy run whatever the distance.
ok('length no longer sorts them', wk.easy5k === undefined, String(wk.easy5k));
await p.click('[data-t="training"]');
let t = await p.textContent('#tWeek');
ok('the week shows an easy runs row', /Easy runs/.test(t), t.slice(0, 300));
ok('with the count', /Easy runs\s*2/.test(t.replace(/\s+/g, ' ')), t.replace(/\s+/g, ' ').slice(0, 300));
ok('and says distance does not sort them', /A 5 km and a 5 mile easy run are the same thing here/.test(t));

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
// How many days of the week have gone by depends on which day it is, so the
// count is derived rather than pinned to a Tuesday.
const blanks = await p.evaluate(() => {
  const tr = trainingModel(); let n = 0;
  for (let i = 0; i <= diffD(tr.wkStart, today()); i++) {
    const d = addD(tr.wkStart, i), r = S.days[d];
    if (!r || (typeof r.steps !== 'number' && typeof r.kcal !== 'number')) n++;
  }
  return n;
});
ok('and a blank day is left out', new RegExp(blanks + ' not logged, left out').test(await p.textContent('#tWeek')),
  blanks + ' | ' + (await p.textContent('#tWeek')).slice(0, 400));

// ===== 3. the gym split ==================================================
await boot(st({ days: {
  '2026-09-19': { gym: true, split: 'legs' },
  '2026-09-20': { gym: true, split: 'chest' },
  '2026-09-21': { gym: true, split: 'back' },
  '2026-09-22': { gym: true, split: 'calis', push: 180, pull: 42 } } }));
const m = await p.evaluate(() => splitModel());
ok('the four core days are tracked', m.core.length === 4, JSON.stringify(m.core.map(c => c.k)));
ok('legs is recorded', m.core.filter(c => c.k === 'legs')[0].n === 1);
const sinceLegs = await p.evaluate(() => diffD('2026-09-19', today()));
ok('with how long since', m.core.filter(c => c.k === 'legs')[0].since === sinceLegs,
  m.core.filter(c => c.k === 'legs')[0].since + ' vs ' + sinceLegs);
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
ok('calisthenics has its own panel', /Calisthenics/.test(t) && /40-minute test/.test(t));
ok('showing the best', /180/.test(t) && /42/.test(t), t.slice(-400));
// Corrected: a 40-minute max test is ~530 reps and Dan's own brief says big
// calisthenics sessions count as hard days. The old line said the opposite.
ok('a full test is called a hard day, not a free one', /is a hard day, not a free one/.test(t));
ok('and the old free-recovery claim is gone', !/costs almost nothing to recover from/.test(t));
// His record from before this block: 392 push-ups / 138 pull-ups in 40 min.
const CR = await p.evaluate(() => CFG.calis);
ok('the 40-minute record is stored', CR.mins === 40 && CR.push === 392 && CR.pull === 138, JSON.stringify(CR));

// logging a split from Today
await boot(st({ days: { '2026-09-22': {} } }));
await p.click('[data-t="today"]');
await p.selectOption('#inSplit', 'delts');
await p.waitForTimeout(150);
ok('picking a session saves it',
  (await p.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')).days[today()].split)) === 'delts');
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
  (await p.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')).days[today()].push)) === 150);
ok('and reaches the board', (await p.evaluate(() => splitModel().push.v)) === 150);

// ---- the record to beat --------------------------------------------------
// Nothing logged: the panel shows his 392 / 138 as the record and 393 / 139
// as the target.
await boot(st({}));
await p.click('[data-t="training"]');
let cz = (await p.textContent('#tSplit')).replace(/\s+/g, ' ');
ok('with nothing logged the record is his 392', /record push-ups\s*392/.test(cz), (cz.match(/record push-ups.{0,40}/) || [''])[0]);
ok('and 138 pull-ups', /record pull-ups\s*138/.test(cz));
ok('the target is one more of each', /to beat it\s*393 \/ 139/.test(cz), (cz.match(/to beat it.{0,30}/) || [''])[0]);
// A logged test under the record leaves it standing; one over it replaces it.
await boot(st({ days: { [await p.evaluate(() => today())]: { gym: true, split: 'calis', push: 380, pull: 140 } } }));
await p.click('[data-t="training"]');
cz = (await p.textContent('#tSplit')).replace(/\s+/g, ' ');
ok('380 push-ups does not beat 392', /record push-ups\s*392/.test(cz));
ok('140 pull-ups does beat 138', /record pull-ups\s*140\s*new record/.test(cz), (cz.match(/record pull-ups.{0,40}/) || [''])[0]);
ok('and the next target moves with it', /to beat it\s*393 \/ 141/.test(cz), (cz.match(/to beat it.{0,30}/) || [''])[0]);

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

// the per-week / per-session point
ok('it says outright these are weekly totals', /These are weekly totals/.test(t), t.slice(t.indexOf('weekly totals') - 40, t.indexOf('weekly totals') + 200));
ok('and that for his split the week is the session', /the week IS the session/.test(t));
ok('with a worked example', /not six to ten each time you happen to press something/.test(t));
// pick the table by its header, not by position — the panel has several
const perDay = await p.$$eval('#tSplit table', ts => {
  const tbl = ts.filter(x => {
    const h = x.querySelector('thead th');
    return h && h.textContent.trim() === 'Session';
  })[0];
  if (!tbl) return [];
  return Array.from(tbl.querySelectorAll('tbody tr')).map(r =>
    Array.from(r.children).map(c => c.textContent.trim()));
});
ok('a per-session table exists for the four core days', perDay.length === 4, JSON.stringify(perDay));
const chestRow = perDay.filter(r => /Chest/.test(r[0]))[0];
ok('chest day totals chest plus triceps', chestRow && chestRow[1] === '10–18', JSON.stringify(chestRow));
ok('and shows what it is made of', /chest 6–10/.test(chestRow[2]) && /triceps 4–8/.test(chestRow[2]), chestRow[2]);
const backRow = perDay.filter(r => /Back/.test(r[0]))[0];
ok('back day totals back plus biceps', backRow && backRow[1] === '12–20', JSON.stringify(backRow));
const legRow = perDay.filter(r => /Legs/.test(r[0]))[0];
ok('legs day is just legs', legRow && legRow[1] === '4–8', JSON.stringify(legRow));
ok('a second session beats more sets', /a second session beats adding sets to the first/.test(t));

// on the reverse the growth column is the live one
await p.evaluate(() => { CFG.cutEnd = '2026-09-01'; REV_START = addD(CFG.cutEnd, 1); render(); });
t = await p.textContent('#tSplit');
ok('after the cut it switches to growth numbers', /You are on the reverse now/.test(t), t.slice(0, 200));

// ===== the week's runs, totalled and split ===============================
// The older counters overlap (a five-miler is also an easy run), so the split
// has to come from its own mutually exclusive buckets or the total will not
// add up to the parts printed beside it.
const wkStart = await p.evaluate(() => trainingModel().wkStart);
const t0 = await p.evaluate(() => today());
const dsx = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const addDx = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return dsx(d); };
const inWk = []; for (let i = 0; i < 7; i++) { const d = addDx(wkStart, i); if (d <= t0) inWk.push(d); }
const dayA = inWk[0], dayB = inWk[inWk.length - 1];
await boot(st({ days: {
  [dayA]: { runs: [
    { km: 5, secs: 1500, type: 'easy' },
    { km: 8.05, secs: 2600, type: 'fivemile' },          // easy AND a five-miler
    { k: 'reps', dm: 400, n: 5, secs: 320 } ] },          // hard
  [dayB]: { runs: [
    { k: 'reps', dm: 100, n: 8, secs: 120 },              // sprints
    { km: 6, secs: 1300, type: 'threshold' },             // hard — and fast
                                                          // enough to be judged
                                                          // hard, which a 4:20/km
                                                          // "threshold" is not
    ] } } }));
let bk = await p.evaluate(() => trainingModel().week);
ok('the buckets add up to the total', bk.byKind.easy + bk.byKind.hard + bk.byKind.sprint === bk.runs,
  JSON.stringify({ byKind: bk.byKind, runs: bk.runs }));
ok('easy counts the five-miler once', bk.byKind.easy === 2, JSON.stringify(bk.byKind));
ok('hard counts the reps and the threshold', bk.byKind.hard === 2, JSON.stringify(bk.byKind));
ok('sprints are their own bucket', bk.byKind.sprint === 1, JSON.stringify(bk.byKind));
ok('the total is every judged run', bk.runs === 5, String(bk.runs));
// pruneEmptyRuns strips timeless rows on load and the form refuses to make
// one, so the week can never hold an uncounted run — worth pinning, because a
// "not counted" note on the panel would be a clause that can never fire.
await p.evaluate(() => { S.days[today()] = S.days[today()] || {};
  S.days[today()].runs = (S.days[today()].runs || []).concat([{ k: 'reps', dm: 400, n: 4 }]);
  localStorage.setItem('cutblock71.v1', JSON.stringify(S)); });
await p.reload(); await p.waitForTimeout(220);
ok('a timeless run never survives to be counted',
  !(await p.evaluate(() => trainingModel().week.blank)), String(await p.evaluate(() => trainingModel().week.blank)));
await p.click('[data-t="training"]');
let wkTxt = (await p.textContent('#tWeek')).replace(/\s+/g, ' ');
ok('the week panel leads with the total', /5 runs this week/.test(wkTxt), wkTxt.slice(0, 160));
ok('and splits it', /2 easy, 2 hard, 1 sprints/.test(wkTxt), wkTxt.slice(0, 200));
ok('and nothing else is bolted onto that line', !/not counted/.test(wkTxt));

// A quiet week says so rather than printing a row of zeroes.
await boot(st());
await p.click('[data-t="training"]');
wkTxt = (await p.textContent('#tWeek')).replace(/\s+/g, ' ');
ok('with nothing logged it says so plainly', /No runs logged this week yet/.test(wkTxt), wkTxt.slice(0, 120));
ok('and prints no empty split', !/0 easy/.test(wkTxt));

// ===== the per-session ceiling ===========================================
// One muscle once a week means the weekly number IS the session number, so a
// weekly target above what a session can hold is a target he cannot bank.
await boot(st());
await p.click('[data-t="training"]');
await p.waitForTimeout(150);
const cap = await p.evaluate(() => SESSION_CAP);
const need = await p.evaluate(() => CFG.sets.map(x => ({ m: x.m, cut: sessionsNeeded(x.cut[1]), rev: sessionsNeeded(x.rev[1]) })));
ok('nothing in the cut column overflows a session', need.every(x => x.cut === 1), JSON.stringify(need.filter(x => x.cut > 1)));
ok('the big reverse targets do need a second day',
  need.filter(x => x.rev > 1).map(x => x.m).join(',') === 'Chest,Back,Shoulders,Legs,Biceps,Triceps',
  JSON.stringify(need));
ok('and forearms do not, because ten fits', need.find(x => x.m === 'Forearms').rev === 1);
const tSets = await p.textContent('#s-training');
ok('the ceiling is stated as a number', new RegExp('About ' + cap + ' hard sets').test(tSets), tSets.slice(0, 120));
ok('during the cut no muscle is flagged for a split', !/split over \d+ days/.test(tSets),
  (tSets.match(/.{30}split over \d+ days/) || [''])[0]);
ok('and the why-not-now answer is there',
  /volume you cannot recover from is not training/.test(tSets) &&
  /weight on the bar is the one signal/.test(tSets));
ok('it blames recovery, not permission', /not permission, it is recovery/.test(tSets));

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
