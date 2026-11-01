import { MICROS, NUTRIENT_KEYS, NUTRIENTS, type NKey, type Nutrients } from '@/data/nutrients';
import { PLANT_CATEGORIES, type Food, type Tag } from '@/data/foods';
import { PILLARS, type Component, type Pillar } from '@/data/science';

// ── Targets ──────────────────────────────────────────────────────────────
export interface Profile {
  name: string;
  dob: string; // YYYY-MM-DD
  heightCm: number;
  unit: 'lb' | 'kg';
  kcalTarget: number;
  proteinPerKg: number;
  /** Average daily energy spent in training (runs + lifting), kcal. */
  exerciseKcal: number;
  bodyFatPct: number;
  glutenFree: boolean;
  goalWeightKg?: number;
  /** An upcoming event to look your best for. */
  bigDay?: { label: string; date: string };
  /** Phases with dates: cut, travel, maintain. */
  season?: import('./season').Phase[];
}

export type Targets = Record<NKey, number>;

export function targetsFor(p: Profile, weightKg: number | undefined): Targets {
  const t = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, NUTRIENTS[k].target])) as Targets;
  const kg = weightKg ?? 57;
  t.kcal = p.kcalTarget;
  t.protein = Math.round(kg * p.proteinPerKg);
  t.fat = Math.round((p.kcalTarget * 0.27) / 9);
  t.carbs = Math.max(0, Math.round((p.kcalTarget - t.protein * 4 - t.fat * 9) / 4));
  t.satFat = Math.round((p.kcalTarget * 0.1) / 9);
  return t;
}

// ── Bioavailability ─────────────────────────────────────────────────────
// A food's label value isn't what you absorb. These factors are deliberately
// coarse: they reflect the direction and rough size of well-established
// effects, not precise absorption figures.
export function bioFactors(f: Pick<Food, 'tags' | 'category'>): Partial<Record<NKey, number>> {
  const has = (t: Tag) => f.tags.includes(t);
  const animal = ['meat', 'offal', 'fish', 'shellfish', 'eggs', 'dairy'].includes(f.category);
  const out: Partial<Record<NKey, number>> = {};
  if (has('haem')) out.iron = 1.5;
  else if (!animal) out.iron = has('phy') ? 0.5 : 0.7;
  if (!animal) out.zinc = has('phy') ? 0.6 : 0.8;
  if (has('phy')) out.calcium = 0.8;
  if (has('oxa')) out.calcium = 0.1;
  return out;
}

export function scaleNutrients(n: Nutrients, grams: number): Nutrients {
  const r = grams / 100;
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, n[k] * r])) as Nutrients;
}

function effective(f: Food, n: Nutrients): Nutrients {
  const out = { ...n };
  for (const [k, v] of Object.entries(bioFactors(f)) as [NKey, number][]) out[k] = n[k] * v;
  return out;
}

/** Free sugar per 100 g: total sugar in foods tagged as added sugar or juice. Intrinsic fruit and milk sugars don't count. */
export function freeSugarPer100(f: Food): number {
  return f.tags.includes('addsug') || f.tags.includes('juice') ? f.n.sugar : 0;
}

// ── Single-food optimisation score ──────────────────────────────────────
export interface FoodScore {
  score: number;
  grade: string;
  /** Top nutrients per portion as % of daily target, bioavailability-adjusted. */
  stars: { key: NKey; pct: number }[];
  bonuses: Tag[];
  penalties: Tag[];
}

const BONUS: Partial<Record<Tag, number>> = {
  poly: 0.06, poly2: 0.14, sulf: 0.1, ferm: 0.1, carot: 0.06, lut: 0.04, astax: 0.06, sperm: 0.05,
  nitr: 0.06, coll: 0.03, mufa: 0.06, evoo: 0.3, ala: 0.05, preb: 0.06, creat: 0.04, coq: 0.04,
};
const PENALTY: Partial<Record<Tag, number>> = {
  upf: 0.35, addsug: 0.2, procmeat: 0.35, fried: 0.2, alc: 0.5, trans: 0.5, juice: 0.12, merc: 0.05, merc2: 0.45, iodHigh: 0.3,
};

export function gradeFor(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

/**
 * How hard each calorie in this food works. A density score (how much of your
 * micronutrient, protein, fibre and omega-3 targets you get per 100 kcal,
 * after bioavailability) plus bonuses for protective compounds, minus
 * penalties for processing, free sugar, alcohol and frying.
 */
export function scoreFood(f: Food, t: Targets = targetsFor(DEFAULT_PROFILE, 57)): FoodScore {
  const eff = effective(f, f.n);
  const per100kcal = 100 / Math.max(f.n.kcal, 20);
  const portion = scaleNutrients(eff, f.portion.g);
  const bonuses = f.tags.filter((tg) => BONUS[tg]);
  const penalties = f.tags.filter((tg) => PENALTY[tg] !== undefined);
  const bonusSum = bonuses.reduce((s, tg) => s + (BONUS[tg] ?? 0), 0);
  const penaltyFor = (tg: Tag) => (tg === 'addsug' ? 0.05 + Math.min(0.3, (f.n.sugar / 100) * 0.5) : (PENALTY[tg] ?? 0));
  const penaltySum = penalties.reduce((s, tg) => s + penaltyFor(tg), 0) + (f.nova === 4 && !f.tags.includes('upf') ? 0.35 : 0);

  let score: number;
  if (f.n.kcal < 5) {
    // Calorie-free drinks: neutral, nudged by polyphenols or processing.
    score = Math.round(Math.max(0, Math.min(100, 50 + bonusSum * 150 - penaltySum * 100)));
  } else {
    let raw: number;
    const protein = Math.min(1, (f.n.protein * per100kcal) / 10);
    const fibre = Math.min(1, (f.n.fibre * per100kcal) / 4);
    if (f.limitedData || MICROS.filter((k) => !f.unknown?.includes(k)).length < 8) {
      // Unknown micronutrients: judge mainly on processing and macros.
      const sugarPen = Math.min(0.3, (f.n.sugar / 100) * 0.6);
      raw = 0.3 + 0.25 * protein + 0.2 * fibre - sugarPen - (f.nova === 4 ? 0.3 : f.nova === 3 ? 0.08 : 0);
    } else {
      // Only nutrients the source actually records count, so a food isn't
      // marked down for a gap in the database (USDA never lists iodine).
      const known = MICROS.filter((k) => !f.unknown?.includes(k));
      const density = known.reduce((s, k) => s + Math.min(1, (eff[k] / t[k]) * per100kcal), 0) / Math.max(known.length, 1);
      const omega = Math.min(1, (f.n.omega3 * per100kcal) / 0.4);
      raw = 0.55 * density + 0.2 * protein + 0.1 * fibre + 0.15 * omega;
      // "Superstar" foods cover a big share of a target in one normal portion
      // (one Brazil nut, a teaspoon of cod liver oil), which per-calorie
      // density alone undersells.
      const stars = MICROS.filter((k) => portion[k] / t[k] >= 0.5).length;
      if (portion.kcal < 300) raw += Math.min(0.3, stars * 0.14);
    }
    raw += bonusSum - penaltySum;
    if (f.nova === 1) raw += 0.08;
    // Saturated fat above a fifth of a food's energy is a small minus
    // (not for fermented dairy, where trials suggest the food matrix offsets it).
    if ((f.n.satFat * 9) / f.n.kcal > 0.2 && !f.tags.includes('ferm')) raw -= 0.08;
    if (f.n.sodium * per100kcal > 600) raw -= 0.08;
    score = Math.round(100 * (1 - Math.exp(-2.6 * Math.max(0, raw))));
    if (f.nova <= 2 && !penalties.length) score = Math.max(score, 10);
  }

  const stars = MICROS.concat(['protein', 'fibre', 'omega3'])
    .filter((k) => !f.unknown?.includes(k))
    .map((k) => ({ key: k, pct: Math.round((portion[k] / t[k]) * 100) }))
    .filter((s) => s.pct >= 10)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);
  return { score, grade: gradeFor(score), stars, bonuses, penalties };
}

// ── A day's log ──────────────────────────────────────────────────────────
export interface LoggedItem {
  uid: string;
  food: Food;
  grams: number;
  meal: Meal;
  qty?: { count: number; label: string; plural?: string };
}
export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface DayAnalysis {
  totals: Nutrients;
  effective: Nutrients;
  freeSugar: number;
  retinol: number;
  tagServings: Partial<Record<Tag, number>>;
  plants: number;
  coverage: number; // 0..1 average micro coverage
  pillars: { pillar: Pillar; score: number }[];
  nutritionScore: number;
  warnings: Warning[];
  wins: string[];
}

export interface Warning {
  level: 'danger' | 'caution' | 'info';
  text: string;
}

export interface DayContext {
  sleepScore?: number; // 0..100
  energyAvailability?: number; // kcal per kg FFM, from body.ts
  glutenFree: boolean;
  /** The day still in progress (today): low intake is not yet a warning. */
  inProgress?: boolean;
}

const RETINOL_CATS = new Set(['meat', 'offal', 'fish', 'shellfish', 'eggs', 'dairy', 'fats']);

export function analyseDay(items: LoggedItem[], t: Targets, ctx: DayContext): DayAnalysis {
  const zero = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as Nutrients;
  const totals = { ...zero };
  const eff = { ...zero };
  let freeSugar = 0;
  let retinol = 0;
  const tagServings: Partial<Record<Tag, number>> = {};
  const plantIds = new Set<string>();

  for (const it of items) {
    const n = scaleNutrients(it.food.n, it.grams);
    const e = effective(it.food, n);
    for (const k of NUTRIENT_KEYS) {
      totals[k] += n[k];
      eff[k] += e[k];
    }
    freeSugar += (freeSugarPer100(it.food) * it.grams) / 100;
    if (RETINOL_CATS.has(it.food.category) || it.food.tags.includes('retinol')) retinol += n.vitA;
    // One "serving" of a tag is the food's own standard portion, so a pinch
    // of turmeric isn't worth the same as a bowl of berries.
    const servings = Math.min(2, it.grams / Math.max(it.food.portion.g, 1));
    for (const tg of it.food.tags) {
      const w = tg === 'poly2' ? 2 : 1;
      const key: Tag = tg === 'poly2' ? 'poly' : tg;
      tagServings[key] = (tagServings[key] ?? 0) + servings * w;
    }
    if (PLANT_CATEGORIES.includes(it.food.category) && it.grams >= 5 && !it.food.tags.includes('upf')) plantIds.add(it.food.id);
  }

  const coverage = MICROS.reduce((s, k) => s + Math.min(1, eff[k] / t[k]), 0) / MICROS.length;

  const special = (key: Extract<Component, { kind: 'special' }>['key']): number => {
    switch (key) {
      case 'energy': {
        const ea = ctx.energyAvailability;
        if (ea === undefined) return Math.min(1, totals.kcal / t.kcal);
        return clamp01((ea - 25) / (40 - 25));
      }
      case 'fatShare':
        return totals.kcal ? clamp01(((totals.fat * 9) / totals.kcal - 0.12) / (0.22 - 0.12)) : 0;
      case 'sleep':
        return ctx.sleepScore === undefined ? 0.5 : ctx.sleepScore / 100;
      case 'plants':
        return Math.min(1, plantIds.size / 8);
      case 'freeSugarLow':
        if (!items.length) return 0;
        return freeSugar <= 30 ? 1 : clamp01(1 - (freeSugar - 30) / 30);
      case 'protein':
        return Math.min(1, totals.protein / t.protein);
    }
  };

  const pillars = PILLARS.map((pillar) => {
    let sum = 0;
    let wsum = 0;
    for (const c of pillar.components) {
      const v =
        c.kind === 'nutrient' ? Math.min(1, eff[c.key] / t[c.key])
        : c.kind === 'tag' ? Math.min(1, (tagServings[c.tag] ?? 0) / c.servings)
        : special(c.key);
      sum += v * c.w;
      wsum += c.w;
    }
    let score = (sum / wsum) * 100;
    for (const p of pillar.penalties) score -= (tagServings[p.tag] ?? 0) * p.points;
    return { pillar, score: Math.round(Math.max(0, Math.min(100, score))) };
  });

  const warnings: Warning[] = [];
  const wins: string[] = [];
  if (retinol > 3000) warnings.push({ level: 'danger', text: `Retinol about ${Math.round(retinol)} µg, over the 3,000 µg upper limit. Fine as a one-off; keep liver to about once a week.` });
  for (const k of ['selenium', 'zinc', 'copper', 'iodine'] as NKey[]) {
    const up = NUTRIENTS[k].upper!;
    if (totals[k] > up) warnings.push({ level: 'danger', text: `${NUTRIENTS[k].label} ${Math.round(totals[k])} ${NUTRIENTS[k].unit}, above the ${up} ${NUTRIENTS[k].unit} upper limit. ${NUTRIENTS[k].upperNote ?? ''}`.trim() });
  }
  if (totals.vitD > 100) warnings.push({ level: 'caution', text: 'Vitamin D above 100 µg from food is unusual. Check any supplements.' });
  if (freeSugar > 30) warnings.push({ level: 'caution', text: `About ${Math.round(freeSugar)} g free sugar (limit 30 g).` });
  if (totals.sodium > 3500) warnings.push({ level: 'caution', text: `Sodium about ${(totals.sodium / 1000).toFixed(1)} g. A jump above your usual intake shows as puffiness tomorrow.` });
  if ((tagServings.alc ?? 0) > 0) warnings.push({ level: 'caution', text: 'Alcohol logged. Expect lighter sleep, a lower readiness score and a puffier face tomorrow. Drink water and eat potassium-rich food.' });
  if ((tagServings.merc2 ?? 0) > 0) warnings.push({ level: 'caution', text: 'High-mercury fish today. Keep it to one portion a week.' });
  if ((tagServings.procmeat ?? 0) > 0) warnings.push({ level: 'info', text: 'Processed meat logged. Swap for fresh butcher meat where you can.' });
  const glutenFoods = [...new Set(items.filter((i) => i.food.tags.includes('gluten')).map((i) => i.food.name))];
  if (ctx.glutenFree && glutenFoods.length) warnings.push({ level: 'danger', text: `Contains gluten: ${glutenFoods.join(', ')}. Not safe with coeliac disease unless the label says gluten-free.` });
  if (ctx.glutenFree && items.some((i) => i.food.tags.includes('oats'))) warnings.push({ level: 'info', text: 'Oats: make sure they are certified gluten-free.' });
  if (!ctx.inProgress && items.length && ctx.energyAvailability !== undefined && ctx.energyAvailability < 30)
    warnings.push({ level: 'danger', text: `Energy availability about ${Math.round(ctx.energyAvailability)} kcal/kg fat-free mass, which is in the low zone (under 30). This is what suppresses hormones, sleep and skin quality. Add 200–400 kcal, mostly carbohydrate around training.` });

  // Meal-level absorption checks: what you eat together matters.
  const MEAL_LABEL: Record<Meal, string> = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', snacks: 'snacks' };
  for (const meal of ['breakfast', 'lunch', 'dinner', 'snacks'] as Meal[]) {
    const its = items.filter((i) => i.meal === meal);
    if (!its.length) continue;
    const sum = (fn: (i: LoggedItem) => number) => its.reduce((a, i) => a + fn(i), 0);
    const plantIron = sum((i) => (i.food.tags.includes('haem') ? 0 : (i.food.n.iron * i.grams) / 100));
    const allIron = sum((i) => (i.food.n.iron * i.grams) / 100);
    const calcium = sum((i) => (i.food.n.calcium * i.grams) / 100);
    const vitC = sum((i) => (i.food.n.vitC * i.grams) / 100);
    const fat = sum((i) => (i.food.n.fat * i.grams) / 100);
    const brew = its.find((i) => i.food.tags.includes('caff') && i.food.category === 'drinks' && i.food.tags.some((t) => t === 'poly' || t === 'poly2'));
    const carot = its.some((i) => i.food.tags.includes('carot') && i.grams >= 40);
    const m = MEAL_LABEL[meal];
    if (brew && plantIron >= 2)
      warnings.push({ level: 'info', text: `Absorption: ${brew.food.name.split(/[(,]/)[0].trim().toLowerCase()} with ${m} can cut the plant iron in that meal by roughly half. Have it an hour before or after.` });
    if (calcium >= 300 && allIron >= 3)
      warnings.push({ level: 'info', text: `Absorption: about ${Math.round(calcium)} mg calcium alongside ${allIron.toFixed(1)} mg iron at ${m}. Calcium reduces iron uptake in the same meal, so keep dairy for a different meal if your ferritin runs low.` });
    if (carot && fat < 3)
      warnings.push({ level: 'info', text: `Absorption: carotenoid-rich veg at ${m} with almost no fat. Add olive oil, avocado or eggs to absorb several times more.` });
    if (plantIron >= 2 && vitC >= 25) wins.push(`Vitamin C boosting plant iron at ${m}`);
  }

  if (totals.omega3 >= 0.5) wins.push('Omega-3 target hit');
  if (totals.fibre >= 30) wins.push('30 g fibre');
  if (plantIds.size >= 8) wins.push(`${plantIds.size} different plants`);
  if ((tagServings.ferm ?? 0) >= 2) wins.push('Two fermented foods');
  if ((tagServings.poly ?? 0) >= 5) wins.push('Polyphenol-rich day');
  if (items.length && freeSugar <= 10) wins.push('Almost no free sugar');
  if (items.length && !items.some((i) => i.food.nova === 4)) wins.push('Zero ultra-processed food');
  if (totals.protein >= t.protein) wins.push('Protein target hit');

  const pillarMean = pillars.reduce((s, p) => s + p.score, 0) / pillars.length;
  const dangerCount = warnings.filter((w) => w.level === 'danger').length;
  const nutritionScore = items.length ? Math.round(Math.max(0, pillarMean - dangerCount * 5)) : 0;

  return { totals, effective: eff, freeSugar, retinol, tagServings, plants: plantIds.size, coverage, pillars, nutritionScore, warnings, wins };
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export const DEFAULT_PROFILE: Profile = {
  name: 'Dan',
  dob: '2000-11-28',
  heightCm: 172.7,
  unit: 'lb',
  kcalTarget: 1799,
  proteinPerKg: 2.0,
  exerciseKcal: 650,
  bodyFatPct: 10,
  glutenFree: true,
};

