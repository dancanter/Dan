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
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220); };
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d); };

// ===== 1. nothing logged: it explains itself, it does not accuse ==========
await boot(st());
let t = await p.textContent('#signalCard');
ok('with no data it introduces the three boxes', /Three new boxes on the log/.test(t), t.slice(0, 120));
ok('and says they need history before they mean anything', /read against your own history/.test(t));
ok('it does not pretend to have a reading', !/resting HR is/i.test(t));
// The one thing the label alone could not carry: effort is perceived, not
// intended. Dan asked, which means it was ambiguous, which means it belongs
// on the page rather than in a chat reply.
ok('it defines effort as felt, not tried', /how hard it .?felt.?, not how hard you tried/i.test(t),
  (t.match(/Effort means[^.]{0,80}/) || [''])[0]);
ok('and gives the case that matters', /easy run that felt like an 8 is an 8/.test(t));
ok('it says why that case is the useful one', /fatigue showing up before anything else/.test(t));
ok('and warns that scoring by intent ruins it', /Score it by intent and the whole thing is worthless/.test(t));
// The intro card disappears once anything is logged, so the definition has to
// live beside the field as well, permanently.
await p.click('[data-t="today"]');
const formHint = (await p.textContent('#s-today')).replace(/\s+/g, ' ');
ok('the definition also sits next to the field itself',
  /Effort is how hard it felt, not how hard you tried/.test(formHint),
  (formHint.match(/Effort is[^.]{0,70}/) || [''])[0]);

// ===== 2. the fields exist and round-trip through the store ==============
await boot(st());
await p.click('[data-t="today"]');
await p.fill('#inRhr', '48');
await p.dispatchEvent('#inRhr', 'change');
await p.click('#tgGym');
await p.fill('#inGymRpe', '8');
await p.dispatchEvent('#inGymRpe', 'change');
await p.click('#tgNiggle');
await p.fill('#inNiggle', 'left achilles');
await p.dispatchEvent('#inNiggle', 'change');
await p.waitForTimeout(150);
let rec = await p.evaluate(() => S.days[today()]);
ok('resting HR saves', rec.rhr === 48, JSON.stringify(rec));
ok('gym effort saves', rec.gymRpe === 8, JSON.stringify(rec));
ok('the niggle flag saves', rec.niggle === true);
ok('and so does what hurts', rec.niggleWhat === 'left achilles', rec.niggleWhat);
// The "where" box should not sit on the form as dead space on a day that is fine.
await p.click('#tgNiggle');
await p.waitForTimeout(150);
ok('the where-box hides when nothing hurts',
  await p.$eval('#inNiggle', e => e.closest('.f').hidden));
ok('and the gym effort box hides when there was no gym',
  await p.evaluate(async () => { document.getElementById('tgGym').click(); await new Promise(r => setTimeout(r, 120));
    return document.getElementById('inGymRpe').parentNode.hidden; }));

// ===== 3. a run carries its own effort score =============================
await boot(st());
await p.click('[data-t="today"]');
await p.selectOption('#inKind', 'cont');
await p.fill('#inKm', '5');
await p.fill('#inTime', '25:00');
await p.selectOption('#inRpe', '9');
await p.click('#btnAddRun');
await p.waitForTimeout(180);
rec = await p.evaluate(() => S.days[today()]);
ok('a run stores the effort it was given', rec.runs[0].rpe === 9, JSON.stringify(rec.runs));
ok('and the effort selector offers 1 to 10',
  (await p.$$eval('#inRpe option', o => o.length)) === 11);
// Anchors describe a sensation, never an intention — "easy"/"hard" read as
// how much he decided to push, which is the wrong question.
const anchors = await p.$$eval('#inRpe option', o => o.map(x => x.textContent));
ok('the anchors describe sensation, not intent',
  /barely noticed it/.test(anchors.join(' ')) && /hanging on/.test(anchors.join(' ')) &&
  !/ easy$| hard$/.test(anchors.join(' ')), anchors.filter(a => a.includes('·')).join(' | '));
ok('the run label says felt', /felt/i.test(await p.$eval('label[for="inRpe"]', e => e.textContent)));
ok('and so does the gym one', /felt/i.test(await p.$eval('label[for="inGymRpe"]', e => e.textContent)));

// ===== 4. the RHR baseline: a single reading is never a verdict ==========
// Five mornings is under the minimum, so it must say it is still building
// rather than compare seven days against two.
let days = {}; for (let i = 0; i < 5; i++) days[back(i)] = { rhr: 50 };
await boot(st({ days }));
let R = await p.evaluate(() => rhrModel());
ok('a handful of mornings is not a baseline', R.ready === false && R.state === 'building', JSON.stringify(R.state));
t = await p.textContent('#signalCard');
ok('and it says so plainly', /needs about a fortnight/.test(t), t.slice(0, 200));
ok('it calls the drift the signal, not the reading', /the drift is the signal/.test(t));

// ===== 5. a real rise gets called, against his own numbers ===============
// 21 baseline mornings at 48, then 7 recent at 54 — a 6-beat drift.
days = {};
for (let i = 7; i < 28; i++) days[back(i)] = { rhr: 48 };
for (let i = 0; i < 7; i++) days[back(i)] = { rhr: 54 };
await boot(st({ days }));
R = await p.evaluate(() => rhrModel());
ok('with enough mornings the baseline is ready', R.ready === true, JSON.stringify(R));
ok('the drift is measured, not guessed', Math.abs(R.delta - 6) < 0.01, String(R.delta));
ok('a 6-beat rise reads as high', R.state === 'high', R.state);
t = await p.textContent('#signalCard');
ok('it names the size of the rise', /up 6\.0 beats on your own baseline/.test(t), (t.match(/up [\d.]+ beats[^.]{0,40}/) || [''])[0]);
ok('it says the fix, not just the finding', /Take the next hard day out/.test(t));
ok('and escalates if it persists', /that is a rest week, not a rest day/.test(t));

// A 3-beat rise is a nudge, not an alarm.
days = {};
for (let i = 7; i < 28; i++) days[back(i)] = { rhr: 48 };
for (let i = 0; i < 7; i++) days[back(i)] = { rhr: 51 };
await boot(st({ days }));
R = await p.evaluate(() => rhrModel());
ok('a 3-beat rise is a nudge', R.state === 'up', R.state);
t = await p.textContent('#signalCard');
ok('and is worded as one', /Not alarming on its own/.test(t));

// Down is good news and should be said as good news.
days = {};
for (let i = 7; i < 28; i++) days[back(i)] = { rhr: 52 };
for (let i = 0; i < 7; i++) days[back(i)] = { rhr: 47 };
await boot(st({ days }));
ok('a fall reads as fitness arriving', (await p.evaluate(() => rhrModel())).state === 'down');
t = await p.textContent('#signalCard');
ok('and is given as a green light', /green light for a hard session/.test(t));

// Level is worth one quiet line, not a lecture.
days = {}; for (let i = 0; i < 28; i++) days[back(i)] = { rhr: 49 };
await boot(st({ days }));
ok('steady reads as level', (await p.evaluate(() => rhrModel())).state === 'level');
t = await p.textContent('#signalCard');
ok('and gets one line', /level against your own baseline/.test(t) && !/rest week/.test(t));

// ===== 6. effort counts hard days by HIS score, not by distance =========
// Only days up to today are in the training week, so the fixture stacks the
// sessions onto the days that actually exist rather than dating them forward
// — the app is right to ignore a session logged for next Thursday.
const wk = await p.evaluate(() => trainingModel().wkStart);
const addD = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return ds(d); };
const t0 = await p.evaluate(() => today());
const inWeek = []; for (let i = 0; i < 7; i++) { const d = addD(wk, i); if (d <= t0) inWeek.push(d); }
days = {};
days[inWeek[0]] = { gym: true, gymRpe: 9,
  runs: [{ km: 6, secs: 1800, type: 'easy', rpe: 8 },       // "easy" but he called it an 8
          { km: 8, secs: 2700, type: 'easy', rpe: 3 }] };   // long, and genuinely easy
days[inWeek[inWeek.length - 1]] = { gym: true, gymRpe: 8,
  runs: [{ k: 'reps', dm: 400, n: 5, secs: 320, rpe: 9 },
          { km: 5, secs: 1500, type: 'easy' }] };            // unscored
await boot(st({ days }));
let EF = await p.evaluate(() => effortWeek());
// Four hard against a ceiling of three. Hitting the ceiling exactly is fine;
// going past it is the thing worth interrupting him for.
ok('hard sessions are counted by his own score', EF.hard === 4, JSON.stringify(EF.sessions));
// The 8 km run scored 3 is NOT hard; the 6 km "easy" run scored 8 IS. Distance
// and file-type do not get a vote — that is the whole reason for asking.
ok('a long run he called easy does not count as hard',
  !EF.sessions.some(x => x.rpe === 3 && x.rpe >= 7), JSON.stringify(EF.sessions));
ok('an easy-filed run he called an 8 does count',
  EF.sessions.some(x => x.rpe === 8), JSON.stringify(EF.sessions));
ok('unscored sessions are counted separately, not assumed', EF.unscored === 1, String(EF.unscored));
t = await p.textContent('#signalCard');
const cap = await p.evaluate(() => CFG.rev.hardCap);
ok('going over the ceiling is called out', new RegExp(EF.hard + ' sessions at 7 or above this week').test(t), t.slice(0, 340));
ok('it names the ceiling', new RegExp('the ceiling is ' + cap).test(t));
ok('it ties back to what he asked for', /the exact thing you asked me to catch/.test(t));
ok('and says which session to drop', /drop the speed session rather than the easy one/.test(t));

// Under the ceiling: reported, not scolded — and unscored sessions are named
// as invisible rather than quietly assumed to be easy.
days = {}; days[inWeek[0]] = { gym: true, gymRpe: 8, runs: [{ km: 5, secs: 1500, type: 'easy' }] };
await boot(st({ days }));
t = await p.textContent('#signalCard');
ok('under the ceiling it just reports', /1 hard session this week by your own score/.test(t), t.slice(0, 300));
ok('and does not warn', !/exact thing you asked me to catch/.test(t));
ok('an unscored session is called invisible', /invisible to this count/.test(t),
  (t.match(/without an effort[^.]{0,50}/) || [''])[0]);

// ===== 7. the niggle: one day is information, three is an injury ========
days = {}; days[back(0)] = { niggle: true, niggleWhat: 'left achilles' };
await boot(st({ days }));
let NG = await p.evaluate(() => niggleModel());
ok('one flag is not persistent', NG.n === 1 && NG.persistent === false, JSON.stringify(NG));
t = await p.textContent('#signalCard');
ok('and it is worded as information', /One day is information, not a problem/.test(t));
ok('it says what would change that', /I will say so/.test(t));

days = {};
for (const i of [0, 2, 5]) days[back(i)] = { niggle: true, niggleWhat: 'left achilles' };
await boot(st({ days }));
NG = await p.evaluate(() => niggleModel());
ok('three flags in ten days is persistent', NG.persistent === true, JSON.stringify(NG));
ok('and it knows what hurts', NG.top === 'left achilles', String(NG.top));
t = await p.textContent('#signalCard');
ok('it stops calling it a niggle', /not a niggle any more, it is an injury forming/.test(t));
ok('it names the body part', /left achilles/.test(t));
ok('and gives a real instruction with a cost attached',
  /easy only until it has been quiet for a week/.test(t) && /cheaper than losing the block/.test(t));
// Outside the window it must fall off rather than haunting him forever.
days = {};
for (const i of [12, 14, 17]) days[back(i)] = { niggle: true, niggleWhat: 'left achilles' };
await boot(st({ days }));
ok('old flags fall out of the window', (await p.evaluate(() => niggleModel())).n === 0);

// ===== nothing broke ====================================================
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', r => r.map(x => x.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
