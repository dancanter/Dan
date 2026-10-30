import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const pg = await b.newPage({ viewport: { width: 430, height: 1800 } });
pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
pg.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 200)); });
await pg.goto(FILE);
await pg.evaluate(() => localStorage.clear());
await pg.reload();
await pg.click('[data-t="times"]');

// the six, closest first
const cards = await pg.$$eval('.six .t', els => els.map(e => ({
  dist: e.querySelector('.dist').textContent.trim(),
  now: e.querySelector('.now').textContent.trim(),
  gap: e.querySelector('.gap').textContent.trim(),
  subs: Array.from(e.querySelectorAll('.sub')).map(s => s.textContent.trim()),
  fill: e.querySelector('.track i').style.width
})));
ok('six target cards', cards.length === 6, String(cards.length));
const order = await pg.evaluate(() => sixTargets().slice().sort((a, c) => a.pct - c.pct)
  .map(x => ({ dm: x.dm, label: repLabel(x.dm), pct: x.pct })));
ok('sorted closest first',
  cards.map(c => c.dist.toLowerCase()).join() === order.map(o => o.label.toLowerCase()).join(),
  cards.map(c => c.dist).join() + '  vs  ' + order.map(o => o.label).join());
ok('and that order really is by how close it is',
  order.every((o, i) => i === 0 || o.pct >= order[i - 1].pct),
  JSON.stringify(order.map(o => o.label + ':' + o.pct.toFixed(3))));
const c400 = cards.filter(c => /400/.test(c.dist))[0];
ok('400m shows the 59, not the 61.3', /59/.test(c400.now), JSON.stringify(c400));
ok('and the gap off it', /4\.0 s to go/.test(c400.gap), c400.gap);
ok('with a unit you can feel', c400.subs.some(s => /s per 100m/.test(s)), JSON.stringify(c400.subs));
ok('and says which number it is', c400.subs.some(s => /your single effort/.test(s)), JSON.stringify(c400.subs));
ok('and keeps the rep average visible', c400.subs.some(s => /rep average 61\.3/.test(s)), JSON.stringify(c400.subs));
const c5k = cards.filter(c => /5 km/.test(c.dist))[0];
ok('5 km gap is given per km', c5k.subs.some(s => /s per km/.test(s)), JSON.stringify(c5k.subs));
ok('every card has a progress bar', cards.every(c => /%$/.test(c.fill)), JSON.stringify(cards.map(c => c.fill)));

// the hero line
const hero = await pg.textContent('#timesHero');
ok('a one-line answer at the top', /Closest is the/.test(hero), hero.slice(0, 200));
const nearest = order[0];
ok('naming the closest distance and gap',
  hero.indexOf(nearest.label) >= 0 && /\d+\.\d s off/.test(hero), hero.slice(0, 220));
ok('and the closest really is the 200m, not the 400m',
  nearest.dm === 200, JSON.stringify(order.map(o => o.label + ':' + o.pct.toFixed(3))));
ok('in feelable units too', /s per 100m/.test(hero), hero.slice(0, 260));

// what ten weeks can do
const real = await pg.textContent('#timesReal');
ok('the honest ceiling is still there', /you do not gain five VDOT points/i.test(real));
ok('and the realistic finish', /17:20–17:30/.test(real) && /400 around 57/.test(real));
ok('the weight-alone gain is computed', /s<\/b> off a 5 km|s off a 5 km/.test(await pg.innerHTML('#timesReal')), real.slice(0, 200));

// the dense stuff is folded away but present
const det = await pg.$$eval('#s-times details', els => els.map(e => ({ s: e.querySelector('summary').textContent.trim(), open: e.open })));
ok('the heavy tables are collapsed', det.length >= 4 && det.every(d => !d.open), JSON.stringify(det));
ok('bests are one of them', det.some(d => /2026 bests/.test(d.s)), JSON.stringify(det.map(d => d.s)));
ok('so is the session history', det.some(d => /Every session of 2026/.test(d.s)));
ok('so are the corrections', det.some(d => /what got corrected/.test(d.s)));
ok('so is the paste box', det.some(d => /Paste Strava JSON/.test(d.s)));

// but the content survives
await pg.$$eval('#s-times details', els => els.forEach(e => { e.open = true; }));
const times = await pg.textContent('#s-times');
ok('the bests table is still there', /45\.2 s/.test(times) && /18:05/.test(times));
ok('the session list is still there', /8 km economy|FASTEST OF YEAR/.test(times));
ok('the 1 km correction is kept', /Strava.s own best-effort data says/.test(times));
ok('the 600m explanation is there', /stored as a single lap/.test(times), '');
ok('and the 1000m target reasoning', /2:46/.test(times));
ok('the paste box still works', (await pg.$('#stravaIn')) !== null);
ok('and the show-all button', (await pg.$('#btnAllSessions')) !== null);
await pg.click('#btnAllSessions');
ok('which expands the list', /Show the last 12/.test(await pg.textContent('#btnAllSessions')));

ok('no page errors', errs.length === 0, errs.join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
