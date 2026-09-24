import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2400 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(250); };
await p.goto(FILE);
const T = await p.evaluate(() => today());

// ===== nothing logged: no card, not an empty one ==========================
await boot(st());
ok('with nothing logged the day card is absent', (await p.innerHTML('#gainCard')) === '');
ok('and so is the week card', (await p.innerHTML('#winWeek')) === '');

// ===== a full day ========================================================
const full = { kcal: 1799, steps: 16000, sleep: 8, study: 2, deep: 1, skinAM: true, skinPM: true, retinol: true, phoneOut: true,
  gym: true, split: 'back', runs: [{ k: 'reps', dm: 200, n: 5, secs: 150, up: 'some' }, { k: 'reps', dm: 100, n: 8, up: true }] };
await boot(st({ days: { [T]: full } }));
let d = (await p.textContent('#gainCard')).replace(/\s+/g, ' ');
ok('the day card appears', /What today went toward/.test(d), d.slice(0, 80));
ok('it credits the deficit with a real number', /About [\d,]+ kcal under today/.test(d) && /g of fat/.test(d));
const g = await p.evaluate(() => dayGains(today()));
const def = await p.evaluate(() => tdeeFor(today()).deficit);
ok('and the number is the model deficit, rounded', new RegExp('About ' + (Math.round(def / 10) * 10).toLocaleString('en-GB') + ' kcal').test(d), String(def));
ok('the hard session is credited with its comparison', /a hard session/.test(d) && /1\.9 s off the 2026 best/.test(d));
ok('the untimed sprints are credited too', /8 × 100m uphill/.test(d) && /top-end speed/.test(d));
ok('the gym session names the split', /Back \+ biceps/.test(d) && /muscle kept/.test(d));
ok('study hours are counted', /2\.0 h studied, 1\.0 h of it deep work/.test(d));
ok('sleep at the line is credited', /8\.0 h of sleep/.test(d));
ok('skin and retinol are credited', /retinol night on schedule/.test(d));
ok('phone out is credited', /Phone out of the room/.test(d));
ok('steps target is credited', /16,000 steps/.test(d));
ok('it is a 1% day', /1% day/.test(d) && await p.evaluate(() => onePctDay(today())));

// No invented percentages anywhere — the one number with a % in it is the label.
ok('no fabricated improvement percentages', !/\d+(\.\d+)?% (better|improv|leaner|stronger|faster)/i.test(d), d);

// ===== a partial day: credited for what happened, never scolded ==========
await boot(st({ days: { [T]: { sleep: 6, study: 3 } } }));
d = (await p.textContent('#gainCard')).replace(/\s+/g, ' ');
ok('a short-sleep day still gets its study credited', /3\.0 h studied/.test(d), d.slice(0, 200));
ok('short sleep is simply not credited, not scolded', !/6\.0 h of sleep/.test(d) && !/missed|failed|short of/i.test(d));
ok('and it is not a 1% day', !(await p.evaluate(() => onePctDay(today()))));
ok('the card explains what a 1% day is', /A 1% day is food logged, sleep at 7\.5 h and your steps target/.test(d));
ok('and that rest days count', /Rest days count/.test(d));

// A surplus day does not get a fat credit, and is not told off either.
await boot(st({ days: { [T]: { kcal: 3200, steps: 3000 } } }));
d = (await p.textContent('#gainCard')).replace(/\s+/g, ' ');
ok('a day over maintenance claims no fat lost', !/g of fat/.test(d));
ok('and is not scolded for it', !/over|too much|surplus/i.test(d));

// ===== the week ==========================================================
const wkStart = await p.evaluate(() => trainingModel().wkStart);
await boot(st({ days: { [wkStart]: { kcal: 1799, steps: 16000, sleep: 8, gym: true, split: 'legs', study: 3 },
                        [T]: full } }));
await p.click('[data-t="wins"]');
let w = (await p.textContent('#winWeek')).replace(/\s+/g, ' ');
const W = await p.evaluate(() => weekGains());
ok('the week card appears on Wins', /This week went toward/.test(w), w.slice(0, 80));
ok('1% days are counted', new RegExp('1% days\\s*' + W.onePct + ' / ' + W.days).test(w), w.slice(0, 160));
ok('the compounding tile is 1.01 to that power', new RegExp('×' + Math.pow(1.01, W.onePct).toFixed(3)).test(w));
ok('and it is labelled as the idea, not a measurement', /The compounding number is the idea, not a measurement/.test(w));
ok('the week deficit converts to pounds', /lb of fat/.test(w) && Math.abs(W.def) > 0);
ok('sessions are split by kind', /hard/.test(w) && /sprint/.test(w));
ok('the best rep set is named against the 2026 best', /Best: 5 × 200m part uphill/.test(w));
ok('gym sessions are counted', /2 gym sessions/.test(w), w);
ok('study hours are summed', /5\.0 h, 1\.0 h deep/.test(w), w);
ok('nights at the line are counted', /2 of 2 nights at the sleep line/.test(w));
ok('looks is stated as inputs over weeks, not a score', /it shows over weeks, not days/.test(w) && !/\d+% (better|leaner)/i.test(w));

// ===== nothing broke =====================================================
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
