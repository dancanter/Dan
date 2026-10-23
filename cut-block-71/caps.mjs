import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 430, height: 1600 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 240)); });
const fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };

const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';

// Shapes copied from two real calls against Dan's own connector. The values are
// his, so they are only ever used to prove the parsing; nothing is baked in.
const ACTS = {
  activities: [
    { id: '20198617880', name: '8km fun run with 1km at fast ish pace on 6km', sport_type: 'Run',
      start_local: '2026-09-16T12:09:52', summary: { distance: 8008.3, moving_time: 2231, elapsed_time: 2231 } },
    { id: '20114146097', name: '3 x 400 m speed explosive workout very intense day after legs and a hard session',
      sport_type: 'Run', start_local: '2026-09-10T10:32:59', summary: { distance: 1220.2, moving_time: 187, elapsed_time: 1770 } },
    { id: 'ride1', name: 'A bike ride', sport_type: 'Ride',
      start_local: '2026-09-12T10:00:00', summary: { distance: 30000, moving_time: 3600, elapsed_time: 3600 } }
  ],
  has_next_page: true
};
// The 3 x 400: a real 400, plus a half mile and a kilometre timed straight
// through the standing recoveries.
const PERF = {
  '20114146097': { best_efforts: [
    { name: 'Fastest400', type_value: 'Fastest400', value: 60 },
    { name: 'FastestHalfMile', type_value: 'FastestHalfMile', value: 843 },
    { name: 'Fastest1k', type_value: 'Fastest1k', value: 1735 }] },
  '20198617880': { best_efforts: [
    { name: 'Fastest1k', type_value: 'Fastest1k', value: 179 },
    { name: 'Fastest5k', type_value: 'Fastest5k', value: 1300 }] }
};

// Install a stub window.claude BEFORE any page script runs, exactly as the real
// runtime does. `mode` decides what use() hands back.
const INIT = (mode, data) => `(() => {
  const MODE = ${JSON.stringify(mode)}, D = ${JSON.stringify(data)};
  window.__calls = [];
  const mkMcp = () => ({
    watchTool(server, tool, input, handler, opts) {
      window.__calls.push({ m: 'watchTool', server, tool, input, opts });
      setTimeout(() => {
        if (D.watchError) handler({ type: 'error', error: { code: D.watchError, message: 'stub' } });
        else handler({ type: 'data', result: { payload: D.acts, cache: { storedAt: D.storedAt, revalidating: false } } });
      }, 0);
      return () => window.__calls.push({ m: 'unsubscribe' });
    },
    callTool(server, tool, input) {
      window.__calls.push({ m: 'callTool', server, tool, input });
      if (D.callError) return Promise.reject({ code: D.callError, message: 'stub' });
      return Promise.resolve({ payload: D.perf[input.activity_id] || { best_efforts: [] } });
    }
  });
  const store = { doc: null };
  const mkDb = () => ({
    doc(path) {
      window.__calls.push({ m: 'doc', path });
      return {
        get: () => Promise.resolve({ exists: !!store.doc, data: () => store.doc }),
        set: v => { store.doc = v; window.__calls.push({ m: 'set', keys: Object.keys(v) }); return Promise.resolve(); },
        onSnapshot: fn => { window.__snap = v => { store.doc = v; fn({ exists: true, data: () => v }); }; return () => {}; }
      };
    }
  });
  window.claude = {
    use(name) {
      window.__calls.push({ m: 'use', name });
      if (MODE === 'none') return Promise.resolve(null);
      if (name === 'mcp') return Promise.resolve(MODE === 'nomcp' ? null : mkMcp());
      if (name === 'db')  return Promise.resolve(MODE === 'nodb'  ? null : mkDb());
      return Promise.resolve(null);
    }
  };
})()`;

const run = async (mode, data = {}) => {
  const ctx = await b.newContext({ viewport: { width: 430, height: 1600 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { const x = m.text();
    if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 240)); });
  const d = Object.assign({ acts: ACTS, perf: PERF, storedAt: Date.UTC(2026, 8, 19, 9, 5) }, data);
  await pg.addInitScript({ content: INIT(mode, d) });
  await pg.goto(FILE);
  await pg.waitForTimeout(250);
  return { ctx, pg };
};

// ---------- the connector answers -----------------------------------------
let { ctx, pg } = await run('ok');
let calls = await pg.evaluate(() => window.__calls);
ok('it asks for mcp', calls.some(c => c.m === 'use' && c.name === 'mcp'), JSON.stringify(calls.map(c => c.m + ':' + (c.name || c.tool || ''))));
ok('and for db', calls.some(c => c.m === 'use' && c.name === 'db'));
const watch = calls.filter(c => c.m === 'watchTool')[0];
ok('it watches list_activities rather than polling by hand', !!watch && watch.tool === 'list_activities', JSON.stringify(watch));
ok('on the Strava connector by display name', watch.server === 'Strava', watch.server);
ok('with a real date range', /^\d{4}-01-01T00:00:00$/.test(watch.input.range_start), JSON.stringify(watch.input));
ok('and a refetch interval above the 30 s floor', watch.opts.refetchInterval >= 30000, String(watch.opts && watch.opts.refetchInterval));

let live = await pg.evaluate(() => LIVE.map(a => ({ d: a.d, dist: a.dist, mov: a.mov })));
ok('runs are parsed from the payload', live.length === 2, JSON.stringify(live));
ok('the bike ride is dropped', !live.some(a => a.dist === 30000), JSON.stringify(live));
ok('the date comes off start_local', live[0].d === '2026-09-16', live[0].d);
ok('distance and moving time survive', live[0].dist === 8008.3 && live[0].mov === 2231, JSON.stringify(live[0]));

await pg.click('[data-t="wins"]');
let t = await pg.textContent('#winRecords');
ok('the header says it synced', /Synced from Strava/.test(t), t.slice(0, 160));
const stamped = await pg.evaluate(() => LIVEst.at);
ok('the timestamp is the cache stamp, not now', stamped === Date.UTC(2026, 8, 19, 9, 5), String(stamped));

// ---------- pulling single bests, and the rest-interval junk ---------------
await pg.click('#btnPull');
await pg.waitForTimeout(300);
const bests = await pg.evaluate(() => JSON.parse(JSON.stringify(S.bests)));
ok('a real 400 from a rep session is kept', bests['400'] && bests['400'].t === 60, JSON.stringify(bests['400']));
ok('the half mile timed through the recoveries is thrown away',
  !(bests['805'] && bests['805'].t === 843), JSON.stringify(bests['805'] || null));
ok('so is the 29-minute kilometre', !(bests['1000'] && bests['1000'].t === 1735), JSON.stringify(bests['1000'] || null));
ok('a continuous run\'s kilometre is kept', bests['1000'] && bests['1000'].t === 179, JSON.stringify(bests['1000']));
ok('and its 5 km', bests['5000'] && bests['5000'].t === 1300, JSON.stringify(bests['5000']));
t = await pg.textContent('#winRecords');
ok('it says how many efforts it ignored and why', /ignored — measured through the rest between reps/.test(t), t.slice(0, 400));
const trust = await pg.evaluate(() => [
  trustEffort({ dist: 1220.2, mov: 187, ela: 1770, name: '3 x 400 m' }, 805, 843),
  trustEffort({ dist: 1220.2, mov: 187, ela: 1770, name: '3 x 400 m' }, 400, 60),
  trustEffort({ dist: 8008.3, mov: 2231, ela: 2231, name: '8km fun run' }, 1000, 179),
  trustEffort({ dist: 8008.3, mov: 2231, ela: 2231, name: '8km fun run' }, 10000, 9000)
]);
ok('the trust rule reads: junk, real, real, too slow to be a best',
  JSON.stringify(trust) === '[false,true,true,false]', JSON.stringify(trust));
await ctx.close();

// ---------- the db mirrors state ------------------------------------------
({ ctx, pg } = await run('ok'));
ok('it opens the right document', (await pg.evaluate(() => window.__calls)).some(c => c.m === 'doc' && c.path === 'state/main'));
await pg.fill('#inSteps', '14200');
await pg.dispatchEvent('#inSteps', 'change');
await pg.waitForTimeout(900);
let sets = await pg.evaluate(() => window.__calls.filter(c => c.m === 'set'));
ok('a logged value is written to the artifact store', sets.length >= 1, JSON.stringify(sets.slice(-1)));
ok('and the whole state goes with it', sets[sets.length - 1].keys.indexOf('days') >= 0, JSON.stringify(sets[sets.length - 1].keys));
await pg.click('[data-t="data"]');
ok('the storage line says it is saved', /saved to this artifact/.test(await pg.textContent('#dStatus')), await pg.textContent('#dStatus'));
// a newer snapshot from another device wins
await pg.evaluate(() => window.__snap({ weights: { '2026-09-19': 130.1 }, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() + 60000 }));
await pg.waitForTimeout(150);
ok('a newer remote state replaces the local one',
  (await pg.evaluate(() => S.weights['2026-09-19'])) === 130.1,
  JSON.stringify(await pg.evaluate(() => S.weights)));
await ctx.close();

// ---------- every failure gets its own answer ------------------------------
for (const [code, want] of [
  ['needs_reauth', /needs reconnecting/],
  ['server_not_connected', /Add Strava in claude\.ai Settings/],
  ['selection_required', /choose one when asked/],
  ['not_in_manifest', /switched off for this page/],
  ['server_unavailable', /did not answer/],
  ['rate_limited', /Too many Strava calls/]
]) {
  ({ ctx, pg } = await run('ok', { watchError: code }));
  await pg.click('[data-t="wins"]');
  const txt = await pg.textContent('#winRecords');
  ok('error ' + code + ' gets its own copy', want.test(txt), txt.slice(0, 200));
  if (['needs_reauth', 'server_not_connected', 'not_in_manifest'].indexOf(code) >= 0) {
    ok('  and ' + code + ' retracts the data', (await pg.evaluate(() => LIVE.length)) === 0);
  }
  ok('  and ' + code + ' still renders the verified table', /45\.2 s|2026 records/.test(txt));
  await ctx.close();
}

// ---------- no connector at all: the page is still the page ----------------
({ ctx, pg } = await run('none'));
t = await pg.textContent('#winRecords');
ok('with no capability it says so plainly', /No connector on this view/.test(t), t.slice(0, 160));
ok('and still shows the verified records', /2026 records/.test(t));
await pg.click('[data-t="data"]');
ok('and falls back to browser-only storage', /browser only/.test(await pg.textContent('#dStatus')));
for (const tab of ['today', 'weight', 'food', 'training', 'times', 'sleep', 'study', 'wins', 'review', 'skin', 'data']) {
  await pg.click(`[data-t="${tab}"]`);
  ok('  renders without claude: ' + tab, await pg.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await ctx.close();

// ---------- db present, mcp refused ---------------------------------------
({ ctx, pg } = await run('nomcp'));
await pg.click('[data-t="wins"]');
ok('mcp absent but db present degrades only the Strava part',
  /No connector on this view/.test(await pg.textContent('#winRecords')));
ok('and the store still works', /saved to this artifact/.test(await (async () => { await pg.click('[data-t="data"]'); return pg.textContent('#dStatus'); })()));
await ctx.close();

ok('no page errors anywhere', errs.length === 0, errs.slice(0, 4).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
