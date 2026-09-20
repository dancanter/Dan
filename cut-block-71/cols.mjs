import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2000 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const back = n => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d); };
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const shift = (iso) => p.evaluate(s2 => {
  CFG.cutStart = s2; CUT_DAYS = diffD(CFG.cutStart, CFG.cutEnd) + 1;
  WEIGH_START = mondayOnOrAfter(CFG.cutStart);
  W_WEEKS = Math.ceil((diffD(WEIGH_START, CFG.cutEnd) + 1) / 7);
  PRE_END = addD(WEIGH_START, -1); PRE_DAYS = diffD(CFG.cutStart, WEIGH_START);
  render(); return { elapsed: cutTally().elapsed };
}, iso);

// 5 full weeks of daily mornings, losing steadily
const wts = {};
for (let i = 0; i < 36; i++) wts[back(35 - i)] = +(129 - i * 0.11).toFixed(1);
await p.goto(FILE);
await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, st({ weights: wts })]);
await p.reload();
await shift(back(40));
await p.click('[data-t="weight"]');

// ---- the half-week bias is gone -----------------------------------------
const wk = await p.evaluate(() => weightModel().weeks
  .filter(w => w.n >= 4 && !w.future)
  .map(w => ({ wk: w.wk, n: w.n, avg: +w.avg.toFixed(3), plan: +w.plan.toFixed(3), start: w.start })));
ok('full weeks are being judged', wk.length >= 3, JSON.stringify(wk.map(w => w.wk)));
const check = await p.evaluate(([s]) => {
  const m = weightModel();
  const row = m.weeks.filter(w => w.n >= 4 && !w.future)[1];
  const rs = cutReadings().filter(r => r.d >= row.start && r.d <= addD(row.start, 6));
  const meanOff = rs.reduce((a, r) => a + diffD(WEIGH_START, r.d), 0) / rs.length;
  return {
    plan: row.plan,
    atMean: curveAtDays(m, meanOff),
    atEnd: m.curve[Math.min(row.wk, m.curve.length - 1)],
    meanOff: meanOff, endOff: row.wk * 7
  };
}, [null]);
ok('plan is taken where the average actually sits',
  Math.abs(check.plan - check.atMean) < 1e-9, JSON.stringify(check));
ok('and not at the end of the week',
  Math.abs(check.plan - check.atEnd) > 0.2, JSON.stringify(check));
ok('the mean offset really is mid-week',
  Math.abs(check.meanOff - (check.endOff - 3.5)) < 0.6, JSON.stringify(check));
ok('the old way was harsher by about half a week of loss',
  check.atEnd < check.atMean, check.atEnd + ' vs ' + check.atMean);

// the same rule in the week review
const rev = await p.evaluate(() => {
  const ws = reviewWeeks().filter(w => typeof w.k === 'number' && w.end < today());
  const R = buildReview(ws[1]);
  const m = weightModel();
  const rs = cutReadings().filter(r => r.d >= ws[1].start && r.d <= ws[1].end);
  const meanOff = rs.reduce((a, r) => a + diffD(WEIGH_START, r.d), 0) / rs.length;
  return { plan: R.w.plan, atMean: curveAtDays(m, meanOff), atEnd: m.curve[Math.min(ws[1].k, m.curve.length - 1)] };
});
ok('the week review uses the same midpoint rule', Math.abs(rev.plan - rev.atMean) < 1e-9, JSON.stringify(rev));
ok('and no longer the end of the week', Math.abs(rev.plan - rev.atEnd) > 0.2, JSON.stringify(rev));

// curveAt still works by date
const ca = await p.evaluate(() => {
  const m = weightModel();
  return { byDate: curveAt(m, addD(WEIGH_START, 7)), byDays: curveAtDays(m, 7), c1: m.curve[1] };
});
ok('curveAt by date still agrees with curveAtDays', Math.abs(ca.byDate - ca.byDays) < 1e-9, JSON.stringify(ca));
ok('and day 7 is exactly the end of week 1', Math.abs(ca.byDays - ca.c1) < 1e-9, JSON.stringify(ca));

// ---- the legend ----------------------------------------------------------
await p.$$eval('#wTable details', els => els.forEach(e => { e.open = true; }));
const t = await p.textContent('#wTable');
['Reads', 'Average', 'Plan', 'Diff', 'Change', 'Verdict'].forEach(k =>
  ok('legend explains ' + k, new RegExp('<b>' + k + '</b>').test(t) || t.indexOf(k) >= 0));
ok('it says a negative Diff is ahead', /Negative means you are under the line/.test(t), t.slice(t.indexOf('Diff'), t.indexOf('Diff') + 200));
ok('and a negative Change is down', /Negative means down/.test(t));
ok('it says which to believe', /If Diff and Change disagree, believe Change/.test(t));
ok('and why the position can lie', /drags the whole line down underneath itself/.test(t));
ok('it explains the minus-sign convention once', /a minus sign is weight going the way you want/.test(t));
ok('Average is named as the real weight', /This is your weight for the week/.test(t));
ok('and Plan is not sold as a rule', /it is not a rule/.test(t));

// ---- nothing broke -------------------------------------------------------
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'reverse', 'wins', 'review', 'skin', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', rows => rows.map(r => r.children[0].textContent.trim()));
ok('every self-check passes', checks.every(c => c === 'ok'), checks.join(','));
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
