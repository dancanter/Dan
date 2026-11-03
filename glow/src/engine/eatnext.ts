// What to eat next (Dan, 3 Nov): "suggest what I need to eat for recovery or
// fitness or muscle… options depending on the day, the last few days, if I'm
// ill and the seasons… nutrient powerhouses… but never make it feel like I
// have to: advise, and say how much difference it actually makes."
//
// Reads the last three days and the training around today, and offers options:
//  - feeling ill: the foods that genuinely help a cold (zinc, vitamin C from food, fluids);
//  - recovery after a hard run or the gym;
//  - the protein still to find, from the leanest, best-absorbed sources;
//  - the micronutrient furthest behind over the last three days, by absorbed amount;
//  - powerhouse picks: the most nutrient-dense foods per calorie (bioavailability-
//    adjusted), boosted when they are in season. Animal foods (dairy, eggs, fish,
//    shellfish, meat, heart) score highest on their own merit: their iron, zinc,
//    B12, vitamin A and protein are the best absorbed.
// Each option says how much difference it makes. Every pick obeys his rules:
// gluten-free, nothing on his avoid list (no liver), no pulses (bloat-prone),
// nothing processed, no alcohol or added sugar, no treats.
import { FOODS, UK_FOODS, type Food, type Tag } from '@/data/foods';
import { isAvoided } from '@/data/avoid';
import { NUTRIENTS, MICROS, type NKey } from '@/data/nutrients';
import { SEASON_GUIDE } from '@/data/seasons';
import { seasonOf } from '@/data/films';
import { bioFactors, targetsFor, type Targets } from '@/engine/score';
import { addDays } from '@/engine/body';
import { dayResult, weightOn } from '@/engine/game';
import { resolveItems, type State } from '@/store';

export type Impact = 'big' | 'medium' | 'small';
export interface EatNext { emoji: string; title: string; foods: string[]; why: string; impact: Impact }
export const IMPACT_LABEL: Record<Impact, string> = { big: 'Big difference', medium: 'Helps', small: 'Small extra' };

const BAD: Tag[] = ['gluten', 'merc', 'merc2', 'iodHigh', 'upf', 'alc', 'addsug', 'procmeat', 'fried', 'trans', 'juice', 'sweetener'] as Tag[];
const PROTECT: Tag[] = ['poly2', 'poly', 'astax', 'ferm', 'carot', 'lut', 'nitr', 'sperm', 'preb', 'ala', 'creat', 'coq'] as Tag[];

function pool(s: State): Food[] {
  return [...FOODS, ...UK_FOODS].filter((f) => f.category !== 'treats' && !isAvoided(f) && !f.tags.some((t) => BAD.includes(t)) && f.n.kcal > 0
    && !(s.profile.bloatProne && f.category === 'legumes'));
}

/** Absorbed amount of a nutrient in one normal portion, as a share of the daily target. */
function perPortion(f: Food, k: NKey, target: number): number {
  const bio = bioFactors(f)[k] ?? 1;
  return ((f.n[k] ?? 0) * bio * f.portion.g) / 100 / Math.max(target, 1e-9);
}

/** Nutrient density: absorbed micronutrients and protein per 100 kcal, plus protective compounds. */
export function powerScore(f: Food, t: Targets): number {
  const per100kcal = 100 / Math.max(f.n.kcal, 15);
  const bio = bioFactors(f);
  let micro = 0;
  for (const k of MICROS) micro += Math.min(1, ((f.n[k] ?? 0) * (bio[k] ?? 1) * per100kcal) / Math.max(t[k] ?? NUTRIENTS[k].target, 1e-9));
  const protein = Math.min(1, ((f.n.protein ?? 0) * per100kcal) / 20) * 2;
  const protect = f.tags.filter((tg) => PROTECT.includes(tg)).length * 0.3;
  return micro + protein + protect;
}

function recentIds(s: State, date: string, days: number): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < days; i++) for (const it of resolveItems(s.days[addDays(date, -i)], s)) ids.add(it.food.id);
  return ids;
}

const nameOf = (f: Food) => f.name.replace(/\s*\((?:certified )?gluten-free if needed\)/i, '').replace(/\s*\(per 100 ml\)/i, '')
  .replace(/\s*\(raw\)/i, '').replace(/,\s*raw\)/i, ')');

export function eatNext(s: State, date: string): EatNext[] {
  const out: EatNext[] = [];
  const kg = weightOn(s, date);
  const t = targetsFor(s.profile, kg);
  const usual = recentIds(s, date, 30), thisWeek = recentIds(s, date, 7);
  const season = seasonOf(date), produce = SEASON_GUIDE[season].produce.toLowerCase();
  const inSeason = (f: Food) => produce.includes(nameOf(f).toLowerCase().split(/[ ,(]/)[0]);
  const foods = pool(s);
  /* Dan, 3 Nov: animal foods first: their iron, zinc, B12, vitamin A and protein are the best absorbed */
  const ANIMAL = ['meat', 'offal', 'fish', 'shellfish', 'eggs', 'dairy'];
  const like = (f: Food) => (usual.has(f.id) ? 1.5 : 1) * (inSeason(f) ? 1.2 : 1) * (ANIMAL.includes(f.category) ? 1.5 : 1);
  const today = dayResult(s, date);
  const loggedToday = (s.days[date]?.items ?? []).length > 0;

  /* 0. under the weather (logged from the Log panel) */
  const ill = (s.days[date] as { ill?: { kind?: string } } | undefined)?.ill;
  if (ill) {
    out.push({ emoji: '🤒', title: 'Feeling rough: foods that genuinely help', impact: 'big',
      foods: ['Chicken or bone-broth soup', 'Oysters or beef (zinc)', 'Kiwi, oranges, red pepper', 'Honey in warm water', 'Eggs, Fage, potatoes'],
      why: 'Fluids and warmth first. Zinc from food in the first days can shorten a cold a little; vitamin C from fruit supports it (no need for high-dose tablets). Eat normally: illness is not the time to under-eat.' });
  }

  /* 1. recovery, from the training today or yesterday */
  const tToday = s.training?.[date] ?? [], tYday = s.training?.[addDays(date, -1)] ?? [];
  const hardRun = tToday.some((x) => x.kind !== 'lift' && x.intensity === 'hard');
  const lift = tToday.some((x) => x.kind === 'lift');
  const legs = tToday.some((x) => x.kind === 'lift' && ((x.sets?.quads ?? 0) + (x.sets?.hamstrings ?? 0) + (x.sets?.glutes ?? 0)) >= 6);
  if (!ill && (hardRun || lift)) {
    out.push({
      emoji: '🔋', title: hardRun ? 'After the hard run' : legs ? 'After legs' : 'After the gym', impact: 'big',
      foods: hardRun ? ['Potatoes or rice', 'Hake, chicken or venison', 'Berries or tart cherries'] : ['Fage 2–5% or kefir', 'Eggs', 'Chicken, beef or venison', 'Potatoes or oats'],
      why: hardRun
        ? 'In the next couple of hours: 30–40 g protein with a fist or two of carbs. It refills your legs for the next session and makes the most of the work you did.'
        : 'About 30–40 g protein in the next meal, from dairy, eggs or meat (the most leucine, which switches muscle building on), with some carbs. This is where the muscle actually gets built.',
    });
  } else if (!ill && tYday.some((x) => x.intensity === 'hard')) {
    out.push({ emoji: '🔋', title: 'Day-two recovery', impact: 'medium', foods: ['Fage with berries', 'Salmon, trout or mackerel', 'Potatoes'], why: 'Protein spread across the day and omega-3s to settle yesterday’s soreness.' });
  }

  /* 2. protein still to find today */
  const pro = today.analysis.totals.protein, proteinTarget = 140;
  if (pro < proteinTarget - 15) {
    const gap = Math.round(proteinTarget - pro);
    const best = foods.filter((f) => (f.n.protein ?? 0) / Math.max(f.n.kcal, 1) >= 0.15 && f.portion.g >= 80)
      .map((f) => ({ f, v: (f.n.protein / f.n.kcal) * like(f) })).sort((a, b) => b.v - a.v).slice(0, 4).map((x) => nameOf(x.f));
    out.push({ emoji: '🥩', title: `${gap} g protein still to find today`, foods: best, impact: gap >= 40 ? 'big' : 'medium',
      why: gap >= 40 ? 'On a cut this is what decides whether the weight lost is fat or muscle. The leanest, best-absorbed options:' : 'Nearly there. Any of these closes it.' });
  }

  /* 3. the nutrient furthest behind over the last three days (by absorbed amount) */
  const days3 = [0, 1, 2].map((i) => addDays(date, -i)).filter((d) => (s.days[d]?.items ?? []).length >= 3);
  if (days3.length) {
    const avg = (k: NKey) => days3.reduce((a, d) => a + (dayResult(s, d).analysis.effective[k] ?? 0), 0) / days3.length;
    const behind = MICROS.map((k) => ({ k, pct: avg(k) / Math.max(t[k] ?? NUTRIENTS[k].target, 1e-9) }))
      .filter((x) => x.pct < 0.7).sort((a, b) => a.pct - b.pct).slice(0, Math.max(0, Math.min(2, 3 - out.length)));
    for (const b of behind) {
      const target = t[b.k] ?? NUTRIENTS[b.k].target;
      const picks = foods.map((f) => ({ f, v: perPortion(f, b.k, target) * like(f) / Math.sqrt(Math.max(f.n.kcal * f.portion.g / 100, 30) / 100) }))
        .filter((x) => perPortion(x.f, b.k, target) >= 0.15).sort((a, b2) => b2.v - a.v).slice(0, 3).map((x) => nameOf(x.f));
      /* animal first: the best-absorbed animal source leads when it gives a decent amount */
      const an = foods.filter((f) => ANIMAL.includes(f.category) && perPortion(f, b.k, target) >= 0.1).sort((a, b2) => perPortion(b2, b.k, target) * like(b2) - perPortion(a, b.k, target) * like(a))[0];
      if (an && !picks.includes(nameOf(an))) { picks.unshift(nameOf(an)); picks.length = Math.min(picks.length, 3); }
      if (!picks.length) continue;
      const info = NUTRIENTS[b.k];
      const why = b.k === 'vitD' ? 'Oily fish is your vitamin D in the UK winter (no sun from October to March), with omega-3s for skin and recovery.'
        : b.k === 'vitA' ? 'Orange veg, eggs and dairy: beta-carotene and vitamin A from food for skin renewal and colour. Eat it with a little fat.'
        : `${info.does}`;
      out.push({ emoji: '🧬', title: `${info.label}: about ${Math.round(b.pct * 100)}% over the last ${days3.length === 1 ? 'day' : `${days3.length} days`}`, foods: picks, impact: b.pct < 0.35 ? 'medium' : 'small',
        why: `${why} Ranked by what your body actually absorbs per portion.` });
    }
  }

  /* 4. powerhouse picks: nutrient-dense per calorie, in season, not had this week */
  const ranked = foods.filter((f) => f.portion.g >= 30).map((f) => ({ f, v: powerScore(f, t) * like(f) * (thisWeek.has(f.id) ? 0.85 : 1) }))
    .sort((a, b) => b.v - a.v);
  /* one from each kind, so the picks are varied: shellfish, organ, fish, meat, eggs, dairy… */
  const oneEach = (cats: string[], n: number) => { const seen = new Set<string>(), res: string[] = [];
    for (const x of ranked) { if (res.length >= n) break; if (!cats.includes(x.f.category) || seen.has(x.f.category)) continue; seen.add(x.f.category); res.push(nameOf(x.f)); }
    return res; };
  const animal = oneEach(['shellfish', 'offal', 'fish', 'meat', 'eggs', 'dairy'], 5);
  const plant = oneEach(['fruit'], 1);
  out.push({ emoji: '💎', title: `Powerhouse picks this ${season}`, foods: [...animal, ...plant], impact: loggedToday ? 'small' : 'medium',
    why: 'Animal foods first: the most nutrients your body actually absorbs per calorie (iron, zinc, B12, vitamin A, omega-3s and complete protein), the ideal on a cut. One fruit for vitamin C.' });

  return out.slice(0, 4);
}
