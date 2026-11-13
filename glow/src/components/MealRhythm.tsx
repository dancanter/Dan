import { MEALS } from './FoodDetail';
import type { LoggedItem } from '@/engine/score';
import { Card, Pill } from './ui';

// How often to eat, for Dan's goals. Meal frequency doesn't change
// metabolism or fat loss (energy balance does), but protein spread over the
// day builds and keeps muscle better than one or two big hits. The useful
// target is 3–4 feedings of about 0.4 g protein per kg (25–35 g for Dan),
// 3–5 hours apart, plus a slow-digesting protein before bed.

export function MealRhythm({ items, kg }: { items: LoggedItem[]; kg: number }) {
  const dose = Math.round(kg * 0.4);
  const meals = MEALS.map((m) => {
    const its = items.filter((i) => i.meal === m.value);
    return { ...m, protein: its.reduce((a, i) => a + (i.food.n.protein * i.grams) / 100, 0), any: its.length > 0 };
  }).filter((m) => m.any);
  const hits = meals.filter((m) => m.protein >= dose - 3).length;
  const casein = items.some((i) => i.meal === 'dinner' && /greek|skyr|cottage|quark|kefir|milk/i.test(i.food.name));
  if (!items.length) return null;
  return (
    <Card eyebrow="How often to eat" title={<span>Protein rhythm: <span className="num">{hits}</span> of 4 feedings</span>} action={<Pill tone={hits >= 4 ? 'good' : hits >= 3 ? 'sea' : 'warn'}>{hits >= 4 ? 'ideal' : hits >= 3 ? 'good' : 'add one'}</Pill>}>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {MEALS.map((m) => {
          const meal = meals.find((x) => x.value === m.value);
          const ok = meal && meal.protein >= dose - 3;
          return (
            <div key={m.value} className={`rounded-xl p-2 ${ok ? 'bg-good-soft' : 'bg-surface-2'}`}>
              <div className="num font-serif text-base">{meal ? Math.round(meal.protein) : '–'}g</div>
              <div className="text-muted">{m.label}</div>
            </div>
          );
        })}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
        <li>• <b>Your rhythm is already close to ideal:</b> breakfast, 2pm, pre-gym and post-gym gives 4 protein feedings, 3–5 hours apart. Aim for <b>{dose}–{dose + 10} g</b> protein in each. That’s the pattern trials show maximises muscle protein building, which matters more on a cut.</li>
        <li>• <b>The one weak spot:</b> breakfast to 2pm can be 6+ hours. That’s fine for an easy walk or run, but before a quality run add a small carb snack 60–90 minutes before (a banana, or 2 Kallo cakes with 1 tsp honey).</li>
        <li>• <b>Pre-gym (5:30–6):</b> protein plus easy carbs, light on fat and fibre. <b>Post-gym:</b> your biggest meal. It’s close enough to bed to double as your overnight protein, so you don’t need a separate pre-bed snack.{casein ? ' ✓ Dairy protein in it today.' : ''}</li>
        <li>• <b>Overnight:</b> a natural 12-hour gap (say 8pm to 8am) is plenty. Longer fasting adds little and makes fuelling 7+ sessions a week harder.</li>
        <li>• <b>Frequency doesn’t speed up metabolism.</b> 3 meals or 6 gives the same fat loss for the same calories. Pick what keeps you least hungry.</li>
      </ul>
    </Card>
  );
}
