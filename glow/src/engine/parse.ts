import type { Food } from '@/data/foods';

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
  grams?: number;
}

export function normalise(s: string): string {
  return s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9%.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Ranked fuzzy search over a food list. */
export function searchFoods(q: string, foods: Food[], limit = 30): Food[] {
  const nq = normalise(q);
  if (!nq) return [];
  const tokens = nq.split(' ').map((t) => t.replace(/(ies|es|s)$/, ''));
  const scored = foods
    .map((f) => {
      const name = normalise(f.name);
      let s = 0;
      if (name.startsWith(nq)) s += 6;
      if (name.includes(nq)) s += 4;
      for (const t of tokens) if (t && (name.includes(t) || f.id.includes(t))) s += 2;
      for (const [re, id] of ALIASES) if (id === f.id && re.test(nq)) s += 5;
      return { f, s };
    })
    .filter((x) => x.s >= 2 * Math.min(tokens.length, 2))
    .sort((a, b) => b.s - a.s || a.f.name.length - b.f.name.length);
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
  if (/\bhandful\b/.test(s) && grams === undefined) grams = 30 * (count ?? 1);
  s = s.replace(/\b(handfuls?|of|portions?|servings?|slices?|pieces?|fillets?|tin|can|pot|glass|mug|cups?|bowl)\b/g, ' ').trim();

  const food = searchFoods(s, foods, 1)[0];
  if (food && grams === undefined) {
    const each = EACH[food.id];
    grams = count !== undefined ? (each ? each * count : food.portion.g * count) : food.portion.g;
  }
  return { text: chunk, food, grams: grams !== undefined ? Math.round(grams) : undefined };
}
