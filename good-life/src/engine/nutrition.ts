import { todayISO, type ISODate } from '@/lib/dates';
import { FOOD_BY_ID, FOODS, RNI, type Food, type Nutrients } from '@/data/foods';
import type { AppData, CustomFood, FoodEntry, MealSlot } from '@/store/types';
import { weightTrend } from './physique';
import { dayPlan } from './plan';

export type Tolerance = 'tolerated' | 'problematic' | 'untested';

export function customToFood(c: CustomFood): Food {
  return {
    id: c.id,
    name: c.name,
    category: 'drinks-other',
    basis: 'as-sold',
    portion: { g: 100, label: '100 g' },
    gluten: c.glutenFree === 'yes' ? 'naturally-gf' : c.glutenFree === 'no' ? 'contains-gluten' : 'check-label',
    n: { ...emptyNutrients(), ...c.per100g },
    notes: c.notes ? [c.notes] : ['Your own food — values from its label.'],
  };
}

export function emptyNutrients(): Nutrients {
  return { kcal: 0, protein: 0, carbs: 0, fibre: 0, fat: 0, satFat: 0, leucine: 0, iron: 0, zinc: 0, calcium: 0, magnesium: 0, potassium: 0, selenium: 0, epaDha: 0, ala: 0, vitD: 0, b12: 0, folate: 0, vitC: 0, vitA: 0, vitE: 0, vitK: 0 };
}

export function allFoods(d: AppData): Food[] {
  return [...FOODS, ...d.customFoods.map(customToFood)];
}

export function foodById(d: AppData, id: string): Food | undefined {
  return FOOD_BY_ID[id] ?? (d.customFoods.find((c) => c.id === id) ? customToFood(d.customFoods.find((c) => c.id === id)!) : undefined);
}

export function scale(n: Nutrients, grams: number): Nutrients {
  const f = grams / 100;
  const out = emptyNutrients();
  for (const k of Object.keys(out) as (keyof Nutrients)[]) out[k] = (n[k] ?? 0) * f;
  return out;
}

export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  const out = emptyNutrients();
  for (const k of Object.keys(out) as (keyof Nutrients)[]) out[k] = (a[k] ?? 0) + (b[k] ?? 0);
  return out;
}

export function totals(d: AppData, items: { foodId: string; grams: number }[]): Nutrients {
  return items.reduce((acc, it) => {
    const f = foodById(d, it.foodId);
    return f ? addNutrients(acc, scale(f.n, it.grams)) : acc;
  }, emptyNutrients());
}

export function kcalOf(d: AppData) {
  return (foodId: string, g: number) => {
    const f = foodById(d, foodId);
    return f ? (f.n.kcal * g) / 100 : 0;
  };
}

export function tolerance(d: AppData, foodId: string): Tolerance {
  if (d.foodTolerance[foodId]) return d.foodTolerance[foodId];
  if (d.profile.diet.problematic.includes(foodId)) return 'problematic';
  if (d.profile.diet.tolerated.includes(foodId)) return 'tolerated';
  return 'untested';
}

export function dayEntries(d: AppData, date: ISODate): FoodEntry[] {
  return d.food.filter((f) => f.date === date);
}

export function byMeal(entries: FoodEntry[]): Partial<Record<MealSlot, FoodEntry[]>> {
  const out: Partial<Record<MealSlot, FoodEntry[]>> = {};
  for (const e of entries) out[e.meal] = [...(out[e.meal] ?? []), e];
  return out;
}

// ─── Targets ───────────────────────────────────────────────────────────────

export type DayType = 'rest' | 'easy' | 'quality' | 'quality-plus-gym' | 'gym-only';

export interface Range {
  lo: number;
  hi: number;
}

export interface Targets {
  dayType: DayType;
  bodyweightKg: number;
  protein: Range;
  carbs: Range;
  fat: Range;
  fibre: number;
  energy: Range;
  perMealProtein: number;
  rationale: string[];
}

const CARB_G_PER_KG: Record<DayType, [number, number]> = {
  rest: [3, 4],
  'gym-only': [3.5, 4.5],
  easy: [4, 5],
  quality: [5, 7],
  'quality-plus-gym': [6, 8],
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  rest: 'Rest day',
  'gym-only': 'Gym only',
  easy: 'Easy run day',
  quality: 'Quality run day',
  'quality-plus-gym': 'Quality run + gym',
};

export function dayTypeFor(d: AppData, date: ISODate): DayType {
  const runs = d.runs.filter((r) => r.date === date);
  const gym = d.gym.some((g) => g.date === date);
  const plan = dayPlan(d, date);
  const hardLogged = runs.some((r) => !['easy', 'long', 'recovery'].includes(r.type));
  const hardPlanned = plan.run && !['easy', 'easy-long', 'recovery'].includes(plan.run);
  const hasRun = runs.length > 0 || !!plan.run;
  const hasGym = gym || !!plan.gym;
  if (hardLogged || hardPlanned) return hasGym ? 'quality-plus-gym' : 'quality';
  if (hasRun) return 'easy';
  if (hasGym) return 'gym-only';
  return 'rest';
}

/**
 * Daily targets scale with the day's training, following sports-nutrition
 * consensus ranges (Thomas et al., 2016; Burke et al., 2011): carbohydrate
 * follows the work, protein stays high every day, fat never drops so low it
 * crowds out hormones and fat-soluble vitamins.
 */
export function targets(d: AppData, date: ISODate = todayISO()): Targets {
  const kg = weightTrend(d, 21, date).latestAvg ?? [...d.weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.kg ?? d.profile.startWeightKg ?? 70;
  const dayType = dayTypeFor(d, date);
  const cutting = d.physiquePhase.current === 'initial-target';
  const protein: Range = cutting ? { lo: 1.8 * kg, hi: 2.4 * kg } : { lo: 1.6 * kg, hi: 2.2 * kg };
  const [clo, chi] = CARB_G_PER_KG[dayType];
  const carbs: Range = { lo: clo * kg, hi: chi * kg };
  const fat: Range = { lo: 0.8 * kg, hi: 1.2 * kg };
  const energy: Range = {
    lo: Math.round(protein.lo * 4 + carbs.lo * 4 + fat.lo * 9),
    hi: Math.round(protein.hi * 4 + carbs.hi * 4 + fat.hi * 9),
  };
  const rationale = [
    `${DAY_TYPE_LABEL[dayType]}: carbohydrate ${clo}–${chi} g per kg, matched to the work you are doing.`,
    cutting
      ? 'Protein 1.8–2.4 g/kg while losing weight — higher intakes help protect muscle in a deficit.'
      : 'Protein 1.6–2.2 g/kg — muscle gain plateaus around 1.6 g/kg on average, with the upper end as a margin.',
    'Spread protein over 3–5 meals of ~0.3–0.4 g/kg each.',
    'Fat at least 0.8 g/kg: very low fat diets impair testosterone and fat-soluble vitamin absorption.',
  ];
  return { dayType, bodyweightKg: kg, protein, carbs, fat, fibre: 30, energy, perMealProtein: 0.3 * kg, rationale };
}

export function micronutrientAdequacy(n: Nutrients): { key: keyof Nutrients; label: string; pct: number; value: number; unit: string }[] {
  return (Object.entries(RNI) as [keyof Nutrients, { value: number; unit: string; label: string }][]).map(([key, r]) => ({
    key,
    label: r.label,
    value: n[key] ?? 0,
    unit: r.unit,
    pct: ((n[key] ?? 0) / r.value) * 100,
  }));
}

// ─── Goal-based food rankings ──────────────────────────────────────────────

export type FoodGoal = 'muscle' | 'running' | 'recovery' | 'cellular' | 'cardio' | 'cognitive' | 'skin' | 'bone' | 'longevity';

export interface GoalDef {
  id: FoodGoal;
  label: string;
  summary: string;
  weights: Partial<Record<keyof Nutrients | 'polyphenols' | 'proteinQuality' | 'haem', number>>;
  penalties?: Partial<Record<keyof Nutrients, number>>;
  evidence: string;
}

export const GOALS: GoalDef[] = [
  {
    id: 'muscle',
    label: 'Muscle development',
    summary: 'Enough total protein matters most; then quality (leucine, digestibility) and distribution across the day.',
    weights: { protein: 3, leucine: 2, proteinQuality: 1.5 },
    evidence: 'Meta-analysis: protein intake beyond ~1.6 g/kg/day adds little further muscle on average (Morton et al., 2018).',
  },
  {
    id: 'running',
    label: 'Running performance',
    summary: 'Carbohydrate availability for quality sessions, and iron for oxygen transport.',
    weights: { carbs: 3, iron: 1.5, haem: 1, potassium: 0.5 },
    evidence: 'Carbohydrate availability is the best-established dietary factor for high-intensity endurance performance (Burke et al., 2011; Thomas et al., 2016).',
  },
  {
    id: 'recovery',
    label: 'Recovery',
    summary: 'Protein plus carbohydrate after hard sessions, fluid, and enough total energy.',
    weights: { protein: 2, carbs: 2, leucine: 1, polyphenols: 0.5 },
    evidence: 'Recovery depends far more on total energy, protein and carbohydrate than on any specific "recovery food" (Kerksick et al., 2017).',
  },
  {
    id: 'cellular',
    label: 'Cellular health',
    summary: 'A diet rich in polyphenols, fibre and omega-3, with adequate selenium and vitamins C and E — through food, not antioxidant megadoses.',
    weights: { polyphenols: 2, fibre: 1.5, epaDha: 1.5, selenium: 1, vitC: 1, vitE: 1, folate: 0.5 },
    evidence: 'Antioxidant supplements did not reduce mortality in a Cochrane review and can blunt training adaptations; whole-food patterns are a different matter.',
  },
  {
    id: 'cardio',
    label: 'Cardiovascular health',
    summary: 'Fibre, oily fish, nuts, olive oil, potassium; less saturated fat.',
    weights: { fibre: 2, epaDha: 2, potassium: 1.5, polyphenols: 1, ala: 0.5, magnesium: 0.5 },
    penalties: { satFat: 1.5 },
    evidence: 'Higher fibre intake is linked to lower cardiovascular mortality in a large series of meta-analyses (Reynolds et al., 2019); PREDIMED supports olive oil and nuts.',
  },
  {
    id: 'cognitive',
    label: 'Cognitive function',
    summary: 'Long-chain omega-3, choline, B12 and folate, iron, and flavonoid-rich foods.',
    weights: { epaDha: 2, choline: 1.5, b12: 1.5, folate: 1, iron: 1, polyphenols: 1 },
    evidence: 'Mostly observational and mechanistic in healthy young adults; correcting deficiencies (B12, iron) has the clearest effects.',
  },
  {
    id: 'skin',
    label: 'Skin health',
    summary: 'Vitamin C for collagen synthesis, carotenoids and vitamin E, zinc, omega-3 and protein. Daily sunscreen matters more than any food.',
    weights: { vitC: 2, vitA: 1.5, vitE: 1.5, zinc: 1, epaDha: 1, protein: 0.5 },
    evidence: 'Daily sunscreen use slowed visible skin ageing in an RCT (Hughes et al., 2013); dietary evidence is weaker and largely observational.',
  },
  {
    id: 'bone',
    label: 'Bone health',
    summary: 'Calcium and vitamin D together, protein, vitamin K, magnesium — plus impact and strength training, and adequate energy.',
    weights: { calcium: 2.5, vitD: 2, protein: 1, vitK: 1, magnesium: 1, potassium: 0.5 },
    evidence: 'Coeliac disease and low energy availability are both risk factors for low bone density — relevant to you on two counts (NICE NG20; Mountjoy et al., 2023).',
  },
  {
    id: 'longevity',
    label: 'General longevity',
    summary: 'A Mediterranean-style pattern: fish, nuts, olive oil, fruit, vegetables, wholegrains; little processed meat.',
    weights: { fibre: 2, polyphenols: 1.5, epaDha: 1.5, potassium: 1, folate: 0.5, magnesium: 0.5 },
    penalties: { satFat: 1 },
    evidence: 'Patterns, not single foods, carry the evidence: fruit and vegetables (Aune et al., 2017), fibre (Reynolds et al., 2019), Mediterranean diet (Estruch et al., 2018).',
  },
];

const RNI_LIKE: Partial<Record<keyof Nutrients, number>> = {
  protein: 30, // per-meal anchor
  leucine: 2.5,
  carbs: 60,
  fibre: 30,
  epaDha: 0.45,
  ala: 1.6,
  choline: 550,
  ...Object.fromEntries(Object.entries(RNI).map(([k, v]) => [k, v!.value])),
};

/** Scores per typical portion, capped so one huge value cannot dominate. */
export function goalScore(f: Food, goal: GoalDef): number {
  let s = 0;
  const portion = scale(f.n, f.portion.g);
  for (const [k, w] of Object.entries(goal.weights) as [string, number][]) {
    if (k === 'polyphenols') s += w * (f.polyphenols === 'high' ? 1 : f.polyphenols === 'moderate' ? 0.5 : 0);
    else if (k === 'proteinQuality') s += w * (f.proteinQuality === 'high' ? 1 : f.proteinQuality === 'moderate' ? 0.5 : 0) * Math.min(1, portion.protein / 15);
    else if (k === 'haem') s += w * (f.ironType === 'haem' ? 1 : f.ironType === 'mixed' ? 0.5 : 0);
    else {
      const ref = RNI_LIKE[k as keyof Nutrients];
      const v = (portion as unknown as Record<string, number>)[k] ?? 0;
      if (ref) s += w * Math.min(1, v / ref);
    }
  }
  for (const [k, w] of Object.entries(goal.penalties ?? {}) as [keyof Nutrients, number][]) {
    s -= w * Math.min(1, (portion[k] ?? 0) / 20);
  }
  return s;
}

export function rankFoods(d: AppData, goal: FoodGoal, limit = 10): { food: Food; score: number; tolerance: Tolerance }[] {
  const def = GOALS.find((g) => g.id === goal)!;
  return allFoods(d)
    .filter((f) => f.id !== 'butter')
    .map((food) => ({ food, score: goalScore(food, def), tolerance: tolerance(d, food.id) }))
    .filter((x) => x.tolerance !== 'problematic')
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Protein per 100 kcal: how "efficient" a protein source is when energy is limited. */
export function proteinDensity(f: Food): number {
  return f.n.kcal > 0 ? (f.n.protein / f.n.kcal) * 100 : 0;
}

export function mealProteinCheck(d: AppData, entries: FoodEntry[], bodyweightKg: number) {
  const meals = byMeal(entries);
  return (Object.entries(meals) as [MealSlot, FoodEntry[]][]).map(([slot, list]) => {
    const n = totals(d, list);
    return { slot, protein: n.protein, leucine: n.leucine, enough: n.protein >= 0.3 * bodyweightKg || n.leucine >= 2 };
  });
}
