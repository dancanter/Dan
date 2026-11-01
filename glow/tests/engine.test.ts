import { ALL_FOODS, FOODS, FOOD_BY_ID, UK_FOODS, USDA_FOODS } from '@/data/foods';
import { UK_RAW } from '@/data/ukFoods';
import { searchFoods } from '@/engine/parse';
import { CUT_OUT, PILLARS, SOURCES } from '@/data/science';
import { ageOn, energyAvailability, sleepHours, sleepScore, weeklyRate } from '@/engine/body';
import { parseEntry } from '@/engine/parse';
import { analyseDay, DEFAULT_PROFILE, scoreFood, targetsFor, type LoggedItem } from '@/engine/score';
import { fromOff } from '@/engine/off';

const f = (id: string) => {
  const food = FOOD_BY_ID.get(id);
  if (!food) throw new Error(`missing ${id}`);
  return food;
};
const t = targetsFor(DEFAULT_PROFILE, 57.4);
const item = (id: string, grams: number): LoggedItem => ({ uid: id, food: f(id), grams, meal: 'lunch' });

describe('food library', () => {
  it('has a large library with unique ids and sane values', () => {
    expect(FOODS.length).toBeGreaterThan(180);
    expect(new Set(FOODS.map((x) => x.id)).size).toBe(FOODS.length);
    for (const food of FOODS) {
      const macroKcal = food.n.protein * 4 + food.n.carbs * 4 + food.n.fat * 9 + food.n.fibre * 2;
      // Alcohol supplies its own energy, and a few foods are rounded; everything else should roughly add up.
      if (!food.tags.includes('alc') && food.n.kcal > 30) expect(Math.abs(macroKcal - food.n.kcal) / food.n.kcal).toBeLessThan(0.3);
      expect(food.portion.g).toBeGreaterThan(0);
    }
  });

  it('every cut-out source and pillar component points at something real', () => {
    const ids = new Set(SOURCES.map((s) => s.id));
    for (const c of CUT_OUT) for (const s of c.sources) expect(ids.has(s)).toBe(true);
    expect(PILLARS).toHaveLength(8);
  });
});

describe('optimisation score', () => {
  it('ranks nutrient-dense whole foods far above ultra-processed food', () => {
    for (const good of ['beef-liver', 'oysters', 'sardines', 'salmon-wild', 'kale', 'eggs', 'blueberries']) {
      expect(scoreFood(f(good), t).score).toBeGreaterThan(60);
    }
    for (const bad of ['cola', 'crisps', 'donut', 'bacon', 'beer']) {
      expect(scoreFood(f(bad), t).score).toBeLessThan(10);
    }
  });

  it('prefers lean mince to fatty mince and wild salmon to swordfish', () => {
    expect(scoreFood(f('beef-mince-lean'), t).score).toBeGreaterThan(scoreFood(f('beef-mince-20'), t).score);
    expect(scoreFood(f('salmon-wild'), t).score).toBeGreaterThan(scoreFood(f('swordfish'), t).score);
  });

  it('treats water as neutral rather than perfect', () => {
    expect(scoreFood(f('water'), t).score).toBe(50);
  });
});

describe('day analysis', () => {
  it('warns about vitamin A when liver is doubled up with cod liver oil', () => {
    const a = analyseDay([item('beef-liver', 100), item('cod-liver-oil', 5)], t, { glutenFree: false });
    expect(a.warnings.some((w) => w.text.includes('Retinol'))).toBe(true);
  });

  it('warns about selenium from a handful of Brazil nuts but not one', () => {
    const one = analyseDay([item('brazil-nuts', 5)], t, { glutenFree: false });
    const handful = analyseDay([item('brazil-nuts', 30)], t, { glutenFree: false });
    expect(one.warnings.some((w) => w.text.includes('Selenium'))).toBe(false);
    expect(handful.warnings.some((w) => w.text.includes('Selenium'))).toBe(true);
  });

  it('flags gluten in gluten-free mode', () => {
    const a = analyseDay([item('sourdough', 50)], t, { glutenFree: true });
    expect(a.warnings[0].level).toBe('danger');
  });

  it('applies bioavailability: spinach calcium mostly does not count', () => {
    const a = analyseDay([item('spinach', 100)], t, { glutenFree: false });
    expect(a.totals.calcium).toBeCloseTo(99, 0);
    expect(a.effective.calcium).toBeLessThan(15);
  });

  it('a strong Glow-style day beats a takeaway day on every pillar mean', () => {
    const good = analyseDay([
      item('eggs', 180), item('greek-yogurt', 150), item('blueberries', 80), item('brazil-nuts', 5), item('kefir', 200),
      item('salmon-wild', 150), item('sweet-potato', 200), item('broccoli', 100), item('evoo', 10), item('rocket', 40),
      item('beef-mince-lean', 150), item('potato', 250), item('red-pepper', 80), item('sauerkraut', 50), item('kiwi', 150),
    ], t, { glutenFree: false, sleepScore: 85, energyAvailability: 40 });
    const bad = analyseDay([item('cereal-sugary', 40), item('burger', 200), item('chips', 150), item('cola', 330), item('beer', 1136)], t, { glutenFree: false, sleepScore: 50, energyAvailability: 40 });
    expect(good.nutritionScore).toBeGreaterThan(70);
    expect(bad.nutritionScore).toBeLessThan(35);
    expect(good.plants).toBeGreaterThanOrEqual(8);
  });

  it('flags low energy availability once the day is finished', () => {
    const a = analyseDay([item('eggs', 120)], t, { glutenFree: false, energyAvailability: 20 });
    expect(a.warnings.some((w) => w.text.includes('Energy availability'))).toBe(true);
    const inProgress = analyseDay([item('eggs', 120)], t, { glutenFree: false, energyAvailability: 20, inProgress: true });
    expect(inProgress.warnings.some((w) => w.text.includes('Energy availability'))).toBe(false);
  });
});

describe('typing what you ate', () => {
  it('parses counts, grams and handfuls', () => {
    const r = parseEntry('3 eggs, 150g wild salmon, handful blueberries, 1 brazil nut, 200ml kefir', ALL_FOODS);
    expect(r.map((x) => x.food?.id)).toEqual(['eggs', 'salmon-wild', 'blueberries', 'brazil-nuts', 'kefir']);
    expect(r.map((x) => x.grams)).toEqual([180, 150, 30, 5, 200]);
  });

  it('defaults bare "salmon" to wild and "steak" to sirloin', () => {
    const r = parseEntry('salmon and steak', ALL_FOODS);
    expect(r.map((x) => x.food?.id)).toEqual(['salmon-wild', 'sirloin']);
  });

  it('understands spoons and words', () => {
    const r = parseEntry('1 tbsp olive oil; two kiwis', ALL_FOODS);
    expect(r[0].food?.id).toBe('evoo');
    expect(r[0].grams).toBe(12);
    expect(r[1].food?.id).toBe('kiwi');
    expect(r[1].grams).toBe(150);
  });
});

describe('body maths', () => {
  it('works out age around the birthday', () => {
    expect(ageOn('2000-11-28', '2026-11-27')).toBe(25);
    expect(ageOn('2000-11-28', '2026-11-28')).toBe(26);
  });

  it('computes sleep across midnight', () => {
    expect(sleepHours({ bed: '23:15', wake: '07:15' })).toBe(8);
    const e = { date: '2026-11-01', bed: '23:00', wake: '07:30', quality: 4 };
    expect(sleepScore(e, [e]).score).toBeGreaterThan(70);
  });

  it('energy availability matches the hand calculation', () => {
    // (1799 − 650) / (57.4 × 0.9) ≈ 22.2
    expect(energyAvailability(1799, DEFAULT_PROFILE, 57.4)).toBeCloseTo(22.2, 1);
  });

  it('fits a weekly rate of loss', () => {
    const ws = Array.from({ length: 15 }, (_, i) => ({ date: `2026-10-${String(i + 10).padStart(2, '0')}`, kg: 58 - i * 0.05 }));
    expect(weeklyRate(ws)).toBeCloseTo(-0.35, 2);
  });
});

describe('Open Food Facts import', () => {
  it('maps label values and marks the data as limited', () => {
    const food = fromOff({ code: '1', product_name: 'Test bar', nova_group: 4, nutriments: { 'energy-kcal_100g': 400, proteins_100g: 20, sugars_100g: 30, sodium_100g: 0.2 } });
    expect(food?.limitedData).toBe(true);
    expect(food?.tags).toContain('upf');
    expect(food?.n.sodium).toBe(200);
    expect(scoreFood(food!, t).score).toBeLessThan(30);
  });
});

describe('absorption and coeliac', () => {
  const at = (id: string, grams: number, meal: LoggedItem['meal']): LoggedItem => ({ uid: id + meal, food: f(id), grams, meal });

  it('flags tea or coffee with a plant-iron meal, but not at a separate meal', () => {
    const same = analyseDay([at('lentils', 60, 'lunch'), at('spinach', 80, 'lunch'), at('coffee', 200, 'lunch')], t, { glutenFree: true });
    expect(same.warnings.some((w) => w.text.includes('plant iron'))).toBe(true);
    const apart = analyseDay([at('lentils', 60, 'lunch'), at('spinach', 80, 'lunch'), at('coffee', 200, 'breakfast')], t, { glutenFree: true });
    expect(apart.warnings.some((w) => w.text.includes('plant iron'))).toBe(false);
  });

  it('credits vitamin C with a plant-iron meal and nudges fat with carotenoids', () => {
    const a = analyseDay([at('lentils', 60, 'dinner'), at('red-pepper', 80, 'dinner'), at('carrots', 80, 'lunch')], t, { glutenFree: true });
    expect(a.wins.some((w) => w.includes('Vitamin C boosting'))).toBe(true);
    expect(a.warnings.some((w) => w.text.includes('carotenoid'))).toBe(true);
  });

  it('flags hidden-gluten foods in gluten-free mode', () => {
    for (const id of ['soy-sauce', 'couscous', 'barley', 'rye-bread', 'seitan', 'beer', 'sausages']) {
      const a = analyseDay([item(id, 50)], t, { glutenFree: true });
      expect(a.warnings.some((w) => w.text.includes('gluten'))).toBe(true);
    }
    expect(analyseDay([item('tamari', 15)], t, { glutenFree: true }).warnings.some((w) => w.text.includes('Contains gluten'))).toBe(false);
  });
});

import { parseVitals, rhrAnalysis, stepsVerdict, outdoorVerdict } from '@/engine/vitals';

describe('vitals', () => {
  it('parses a sentence about the day', () => {
    expect(parseVitals('12k steps, 40 min outside, HR 48')).toEqual({ steps: 12000, outdoorMin: 40, rhr: 48 });
    expect(parseVitals('walked 14,200 steps and 1.5 hours outdoors, 51 bpm')).toEqual({ steps: 14200, outdoorMin: 90, rhr: 51 });
    expect(parseVitals('resting heart rate was 46')).toEqual({ rhr: 46 });
  });

  it('puts 8–14k in the sweet spot and flags 20k as too much on a cut', () => {
    expect(stepsVerdict(11000).tone).toBe('good');
    expect(stepsVerdict(3000).tone).toBe('bad');
    expect(stepsVerdict(21000).tone).toBe('warn');
    expect(stepsVerdict(21000).score).toBeLessThan(stepsVerdict(12000).score);
  });

  it('rewards outdoor time and mentions vitamin D season correctly', () => {
    expect(outdoorVerdict(5, 11).detail).toContain('too low');
    expect(outdoorVerdict(45, 6).detail).toContain('vitamin D');
    expect(outdoorVerdict(45, 6).score).toBe(100);
  });

  it('compares morning HR to your own baseline', () => {
    const all: Record<string, { rhr: number }> = {};
    for (let d = 1; d <= 10; d++) all[`2026-11-${String(d).padStart(2, '0')}`] = { rhr: 48 };
    all['2026-11-11'] = { rhr: 57 };
    const a = rhrAnalysis('2026-11-11', all);
    expect(a.baseline).toBe(48);
    expect(a.delta).toBe(9);
    expect(a.verdict.tone).toBe('bad');
    all['2026-11-11'] = { rhr: 49 };
    expect(rhrAnalysis('2026-11-11', all).verdict.tone).toBe('good');
  });
});

describe('the big library', () => {
  it('has thousands of foods with unique ids', () => {
    expect(ALL_FOODS.length).toBeGreaterThan(4500);
    expect(UK_FOODS.length).toBeGreaterThan(100);
    expect(new Set(ALL_FOODS.map((x) => x.id)).size).toBe(ALL_FOODS.length);
  });

  it('every UK row has 9 or 10 fields (no stray semicolons in notes)', () => {
    for (const line of UK_RAW.trim().split('\n').filter((l) => l && !l.startsWith('#'))) {
      expect([9, 10]).toContain(line.split(';').length);
    }
  });

  it('finds what Dan actually buys', () => {
    const top = (q: string) => searchFoods(q, ALL_FOODS, 3).map((f) => f.id);
    expect(top('wild hake')[0]).toBe('uk-hake');
    expect(top('diced venison')[0]).toBe('venison');
    expect(top('venison mince')).toContain('usda-17343');
    expect(top('kippers')[0]).toBe('uk-kippers');
    expect(top('black pudding')[0]).toBe('uk-black-pudding');
    expect(top('courgette')[0]).toBe('courgette');
    expect(top('prawns')[0]).toBe('prawns');
  });

  it('USDA values match the source and use UK carbohydrate', () => {
    const deer = FOOD_BY_ID.get('usda-17164')!;
    expect(deer.name).toBe('Venison (deer), raw');
    expect(deer.n.kcal).toBe(120);
    expect(deer.n.protein).toBeCloseTo(22.96, 2);
    expect(deer.unknown).toContain('iodine');
    const oats = USDA_FOODS.find((f) => /^Oats/i.test(f.name) && f.n.fibre > 5)!;
    expect(oats.n.carbs).toBeLessThan(oats.n.kcal / 4);
  });

  it('flags gluten and processed meat in USDA foods', () => {
    const bread = USDA_FOODS.filter((f) => /^Bread, white/i.test(f.name));
    expect(bread.length).toBeGreaterThan(0);
    expect(bread.every((f) => f.tags.includes('gluten'))).toBe(true);
    expect(USDA_FOODS.filter((f) => /^Bacon|^Pork, cured, bacon/i.test(f.name)).every((f) => f.tags.includes('procmeat'))).toBe(true);
  });

  it('does not mark a food down for nutrients its source never records', () => {
    const hake = FOOD_BY_ID.get('uk-hake')!;
    expect(scoreFood(hake, t).score).toBeGreaterThan(60);
  });
});
