import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085 }, updatedAt: Date.now() }, o);
const JPG = { name: 'label.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) };

// A stand-in for the page's `sample` capability. `mode` decides what the
// label reader answers, so the whole scan flow runs without Claude.
const STUB = (mode) => `(() => {
  const MODE = ${JSON.stringify(mode)};
  window.__calls = [];
  const fn = function () { return Promise.reject({ code: 'invalid_request', message: 'text path unused' }); };
  fn.limits = () => MODE === 'noimg' ? Promise.resolve({ maxPromptBytes: 65536 })
    : Promise.resolve({ maxPromptBytes: 65536, images: { maxCount: 5, maxInputBytes: 20e6, mediaTypes: ['image/jpeg', 'image/png', 'image/webp'] } });
  fn.json = (input, opts) => {
    window.__calls.push({ input, hasImage: !!(opts && opts.images && opts.images.length), tier: opts && opts.modelTier });
    if (!(opts && opts.images)) {
      if (MODE === 'denied') return Promise.reject({ code: 'not_granted', message: 'no' });
      if (MODE === 'busy') return Promise.reject({ code: 'rate_limited', message: 'slow' });
      const m = /food: "([^"]+)"/.exec(input); const q = m ? m[1].toLowerCase() : '';
      if (q === 'halloumi') return Promise.resolve({ name: 'Halloumi', unit: 'g', kcal: 316, protein: 21, carbs: 2, fat: 25, gluten: 'free' });
      if (q === 'couscous') return Promise.resolve({ name: 'Couscous, dry', unit: 'g', kcal: 376, protein: 13, carbs: 77, fat: 1, gluten: 'contains' });
      return Promise.resolve({ error: 'not a food' });
    }
    if (MODE === 'fage') return Promise.resolve({ name: 'Fage Total 2%', unit: 'g', kcal: 73, protein: 10, carbs: 3, fat: 2,
      serving: { amount: 170, unit: 'g' }, gluten: 'free', note: '' });
    if (MODE === 'wheat') return Promise.resolve({ name: 'Granola bites', unit: 'g', kcal: 450, protein: 9, carbs: 60, fat: 18,
      serving: null, gluten: 'contains', note: 'ingredients list wheat flour' });
    if (MODE === 'mismatch') return Promise.resolve({ name: 'Odd bar', unit: 'g', kcal: 900, protein: 10, carbs: 10, fat: 5, serving: null, gluten: 'unknown', note: '' });
    if (MODE === 'notlabel') return Promise.resolve({ error: 'a photo of a cat' });
    if (MODE === 'badjson') return Promise.reject({ code: 'invalid_json', message: 'x', text: 'garbled' });
    if (MODE === 'denied') return Promise.reject({ code: 'not_granted', message: 'no' });
    if (MODE === 'busy') return Promise.reject({ code: 'rate_limited', message: 'slow down' });
    return Promise.reject({ code: 'upstream_error', message: 'x' });
  };
  window.claude = { use(name) { return Promise.resolve(name === 'sample' && MODE !== 'nosample' ? fn : null); } };
})()`;
const open = async (mode, local) => {
  const ctx = await b.newContext({ viewport: { width: 430, height: 2400 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  if (mode) await p.addInitScript({ content: STUB(mode) });
  await p.goto(FILE);
  await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, local || st()]);
  await p.reload(); await p.waitForTimeout(300);
  await p.click('[data-t="today"]');
  return { ctx, p };
};
const txt = async (p, sel) => (await p.textContent(sel)).replace(/\s+/g, ' ');

// ===== fresh food: pick, amount, add ======================================
let { ctx, p } = await open(null);
const T = await p.evaluate(() => today());
const opts = await p.$$eval('#inFood option', o => o.map(x => x.textContent));
ok('fresh foods are on the menu', opts.some(x => /Chicken breast, cooked/.test(x)) && opts.some(x => /Potatoes, boiled/.test(x)), opts.slice(0, 5).join(' | '));
ok('each shows its kcal per 100 g or each', opts.some(x => /165 kcal per 100 g/.test(x)) && opts.some(x => /78 kcal each/.test(x)));
await p.selectOption('#inFood', 'x:chicken');
ok('the amount label follows the food', /How much \(g\)/.test(await p.textContent('#labAmt')));
await p.fill('#inAmt', '125');
await p.selectOption('#inMeal', 'lunch');
await p.click('#btnAddFood');
await p.waitForTimeout(150);
let rec = await p.evaluate(() => S.days[today()]);
ok('the entry is saved with its own numbers', rec.eaten && rec.eaten[0].kcal === 206 && rec.eaten[0].pro === 38.8 && rec.eaten[0].m === 'lunch', JSON.stringify(rec.eaten));
ok('and the day kcal comes from the diary', rec.kcal === 206, String(rec.kcal));
await p.selectOption('#inFood', 'x:egg');
ok('eggs are counted, not weighed', /How many/.test(await p.textContent('#labAmt')));
await p.fill('#inAmt', '2');
await p.selectOption('#inMeal', 'breakfast');
await p.click('#btnAddFood');
await p.waitForTimeout(150);
rec = await p.evaluate(() => S.days[today()]);
ok('two eggs are 156 kcal', rec.eaten[1].kcal === 156 && rec.kcal === 362, JSON.stringify(rec));
let fl = await txt(p, '#foodList');
ok('the diary groups by meal', fl.indexOf('Breakfast') < fl.indexOf('Lunch') && /Egg, large/.test(fl), fl);
ok('it totals kcal against the budget', /362 kcal of your 1,799/.test(fl), fl);
ok('and counts protein toward 135', /53 g protein/.test(fl) && /82 g to 135/.test(fl), fl);
ok('the kcal box shows the diary total', (await p.$eval('#inKcal', e => e.value)) === '362');
// nothing picked / nothing entered: said plainly
await p.selectOption('#inFood', '');
await p.click('#btnAddFood');
ok('no food picked says so', /Pick a food first/.test(await p.textContent('#foodMsg')));
// removing
await p.click('#foodList button[data-eat="1"]');
await p.waitForTimeout(150);
rec = await p.evaluate(() => S.days[today()]);
ok('removing an entry recalculates the day', rec.eaten.length === 1 && rec.kcal === 206, JSON.stringify(rec));
await p.click('#foodList button[data-eat="0"]');
await p.waitForTimeout(150);
rec = await p.evaluate(() => S.days[today()] || {});
ok('an emptied diary takes its kcal with it', !rec.eaten && rec.kcal === undefined, JSON.stringify(rec));
// with no Claude, the scan button stays hidden and says why
ok('no scan button without Claude', await p.$eval('#btnScan', e => e.hidden));
ok('and it says you can still add by hand', /add a food by hand/.test(await p.textContent('#scanNote')));

// ===== adding a food by hand =============================================
await p.click('#btnNewFood');
await p.fill('#rvName', 'Lentil cakes');
await p.fill('#rvKcal', '370'); await p.fill('#rvPro', '25'); await p.fill('#rvCarb', '60'); await p.fill('#rvFat', '2');
await p.click('#scanBox button[data-rv="add"]');
ok('saving and adding needs an amount', /How much did you eat/.test(await p.textContent('#rvWarn')));
await p.fill('#rvAmt', '30');
await p.click('#scanBox button[data-rv="add"]');
await p.waitForTimeout(150);
const foods = await p.evaluate(() => S.foods);
const lent = Object.values(foods).find(f => f.name === 'Lentil cakes');
ok('a hand-added food is saved to your foods', lent && lent.kcal === 370 && lent.src === 'you', JSON.stringify(foods));
rec = await p.evaluate(() => S.days[today()]);
ok('and 30 g of it lands in the diary', rec.eaten && rec.eaten[0].kcal === 111, JSON.stringify(rec.eaten));
ok('it is now on the menu', (await p.$$eval('#inFood option', o => o.map(x => x.textContent))).some(x => /Lentil cakes/.test(x)));
// impossible numbers are refused
await p.click('#btnNewFood');
await p.fill('#rvName', 'Nonsense'); await p.fill('#rvKcal', '300'); await p.fill('#rvPro', '60'); await p.fill('#rvCarb', '60'); await p.fill('#rvFat', '10');
await p.click('#scanBox button[data-rv="save"]');
ok('macros over 100 per 100 are refused', /more than 100 per 100/.test(await p.textContent('#rvWarn')));
await p.click('#scanBox button[data-rv="cancel"]');
// editing a food keeps old diary entries as they were
await p.evaluate(() => { const id = Object.keys(S.foods)[0]; S.foods[id].kcal = 999; touch(); });
rec = await p.evaluate(() => S.days[today()]);
ok('editing a food never rewrites a logged day', rec.eaten[0].kcal === 111, JSON.stringify(rec.eaten[0]));
await ctx.close();

// ===== scanning a label ==================================================
({ ctx, p } = await open('fage'));
ok('with Claude and images, the scan button shows', !(await p.$eval('#btnScan', e => e.hidden)));
await p.setInputFiles('#inScan', JPG);
await p.waitForTimeout(300);
let calls = await p.evaluate(() => window.__calls);
ok('the photo is sent with the prompt', calls.length === 1 && calls[0].hasImage, JSON.stringify(calls));
ok('the prompt asks for per 100 g and gluten', /per 100 g/.test(calls[0].input) && /gluten/.test(calls[0].input) && /kcal, not kJ/.test(calls[0].input));
let sb = await txt(p, '#scanBox');
ok('a review form opens', /Check it before you save/.test(sb), sb.slice(0, 120));
ok('prefilled from the label', (await p.$eval('#rvName', e => e.value)) === 'Fage Total 2%' && (await p.$eval('#rvKcal', e => e.value)) === '73' && (await p.$eval('#rvPro', e => e.value)) === '10');
ok('the amount prefilled from the serving', (await p.$eval('#rvAmt', e => e.value)) === '170');
ok('it says the label is gluten free', /Label says gluten free/.test(sb));
ok('and to check it against the packet', /check the numbers against the packet/.test(sb));
await p.click('#scanBox button[data-rv="add"]');
await p.waitForTimeout(150);
const fage = await p.evaluate(() => Object.values(S.foods).find(f => /Fage/.test(f.name)));
ok('the scanned food is saved as from a label', fage && fage.src === 'label' && fage.gluten === 'free', JSON.stringify(fage));
rec = await p.evaluate(() => S.days[today()]);
ok('170 g of it is 124 kcal and 17 g protein', rec.eaten[0].kcal === 124 && rec.eaten[0].pro === 17, JSON.stringify(rec.eaten[0]));
ok('next time it is one tap from the menu', (await p.$$eval('#inFood option', o => o.map(x => x.textContent))).some(x => /Fage Total 2%/.test(x)));
// the feedback card picks up protein from the diary
const fb = await p.evaluate(() => dayFeedback(today()).find(r => r[0] === 'Food'));
ok('Today read back counts the diary protein', fb && /17 g protein/.test(fb[2]) && /1 item/.test(fb[1]), JSON.stringify(fb));
await ctx.close();

// gluten on the label is shouted
({ ctx, p } = await open('wheat'));
await p.setInputFiles('#inScan', JPG); await p.waitForTimeout(300);
sb = await txt(p, '#scanBox');
ok('a label listing wheat gets a gluten warning', /Gluten warning/.test(sb) && /Do not eat this/.test(sb), sb.slice(0, 200));
ok('with no serving, the amount is left for him', (await p.$eval('#rvAmt', e => e.value)) === '');
await ctx.close();

// numbers that do not add up get flagged
({ ctx, p } = await open('mismatch'));
await p.setInputFiles('#inScan', JPG); await p.waitForTimeout(300);
ok('kcal that does not match the macros is flagged', /does not match the protein, carbs and fat/.test(await p.textContent('#rvWarn')));
await ctx.close();

// not a label, a bad read, a refusal, a limit — each said plainly, none retried
for (const [mode, re, hidesScan] of [
  ['notlabel', /did not look like a nutrition label \(a photo of a cat\)/, false],
  ['badjson', /Could not read that label/, false],
  ['busy', /Too many scans just now/, false],
  ['denied', /Label scanning is not available here/, true]]) {
  ({ ctx, p } = await open(mode));
  await p.setInputFiles('#inScan', JPG); await p.waitForTimeout(300);
  ok(mode + ': said plainly', re.test(await p.textContent('#scanBox')), await p.textContent('#scanBox'));
  ok(mode + ': one call, no retry', (await p.evaluate(() => window.__calls.length)) === 1);
  ok(mode + (hidesScan ? ': scan button hidden after' : ': scan button stays'), (await p.$eval('#btnScan', e => e.hidden)) === hidesScan);
  await ctx.close();
}
// a view that cannot send images never offers the scan
({ ctx, p } = await open('noimg'));
ok('no images, no scan button', await p.$eval('#btnScan', e => e.hidden));
await ctx.close();

// ===== "type a food": the list first, Claude only if it is not there =====
({ ctx, p } = await open(null));
const look = async (q) => { await p.fill('#inLookup', q); await p.click('#btnLookup'); await p.waitForTimeout(150);
  return { sel: await p.$eval('#inFood', e => e.value), msg: (await p.textContent('#lookupMsg')).replace(/\s+/g, ' ') }; };
let L = await look('oats');
ok('"oats" finds dry oats', L.sel === 'x:oats' && /Found Oats, dry/.test(L.msg), JSON.stringify(L));
L = await look('raw potatoes');
ok('"raw potatoes" finds raw weight', L.sel === 'x:potatoraw', JSON.stringify(L));
L = await look('potatoes');
ok('plain "potatoes" defaults to raw weight', L.sel === 'x:potatoraw', JSON.stringify(L));
ok('and offers the boiled one as well', /Not that one\?/.test(L.msg) && /Potatoes, boiled weight/.test(L.msg), L.msg);
await p.click('#lookupMsg button[data-pick="x:potato"]');
ok('tapping the alternative picks it', (await p.$eval('#inFood', e => e.value)) === 'x:potato');
L = await look('boiled potatoes');
ok('"boiled potatoes" finds boiled weight', L.sel === 'x:potato', JSON.stringify(L));
L = await look('chicken');
ok('"chicken" defaults to raw', L.sel === 'x:chickenraw', JSON.stringify(L));
L = await look('cooked chicken');
ok('"cooked chicken" finds cooked', L.sel === 'x:chicken', JSON.stringify(L));
L = await look('egg');
ok('"egg" finds eggs', L.sel === 'x:egg' || L.sel === 'x:eggwhite', JSON.stringify(L));
ok('the amount label follows the found food', /How many/.test(await p.textContent('#labAmt')));
L = await look('halloumi');
ok('not in the list, no Claude: says add it by hand', /Not in the list/.test(L.msg) && /Add a food by hand/.test(L.msg), L.msg);
ok('and nothing got selected by accident', L.sel === 'x:egg' || L.sel === 'x:eggwhite');
// the fish values that were raw numbers labelled cooked are corrected
const fish = await p.evaluate(() => ({ cod: foodById('x:cod'), codraw: foodById('x:codraw'), salmon: foodById('x:salmon'), mack: foodById('x:mackerel') }));
ok('cooked cod is 105 kcal, not the raw 82', fish.cod.kcal === 105 && fish.codraw.kcal === 82, JSON.stringify(fish));
ok('cooked mackerel is 262, not the raw 205', fish.mack.kcal === 262);
await ctx.close();

// with Claude: a food that is not in the list gets typical values to check
({ ctx, p } = await open('fage'));
await p.fill('#inLookup', 'halloumi'); await p.click('#btnLookup'); await p.waitForTimeout(250);
calls = await p.evaluate(() => window.__calls);
ok('the look-up goes to Claude as text, on the quick tier', calls.length === 1 && !calls[0].hasImage && calls[0].tier === 'quick', JSON.stringify(calls));
ok('it asks for raw weight when the name does not say', /give raw \(or dry\) weight/.test(calls[0].input));
sb = await txt(p, '#scanBox');
ok('it opens the review with typical values', /Check it before you save/.test(sb) && (await p.$eval('#rvKcal', e => e.value)) === '316', sb.slice(0, 120));
ok('labelled as typical values, not a packet', /Typical values from Claude, not from a packet/.test(sb));
ok('naturally gluten free is said as such', /Naturally gluten free/.test(sb));
await p.fill('#rvAmt', '50');
await p.click('#scanBox button[data-rv="add"]'); await p.waitForTimeout(150);
rec = await p.evaluate(() => S.days[today()]);
ok('50 g of halloumi lands in the diary', rec.eaten && rec.eaten[0].kcal === 158, JSON.stringify(rec.eaten));
L = { msg: '' };
await p.fill('#inLookup', 'halloumi'); await p.click('#btnLookup'); await p.waitForTimeout(150);
ok('next time it is found in his own foods, no second look-up', (await p.evaluate(() => window.__calls.length)) === 1 && /Found Halloumi/.test(await p.textContent('#lookupMsg')));
await p.fill('#inLookup', 'couscous'); await p.click('#btnLookup'); await p.waitForTimeout(250);
ok('a food that normally contains gluten gets the warning', /this food normally contains gluten/.test(await p.textContent('#scanBox')));
await p.click('#scanBox button[data-rv="cancel"]');
await p.fill('#inLookup', 'xyzzy'); await p.click('#btnLookup'); await p.waitForTimeout(250);
ok('a non-food is said plainly', /did not come back as a food/.test(await p.textContent('#lookupMsg')));
await ctx.close();
({ ctx, p } = await open('denied'));
await p.fill('#inLookup', 'halloumi'); await p.click('#btnLookup'); await p.waitForTimeout(250);
ok('if Claude is refused, look-ups say so and stop', /Look-ups are not available here/.test(await p.textContent('#lookupMsg')));
await ctx.close();

// ===== foods survive a sync merge ========================================
({ ctx, p } = await open(null));
const merged = await p.evaluate(() => {
  const a = normalise({ days: {}, weights: {}, foods: { 'f:a': { id: 'f:a', name: 'A', unit: 'g', per: 100, kcal: 1, pro: 0, carb: 0, fat: 0 } }, updatedAt: 1 });
  const b = normalise({ days: {}, weights: {}, foods: { 'f:b': { id: 'f:b', name: 'B', unit: 'g', per: 100, kcal: 1, pro: 0, carb: 0, fat: 0 } }, updatedAt: 2 });
  return Object.keys(mergeByDate(a, b).s.foods).sort();
});
ok('foods saved on either side survive a merge', merged.join() === 'f:a,f:b', merged.join());
ok('old saved data without foods still loads', await p.evaluate(() => typeof normalise({}).foods === 'object'));

for (const tab of ['today', 'weight', 'food', 'training', 'wins', 'data']) {
  await p.click(`[data-t="${tab}"]`);
  ok('renders: ' + tab, await p.$eval('#s-' + tab, s => !s.hidden && s.textContent.trim().length > 50));
}
await p.click('[data-t="data"]');
const checks = await p.$$eval('#dChecks tr', r => r.map(x => x.children[0].textContent.trim()));
ok('every self-check passes', checks.every(x => x === 'ok'), checks.join(','));
await ctx.close();
ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
