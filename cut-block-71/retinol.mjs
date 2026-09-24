import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2600 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220); await p.click('[data-t="skin"]'); };

await boot(st({}));
const m = await p.evaluate(() => retinolModel());
ok('it starts Thursday 24 September', m.start === '2026-09-24', m.start);
// Derived: this used to hardcode "2 days away" and broke the next morning.
const toGo = await p.evaluate(() => diffD(today(), CFG.retinol.start));
// Before 24 Sep it is counting down; from 24 Sep it has started. The suite has
// to be true on either side of that line, since it runs on real dates.
ok(toGo > 0 ? 'and has not started yet' : 'and it has started, on the day',
  toGo > 0 ? (m.started === false && m.toStart === toGo) : (m.started === true),
  JSON.stringify({ s: m.started, t: m.toStart, toGo }));
ok('phase one is once a week', m.phase.n === 1 && m.phase.days.length === 1, JSON.stringify(m.phase));
ok('on a Thursday', m.phase.days[0] === 4, String(m.phase.days[0]));

let t = await p.textContent('#skRetinol');
ok('the panel names the product', /CeraVe Resurfacing Retinol Serum/.test(t), t.slice(0, 160));
// The long date is the countdown's wording; once started, the date lives in
// the schedule table as "24 Sep". Either way it must be on the panel.
ok('and the start date', toGo > 0 ? /Thursday 24 September/.test(t) : /24 Sep/.test(t), t.slice(0, 200));
ok(toGo > 0 ? 'with the nights away' : 'and says tonight is a retinol night on day one',
  toGo > 0 ? new RegExp(toGo + ' nights? away').test(t) : (toGo === 0 ? /Tonight is a retinol night/.test(t) : true),
  (t.match(/\d+ nights? away|Tonight is[^.]{0,30}/) || [''])[0]);

// the ramp has real dates and gets slower, not faster
const ramp = await p.$$eval('#skRetinol tbody tr', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 4));
ok('four phases with dates', ramp.length === 4, JSON.stringify(ramp));
ok('starting 24 Sep at 1x', /24 Sep/.test(ramp[0]) && /1× a week/.test(ramp[0]), ramp[0]);
ok('2x from 8 Oct', /8 Oct/.test(ramp[1]) && /2× a week/.test(ramp[1]), ramp[1]);
ok('3x from 22 Oct', /22 Oct/.test(ramp[2]) && /3× a week/.test(ramp[2]), ramp[2]);
ok('and it holds there, never nightly', /3× a week/.test(ramp[3]) && /Nightly is not the goal/.test(t), ramp[3]);
ok('only moving up after a calm fortnight', /Only move up if the last fortnight was genuinely calm/.test(t));

// application
ok('a pea for the whole face', /A pea\. For the entire face/.test(t));
ok('sandwiched in moisturiser', /Simple moisturiser first/.test(t) && /moisturiser again/.test(t));
ok('on dry skin, not damp', /wait until the skin is properly dry/.test(t));
ok('and kept off the places that go first', /eyelids and under-eyes/.test(t) && /corners of the mouth/.test(t));

// what pairs and what does not
ok('SPF is called non-optional', /without exception/.test(t) && /not optional/.test(t));
ok('the tallow is excluded on retinol nights', /beef tallow and almond oil/.test(t) && /occlusive seal/.test(t));
ok('acids are out', /Any acid — AHA, BHA/.test(t));
ok('scrubs are out', /Scrubs, flannels/.test(t));
ok('benzoyl peroxide is out', /Benzoyl peroxide/.test(t));
ok('niacinamide is kept', /Niacinamide, in the morning/.test(t));
ok('and Cicaplast is kept', /Cicaplast/.test(t));

// stopping rules and the honest caveats
ok('it says when to stop', /Stop for a week/.test(t));
ok('and to restart a step lower', /restart <b>one step below<\/b>/.test(await p.innerHTML('#skRetinol')));
ok('it names the deficit as a complication', /repairs a barrier more slowly/.test(t));
ok('and that he reacted before', /already reacted to a retinoid once/.test(t));
ok('without using that to refuse', /not a reason not to try again/.test(t));
ok('and it does the birthday arithmetic', /clears 28 November by about three weeks/.test(t));
ok('naming the irritation window', /8 Oct to 5 Nov/.test(t), (t.match(/\d+ \w+ to \d+ \w+/) || [])[0]);

// the old blanket ban is gone from both places
await p.click('[data-t="data"]');
const data = await p.textContent('#s-data');
ok('the hard-constraint row reflects his decision', /Retinol — reintroducing, his call/.test(data), data.slice(0, 400));
ok('and still rules out tretinoin', /Tretinoin is still a no/.test(data));
await p.click('[data-t="skin"]');
ok('the skin tab no longer says never retinol', !/Never retinol or tretinoin/.test(await p.textContent('#s-skin')));

// logging a night
await p.click('[data-t="today"]');
await p.click('#tgRet');
await p.waitForTimeout(150);
ok('a retinol night can be ticked',
  (await p.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')).days[today()].retinol)) === true);
ok('and it counts', (await p.evaluate(() => retinolModel().done)) === 1);

// once it has started, it knows whether tonight is one
await p.evaluate(() => { CFG.retinol.start = '2026-09-15'; render(); });
const live = await p.evaluate(() => retinolModel());
ok('after starting it reports the week', live.started === true && live.weeks === 1, JSON.stringify({ s: live.started, w: live.weeks }));
ok('and lists this week\'s nights as dates', live.nights.every(n => /^\d{4}-\d{2}-\d{2}$/.test(n)), JSON.stringify(live.nights));

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
