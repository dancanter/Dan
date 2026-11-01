// The food library. Every value is per 100 g of the food as it is weighed
// before cooking (raw meat and fish, dry grains and lentils), or per 100 ml
// for drinks. Values are typical figures compiled from USDA FoodData Central
// and UK McCance & Widdowson conventions (carbohydrate excludes fibre, as on
// UK labels). Real food varies by 10–20% (season, feed, breed, soil), so
// every number in the app is an estimate, and is shown as one.
//
// Row format (one food per line, fields split by ';'):
//   id ; name ; category ; NOVA group ; portion grams ; portion label ;
//   26 numbers ; tags ; note
//
// The 26 numbers, in order (| is only for readability):
//   kcal protein carbs fibre sugar fat satFat omega3(EPA+DHA g) |
//   vitA(µg RAE) vitC(mg) vitD(µg) vitE(mg) vitK(µg) B2(mg) folate(µg) B12(µg) choline(mg) |
//   iron(mg) zinc(mg) copper(mg) selenium(µg) magnesium(mg) potassium(mg) calcium(mg) iodine(µg) sodium(mg)
//
// Tags drive bioavailability adjustments, the cellular pillars and the
// warnings. They are listed and explained in TAGS below.

import { NUTRIENT_KEYS, type NKey, type Nutrients } from './nutrients';
import usda from './usda.json';
import { UK_RAW } from './ukFoods';

export type Category =
  | 'meat'
  | 'offal'
  | 'fish'
  | 'shellfish'
  | 'eggs'
  | 'dairy'
  | 'grains'
  | 'legumes'
  | 'veg'
  | 'fruit'
  | 'nuts'
  | 'fats'
  | 'herbs'
  | 'drinks'
  | 'treats';

export const CATEGORY_LABEL: Record<Category, string> = {
  meat: 'Meat',
  offal: 'Organ meats & broth',
  fish: 'Fish',
  shellfish: 'Shellfish & roe',
  eggs: 'Eggs',
  dairy: 'Dairy & fermented milk',
  grains: 'Grains, potatoes & starches',
  legumes: 'Beans, lentils & soya',
  veg: 'Vegetables',
  fruit: 'Fruit',
  nuts: 'Nuts & seeds',
  fats: 'Oils & fats',
  herbs: 'Herbs, spices & cacao',
  drinks: 'Drinks',
  treats: 'Ultra-processed & takeaway',
};

export const PLANT_CATEGORIES: Category[] = ['grains', 'legumes', 'veg', 'fruit', 'nuts', 'herbs'];

export type Tag =
  | 'haem' | 'phy' | 'oxa'
  | 'poly' | 'poly2' | 'carot' | 'lut' | 'sulf' | 'sperm' | 'ferm' | 'preb' | 'coll'
  | 'creat' | 'coq' | 'astax' | 'nitr' | 'ala' | 'mufa' | 'evoo' | 'lowgi' | 'highgi'
  | 'upf' | 'addsug' | 'juice' | 'procmeat' | 'fried' | 'alc' | 'trans' | 'merc' | 'merc2'
  | 'gluten' | 'oats' | 'caff' | 'retinol' | 'seHigh' | 'iodHigh' | 'raw';

export interface Food {
  id: string;
  name: string;
  category: Category;
  /** NOVA processing group: 1 unprocessed, 2 culinary ingredient, 3 processed, 4 ultra-processed. */
  nova: 1 | 2 | 3 | 4;
  portion: { g: number; label: string };
  n: Nutrients;
  tags: Tag[];
  note?: string;
  /** Where the food came from when it isn't in the built-in library. */
  source?: 'library' | 'uk' | 'usda' | 'custom' | 'openfoodfacts';
  /** Nutrients the source doesn't record: shown as "not recorded", never as zero. */
  unknown?: NKey[];
  /** Other names people search for (US names, cuts, preparations). */
  alias?: string;
  /** Imported foods often only carry macros; micronutrients are then unknown, not zero. */
  limitedData?: boolean;
}

const RAW = `
beef-mince-lean;Beef mince, 5% fat (butcher, grass-fed);meat;1;150;150 g;137 21.4 0 0 0 5 2.2 0.03 | 0 0 0.1 0.4 1 0.17 7 2.1 65 | 2.3 5.2 0.07 18 21 340 6 2 66;haem creat coq;Haem iron, zinc and B12 in their most absorbable forms. Grass-fed beef carries roughly twice the omega-3 and more CLA than grain-fed, but the absolute omega-3 is still small, so it does not replace oily fish.
beef-mince-20;Beef mince, 15–20% fat;meat;1;150;150 g;254 17.2 0 0 0 20 7.6 0.03 | 0 0 0.1 0.2 1.5 0.15 7 2.2 55 | 1.9 4.2 0.06 15 17 270 18 2 66;haem creat;Same minerals as lean mince with roughly double the calories, mostly from saturated fat. On a cut, 5% gives you the nutrients for far fewer calories.
sirloin;Sirloin steak (trimmed);meat;1;200;200 g steak;160 21.5 0 0 0 7.6 3 0.02 | 0 0 0.1 0.4 1.3 0.15 9 1.5 70 | 1.7 4 0.08 26 23 340 18 2 55;haem creat coq;Lean steak is one of the most nutrient-dense ways to get complete protein, creatine and zinc.
ribeye;Ribeye steak;meat;1;200;200 g steak;248 19 0 0 0 19 8 0.03 | 0 0 0.1 0.3 1.5 0.13 6 2.6 60 | 1.9 4.6 0.07 20 18 290 10 2 54;haem creat;Marbling makes it richer but adds about 90 kcal per 100 g over sirloin.
venison;Venison (wild);meat;1;150;150 g;120 23 0 0 0 2.4 0.9 0.04 | 0 0 0 0.2 0 0.48 4 3.2 70 | 3.4 2.1 0.25 9.7 23 318 5 2 51;haem creat coq;Wild game is very lean with more iron than beef. A superb cutting protein.
lamb-leg;Lamb leg (lean);meat;1;150;150 g;134 20.6 0 0 0 5.2 1.9 0.04 | 0 0 0.1 0.2 0 0.25 23 2.6 70 | 1.8 4.1 0.12 23 26 300 9 2 66;haem creat;Grass-fed by default in the UK, which is why lamb fat carries a little omega-3 and CLA.
lamb-mince;Lamb mince;meat;1;150;150 g;282 16.6 0 0 0 23.4 10.2 0.05 | 0 0 0.1 0.2 3.6 0.21 18 2.3 70 | 1.6 3.4 0.1 18.8 21 222 16 2 59;haem creat;
chicken-breast;Chicken breast, skinless;meat;1;150;1 breast;120 22.5 0 0 0 2.6 0.6 0.02 | 9 0 0.1 0.2 0 0.09 4 0.2 73 | 0.4 0.7 0.04 22.8 28 334 5 3 45;creat;Very protein-dense but low in iron and zinc compared with red meat. Pasture-raised birds carry slightly more omega-3.
chicken-thigh;Chicken thigh, skinless;meat;1;150;2 thighs;121 19.7 0 0 0 4.1 1 0.03 | 14 0 0.1 0.2 2 0.2 8 0.5 60 | 0.8 1.5 0.07 23 23 270 8 3 95;creat;Dark meat has about twice the iron and zinc of breast.
turkey-breast;Turkey breast;meat;1;150;150 g;114 23.7 0 0 0 1.5 0.4 0.01 | 0 0 0.1 0.1 0 0.12 6 0.4 65 | 0.6 1.2 0.04 25 28 300 5 3 50;creat;
pork-loin;Pork loin (lean);meat;1;150;150 g;143 21 0 0 0 5.9 2.1 0.02 | 2 0.6 0.5 0.2 0 0.25 0 0.6 80 | 0.8 1.8 0.07 34 26 360 6 2 50;creat;Exceptionally high in thiamin (vitamin B1), which turns carbohydrate into energy.
duck;Duck breast (meat only);meat;1;150;1 breast;132 18.3 0 0 0 6 2.3 0.03 | 24 5.8 0.1 0.7 2.8 0.27 25 0.4 53 | 2.4 1.9 0.23 13.9 19 271 11 2 74;haem creat;
beef-liver;Beef liver;offal;1;100;100 g (once a week);135 20.4 3.9 0 0 3.6 1.2 0.01 | 4970 1.3 1.2 0.4 3.1 2.76 290 59.3 333 | 4.9 4 9.8 39.7 18 313 5 3 69;haem retinol coq;Gram for gram the most nutrient-dense food there is: retinol (ready-made vitamin A, no conversion needed), B12, folate, copper, riboflavin and choline. Its strength is also its limit: 100 g carries more than the safe upper limit for vitamin A and nearly double the copper limit, so keep it to about one 100 g portion a week.
lamb-liver;Lamb liver;offal;1;100;100 g (once a week);139 20.4 1.8 0 0 5 1.9 0.1 | 7390 4 0.5 0.2 0 3.6 230 90 300 | 7.4 4.7 6.9 82 19 313 7 3 70;haem retinol coq;Even richer in vitamin A than beef liver. Once a week at most.
chicken-liver;Chicken liver;offal;1;100;100 g;119 16.9 0.7 0 0 4.8 1.6 0.05 | 3300 18 0 0.7 0 1.78 588 16.6 194 | 9 2.7 0.5 54.6 19 230 8 3 71;haem retinol;Milder than beef liver with the most folate of any meat and lots of iron. Still very high in vitamin A, so treat it like liver.
beef-heart;Beef heart;offal;1;150;150 g;112 17.7 0.1 0 0 3.9 1.4 0.01 | 0 2 0 0.2 0 0.91 3 8.6 0 | 4.3 1.7 0.4 21.8 21 287 7 0 98;haem coq creat;Heart muscle is the richest food source of CoQ10, a molecule your mitochondria use to make energy. It tastes like lean steak, with none of liver's vitamin A limit.
beef-kidney;Beef kidney;offal;1;100;100 g;99 17.4 0.3 0 0 3.1 0.9 0.03 | 419 9.4 1.1 0.2 0 2.84 98 27.5 0 | 4.6 1.9 0.4 141 17 262 13 0 182;haem coq;One of the best selenium and B12 foods. Selenium builds the enzymes that protect cells from oxidative damage.
bone-marrow;Bone marrow;offal;1;30;1 tbsp (30 g);786 6.7 0 0 0 84.4 37 0 | 0 0 0 0 0 0 0 0.5 0 | 0.7 0.3 0 0 2 30 3 0 20;coll;Mostly fat. Lovely flavour, but calorie-heavy and not especially rich in micronutrients.
bone-broth;Bone broth, homemade (per 100 ml);offal;1;300;1 mug (300 ml);15 3 0.4 0 0.2 0.4 0.1 0 | 0 0 0 0 0 0.03 2 0.1 4 | 0.2 0.1 0.01 1 2 50 4 1 150;coll;Provides glycine and proline, the amino acids that make up collagen. Whether drinking collagen reaches your skin is uncertain; trials of collagen peptides show modest skin elasticity gains, often industry-funded. Cheap, hydrating and fine to keep.
collagen-powder;Collagen peptides powder;offal;3;10;1 scoop (10 g);360 90 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 200;coll;An incomplete protein (no tryptophan), so it should not count much towards muscle-building protein. Modest, mostly industry-funded evidence for skin elasticity.
beef-tallow;Beef tallow (for cooking);fats;2;10;1 tbsp (10 g);902 0 0 0 0 100 50 0 | 0 0 0 2.7 0 0 0 0 0 | 0 0 0 0.2 0 0 0 0 0;;Heat-stable for cooking, but half saturated fat, which raises LDL cholesterol. Olive oil gives you the cooking fat plus polyphenols.
salmon-wild;Salmon, wild (sockeye);fish;1;150;1 fillet (150 g);131 22.3 0 0 0 4.7 0.8 0.86 | 58 0 11 1.2 0.1 0.15 7 4.9 79 | 0.5 0.4 0.06 32 29 367 7 20 75;astax creat;Wild salmon gets its red colour from astaxanthin, an antioxidant carotenoid from its diet of krill. It is leaner than farmed salmon and has fewer pollutants, but farmed often carries more total omega-3 per 100 g. Both count as oily fish.
salmon-farmed;Salmon, farmed (Atlantic);fish;1;150;1 fillet (150 g);208 20.4 0 0 0 13.4 3.1 1.97 | 58 3.9 11 3.5 0.5 0.16 26 3.2 78 | 0.3 0.4 0.05 24 27 363 9 15 59;astax creat;Fattier than wild, with about twice the EPA and DHA per 100 g. A good choice when wild isn't available.
salmon-tinned;Salmon, tinned pink (with bones);fish;3;100;1 small tin;139 23 0 0 0 5.5 1.3 1.3 | 22 0 17 0.5 0.3 0.2 15 4.4 90 | 0.8 0.9 0.08 33 30 300 200 20 380;astax creat;Wild-caught, cheap, and the soft bones add calcium. Mash the bones in.
sardines;Sardines in olive oil (drained);fish;3;90;1 tin drained;208 24.6 0 0 0 11.5 1.5 0.98 | 32 0 4.8 2 2.6 0.23 10 8.9 75 | 2.9 1.3 0.19 52.7 39 397 382 30 307;creat coq;Small fish sit low on the food chain, so they carry very little mercury. Omega-3, vitamin D, B12, selenium and calcium from the bones. Few foods do more.
mackerel;Mackerel (Atlantic);fish;1;150;1 fillet;205 18.6 0 0 0 13.9 3.3 2.3 | 50 0.4 16.1 1.5 5 0.31 1 8.7 65 | 1.6 0.6 0.07 44.1 76 314 12 50 90;creat coq;The UK's richest common source of EPA and DHA, with lots of vitamin D and B12. Atlantic mackerel is low in mercury (King mackerel is not).
anchovies;Anchovies (fresh);fish;1;60;60 g;131 20.4 0 0 0 4.8 1.3 1.45 | 15 0 1.7 0.6 0.1 0.26 9 0.6 85 | 3.3 1.7 0.21 36.5 41 383 147 30 104;creat;Tiny, low-mercury and high in omega-3. Tinned anchovies are very salty.
herring;Herring;fish;1;150;1 fillet;158 18 0 0 0 9 2 1.7 | 28 0.7 4.2 1.1 0.1 0.23 10 13.7 65 | 1.1 1 0.09 36.5 32 327 57 30 90;creat;
trout;Trout (rainbow);fish;1;150;1 fillet;141 19.9 0 0 0 6.2 1.8 0.98 | 73 2.9 15.9 2.3 0 0.08 12 4.2 65 | 0.3 0.5 0.03 12.6 27 377 67 15 51;astax creat;Counts as oily fish and is high in vitamin D.
cod;Cod;fish;1;150;1 fillet;82 17.8 0 0 0 0.7 0.1 0.18 | 12 1 0.9 0.6 0.1 0.07 7 0.9 65 | 0.4 0.5 0.03 33 32 413 16 110 54;;Very lean, one of the best iodine sources (iodine runs your thyroid hormones). White fish is not oily fish for omega-3.
haddock;Haddock;fish;1;150;1 fillet;74 16.3 0 0 0 0.5 0.1 0.17 | 17 0 0.5 0.4 0.1 0.04 12 1.2 65 | 0.2 0.3 0.03 30 21 286 14 140 213;;
seabass;Sea bass;fish;1;150;1 fillet;97 18.4 0 0 0 2 0.5 0.6 | 36 0 4 0.5 0 0.12 5 0.3 65 | 0.3 0.4 0.02 36.5 41 256 10 30 68;;
tuna-fresh;Tuna steak (yellowfin);fish;1;150;1 steak;109 24.4 0 0 0 0.5 0.2 0.25 | 18 0 1.7 0.2 0 0.05 2 2.1 65 | 0.8 0.4 0.04 91 35 441 4 20 45;merc creat;Very lean protein and selenium-rich, but bigger predatory fish carry more mercury. Fresh tuna does not count as oily fish in UK advice.
tuna-tin;Tuna, tinned in water;fish;3;110;1 tin drained;116 25.5 0 0 0 0.8 0.2 0.27 | 17 0 1.2 0.3 0 0.07 4 2.5 29 | 1.5 0.8 0.05 70.6 27 237 11 20 247;merc;Cheap lean protein. The canning removes most of the omega-3.
swordfish;Swordfish;fish;1;150;1 steak;144 19.7 0 0 0 6.7 1.8 0.9 | 36 1 13.9 2 0 0.1 2 1.6 65 | 0.4 0.7 0.1 56 27 288 4 20 81;merc2;NHS advice: no more than one portion a week because of mercury, which builds up in large predatory fish.
prawns;Prawns (raw);shellfish;1;120;120 g;85 20.1 0 0 0 0.5 0.1 0.25 | 0 0 0 1.3 0 0.02 19 1.1 81 | 0.5 1.3 0.26 38 35 264 64 35 119;astax;Lean protein with a little astaxanthin, iodine and selenium.
oysters;Oysters (rock/Pacific, raw);shellfish;1;120;6 oysters (~120 g);81 9.5 5 0 0 2.3 0.5 0.7 | 81 8 8 0.9 2 0.23 10 16 0 | 5.1 16.6 1.6 77 22 168 8 60 106;raw;The richest common food source of zinc, the mineral behind testosterone production, skin repair and immunity, plus B12, copper and selenium. Zinc varies hugely between species and seasons (some reach 50–90 mg per 100 g), so a dozen most days could push you past the 25 mg upper limit. Raw shellfish carry a small risk of norovirus.
mussels;Mussels;shellfish;1;150;150 g meat;86 11.9 3.7 0 0 2.2 0.4 0.44 | 48 8 0 0.6 0 0.21 42 12 65 | 4 1.6 0.09 44.8 34 320 26 140 286;;Farmed mussels are among the most sustainable animal foods there are: rich in B12, iron, iodine, selenium and some omega-3.
scallops;Scallops;shellfish;1;120;120 g;69 12.1 3.2 0 0 0.5 0.1 0.15 | 2 0 0 0 0 0.02 16 1.4 65 | 0.4 0.9 0.03 12.8 22 205 6 90 392;;
clams;Clams;shellfish;1;100;100 g meat;86 14.7 3.6 0 0 1 0.1 0.2 | 90 13 0 0 0 0.21 16 49.4 65 | 2.8 1.4 0.3 24.3 9 300 46 60 300;;One of the highest B12 foods on earth.
squid;Squid;shellfish;1;150;150 g;92 15.6 3.1 0 0 1.4 0.4 0.5 | 10 4.7 0 1.2 0 0.41 5 1.3 65 | 0.7 1.5 1.9 44.8 33 246 32 20 44;;Grilled is great. Fried calamari is a different food.
crab;Crab;shellfish;1;100;100 g;87 18.1 0 0 0 1.1 0.2 0.3 | 2 3 0 0 0 0.04 44 9 80 | 0.7 3.5 0.7 36.4 34 329 89 50 293;;
salmon-roe;Salmon roe (ikura);shellfish;1;30;1 tbsp heaped (30 g);250 29 2.9 0 0 14 3.2 3.3 | 180 0 9 7 0.6 0.6 80 20 400 | 0.6 1 0.1 40 20 220 20 30 1500;astax;Fish eggs are extraordinarily rich in omega-3 (much of it bound to phospholipids), choline and B12. Salty, so use as a topping. Values approximate.
cod-liver-oil;Cod liver oil;fats;2;5;1 tsp (5 ml);902 0 0 0 0 100 22.6 19 | 30000 0 250 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 0;retinol;One teaspoon gives about 1 g of EPA+DHA, 12 µg vitamin D and 1,500 µg vitamin A. Don't combine with liver in the same week, and not if you take vitamin A elsewhere.
eggs;Eggs, whole (pasture-raised);eggs;1;120;2 large eggs;143 12.6 0.7 0 0.4 9.5 3.1 0.05 | 160 0 2.5 1.05 0.3 0.46 47 0.89 294 | 1.75 1.29 0.07 30.7 12 138 56 50 142;lut retinol;The yolk carries choline (for brain cell membranes and liver fat processing), lutein (deposits in skin and eyes), vitamin D, B12 and iodine. Cooking roughly doubles the protein you absorb (about 91% vs 51% raw). For most people eggs move LDL cholesterol much less than saturated fat does.
duck-eggs;Duck eggs;eggs;1;70;1 duck egg;185 12.8 1.5 0 0.9 13.8 3.7 0.1 | 194 0 1.7 1.3 0.4 0.4 80 5.4 263 | 3.9 1.4 0.06 36.4 17 222 64 50 146;lut retinol;Richer than hen's eggs in B12 and iron.
quail-eggs;Quail eggs;eggs;1;50;5 quail eggs;158 13 0.4 0 0.4 11.1 3.6 0.1 | 156 0 1.4 1.1 0.3 0.79 66 1.6 263 | 3.7 1.5 0.06 32 13 132 64 50 141;lut retinol;
greek-yogurt;Greek yoghurt, full-fat plain;dairy;1;150;150 g;96 9 3.9 0 3.9 5 3.3 0 | 40 0 0.1 0.1 0.2 0.23 7 0.75 15 | 0.04 0.52 0.01 9.7 11 141 110 30 35;ferm retinol;Live cultures plus slow-digesting casein protein (good before bed). Straining concentrates the protein but loses some calcium into the whey.
greek-yogurt-0;Greek yoghurt, 0% fat plain;dairy;1;150;150 g;59 10.3 3.6 0 3.6 0.4 0.1 0 | 2 0 0 0 0 0.28 7 0.75 15 | 0.04 0.52 0.01 9.7 11 141 110 30 36;ferm;One of the most protein-dense foods per calorie. Very useful on a cut.
skyr;Skyr, plain;dairy;1;150;150 g;63 11 4 0 4 0.2 0.1 0 | 0 0 0 0 0 0.2 5 0.5 15 | 0.1 0.5 0.01 9 12 150 150 30 50;ferm;
kefir;Kefir, plain whole milk;dairy;1;200;1 glass (200 ml);63 3.4 4.5 0 4.5 3.5 2.2 0 | 40 0 0.1 0.05 0.1 0.18 5 0.3 15 | 0.1 0.4 0.01 3 12 160 120 30 40;ferm retinol;Carries many more microbial strains than yoghurt. In a 2021 Stanford trial, six or more servings a day of fermented foods increased gut microbiome diversity and lowered several inflammatory markers.
cottage-cheese;Cottage cheese;dairy;1;150;150 g;98 11.1 3.4 0 2.7 4.3 1.7 0 | 37 0 0.1 0.1 0 0.16 12 0.4 18 | 0.1 0.4 0.03 9.7 8 104 83 30 364;;
milk-whole;Milk, whole;dairy;1;250;1 glass;64 3.3 4.7 0 4.7 3.6 2.3 0 | 46 0 0.1 0.07 0.3 0.18 5 0.45 14 | 0.03 0.4 0.01 3.7 10 150 120 35 43;retinol;UK milk is the biggest source of iodine in most British diets.
milk-semi;Milk, semi-skimmed;dairy;1;250;1 glass;46 3.4 4.8 0 4.8 1.7 1.1 0 | 19 0 0 0.03 0.1 0.18 5 0.45 14 | 0.03 0.4 0.01 3.7 11 156 124 35 44;;
cheddar;Cheddar, mature;dairy;3;30;30 g;410 24.9 0.1 0 0.3 34.4 21.7 0 | 330 0 0.3 0.7 2.4 0.39 27 1.1 16 | 0.2 4 0.04 14 27 77 739 30 653;sperm retinol;Aged cheese contains spermidine, a compound that switches on autophagy (cellular clean-up) in animal studies, and vitamin K2. Calorie-dense, so it's a garnish rather than a protein source.
parmesan;Parmesan (Parmigiano Reggiano);dairy;3;20;20 g;392 35.8 0 0 0.9 25.8 16.4 0 | 207 0 0.5 0.2 1.7 0.33 7 1.2 15 | 0.8 2.8 0.03 22.5 38 92 1184 30 1600;sperm retinol;Aged 12+ months: naturally lactose-free, very high in calcium, and contains spermidine.
feta;Feta;dairy;3;30;30 g;264 14.2 4.1 0 4.1 21.3 15 0 | 125 0 0.4 0.2 1.8 0.84 32 1.7 15 | 0.65 2.9 0.03 15 19 62 493 20 1116;ferm;
mozzarella;Mozzarella;dairy;3;60;half a ball;280 22 2.2 0 1 21 13 0 | 180 0 0.4 0.2 2.3 0.28 7 2.3 15 | 0.4 2.9 0.01 17 20 76 505 20 627;;
butter;Butter, grass-fed;fats;2;10;1 tsp heaped (10 g);717 0.9 0.1 0 0.1 81 51 0 | 684 0 1.5 2.3 7 0.03 3 0.2 19 | 0 0.1 0 1 2 24 24 0 11;retinol;Grass-fed butter is more yellow because it carries more beta-carotene and some vitamin K2. Still about half saturated fat.
ghee;Ghee;fats;2;10;1 tsp heaped;900 0.3 0 0 0 99.5 62 0 | 840 0 1.5 2.8 8.6 0 0 0 22 | 0 0 0 0 0 5 4 0 2;retinol;
double-cream;Double cream;dairy;2;30;2 tbsp;449 1.7 2.7 0 2.7 48 30 0 | 411 0.6 1.2 1.4 3 0.12 4 0.2 17 | 0.03 0.2 0.01 0.6 7 79 66 15 30;retinol;
whey;Whey protein isolate;dairy;3;30;1 scoop;370 85 3 0 2 1.5 1 0 | 0 0 0 0 0 0.5 0 0.5 0 | 0.5 0.5 0.1 5 50 500 500 0 300;;The highest-leucine protein, which is the amino acid that triggers muscle building. Handy, but it's a protein top-up rather than a nutrient-dense food. Technically processed; no evidence of harm.
oats;Oats (certified gluten-free if needed);grains;1;50;50 g dry;379 13.2 60 10.1 1 6.5 1.1 0 | 0 0 0 0.4 2 0.16 32 0 40 | 4.3 3.6 0.39 28.9 138 362 52 2 6;phy preb lowgi oats;Beta-glucan fibre lowers LDL cholesterol and feeds gut bacteria. Phytate (a mineral-binding compound) reduces the iron and zinc you absorb from them. Overnight soaking helps a little.
white-rice;White rice (dry);grains;1;75;75 g dry;360 6.6 79 1.3 0.1 0.6 0.2 0 | 0 0 0 0.1 0 0.05 8 0 6 | 0.8 1.1 0.11 15 25 86 9 2 1;highgi;Clean, fast fuel around hard training, but low in micronutrients. Cooking, chilling and reheating creates resistant starch, which blunts the blood-sugar spike.
basmati;Basmati rice (dry);grains;1;75;75 g dry;356 7.5 78 1.5 0.2 0.8 0.2 0 | 0 0 0 0.1 0 0.05 9 0 5 | 0.8 1.2 0.11 15 25 100 10 2 1;;Lower glycaemic index than most white rice.
brown-rice;Brown rice (dry);grains;1;75;75 g dry;367 7.5 74 3.5 0.8 3.2 0.6 0 | 0 0 0 0.6 1.9 0.1 20 0 30 | 1.5 2 0.28 23 143 223 23 2 7;phy lowgi;More magnesium and fibre than white. Rice can carry inorganic arsenic, so vary your grains.
quinoa;Quinoa (dry);grains;1;60;60 g dry;368 14.1 57 7 0 6.1 0.7 0 | 1 0 0 2.4 0 0.32 184 0 70 | 4.6 3.1 0.59 8.5 197 563 47 2 5;phy poly lowgi;A complete plant protein, rich in magnesium and folate. Rinse it to remove the bitter saponins.
buckwheat;Buckwheat (dry);grains;1;60;60 g dry;343 13.3 61.5 10 0 3.4 0.7 0 | 0 0 0 0 0 0.43 30 0 54 | 2.2 2.4 1.1 8.3 231 460 18 2 1;phy poly lowgi;Naturally gluten-free despite the name. Rich in rutin, a polyphenol.
sweet-potato;Sweet potato;grains;1;200;1 medium;86 1.6 17 3 4.2 0.1 0 0 | 709 2.4 0 0.3 1.8 0.06 11 0 12 | 0.6 0.3 0.15 0.6 25 337 30 2 55;carot;Orange flesh means beta-carotene, which deposits in skin and gives a slight golden tone (studies have rated this as attractive). It converts to vitamin A only as needed, so it can't reach toxic levels.
potato;Potato, with skin;grains;1;250;1 large;77 2 15.4 2.1 0.8 0.1 0 0 | 0 19.7 0 0 2 0.03 15 0 12 | 0.8 0.3 0.11 0.4 23 421 12 2 6;preb;The most filling food per calorie in satiety studies, and high in potassium. Cooked then cooled potatoes develop resistant starch that feeds gut bacteria.
sourdough;Sourdough bread (wheat);grains;3;50;1 slice;270 9.5 50 2.5 2 1.5 0.3 0 | 0 0 0 0.2 0 0.15 50 0 10 | 2 0.9 0.15 25 25 120 30 2 500;gluten ferm;Long fermentation breaks down some phytate and FODMAPs. Contains gluten.
white-bread;White bread, sliced;grains;4;80;2 slices;265 9 47 2.7 4 3.2 0.7 0 | 0 0 0 0.2 0 0.15 30 0 8 | 2.5 0.8 0.1 22 25 115 140 2 450;gluten upf highgi;UK flour is fortified with calcium and iron, but most packaged sliced bread is ultra-processed.
gf-bread;Gluten-free bread (typical);grains;4;70;2 slices;250 4 40 6 4 7 0.8 0 | 0 0 0 1 0 0.05 15 0 5 | 0.8 0.5 0.1 3 20 150 50 1 450;upf;Usually not fortified the way wheat flour is, and often ultra-processed. Use potatoes, rice, buckwheat and oats as your main gluten-free carbohydrates.
pasta;Pasta, wheat (dry);grains;3;75;75 g dry;371 13 71 3.2 2.7 1.5 0.3 0 | 0 0 0 0.1 0 0.06 18 0 15 | 1.3 1.4 0.29 63 53 223 21 2 6;gluten lowgi;Cooked al dente, pasta has a lower GI than most people expect.
gf-pasta;Pasta, gluten-free (rice/corn, dry);grains;3;75;75 g dry;357 7 79 2.5 0.5 1.5 0.3 0 | 0 0 0 0.1 0 0.03 10 0 5 | 0.8 1.1 0.1 10 30 120 10 1 5;;
rice-cakes;Rice cakes;grains;3;20;2 cakes;387 8 80 4 0.9 2.8 0.6 0 | 0 0 0 0.5 0 0.05 20 0 20 | 1.5 2 0.4 20 130 290 11 2 80;highgi;Puffing makes the starch digest very fast. Fine before a session; otherwise not very filling.
corn-tortilla;Corn tortilla;grains;3;50;2 small;218 5.7 41 6.3 0.9 2.9 0.4 0 | 0 0 0 0.3 0 0.06 5 0 13 | 1.2 1.3 0.15 6 72 186 81 2 45;;Made with lime (nixtamalised), which unlocks niacin in the corn.
cereal-sugary;Breakfast cereal, sugary;grains;4;40;40 g bowl;380 7 84 3 30 2 0.5 0 | 300 20 4 0 0 1 300 1.5 20 | 12 5 0.2 5 30 150 20 2 600;upf addsug highgi gluten;The vitamins are sprayed on. That makes it look good on a label without the food matrix (fibre, polyphenols, protein) of real food.
granola;Granola (shop-bought);grains;4;50;50 g;471 10 56 7 22 22 4 0 | 0 0 0 4 2 0.15 30 0 30 | 3 2.5 0.4 10 120 400 50 2 20;upf addsug gluten;A health halo with roughly a quarter sugar. Make your own with oats, nuts and cinnamon.
lentils;Red lentils (dry);legumes;1;60;60 g dry;358 24 54 11 1.5 2.2 0.3 0 | 2 1.7 0 0.5 5 0.21 204 0 96 | 7.4 3.6 0.75 8.2 59 578 48 2 7;phy preb lowgi;Fibre, folate and plant protein in one. Their non-haem iron absorbs better with vitamin C in the same meal (peppers, lemon, tomato).
chickpeas;Chickpeas (tinned, drained);legumes;3;120;half a tin;139 7 18 7 0.3 2.6 0.3 0 | 1 0.5 0 0.3 3.3 0.05 105 0 30 | 1.3 1 0.2 3 26 160 43 2 240;phy preb lowgi;
black-beans;Black beans (tinned, drained);legumes;3;120;half a tin;91 6 11 6.9 0.3 0.3 0.1 0 | 0 0.8 0 0.2 3 0.06 61 0 25 | 1.9 0.7 0.14 1 35 230 35 1 200;phy preb poly lowgi;Dark skins carry anthocyanins, the same purple polyphenols as blueberries.
edamame;Edamame beans;legumes;1;100;100 g;121 11.9 2.4 5.2 2.2 5.2 0.6 0 | 9 6.1 0 0.7 26.7 0.16 311 0 56 | 2.3 1.4 0.35 0.8 64 436 63 2 6;phy poly;
tofu;Tofu, firm (calcium-set);legumes;3;150;150 g;144 17.3 1.2 2.3 0.6 8.7 1.3 0 | 0 0.2 0 0 2.4 0.1 29 0 28 | 2.7 1.6 0.38 17.4 58 237 350 2 14;phy poly;Calcium-set tofu is one of the best plant calcium sources. Soy isoflavones don't lower testosterone in men at normal intakes (meta-analyses agree).
tempeh;Tempeh;legumes;3;100;100 g;192 20.3 6.4 4.8 0 10.8 2.2 0 | 0 0 0 0 0 0.36 24 0.1 40 | 2.7 1.1 0.56 0 81 412 111 2 9;ferm poly;Fermentation lowers phytate, so its minerals absorb better than tofu's.
natto;Natto;legumes;3;50;1 pot;211 19.4 12.7 5.4 4.9 11 1.6 0 | 0 13 0 0 600 0.19 8 0 57 | 8.6 3 0.67 8.8 115 729 217 1 7;ferm sperm;The richest food source of vitamin K2 (MK-7), which directs calcium into bones and away from arteries, and one of the richest in spermidine. It's an acquired taste.
hummus;Hummus;legumes;3;50;2 tbsp;166 7.9 11 6 0.3 9.6 1.4 0 | 1 0 0 1 3 0.06 83 0 30 | 2.4 1.8 0.4 2.4 71 228 38 2 379;phy preb;
spinach;Spinach;veg;1;80;2 big handfuls;23 2.9 1.4 2.2 0.4 0.4 0.1 0 | 469 28 0 2 483 0.19 194 0 19 | 2.7 0.5 0.13 1 79 558 99 2 79;oxa lut nitr carot;Packed with folate, vitamin K, nitrate and lutein. Its calcium is mostly locked up by oxalate, so you absorb only about 5% of it; the iron absorbs poorly too. Valuable for everything else.
kale;Kale;veg;1;80;2 handfuls;49 4.3 5 2 2.3 0.9 0.1 0 | 241 93 0 1.5 390 0.13 141 0 0.4 | 1.5 0.4 0.29 0.9 47 491 150 2 38;sulf lut carot;Unlike spinach, kale is low in oxalate, so its calcium absorbs well (about as well as milk's).
broccoli;Broccoli;veg;1;80;80 g;34 2.8 4 2.6 1.7 0.4 0 0 | 31 89 0 0.8 102 0.12 63 0 19 | 0.7 0.4 0.05 2.5 21 316 47 2 33;sulf;Contains glucoraphanin, which becomes sulforaphane when chopped. Sulforaphane activates Nrf2, a master switch for your cells' own antioxidant defences. Chop it and leave it 30–40 minutes before cooking, or add a pinch of mustard powder.
broccoli-sprouts;Broccoli sprouts;veg;1;30;1 handful;35 2.5 3 2.5 0.5 0.5 0 0 | 0 60 0 0 100 0.1 60 0 0 | 0.8 0.5 0.05 1 25 300 60 2 30;sulf poly2 raw;Carry 10–100 times more glucoraphanin than mature broccoli. Best raw. Values approximate.
brussels;Brussels sprouts;veg;1;80;8 sprouts;43 3.4 5.2 3.8 2.2 0.3 0.1 0 | 38 85 0 0.9 177 0.09 61 0 19 | 1.4 0.4 0.07 1.6 23 389 42 2 25;sulf;
cauliflower;Cauliflower;veg;1;100;100 g;25 1.9 3 2 1.9 0.3 0.1 0 | 0 48 0 0.1 15.5 0.06 57 0 44 | 0.4 0.3 0.04 0.6 15 299 22 2 30;sulf;
red-cabbage;Red cabbage;veg;1;80;80 g;31 1.4 5.3 2.1 3.8 0.2 0 0 | 56 57 0 0.1 38 0.07 18 0 17 | 0.8 0.2 0.02 0.6 16 243 45 2 27;sulf poly;Gets both brassica sulforaphane precursors and purple anthocyanins.
rocket;Rocket;veg;1;40;1 big handful;25 2.6 2 1.6 2 0.7 0.1 0 | 119 15 0 0.4 109 0.09 97 0 15 | 1.5 0.5 0.08 0.3 47 369 160 2 27;nitr sulf lut;One of the highest-nitrate foods there is. Your body turns nitrate into nitric oxide, which widens blood vessels and makes mitochondria more efficient. Don't use antibacterial mouthwash: mouth bacteria do the first step.
watercress;Watercress;veg;1;40;1 big handful;11 2.3 0.8 0.5 0.2 0.1 0 0 | 160 43 0 1 250 0.12 9 0 9 | 0.2 0.1 0.08 0.9 21 330 120 1 41;sulf nitr lut;Often tops nutrient-density rankings per calorie.
pak-choi;Pak choi;veg;1;100;1 head;13 1.5 1.2 1 1.2 0.2 0 0 | 223 45 0 0.1 45.5 0.07 66 0 6.4 | 0.8 0.2 0.02 0.5 19 252 105 1 65;sulf;Low in oxalate, so its calcium absorbs well.
beetroot;Beetroot;veg;1;80;1 medium;43 1.6 7 2.8 6.8 0.2 0 0 | 2 4.9 0 0 0.2 0.04 109 0 6 | 0.8 0.4 0.08 0.7 23 325 16 2 78;nitr poly;Rich in nitrate (blood flow, mitochondrial efficiency) and betalains, red antioxidant pigments.
beet-juice;Beetroot juice shot (per 100 ml);drinks;1;70;1 shot (70 ml);45 1 9.5 0.5 9 0 0 0 | 0 2 0 0 0 0.02 20 0 0 | 0.5 0.2 0.05 0.3 15 300 15 1 80;nitr poly juice;Concentrated nitrate. Trials show small improvements in endurance performance, mostly in less-trained people. Take it 2–3 hours before a session.
carrots;Carrots;veg;1;80;1 large;41 0.9 7.7 2.8 4.7 0.2 0 0 | 835 5.9 0 0.7 13.2 0.06 19 0 8.8 | 0.3 0.2 0.05 0.1 12 320 33 2 69;carot;Cooking carrots with a little fat makes their beta-carotene several times more absorbable than eating them raw.
red-pepper;Red pepper;veg;1;80;half a pepper;31 1 4.6 2.1 4.2 0.3 0 0 | 157 128 0 1.6 4.9 0.09 46 0 5.6 | 0.4 0.3 0.02 0.1 12 211 7 1 4;carot;More vitamin C than an orange. Vitamin C is the cofactor your skin needs to build collagen.
tomato;Tomatoes;veg;1;80;1 medium;18 0.9 2.7 1.2 2.6 0.2 0 0 | 42 13.7 0 0.5 7.9 0.02 15 0 6.7 | 0.3 0.2 0.06 0 11 237 10 1 5;carot;Lycopene. Small trials suggest tomato paste with olive oil may modestly protect skin against sunburn. It adds to sunscreen; it doesn't replace it.
passata;Tomato passata;veg;1;100;100 g;30 1.4 5 1.5 4 0.2 0 0 | 40 10 0 1.5 5 0.05 10 0 8 | 0.8 0.2 0.1 0.3 18 400 18 1 20;carot;Cooked tomato releases far more lycopene than raw, especially with olive oil.
avocado;Avocado;veg;1;75;half an avocado;160 2 1.8 6.7 0.7 14.7 2.1 0 | 7 10 0 2.1 21 0.13 81 0 14 | 0.6 0.6 0.19 0.4 29 485 12 1 7;mufa lut;Its fat helps you absorb the carotenoids from other vegetables in the meal. Very rich in fibre and potassium.
garlic;Garlic;veg;1;6;2 cloves;149 6.4 31 2.1 1 0.5 0.1 0 | 0 31 0 0.1 1.7 0.11 3 0 23 | 1.7 1.2 0.3 14.2 25 401 181 2 17;sulf preb;Crush it and wait 10 minutes before heating to let allicin form. Prebiotic fibre (inulin) feeds gut bacteria.
onion;Red onion;veg;1;80;1 small;40 1.1 7.6 1.7 4.2 0.1 0 0 | 0 7.4 0 0 0.4 0.03 19 0 6 | 0.2 0.2 0.04 0.5 10 146 23 1 4;poly preb;Red onions carry quercetin and anthocyanins; the outer layers hold the most.
leek;Leek;veg;1;80;half a leek;61 1.5 12.4 1.8 3.9 0.3 0 0 | 83 12 0 0.9 47 0.03 64 0 9.5 | 2.1 0.1 0.12 1 28 180 59 1 20;preb;
mushrooms;Mushrooms (chestnut/white);veg;1;80;80 g;22 3.1 0.3 1 2 0.3 0.1 0 | 0 2 0.2 0 0 0.4 17 0.04 17 | 0.5 0.5 0.32 9.3 9 318 3 3 5;sperm;Mushrooms are the richest dietary source of ergothioneine, an antioxidant your body actively transports into cells, plus spermidine. Leave them on a sunny windowsill gill-side up for an hour and they make vitamin D.
mushrooms-uv;Mushrooms, UV-exposed (vitamin D);veg;1;80;80 g;22 3.1 0.3 1 2 0.3 0.1 0 | 0 2 10 0 0 0.4 17 0.04 17 | 0.5 0.5 0.32 9.3 9 318 3 3 5;sperm;Some UK supermarkets sell "vitamin D mushrooms" grown under UV light.
shiitake;Shiitake mushrooms;veg;1;80;80 g;34 2.2 4.3 2.5 2.4 0.5 0.1 0 | 0 0 0.4 0 0 0.22 13 0 0 | 0.4 1 0.14 5.7 20 304 2 3 9;sperm preb;Beta-glucan fibre and ergothioneine.
asparagus;Asparagus;veg;1;80;5 spears;20 2.2 1.9 2.1 1.9 0.1 0 0 | 38 5.6 0 1.1 41.6 0.14 52 0 16 | 2.1 0.5 0.19 2.3 14 202 24 1 2;preb;
courgette;Courgette;veg;1;100;half a courgette;17 1.2 2.7 1 1.7 0.3 0.1 0 | 10 17.9 0 0.1 4.3 0.09 24 0 9.5 | 0.4 0.3 0.05 0.2 18 261 16 1 8;;
cucumber;Cucumber;veg;1;80;80 g;15 0.7 3 0.5 1.7 0.1 0 0 | 5 2.8 0 0 16.4 0.03 7 0 6 | 0.3 0.2 0.04 0.3 13 147 16 1 2;;Mostly water. Good volume food on a cut, not nutrient-dense.
green-beans;Green beans;veg;1;80;80 g;31 1.8 4.3 2.7 3.3 0.2 0 0 | 35 12.2 0 0.4 43 0.1 33 0 15 | 1 0.2 0.07 0.6 25 211 37 1 6;;
peas;Peas (frozen);veg;1;80;80 g;77 5.2 9.6 4.9 3.9 0.4 0.1 0 | 105 18 0 0.2 22.4 0.1 59 0 28 | 1.5 0.7 0.12 0.7 22 153 22 1 108;lut;Frozen at picking, so often more nutritious than "fresh" peas.
sweetcorn;Sweetcorn;veg;1;80;80 g;86 3.3 17 2.7 6.3 1.4 0.3 0 | 9 6.8 0 0.1 0.3 0.06 42 0 23 | 0.5 0.5 0.05 0.6 37 270 2 1 15;lut;
nori;Nori seaweed (dried sheets);veg;1;3;1 sheet;330 41 10 36 0.5 2.5 0.5 0 | 520 39 0 1 4 2.5 500 0 0 | 11 3 0.5 5 300 3000 280 2500 500;;A sensible, food-sized iodine source. The B12 in seaweed is mostly an inactive look-alike, so it isn't counted here. Values approximate.
kelp;Kelp / kombu (dried);veg;1;1;1 g;290 6 50 30 1 1 0.2 0 | 10 3 0 0.9 66 0.15 180 0 0 | 3 1.2 0.13 0.7 120 89 168 50000 233;iodHigh;Iodine content is so high and variable that a few grams can exceed the safe upper limit many times over. Excess iodine disturbs the thyroid, the opposite of what you want.
olives;Olives;veg;3;30;8 olives;145 1 3.8 3.3 0.5 15.3 2 0 | 20 0 0 3.8 1.4 0.01 3 0 14 | 0.5 0 0.12 0.9 11 42 52 1 1556;mufa poly ferm;Hydroxytyrosol and other olive polyphenols, but brined olives are very salty.
sauerkraut;Sauerkraut (raw, unpasteurised);veg;3;50;2 tbsp heaped;19 0.9 1.4 2.9 1.8 0.1 0 0 | 1 14.7 0 0.1 13 0.02 24 0 10 | 1.5 0.2 0.1 0.6 13 170 30 1 661;ferm sulf;Only chilled, unpasteurised sauerkraut has live cultures. Jarred shelf-stable versions are heat-treated.
kimchi;Kimchi;veg;3;50;2 tbsp heaped;15 1.1 2.4 1.6 1.1 0.5 0.1 0 | 5 0 0 0.1 43 0.06 52 0 0 | 2.5 0.2 0.05 0.5 14 151 33 1 498;ferm sulf;
celery;Celery;veg;1;80;2 sticks;14 0.7 1.4 1.6 1.3 0.2 0 0 | 22 3.1 0 0.3 29 0.06 36 0 6 | 0.2 0.1 0.04 0.4 11 260 40 1 80;nitr;
parsnip;Parsnip;veg;1;100;1 medium;75 1.2 13 4.9 4.8 0.3 0 0 | 0 17 0 1.5 22.5 0.05 67 0 25 | 0.6 0.6 0.12 1.8 29 375 36 1 10;preb;
squash;Butternut squash;veg;1;150;150 g;45 1 10 2 2.2 0.1 0 0 | 532 21 0 1.4 1.1 0.02 27 0 10 | 0.7 0.2 0.07 0.5 34 352 48 1 4;carot;
aubergine;Aubergine;veg;1;100;100 g;25 1 3 3 3.5 0.2 0 0 | 1 2.2 0 0.3 3.5 0.04 22 0 7 | 0.2 0.2 0.08 0.3 14 229 9 1 2;poly;The purple skin holds nasunin, an anthocyanin. It soaks up oil like a sponge, so roast it rather than fry it.
artichoke;Globe artichoke;veg;1;120;1 artichoke;47 3.3 5 5.4 1 0.2 0 0 | 1 11.7 0 0.2 14.8 0.07 68 0 34 | 1.3 0.5 0.23 0.2 60 370 44 1 94;preb poly;
jerusalem-artichoke;Jerusalem artichoke;veg;1;100;100 g;73 2 15 1.6 9.6 0 0 0 | 1 4 0 0.2 0.1 0.06 13 0 30 | 3.4 0.1 0.14 0.7 17 429 14 1 4;preb;One of the richest sources of inulin, a prebiotic fibre. Notoriously gassy, so start small.
parsley;Parsley (fresh);herbs;1;10;small handful;36 3 3.3 3.3 0.9 0.8 0.1 0 | 421 133 0 0.8 1640 0.1 152 0 13 | 6.2 1.1 0.15 0.1 50 554 138 1 56;poly lut;A handful adds a remarkable amount of vitamin K and apigenin, a polyphenol.
turmeric;Turmeric (ground);herbs;1;2;1 tsp;312 9.7 44 22.7 3.2 3.3 1.8 0 | 0 0.7 0 4.4 13 0.15 20 0 49 | 55 4.5 1.3 6.2 208 2080 168 1 27;poly2;Curcumin is poorly absorbed on its own. Black pepper (piperine) and fat improve absorption a lot. Strong lab and animal results, but human anti-ageing evidence is limited.
ginger;Ginger (fresh);herbs;1;10;thumb-sized piece;80 1.8 16 2 1.7 0.8 0.2 0 | 0 5 0 0.3 0.1 0.03 11 0 29 | 0.6 0.3 0.23 0.7 43 415 16 1 13;poly;Meta-analyses show small reductions in muscle soreness and inflammatory markers.
cinnamon;Cinnamon (Ceylon);herbs;1;2;1 tsp;247 4 27.5 53 2.2 1.2 0.3 0 | 15 3.8 0 2.3 31 0.04 6 0 11 | 8.3 1.8 0.34 3.1 60 431 1002 1 10;poly2;Choose Ceylon: cassia cinnamon (the usual supermarket kind) is high in coumarin, which can harm the liver at a teaspoon or more daily.
black-pepper;Black pepper;herbs;1;1;a few twists;251 10 38.7 25 0.6 3.3 1.4 0 | 27 0 0 1 164 0.18 17 0 11 | 9.7 1.2 1.3 4.9 171 1329 443 1 20;poly;Piperine raises curcumin absorption from turmeric about 20-fold in one small study.
cocoa;Cocoa powder (unsweetened);herbs;2;10;2 tsp;330 19.6 14 37 1.8 13.7 8 0 | 0 0 0 0.1 2.5 0.24 32 0 12 | 13.9 6.8 3.8 14.3 499 1524 128 1 21;poly2;Cocoa flavanols improve blood vessel function in trials, and a 12-week trial found improved skin elasticity. Raw cacao and non-alkalised ("natural") cocoa keep the most flavanols.
dark-choc-85;Dark chocolate 85%+;herbs;3;20;2 squares (20 g);600 7.8 22 11 14 46 27 0 | 2 0 0 0.6 7 0.08 0 0 0 | 11.9 3.3 1.8 6.8 228 715 73 1 20;poly2;A daily square or two is a genuine polyphenol source. Some brands have tested high for lead and cadmium, so rotate brands.
dark-choc-70;Dark chocolate 70%;herbs;3;20;2 squares (20 g);598 7.8 34 11 24 43 24.5 0 | 2 0 0 0.6 7 0.08 0 0 0 | 11.9 3.3 1.7 6.8 228 715 73 1 20;poly addsug;
blueberries;Blueberries (wild if possible);fruit;1;80;1 handful;57 0.7 12 2.4 10 0.3 0 0 | 3 9.7 0 0.6 19.3 0.04 6 0 6 | 0.3 0.2 0.06 0.1 6 77 6 1 1;poly2;Anthocyanins, the blue-purple polyphenols, have been linked to better blood vessel function and memory in trials. Wild blueberries carry roughly twice the anthocyanins of cultivated ones. Frozen keeps them well.
raspberries;Raspberries;fruit;1;80;1 handful;52 1.2 5.4 6.5 4.4 0.7 0 0 | 2 26 0 0.9 7.8 0.04 21 0 12 | 0.7 0.4 0.09 0.2 22 151 25 1 1;poly2 lowgi;The highest-fibre fruit per calorie, with ellagitannins that gut bacteria turn into urolithins (compounds being studied for mitochondrial renewal).
strawberries;Strawberries;fruit;1;100;7 strawberries;32 0.7 6.1 2 4.9 0.3 0 0 | 1 58.8 0 0.3 2.2 0.02 24 0 5.7 | 0.4 0.1 0.05 0.4 13 153 16 1 1;poly lowgi;Vitamin C for collagen plus fisetin, a polyphenol that clears ageing "zombie" cells in mice. Unproven in humans.
blackberries;Blackberries;fruit;1;80;1 handful;43 1.4 4.3 5.3 4.9 0.5 0 0 | 11 21 0 1.2 19.8 0.03 25 0 8.5 | 0.6 0.5 0.17 0.4 20 162 29 1 1;poly2 lowgi;
cherries-tart;Cherries (tart/Montmorency);fruit;1;100;100 g;50 1 11 1.6 8.5 0.3 0.1 0 | 64 10 0 0.1 2.1 0.04 8 0 6 | 0.3 0.1 0.1 0 9 173 16 1 3;poly2;Small trials show tart cherry improves sleep time and recovery from hard running. Interesting, but not proven.
kiwi;Kiwi fruit;fruit;1;150;2 kiwis;61 1.1 10.1 3 9 0.5 0 0 | 4 92.7 0 1.5 40.3 0.03 25 0 7.8 | 0.3 0.1 0.13 0.2 17 312 34 1 3;poly;Two kiwis an hour before bed improved sleep onset and duration in one small uncontrolled study. Two also cover your vitamin C for the day.
orange;Orange;fruit;1;150;1 orange;47 0.9 8.6 2.4 9.4 0.1 0 0 | 11 53.2 0 0.2 0 0.04 30 0 8.4 | 0.1 0.1 0.05 0.5 10 181 40 1 0;poly;
lemon;Lemon juice & zest;fruit;1;30;juice of half;29 1.1 3.2 2.8 2.5 0.3 0 0 | 1 53 0 0.2 0 0.02 11 0 5 | 0.6 0.1 0.04 0.4 8 138 26 1 2;poly;Vitamin C squeezed over lentils, spinach or seeds can roughly double non-haem iron absorption.
banana;Banana;fruit;1;120;1 medium;89 1.1 20.3 2.6 12.2 0.3 0.1 0 | 3 8.7 0 0.1 0.5 0.07 20 0 9.8 | 0.3 0.2 0.08 1 27 358 5 1 1;;Easy pre-run fuel. Slightly green bananas carry resistant starch.
apple;Apple (skin on);fruit;1;150;1 medium;52 0.3 11.8 2.4 10.4 0.2 0 0 | 3 4.6 0 0.2 2.2 0.03 3 0 3.4 | 0.1 0 0.03 0 5 107 6 1 1;poly preb lowgi;The skin holds most of the quercetin; pectin is a prebiotic fibre.
pomegranate;Pomegranate seeds;fruit;1;80;half a pomegranate;83 1.7 14.7 4 13.7 1.2 0.1 0 | 0 10.2 0 0.6 16.4 0.05 38 0 7.6 | 0.3 0.4 0.16 0.5 12 236 10 1 3;poly2;Ellagitannins that some people's gut bacteria convert to urolithin A. Urolithin A improved muscle endurance markers in small trials of the purified compound.
mango;Mango;fruit;1;100;100 g;60 0.8 13.4 1.6 13.7 0.4 0.1 0 | 54 36.4 0 0.9 4.2 0.04 43 0 7.6 | 0.2 0.1 0.11 0.6 10 168 11 1 1;carot;
grapes;Red grapes;fruit;1;80;1 handful;69 0.7 17.2 0.9 15.5 0.2 0 0 | 3 3.2 0 0.2 14.6 0.07 2 0 5.6 | 0.4 0.1 0.13 0.1 7 191 10 1 2;poly;
pineapple;Pineapple;fruit;1;100;100 g;50 0.5 11.9 1.4 9.9 0.1 0 0 | 3 47.8 0 0 0.7 0.03 18 0 5.5 | 0.3 0.1 0.11 0.1 12 109 13 1 1;;
watermelon;Watermelon;fruit;1;200;1 slice;30 0.6 7.2 0.4 6.2 0.2 0 0 | 28 8.1 0 0.1 0.1 0.02 3 0 4.1 | 0.2 0.1 0.04 0.4 10 112 7 1 1;carot;Lycopene, and very low in calories for its volume.
dates;Medjool dates;fruit;1;24;1 date;277 1.8 68 6.7 66 0.2 0 0 | 7 0 0 0.1 2.7 0.06 15 0 9.9 | 0.9 0.4 0.36 3 54 696 64 1 1;poly;Whole dried fruit isn't classed as free sugar, but it is very sugar-dense. Excellent pre-run fuel.
brazil-nuts;Brazil nuts;nuts;1;5;1 nut;659 14.3 4.2 7.5 2.3 67.1 15.1 0 | 0 0.7 0 5.7 0 0.04 22 0 29 | 2.4 4.1 1.74 1917 376 659 160 1 3;seHigh;A single nut supplies your whole day's selenium (very variable: 25–100+ µg each). Selenium makes glutathione peroxidase, a key antioxidant enzyme, and activates thyroid hormone. More than 2–3 nuts a day regularly risks selenium toxicity (brittle nails, hair loss, garlic breath), so 1–2 is the sweet spot.
walnuts;Walnuts;nuts;1;30;7 halves;654 15.2 7 6.7 2.6 65.2 6.1 0 | 1 1.3 0 0.7 2.7 0.15 98 0 39 | 2.9 3.1 1.59 4.9 158 441 98 1 2;ala poly;The only nut with meaningful plant omega-3 (ALA). Your body converts less than 10% of ALA into EPA/DHA, so walnuts complement oily fish rather than replace it.
almonds;Almonds;nuts;1;30;23 almonds;579 21.2 9.5 12.5 4.4 49.9 3.8 0 | 0 0 0 25.6 0 1.14 44 0 52 | 3.7 3.1 1.03 4.1 270 733 269 1 1;phy;The richest food source of vitamin E, the fat-soluble antioxidant that protects skin cell membranes.
macadamia;Macadamias;nuts;1;30;15 nuts;718 7.9 5.2 8.6 4.6 75.8 12.1 0 | 0 1.2 0 0.5 0 0.16 11 0 0 | 3.7 1.3 0.76 3.6 130 368 85 1 5;mufa;
pistachios;Pistachios;nuts;1;30;49 nuts;562 20.2 18 10.6 7.7 45.3 5.9 0 | 26 5.6 0 2.9 13.2 0.16 51 0 71 | 3.9 2.2 1.3 7 121 1025 105 1 1;lut poly;The green and purple colours are lutein and anthocyanins. In-shell nuts slow you down.
cashews;Cashews;nuts;1;30;18 nuts;553 18.2 27 3.3 5.9 43.9 7.8 0 | 0 0.5 0 0.9 34 0.06 25 0 61 | 6.7 5.8 2.2 19.9 292 660 37 1 12;phy;
pumpkin-seeds;Pumpkin seeds;nuts;1;30;2 tbsp;559 30.2 4.7 6 1.4 49 8.7 0 | 1 1.9 0 2.2 7.3 0.15 58 0 63 | 8.8 7.8 1.34 9.4 592 809 46 1 7;phy;The best plant source of magnesium and zinc, although phytate means you absorb less of the zinc than from meat.
chia;Chia seeds;nuts;1;15;1 tbsp;486 16.5 7.7 34.4 0 30.7 3.3 0 | 0 1.6 0 0.5 0 0.17 49 0 0 | 7.7 4.6 0.92 55.2 335 407 631 1 16;ala phy preb;
flax;Flaxseed (ground);nuts;1;15;1 tbsp;534 18.3 1.6 27.3 1.6 42.2 3.7 0 | 0 0.6 0 0.3 4.3 0.16 87 0 79 | 5.7 4.3 1.22 25.4 392 813 255 1 30;ala phy poly;Must be ground, or it passes straight through. Rich in lignans (a polyphenol) and ALA.
hemp;Hemp seeds;nuts;1;30;3 tbsp;553 31.6 4.7 4 1.5 48.8 4.6 0 | 1 0.5 0 0.8 0 0.29 110 0 0 | 8 9.9 1.6 0 700 1200 70 1 5;ala phy;
tahini;Tahini;nuts;2;15;1 tbsp;595 17 10 9.3 0.5 53.8 7.5 0 | 3 4.2 0 0.3 0 0.47 98 0 26 | 8.95 4.6 1.6 34 95 414 426 1 115;phy;
sunflower-seeds;Sunflower seeds;nuts;1;30;2 tbsp;584 20.8 11.4 8.6 2.6 51.5 4.5 0 | 3 1.4 0 35.2 0 0.36 227 0 55 | 5.25 5 1.8 53 325 645 78 1 9;phy;
peanut-butter;Peanut butter (100% peanuts);nuts;2;20;1 tbsp heaped;588 25 16 6 6 50 10 0 | 0 0 0 9 0.3 0.1 87 0 63 | 1.9 2.5 0.47 4.1 168 558 43 1 17;;
evoo;Extra virgin olive oil;fats;2;10;1 tbsp (10 ml);884 0 0 0 0 100 14 0 | 0 0 0 14.4 60 0 0 0 0.3 | 0.6 0 0 0 0 1 1 0 2;mufa evoo poly;The best-evidenced fat in nutrition. In the PREDIMED trial, a Mediterranean diet with extra olive oil cut major cardiovascular events by about 30%. Its polyphenols (hydroxytyrosol, oleocanthal) are anti-inflammatory. Calorie-dense, so measure it on a cut.
rapeseed-oil;Rapeseed oil (cold-pressed);fats;2;10;1 tbsp;884 0 0 0 0 100 7.4 0 | 0 0 0 17.5 71 0 0 0 0 | 0 0 0 0 0 0 0 0 0;ala;Seed oils have a bad reputation online. Controlled trials don't support it: swapping saturated fat for these oils lowers LDL. The real problem is repeatedly reheated frying oil and the ultra-processed foods they come in.
sunflower-oil;Sunflower oil (refined);fats;2;10;1 tbsp;884 0 0 0 0 100 10.3 0 | 0 0 0 41 5.4 0 0 0 0 | 0 0 0 0 0 0 0 0 0;;
coconut-oil;Coconut oil;fats;2;10;1 tbsp;892 0 0 0 0 99 82.5 0 | 0 0 0 0.1 0.6 0 0 0 0 | 0.1 0 0 0 0 0 1 0 0;;A 2020 meta-analysis of trials found coconut oil raises LDL cholesterol compared with plant oils. It isn't the superfood it was marketed as.
avocado-oil;Avocado oil;fats;2;10;1 tbsp;884 0 0 0 0 100 11.6 0 | 0 0 0 12 0 0 0 0 0 | 0 0 0 0 0 0 0 0 0;mufa;
water;Water;drinks;1;250;1 glass;0 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 0;;
coffee;Coffee, black (per 100 ml);drinks;1;200;1 mug;1 0.1 0 0 0 0 0 0 | 0 0 0 0 0.1 0.08 2 0 2.6 | 0 0 0 0 3 49 2 0 2;poly caff;The biggest polyphenol source in most diets. 3–4 cups a day is linked with lower mortality in cohort studies. Caffeine's half-life is about 5 hours, so a 3pm coffee is still a quarter there at 1am.
green-tea;Green tea (per 100 ml);drinks;1;250;1 mug;1 0.2 0 0 0 0 0 0 | 0 0 0 0 0 0.06 1 0 0 | 0 0 0 0 1 8 0 0 1;poly2 caff;EGCG and L-theanine, which smooths the caffeine. Drink it between meals, because tea tannins reduce iron absorption.
matcha;Matcha (powder);drinks;1;2;1 tsp;324 30 21 38 0 5 1 0 | 2400 60 0 28 1000 1.35 120 0 0 | 17 6.3 0.6 2 230 2700 420 1 6;poly2 caff;You drink the whole leaf, so it carries more catechins than steeped green tea. Values approximate.
cola;Cola (per 100 ml);drinks;4;330;1 can;42 0 10.6 0 10.6 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 2 2 0 4;upf addsug caff;35 g of free sugar per can: more than a whole day's limit. Liquid sugar doesn't fill you up.
diet-cola;Diet cola (per 100 ml);drinks;4;330;1 can;0.4 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 1 2 2 0 4;upf caff;Far better than full-sugar cola. Questions remain about sweeteners and the gut microbiome, but the evidence is mixed.
energy-drink;Energy drink (per 100 ml);drinks;4;250;1 can;45 0 11 0 11 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 80;upf addsug caff;
oj;Orange juice (per 100 ml);drinks;1;150;1 small glass;45 0.7 10.4 0.2 8.4 0.2 0 0 | 10 50 0 0 0.1 0.03 30 0 6 | 0.2 0.1 0.04 0.1 11 200 11 1 1;juice;Juicing turns the fruit's sugar into "free sugar" (the type to limit): no fibre, quick to drink. Eat the orange.
kombucha;Kombucha (per 100 ml);drinks;3;250;1 bottle;13 0 3 0 3 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 10 0 0 5;ferm;Fewer studied benefits than kefir or yoghurt; check the label for added sugar.
beer;Beer, lager (per 100 ml);drinks;3;568;1 pint;43 0.5 3.6 0 0 0 0 0 | 0 0 0 0 0 0.03 6 0 10 | 0 0 0 0.6 6 27 4 0 4;alc gluten;
wine;Red wine (per 100 ml);drinks;3;175;1 medium glass;85 0.1 2.6 0 0.6 0 0 0 | 0 0 0 0 0.4 0.03 1 0 0 | 0.5 0.1 0.01 0.2 12 127 8 0 4;alc poly;The resveratrol in wine is a tiny fraction of the doses used in animal studies, and the alcohol works against everything you want here.
spirits;Spirits (per 100 ml);drinks;3;25;1 single (25 ml);231 0 0 0 0 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 1 0 0 1;alc;
honey;Honey;treats;2;15;1 tbsp;304 0.3 82 0.2 82 0 0 0 | 0 0.5 0 0 0 0.04 2 0 2 | 0.4 0.2 0.04 0.8 2 52 6 1 4;addsug;Counts as free sugar, the same as table sugar for your teeth and blood glucose. Raw honey has a few polyphenols, not enough to change that.
maple;Maple syrup;treats;2;15;1 tbsp;260 0 67 0 60 0.1 0 0 | 0 0 0 0 0 1.27 0 0 2 | 0.1 1.5 0 0.6 21 212 102 1 12;addsug;
sugar;Sugar (table);treats;2;5;1 tsp;400 0 100 0 100 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0 0 0 0 0 2 1 0 1;addsug;
crisps;Crisps;treats;4;30;1 bag;536 6.6 50 4.4 0.3 34 3.1 0 | 0 18 0 4.9 0 0.2 20 0 12 | 1.6 1.1 0.2 8 63 1275 24 1 525;upf fried;High-heat frying of starch makes acrylamide, and crisps are engineered to be hard to stop eating.
chips;Chips / fries (takeaway);treats;4;150;regular portion;312 3.4 38 3.8 0.3 15 2.3 0 | 0 4.7 0 1.6 16 0.03 30 0 16 | 0.8 0.5 0.1 0.4 35 579 18 1 210;upf fried;Deep-fried in oil that is often reheated many times, which builds up oxidised fats and AGEs. Oven-cook potatoes in olive oil instead.
pizza;Pizza (takeaway);treats;4;250;half a 12-inch pizza;266 11 33 2.3 3.6 10 4.5 0 | 70 1 0.2 0.8 5 0.2 30 0.6 15 | 2.5 1.3 0.1 18 24 172 188 10 598;upf gluten;
burger;Fast-food burger;treats;4;200;1 burger;254 13 25 1.3 5 12 4.4 0 | 10 1 0.1 0.4 4 0.15 30 1 20 | 2.3 2.2 0.1 15 20 230 60 5 500;upf gluten;
fried-chicken;Fried chicken (takeaway);treats;4;200;2 pieces;290 18 11 0.6 0 19 4.5 0 | 20 0 0.2 1.5 20 0.2 15 0.3 60 | 1 1.3 0.1 20 22 250 20 3 700;upf fried gluten;
donut;Doughnut;treats;4;70;1 doughnut;421 5 49 1.5 23 23 10 0 | 10 0 0 1 5 0.2 30 0.1 20 | 2 0.5 0.1 10 20 100 40 2 340;upf addsug fried gluten;
milk-choc;Milk chocolate;treats;4;45;1 bar;535 7.6 59 3.4 51.5 30 18.5 0 | 59 0 0 0.5 5.7 0.3 11 0.8 46 | 2.4 2.3 0.5 4.5 63 372 189 10 79;upf addsug;
ice-cream;Ice cream;treats;4;100;2 scoops;207 3.5 23.6 0.7 21 11 6.8 0 | 118 0.6 0.2 0.3 0.3 0.24 5 0.4 26 | 0.1 0.7 0 1.8 14 199 128 20 80;upf addsug;
biscuits;Biscuits (digestive);treats;4;30;2 biscuits;480 7 62 3 17 21 10 0 | 0 0 0 1 2 0.1 10 0 5 | 2 0.6 0.1 5 25 170 90 2 450;upf addsug gluten;
croissant;Croissant;treats;4;60;1 croissant;406 8.2 45.8 2.6 11 21 11.7 0 | 206 0.2 0.1 0.8 2 0.24 88 0.2 20 | 2 0.8 0.1 22 16 118 37 5 467;upf gluten;
noodles-instant;Instant noodles;treats;4;85;1 block;450 9 63 2.4 2 17 8 0 | 0 0 0 0.5 0 0.3 100 0 10 | 4 0.6 0.1 15 25 150 20 2 1800;upf fried gluten;
ready-meal;Ready meal (e.g. lasagne);treats;4;400;1 pack;130 7 13 1 3 5.5 2.5 0 | 50 2 0.1 0.5 3 0.15 15 0.4 20 | 1 1 0.1 8 18 220 80 5 380;upf gluten;
sweets;Sweets / gummies;treats;4;40;1 small bag;343 6.9 77 0 46 0.2 0 0 | 0 0 0 0 0 0 0 0 0 | 0.4 0 0 0 2 5 3 0 30;upf addsug;
protein-bar;Protein bar (typical);treats;4;60;1 bar;380 30 30 10 4 13 6 0 | 0 0 0 1 0 0.2 20 0.5 10 | 2 2 0.2 5 60 300 200 2 250;upf;Convenient, but usually ultra-processed with sugar alcohols. Greek yoghurt and fruit do the same job with more nutrients.
bacon;Bacon (cured);meat;3;50;2 rashers;417 13 1.4 0 0 39.7 13.3 0.05 | 11 0 0.4 0.3 0 0.1 1 0.5 70 | 0.5 1.2 0.05 18 12 200 6 2 1500;procmeat;Cured and processed meats are classed by the WHO's cancer agency as Group 1 carcinogens (bowel cancer): each 50 g a day raises relative risk by about 18%. The nitrites form N-nitroso compounds in the gut.
sausages;Pork sausages;meat;4;100;2 sausages;300 13 9 0.5 1.5 25 9 0.05 | 0 0 0.5 0.3 0 0.15 2 0.7 50 | 1 1.6 0.06 14 15 220 15 2 900;procmeat upf gluten;Most UK sausages contain rusk (wheat). Butcher's gluten-free ones exist, but they're still processed meat.
ham;Ham (sliced);meat;3;60;3 slices;107 17 1.5 0 1 3.5 1.2 0 | 0 0 0.5 0.2 0 0.2 3 0.5 70 | 0.8 1.8 0.06 20 20 300 7 2 1100;procmeat;
salami;Salami / chorizo;meat;3;30;6 slices;407 22.6 1.2 0 1 33.7 12 0 | 0 0 0.5 0.2 0 0.25 2 1.2 70 | 1.5 3.2 0.1 26 20 340 10 2 1800;procmeat;
sushi;Salmon sushi / nigiri;fish;3;200;8 pieces;150 7 22 0.4 4 3 0.6 0.4 | 20 1 2 0.5 1 0.05 10 1 20 | 0.4 0.6 0.06 10 15 120 10 10 400;addsug;Sushi rice is seasoned with sugar and vinegar. Use tamari if you avoid gluten.
tamari;Tamari (gluten-free soy sauce);herbs;3;15;1 tbsp;60 10 5.6 0.8 0.4 0.1 0 0 | 0 0 0 0 0 0.15 18 0 0 | 2.4 0.4 0.1 0.8 40 212 20 1 5600;ferm;One tablespoon holds a third of a day's sodium. Check the bottle says gluten-free: most tamari is, but not all.
miso;Miso (rice/soy);herbs;3;18;1 tbsp;198 12.8 25.4 5.4 6.2 6 1 0 | 4 0 0 0 29 0.23 19 0.1 72 | 2.5 2.6 0.42 7 48 210 57 1 3728;ferm;Barley miso contains gluten. Don't boil miso if you want live cultures.
soy-sauce;Soy sauce (regular, brewed with wheat);herbs;3;15;1 tbsp;53 8.1 4.9 0.8 0.4 0.6 0.1 0 | 0 0 0 0 0 0.15 18 0 0 | 1.5 0.4 0.1 0.5 40 212 20 1 5500;gluten ferm;Standard soy sauce is brewed with wheat, and it's the most common hidden gluten in Chinese, Japanese and Thai food. Use tamari labelled gluten-free.
couscous;Couscous (dry);grains;3;60;60 g dry;376 12.8 72.4 5 0 0.6 0.1 0 | 0 0 0 0.1 0.1 0.08 20 0 0 | 1.1 0.8 0.25 27.5 44 166 24 2 10;gluten;Made from wheat semolina. Swap for quinoa or buckwheat.
barley;Pearl barley (dry);grains;1;60;60 g dry;352 9.9 62 15.6 0.8 1.2 0.2 0 | 1 0 0 0 2.2 0.11 23 0 38 | 2.5 2.1 0.42 37.7 79 280 29 2 9;gluten phy preb lowgi;Contains gluten (hordein). Barley malt and malt extract in cereals and some chocolate are hidden sources.
rye-bread;Rye bread;grains;3;80;2 slices;259 8.5 41 5.8 3.9 3.3 0.6 0 | 1 0.4 0 0.3 1.2 0.33 110 0 15 | 2.8 1.1 0.19 30.9 40 166 73 2 600;gluten;Rye contains gluten (secalin). Not safe for coeliac disease.
seitan;Seitan (wheat gluten);legumes;3;100;100 g;370 75 14 0.6 0 1.9 0.3 0 | 0 0 0 0 0 0.1 10 0 0 | 5.2 0.9 0.2 30 25 100 140 1 30;gluten;Seitan is pure wheat gluten, sold as "wheat meat". Coeliacs must never eat it.
acv;Apple cider vinegar;drinks;2;15;1 tbsp;22 0 0.9 0 0.4 0 0 0 | 0 0 0 0 0 0 0 0 0 | 0.2 0 0 0.1 5 73 7 0 5;ferm;Slightly blunts the blood-sugar rise from a starchy meal in small studies. Always dilute it, because acid erodes tooth enamel.
`;

/** Parses rows in the format described at the top of this file. "?" marks a value the source doesn't record. */
export function parseRows(raw: string, source: Food['source']): Food[] {
  return raw
    .trim()
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((line) => {
      const [id, name, category, nova, pg, pl, nums, tags, note, alias] = line.split(';');
      const cells = nums.replace(/\|/g, ' ').trim().split(/\s+/);
      if (cells.length !== NUTRIENT_KEYS.length || cells.some((c) => c !== '?' && Number.isNaN(Number(c)))) {
        throw new Error(`Food row "${id}" has ${cells.length} values, expected ${NUTRIENT_KEYS.length}`);
      }
      const unknown = NUTRIENT_KEYS.filter((_, i) => cells[i] === '?');
      const n = Object.fromEntries(NUTRIENT_KEYS.map((k, i) => [k, cells[i] === '?' ? 0 : Number(cells[i])])) as Nutrients;
      return {
        id,
        name,
        category: category as Category,
        nova: Number(nova) as Food['nova'],
        portion: { g: Number(pg), label: pl },
        n,
        tags: (tags ?? '').split(/\s+/).filter(Boolean) as Tag[],
        note: note?.trim() || undefined,
        alias: alias?.trim() || ALIAS[id],
        unknown: unknown.length ? unknown : undefined,
        source,
      };
    });
}

/** Extra search words for library foods. */
const ALIAS: Record<string, string> = {
  venison: 'diced venison deer haunch loin venison steak casserole',
  'beef-mince-lean': 'lean mince steak mince 5% mince ground beef',
  'beef-mince-20': 'mince 20% ground beef',
  sirloin: 'steak rump diced beef fillet steak',
  'lamb-leg': 'diced lamb lamb leg steak',
  'chicken-breast': 'diced chicken chicken fillet',
  'chicken-thigh': 'diced thigh',
  'salmon-wild': 'salmon fillet wild salmon',
  cod: 'cod loin',
  eggs: 'egg free range',
  'greek-yogurt': 'yoghurt yogurt greek',
  oysters: 'oyster rock oysters',
  'beef-liver': 'ox liver liver',
  'brazil-nuts': 'brazil nut',
  evoo: 'olive oil extra virgin',
  'bone-broth': 'broth stock',
  prawns: 'shrimp king prawns',
  rocket: 'arugula',
  courgette: 'zucchini',
  aubergine: 'eggplant',
};

export const FOODS: Food[] = parseRows(RAW, 'library');
export const UK_FOODS: Food[] = parseRows(UK_RAW, 'uk');

type UsdaRow = [string, string, string, Category, number, number, string, (number | null)[], string, string];
export const USDA_FOODS: Food[] = (usda as unknown as { foods: UsdaRow[] }).foods.map(([id, name, alias, category, nova, pg, pl, vals, tags, note]) => {
  const unknown = NUTRIENT_KEYS.filter((_, i) => vals[i] === null);
  return {
    id,
    name,
    category,
    nova: nova as Food['nova'],
    portion: { g: pg, label: pl },
    n: Object.fromEntries(NUTRIENT_KEYS.map((k, i) => [k, vals[i] ?? 0])) as Nutrients,
    tags: tags.split(' ').filter(Boolean) as Tag[],
    note: note || undefined,
    alias: alias || undefined,
    unknown: unknown.length ? (unknown as NKey[]) : undefined,
    source: 'usda' as const,
  };
});

/** Everything searchable: Glow's curated library first, then UK staples, then the USDA database. */
export const ALL_FOODS: Food[] = [...FOODS, ...UK_FOODS, ...USDA_FOODS];
export const FOOD_BY_ID = new Map(ALL_FOODS.map((f) => [f.id, f]));
