// Nutrient values are per 100 g, typical values compiled from USDA
// FoodData Central (SR Legacy / Foundation) with UK conventions applied:
// carbohydrate is *available* carbohydrate (fibre listed separately, as on
// UK labels). Meat, fish and potatoes are raw weights; grains are dry.
// Real foods vary by 10–20% (feed, season, variety, brand), so every total
// built from these is an estimate and is shown as one.
//
// Leucine is estimated as protein × a typical leucine fraction for that
// protein type (≈8% meat/fish, 8.6% egg, 9.5–10% dairy, 10.5% whey,
// 6–7.5% plants) — close enough to plan meals, not to publish.

export type FoodCategory =
  | 'meat'
  | 'fish'
  | 'eggs-dairy'
  | 'grains'
  | 'starchy'
  | 'veg'
  | 'fruit'
  | 'nuts-seeds'
  | 'legumes'
  | 'fats'
  | 'drinks-other';

export const CATEGORY_LABEL: Record<FoodCategory, string> = {
  meat: 'Meat & offal',
  fish: 'Fish & seafood',
  'eggs-dairy': 'Eggs & dairy',
  grains: 'Grains (gluten-free)',
  starchy: 'Potatoes & starchy veg',
  veg: 'Vegetables',
  fruit: 'Fruit',
  'nuts-seeds': 'Nuts & seeds',
  legumes: 'Legumes & soya',
  fats: 'Oils & fats',
  'drinks-other': 'Drinks & other',
};

export interface Nutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fibre: number;
  fat: number;
  satFat: number;
  leucine: number;
  iron: number; // mg
  zinc: number; // mg
  calcium: number; // mg
  magnesium: number; // mg
  potassium: number; // mg
  selenium: number; // µg
  epaDha: number; // g
  ala: number; // g
  vitD: number; // µg
  b12: number; // µg
  folate: number; // µg
  vitC: number; // mg
  vitA: number; // µg RAE
  vitE: number; // mg
  vitK: number; // µg
  choline?: number; // mg
}

export type Gluten = 'naturally-gf' | 'certified-gf-needed' | 'check-label' | 'contains-gluten';

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  basis: 'raw' | 'dry' | 'as-sold' | 'drained';
  portion: { g: number; label: string };
  gluten: Gluten;
  n: Nutrients;
  proteinQuality?: 'high' | 'moderate' | 'low';
  limitingAminoAcid?: string;
  ironType?: 'haem' | 'non-haem' | 'mixed';
  gi?: 'low' | 'medium' | 'high';
  polyphenols?: 'high' | 'moderate';
  /** Fermentable-carbohydrate or other gut-tolerance notes. */
  gut?: string;
  notes: string[];
  caution?: string;
}

const Z: Nutrients = {
  kcal: 0, protein: 0, carbs: 0, fibre: 0, fat: 0, satFat: 0, leucine: 0, iron: 0, zinc: 0, calcium: 0,
  magnesium: 0, potassium: 0, selenium: 0, epaDha: 0, ala: 0, vitD: 0, b12: 0, folate: 0, vitC: 0, vitA: 0, vitE: 0, vitK: 0,
};

function food(f: Omit<Food, 'n'> & { n: Partial<Nutrients> }): Food {
  return { ...f, n: { ...Z, ...f.n } };
}

export const FOODS: Food[] = [
  // ── Eggs & dairy ──────────────────────────────────────────────────────
  food({
    id: 'eggs', name: 'Whole eggs', category: 'eggs-dairy', basis: 'raw', portion: { g: 120, label: '2 large eggs' }, gluten: 'naturally-gf',
    n: { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5, satFat: 3.1, leucine: 1.09, iron: 1.75, zinc: 1.29, calcium: 56, magnesium: 12, potassium: 138, selenium: 30.7, epaDha: 0.05, ala: 0.03, vitD: 2.0, b12: 0.89, folate: 47, vitA: 160, vitE: 1.05, vitK: 0.3, choline: 294 },
    proteinQuality: 'high', ironType: 'non-haem', gi: 'low',
    notes: [
      'Cooking roughly doubles how much egg protein you absorb compared with raw (about 91% vs 51%).',
      'The yolk holds the choline, vitamin D, B12, lutein and most of the vitamins — whole eggs beat whites for nutrient density.',
      'Vitamin D varies with the hen’s diet; UK eggs have tested higher than the US figure used here.',
      'For most people, dietary cholesterol from eggs moves blood LDL far less than saturated fat does.',
    ],
  }),
  food({
    id: 'greek-yoghurt-full', name: 'Greek yoghurt, full-fat (plain)', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 200, label: '200 g pot' }, gluten: 'naturally-gf',
    n: { kcal: 96, protein: 9.0, carbs: 3.9, fat: 5.0, satFat: 3.3, leucine: 0.9, iron: 0.04, zinc: 0.52, calcium: 110, magnesium: 11, potassium: 141, selenium: 9.7, b12: 0.75, folate: 7, vitA: 40, vitD: 0.1 },
    proteinQuality: 'high', gi: 'low',
    notes: ['Straining concentrates protein but loses some calcium into the whey — regular yoghurt and milk carry more calcium per gram of protein.', 'Mostly casein: digested slowly, which suits a pre-sleep snack.'],
  }),
  food({
    id: 'greek-yoghurt-0', name: 'Greek yoghurt, 0% fat (plain)', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 200, label: '200 g pot' }, gluten: 'naturally-gf',
    n: { kcal: 59, protein: 10.3, carbs: 3.6, fat: 0.4, satFat: 0.1, leucine: 1.03, zinc: 0.52, calcium: 110, magnesium: 11, potassium: 141, selenium: 9.7, b12: 0.75, folate: 7 },
    proteinQuality: 'high', gi: 'low',
    notes: ['One of the most protein-dense foods per calorie — useful when energy is tight.', 'Fat-soluble vitamins are largely removed with the fat.'],
  }),
  food({
    id: 'kefir', name: 'Kefir, plain', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 250, label: '250 ml glass' }, gluten: 'naturally-gf',
    n: { kcal: 50, protein: 3.5, carbs: 4.5, fat: 1.8, satFat: 1.2, leucine: 0.34, zinc: 0.4, calcium: 120, magnesium: 12, potassium: 150, selenium: 3, b12: 0.4, vitA: 20 },
    proteinQuality: 'high', gi: 'low',
    notes: [
      'Fermentation lowers lactose, so many people who struggle with milk tolerate kefir.',
      'A 10-week trial of a high-fermented-food diet (including kefir and yoghurt) increased gut microbiome diversity and lowered several inflammatory markers — small (n = 36) and short, so promising rather than proven.',
    ],
  }),
  food({
    id: 'milk-semi', name: 'Milk, semi-skimmed', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 250, label: '250 ml glass' }, gluten: 'naturally-gf',
    n: { kcal: 47, protein: 3.5, carbs: 4.8, fat: 1.7, satFat: 1.1, leucine: 0.34, calcium: 124, magnesium: 11, potassium: 162, selenium: 2, b12: 0.5, vitA: 20 },
    proteinQuality: 'high', gi: 'low',
    notes: ['Milk and dairy are the main source of iodine in UK diets — relevant to thyroid function.', 'Milk after training supplies protein, carbohydrate, fluid and sodium in one go.'],
  }),
  food({
    id: 'cottage-cheese', name: 'Cottage cheese', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 200, label: '200 g' }, gluten: 'naturally-gf',
    n: { kcal: 98, protein: 11.1, carbs: 3.4, fat: 4.3, satFat: 1.7, leucine: 1.1, calcium: 83, magnesium: 8, potassium: 104, selenium: 9.7, b12: 0.43, zinc: 0.4 },
    proteinQuality: 'high', gi: 'low',
    notes: ['Casein-rich: a practical 20–40 g protein before sleep, which has supported muscle and strength gains in trained young men.'],
  }),
  food({
    id: 'cheddar', name: 'Cheddar', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 30, label: '30 g' }, gluten: 'naturally-gf',
    n: { kcal: 403, protein: 24.9, carbs: 1.3, fat: 33.1, satFat: 21.1, leucine: 2.4, zinc: 3.1, calcium: 721, magnesium: 28, potassium: 98, selenium: 13.9, b12: 0.83, vitA: 265, vitK: 2.8 },
    proteinQuality: 'high',
    notes: ['Dense calcium source; high in saturated fat and salt, so a flavour rather than a staple.', 'Hard cheeses are naturally very low in lactose.'],
  }),
  food({
    id: 'parmesan', name: 'Parmesan', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 15, label: '15 g grated' }, gluten: 'naturally-gf',
    n: { kcal: 392, protein: 35.8, carbs: 3.2, fat: 25.8, satFat: 16.4, leucine: 3.45, zinc: 2.75, calcium: 1184, magnesium: 44, potassium: 92, selenium: 22.5, b12: 1.2, vitA: 207 },
    proteinQuality: 'high', notes: ['The most calcium-dense common food per gram.'],
  }),
  food({
    id: 'whey-isolate', name: 'Whey protein isolate (typical)', category: 'eggs-dairy', basis: 'as-sold', portion: { g: 30, label: '1 scoop' }, gluten: 'check-label',
    n: { kcal: 370, protein: 88, carbs: 2, fat: 1, satFat: 0.5, leucine: 9.5, calcium: 400 },
    proteinQuality: 'high',
    notes: ['A convenience, not a necessity: the highest leucine per gram of any common protein, absorbed fast.', 'Product-specific — check the label for gluten status and an Informed Sport or similar batch-testing mark.'],
  }),

  // ── Fish & seafood ────────────────────────────────────────────────────
  food({
    id: 'salmon-wild', name: 'Salmon, wild', category: 'fish', basis: 'raw', portion: { g: 140, label: '1 fillet' }, gluten: 'naturally-gf',
    n: { kcal: 142, protein: 19.8, fat: 6.3, satFat: 1.0, leucine: 1.61, iron: 0.8, zinc: 0.64, calcium: 12, magnesium: 29, potassium: 490, selenium: 36.5, epaDha: 1.44, ala: 0.3, vitD: 11, b12: 3.2, folate: 25, vitA: 12, vitE: 1.0, choline: 65 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['One of very few foods with meaningful vitamin D.', 'A portion covers several days of the UK’s “at least one portion of oily fish a week” advice for EPA and DHA.'],
  }),
  food({
    id: 'salmon-farmed', name: 'Salmon, farmed', category: 'fish', basis: 'raw', portion: { g: 140, label: '1 fillet' }, gluten: 'naturally-gf',
    n: { kcal: 208, protein: 20.4, fat: 13.4, satFat: 3.1, leucine: 1.66, iron: 0.34, zinc: 0.36, calcium: 9, magnesium: 27, potassium: 363, selenium: 24, epaDha: 1.7, ala: 0.1, vitD: 8, b12: 3.2, folate: 26, vitA: 58 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['Omega-3 content depends on feed and has fallen as fish oil in feed has been partly replaced with plant oils — the figure here is a mid estimate.', 'More fat and energy than wild salmon; still an excellent EPA/DHA source.'],
  }),
  food({
    id: 'mackerel', name: 'Mackerel', category: 'fish', basis: 'raw', portion: { g: 120, label: '1 fillet' }, gluten: 'naturally-gf',
    n: { kcal: 205, protein: 18.6, fat: 13.9, satFat: 3.3, leucine: 1.51, iron: 1.63, zinc: 0.63, calcium: 12, magnesium: 76, potassium: 314, selenium: 44.1, epaDha: 2.3, ala: 0.16, vitD: 16.1, b12: 8.7, vitA: 50, vitE: 1.5 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['Among the richest common sources of EPA, DHA and vitamin D, and usually cheaper than salmon.'],
  }),
  food({
    id: 'sardines', name: 'Sardines, tinned in olive oil (drained, with bones)', category: 'fish', basis: 'drained', portion: { g: 90, label: '1 tin, drained' }, gluten: 'naturally-gf',
    n: { kcal: 208, protein: 24.6, fat: 11.5, satFat: 1.5, leucine: 1.99, iron: 2.92, zinc: 1.31, calcium: 382, magnesium: 39, potassium: 397, selenium: 52.7, epaDha: 0.98, ala: 0.5, vitD: 4.8, b12: 8.9, folate: 10, vitA: 32, vitE: 2.04 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['The soft bones make this a genuine calcium source — with vitamin D in the same food.', 'Cheap, shelf-stable, and low in mercury because sardines are small and short-lived.'],
  }),
  food({
    id: 'cod', name: 'Cod', category: 'fish', basis: 'raw', portion: { g: 150, label: '1 fillet' }, gluten: 'naturally-gf',
    n: { kcal: 82, protein: 17.8, fat: 0.67, satFat: 0.13, leucine: 1.45, iron: 0.38, zinc: 0.45, calcium: 16, magnesium: 32, potassium: 413, selenium: 33.1, epaDha: 0.19, vitD: 0.9, b12: 0.91, folate: 7 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['Very lean protein; white fish is one of the main UK sources of iodine.', 'Little omega-3 — it does not count towards the oily-fish portion.'],
  }),
  food({
    id: 'tuna-tin', name: 'Tuna, tinned in water (drained)', category: 'fish', basis: 'drained', portion: { g: 110, label: '1 tin, drained' }, gluten: 'naturally-gf',
    n: { kcal: 109, protein: 24.4, fat: 0.8, satFat: 0.2, leucine: 1.98, iron: 1.0, zinc: 0.6, calcium: 11, magnesium: 27, potassium: 237, selenium: 70, epaDha: 0.25, vitD: 1.2, b12: 2.5 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['Tinning removes most of tuna’s omega-3, so it does not count as oily fish in UK advice.', 'Larger predatory fish carry more mercury; tuna is fine in normal amounts for men.'],
  }),
  food({
    id: 'prawns', name: 'Prawns', category: 'fish', basis: 'raw', portion: { g: 120, label: '120 g' }, gluten: 'naturally-gf',
    n: { kcal: 85, protein: 20.1, fat: 0.5, satFat: 0.1, leucine: 1.6, iron: 0.21, zinc: 1.34, calcium: 64, magnesium: 39, potassium: 264, selenium: 38, epaDha: 0.27, b12: 1.1 },
    proteinQuality: 'high', notes: ['Lean, high-quality protein with zinc and selenium.'],
  }),
  food({
    id: 'oysters', name: 'Oysters, Pacific', category: 'fish', basis: 'raw', portion: { g: 100, label: '~6 oysters' }, gluten: 'naturally-gf',
    n: { kcal: 81, protein: 9.5, carbs: 5.0, fat: 2.3, satFat: 0.5, leucine: 0.66, iron: 5.1, zinc: 16.6, calcium: 8, magnesium: 22, potassium: 168, selenium: 77, epaDha: 0.69, vitD: 8, b12: 16, folate: 10, vitC: 8, vitA: 81 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['Exceptionally rich in zinc, B12 and selenium — a few a week covers a lot.', 'Native and Eastern oysters can carry several times more zinc; very high zinc intakes over time can impair copper status.'],
    caution: 'Raw oysters carry a real risk of norovirus and Vibrio. Buy from reputable sources; cooked oysters remove most of the risk.',
  }),
  food({
    id: 'mussels', name: 'Mussels', category: 'fish', basis: 'raw', portion: { g: 150, label: '~150 g meat' }, gluten: 'naturally-gf',
    n: { kcal: 86, protein: 11.9, carbs: 3.7, fat: 2.24, satFat: 0.43, leucine: 0.87, iron: 3.95, zinc: 1.6, calcium: 26, magnesium: 34, potassium: 320, selenium: 44.8, epaDha: 0.44, b12: 12, folate: 42, vitC: 8, vitA: 48 },
    proteinQuality: 'high', ironType: 'mixed',
    notes: ['Cheap, sustainable, and rich in iron and B12. Cook until the shells open; discard any that stay shut.'],
  }),

  // ── Meat & offal ──────────────────────────────────────────────────────
  food({
    id: 'chicken-breast', name: 'Chicken breast, skinless', category: 'meat', basis: 'raw', portion: { g: 150, label: '1 breast' }, gluten: 'naturally-gf',
    n: { kcal: 120, protein: 22.5, fat: 2.6, satFat: 0.56, leucine: 1.69, iron: 0.37, zinc: 0.68, calcium: 5, magnesium: 28, potassium: 370, selenium: 22.8, b12: 0.21, folate: 4, vitA: 9, choline: 73 },
    proteinQuality: 'high', ironType: 'mixed', notes: ['The leanest common protein — efficient, but thin on micronutrients compared with fish, eggs or red meat.'],
  }),
  food({
    id: 'chicken-thigh', name: 'Chicken thigh, skinless', category: 'meat', basis: 'raw', portion: { g: 150, label: '2 thighs' }, gluten: 'naturally-gf',
    n: { kcal: 121, protein: 19.7, fat: 4.1, satFat: 1.03, leucine: 1.48, iron: 0.81, zinc: 1.59, calcium: 7, magnesium: 23, potassium: 242, selenium: 22, b12: 0.56 },
    proteinQuality: 'high', ironType: 'mixed', notes: ['Twice the iron and zinc of breast for a little more fat.'],
  }),
  food({
    id: 'turkey-breast', name: 'Turkey breast', category: 'meat', basis: 'raw', portion: { g: 150, label: '150 g' }, gluten: 'naturally-gf',
    n: { kcal: 114, protein: 23.7, fat: 1.5, satFat: 0.4, leucine: 1.78, iron: 0.7, zinc: 1.2, magnesium: 30, potassium: 390, selenium: 25, b12: 0.8 },
    proteinQuality: 'high', ironType: 'mixed', notes: ['Very lean; similar role to chicken breast.'],
  }),
  food({
    id: 'beef-mince-5', name: 'Beef mince, 5% fat', category: 'meat', basis: 'raw', portion: { g: 150, label: '150 g' }, gluten: 'naturally-gf',
    n: { kcal: 137, protein: 21.4, fat: 5.0, satFat: 2.2, leucine: 1.7, iron: 2.3, zinc: 5.0, calcium: 9, magnesium: 21, potassium: 340, selenium: 18, b12: 2.2, folate: 7 },
    proteinQuality: 'high', ironType: 'haem',
    notes: ['Roughly half of the iron in red meat is haem iron, absorbed at ~15–35% versus a few percent for plant iron.', 'Meat also boosts absorption of plant iron eaten in the same meal (the “meat factor”).', 'Grass-fed beef has a modestly better fatty-acid profile, but the absolute omega-3 amount is small next to oily fish.'],
    caution: 'UK advice: no more than ~70 g a day of red and processed meat on average. The cancer evidence is strongest for processed meat.',
  }),
  food({
    id: 'beef-steak', name: 'Beef sirloin, lean', category: 'meat', basis: 'raw', portion: { g: 170, label: '1 steak' }, gluten: 'naturally-gf',
    n: { kcal: 142, protein: 22, fat: 5.8, satFat: 2.3, leucine: 1.75, iron: 1.8, zinc: 3.9, calcium: 16, magnesium: 23, potassium: 340, selenium: 26, b12: 1.5 },
    proteinQuality: 'high', ironType: 'haem', notes: ['Trim visible fat to keep saturated fat in check.'],
    caution: 'Counts towards the ~70 g/day red-meat average.',
  }),
  food({
    id: 'beef-liver', name: 'Beef liver', category: 'meat', basis: 'raw', portion: { g: 80, label: '80 g' }, gluten: 'naturally-gf',
    n: { kcal: 135, protein: 20.4, carbs: 3.9, fat: 3.6, satFat: 1.2, leucine: 1.9, iron: 4.9, zinc: 4.0, calcium: 5, magnesium: 18, potassium: 313, selenium: 39.7, b12: 59, folate: 290, vitC: 1.3, vitA: 4968, vitD: 1.2, choline: 333 },
    proteinQuality: 'high', ironType: 'haem',
    notes: ['The most micronutrient-dense food here by a distance: B12, folate, vitamin A, copper, iron.'],
    caution: 'Very high in preformed vitamin A: one 80 g portion exceeds the adult upper level. NHS advice is to eat liver no more than once a week. Avoid liver supplements.',
  }),
  food({
    id: 'pork-tenderloin', name: 'Pork tenderloin', category: 'meat', basis: 'raw', portion: { g: 150, label: '150 g' }, gluten: 'naturally-gf',
    n: { kcal: 120, protein: 21, fat: 3.5, satFat: 1.2, leucine: 1.67, iron: 0.98, zinc: 1.89, magnesium: 27, potassium: 399, selenium: 31, b12: 0.5 },
    proteinQuality: 'high', ironType: 'haem', notes: ['Exceptionally rich in thiamin (vitamin B1), needed for carbohydrate metabolism.'],
  }),
  food({
    id: 'bone-broth', name: 'Bone broth (typical)', category: 'meat', basis: 'as-sold', portion: { g: 250, label: '250 ml mug' }, gluten: 'check-label',
    n: { kcal: 20, protein: 3.5, carbs: 0.5, fat: 0.5, satFat: 0.2, leucine: 0.1, potassium: 100 },
    proteinQuality: 'low', limitingAminoAcid: 'tryptophan (absent in collagen), low leucine',
    notes: [
      'Protein varies hugely (about 1–10 g per 100 ml) and is mostly collagen-derived: rich in glycine and proline, low in leucine, missing tryptophan. It does not stimulate muscle building like meat, eggs or dairy.',
      'Claims about gut lining, joints and skin rest mainly on mechanism, not trials of broth itself. Pleasant and hydrating; not a superfood.',
    ],
  }),

  // ── Grains (gluten-free) ──────────────────────────────────────────────
  food({
    id: 'oats-gf', name: 'Oats, certified gluten-free', category: 'grains', basis: 'dry', portion: { g: 60, label: '60 g dry' }, gluten: 'certified-gf-needed',
    n: { kcal: 379, protein: 13.2, carbs: 57.6, fibre: 10.1, fat: 6.5, satFat: 1.1, leucine: 1.0, iron: 4.25, zinc: 3.64, calcium: 52, magnesium: 138, potassium: 362, selenium: 28.9, folate: 32, vitE: 0.42 },
    proteinQuality: 'moderate', limitingAminoAcid: 'lysine', ironType: 'non-haem', gi: 'medium',
    notes: [
      'Beta-glucan fibre (~4 g per 100 g) lowers LDL cholesterol — an authorised health claim at 3 g a day.',
      'Phytate in oats limits iron and zinc absorption. Soaking overnight in kefir or yoghurt reduces it somewhat; berries alongside add vitamin C, which helps iron absorption.',
      'Rolled or steel-cut oats raise blood sugar more slowly than instant oats.',
    ],
    caution: 'Only certified gluten-free oats are safe in coeliac disease (ordinary oats are contaminated with wheat/barley). A minority of people with coeliac disease also react to avenin in pure oats — Coeliac UK suggests discussing introduction with your care team.',
  }),
  food({
    id: 'rice-basmati', name: 'Basmati rice, white', category: 'grains', basis: 'dry', portion: { g: 75, label: '75 g dry' }, gluten: 'naturally-gf',
    n: { kcal: 356, protein: 8.1, carbs: 77, fibre: 1.0, fat: 0.6, satFat: 0.2, leucine: 0.66, iron: 0.8, zinc: 1.1, magnesium: 25, potassium: 115, selenium: 15, folate: 8 },
    proteinQuality: 'low', limitingAminoAcid: 'lysine', ironType: 'non-haem', gi: 'medium',
    notes: ['Easy-to-digest carbohydrate for heavy training days; basmati has a lower GI than most white rice.', 'Cooling cooked rice increases resistant starch — but refrigerate within an hour and reheat thoroughly (Bacillus cereus).'],
  }),
  food({
    id: 'rice-brown', name: 'Brown rice', category: 'grains', basis: 'dry', portion: { g: 75, label: '75 g dry' }, gluten: 'naturally-gf',
    n: { kcal: 367, protein: 7.5, carbs: 72.8, fibre: 3.4, fat: 3.2, satFat: 0.6, leucine: 0.62, iron: 1.8, zinc: 2.0, magnesium: 143, potassium: 223, selenium: 23 },
    proteinQuality: 'low', limitingAminoAcid: 'lysine', ironType: 'non-haem', gi: 'medium',
    notes: ['More magnesium and fibre than white rice.', 'Rice absorbs inorganic arsenic, concentrated in the bran. Varying grains (rather than rice at every meal) is sensible; cooking in plenty of water and draining reduces it.'],
  }),
  food({
    id: 'quinoa', name: 'Quinoa', category: 'grains', basis: 'dry', portion: { g: 70, label: '70 g dry' }, gluten: 'check-label',
    n: { kcal: 368, protein: 14.1, carbs: 57.2, fibre: 7.0, fat: 6.1, satFat: 0.7, leucine: 0.84, iron: 4.57, zinc: 3.1, calcium: 47, magnesium: 197, potassium: 563, selenium: 8.5, folate: 184, vitE: 2.44 },
    proteinQuality: 'moderate', ironType: 'non-haem', gi: 'low',
    notes: ['Unusually good amino-acid balance for a plant (adequate lysine).', 'Rinse before cooking to remove bitter saponins.'],
    gut: 'Some people find quinoa gassy; test a small portion.',
  }),
  food({
    id: 'buckwheat', name: 'Buckwheat groats', category: 'grains', basis: 'dry', portion: { g: 70, label: '70 g dry' }, gluten: 'check-label',
    n: { kcal: 343, protein: 13.3, carbs: 61.5, fibre: 10, fat: 3.4, satFat: 0.7, leucine: 0.83, iron: 2.2, zinc: 2.4, magnesium: 231, potassium: 460, selenium: 8.3, folate: 30 },
    proteinQuality: 'moderate', ironType: 'non-haem', gi: 'low', polyphenols: 'moderate',
    notes: ['Not related to wheat and naturally gluten-free; rich in magnesium and the flavonoid rutin.'],
    caution: 'Often processed alongside wheat — buy products labelled gluten-free.',
  }),
  food({
    id: 'gf-pasta', name: 'Gluten-free pasta (rice/maize)', category: 'grains', basis: 'dry', portion: { g: 80, label: '80 g dry' }, gluten: 'certified-gf-needed',
    n: { kcal: 357, protein: 6.5, carbs: 77, fibre: 2.5, fat: 1.5, satFat: 0.3, leucine: 0.6, iron: 0.8, zinc: 1.0, magnesium: 30, potassium: 120, selenium: 5 },
    proteinQuality: 'low', ironType: 'non-haem', gi: 'medium',
    notes: ['Typically lower in protein and fibre than wheat pasta, and not fortified. Pair with a real protein source.', 'Legume-based GF pastas add protein and fibre — but may be harder on your gut.'],
  }),
  food({
    id: 'gf-bread', name: 'Gluten-free bread (white, typical)', category: 'grains', basis: 'as-sold', portion: { g: 70, label: '2 slices' }, gluten: 'certified-gf-needed',
    n: { kcal: 250, protein: 4, carbs: 42, fibre: 6, fat: 6, satFat: 0.6, leucine: 0.3, iron: 0.8, calcium: 50, magnesium: 25, potassium: 150 },
    proteinQuality: 'low', ironType: 'non-haem', gi: 'high',
    notes: ['UK law requires wheat flour to be fortified with calcium, iron, thiamin and niacin; most gluten-free breads are not — one reason coeliac diets can fall short.', 'Highly variable by brand: compare labels for fibre and protein.'],
  }),
  food({
    id: 'rice-cakes', name: 'Rice cakes', category: 'grains', basis: 'as-sold', portion: { g: 20, label: '2 cakes' }, gluten: 'check-label',
    n: { kcal: 387, protein: 8.2, carbs: 77.6, fibre: 4.2, fat: 2.8, satFat: 0.6, leucine: 0.6, magnesium: 131, potassium: 290 },
    proteinQuality: 'low', gi: 'high', notes: ['Fast, light carbohydrate 30–60 minutes before a session — a high GI is useful here.'],
  }),
  food({
    id: 'corn-tortilla', name: 'Corn tortilla', category: 'grains', basis: 'as-sold', portion: { g: 50, label: '2 small' }, gluten: 'check-label',
    n: { kcal: 218, protein: 5.7, carbs: 38.3, fibre: 6.3, fat: 2.85, satFat: 0.4, leucine: 0.7, iron: 1.2, zinc: 1.3, calcium: 81, magnesium: 72, potassium: 186 },
    proteinQuality: 'low', limitingAminoAcid: 'lysine', ironType: 'non-haem', gi: 'medium',
    notes: ['Traditional lime treatment (nixtamalisation) adds calcium and frees niacin.'],
    caution: 'Many supermarket “corn” tortillas contain wheat flour. Check for a gluten-free label.',
  }),

  // ── Potatoes & starchy veg ────────────────────────────────────────────
  food({
    id: 'potato', name: 'Potatoes, with skin', category: 'starchy', basis: 'raw', portion: { g: 250, label: '250 g raw' }, gluten: 'naturally-gf',
    n: { kcal: 77, protein: 2.05, carbs: 15.4, fibre: 2.1, fat: 0.09, leucine: 0.1, iron: 0.81, zinc: 0.3, calcium: 12, magnesium: 23, potassium: 425, vitC: 19.7, folate: 15 },
    proteinQuality: 'high', ironType: 'non-haem', gi: 'high',
    notes: [
      'One of the best sources of potassium, and more vitamin C than people expect.',
      'Hot boiled or baked potatoes have a high GI. Cooling after cooking forms resistant starch and lowers it; eating them with protein, fat and vegetables blunts the rise too.',
      'Boiling leaches vitamin C into the water; steaming or baking in the skin keeps more.',
      'Potato protein is of surprisingly high quality — there just is not much of it.',
    ],
  }),
  food({
    id: 'sweet-potato', name: 'Sweet potato', category: 'starchy', basis: 'raw', portion: { g: 200, label: '1 medium' }, gluten: 'naturally-gf',
    n: { kcal: 86, protein: 1.57, carbs: 17.1, fibre: 3.0, fat: 0.05, iron: 0.61, zinc: 0.3, calcium: 30, magnesium: 25, potassium: 337, vitA: 709, vitC: 2.4, folate: 11, vitE: 0.26 },
    ironType: 'non-haem', gi: 'medium',
    notes: ['Beta-carotene is fat-soluble: a little olive oil roughly multiplies how much you absorb.'],
    gut: 'Contains mannitol; large portions can bother sensitive guts.',
  }),
  food({
    id: 'parsnip', name: 'Parsnip', category: 'starchy', basis: 'raw', portion: { g: 120, label: '1 large' }, gluten: 'naturally-gf',
    n: { kcal: 75, protein: 1.2, carbs: 13.1, fibre: 4.9, fat: 0.3, iron: 0.59, zinc: 0.59, calcium: 36, magnesium: 29, potassium: 375, vitC: 17, folate: 67, vitK: 22.5, vitE: 1.49 },
    ironType: 'non-haem', gi: 'medium', notes: ['High in fibre and folate for a root vegetable.'],
  }),

  // ── Vegetables ────────────────────────────────────────────────────────
  food({
    id: 'spinach', name: 'Spinach', category: 'veg', basis: 'raw', portion: { g: 80, label: '2 big handfuls' }, gluten: 'naturally-gf',
    n: { kcal: 23, protein: 2.86, carbs: 1.4, fibre: 2.2, fat: 0.39, iron: 2.71, calcium: 99, magnesium: 79, potassium: 558, folate: 194, vitC: 28.1, vitA: 469, vitK: 483, vitE: 2.03 },
    ironType: 'non-haem', polyphenols: 'moderate',
    notes: [
      'The iron and calcium look impressive on paper but are poorly absorbed: oxalate binds them (only ~5% of spinach calcium is absorbed versus ~30% from milk).',
      'Rich in dietary nitrate, which the body converts to nitric oxide (relevant to blood vessels and exercise efficiency).',
      'Very high in vitamin K — relevant only if you are ever prescribed warfarin.',
    ],
  }),
  food({
    id: 'courgette', name: 'Courgette', category: 'veg', basis: 'raw', portion: { g: 150, label: '1 medium' }, gluten: 'naturally-gf',
    n: { kcal: 17, protein: 1.21, carbs: 2.11, fibre: 1.0, fat: 0.32, iron: 0.37, magnesium: 18, potassium: 261, vitC: 17.9, folate: 24, vitK: 4.3, vitA: 10 },
    ironType: 'non-haem', gut: 'Generally gentle on the gut — a good swap for brassicas.', notes: ['Low energy, decent potassium and vitamin C.'],
  }),
  food({
    id: 'green-beans', name: 'Green beans', category: 'veg', basis: 'raw', portion: { g: 100, label: '100 g' }, gluten: 'naturally-gf',
    n: { kcal: 31, protein: 1.83, carbs: 4.27, fibre: 2.7, fat: 0.22, iron: 1.03, calcium: 37, magnesium: 25, potassium: 211, vitC: 12.2, folate: 33, vitK: 43, vitA: 35 },
    ironType: 'non-haem', gut: 'Usually well tolerated in normal portions.', notes: ['Steam briefly to keep vitamin C and folate.'],
  }),
  food({
    id: 'carrot', name: 'Carrot', category: 'veg', basis: 'raw', portion: { g: 80, label: '1 medium' }, gluten: 'naturally-gf',
    n: { kcal: 41, protein: 0.93, carbs: 6.8, fibre: 2.8, fat: 0.24, calcium: 33, magnesium: 12, potassium: 320, vitA: 835, vitC: 5.9, vitK: 13.2 },
    gut: 'Well tolerated by most people.', notes: ['Cooking and a little fat increase beta-carotene absorption — one of the cases where cooked beats raw.'],
  }),
  food({
    id: 'red-pepper', name: 'Red pepper', category: 'veg', basis: 'raw', portion: { g: 80, label: '½ pepper' }, gluten: 'naturally-gf',
    n: { kcal: 31, protein: 0.99, carbs: 3.9, fibre: 2.1, fat: 0.3, potassium: 211, vitC: 128, vitA: 157, folate: 46, vitE: 1.58, vitK: 4.9 },
    gut: 'Usually well tolerated.', notes: ['Half a pepper supplies more vitamin C than an orange — useful alongside plant iron (oats, quinoa, spinach).'],
  }),
  food({
    id: 'tomato', name: 'Tomato', category: 'veg', basis: 'raw', portion: { g: 120, label: '1 large' }, gluten: 'naturally-gf',
    n: { kcal: 18, protein: 0.88, carbs: 2.7, fibre: 1.2, fat: 0.2, potassium: 237, vitC: 13.7, vitA: 42, vitK: 7.9, folate: 15 },
    polyphenols: 'moderate', notes: ['Lycopene is far better absorbed from cooked tomatoes (sauces, passata) with olive oil than from raw tomatoes.'],
  }),
  food({
    id: 'beetroot', name: 'Beetroot', category: 'veg', basis: 'raw', portion: { g: 80, label: '1 medium' }, gluten: 'naturally-gf',
    n: { kcal: 43, protein: 1.61, carbs: 6.76, fibre: 2.8, fat: 0.17, iron: 0.8, magnesium: 23, potassium: 325, folate: 109, vitC: 4.9 },
    polyphenols: 'moderate',
    notes: ['High in nitrate. Nitrate supplementation slightly improves endurance performance on average, with smaller effects in well-trained athletes.', 'Harmless pink urine (beeturia) is common.'],
    gut: 'Moderate in fermentable carbohydrates; larger portions can cause bloating.',
  }),
  food({
    id: 'rocket', name: 'Rocket', category: 'veg', basis: 'raw', portion: { g: 40, label: '1 handful' }, gluten: 'naturally-gf',
    n: { kcal: 25, protein: 2.58, carbs: 2.05, fibre: 1.6, fat: 0.66, iron: 1.46, calcium: 160, magnesium: 47, potassium: 369, vitC: 15, vitK: 108.6, folate: 97, vitA: 119 },
    ironType: 'non-haem', notes: ['Among the highest-nitrate vegetables.'],
    gut: 'A leafy brassica — usually far milder on the gut than broccoli, but test it.',
  }),
  food({
    id: 'kale', name: 'Kale', category: 'veg', basis: 'raw', portion: { g: 60, label: '2 handfuls' }, gluten: 'naturally-gf',
    n: { kcal: 35, protein: 2.92, carbs: 0.42, fibre: 4.1, fat: 1.49, iron: 1.6, calcium: 254, magnesium: 33, potassium: 348, vitC: 93.4, vitA: 241, vitK: 390, folate: 62 },
    ironType: 'non-haem', polyphenols: 'moderate',
    notes: ['Unlike spinach, kale calcium is well absorbed (low oxalate).'],
    gut: 'Cruciferous, like broccoli — likely to cause the same wind and bloating for you. Treat with caution.',
  }),
  food({
    id: 'pak-choi', name: 'Pak choi', category: 'veg', basis: 'raw', portion: { g: 100, label: '1 head' }, gluten: 'naturally-gf',
    n: { kcal: 13, protein: 1.5, carbs: 1.2, fibre: 1.0, fat: 0.2, iron: 0.8, calcium: 105, magnesium: 19, potassium: 252, vitC: 45, vitA: 223, vitK: 45.5, folate: 66 },
    ironType: 'non-haem', notes: ['Well-absorbed calcium and plenty of vitamin C for very little energy.'],
    gut: 'A brassica, but often better tolerated than broccoli. Try a small portion first.',
  }),
  food({
    id: 'broccoli', name: 'Broccoli', category: 'veg', basis: 'raw', portion: { g: 80, label: '80 g' }, gluten: 'naturally-gf',
    n: { kcal: 34, protein: 2.82, carbs: 4.04, fibre: 2.6, fat: 0.37, iron: 0.73, calcium: 47, magnesium: 21, potassium: 316, vitC: 89.2, vitK: 101.6, folate: 63, vitA: 31 },
    ironType: 'non-haem', polyphenols: 'moderate',
    notes: ['Rich in vitamin C, folate and glucosinolates (which form sulforaphane). Human evidence for sulforaphane’s health effects is still early.'],
    gut: 'Cruciferous: fermentable carbohydrates and sulphur compounds are a common cause of wind and bloating. Swap for courgette, green beans, carrots, peppers or pak choi.',
  }),
  food({
    id: 'cucumber', name: 'Cucumber', category: 'veg', basis: 'raw', portion: { g: 100, label: '⅓ cucumber' }, gluten: 'naturally-gf',
    n: { kcal: 15, protein: 0.65, carbs: 3.1, fibre: 0.5, potassium: 147, vitK: 16.4, vitC: 2.8 },
    gut: 'Very gentle.', notes: ['Mostly water — useful for volume and hydration, not for nutrients.'],
  }),
  food({
    id: 'garlic', name: 'Garlic', category: 'veg', basis: 'raw', portion: { g: 6, label: '2 cloves' }, gluten: 'naturally-gf',
    n: { kcal: 149, protein: 6.4, carbs: 31, fibre: 2.1, fat: 0.5, vitC: 31, potassium: 401, calcium: 181, selenium: 14.2 },
    polyphenols: 'moderate',
    notes: ['Crushing and resting garlic for ~10 minutes before cooking lets allicin form.', 'Garlic supplements lower blood pressure modestly in people with hypertension; culinary amounts are flavour, not treatment.'],
    gut: 'Very high in fructans — a classic bloating trigger. Garlic-infused oil gives the flavour without the fructans, which are not fat-soluble.',
  }),

  // ── Fruit ─────────────────────────────────────────────────────────────
  food({
    id: 'blueberries', name: 'Blueberries', category: 'fruit', basis: 'raw', portion: { g: 100, label: '1 large handful' }, gluten: 'naturally-gf',
    n: { kcal: 57, protein: 0.74, carbs: 12.1, fibre: 2.4, fat: 0.33, potassium: 77, magnesium: 6, vitC: 9.7, vitK: 19.3, vitE: 0.57 },
    polyphenols: 'high', gi: 'low',
    notes: ['A 6-month RCT found a cup a day improved endothelial function and cholesterol markers in adults with metabolic syndrome — real, modest, and in a different population from you.', 'Frozen are nutritionally equivalent and far cheaper.'],
  }),
  food({
    id: 'strawberries', name: 'Strawberries', category: 'fruit', basis: 'raw', portion: { g: 150, label: '~10 berries' }, gluten: 'naturally-gf',
    n: { kcal: 32, protein: 0.67, carbs: 5.7, fibre: 2.0, fat: 0.3, potassium: 153, magnesium: 13, vitC: 58.8, folate: 24 },
    polyphenols: 'high', gi: 'low', notes: ['A portion covers twice the UK daily vitamin C reference — ideal with plant-iron foods like oats.'],
  }),
  food({
    id: 'raspberries', name: 'Raspberries', category: 'fruit', basis: 'raw', portion: { g: 100, label: '1 punnet (part)' }, gluten: 'naturally-gf',
    n: { kcal: 52, protein: 1.2, carbs: 5.4, fibre: 6.5, fat: 0.65, potassium: 151, magnesium: 22, vitC: 26.2, folate: 21, vitK: 7.8 },
    polyphenols: 'high', gi: 'low', notes: ['One of the highest-fibre fruits.'],
  }),
  food({
    id: 'grapes', name: 'Grapes, red', category: 'fruit', basis: 'raw', portion: { g: 100, label: '1 bunch (small)' }, gluten: 'naturally-gf',
    n: { kcal: 69, protein: 0.72, carbs: 17.2, fibre: 0.9, fat: 0.16, potassium: 191, vitC: 3.2, vitK: 14.6 },
    polyphenols: 'moderate', gi: 'medium',
    notes: ['The resveratrol in grapes is tiny compared with doses used in lab studies — enjoy them as fruit, not as an anti-ageing intervention.', 'Handy fast carbohydrate around training.'],
  }),
  food({
    id: 'banana', name: 'Banana', category: 'fruit', basis: 'raw', portion: { g: 120, label: '1 medium' }, gluten: 'naturally-gf',
    n: { kcal: 89, protein: 1.09, carbs: 20.2, fibre: 2.6, fat: 0.33, potassium: 358, magnesium: 27, vitC: 8.7, folate: 20 },
    gi: 'medium', notes: ['The classic pre-run carbohydrate: easy to digest 30–90 minutes before.'],
    gut: 'Riper bananas contain more fructans; firmer ones are often easier on sensitive guts.',
  }),
  food({
    id: 'orange', name: 'Orange', category: 'fruit', basis: 'raw', portion: { g: 140, label: '1 medium' }, gluten: 'naturally-gf',
    n: { kcal: 47, protein: 0.94, carbs: 9.4, fibre: 2.4, fat: 0.12, calcium: 40, potassium: 181, vitC: 53.2, folate: 30 },
    polyphenols: 'moderate', gi: 'low', notes: ['Whole fruit keeps the fibre that juice loses.'],
  }),
  food({
    id: 'kiwi', name: 'Kiwi', category: 'fruit', basis: 'raw', portion: { g: 75, label: '1 fruit' }, gluten: 'naturally-gf',
    n: { kcal: 61, protein: 1.14, carbs: 11.7, fibre: 3.0, fat: 0.52, potassium: 312, vitC: 92.7, vitK: 40.3, vitE: 1.46, folate: 25 },
    gi: 'low', notes: ['Very high vitamin C; two a day modestly helps bowel regularity in trials.'],
  }),
  food({
    id: 'apple', name: 'Apple', category: 'fruit', basis: 'raw', portion: { g: 150, label: '1 medium' }, gluten: 'naturally-gf',
    n: { kcal: 52, protein: 0.26, carbs: 11.4, fibre: 2.4, fat: 0.17, potassium: 107, vitC: 4.6 },
    polyphenols: 'moderate', gi: 'low', notes: ['Most of the polyphenols are in the skin.'],
    gut: 'High in fructose and sorbitol — a common trigger for sensitive guts.',
  }),
  food({
    id: 'dates', name: 'Medjool dates', category: 'fruit', basis: 'raw', portion: { g: 48, label: '2 dates' }, gluten: 'naturally-gf',
    n: { kcal: 277, protein: 1.81, carbs: 68, fibre: 6.7, fat: 0.15, iron: 0.9, magnesium: 54, potassium: 696 },
    gi: 'medium', notes: ['Compact carbohydrate for long sessions or a pre-run top-up.'],
    gut: 'High in fructans; may cause bloating in sensitive people.',
  }),
  food({
    id: 'avocado', name: 'Avocado', category: 'fruit', basis: 'raw', portion: { g: 70, label: '½ avocado' }, gluten: 'naturally-gf',
    n: { kcal: 160, protein: 2.0, carbs: 1.8, fibre: 6.7, fat: 14.7, satFat: 2.1, iron: 0.55, zinc: 0.64, magnesium: 29, potassium: 485, folate: 81, vitC: 10, vitK: 21, vitE: 2.07 },
    notes: ['Mostly monounsaturated fat. Adding avocado to a salad substantially increases absorption of the carotenoids in the other vegetables.'],
    gut: 'Contains sorbitol; small portions are usually fine, large ones less so.',
  }),

  // ── Nuts & seeds ──────────────────────────────────────────────────────
  food({
    id: 'walnuts', name: 'Walnuts', category: 'nuts-seeds', basis: 'raw', portion: { g: 30, label: '1 small handful' }, gluten: 'check-label',
    n: { kcal: 654, protein: 15.2, carbs: 7.0, fibre: 6.7, fat: 65.2, satFat: 6.1, leucine: 1.17, iron: 2.91, zinc: 3.09, calcium: 98, magnesium: 158, potassium: 441, selenium: 4.9, ala: 9.08, folate: 98, vitE: 0.7 },
    proteinQuality: 'low', ironType: 'non-haem', polyphenols: 'high',
    notes: ['The richest nut source of ALA omega-3 — but the body converts only a small fraction of ALA to EPA and very little to DHA, so it does not replace oily fish.', 'Nut intake is consistently associated with lower cardiovascular risk; the PREDIMED trial supports nuts within a Mediterranean pattern.'],
  }),
  food({
    id: 'hazelnuts', name: 'Hazelnuts', category: 'nuts-seeds', basis: 'raw', portion: { g: 30, label: '1 small handful' }, gluten: 'check-label',
    n: { kcal: 628, protein: 15.0, carbs: 7.0, fibre: 9.7, fat: 60.8, satFat: 4.5, leucine: 1.06, iron: 4.7, zinc: 2.45, calcium: 114, magnesium: 163, potassium: 680, selenium: 2.4, ala: 0.09, folate: 113, vitE: 15.0, vitK: 14.2 },
    proteinQuality: 'low', ironType: 'non-haem', polyphenols: 'moderate',
    notes: ['A 30 g handful supplies over a third of a day’s vitamin E.'],
  }),
  food({
    id: 'almonds', name: 'Almonds', category: 'nuts-seeds', basis: 'raw', portion: { g: 30, label: '~23 almonds' }, gluten: 'check-label',
    n: { kcal: 579, protein: 21.2, carbs: 9.1, fibre: 12.5, fat: 49.9, satFat: 3.8, leucine: 1.47, iron: 3.71, zinc: 3.12, calcium: 269, magnesium: 270, potassium: 733, selenium: 4.1, vitE: 25.6, folate: 44 },
    proteinQuality: 'low', ironType: 'non-haem', polyphenols: 'moderate',
    notes: ['The highest vitamin E and magnesium of the common nuts.'],
    gut: 'Contains galacto-oligosaccharides (the same fermentable carbohydrate as lentils) — around 10 almonds is usually tolerated; a big handful may not be.',
  }),
  food({
    id: 'brazil-nuts', name: 'Brazil nuts', category: 'nuts-seeds', basis: 'raw', portion: { g: 10, label: '2 nuts' }, gluten: 'check-label',
    n: { kcal: 659, protein: 14.3, carbs: 4.2, fibre: 7.5, fat: 67.1, satFat: 15.1, leucine: 1.16, iron: 2.43, zinc: 4.06, calcium: 160, magnesium: 376, potassium: 659, selenium: 1917, vitE: 5.65 },
    proteinQuality: 'low', ironType: 'non-haem',
    notes: ['Selenium content varies many-fold with the soil the tree grew in; one or two nuts typically meets the daily need.'],
    caution: 'More than a few a day, every day, can exceed safe upper limits for selenium. One or two is the useful dose.',
  }),
  food({
    id: 'pumpkin-seeds', name: 'Pumpkin seeds', category: 'nuts-seeds', basis: 'raw', portion: { g: 25, label: '2 tbsp' }, gluten: 'check-label',
    n: { kcal: 559, protein: 30.2, carbs: 4.7, fibre: 6.0, fat: 49.1, satFat: 8.7, leucine: 2.42, iron: 8.82, zinc: 7.81, calcium: 46, magnesium: 592, potassium: 809, selenium: 9.4, ala: 0.12, vitK: 7.3 },
    proteinQuality: 'moderate', ironType: 'non-haem',
    notes: ['The best plant source of zinc and magnesium here; a sprinkle covers a large share of daily magnesium.'],
  }),
  food({
    id: 'chia', name: 'Chia seeds', category: 'nuts-seeds', basis: 'raw', portion: { g: 15, label: '1 tbsp' }, gluten: 'check-label',
    n: { kcal: 486, protein: 16.5, carbs: 7.7, fibre: 34.4, fat: 30.7, satFat: 3.3, leucine: 1.37, iron: 7.72, zinc: 4.58, calcium: 631, magnesium: 335, potassium: 407, selenium: 55.2, ala: 17.8 },
    proteinQuality: 'moderate', ironType: 'non-haem', notes: ['Very high fibre; absorbs ~10× its weight in water — introduce gradually with plenty of fluid.'],
    gut: 'Large amounts can be gassy.',
  }),
  food({
    id: 'flaxseed', name: 'Flaxseed, ground', category: 'nuts-seeds', basis: 'raw', portion: { g: 10, label: '1 tbsp' }, gluten: 'check-label',
    n: { kcal: 534, protein: 18.3, carbs: 1.6, fibre: 27.3, fat: 42.2, satFat: 3.7, leucine: 1.24, iron: 5.73, zinc: 4.34, calcium: 255, magnesium: 392, potassium: 813, selenium: 25.4, ala: 22.8 },
    proteinQuality: 'moderate', ironType: 'non-haem', notes: ['Must be ground — whole flaxseeds pass through largely undigested.'],
  }),
  food({
    id: 'peanut-butter', name: 'Peanut butter (100% peanuts)', category: 'nuts-seeds', basis: 'as-sold', portion: { g: 20, label: '1 heaped tbsp' }, gluten: 'check-label',
    n: { kcal: 588, protein: 25.1, carbs: 14.2, fibre: 6.0, fat: 50.4, satFat: 10.3, leucine: 1.63, iron: 1.9, zinc: 2.9, calcium: 43, magnesium: 154, potassium: 649, selenium: 4.1, vitE: 9.0, folate: 87 },
    proteinQuality: 'moderate', limitingAminoAcid: 'methionine', ironType: 'non-haem', notes: ['Energy-dense — useful when you need to eat more without more volume.'],
  }),

  // ── Legumes & soya ────────────────────────────────────────────────────
  food({
    id: 'lentils', name: 'Lentils', category: 'legumes', basis: 'dry', portion: { g: 60, label: '60 g dry' }, gluten: 'check-label',
    n: { kcal: 352, protein: 24.6, carbs: 52.6, fibre: 10.7, fat: 1.06, leucine: 1.79, iron: 6.51, zinc: 3.27, calcium: 35, magnesium: 47, potassium: 677, folate: 479 },
    proteinQuality: 'moderate', limitingAminoAcid: 'methionine', ironType: 'non-haem', gi: 'low',
    notes: ['Nutritionally excellent (fibre, folate, plant protein) — but nutritional value is wasted if your gut rejects it.'],
    gut: 'Rich in galacto-oligosaccharides (GOS), fermented by gut bacteria into gas. Tinned, well-rinsed lentils contain less GOS than dried — if you ever retest, start with a few spoonfuls of tinned.',
  }),
  food({
    id: 'chickpeas-tin', name: 'Chickpeas, tinned (drained)', category: 'legumes', basis: 'drained', portion: { g: 80, label: '½ tin drained' }, gluten: 'naturally-gf',
    n: { kcal: 139, protein: 7.05, carbs: 14.9, fibre: 7.6, fat: 2.77, leucine: 0.5, iron: 1.3, zinc: 0.9, calcium: 43, magnesium: 29, potassium: 172, folate: 59 },
    proteinQuality: 'moderate', limitingAminoAcid: 'methionine', ironType: 'non-haem', gi: 'low',
    notes: ['Good fibre and plant protein.'],
    gut: 'Same GOS family as lentils. Small portions of rinsed tinned chickpeas are tolerated by many people who cannot manage dried ones.',
  }),
  food({
    id: 'tofu-firm', name: 'Tofu, firm (calcium-set)', category: 'legumes', basis: 'as-sold', portion: { g: 150, label: '½ block' }, gluten: 'check-label',
    n: { kcal: 144, protein: 17.3, carbs: 1.9, fibre: 2.3, fat: 8.72, satFat: 1.26, leucine: 1.3, iron: 2.66, zinc: 1.57, calcium: 683, magnesium: 58, potassium: 237, selenium: 17.4, ala: 0.58 },
    proteinQuality: 'high', ironType: 'non-haem',
    notes: ['Calcium-set tofu (look for calcium sulphate on the label) is one of the best non-dairy calcium sources.'],
    gut: 'Pressing tofu removes much of the soya’s fermentable carbohydrate with the whey, so firm tofu is often tolerated even when beans and lentils are not.',
  }),

  // ── Oils & fats ───────────────────────────────────────────────────────
  food({
    id: 'olive-oil', name: 'Extra virgin olive oil', category: 'fats', basis: 'as-sold', portion: { g: 10, label: '2 tsp' }, gluten: 'naturally-gf',
    n: { kcal: 884, fat: 100, satFat: 13.8, vitE: 14.4, vitK: 60.2 },
    polyphenols: 'high',
    notes: [
      'The fat at the centre of the PREDIMED trial, where a Mediterranean diet with extra virgin olive oil reduced major cardiovascular events versus a lower-fat control diet.',
      'Its polyphenols carry an authorised EU/UK health claim for protecting blood lipids from oxidative damage (at ~20 g a day of a qualifying oil).',
      'Fine for normal cooking temperatures; adding it to vegetables improves absorption of their fat-soluble vitamins and carotenoids.',
    ],
  }),
  food({
    id: 'butter', name: 'Butter', category: 'fats', basis: 'as-sold', portion: { g: 10, label: '1 tsp' }, gluten: 'naturally-gf',
    n: { kcal: 717, protein: 0.85, carbs: 0.06, fat: 81.1, satFat: 51.4, vitA: 684, vitE: 2.32, vitD: 1.5, calcium: 24 },
    notes: ['High in saturated fat; UK guidance (SACN, 2019) is to keep saturated fat under ~10% of energy and replace it with unsaturated fats where you can.'],
  }),

  // ── Drinks & other ────────────────────────────────────────────────────
  food({
    id: 'dark-chocolate', name: 'Dark chocolate, 70–85%', category: 'drinks-other', basis: 'as-sold', portion: { g: 20, label: '2 squares' }, gluten: 'check-label',
    n: { kcal: 598, protein: 7.8, carbs: 34.9, fibre: 10.9, fat: 42.6, satFat: 24.5, leucine: 0.5, iron: 11.9, zinc: 3.31, calcium: 73, magnesium: 228, potassium: 715, selenium: 6.8 },
    ironType: 'non-haem', polyphenols: 'high',
    notes: ['Flavanol content depends heavily on processing; most is lost in alkalised (“Dutch-processed”) cocoa.', 'The large COSMOS trial of cocoa-flavanol supplements did not significantly reduce total cardiovascular events (its primary outcome), though cardiovascular deaths were lower — a hint, not proof.'],
    caution: 'Many chocolates carry “may contain wheat” warnings — check the label.',
  }),
  food({
    id: 'honey', name: 'Honey', category: 'drinks-other', basis: 'as-sold', portion: { g: 15, label: '1 tbsp' }, gluten: 'naturally-gf',
    n: { kcal: 304, protein: 0.3, carbs: 82.1, fibre: 0.2, potassium: 52 },
    gi: 'medium', notes: ['Sugar with a trace of everything else — useful as fuel around training, not as a health food.'], gut: 'High in excess fructose; some sensitive guts react.',
  }),
  food({
    id: 'coffee', name: 'Coffee, brewed', category: 'drinks-other', basis: 'as-sold', portion: { g: 250, label: '1 mug' }, gluten: 'naturally-gf',
    n: { kcal: 1, protein: 0.1, potassium: 49, magnesium: 3 },
    polyphenols: 'high',
    notes: [
      'Caffeine (about 3 mg/kg, taken ~60 minutes before) reliably improves endurance and repeated-sprint performance.',
      'Caffeine has a half-life of roughly 5 hours; even 6 hours before bed it measurably disrupts sleep.',
      'Coffee and tea polyphenols reduce absorption of plant iron — drink them between meals rather than with an iron-rich meal.',
    ],
  }),
  food({
    id: 'green-tea', name: 'Green tea', category: 'drinks-other', basis: 'as-sold', portion: { g: 250, label: '1 mug' }, gluten: 'naturally-gf',
    n: { kcal: 1 },
    polyphenols: 'high', notes: ['Rich in catechins (EGCG). Drinking tea is fine; high-dose green-tea extract supplements have been linked to liver injury.'],
  }),
  food({
    id: 'sauerkraut', name: 'Sauerkraut (unpasteurised)', category: 'drinks-other', basis: 'as-sold', portion: { g: 30, label: '1 heaped tbsp' }, gluten: 'naturally-gf',
    n: { kcal: 19, protein: 0.9, carbs: 1.4, fibre: 2.9, fat: 0.14, vitC: 14.7, vitK: 13, potassium: 170 },
    notes: ['Only unpasteurised (chilled) sauerkraut keeps live cultures.', 'Salty — a tablespoon is a condiment, not a portion of veg.'],
    gut: 'Made from cabbage; small amounts are usually tolerated, but it is a brassica.',
  }),
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

/** UK Reference Nutrient Intakes for men aged 19–50 (DH, 1991; SACN for fibre and vitamin D). */
export const RNI: Partial<Record<keyof Nutrients, { value: number; unit: string; label: string }>> = {
  fibre: { value: 30, unit: 'g', label: 'Fibre' },
  iron: { value: 8.7, unit: 'mg', label: 'Iron' },
  zinc: { value: 9.5, unit: 'mg', label: 'Zinc' },
  calcium: { value: 700, unit: 'mg', label: 'Calcium' },
  magnesium: { value: 300, unit: 'mg', label: 'Magnesium' },
  potassium: { value: 3500, unit: 'mg', label: 'Potassium' },
  selenium: { value: 75, unit: 'µg', label: 'Selenium' },
  vitD: { value: 10, unit: 'µg', label: 'Vitamin D' },
  b12: { value: 1.5, unit: 'µg', label: 'Vitamin B12' },
  folate: { value: 200, unit: 'µg', label: 'Folate' },
  vitC: { value: 40, unit: 'mg', label: 'Vitamin C' },
  vitA: { value: 700, unit: 'µg', label: 'Vitamin A' },
};

export const GLUTEN_LABEL: Record<Gluten, string> = {
  'naturally-gf': 'Naturally gluten-free',
  'certified-gf-needed': 'Buy certified GF only',
  'check-label': 'Check label (cross-contact)',
  'contains-gluten': 'Contains gluten',
};
