import type { Food } from '@/data/foods';
import type { LoggedItem } from './score';

// Two different things people call "bloat":
//
// 1. FACE PUFFINESS is fluid. The levers are a sudden rise in sodium above
//    your usual intake, low potassium relative to sodium, alcohol (it
//    dehydrates, then the body over-holds water, plus it dilates facial
//    blood vessels), short sleep, raised cortisol, hard sessions the day
//    before, allergies, and crying.
// 2. GUT BLOATING is gas. The levers are FODMAPs (fermentable carbs in
//    onion, garlic, beans, wheat, some fruit), fizzy drinks, sugar
//    alcohols and eating fast. These foods are healthy, so it only matters
//    if they bloat YOU, or before a big day.
//
// None of this is permanent, and none of it is fat.

export type Level = 'low' | 'medium' | 'high';

const FODMAP = /\b(onions?|garlic|leeks?|shallots?|spring onions?|beans?|lentils?|chickpeas?|hummus|houmous|baked beans|split peas|apples?|pears?|mango|watermelon|cherr(y|ies)|nectarines?|peaches|plums?|damsons?|apricots?|dried fruit|dates?|figs?|honey|agave|cauliflower|mushrooms?|shiitake|asparagus|artichokes?|cashews?|pistachios?|wheat|rye|barley|bread|pasta|couscous|crumpets?|bagels?|naan|pitta|wraps?|chapati|cereal|weetabix|inulin|chicory|sugar alcohols?|protein bar|ice cream|jerusalem|sorbitol|xylitol|maltitol)\b/i;
const LOW_LACTOSE = /kefir|greek|skyr|hard cheese|cheddar|parmesan|stilton|lactose-free|butter|ghee|quark|feta|halloumi|leicester|wensleydale|mozzarella/i;
const FIZZY = /cola|lucozade|energy drink|carbonated|sparkling|prosecco|champagne|beer|lager|ale|stout|guinness|cider|kombucha|tonic|soda|irn|lemonade/i;

export function isFodmapHeavy(f: Food): boolean {
  const s = `${f.name} ${f.alias ?? ''}`;
  if (LOW_LACTOSE.test(s)) return false;
  return FODMAP.test(s);
}
export const isFizzy = (f: Food) => FIZZY.test(`${f.name} ${f.alias ?? ''}`) && f.category === 'drinks';

export interface FoodPuff {
  face: Level;
  faceWhy: string;
  gut: Level;
  gutWhy: string;
}

/** Puffiness and bloat risk for one portion of a food. */
export function foodPuff(f: Food, grams = f.portion.g): FoodPuff {
  const na = (f.n.sodium * grams) / 100;
  const k = (f.n.potassium * grams) / 100;
  let face: Level = 'low';
  let faceWhy = na > 0 && k >= na ? 'More potassium than sodium: this helps you shed water.' : 'Low in sodium.';
  if (f.tags.includes('alc')) { face = 'high'; faceWhy = 'Alcohol is the fastest route to a puffy face: dehydration, rebound water retention and dilated facial blood vessels.'; }
  else if (na >= 600) { face = 'high'; faceWhy = `About ${Math.round(na)} mg sodium per portion. A sudden jump above your usual intake shows as next-morning puffiness.`; }
  else if (na >= 300) { face = 'medium'; faceWhy = `About ${Math.round(na)} mg sodium per portion. Fine if your intake is steady; balance it with potassium.`; }

  let gut: Level = 'low';
  let gutWhy = 'Unlikely to cause gas.';
  if (isFizzy(f)) { gut = 'high'; gutWhy = 'Carbonation puts gas straight into your gut.'; }
  else if (f.tags.includes('upf') && /bar|sugar free|protein/i.test(f.name)) { gut = 'medium'; gutWhy = 'Often contains sugar alcohols (maltitol, sorbitol), which ferment and cause gas.'; }
  else if (isFodmapHeavy(f)) { gut = 'medium'; gutWhy = 'High in FODMAPs: fermentable carbs that feed gut bacteria. That’s healthy, but they can cause gas and a bloated stomach in some people. Only limit them if they bloat you, or the day before a big event.'; }
  return { face, faceWhy, gut, gutWhy };
}

export interface DayPuff {
  score: number; // 0..100, higher = less puffy
  sodium: number;
  potassium: number;
  ratio: number;
  usualSodium?: number;
  jump?: number;
  alcohol: boolean;
  fodmapFoods: string[];
  fizzy: string[];
  tips: string[];
}

/** How likely tomorrow's face is to be puffy, and what's driving it. */
export function dayPuff(items: LoggedItem[], history: LoggedItem[][], sleepHours?: number): DayPuff {
  const sum = (its: LoggedItem[], k: 'sodium' | 'potassium') => its.reduce((a, i) => a + (i.food.n[k] * i.grams) / 100, 0);
  const sodium = sum(items, 'sodium');
  const potassium = sum(items, 'potassium');
  const ratio = potassium > 0 ? sodium / potassium : sodium > 0 ? 9 : 0;
  const prev = history.filter((h) => h.length >= 3).map((h) => sum(h, 'sodium'));
  const usualSodium = prev.length >= 3 ? prev.reduce((a, b) => a + b, 0) / prev.length : undefined;
  const jump = usualSodium ? sodium - usualSodium : undefined;
  const alcohol = items.some((i) => i.food.tags.includes('alc'));
  const fodmapFoods = [...new Set(items.filter((i) => isFodmapHeavy(i.food)).map((i) => i.food.name.split(/[(,]/)[0].trim()))];
  const fizzy = [...new Set(items.filter((i) => isFizzy(i.food)).map((i) => i.food.name.split(/[(,]/)[0].trim()))];

  let score = 100;
  const tips: string[] = [];
  if (alcohol) { score -= 35; tips.push('Alcohol logged: drink 500 ml of water before bed and eat something potassium-rich (potato, banana, yoghurt, avocado).'); }
  if (jump !== undefined && jump > 1000) { score -= 25; tips.push(`Sodium is about ${(jump / 1000).toFixed(1)} g above your recent average. It’s the change that puffs you, not the absolute amount. Add potassium-rich food and an extra glass or two of water.`); }
  else if (jump !== undefined && jump > 500) { score -= 10; tips.push('Sodium a bit above your usual: a potassium-rich side tonight evens it out.'); }
  if (ratio > 1.2 && items.length >= 3) { score -= 15; tips.push(`Sodium:potassium is ${ratio.toFixed(1)}:1. Aim for potassium higher than sodium (under 1:1): potatoes, leafy greens, avocado, yoghurt, salmon, beans, kiwi.`); }
  if (sleepHours !== undefined && sleepHours < 7) { score -= 15; tips.push('Short sleep raises cortisol and leaves fluid around the eyes. Tonight matters more than any food.'); }
  if (fizzy.length) { score -= 5; tips.push('Fizzy drinks put gas in your gut. Still water or tea before an event.'); }
  if (!tips.length && items.length >= 3) tips.push(ratio <= 1 ? 'Potassium beats sodium and nothing’s spiking. This is a de-puffed day.' : 'Steady sodium, no alcohol. You’re in good shape for tomorrow.');
  return { score: Math.max(0, score), sodium, potassium, ratio, usualSodium, jump, alcohol, fodmapFoods, fizzy, tips };
}
