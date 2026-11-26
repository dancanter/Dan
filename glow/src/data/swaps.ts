import { isAvoided } from '@/data/avoid';
import { FOOD_BY_ID, type Food } from './foods';

// Swaps for foods you actually eat. Each one says how much it really
// matters, so you only change what's worth changing. "Small" means keep
// it if you love it: enjoying your food and sticking with the plan beats a
// marginal gain.

export type Gain = 'big' | 'medium' | 'small';

export interface Swap {
  from: string;
  to: string[];
  gain: Gain;
  why: string;
  /** When the swap isn't worth it, or when to keep the original. */
  keep?: string;
  /** Only offered in bloat-prone mode: a lower-FODMAP alternative. */
  bloat?: boolean;
}

export const SWAPS: Swap[] = [
  // Drinks
  { from: 'uk-squash', to: ['water', 'kombucha'], gain: 'medium', why: 'Sparkling or still water with fresh lemon, lime, cucumber or mint, or a herbal tea. You keep the flavour habit without all-day acid on your teeth, and no sweetener.' },
  { from: 'diet-cola', to: ['water'], gain: 'medium', why: 'Removes phosphoric acid (hard on enamel) and sweeteners. Sparkling water with lime keeps the fizz.' },
  { from: 'cola', to: ['water'], gain: 'big', why: '35 g of free sugar a can, gone. That’s glycation, teeth and empty calories on a cut.' },
  { from: 'energy-drink', to: ['coffee'], gain: 'big', why: 'Black coffee gives the caffeine without the sugar and additives.' },
  { from: 'oj', to: ['orange', 'kiwi'], gain: 'medium', why: 'The whole fruit keeps the fibre and fills you up. Two kiwis beat orange juice for vitamin C.' },
  { from: 'uk-lucozade', to: ['banana', 'dates'], gain: 'medium', why: 'For pre-run fuel, a banana or two dates do the same job with potassium and fibre.' },
  { from: 'wine', to: ['kombucha', 'water'], gain: 'big', why: 'Alcohol is the biggest single hit to sleep, skin and recovery. Kombucha or sparkling water with bitters in a wine glass keeps the ritual.' },
  { from: 'uk-oat-milk', to: ['milk-semi', 'uk-soya-milk'], gain: 'medium', why: 'Dairy or soya milk has about 8× the protein. Oat milk is mostly water and oat sugar, and usually isn’t certified gluten-free.', keep: 'In coffee only? It barely matters.' },
  // Fats
  { from: 'beef-tallow', to: ['avocado-oil', 'rapeseed-oil'], gain: 'medium', why: 'Avocado and rapeseed oils are mostly unsaturated fat; rapeseed adds plant omega-3. Tallow is half saturated fat.', keep: 'Tallow for the odd very-high-heat sear is fine.' },
  { from: 'coconut-oil', to: ['avocado-oil', 'rapeseed-oil'], gain: 'medium', why: 'Coconut oil raises LDL more than plant oils. Avocado or rapeseed oil is the better everyday default.' },
  { from: 'sunflower-oil', to: ['rapeseed-oil', 'avocado-oil'], gain: 'small', why: 'Rapeseed adds plant omega-3; avocado oil is stable for high heat. Neither is a big deal for home cooking.' },
  // Protein
  { from: 'beef-mince-20', to: ['beef-mince-lean', 'uk-steak-mince'], gain: 'big', why: 'Same iron, zinc and B12 for about 120 kcal less per 100 g. On a cut, that’s free food.' },
  { from: 'lamb-mince', to: ['lamb-leg', 'venison'], gain: 'medium', why: 'Lean lamb or venison: same minerals, about half the calories.' },
  { from: 'bacon', to: ['eggs', 'venison', 'uk-back-bacon'], gain: 'big', why: 'Processed meat is a Group 1 carcinogen. Eggs or a lean fresh meat do the breakfast job.', keep: 'Back bacon is leaner than streaky but still processed: an occasional treat.' },
  { from: 'sausages', to: ['beef-mince-lean', 'chicken-thigh'], gain: 'big', why: 'Processed, usually contains rusk (gluten), and fattier. Make your own patties from lean mince with herbs.' },
  { from: 'chicken-breast', to: ['chicken-thigh', 'venison', 'salmon-wild'], gain: 'small', why: 'Thigh has about twice the iron and zinc. Venison and salmon bring more micronutrients per calorie.', keep: 'Breast is a great cutting protein. Rotate rather than replace.' },
  { from: 'tuna-tin', to: ['sardines', 'salmon-tinned', 'mackerel'], gain: 'medium', why: 'Small oily fish give 4–5× the omega-3, plus vitamin D and calcium, with less mercury.', keep: 'Tuna 2–3 times a week is fine for lean protein.' },
  { from: 'cod', to: ['mackerel', 'sardines', 'salmon-wild'], gain: 'small', why: 'Add oily fish 2–3 times a week for omega-3, rather than replacing white fish, which is excellent lean protein and iodine.' },
  { from: 'uk-hake', to: ['mackerel', 'salmon-wild'], gain: 'small', why: 'Same as cod: keep hake, and make sure oily fish features 2–3 times a week.' },
  { from: 'salmon-farmed', to: ['salmon-wild', 'mackerel'], gain: 'small', why: 'Wild has fewer pollutants and more astaxanthin. Farmed actually has more omega-3, so both are good.', keep: 'Not worth stressing about.' },
  { from: 'protein-bar', to: ['greek-yogurt-0', 'skyr'], gain: 'medium', why: 'Greek yoghurt or skyr with berries: same protein, live cultures, no sugar alcohols (which bloat).' },
  { from: 'whey', to: ['greek-yogurt-0', 'eggs'], gain: 'small', why: 'Whole foods bring micronutrients. Whey is still a fine convenience top-up after training.', keep: 'One scoop after training is fine.' },
  // Carbs
  { from: 'white-rice', to: ['potato', 'basmati', 'buckwheat'], gain: 'small', why: 'Potatoes are the most filling carb per calorie, with more potassium for de-puffing. Basmati has a lower GI. Buckwheat adds magnesium and polyphenols.', keep: 'White rice around hard sessions is perfect fuel.' },
  { from: 'rice-cakes', to: ['uk-oatcakes-gf'], gain: 'small', why: 'GF oatcakes give a little more fibre per cake, so they’re more filling.' },
  { from: 'gf-bread', to: ['potato', 'uk-oatcakes-gf', 'buckwheat'], gain: 'medium', why: 'Most gluten-free bread is ultra-processed and unfortified. Potatoes or GF oatcakes are whole foods.', keep: 'A good GF sourdough loaf occasionally is fine.' },
  { from: 'granola', to: ['oats'], gain: 'big', why: 'Shop granola is about a quarter sugar. GF oats with berries and cinnamon are the upgrade.' },
  { from: 'cereal-sugary', to: ['oats', 'greek-yogurt'], gain: 'big', why: 'Sprayed-on vitamins and sugar. Oats or yoghurt bowls are real food.' },
  // Snacks and sweet
  { from: 'milk-choc', to: ['dark-choc-85'], gain: 'big', why: 'Half the sugar, many times the cocoa flavanols.' },
  { from: 'dark-choc-70', to: ['dark-choc-85'], gain: 'small', why: 'Less sugar and more flavanols, if you like the taste.', keep: 'The 70% is already good.' },
  { from: 'crisps', to: ['pistachios', 'olives'], gain: 'big', why: 'In-shell pistachios or olives scratch the salty itch with real fats and fibre, and no fried starch.' },
  { from: 'honey', to: ['blueberries', 'raspberries'], gain: 'small', why: 'Berries sweeten yoghurt with fibre and polyphenols instead of free sugar.', keep: 'A teaspoon is fine.' },
  { from: 'sweets', to: ['dates', 'raspberries'], gain: 'big', why: 'Two dates or frozen berries hit the sweet spot with fibre and potassium.' },
  { from: 'ice-cream', to: ['greek-yogurt', 'skyr'], gain: 'medium', why: 'Frozen yoghurt "bark" with berries and dark chocolate: protein instead of sugar.' },
  // Veg & fruit (these are already good)
  { from: 'blueberries', to: ['blackberries', 'raspberries'], gain: 'small', why: 'Rotate berries for different polyphenols. Frozen wild blueberries have about twice the anthocyanins of cultivated.', keep: 'Already one of the best foods there is.' },
  { from: 'coffee', to: ['water'], gain: 'small', why: 'After 2pm only: decaf or a herbal tea protects deep sleep.', keep: 'Coffee before 2pm is a genuine health food.' },
  { from: 'uk-sweetener-drops', to: ['cinnamon', 'blueberries'], gain: 'small', why: 'Cinnamon, vanilla, berries or 1 tsp raw honey sweeten without sweeteners, and gradually reset how sweet things need to be.' },
];

export const BLOAT_SWAPS: Swap[] = [
  { bloat: true, from: 'lentils', to: ['quinoa', 'potato', 'tofu'], gain: 'medium', why: 'Lentils are rich in GOS, a fermentable fibre that commonly causes gas. Quinoa, potatoes or firm tofu give the protein and carbs without it.', keep: 'Lentils are on your avoid list, so there is nothing to keep — potatoes, rice or quinoa give the same carbs without the gas.' },
  { bloat: true, from: 'chickpeas', to: ['quinoa', 'tofu', 'potato'], gain: 'medium', why: 'Chickpeas are high in GOS. Firm tofu (low-FODMAP) or quinoa swap in easily.', keep: 'A small portion of tinned, rinsed chickpeas (about 40 g) is usually tolerated.' },
  { bloat: true, from: 'black-beans', to: ['tofu', 'quinoa'], gain: 'medium', why: 'Beans are among the gassiest foods. Firm tofu or quinoa are gentler.' },
  { bloat: true, from: 'hummus', to: ['uk-guacamole', 'uk-tzatziki'], gain: 'small', why: 'Chickpeas and garlic make hummus a double FODMAP hit. A small spoon of guacamole or tzatziki is gentler (if lactose is fine for you).' },
  { bloat: true, from: 'uk-baked-beans', to: ['eggs', 'potato'], gain: 'medium', why: 'Beans in sauce, often with onion: a classic bloater.' },
  { bloat: true, from: 'onion', to: ['usda-11156'], gain: 'medium', why: 'Onion is the biggest fructan source in most diets. The green tops of spring onions, or chives and other herbs, give the flavour without the fructans.' },
  { bloat: true, from: 'garlic', to: ['usda-11156'], gain: 'medium', why: 'Garlic is a big fructan source. Chives, spring-onion tops, herbs and lemon carry flavour without it.' },
  { bloat: true, from: 'apple', to: ['kiwi', 'strawberries', 'orange'], gain: 'small', why: 'Apples are high in fructose and sorbitol. Kiwi, strawberries and oranges are low-FODMAP, and kiwi even helps regularity.' },
  { bloat: true, from: 'mango', to: ['pineapple', 'kiwi'], gain: 'small', why: 'Mango is high in excess fructose. Pineapple and kiwi are gentler.' },
  { bloat: true, from: 'watermelon', to: ['strawberries', 'orange'], gain: 'small', why: 'Watermelon is high in fructose and polyols.' },
  { bloat: true, from: 'mushrooms', to: ['courgette', 'aubergine'], gain: 'small', why: 'Mushrooms carry mannitol, a polyol that ferments. Courgette or aubergine fill the same role.' },
  { bloat: true, from: 'cauliflower', to: ['green-beans'], gain: 'small', why: 'Cauliflower is high in mannitol. Green beans are lower.' },
  { bloat: true, from: 'cashews', to: ['macadamia', 'walnuts'], gain: 'small', why: 'Cashews and pistachios are high-FODMAP nuts. Macadamias and walnuts are low.' },
  { bloat: true, from: 'pistachios', to: ['macadamia', 'walnuts'], gain: 'small', why: 'Pistachios are high-FODMAP. Macadamias and walnuts are low.' },
  { bloat: true, from: 'uk-kallo-lentil', to: ['rice-cakes', 'uk-oatcakes-gf'], gain: 'small', why: 'Lentil cakes contain lentil flour (GOS). If they bloat you, plain rice cakes or GF oatcakes are gentler.', keep: 'A couple of cakes is a small dose, so test how you feel with them.' },
  { bloat: true, from: 'artichoke', to: ['green-beans', 'courgette'], gain: 'small', why: 'Artichokes are very high in fructans.' },
  { bloat: true, from: 'asparagus', to: ['green-beans', 'courgette'], gain: 'small', why: 'Asparagus is high in fructans and fructose.' },
];

const BY_FROM = new Map(SWAPS.map((s) => [s.from, s]));
const BLOAT_BY_FROM = new Map(BLOAT_SWAPS.map((s) => [s.from, s]));

export function swapFor(food: Food, bloatProne = false): (Swap & { targets: Food[] }) | undefined {
  const id = food.id.replace(/^custom-/, '');
  const s = (bloatProne ? BLOAT_BY_FROM.get(id) : undefined) ?? BY_FROM.get(id);
  if (!s) return undefined;
  // never suggest a food on Dan's avoid list (data/avoid.ts)
  const targets = s.to.map((id) => FOOD_BY_ID.get(id)).filter((f): f is Food => !!f && !isAvoided(f));
  return targets.length ? { ...s, targets } : undefined;
}

export const GAIN_LABEL: Record<Gain, string> = { big: 'Big upgrade', medium: 'Worth it', small: 'Small gain: keep if you love it' };
