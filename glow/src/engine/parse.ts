import type { Food } from '@/data/foods';
import { cookedToRaw, cookingYield } from './cooking';
import { defaultUnit, unitsFor } from '@/data/units';

// Turns "3 eggs, 150g wild salmon, handful blueberries, 1 brazil nut" into
// foods and grams. Deliberately forgiving: you can type how you'd say it.

/** Grams per single item, for foods people count rather than weigh. */
const EACH: Record<string, number> = {
  eggs: 60, 'duck-eggs': 70, 'quail-eggs': 10, 'brazil-nuts': 5, oysters: 20, kiwi: 75, dates: 24,
  banana: 120, apple: 150, orange: 150, sausages: 50, bacon: 25, sourdough: 45, 'white-bread': 40,
  'gf-bread': 35, avocado: 150, walnuts: 4, almonds: 1.3, 'rice-cakes': 10, 'corn-tortilla': 25,
  'chicken-breast': 170, 'chicken-thigh': 80, 'salmon-wild': 130, 'salmon-farmed': 140, mackerel: 120,
  'sardines': 90, 'tuna-tin': 110, croissant: 60, donut: 70, biscuits: 15, 'protein-bar': 60,
  'coffee': 200, 'green-tea': 250, 'cola': 330, 'diet-cola': 330, 'energy-drink': 250, beer: 568, wine: 175,
  spirits: 25, 'beet-juice': 70, scallops: 20, prawns: 12, tomato: 80, carrots: 80, 'red-pepper': 160,
  'sweet-potato': 200, potato: 200, beetroot: 80, lemon: 60, 'dark-choc-85': 10, 'dark-choc-70': 10,
};

const ALIASES: [RegExp, string][] = [
  [/\bsalmon\b(?!.*(farm|tin|can|roe|sushi))/, 'salmon-wild'],
  [/\b(mince|ground beef|beef)\b(?!.*(liver|heart|kidney|tallow|broth))/, 'beef-mince-lean'],
  [/\bsteak\b/, 'sirloin'],
  [/\b(yog(h)?urt|greek)\b(?!.*0)/, 'greek-yogurt'],
  [/\beggs?\b(?!.*(duck|quail))/, 'eggs'],
  [/\bliver\b(?!.*(chicken|lamb|cod))/, 'beef-liver'],
  [/\boysters?\b/, 'oysters'],
  [/\bbroth\b/, 'bone-broth'],
  [/\bblueberr/, 'blueberries'],
  [/\bbrazil/, 'brazil-nuts'],
  [/\bolive oil\b|\bevoo\b/, 'evoo'],
  [/\btallow\b/, 'beef-tallow'],
  [/\bkefir\b/, 'kefir'],
  [/\brice\b(?!.*(brown|cake|basmati))/, 'white-rice'],
  [/\bpotato(es)?\b(?!.*sweet)/, 'potato'],
  [/\bsweet potato/, 'sweet-potato'],
  [/\bcoffee\b/, 'coffee'],
  [/\bchicken\b(?!.*(liver|thigh|fried))/, 'chicken-breast'],
  [/\bsardines?\b/, 'sardines'],
  [/\bmackerel\b/, 'mackerel'],
  [/\bspinach\b/, 'spinach'],
  [/\bgarlic\b/, 'garlic'],
  [/\bchocolate\b(?!.*(milk|70))/, 'dark-choc-85'],
  [/\bwater\b/, 'water'],
];

const WORD_QTY: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, dozen: 12 };

export interface ParsedItem {
  text: string;
  food?: Food;
  /** Always raw (or dry) grams: what Glow stores. */
  grams?: number;
  /** Set when you typed a cooked weight that was converted. */
  cookedGrams?: number;
  /** Set when you counted items ("4 large eggs"). */
  qty?: { count: number; label: string; plural?: string };
}

export function normalise(s: string): string {
  return s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9%.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Preparation and buying words: they help ranking but aren't required to match. */
const SOFT = new Set(['diced', 'sliced', 'chopped', 'fresh', 'raw', 'organic', 'free', 'range', 'grass', 'fed', 'grassfed', 'wild', 'boneless',
  'skinless', 'fillet', 'fillets', 'loin', 'cubed', 'minced', 'whole', 'frozen', 'british', 'uk', 'scottish', 'local', 'butcher', 'butchers',
  'homemade', 'plain', 'natural', 'cooked', 'boiled', 'grilled', 'roasted', 'baked', 'steamed', 'poached', 'pan', 'fried', 'seared', 'large', 'medium', 'small', 'some', 'my', 'the', 'with', 'from', 'pieces', 'cut', 'cuts']);

const SOURCE_BOOST: Record<string, number> = { library: 6, uk: 4, custom: 9, usda: 0, openfoodfacts: 0 };

/** Ranked fuzzy search over a food list. Every "hard" word must match; soft words only lift the ranking. */
export function searchFoods(q: string, foods: Food[], limit = 30): Food[] {
  const nq = normalise(q);
  if (!nq) return [];
  // Cut plurals to a shared stem: blueberries/blueberry -> blueberr, potatoes -> potato, eggs -> egg.
  const stem = (t: string) => (t.length <= 4 ? t : t.replace(/ies$|y$/, '').replace(/oes$/, 'o').replace(/(ches|shes|sses)$/, (m) => m.slice(0, -2)).replace(/([^s])s$/, '$1'));
  const words = nq.split(' ').filter(Boolean);
  const hard = words.filter((w) => !SOFT.has(w)).map(stem).filter((w) => w.length > 1);
  const soft = words.filter((w) => SOFT.has(w));
  if (!hard.length) return [];
  const scored: { f: Food; s: number }[] = [];
  for (const f of foods) {
    const hay = normalise(`${f.name} ${f.alias ?? ''} ${f.id.replace(/-/g, ' ')}`);
    if (!hard.every((t) => hay.includes(t))) continue;
    const name = normalise(f.name);
    let s = SOURCE_BOOST[f.source ?? 'library'] ?? 0;
    if (name.startsWith(hard[0])) s += 4;
    if (name.includes(nq)) s += 4;
    for (const t of hard) if (new RegExp(`\\b${t}`).test(name)) s += 2;
    for (const t of soft) if (hay.includes(t)) s += 1;
    if (/\braw\b/.test(name)) s += 1;
    for (const [re, id] of ALIASES) if (id === f.id && re.test(nq)) s += 6;
    scored.push({ f, s });
  }
  scored.sort((a, b) => b.s - a.s || a.f.name.length - b.f.name.length);
  return scored.slice(0, limit).map((x) => x.f);
}

export function parseEntry(text: string, foods: Food[]): ParsedItem[] {
  return text
    .split(/,|\band\b|\+|\n|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((chunk) => parseChunk(chunk, foods));
}

function parseChunk(chunk: string, foods: Food[]): ParsedItem {
  let s = normalise(chunk);
  let grams: number | undefined;
  let count: number | undefined;

  const g = s.match(/(\d+(?:\.\d+)?)\s*(kg|g|grams?|ml)\b/);
  if (g) {
    grams = Number(g[1]) * (g[2] === 'kg' ? 1000 : 1);
    s = s.replace(g[0], ' ');
  } else {
    const spoon = s.match(/(\d+(?:\.\d+)?)?\s*(tbsp|tablespoons?|tsp|teaspoons?)\b/);
    if (spoon) {
      grams = (spoon[1] ? Number(spoon[1]) : 1) * (/^(tsp|teaspoon)/.test(spoon[2]) ? 5 : 12);
      s = s.replace(spoon[0], ' ');
    } else {
      const n = s.match(/^(\d+(?:\.\d+)?)\s*x?\s+/) ?? s.match(/\s(\d+(?:\.\d+)?)$/);
      if (n) {
        count = Number(n[1]);
        s = s.replace(n[0], ' ');
      } else {
        const w = s.match(/^(a|an|one|two|three|four|five|six|half|dozen)\b(\s+(a|an))?/);
        if (w) {
          count = WORD_QTY[w[1]];
          s = s.replace(w[0], ' ');
        }
      }
    }
  }
  const size = normalise(chunk).match(/\b(very large|extra large|xl|large|medium|small|cherry|half|whole|king)\b/)?.[1]?.replace(/extra large|xl/, 'very large');
  if (/\bhandful\b/.test(s) && grams === undefined) grams = 30 * (count ?? 1);
  s = s.replace(/\b(handfuls?|of|portions?|servings?|slices?|pieces?|fillets?|tins?|cans?|pots?|glass(es)?|mugs?|cups?|bowls?|pints?|bottles?|shots?|scoops?|rashers?|cloves?|large|medium|small)\b/g, ' ').trim();

  const food = searchFoods(s, foods, 1)[0];
  let qty: ParsedItem['qty'];
  if (food && grams === undefined) {
    const units = unitsFor(food);
    const unit = (size && units.find((u) => u.label.startsWith(size))) || defaultUnit(food);
    if (size === 'half' && count === 0.5 && unit?.label.startsWith('half')) count = 1;
    if (count !== undefined && unit) {
      grams = unit.g * count;
      qty = { count, label: unit.label, plural: unit.plural };
    } else {
      const each = EACH[food.id];
      grams = count !== undefined ? (each ? each * count : food.portion.g * count) : food.portion.g;
    }
  }
  const cooked = /\b(cooked|boiled|grilled|roasted|roast|baked|steamed|poached|pan[- ]fried|seared|after cooking)\b/.test(normalise(chunk));
  if (food && grams !== undefined && cooked && cookingYield(food) && g) {
    return { text: chunk, food, grams: cookedToRaw(food, grams), cookedGrams: Math.round(grams) };
  }
  return { text: chunk, food, grams: grams !== undefined ? Math.round(grams) : undefined, qty };
}
