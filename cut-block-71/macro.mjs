import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const p = await b.newPage({ viewport: { width: 430, height: 2400 } });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { const x = m.text();
  if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis/.test(x)) errs.push('CONSOLE: ' + x.slice(0, 220)); });
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const boot = async (s) => { await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
  await p.reload(); await p.waitForTimeout(220); };

await boot(st());

// ===== 1. the protein number and what it leaves =========================
const m = await p.evaluate(() => ({ pro: MACRO.pro, fat: MACRO.fat, carb: CARB_AT,
  floor: CARB_FLOOR, txt: PRO_TXT, kcal: KCAL_DAY }));
ok('protein is raised to the top of what the budget allows', m.pro === 150, String(m.pro));
ok('the carbohydrate it leaves clears the hard-day floor', m.carb >= m.floor, JSON.stringify(m));
ok('and one notch higher would breach it',
  Math.round((m.kcal - (m.pro + 10) * 4 - m.fat * 9) / 4) < m.floor,
  String(Math.round((m.kcal - (m.pro + 10) * 4 - m.fat * 9) / 4)));
ok('the protein string is derived from the number', m.txt === (m.pro - 5) + '–' + (m.pro + 5) + ' g', m.txt);

// ===== 2. nothing anywhere still says the old range =====================
// This is the whole point of PRO_TXT: the number was typed out in four
// places and three of them went stale the last time it moved.
await p.click('[data-t="food"]');
await p.waitForTimeout(150);
const foodTxt = await p.textContent('#s-food');
ok('the Macros panel shows the derived range', foodTxt.includes(m.txt), foodTxt.slice(0, 200));
const whole = await p.evaluate(() => document.body.innerText);
ok('no stale 130–140 g anywhere on the page', !/130\s*[–-]\s*140/.test(whole),
  (whole.match(/.{40}130\s*[–-]\s*140.{40}/) || [''])[0]);
// 1,719 survives in one place on purpose — the line explaining the cycle Dan
// overruled. It must not survive in the protein panel, where it was describing
// a day that no longer exists.
const proPanel = await p.evaluate(() =>
  [...document.querySelectorAll('#s-food .p')].find(e => /best is cod/.test(e.textContent)).innerText);
ok('the protein panel no longer talks about a 1,719 day', !/1,?719/.test(proPanel), proPanel.slice(0, 160));

// ===== 3. the rest-day card uses it too =================================
const rest = await p.evaluate(() => { const f = fuelBook().rest;
  return f.s + ' || ' + f.r.map(r => r.join(' ')).join(' || '); });
ok('the rest-day summary carries the derived protein', rest.includes(m.txt), rest.slice(0, 160));
ok('and so does the protein row', (rest.match(new RegExp(m.txt.replace('–', '[–-]'), 'g')) || []).length >= 2, rest.slice(0, 400));

// ===== 4. the growth paragraph, and only during the cut =================
await p.click('[data-t="training"]');
await p.waitForTimeout(150);
const tr = await p.textContent('#s-training');
ok('the sets card answers the growth question head on',
  /run the top of the left column/.test(tr), tr.slice(0, 200));
ok('it names the raised protein', new RegExp('protein at ' + m.pro + ' g').test(tr));
ok('it does not promise growth in the deficit',
  /will not add muscle/.test(tr) && /growth happens on the reverse/i.test(tr));
// With nothing logged there is no measured deficit, so it must not invent one.
ok('with no data logged it stays qualitative', /a deficit this size/.test(tr),
  (tr.match(/It will not add muscle at [^.]{0,60}/) || [''])[0]);

// ===== 5. with days logged it quotes the measured number ================
await boot(st({ weights: { '2026-09-20': 128.4 },
  days: { '2026-09-20': { kcal: 1800, steps: 12000 }, '2026-09-21': { kcal: 1750, steps: 13000 } } }));
await p.click('[data-t="training"]');
await p.waitForTimeout(150);
const tr2 = await p.textContent('#s-training');
const blk = await p.evaluate(() => tdeeBlock().perDay);
ok('once there is evidence it quotes the measured deficit',
  new RegExp('a measured ' + Math.round(blk).toLocaleString('en-GB') + ' kcal a day under').test(tr2),
  (tr2.match(/It will not add muscle at [^.]{0,60}/) || [''])[0] + ' | perDay=' + blk);

await b.close();
if (errs.length) fails.push(...errs);
if (fails.length) { console.log('\nFAILED:'); fails.forEach(f => console.log(' - ' + f)); process.exit(1); }
console.log('\nall passed');
