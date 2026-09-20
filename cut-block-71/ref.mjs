import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2200 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(200); await p.click('[data-t="training"]'); };

// ---- the reference derives itself ---------------------------------------
await boot(st({}));
let a = await p.evaluate(() => ({ ref: fiveKRef(), auto: refAuto(), cands: refCandidates() }));
ok('it picks a reference on its own', a.ref > 0, String(a.ref));
ok('from the 5 km, which is his best equivalent', a.auto.dm === 5000 && a.auto.t === 1085, JSON.stringify(a.auto));
ok('so the reference is his 18:05', a.ref === 1085, String(a.ref));
ok('candidates are sorted fastest-equivalent first',
  a.cands.every((c, i) => i === 0 || c.eq >= a.cands[i - 1].eq), JSON.stringify(a.cands.map(c => [c.dm, Math.round(c.eq)])));
ok('nothing under 1500m qualifies', a.cands.every(c => c.dm >= 1500), JSON.stringify(a.cands.map(c => c.dm)));
ok('the mile is a candidate too', a.cands.some(c => c.dm === 1609), JSON.stringify(a.cands.map(c => c.dm)));
ok('and the mile is worth about 18:08 over 5 km',
  Math.abs(a.cands.filter(c => c.dm === 1609)[0].eq - 1088) < 4,
  String(Math.round(a.cands.filter(c => c.dm === 1609)[0].eq)));

// ---- getting quicker moves everything -----------------------------------
const before = await p.evaluate(() => ({ ref: fiveKRef(), k3: predictAt(3000), line: effortLine() }));
await p.evaluate(() => { S.bests['1609'] = { t: 300, d: '2026-11-01', n: 'a real mile', src: 'you' }; touch(); });
await p.waitForTimeout(150);
const after = await p.evaluate(() => ({ ref: fiveKRef(), k3: predictAt(3000), line: effortLine(), auto: refAuto() }));
ok('a faster mile pulls the reference down', after.ref < before.ref, before.ref + ' → ' + after.ref);
ok('and it is now the mile driving it', after.auto.dm === 1609, JSON.stringify(after.auto));
ok('the 3 km prediction moves with it', after.k3 < before.k3 - 5, before.k3.toFixed(0) + ' → ' + after.k3.toFixed(0));
ok('and so does the effort line', after.line < before.line, before.line.toFixed(1) + ' → ' + after.line.toFixed(1));
let t = await p.textContent('#tEffort');
ok('the panel says it updates on its own', /It updates on its own/.test(t), t.slice(t.indexOf('Where this'), t.indexOf('Where this') + 300));
ok('and names the effort driving it', /a real mile|at 1 mile/.test(t) || /1 mile/.test(t), t.slice(0, 400));

// a slower effort must not drag it down
const ref2 = await p.evaluate(() => fiveKRef());
await p.evaluate(() => { S.bests['8000'] = { t: 1958, d: '2026-08-24', n: 'economy 8 km', src: 'strava' }; touch(); });
await p.waitForTimeout(150);
ok('an easy 8 km does not drag the reference down',
  (await p.evaluate(() => fiveKRef())) === ref2, String(await p.evaluate(() => fiveKRef())));
t = await p.textContent('#tEffort');
ok('but it is listed, so the working is visible', /8 km/.test(t), t.slice(0, 500));
ok('and it says why a slow one cannot win', /it simply loses to a real effort/.test(t));

// a sprint must never become the reference
await p.evaluate(() => { S.bests['400'] = { t: 50, d: '2026-11-02', n: 'flying', src: 'you' }; touch(); });
await p.waitForTimeout(150);
const withSprint = await p.evaluate(() => ({ ref: fiveKRef(), cands: refCandidates().map(c => c.dm) }));
ok('a 50-second 400 is ignored by the reference', withSprint.ref === ref2, String(withSprint.ref));
ok('and never appears as a candidate', withSprint.cands.indexOf(400) < 0, JSON.stringify(withSprint.cands));
ok('the panel explains that exclusion', /a quick 200 says nothing about a 5 km/.test(await p.textContent('#tEffort')));

// ---- the manual override still works ------------------------------------
await p.fill('#in5k', '16:40');
await p.click('#btn5k');
await p.waitForTimeout(150);
let man = await p.evaluate(() => ({ ref: fiveKRef(), manual: S.settings.fiveKManual, stored: S.settings.fiveK }));
ok('setting it by hand pins it', man.ref === 1000 && man.manual === true, JSON.stringify(man));
t = await p.textContent('#tEffort');
ok('and it says it will not move', /it will not move as you get quicker|stays there until you change it/.test(t), t.slice(t.indexOf('Where this'), t.indexOf('Where this') + 300));
ok('while still showing what automatic would say', /Automatically it would read/.test(t));
await p.click('[data-t="training"]');
t = await p.textContent('#tPredict');
ok('the predictor is honest about being pinned', /you have set the 5 km reference by hand/.test(t), t.slice(-400));

// and back again
await p.click('#btn5kAuto');
await p.waitForTimeout(150);
const back = await p.evaluate(() => ({ ref: fiveKRef(), manual: S.settings.fiveKManual }));
ok('back to automatic restores the derived value', back.manual === false && back.ref === ref2, JSON.stringify(back));
ok('and the predictor says yes again',
  /Yes, this updates as you get better/.test(await p.textContent('#tPredict')));

// ---- no recursion, and no stack blowup ----------------------------------
await boot(st({ days: { '2026-09-20': { runs: [{ type: 'threshold', km: 5, secs: 1100 }] } } }));
const safe = await p.evaluate(() => {
  const out = { ref: fiveKRef(), line: effortLine(), busy: REF_BUSY };
  out.again = fiveKRef();
  return out;
});
ok('a logged continuous run does not cause a loop', safe.ref > 0 && safe.again === safe.ref, JSON.stringify(safe));
ok('and the guard is left clean', safe.busy === false, String(safe.busy));

// ---- nothing broke -------------------------------------------------------
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', rows => rows.map(r => r.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
