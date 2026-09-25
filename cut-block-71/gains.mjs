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
const txt = async (sel) => (await p.textContent(sel)).replace(/\s+/g, ' ');
await p.goto(FILE);
const T = await p.evaluate(() => today());
const Y = await p.evaluate(() => addD(today(), -1));
const wkStart = await p.evaluate(() => trainingModel().wkStart);
const rowOf = (rows, k) => rows.find(r => r[0] === k);
const plain = s => s.replace(/<[^>]+>/g, '');

// ===== nothing logged: no cards at all ====================================
await boot(st());
ok('with nothing logged the day card is absent', (await p.innerHTML('#gainCard')) === '');
ok('and so is the week card', (await p.innerHTML('#winWeek')) === '');

// ===== every logged field gets its own feedback line =====================
// Dan asked for a feedback column beside each thing he logs.
const full = { kcal: 1799, steps: 16000, sleep: 8, rhr: 60, study: 2, deep: 1,
  gym: true, split: 'back', gymRpe: 7,
  runs: [{ k: 'reps', dm: 200, n: 5, secs: 150, up: 'some', gap: 147, rpe: 8 }, { k: 'reps', dm: 100, n: 8, up: true }] };
await boot(st({ weights: { [Y]: 129.0, [T]: 128.7 }, days: { [T]: full } }));
let rows = await p.evaluate(() => dayFeedback(today()));
const keys = rows.map(r => r[0]);
for (const k of ['Weight', 'Resting HR', 'Food', 'Steps', 'Sleep', 'Run', 'Gym', 'Study'])
  ok('there is a feedback row for ' + k, keys.includes(k), keys.join(','));
ok('every row has something in the feedback column', rows.every(r => plain(r[2]).trim().length > 5), JSON.stringify(rows.map(r => r[2].length)));

// 128.7 after 129.0 is also the lowest reading of the cut, and that wins.
ok('the lowest reading of the cut is called out', /Lowest of the cut so far/.test(rowOf(rows, 'Weight')[2]), rowOf(rows, 'Weight')[2]);
ok('a drop is marked as a win', rowOf(rows, 'Weight')[3] === 'g');
ok('resting HR explains the baseline is still building', /building your baseline/.test(rowOf(rows, 'Resting HR')[2]));
const def = await p.evaluate(() => tdeeFor(today()).deficit);
ok('food gives the deficit as a real number', new RegExp((Math.round(def / 10) * 10).toLocaleString('en-GB') + ' kcal under maintenance').test(plain(rowOf(rows, 'Food')[2])), rowOf(rows, 'Food')[2]);
ok('steps say target hit and by how much', /Target hit, 1,000 over/.test(plain(rowOf(rows, 'Steps')[2])), rowOf(rows, 'Steps')[2]);
ok('steps say what the walking burned', /kcal of walking/.test(rowOf(rows, 'Steps')[2]));
ok('sleep over the line is a win', rowOf(rows, 'Sleep')[3] === 'g' && /Over the line/.test(rowOf(rows, 'Sleep')[2]));
const runs = rows.filter(r => r[1].includes('×'));
ok('both runs get their own line', runs.length === 2, JSON.stringify(runs.map(r => r[1])));
ok('the rep set is compared with the 2026 best', /1\.9 s off your 2026 best/.test(plain(runs[0][2])), runs[0][2]);
ok('with its GAP', /GAP 2:27\/km/.test(runs[0][2]));
ok('and how it felt', /Felt a 8/.test(runs[0][2]));
ok('untimed sprints fill the sprint slot', /Sprint slot filled/.test(runs[1][2]));
ok('the gym row names the split', rowOf(rows, 'Gym')[1] === 'Back + biceps');
ok('and how long since it was last trained', /First time this block|Last trained \d+ days ago/.test(rowOf(rows, 'Gym')[2]));
ok('study shows the week so far', /h this week so far/.test(plain(rowOf(rows, 'Study')[2])));

let d = await txt('#gainCard');
ok('the card is titled "Today, read back"', /Today, read back/.test(d), d.slice(0, 80));
ok('it counts the wins', /\d+ wins?/.test(d));
ok('and marks a 1% day', /1% day/.test(d) && await p.evaluate(() => onePctDay(today())));
ok('no fabricated improvement percentages', !/\d+(\.\d+)?% (better|improv|leaner|stronger|faster)/i.test(d), d);

// ===== bad days are described, never told off ============================
await boot(st({ weights: { [Y]: 128.0, [T]: 128.9 }, days: { [T]: { sleep: 6, kcal: 2400, steps: 5000 } } }));
rows = await p.evaluate(() => dayFeedback(today()));
const all = rows.map(r => plain(r[2])).join(' ');
ok('a gain on the scale is put against the normal swing', /\+0\.9 on /.test(plain(rowOf(rows, 'Weight')[2])), rowOf(rows, 'Weight')[2]);
ok('short sleep gets a way back, not a telling-off', /early night tonight pays it back/.test(all));
ok('over budget is one day moving nothing', /one day moves nothing/.test(all));
ok('steps short is just the number', /short of/.test(all));
ok('no scolding words anywhere', !/failed|missed|bad|too much|shouldn/i.test(all), all);
ok('and none of those rows is marked a win', rows.filter(r => ['Sleep', 'Steps'].includes(r[0])).every(r => r[3] === ''));

// ===== calisthenics days show the test and the record ====================
await boot(st({ days: { [T]: { gym: true, split: 'calis', calisType: 'both', push: 430, pull: 135 } } }));
rows = await p.evaluate(() => dayFeedback(today()));
ok('the calisthenics row names the test', rowOf(rows, 'Gym')[1] === 'Push-ups + pull-ups, 40 min', rowOf(rows, 'Gym')[1]);
ok('and calls a record a record', /New record: 430 \+ 135 = 565/.test(plain(rowOf(rows, 'Gym')[2])) && rowOf(rows, 'Gym')[3] === 'g');
ok('with the next target', /Next time: 566/.test(plain(rowOf(rows, 'Gym')[2])));

// ===== the week, read back ===============================================
await boot(st({ weights: { [wkStart]: 129.0, [T]: 128.4 },
  days: { [wkStart]: { kcal: 1799, steps: 16000, sleep: 8, gym: true, split: 'legs', study: 3, rhr: 60 },
          [T]: Object.assign({}, full, { gym: true, split: 'calis', calisType: 'both', push: 430, pull: 135 }) } }));
await p.click('[data-t="wins"]');
let w = await txt('#winWeek');
const W = await p.evaluate(() => weekGains());
ok('the week card is called Your week', /Your week/.test(w), w.slice(0, 60));
ok('it opens with a highlight reel', /So far: /.test(w), w.slice(0, 200));
ok('the reel names the calisthenics record', /565-rep calisthenics record/.test(w));
ok('and the fat gone', /lb of fat gone/.test(w));
ok('1% days are counted', new RegExp('1% days\\s*' + W.onePct + ' / ' + W.days).test(w), w.slice(0, 260));
ok('there is a streak tile', /streak\s*\d+ days?/.test(w));
ok('the compounding tile projects to 28 Nov', /at this rate ×[\d.]+ by 28 Nov/.test(w));
ok('and says it is for fun', /The × number is for fun/.test(w));
for (const k of ['Weight', 'Food', 'Steps', 'Sleep', 'Runs', 'Gym', 'Study'])
  ok('the week has a row for ' + k, new RegExp(k).test(w));
ok('gym lists the splits and the test', /Legs/.test(w) && /430 \+ 135 = 565, a record/.test(w));
ok('a real new low makes the reel', /a new low of 128\.4 lb/.test(w), w.slice(0, 200));
// But the very first reading of the cut is not a "new low" — there is nothing
// before it to be lower than. That was the week-one bug.
await boot(st({ weights: { [wkStart]: 127.0, [T]: 128.4 }, days: { [T]: { kcal: 1799 } } }));
await p.click('[data-t="wins"]');
ok('the first reading is never called a new low', !/new low/.test(await txt('#winWeek')), (await txt('#winWeek')).slice(0, 200));

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
