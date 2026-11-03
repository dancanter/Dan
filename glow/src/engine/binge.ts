import { addDays, daysBetween, sleepHours, sortByDate } from './body';
import { dayResult } from './game';
import { phaseOn, kcalForDate } from './season';
import { resolveItems, type State } from '@/store';

// Binges: logged without judgement, to find what drives them. In a cut the
// usual drivers are biological (a big energy deficit, too few carbs, short
// sleep), then situational (evenings alone, boredom, stress), then the food
// setup itself (huge sweet bowls with no portion limit). Restricting the day
// after a binge is the most reliable way to cause the next one.

export interface BingeLog { kind: BingeKind; size: 1 | 2 | 3; when?: 'morning' | 'afternoon' | 'evening' | 'night'; triggers?: string[] }
export type BingeKind = 'yoghurt' | 'porridge' | 'sweet' | 'savoury' | 'other';

export const BINGE_KINDS: { id: BingeKind; label: string }[] = [
  { id: 'yoghurt', label: 'Yoghurt, fruit & sweetener' },
  { id: 'porridge', label: 'Porridge & sweetener / honey' },
  { id: 'sweet', label: 'Chocolate, sweets, cake' },
  { id: 'savoury', label: 'Crisps, bread, savoury' },
  { id: 'other', label: 'Something else' },
];
export const BINGE_SIZE = ['', 'Small (≈ +300–500 kcal)', 'Medium (≈ +500–1,000)', 'Big (1,000+)'];
export const BINGE_KCAL = [0, 400, 750, 1300];
export const BINGE_TRIGGERS: { id: string; label: string }[] = [
  { id: 'hungry', label: 'Genuinely hungry' },
  { id: 'restricted', label: 'Ate too little earlier' },
  { id: 'tired', label: 'Tired' },
  { id: 'bored', label: 'Bored' },
  { id: 'stressed', label: 'Stressed / low' },
  { id: 'sweet', label: 'Started with something sweet and couldn’t stop' },
  { id: 'evening', label: 'Evening at home, nothing planned' },
  { id: 'training', label: 'After a hard session' },
];

export function bingeDates(s: State): string[] {
  return Object.keys(s.days).filter((d) => (s.days[d].binges?.length ?? 0) > 0).sort();
}

/** What to do straight after: the opposite of compensating. */
export function afterBinge(log: BingeLog, _s?: State, _date?: string): string[] {
  const extra = BINGE_KCAL[log.size];
  const fatG = Math.round((extra / 7700) * 1000);
  return [
    `It’s done, and it doesn’t undo the cut. Even ${extra.toLocaleString('en-GB')} kcal over is at most about ${fatG} g of fat. Tomorrow’s scale jump is food and water, so Glow leaves the next two weigh-ins out of your trend.`,
    'Don’t compensate: no skipped meals, no extra cardio, no “starting again on Monday”. Eating less tomorrow is the single most likely cause of the next binge.',
    'Next meal as normal, protein first. Eat tomorrow’s full target.',
    'A glass of water and a short walk if it helps you feel settled, not to burn it off.',
    log.kind === 'yoghurt' || log.kind === 'porridge' ? 'Lots of sweetener with fruit or oats can mean bloating and loose stools. That passes within a day.' : 'If you feel bloated, peppermint tea and a walk help.',
    !log.triggers?.length ? 'Next time, tick what set it off. After a few, Glow will show your pattern and how to break it.' : '',
  ].filter(Boolean);
}

export interface BingeStats {
  month: number; last30: number; year: number; daysSince?: number;
  triggers: { label: string; count: number }[];
  kinds: { label: string; count: number }[];
  when: { label: string; count: number }[];
  patterns: { label: string; count: number; of: number }[];
  plan: string[];
  flag?: string;
}

export function bingeStats(s: State, today: string): BingeStats {
  const dates = bingeDates(s).filter((d) => d <= today);
  const logs = dates.flatMap((d) => s.days[d].binges!.map((b) => ({ d, b })));
  const count = <T extends string>(xs: T[], labels: { id: T; label: string }[]) =>
    labels.map((l) => ({ label: l.label, count: xs.filter((x) => x === l.id).length })).filter((x) => x.count).sort((a, b) => b.count - a.count);
  const triggers = count(logs.flatMap((x) => x.b.triggers ?? []), BINGE_TRIGGERS);
  const kinds = count(logs.map((x) => x.b.kind), BINGE_KINDS);
  const when = count(logs.map((x) => x.b.when ?? 'evening'), [{ id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' }, { id: 'evening', label: 'Evening' }, { id: 'night', label: 'Late night' }]);

  // The day before and the day itself: what the data says.
  const c = { underAte: 0, lowEa: 0, sleep: 0, sweet: 0, cut: 0 };
  const kg = sortByDate(s.weights).at(-1)?.kg;
  for (const d of dates) {
    const prev = addDays(d, -1);
    const pItems = resolveItems(s.days[prev], s);
    const pr = dayResult(s, prev);
    if (pItems.length >= 3 && pr.analysis.totals.kcal < kcalForDate(s.profile, prev, kg).kcal - 300) c.underAte++;
    if (pr.ea !== undefined && pr.ea < 30) c.lowEa++;
    const sl = sortByDate(s.sleeps).find((x) => x.date === d);
    if (sl && sleepHours(sl) < 7) c.sleep++;
    const sweetServ = resolveItems(s.days[d], s).filter((i) => i.food.tags.includes('sweetener')).length;
    if (sweetServ >= 3) c.sweet++;
    if (phaseOn(s.profile.season, d)?.kind === 'cut') c.cut++;
  }
  const n = dates.length;
  const patterns = n ? [
    { label: 'Ate 300+ kcal under target the day before', count: c.underAte, of: n },
    { label: 'Energy availability under 30 the day before', count: c.lowEa, of: n },
    { label: 'Slept under 7 h the night before', count: c.sleep, of: n },
    { label: '3+ sweetened foods or drinks that day', count: c.sweet, of: n },
    { label: 'During a cut', count: c.cut, of: n },
  ].filter((p) => p.count > 0).sort((a, b) => b.count - a.count) : [];

  // A plan built from your own pattern, most likely driver first.
  const plan: string[] = [];
  const top = new Set([...triggers.slice(0, 3).map((t) => t.label), ...patterns.slice(0, 3).map((p) => p.label)]);
  const has = (frag: string) => [...top].some((x) => x.toLowerCase().includes(frag));
  if (has('under target') || has('energy availability') || has('too little') || has('hungry') || has('cut'))
    plan.push('Eat your full target every day, carbs included, and take the planned refeeds. Most binges in a cut come from biology (too big a deficit), not weak willpower. A tighter diet makes them more likely.');
  plan.push('Make your binge foods planned foods: a set bowl on purpose, e.g. 50 g oats + 1 tsp raw honey + berries, or a Fage pot + 100 g fruit + cinnamon. Weigh it, put the bag away, eat it sitting down.');
  if (kinds.some((k) => k.label.startsWith('Yoghurt') || k.label.startsWith('Porridge')) || has('sweet'))
    plan.push('Cap the sweetener: drops in a large bowl make it taste endlessly moreish, so the bowl never feels “done”. Try 2–3 drops per bowl, plus cinnamon, vanilla or berries for sweetness instead.');
  if (has('evening') || when[0]?.label === 'Evening' || when[0]?.label === 'Late night')
    plan.push('Plan the evening: a protein-rich dinner with carbs, then the planned casein bowl. Brush your teeth after it: a “kitchen closed” signal.');
  if (has('tired') || has('slept')) plan.push('Protect sleep: under 7 hours raises ghrelin (the hunger hormone) and makes sweet food more rewarding the next day.');
  if (has('bored') || has('stressed')) plan.push('For boredom or stress urges, use “Urge to binge” in How do you feel: a 10-minute urge-surfing routine.');
  plan.push('Keep big bags (oats, a 1 kg tub of yoghurt) out of sight. Buy single pots when you can.');

  const last28 = dates.filter((d) => d > addDays(today, -28)).length;
  const flag = last28 >= 4
    ? 'You’ve logged 4 or more binges in 4 weeks. That’s common in a cut and usually eases at maintenance. If they feel out of control or upsetting, it’s worth talking to your GP. Beat (beateatingdisorders.org.uk) has a free helpline. Asking early is a smart move, not a dramatic one.'
    : undefined;
  return {
    month: dates.filter((d) => d.startsWith(today.slice(0, 7))).length,
    last30: dates.filter((d) => d > addDays(today, -30)).length,
    year: dates.filter((d) => d.startsWith(today.slice(0, 4))).length,
    daysSince: dates.length ? daysBetween(dates.at(-1)!, today) : undefined,
    triggers, kinds, when, patterns, plan, flag,
  };
}
