import type { Food } from './foods';

// Countable portions: "4 large eggs", "3 Kallo lentil cakes". Grams are
// the EDIBLE weight of one item (no shell, stone or peel), because that's
// what the nutrition values are for. UK egg sizes are graded by shell
// weight (small < 53 g, medium 53–63 g, large 63–73 g, very large 73 g+);
// the shell is about 11%, so a large egg gives roughly 60 g to eat.

export interface Unit {
  label: string;
  /** Plural used in the log ("4 large eggs"). */
  plural?: string;
  g: number;
  default?: boolean;
}

const EGG_SIZES: Unit[] = [
  { label: 'small egg', plural: 'small eggs', g: 45 },
  { label: 'medium egg', plural: 'medium eggs', g: 52 },
  { label: 'large egg', plural: 'large eggs', g: 60, default: true },
  { label: 'very large egg', plural: 'very large eggs', g: 68 },
];

const one = (label: string, plural: string, g: number): Unit[] => [{ label, plural, g, default: true }];

export const UNITS: Record<string, Unit[]> = {
  eggs: EGG_SIZES,
  'duck-eggs': one('duck egg', 'duck eggs', 70),
  'quail-eggs': one('quail egg', 'quail eggs', 10),
  'brazil-nuts': one('Brazil nut', 'Brazil nuts', 5),
  walnuts: one('walnut half', 'walnut halves', 4),
  almonds: one('almond', 'almonds', 1.2),
  oysters: one('oyster', 'oysters', 20),
  scallops: one('scallop', 'scallops', 20),
  prawns: one('king prawn', 'king prawns', 12),
  kiwi: one('kiwi', 'kiwis', 75),
  dates: one('date', 'dates', 24),
  banana: [{ label: 'small banana', plural: 'small bananas', g: 100 }, { label: 'medium banana', plural: 'medium bananas', g: 120, default: true }, { label: 'large banana', plural: 'large bananas', g: 140 }],
  apple: [{ label: 'small apple', plural: 'small apples', g: 120 }, { label: 'medium apple', plural: 'medium apples', g: 150, default: true }, { label: 'large apple', plural: 'large apples', g: 200 }],
  orange: one('orange', 'oranges', 150),
  avocado: [{ label: 'half avocado', plural: 'half avocados', g: 75, default: true }, { label: 'whole avocado', plural: 'whole avocados', g: 150 }],
  strawberries: one('strawberry', 'strawberries', 12),
  tomato: [{ label: 'tomato', plural: 'tomatoes', g: 80, default: true }, { label: 'cherry tomato', plural: 'cherry tomatoes', g: 15 }],
  'red-pepper': one('pepper', 'peppers', 160),
  carrots: one('carrot', 'carrots', 80),
  'sweet-potato': one('sweet potato', 'sweet potatoes', 200),
  potato: [{ label: 'medium potato', plural: 'medium potatoes', g: 170, default: true }, { label: 'large potato', plural: 'large potatoes', g: 250 }],
  'chicken-breast': one('chicken breast', 'chicken breasts', 170),
  'chicken-thigh': one('thigh', 'thighs', 80),
  'salmon-wild': one('fillet', 'fillets', 130),
  'salmon-farmed': one('fillet', 'fillets', 140),
  mackerel: one('fillet', 'fillets', 120),
  'uk-hake': one('fillet', 'fillets', 140),
  sardines: one('tin (drained)', 'tins', 90),
  'tuna-tin': one('tin (drained)', 'tins', 110),
  sausages: one('sausage', 'sausages', 50),
  bacon: one('rasher', 'rashers', 25),
  'uk-back-bacon': one('rasher', 'rashers', 25),
  sourdough: one('slice', 'slices', 45),
  'white-bread': one('slice', 'slices', 40),
  'gf-bread': one('slice', 'slices', 35),
  'rice-cakes': one('rice cake', 'rice cakes', 8),
  // 20 kcal per cake at about 380 kcal per 100 g.
  'uk-kallo-lentil': one('lentil cake', 'lentil cakes', 5.3),
  'uk-clarence-eggs': EGG_SIZES,
  'uk-fage-0': one('pot (170 g)', 'pots', 170),
  'uk-fage-2': one('pot (170 g)', 'pots', 170),
  'uk-fage-5': one('pot (170 g)', 'pots', 170),
  'uk-oatcakes-gf': one('oatcake', 'oatcakes', 10),
  'uk-oatcakes': one('oatcake', 'oatcakes', 10),
  'uk-crumpet': one('crumpet', 'crumpets', 55),
  'uk-weetabix': one('biscuit', 'biscuits', 19),
  'dark-choc-85': one('square', 'squares', 10),
  'dark-choc-70': one('square', 'squares', 10),
  whey: one('scoop', 'scoops', 30),
  'collagen-powder': one('scoop', 'scoops', 10),
  evoo: [{ label: 'tbsp', plural: 'tbsp', g: 10, default: true }, { label: 'tsp', plural: 'tsp', g: 4 }],
  butter: [{ label: 'tsp', plural: 'tsp', g: 5, default: true }, { label: 'tbsp', plural: 'tbsp', g: 14 }],
  'beef-tallow': one('tbsp', 'tbsp', 10),
  garlic: one('clove', 'cloves', 3),
};

/** Countable units for a food: your own pack's unit first, then Glow's list. */
export function unitsFor(f: Food): Unit[] {
  return f.units ?? UNITS[f.id] ?? [];
}

export function defaultUnit(f: Food): Unit | undefined {
  const us = unitsFor(f);
  return us.find((u) => u.default) ?? us[0];
}

export function describeQty(count: number, u: Pick<Unit, 'label' | 'plural'>): string {
  const n = Number.isInteger(count) ? String(count) : count.toFixed(1);
  return `${n} ${count === 1 ? u.label : (u.plural ?? u.label)}`;
}
