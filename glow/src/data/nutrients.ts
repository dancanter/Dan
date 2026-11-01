// Nutrient metadata: units, Dan's daily targets, safe upper limits, and what
// each nutrient actually does, in plain English.
//
// Targets: where UK reference nutrient intakes (RNIs) and the European Food
// Safety Authority's population reference intakes differ, the higher EFSA
// value is used, because a hard-training athlete in an energy deficit sits at
// the top end of need. Upper limits are EFSA tolerable upper intake levels
// (the most you can take daily for years without risk).

export const NUTRIENT_KEYS = [
  'kcal', 'protein', 'carbs', 'fibre', 'sugar', 'fat', 'satFat', 'omega3',
  'vitA', 'vitC', 'vitD', 'vitE', 'vitK', 'b2', 'folate', 'b12', 'choline',
  'iron', 'zinc', 'copper', 'selenium', 'magnesium', 'potassium', 'calcium', 'iodine', 'sodium',
] as const;

export type NKey = (typeof NUTRIENT_KEYS)[number];
export type Nutrients = Record<NKey, number>;

/** The micronutrients that count towards coverage and density scores. Sodium is tracked as a limit instead. */
export const MICROS: NKey[] = [
  'vitA', 'vitC', 'vitD', 'vitE', 'vitK', 'b2', 'folate', 'b12', 'choline',
  'iron', 'zinc', 'copper', 'selenium', 'magnesium', 'potassium', 'calcium', 'iodine',
];

export interface NutrientInfo {
  label: string;
  unit: string;
  /** Daily target (for protein this is replaced by grams per kg of body weight). */
  target: number;
  /** EFSA tolerable upper intake level, where one exists and food can plausibly reach it. */
  upper?: number;
  upperNote?: string;
  /** What it does, in plain words. */
  does: string;
  /** Why it matters for looking and feeling good. */
  glow?: string;
}

export const NUTRIENTS: Record<NKey, NutrientInfo> = {
  kcal: { label: 'Energy', unit: 'kcal', target: 1799, does: 'Fuel. Every process on this list needs enough of it first.' },
  protein: { label: 'Protein', unit: 'g', target: 115, does: 'Builds and repairs muscle, skin, hair, enzymes and hormones.', glow: 'Collagen, keratin (hair, nails) and muscle are all protein.' },
  carbs: { label: 'Carbohydrate', unit: 'g', target: 180, does: 'The main fuel for fast running and hard lifting. It is stored as glycogen in muscle and liver.' },
  fibre: { label: 'Fibre', unit: 'g', target: 30, does: 'Feeds the gut bacteria that make short-chain fatty acids (anti-inflammatory signals), steadies blood sugar and lowers LDL cholesterol.', glow: 'A healthier gut is linked with calmer, less inflamed skin (early-stage research).' },
  sugar: { label: 'Free sugars', unit: 'g', target: 30, does: 'Sugars added to food plus those in honey, syrups and juice. The UK limit is 30 g a day.' },
  fat: { label: 'Fat', unit: 'g', target: 55, does: 'Needed to absorb vitamins A, D, E and K and to make steroid hormones, including testosterone.' },
  satFat: { label: 'Saturated fat', unit: 'g', target: 20, does: 'The fat that raises LDL cholesterol most. The UK guideline is under 10% of energy.' },
  omega3: { label: 'Omega-3 (EPA+DHA)', unit: 'g', target: 0.5, does: 'Long-chain fats from fish built into every cell membrane. They become resolvins, signals that switch inflammation off once it has done its job.', glow: 'Linked with better skin barrier and hydration and less UV-induced redness.' },
  vitA: { label: 'Vitamin A', unit: 'µg', target: 700, upper: 3000, upperNote: 'The upper limit applies to retinol (from animal foods and supplements). Beta-carotene from plants cannot cause toxicity.', does: 'Controls how skin cells grow and renew, plus vision and immunity. Retinol skincare is a form of this vitamin.', glow: 'Skin turnover and repair.' },
  vitC: { label: 'Vitamin C', unit: 'mg', target: 110, does: 'An essential cofactor for collagen synthesis and a water-soluble antioxidant. It also boosts plant-iron absorption.', glow: 'Without it you can’t build collagen.' },
  vitD: { label: 'Vitamin D', unit: 'µg', target: 15, upper: 100, does: 'Really a hormone. It regulates calcium, bone, muscle function and immunity. UK sunlight can’t make it from October to March, so the NHS advises 10 µg a day then.' },
  vitE: { label: 'Vitamin E', unit: 'mg', target: 13, does: 'A fat-soluble antioxidant that protects cell membranes, including in skin, from oxidation.', glow: 'Protects skin fats from UV-driven oxidation.' },
  vitK: { label: 'Vitamin K', unit: 'µg', target: 70, does: 'Activates proteins that clot blood and direct calcium into bone (and away from arteries).' },
  b2: { label: 'Riboflavin (B2)', unit: 'mg', target: 1.6, does: 'Forms FAD, a molecule your mitochondria need to turn food into energy. Needs rise with training.' },
  folate: { label: 'Folate', unit: 'µg', target: 330, does: 'Needed to copy DNA and for methylation (tagging DNA to switch genes on and off). Low folate leaves DNA more prone to damage.' },
  b12: { label: 'Vitamin B12', unit: 'µg', target: 4, does: 'Makes red blood cells, protects nerves and works with folate in methylation. Found naturally only in animal foods.' },
  choline: { label: 'Choline', unit: 'mg', target: 400, does: 'Builds cell membranes and acetylcholine (a messenger for memory and muscle control), and clears fat from the liver.' },
  iron: { label: 'Iron', unit: 'mg', target: 11, does: 'Carries oxygen in red blood cells and sits at the heart of the mitochondrial energy chain. Runners lose extra through foot-strike and sweat.', glow: 'Low iron shows as pallor, fatigue and dark circles.' },
  zinc: { label: 'Zinc', unit: 'mg', target: 11, upper: 25, upperNote: 'EFSA’s limit is 25 mg (the US limit is 40 mg). Long-term excess blocks copper absorption.', does: 'Needed by over 300 enzymes: testosterone production, immune function, wound healing and DNA repair.', glow: 'Skin healing, acne control and hair.' },
  copper: { label: 'Copper', unit: 'mg', target: 1.6, upper: 5, does: 'Cross-links collagen and elastin so skin keeps its structure, and helps make energy and absorb iron.', glow: 'Collagen cross-linking and pigment.' },
  selenium: { label: 'Selenium', unit: 'µg', target: 75, upper: 255, upperNote: 'EFSA lowered the upper limit to 255 µg in 2023. Brazil nuts reach it fast.', does: 'Builds glutathione peroxidase, one of your main antioxidant enzymes, and converts thyroid hormone into its active form.' },
  magnesium: { label: 'Magnesium', unit: 'mg', target: 350, does: 'Involved in over 300 reactions, including every one that uses ATP (cellular energy). It also supports muscle relaxation and sleep quality.' },
  potassium: { label: 'Potassium', unit: 'mg', target: 3500, does: 'Balances sodium to control blood pressure and fluid, and keeps nerves and muscles firing.', glow: 'Getting enough (against your sodium intake) helps with facial puffiness.' },
  calcium: { label: 'Calcium', unit: 'mg', target: 1000, does: 'Builds bone and drives muscle contraction. Bone density matters more if you’re in an energy deficit.' },
  iodine: { label: 'Iodine', unit: 'µg', target: 150, upper: 600, does: 'The raw material of thyroid hormone, which sets your metabolic rate. Mainly from milk, fish and eggs in the UK.' },
  sodium: { label: 'Sodium', unit: 'mg', target: 2400, does: 'An electrolyte you lose in sweat. The general limit is 2.4 g (6 g salt), but heavy training raises needs. A big rise above your usual intake causes next-day puffiness.' },
};

export function format(key: NKey, v: number): string {
  const unit = NUTRIENTS[key].unit;
  const digits = v >= 100 ? 0 : v >= 10 ? 0 : v >= 1 ? 1 : 2;
  return `${v.toFixed(digits)} ${unit}`;
}
