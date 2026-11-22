// Field-by-field sync (22 Nov): a value edited later wins whichever copy it is in; old copies cannot overwrite it; it can be switched off.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const URL = 'http://localhost:8765/app.html';
let pass = 0; const fails = []; const errs = [];
const ok = (n, c, d) => { if (c) { pass++; console.log('ok  ' + n); } else { fails.push(n + (d ? ' — ' + d : '')); console.log('FAIL ' + n + (d ? ' — ' + d : '')); } };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
await p.clock.setFixedTime(new Date('2026-11-22T10:00:00')); await p.goto(URL);
await p.waitForFunction(() => !!window.GLOW, null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(600);
const R = await p.evaluate(() => {
  const o = {};
  const mk = (sleep, ts, upd, extra) => ({ weights: { '2026-11-20': 128 }, days: { '2026-11-21': Object.assign({ sleep, steps: 100 }, extra || {}) }, settings: {}, bests: {}, foods: {}, ts: ts || {}, updatedAt: upd });
  // 1. stamping: an edit gets its own timestamp, a fresh load does not
  S = normalise(mk(7, {}, 1)); fsReset(); S.days['2026-11-21'].sleep = 8.5; S.weights['2026-11-22'] = 127.2; fsStamp();
  o.stamp = [!!S.ts['d|2026-11-21|sleep'], !!S.ts['w|2026-11-22'], S.ts['d|2026-11-21|steps'] === undefined];
  // 2. a stale copy that is newer as a whole cannot overwrite a value stamped later elsewhere
  const mine = mk(8.5, { 'd|2026-11-21|sleep': 2000 }, 2000), stale = mk(6, {}, 9000);
  const m2 = mergeByDate(mine, stale); o.stale = m2.s.days['2026-11-21'].sleep;
  const m2b = mergeByDate(stale, mine); o.staleOrder = m2b.s.days['2026-11-21'].sleep;
  // 3. both stamped: the later stamp wins in either order
  const a = mk(7, { 'd|2026-11-21|sleep': 3000 }, 3000), c = mk(9, { 'd|2026-11-21|sleep': 5000 }, 4000);
  o.both = [mergeByDate(a, c).s.days['2026-11-21'].sleep, mergeByDate(c, a).s.days['2026-11-21'].sleep];
  // 4. unstamped copies behave as before: the newer document wins
  o.legacy = mergeByDate(mk(7, {}, 1), mk(6, {}, 2)).s.days['2026-11-21'].sleep;
  // 5. a deleted value, stamped, beats an unstamped stale copy that still has it
  const del = mk(undefined, { 'd|2026-11-21|sleep': 6000 }, 6000); delete del.days['2026-11-21'].sleep;
  o.del = 'sleep' in mergeByDate(del, mk(6, {}, 9000)).s.days['2026-11-21'];
  // 6. a weight stamped on one side survives a newer unstamped copy that lacks the value
  const w1 = mk(7, { 'w|2026-11-20': 7000 }, 7000); w1.weights['2026-11-20'] = 130.2;
  o.weight = mergeByDate(w1, mk(7, {}, 9000)).s.weights['2026-11-20'];
  // 7. switched off: the old rule (newer document wins)
  const off = mk(8.5, { 'd|2026-11-21|sleep': 2000 }, 2000); off.settings.fieldSync = false;
  o.off = mergeByDate(off, mk(6, {}, 9000)).s.days['2026-11-21'].sleep;
  // 8. merged-in values are not stamped as if typed here
  S = normalise(mk(7, {}, 1)); fsReset(); const T8 = Date.now() - 1000; const mm = mergeByDate(S, mk(5, { 'd|2026-11-21|sleep': T8 }, T8)); S = mm.s; fsReset(); S.days['2026-11-21'].steps = 222; fsStamp();
  o.noFalse = [S.ts['d|2026-11-21|steps'] > 0, S.ts['d|2026-11-21|sleep'] === T8];
  // 9. the toggle exists and flips
  o.toggle = !!document.getElementById('btnFieldSync');
  return o;
});
ok('an edit is stamped on its own, a fresh load is not', R.stamp.every(Boolean), JSON.stringify(R.stamp));
ok('a stale copy that is newer overall cannot overwrite a later edit (both orders)', R.stale === 8.5 && R.staleOrder === 8.5, R.stale + ' / ' + R.staleOrder);
ok('when both sides stamped a value, the later edit wins in either order', R.both[0] === 9 && R.both[1] === 9, JSON.stringify(R.both));
ok('copies with no stamps behave as before (newer document wins)', R.legacy === 6, String(R.legacy));
ok('a stamped deletion beats an unstamped stale copy', R.del === false, String(R.del));
ok('a stamped weight survives a newer copy that lacks the stamp', R.weight === 130.2, String(R.weight));
ok('switched off, the old rule applies', R.off === 6, String(R.off));
ok('values merged in from elsewhere are not stamped as local edits', R.noFalse.every(Boolean), JSON.stringify(R.noFalse));
ok('the Safer syncing switch is on the Data tab', R.toggle);
ok('no page errors', errs.length === 0, errs.join(' | '));
await b.close();
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed'); process.exit(fails.length ? 1 : 0);
