import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const sq = s => s.replace(/\s+/g, ' ');
const at = async (when) => {
  const ctx = await b.newContext({ viewport: { width: 430, height: 2400 } });
  await ctx.clock.setFixedTime(new Date(when + 'T12:00:00'));
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  const boot = async (s) => { await p.goto(FILE);
    await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
    await p.reload(); await p.waitForTimeout(250); await p.click('[data-t="today"]'); };
  return { ctx, p, boot };
};

// ===== a Wednesday: a film night by default, weeknight picks =====
let { ctx, p, boot } = await at('2026-09-30');
await boot(st());
let t = sq(await p.innerText('#dayCard'));
ok('your day, in order, no alarm', /YOUR DAY/i.test(t) && /No alarm — the order matters, not the clock/.test(t) && t.indexOf('Deep study') < t.indexOf('Run or walk') && t.indexOf('Run or walk') < t.indexOf('Meditate') && t.indexOf('Gym, 18:00') < t.indexOf('Film night with your yog bowl'), t.slice(0, 500));
await p.click('#dayCard button[data-rt="1"]'); await p.waitForTimeout(100);
ok('tapping a step ticks it for today', await p.evaluate(() => JSON.stringify(S.days[today()].rt) === '[1]'));
await p.click('#dayCard button[data-rt="1"]'); await p.waitForTimeout(100);
ok('tapping again unticks it', await p.evaluate(() => !(S.days[today()] || {}).rt));
t = sq(await p.innerText('#filmCard'));
ok('Wednesday is a film night by default', /TONIGHT IS FILM NIGHT/i.test(t), t.slice(0, 200));
const pick = await p.evaluate(() => filmPick());
ok('a weeknight pick is a series or under ~2 h', pick[2] === 'series' || pick[3] <= 125, JSON.stringify(pick));
await p.click('#filmCard button[data-film="next"]'); await p.waitForTimeout(80);
const pick2 = await p.evaluate(() => FILM_UI.pick);
ok('🔄 gives another', pick2 && pick2 !== pick[0], pick2 + ' vs ' + pick[0]);
await p.click('#filmCard button[data-film="seen"]'); await p.waitForTimeout(120);
ok('✓ Seen it crosses it off, and it syncs in settings', await p.evaluate(p2 => !!S.settings.film.seen[p2] && !filmPool().some(x => x[0] === p2), pick2));
await p.click('#filmCard button[data-fg="thriller"]'); await p.waitForTimeout(80);
ok('a genre chip filters the picks', await p.evaluate(() => filmPick()[2] === 'thriller'));
await p.evaluate(() => { E('filmCard').querySelector('details').open = true; });
await p.click('#filmCard button[data-fn="3"]'); await p.waitForTimeout(120);
t = sq(await p.innerText('#filmCard'));
ok('film nights can be changed, and Wednesday off shows the next one', await p.evaluate(() => S.settings.film.nights.indexOf(3) < 0) && /next: Friday/i.test(t), t.slice(0, 200));
ok('the day card follows: no film step tonight', /Yog bowl and relax/.test(sq(await p.innerText('#dayCard'))));
t = sq(await p.innerText('#spotCard'));
ok('get out of Bassingham, with a place', /GET OUT OF BASSINGHAM/i.test(t) && /Somewhere else/.test(t));
await p.click('#spotCard button[data-sk="hills"]'); await p.waitForTimeout(80);
ok('the hills chip picks the Lincoln Edge', /Lincoln Edge around Navenby/.test(sq(await p.innerText('#spotCard'))));
await p.click('#spotCard button[data-sk=""]'); await p.waitForTimeout(80);
const s1 = await p.evaluate(() => SPOT_UI.pick);
await p.click('#spotCard button[data-spot="next"]'); await p.waitForTimeout(80);
ok('🔄 somewhere else changes it', await p.evaluate(s => SPOT_UI.pick !== s, s1));
ok('the testosterone card is on Today', /TESTOSTERONE SUPPORT/i.test(await p.innerText('#tCard')));
ok('no film is listed twice', await p.evaluate(() => new Set(FILMS.map(f => f[0])).size === FILMS.length));
await ctx.close();

// ===== a Saturday: rest day routine, film night =====
({ ctx, p, boot } = await at('2026-10-03'));
await boot(st());
t = sq(await p.innerText('#dayCard'));
ok('Saturday is a rest day: a walk somewhere new, refeed, film', /rest day/i.test(t) && /A walk somewhere new/.test(t) && /Refeed meals/.test(t) && /Film night with the popcorn/.test(t) && !/Gym, 18:00/.test(t), t.slice(0, 300));
const wkend = await p.evaluate(() => filmPick());
ok('a weekend night can pick a long film', !!wkend);
await ctx.close();

await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
