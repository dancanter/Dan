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

import { cookedToRaw, cookingYield } from '@/engine/cooking';
import { dayPuff, foodPuff } from '@/engine/puff';

describe('raw or cooked weights', () => {
  it('converts cooked weights back to raw', () => {
    expect(cookedToRaw(f('sirloin'), 144)).toBe(200);       // steak loses ~28%
    expect(cookedToRaw(f('white-rice'), 280)).toBe(100);    // rice absorbs water
    expect(cookedToRaw(f('salmon-wild'), 120)).toBe(150);
    expect(cookingYield(f('blueberries'))).toBeUndefined();
    expect(cookingYield(f('salmon-tinned'))).toBeUndefined();
  });

  it('understands "cooked" when typed', () => {
    const [rice, steak, eggs] = parseEntry('280g cooked rice, 150g steak, 2 eggs', ALL_FOODS);
    expect(rice.food?.id).toBe('white-rice');
    expect(rice.grams).toBe(100);
    expect(rice.cookedGrams).toBe(280);
    expect(steak.grams).toBe(150);
    expect(steak.cookedGrams).toBeUndefined();
    expect(eggs.grams).toBe(120);
  });

  it('finds the unhomogenised milks', () => {
    expect(searchFoods('estate unhomogenised semi skimmed', ALL_FOODS, 1)[0].id).toBe('uk-milk-unhomog-semi');
    expect(searchFoods('unhomogenised whole milk', ALL_FOODS, 1)[0].id).toBe('uk-milk-unhomog-whole');
  });
});

describe('puffiness and bloat', () => {
  it('rates salty food, alcohol and fizzy drinks', () => {
    expect(foodPuff(f('bacon')).face).toBe('high');
    expect(foodPuff(f('wine')).face).toBe('high');
    expect(foodPuff(f('avocado')).face).toBe('low');
    expect(foodPuff(f('cola')).gut).toBe('high');
    expect(foodPuff(f('lentils')).gut).toBe('medium');
    expect(foodPuff(f('kefir')).gut).toBe('low');
  });

  it('flags a sodium jump against your usual intake, not salt itself', () => {
    const usual = [item('eggs', 120), item('salmon-wild', 150), item('potato', 250), item('spinach', 80)];
    const salty = [...usual, item('salami', 60), item('olives', 60), item('tamari', 30)];
    const history = Array.from({ length: 5 }, () => usual);
    expect(dayPuff(usual, history).score).toBeGreaterThanOrEqual(85);
    const p = dayPuff(salty, history, 6);
    expect(p.jump!).toBeGreaterThan(1000);
    expect(p.score).toBeLessThan(70);
  });
});

describe('drinks by the glass', () => {
  it('understands glasses, pints and cans', () => {
    const [wine, beer, cola] = parseEntry('2 glasses wine, a pint of guinness, 1 can cola', ALL_FOODS);
    expect(wine.food?.id).toBe('wine');
    expect(wine.grams).toBe(350);
    expect(beer.food?.id).toBe('uk-guinness');
    expect(cola.food?.id).toBe('cola');
  });
});

import { defaultSeason, kcalForDate, phaseOn, plannedWeight, seasonProgress } from '@/engine/season';

describe('season plan', () => {
  const season = defaultSeason('2026-11-01');
  const start = 126.6 / 2.20462;

  it('builds Dan’s winter: cut, France, Christmas finish, recover', () => {
    expect(season.map((p) => p.kind)).toEqual(['cut', 'travel', 'cut', 'maintain']);
    expect(phaseOn(season, '2026-12-04')?.name).toBe('France');
    expect(phaseOn(season, '2026-12-24')?.name).toBe('Christmas finish');
  });

  it('lands inside the 122–124 lb target at 0.5% a week', () => {
    const france = plannedWeight(season, start, '2026-12-02')! * 2.20462;
    const xmas = plannedWeight(season, start, '2026-12-24')! * 2.20462;
    expect(france).toBeGreaterThan(123);
    expect(france).toBeLessThan(124.5);
    expect(xmas).toBeGreaterThan(121.5);
    expect(xmas).toBeLessThan(123);
  });

  it('eats at maintenance in France and reverses up after Christmas', () => {
    const p = { ...DEFAULT_PROFILE, season };
    const cut = kcalForDate(p, '2026-11-10', 57).kcal;
    const france = kcalForDate(p, '2026-12-04', 56).kcal;
    const wk1 = kcalForDate(p, '2026-12-26', 55.5).kcal;
    const wk3 = kcalForDate(p, '2027-01-09', 55.5).kcal;
    expect(cut).toBe(1799);
    expect(france).toBeGreaterThan(2400);
    expect(wk1).toBe(1799 + 150);
    expect(wk3).toBe(1799 + 450);
  });

  it('warns when weight drops faster than 0.75% a week', () => {
    const prog = seasonProgress(season, start, '2026-11-20', start - 2, -0.6);
    expect(prog?.verdict).toBe('too-fast');
  });
});

describe('counting items', () => {
  it('logs eggs by size and number', () => {
    const [a, b, c] = parseEntry('4 large eggs, 3 medium eggs, 2 eggs', ALL_FOODS);
    expect([a.grams, b.grams, c.grams]).toEqual([240, 156, 120]);
    expect(a.qty).toMatchObject({ count: 4, label: 'large egg' });
    expect(b.qty?.label).toBe('medium egg');
  });

  it('finds Kallo lentil cakes and counts them', () => {
    const [cakes, rice] = parseEntry('3 kallo lentil rice cakes, 2 rice cakes', ALL_FOODS);
    expect(cakes.food?.id).toBe('uk-kallo-lentil');
    expect(cakes.grams).toBe(15.9);
    expect(rice.food?.id).toBe('rice-cakes');
    expect(rice.grams).toBe(16);
  });

  it('handles half an avocado', () => {
    const [av] = parseEntry('half an avocado', ALL_FOODS);
    expect(av.food?.id).toBe('avocado');
    expect(av.grams).toBe(75);
  });
});

describe('library data hygiene', () => {
  it('no curated note is cut short by a stray semicolon', () => {
    for (const f of FOODS) expect(f.alias === undefined || !/[.!?]$/.test(f.alias)).toBe(true);
  });
});

import { assessLoad, fromStrava, type Session } from '@/engine/training';
import { addDays } from '@/engine/body';
import { bpCategory, fitnessAge, glowAge, vdot, vo2FromRaces } from '@/engine/health';

describe('VO2 max and health markers', () => {
  it('matches Daniels VDOT for Dan’s races', () => {
    expect(vdot(5000, 17 * 60 + 17)).toBeCloseTo(59.0, 0);
    expect(vdot(10000, 36 * 60 + 55)).toBeCloseTo(57.1, 0);
    const est = vo2FromRaces({ mile: '4:57', k5: '17:17', k10: '36:55' })!;
    expect(est.vo2).toBeGreaterThan(58);
    expect(est.vo2).toBeLessThan(60);
    expect(fitnessAge(est.vo2)).toBe(18);
    expect(fitnessAge(45)).toBe(25);
  });

  it('classifies blood pressure by NHS thresholds', () => {
    expect(bpCategory(115, 72).label).toBe('Ideal');
    expect(bpCategory(128, 78).label).toBe('Slightly raised');
    expect(bpCategory(142, 85).label).toBe('High');
    expect(bpCategory(88, 58).label).toBe('Low');
  });

  it('builds a transparent Glow age', () => {
    const g = glowAge(25, { vo2: 59, rhr: 48, bp: { date: '2026-11-01', sys: 115, dia: 70 }, sleepAvg: 8.2 });
    expect(g.age).toBeLessThan(25);
    expect(g.lines).toHaveLength(4);
  });
});

describe('training load', () => {
  const run = (id: string, intensity: Session['intensity'], minutes = 40): Session => ({ id, source: 'manual', kind: 'run', name: id, minutes, km: 8, intensity });
  const lift = (id: string): Session => ({ id, source: 'manual', kind: 'lift', name: 'lift', minutes: 60, intensity: 'moderate' });

  it('maps Strava activities and guesses intensity from the name', () => {
    const a = fromStrava({ id: '1', name: '800m x 6 subthreshold', sport_type: 'Run', start_local: '2026-10-28T15:40:11', summary: { distance: 4801.6, moving_time: 1012, total_calories: 342, avg_speed: 4.74 } });
    expect(a.date).toBe('2026-10-28');
    expect(a.session).toMatchObject({ kind: 'run', intensity: 'hard', minutes: 17, kcal: 342 });
    expect(fromStrava({ id: '2', name: 'Easy 5 mile run', sport_type: 'Run', start_local: '2026-10-26T14:31:50', summary: { distance: 8041, moving_time: 2459 } }).session.intensity).toBe('easy');
    expect(fromStrava({ id: '3', name: 'Push day', sport_type: 'WeightTraining', start_local: '2026-10-26T09:00:00', summary: { moving_time: 3600 } }).session.kind).toBe('lift');
  });

  it('calls a sensible week balanced and a stacked week too much', () => {
    const base = '2026-11-30';
    const sensible: Record<string, Session[]> = {};
    const stacked: Record<string, Session[]> = {};
    for (let i = 0; i < 28; i++) {
      const d = addDays(base, -i);
      const wd = i % 7;
      sensible[d] = wd === 1 || wd === 4 ? [run(`q${i}`, 'hard')] : wd === 0 ? [] : [run(`e${i}`, 'easy'), ...(wd % 2 ? [lift(`l${i}`)] : [])];
      stacked[d] = i < 7 ? [run(`h${i}`, 'hard', 60), lift(`L${i}`)] : wd % 2 ? [run(`e${i}`, 'easy', 30)] : [];
    }
    const ctx = { kg: 57, vitals: {}, sleepHours: [8, 8.5, 8], inDeficit: true };
    expect(assessLoad(base, sensible, ctx).level).toBe('balanced');
    const bad = assessLoad(base, stacked, { ...ctx, ea: 24 });
    expect(bad.level).toBe('too-much');
    expect(bad.reasons.length).toBeGreaterThan(2);
  });
});

import { SWAPS, swapFor } from '@/data/swaps';
import { STRESS_TOPICS, SWEETENER_VERDICT } from '@/data/science';

describe('swaps, sweeteners and stress', () => {
  it('every swap points at real foods', () => {
    for (const s of SWAPS) {
      expect(FOOD_BY_ID.get(s.from), s.from).toBeTruthy();
      for (const t of s.to) expect(FOOD_BY_ID.get(t), `${s.from} -> ${t}`).toBeTruthy();
    }
    expect(swapFor(f('beef-mince-20'))?.gain).toBe('big');
    expect(swapFor(f('spinach'))?.gain).toBe('small');
  });

  it('flags all-day squash sipping, not one glass', () => {
    const squash = (n: number) => Array.from({ length: n }, (_, i) => ({ uid: `s${i}`, food: f('uk-squash'), grams: 250, meal: 'snacks' as const }));
    const allDay = analyseDay(squash(6), t, { glutenFree: true });
    expect(allDay.warnings.some((w) => w.text.includes('enamel'))).toBe(true);
    const one = analyseDay(squash(1), t, { glutenFree: true });
    expect(one.warnings.some((w) => w.text.includes('enamel'))).toBe(false);
    expect(scoreFood(f('uk-squash'), t).score).toBeLessThan(scoreFood(f('water'), t).score);
  });

  it('finds sweetener drops and every stress source exists', () => {
    expect(parseEntry('5 sweetener drops', ALL_FOODS)[0].food?.id).toBe('uk-sweetener-drops');
    const ids = new Set(SOURCES.map((x) => x.id));
    for (const topic of STRESS_TOPICS) for (const sid of topic.sources) expect(ids.has(sid)).toBe(true);
    for (const sid of SWEETENER_VERDICT.sources) expect(ids.has(sid)).toBe(true);
  });
});

import { healthRank } from '@/engine/health';

describe('health rank', () => {
  it('puts a VO2 max of 59 in roughly the top few percent', () => {
    const r = healthRank({ vo2: 59, rhr: 48, habits: { nonSmoker: true, activeEnough: true, dietGood: true, leanHealthy: true, sleepGood: true, lowAlcohol: true, dailySpf: true } });
    const vo2 = r.lines.find((l) => l.label.startsWith('VO2'))!;
    expect(vo2.topPct).toBeGreaterThan(1);
    expect(vo2.topPct).toBeLessThan(5);
    expect(r.core).toBe(4);
    expect(r.rarest).toBeLessThan(3);
  });

  it('daily SPF takes a year off Glow age', () => {
    const without = glowAge(25, { vo2: 59 });
    const withSpf = glowAge(25, { vo2: 59, dailySpf: true });
    expect(withSpf.age).toBeCloseTo(without.age - 1, 5);
  });
});

import { cleanWeights, nextMoves, noisyDates, refeedCall, restCall, studyVerdict } from '@/engine/calls';
import type { State } from '@/store';

describe('coach calls', () => {
  const base = (): State => ({ version: 1, profile: { ...DEFAULT_PROFILE }, days: {}, weights: [], sleeps: [], customFoods: [], favourites: [], breathMinutes: {}, vitals: {}, training: {}, bp: [], labs: [] });

  it('treats the two mornings after a refeed as noise', () => {
    const s = base();
    s.days['2026-11-01'] = { items: [], rituals: [], refeed: true };
    s.weights = [{ date: '2026-11-01', kg: 57.4 }, { date: '2026-11-02', kg: 58.3 }, { date: '2026-11-03', kg: 58.0 }, { date: '2026-11-04', kg: 57.3 }];
    expect([...noisyDates(s)].sort()).toEqual(['2026-11-02', '2026-11-03']);
    expect(cleanWeights(s).map((w) => w.date)).toEqual(['2026-11-01', '2026-11-04']);
  });

  it('calls a refeed after 12+ days of cutting, and not outside a cut', () => {
    const s = base();
    s.profile.season = defaultSeason('2026-11-02');
    expect(refeedCall(s, '2026-11-08').kind).toBe('none');
    expect(refeedCall(s, '2026-11-15').kind).toBe('refeed');
    s.days['2026-11-14'] = { items: [], rituals: [], refeed: true };
    expect(refeedCall(s, '2026-11-15').kind).toBe('none');
    expect(refeedCall(s, '2026-12-04').kind).toBe('none'); // France
  });

  it('calls a rest day when morning HR jumps 8+', () => {
    const s = base();
    for (let d = 1; d <= 10; d++) s.vitals[`2026-11-${String(d).padStart(2, '0')}`] = { rhr: 48 };
    s.vitals['2026-11-11'] = { rhr: 57 };
    expect(restCall(s, '2026-11-11', 57).kind).toBe('rest');
    s.vitals['2026-11-11'] = { rhr: 49 };
    expect(restCall(s, '2026-11-11', 57).kind).toBe('none');
  });

  it('judges deep work sensibly and ranks next moves', () => {
    expect(studyVerdict(3, 15, 17).tone).toBe('good');
    expect(studyVerdict(7, 30, 32).tone).toBe('warn');
    const moves = nextMoves(base(), '2026-11-02');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.length).toBeLessThanOrEqual(3);
    expect(moves[0].text).toContain('season plan');
  });

  it('has Fage, Clarence Court eggs and 20 kcal Kallo cakes', () => {
    expect(searchFoods('fage 0%', ALL_FOODS, 1)[0].id).toBe('uk-fage-0');
    expect(searchFoods('clarence eggs', ALL_FOODS, 1)[0].id).toBe('uk-clarence-eggs');
    const [kallo] = parseEntry('1 kallo lentil cake', ALL_FOODS);
    expect(Math.round((kallo.food!.n.kcal * kallo.grams!) / 100)).toBe(20);
    const [cc] = parseEntry('3 large clarence eggs', ALL_FOODS);
    expect(cc.grams).toBe(180);
  });
});

import { BLOAT_SWAPS } from '@/data/swaps';
import { foodPuff as puffOf } from '@/engine/puff';

describe('bloat-prone mode', () => {
  it('rates FODMAP foods high and offers low-FODMAP swaps', () => {
    expect(puffOf(f('lentils'), 60, true).gut).toBe('high');
    expect(puffOf(f('lentils'), 60, false).gut).toBe('medium');
    expect(swapFor(f('lentils'), true)?.targets.map((x) => x.id)).toContain('quinoa');
    expect(swapFor(f('lentils'), false)).toBeUndefined();
    for (const s of BLOAT_SWAPS) for (const id of [s.from, ...s.to]) expect(FOOD_BY_ID.get(id), id).toBeTruthy();
  });

  it('counts spinach iron at a heavily reduced rate', () => {
    const a = analyseDay([item('spinach', 100)], t, { glutenFree: true });
    expect(a.effective.iron / a.totals.iron).toBeCloseTo(0.4, 2);
  });
});

import { studyLoad } from '@/engine/calls';

describe('study load', () => {
  const st = (): State => ({ version: 1, profile: { ...DEFAULT_PROFILE }, days: {}, weights: [], sleeps: [], customFoods: [], favourites: [], breathMinutes: {}, vitals: {}, training: {}, bp: [], labs: [] });
  it('is fine at OU pace and flags too much deep work', () => {
    const s = st();
    for (let i = 0; i < 7; i++) s.vitals[addDays('2026-11-15', -i)] = { studyHours: 3, deepHours: 2.5 };
    expect(studyLoad(s, '2026-11-15').level).toBe('ok');
    for (let i = 0; i < 4; i++) s.vitals[addDays('2026-11-15', -i)] = { studyHours: 6, deepHours: 5 };
    const heavy = studyLoad(s, '2026-11-15');
    expect(heavy.level).toBe('too-much');
    expect(nextMoves(s, '2026-11-15').some((m) => m.text.startsWith('Too much deep work'))).toBe(true);
    s.vitals['2026-11-15'] = { deepHours: 7 };
    expect(studyLoad(s, '2026-11-15').reasons[0]).toContain('7 h');
  });
});

describe('too little deep study', () => {
  const st = (): State => ({ version: 1, profile: { ...DEFAULT_PROFILE }, days: {}, weights: [], sleeps: [], customFoods: [], favourites: [], breathMinutes: {}, vitals: {}, training: {}, bp: [], labs: [] });
  it('only judges after a full week, then flags under 8 deep hours', () => {
    const s = st();
    s.vitals['2026-11-15'] = { deepHours: 1 };
    expect(studyLoad(s, '2026-11-15').level).toBe('ok');
    for (let i = 0; i < 7; i++) s.vitals[addDays('2026-11-15', -i)] = { deepHours: 1 };
    expect(studyLoad(s, '2026-11-15').level).toBe('too-little');
    for (let i = 0; i < 7; i++) s.vitals[addDays('2026-11-15', -i)] = { deepHours: 1.5 };
    expect(studyLoad(s, '2026-11-15').level).toBe('light');
    for (let i = 0; i < 7; i++) s.vitals[addDays('2026-11-15', -i)] = { deepHours: i < 6 ? 2.5 : 0 };
    expect(studyLoad(s, '2026-11-15').level).toBe('ok');
  });
});

describe('study planner done', () => {
  it('drops too-little when the planner is finished, but still flags too much', () => {
    const s: State = { version: 1, profile: { ...DEFAULT_PROFILE }, days: {}, weights: [], sleeps: [], customFoods: [], favourites: [], breathMinutes: {}, vitals: {}, training: {}, bp: [], labs: [] };
    for (let i = 0; i < 7; i++) s.vitals[addDays('2026-11-15', -i)] = { deepHours: 1 };
    expect(studyLoad(s, '2026-11-15').level).toBe('too-little');
    s.vitals['2026-11-14'] = { ...s.vitals['2026-11-14'], studyOnPlan: true };
    expect(studyLoad(s, '2026-11-15').level).toBe('ok');
    s.vitals['2026-11-15'] = { deepHours: 7 };
    expect(studyLoad(s, '2026-11-15').level).toBe('too-much');
  });
});
