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
      if (q === 'halloumi') return Promise.resolve({ name: 'Halloumi', unit: 'g', kcal: 316, protein: 21, carbs: 2, fat: 25, fibre: 0, sugars: 2,
        micros: { calcium_mg: 720, zinc_mg: 2.9 }, gluten: 'free' });
      if (q === 'couscous') return Promise.resolve({ name: 'Couscous, dry', unit: 'g', kcal: 376, protein: 13, carbs: 77, fat: 1, gluten: 'contains' });
      return Promise.resolve({ error: 'not a food' });
    }
    if (MODE === 'fage') return Promise.resolve({ name: 'Fage Total 2%', unit: 'g', kcal: 73, protein: 10, carbs: 3, fat: 2,
      fibre: 0, sugars: 3, micros: { calcium_mg: 110, iron_mg: 0, zinc_mg: 0.5, magnesium_mg: 11, potassium_mg: 141, selenium_ug: 9.7,
        vitamin_c_mg: 0, b12_ug: 0.75, folate_ug: 7, omega3_epa_dha_mg: 'n/a' },
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
  // the diary lives on the Food tab now, folded (28 Sep)
  await p.click('[data-t="food"]');
  await p.evaluate(() => { E('diaryWrap').open = true; });
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
// with no Claude, the scan button is still there and says exactly why it cannot scan
ok('the scan button is always on show', !(await p.$eval('#btnScan', e => e.hidden)));
ok('without Claude it says scanning is off and why', /Scanning is off here/.test(await p.textContent('#scanNote')) && /open inside Claude/.test(await p.textContent('#scanNote')));
await p.click('#btnScan');
ok('tapping it explains instead of doing nothing', /open inside Claude/.test(await p.textContent('#scanBox')));

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
ok('and no "off" note', (await p.textContent('#scanNote')).trim() === '');
await p.setInputFiles('#inScan', JPG);
await p.waitForTimeout(300);
let calls = await p.evaluate(() => window.__calls);
ok('the photo is sent with the prompt', calls.length === 1 && calls[0].hasImage, JSON.stringify(calls));
ok('the prompt asks for per 100 g and gluten', /per 100 g/.test(calls[0].input) && /gluten/.test(calls[0].input) && /kcal, not kJ/.test(calls[0].input));
let sb = await txt(p, '#scanBox');
ok('a one-line confirm opens, not a form', /Fage Total 2%/.test(sb) && /73 kcal · 10 g protein · 3 g carbs · 2 g fat per 100 g/.test(sb), sb.slice(0, 160));
ok('the numbers are folded away', await p.$eval('#scanBox details', d => !d.open) && !(await p.isVisible('#rvKcal')));
ok('the grams box is on show and focused', await p.isVisible('#rvAmt') && await p.evaluate(() => document.activeElement && document.activeElement.id === 'rvAmt'));
ok('prefilled from the label', (await p.$eval('#rvName', e => e.value)) === 'Fage Total 2%' && (await p.$eval('#rvKcal', e => e.value)) === '73' && (await p.$eval('#rvPro', e => e.value)) === '10');
ok('the amount prefilled from the serving', (await p.$eval('#rvAmt', e => e.value)) === '170');
ok('it says the label is gluten free', /Label says gluten free/.test(sb));
ok('and to glance at the packet', /a quick glance against the packet/.test(sb));
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
ok('and then the numbers open for checking', await p.$eval('#scanBox details', d => d.open));
await ctx.close();

// not a label, a bad read, a refusal, a limit — each said plainly, none retried
for (const [mode, re, hidesScan] of [
  ['notlabel', /did not look like a nutrition label \(a photo of a cat\)/, false],
  ['badjson', /Could not read that label/, false],
  ['busy', /Too many scans just now/, false],
  ['denied', /You tapped Don’t allow/, false]]) {
  ({ ctx, p } = await open(mode));
  await p.setInputFiles('#inScan', JPG); await p.waitForTimeout(300);
  ok(mode + ': said plainly', re.test(await p.textContent('#scanBox')), await p.textContent('#scanBox'));
  ok(mode + ': one call, no retry', (await p.evaluate(() => window.__calls.length)) === 1);
  ok(mode + ': scan button stays', (await p.$eval('#btnScan', e => e.hidden)) === hidesScan);
  await ctx.close();
}
// a view that cannot send images never offers the scan
({ ctx, p } = await open('noimg'));
ok('no images: says the app cannot send photos', /cannot send photos/.test(await p.textContent('#scanNote')));
ok('and points to typing the product name', /Fage Total 2%/.test(await p.textContent('#scanNote')));
await p.click('#btnScan');
ok('tapping scan does not open a picker that cannot work', (await p.evaluate(() => window.__calls.length)) === 0 && /cannot send photos/.test(await p.textContent('#scanBox')));
ok('it puts you in the type box', await p.evaluate(() => document.activeElement.id === 'inLookup'));
await ctx.close();
// a view where pages get no Claude at all
({ ctx, p } = await open('nosample'));
ok('no Claude in this view: says to use claude.ai in the browser', /claude\.ai in your phone’s browser/.test(await p.textContent('#scanNote')));
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
ok('not in the list, no Claude: says type the numbers', /Not in the list/.test(L.msg) && /Type the numbers in yourself/.test(L.msg), L.msg);
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
ok('it opens the confirm with typical values', /Halloumi/.test(sb) && /316 kcal/.test(sb) && (await p.$eval('#rvKcal', e => e.value)) === '316', sb.slice(0, 120));
ok('a brand name asks for that product’s values', /as printed on its packet/.test(calls[0].input));
ok('labelled as typical values, not a packet', /Typical values from Claude, not from your packet/.test(sb));
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
ok('if Claude is refused, look-ups say so and how to fix it', /Look-ups are off here/.test(await p.textContent('#lookupMsg')) && /Reload the page/.test(await p.textContent('#lookupMsg')));
ok('and the scan note says the same', /Don’t allow/.test(await p.textContent('#scanNote')));
await ctx.close();

// ===== fibre, vitamins and minerals, food groups =========================
({ ctx, p } = await open(null));
const add = async (id, amt, meal) => { await p.selectOption('#inFood', id); await p.fill('#inAmt', String(amt));
  if (meal) await p.selectOption('#inMeal', meal); await p.click('#btnAddFood'); await p.waitForTimeout(120); };
await add('x:salmonraw', 150, 'tea');
await add('x:spinach', 50, 'lunch');
await add('x:egg', 2, 'breakfast');
await add('x:oats', 60, 'breakfast');
let E1 = await p.evaluate(() => S.days[today()].eaten);
const salmon = E1.find(e => e.id === 'x:salmonraw');
ok('an entry carries its micronutrients, scaled', salmon.mic && salmon.mic.o3 === 3225 && Math.abs(salmon.mic.b12 - 4.8) < 0.01, JSON.stringify(salmon.mic));
ok('fresh-food values are not marked as estimates', !salmon.me);
const oatsE = E1.find(e => e.id === 'x:oats');
ok('and its fibre', oatsE.fib === 6, String(oatsE.fib));
fl = await txt(p, '#foodList');
ok('the day shows fibre against 30 g', /\d+ g fibre of 30/.test(fl), fl.slice(0, 400));
ok('the food groups light up from what was eaten', await p.evaluate(() => { const g = dayGroups(S.days[today()]); return g.oily && g.green && g.egg && !g.red; }));
ok('and show as ticks', /✓ Oily fish/.test(fl) && /✓ Leafy greens/.test(fl) && /✓ Eggs/.test(fl) && !/✓ Red meat/.test(fl));
ok('vitamins and minerals open as a fold', /Vitamins and minerals — typical values/.test(fl) && /\(4 of 4 items counted\)/.test(fl), fl.slice(fl.indexOf('Vitamins'), fl.indexOf('Vitamins') + 90));
ok('omega-3 is shown against 450 mg (salmon plus two eggs)', /Omega-3 \(EPA\+DHA\)\s*3,285 mg\s*730%/.test(fl), (fl.match(/Omega-3[^%]*%/) || [''])[0]);
ok('the ten nutrients are there and vitamins A and D are not', await p.evaluate(() => NUTRI.length === 10 && !NUTRI.some(n => /vitamin (a|d)\b/i.test(n.n))));
ok('it says one day is noise', /One day is noise/.test(fl));
// a hand-added food has no micros and the day says so instead of pretending
await p.click('#btnNewFood');
await p.fill('#rvName', 'Lentil cakes'); await p.fill('#rvKcal', '370'); await p.fill('#rvPro', '25'); await p.fill('#rvCarb', '60'); await p.fill('#rvFat', '2');
await p.fill('#rvFib', '7'); await p.fill('#rvAmt', '30');
await p.click('#scanBox button[data-rv="add"]'); await p.waitForTimeout(150);
const lc = await p.evaluate(() => Object.values(S.foods).find(f => f.name === 'Lentil cakes'));
ok('a typed-in food keeps its fibre', lc.fib === 7 && !lc.mic, JSON.stringify(lc));
fl = await txt(p, '#foodList');
ok('and the micronutrient fold admits the gap', /\(4 of 5 items counted\)/.test(fl) && /1 item has no vitamin or mineral data/.test(fl) && /real totals are higher/.test(fl), fl.slice(fl.indexOf('Vitamins'), fl.indexOf('Vitamins') + 400));
// the week reads food groups back as a whole
await p.click('[data-t="wins"]');
const wk2 = await txt(p, '#winWeek');
ok('the week card has a food-groups row', /Food groups\s*1 day logged/.test(wk2) && /Oily fish 1\/3/.test(wk2) && /Red meat 0\/2/.test(wk2), wk2.slice(wk2.indexOf('Food groups'), wk2.indexOf('Food groups') + 260));
await ctx.close();

// scanned food: fibre from the label, micros as Claude's estimate, flagged
({ ctx, p } = await open('fage'));
await p.setInputFiles('#inScan', JPG); await p.waitForTimeout(300);
calls = await p.evaluate(() => window.__calls);
ok('the scan asks for fibre, sugars and the ten micros', /"fibre": number/.test(calls[0].input) && /omega3_epa_dha_mg/.test(calls[0].input) && /best typical estimate/.test(calls[0].input));
ok('sugars prefill from the label', (await p.$eval('#rvSug', e => e.value)) === '3');
ok('the review says micros are rough estimates', /estimate of its vitamins and minerals/.test(await p.textContent('#scanBox')));
await p.click('#scanBox button[data-rv="add"]'); await p.waitForTimeout(150);
const fg = await p.evaluate(() => Object.values(S.foods).find(f => /Fage/.test(f.name)));
ok('the saved food keeps the estimate, flagged', fg.micEst === 1 && fg.mic.ca === 110, JSON.stringify(fg.mic));
ok('a nonsense value is dropped, not stored as zero', !('o3' in fg.mic));
const fe = await p.evaluate(() => S.days[today()].eaten[0]);
ok('the diary entry is flagged as estimated', fe.me === 1 && Math.abs(fe.mic.ca - 187) < 0.01, JSON.stringify(fe));
fl = await txt(p, '#foodList');
ok('and the fold says partly estimated', /Vitamins and minerals — partly estimated/.test(fl) && /Claude’s estimates/.test(fl));
ok('Fage counts as dairy', /✓ Dairy or kefir/.test(fl));
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
// ===== seasons in Bassingham (6 Oct) =====
{
  const sp = await b.newPage({ viewport: { width: 390, height: 2400 } });
  await sp.clock.setFixedTime(new Date('2026-10-06T12:00:00'));
  sp.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await sp.goto(FILE); await sp.waitForTimeout(250);
  await sp.click('[data-t="food"]'); await sp.waitForTimeout(120);
  let sc = (await sp.innerText('#seasonCard')).replace(/\s+/g, ' ');
  ok('the Food tab has the seasons, with autumn picked in October', /Seasons in Bassingham/i.test(sc) && /🍂 Autumn · now/.test(sc) && /Oysters/.test(sc) && /No vitamin D from the sun from October/.test(sc), sc.slice(0, 300));
  await sp.click('#seasonCard button[data-season="summer"]'); await sp.waitForTimeout(80);
  sc = (await sp.innerText('#seasonCard')).replace(/\s+/g, ' ');
  ok('tapping summer shows summer', /Strawberries/.test(sc) && /Run early, before the heat/.test(sc) && !/Oysters/.test(sc), sc.slice(0, 300));
  ok('summer has breakfast, lunch and dinner ideas, and the evening bowl stays', /Breakfast/.test(sc) && /Overnight GF oats/.test(sc) && /Lunch/.test(sc) && /Grilled mackerel/.test(sc) && /Dinner · 16:30/.test(sc) && /Your yoghurt bowl — always the same/.test(sc), sc.slice(0, 900));
  ok('every season has three ideas for each meal', await sp.evaluate(() => SEASONS.every(x => ['b', 'l', 'd'].every(k => x.meals[k].length === 3))));
  ok('any oats are gluten-free', await sp.evaluate(() => SEASONS.every(x => JSON.stringify(x.meals).match(/oats|porridge/gi).length === (JSON.stringify(x.meals).match(/GF (oats|porridge)/g) || []).length)));
  ok('nothing on the list breaks his rules', await sp.evaluate(() => !/broccoli|sprout|cabbage|kale|rocket|watercress|liver|swede|turnip|supplement|tablet/i.test(JSON.stringify(SEASONS))));
  ok('the seasons fit the screen', await sp.evaluate(() => document.documentElement.scrollWidth <= 390));
  await sp.close();
}
await b.close();
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n' + fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
console.log('\nall passed');
