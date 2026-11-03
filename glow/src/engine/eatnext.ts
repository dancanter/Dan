// What to eat next (Dan, 3 Nov): "suggest what I need to eat for recovery or
// fitness or muscle so my health score is absolutely optimal."
//
// Reads the day so far and the training around it, and names a few real foods:
//  - recovery: after a hard run or the gym, protein plus carbs, and the timing;
//  - the protein still to find, from the leanest, best-absorbed sources;
//  - the two micronutrients furthest behind today, filled by the foods that
//    deliver the most *absorbed* nutrient per portion (bioavailability-adjusted);
//  - one anti-ageing food he hasn't had this week, for variety.
// Every pick obeys his rules: gluten-free, nothing on his avoid list, nothing
// processed, no alcohol or added sugar, no treats. Foods he already eats score
// higher, so the advice is easy to follow.
import { FOODS, UK_FOODS, type Food } from '@/data/foods';
import { isAvoided } from '@/data/avoid';
import { NUTRIENTS, MICROS, type NKey } from '@/data/nutrients';
import { bioFactors, targetsFor } from '@/engine/score';
import { addDays } from '@/engine/body';
import { dayResult, weightOn } from '@/engine/game';
import { resolveItems, type State } from '@/store';
import type { Tag } from '@/data/foods';

export interface EatNext { emoji: string; title: string; foods: string[]; why: string }

const BAD: Tag[] = ['gluten', 'merc', 'merc2', 'iodHigh', 'upf', 'alc', 'addsug', 'procmeat', 'fried', 'trans', 'juice', 'sweetener'] as Tag[];
const PROTECT: Tag[] = ['poly2', 'poly', 'astax', 'ferm', 'carot', 'lut', 'nitr', 'sperm', 'preb', 'ala'] as Tag[];

function pool(): Food[] {
  return [...FOODS, ...UK_FOODS].filter((f) => f.category !== 'treats' && !isAvoided(f) && !f.tags.some((t) => BAD.includes(t)) && f.n.kcal > 0);
}

/** Absorbed amount of a nutrient in one normal portion, as a share of the daily target. */
function perPortion(f: Food, k: NKey, target: number): number {
  const bio = bioFactors(f)[k] ?? 1;
  return ((f.n[k] ?? 0) * bio * f.portion.g) / 100 / Math.max(target, 1e-9);
}

function recentIds(s: State, date: string, days: number): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < days; i++) for (const it of resolveItems(s.days[addDays(date, -i)], s)) ids.add(it.food.id);
  return ids;
}

const nameOf = (f: Food) => f.name.replace(/\s*\((?:certified )?gluten-free if needed\)/i, '').replace(/\s*\(per 100 ml\)/i, '').replace(/\s*\(raw\)/i, '').replace(/,\s*raw\)/i, ')').replace(/\s*\(wild\)/i, ' (wild)');

export function eatNext(s: State, date: string): EatNext[] {
  const out: EatNext[] = [];
  const day = dayResult(s, date);
  const kg = weightOn(s, date);
  const t = targetsFor(s.profile, kg);
  const proteinTarget = 140;
  const eaten = day.analysis.effective;
  const usual = recentIds(s, date, 30), thisWeek = recentIds(s, date, 7);
  /* bloat-prone (his profile): no beans or pulses, the gassiest foods there are */
  const foods = pool().filter((f) => !(s.profile.bloatProne && f.category === 'legumes'));
  const like = (f: Food) => (usual.has(f.id) ? 1.6 : 1);

  /* 1. recovery, from the training today or yesterday */
  const today = s.training?.[date] ?? [], yday = s.training?.[addDays(date, -1)] ?? [];
  const hardRun = today.some((x) => x.kind !== 'lift' && x.intensity === 'hard');
  const lift = today.some((x) => x.kind === 'lift');
  const legs = today.some((x) => x.kind === 'lift' && ((x.sets?.quads ?? 0) + (x.sets?.hamstrings ?? 0) + (x.sets?.glutes ?? 0)) >= 6);
  if (hardRun || lift) {
    out.push({
      emoji: '🔋', title: hardRun ? 'Recover from the hard run' : legs ? 'Recover from legs' : 'Recover from the gym',
      foods: hardRun ? ['Potatoes or rice', 'Hake, chicken or venison', 'Tart cherries or berries'] : ['Fage 2–5%', 'Eggs', 'Chicken or venison', 'Potatoes or oats'],
      why: hardRun
        ? 'Within a couple of hours: 30–40 g protein and a fist or two of carbs to refill your legs. Berries and cherries help the muscle soreness settle.'
        : 'About 30–40 g protein in the next meal, rich in leucine (dairy, eggs and meat lead), with some carbs so the protein goes to muscle, not fuel.',
    });
  } else if (yday.some((x) => x.intensity === 'hard')) {
    out.push({ emoji: '🔋', title: 'Still recovering from yesterday', foods: ['Fage with berries', 'Salmon or sardines', 'Potatoes'], why: 'Day-two recovery: protein spread over the day and omega-3s to calm the inflammation from yesterday.' });
  }

  /* 2. protein still to find */
  const pro = day.analysis.totals.protein;
  if (pro < proteinTarget - 15) {
    const gap = Math.round(proteinTarget - pro);
    const best = foods.filter((f) => (f.n.protein ?? 0) / Math.max(f.n.kcal, 1) >= 0.17 && f.portion.g >= 80)
      .map((f) => ({ f, v: (f.n.protein / f.n.kcal) * like(f) })).sort((a, b) => b.v - a.v).slice(0, 4).map((x) => nameOf(x.f));
    out.push({ emoji: '🥩', title: `${gap} g protein to go`, foods: best, why: 'The leanest, best-absorbed proteins for a cut: the most protein for the fewest calories, which protects your muscle while you lose fat.' });
  }

  /* 3. the two nutrients furthest behind today, by absorbed amount */
  const behind = MICROS.map((k) => ({ k, pct: (eaten[k] ?? 0) / Math.max(t[k] ?? NUTRIENTS[k].target, 1e-9) }))
    .filter((x) => x.pct < 0.8).sort((a, b) => a.pct - b.pct).slice(0, out.length >= 2 ? 1 : 2);
  for (const b of behind) {
    const target = t[b.k] ?? NUTRIENTS[b.k].target;
    const picks = foods.map((f) => ({ f, v: perPortion(f, b.k, target) * like(f) / Math.sqrt(Math.max(f.n.kcal * f.portion.g / 100, 30) / 100) }))
      .filter((x) => perPortion(x.f, b.k, target) >= 0.15).sort((a, b2) => b2.v - a.v).slice(0, 3).map((x) => nameOf(x.f));
    if (!picks.length) continue;
    const info = NUTRIENTS[b.k];
    /* his rule: vitamin D from oily fish only, never tablets */
    const why = b.k === 'vitA' ? 'Orange and red veg give you beta-carotene from food, which your body turns into vitamin A as it needs it: skin renewal and that healthy colour. Eat it with a little fat.' : b.k === 'vitD' ? 'Oily fish is your vitamin D in the UK winter (no sun from October to March). It also brings omega-3s for your skin and recovery.' : `${info.does} Ranked by how much your body actually absorbs per portion.`;
    out.push({ emoji: '🧬', title: `${info.label}: ${Math.round(b.pct * 100)}% so far`, foods: picks, why });
  }

  /* 4. one anti-ageing food not had this week */
  const fresh = foods.filter((f) => !thisWeek.has(f.id) && f.tags.some((tg) => PROTECT.includes(tg)))
    .map((f) => ({ f, v: f.tags.filter((tg) => PROTECT.includes(tg)).length * like(f) })).sort((a, b) => b.v - a.v)[0];
  if (fresh) out.push({ emoji: '✨', title: 'Anti-ageing pick', foods: [nameOf(fresh.f)], why: 'Something protective you haven’t had this week. Variety feeds more kinds of gut bacteria and covers more of the antioxidant systems.' });

  return out.slice(0, 4);
}
