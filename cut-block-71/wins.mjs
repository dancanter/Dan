import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [];
const fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d); };
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);

// a db stub whose stored document the test controls
const INIT = (mode, doc) => `(() => {
  const MODE = ${JSON.stringify(mode)}; let DOC = ${JSON.stringify(doc)};
  window.__sets = [];
  window.claude = { use(name) {
    if (name !== 'db' || MODE === 'nodb') return Promise.resolve(null);
    return Promise.resolve({ doc: () => ({
      get: () => new Promise(r => setTimeout(() => r({ exists: !!DOC, data: () => DOC }), MODE === 'slow' ? 400 : 0)),
      set: v => { DOC = v; window.__sets.push(v); return Promise.resolve(); },
      onSnapshot: () => () => {}
    }) });
  } };
})()`;

const open = async (local, mode, remoteDoc) => {
  const ctx = await b.newContext({ viewport: { width: 430, height: 1600 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { const x = m.text();
    if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 240)); });
  if (mode) await pg.addInitScript({ content: INIT(mode, remoteDoc || null) });
  await pg.goto(FILE);
  if (local) { await pg.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [LS, local]); await pg.reload(); }
  await pg.waitForTimeout(mode === 'slow' ? 900 : 350);
  return { ctx, pg };
};

// ===================== the headline is the real best =======================
let { ctx, pg } = await open(st({}), null);
await pg.click('[data-t="wins"]');
let t = await pg.textContent('#winRecords');
let CARDS = {};
const reload = async () => {
  CARDS = await pg.$$eval('#winRecords .goal', els => {
    const o = {};
    els.forEach(e => { const k = e.querySelector('.gn'); if (k) o[k.textContent.trim()] = e.textContent.replace(/\s+/g, ' ').trim(); });
    return o;
  });
};
const card = (label) => CARDS[label] || '';
await reload();
ok('400m leads with the 59, not the 61.3', /59\.0 s|59 s/.test(card('400m')) && card('400m').indexOf('61.3') > card('400m').indexOf('59'),
  card('400m').slice(0, 170));
ok('and labels it a single effort', /single effort/.test(card('400m')), card('400m').slice(0, 170));
ok('the rep average is still shown underneath', /session average 61\.3/.test(card('400m')), card('400m').slice(0, 220));
ok('1 km leads with the 3:00', /3:00/.test(card('1 km')), card('1 km').slice(0, 170));
ok('and shows the rep average underneath', /session average 3:1[23]/.test(card('1 km')), card('1 km').slice(0, 220));

const gaps = await pg.evaluate(() => {
  const rec = records();
  return [400, 1000, 200].map(dm => {
    const b = bestAt(dm, rec[dm]).best;
    return { dm, t: b && b.t, kind: b && b.kind, gap: b && TGT[dm] ? +(b.t - TGT[dm]).toFixed(1) : null };
  });
});
ok('the 400m gap is measured off the 59', gaps[0].gap === 4, JSON.stringify(gaps[0]));
ok('the 1 km gap is measured off the 3:00', gaps[1].gap === 14, JSON.stringify(gaps[1]));
ok('a distance with no single still uses the session average',
  gaps[2].kind === 'session average' && Math.abs(gaps[2].t - 28.07) < 0.02, JSON.stringify(gaps[2]));

const ach = await pg.evaluate(() => achList().filter(g => g.g === 'Speed')[0].items
  .filter(a => /Sub-.*at 400m|Sub-.*at 1 km/.test(a.n)).map(a => a.m));
ok('the sub-55 achievement counts down from the 59', /4\.0 s to go from 59/.test(ach.join('|')), ach.join(' | '));
ok('and says which kind of number that is', /single effort/.test(ach.join('|')), ach.join(' | '));
await ctx.close();

// ===================== entering a best you know ============================
({ ctx, pg } = await open(st({}), null));
await pg.click('[data-t="wins"]');
await pg.selectOption('#mbDist', '600');
await pg.fill('#mbTime', '1:37');
await pg.fill('#mbDate', '2026-09-04');
await pg.fill('#mbNote', 'fastest rep of the 4 x 600m');
await pg.click('#btnAddBest');
await pg.waitForTimeout(150);
t = await pg.textContent('#winRecords');
await reload();
ok('a 600m you typed in becomes the headline', /97\.0 s/.test(card('600m')), card('600m').slice(0, 200));
ok('it is marked as yours, not Strava\'s', /you entered this/.test(card('600m')), card('600m').slice(0, 200));
ok('and the 1:40.1 session average sits under it', /session average 1:40/.test(card('600m')), card('600m').slice(0, 240));
ok('it survives a round trip through storage',
  (await pg.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')).bests['600'].t)) === 97);
ok('it is listed so it can be removed', /fastest rep of the 4 x 600m/.test(t));
await pg.click('[data-delbest="600"]');
await pg.waitForTimeout(150);
t = await pg.textContent('#winRecords');
await reload();
ok('removing it puts the session average back', /1:40/.test(card('600m')) && !/97\.0 s/.test(card('600m')), card('600m').slice(0, 200));

// it refuses nonsense
await pg.selectOption('#mbDist', '600');
await pg.fill('#mbTime', '');
await pg.click('#btnAddBest');
ok('a blank time is refused', /Give the time/.test(await pg.textContent('#mbMsg')), await pg.textContent('#mbMsg'));
await pg.fill('#mbTime', '55:00');
await pg.click('#btnAddBest');
ok('an impossible time is refused', /slower than/.test(await pg.textContent('#mbMsg')), await pg.textContent('#mbMsg'));
await pg.fill('#mbTime', '1:37');
await pg.fill('#mbDate', back(-3));
await pg.click('#btnAddBest');
ok('a date in the future is refused', /has not happened yet/.test(await pg.textContent('#mbMsg')), await pg.textContent('#mbMsg'));
await ctx.close();

// ===================== the trimmed Wins tab ================================
({ ctx, pg } = await open(st({ days: { [back(0)]: { gym: true, runs: [{ k: 'reps', dm: 400, n: 4, secs: 250 }] } } }), null));
await pg.click('[data-t="wins"]');
const wins = await pg.textContent('#s-wins');
['Gym sessions', 'Hard runs', 'Runs, all in'].forEach(k =>
  ok('wins still counts ' + k, wins.indexOf(k) >= 0));
ok('with done, left and target', /Done/.test(wins) && /Left/.test(wins) && /Target/.test(wins));
ok('wins keeps the weight goal', /Weight goal · 122–123 lb/.test(wins), wins.slice(0, 200));
ok('and the weight milestones', /Weight milestones/.test(wins) && /Through 125 lb/.test(wins));
ok('and the times', /2026 records/.test(wins));
// The steps ACHIEVEMENT board is gone; the step AVERAGE was added later by
// request, so the word "Steps" is expected here now — the specific tiles are not.
['Sleep', 'Study', 'A 15,000 weekday', 'A Saturday under the ceiling',
 'Halfway — day', 'Final fortnight', 'nights phone-free'].forEach(k =>
  ok('wins no longer carries ' + k, wins.indexOf(k) < 0, wins.slice(Math.max(0, wins.indexOf(k) - 40), wins.indexOf(k) + 60)));
ok('but it does carry the step average', /Steps, daily average/.test(wins), wins.slice(0, 300));
ok('the unlocked X of Y scoreboard is gone', !/unlocked/i.test(wins));
// but Today still uses the full list
await pg.click('[data-t="today"]');
const full = await pg.evaluate(() => achList().map(g => g.g));
ok('achList is still whole for the Today card', full.length >= 7 && full.indexOf('Sleep') >= 0, JSON.stringify(full));
await ctx.close();

// ===================== saving, and the boot race ===========================
// The real data-loss path: open somewhere new, type before the store answers.
const REMOTE = st({
  weights: { '2026-09-22': 128.4, '2026-09-23': 128.1 },
  days: { '2026-09-22': { gym: true, steps: 15100 }, '2026-09-23': { sleep: 7.75 } },
  updatedAt: Date.now() - 60000
});
({ ctx, pg } = await open(null, 'slow', REMOTE));
await pg.waitForTimeout(60);                       // store has NOT answered yet
await pg.fill('#inSteps', '9000');
await pg.dispatchEvent('#inSteps', 'change');       // local now looks "newer"
await pg.waitForTimeout(1400);                      // let the store answer + debounce
const after = await pg.evaluate(() => ({
  days: Object.keys(S.days).sort(), weights: Object.keys(S.weights).sort(), merged: MERGED
}));
ok('the store\'s days survive typing before it answered',
  after.days.indexOf('2026-09-22') >= 0 && after.days.indexOf('2026-09-23') >= 0, JSON.stringify(after.days));
ok('and its weights do too',
  after.weights.indexOf('2026-09-22') >= 0 && after.weights.indexOf('2026-09-23') >= 0, JSON.stringify(after.weights));
ok('the number typed first is not lost either',
  (await pg.evaluate(() => S.days[today()] && S.days[today()].steps)) === 9000);
ok('it says how many records it merged back', after.merged > 0, String(after.merged));
const pushed = await pg.evaluate(() => window.__sets.length && Object.keys(window.__sets[window.__sets.length - 1].days).sort());
ok('and the merged result is pushed back up', pushed && pushed.indexOf('2026-09-22') >= 0, JSON.stringify(pushed));
await ctx.close();

// normal case: store wins when it is genuinely newer and local is untouched
({ ctx, pg } = await open(st({ days: { [back(9)]: { steps: 1 } }, updatedAt: 1 }), 'ok', REMOTE));
ok('a newer store still wins the dates it has',
  (await pg.evaluate(() => S.days['2026-09-22'].steps)) === 15100);
ok('without dropping what was only local',
  (await pg.evaluate(([d]) => !!S.days[d], [back(9)])) === true);
await ctx.close();

// ===================== the browser-only warning ============================
({ ctx, pg } = await open(st({ days: { [back(0)]: { steps: 12000 } } }), 'nodb'));
ok('it warns loudly when nothing is syncing', /only in this browser/i.test(await pg.textContent('#storeWarn')),
  (await pg.textContent('#storeWarn')).slice(0, 160));
ok('and says how to back it up', /Show export JSON/.test(await pg.textContent('#storeWarn')));
await ctx.close();
({ ctx, pg } = await open(st({ days: { [back(0)]: { steps: 12000 } } }), 'ok'));
ok('and stays quiet when the store is working', (await pg.textContent('#storeWarn')).trim() === '',
  (await pg.textContent('#storeWarn')).slice(0, 120));
await ctx.close();
({ ctx, pg } = await open(st({}), 'nodb'));
ok('and never warns when there is nothing to lose', (await pg.textContent('#storeWarn')).trim() === '');
await ctx.close();

// ===================== everything still renders ============================
({ ctx, pg } = await open(st({ weights: { '2026-09-19': 131.6 }, days: { [back(0)]: { gym: true, steps: 4100 } } }), 'ok'));
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'wins', 'review', 'skin', 'data']) {
  await pg.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await pg.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await pg.click('[data-t="data"]');
const checks = await pg.$$eval('#dChecks tr', rows => rows.map(r => r.children[0].textContent.trim() + ' | ' + r.children[1].textContent.trim()));
ok('every self-check passes', checks.every(c => c.startsWith('ok')), checks.filter(c => !c.startsWith('ok')).join(' ;; '));
await ctx.close();

ok('no page errors anywhere', errs.length === 0, errs.slice(0, 4).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
