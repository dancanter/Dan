import type { NKey } from './nutrients';
import type { Tag } from './foods';

export type Evidence = 'strong' | 'moderate' | 'emerging' | 'speculative';

export const EVIDENCE_LABEL: Record<Evidence, string> = {
  strong: 'Strong: consistent human trials or guidelines',
  moderate: 'Moderate: good observational data and some trials',
  emerging: 'Emerging: small trials or mechanistic human data',
  speculative: 'Speculative: mostly cell or animal studies',
};

// ── Sources ──────────────────────────────────────────────────────────────
export interface Source {
  id: string;
  cite: string;
  url: string;
}

export const SOURCES: Source[] = [
  { id: 'lopez-otin-2023', cite: 'López-Otín C. et al. (2023) Hallmarks of aging: an expanding universe. Cell 186, 243–278.', url: 'https://doi.org/10.1016/j.cell.2022.11.016' },
  { id: 'iarc-2015', cite: 'Bouvard V. et al. (2015) Carcinogenicity of consumption of red and processed meat. Lancet Oncology 16, 1599–1600.', url: 'https://doi.org/10.1016/S1470-2045(15)00444-1' },
  { id: 'sacn-2015', cite: 'SACN (2015) Carbohydrates and Health. Public Health England.', url: 'https://www.gov.uk/government/publications/sacn-carbohydrates-and-health-report' },
  { id: 'nhs-vitd', cite: 'NHS. Vitamin D.', url: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/' },
  { id: 'nhs-fish', cite: 'NHS. Fish and shellfish (portions and mercury advice).', url: 'https://www.nhs.uk/live-well/eat-well/food-types/fish-and-shellfish-nutrition/' },
  { id: 'nhs-vita', cite: 'NHS. Vitamin A (liver and the upper limit).', url: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-a/' },
  { id: 'reds-2023', cite: 'Mountjoy M. et al. (2023) IOC consensus statement on Relative Energy Deficiency in Sport (REDs). British Journal of Sports Medicine 57, 1073–1097.', url: 'https://doi.org/10.1136/bjsports-2023-106994' },
  { id: 'hall-2019', cite: 'Hall K.D. et al. (2019) Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomised controlled trial. Cell Metabolism 30, 67–77.', url: 'https://doi.org/10.1016/j.cmet.2019.05.008' },
  { id: 'lane-2024', cite: 'Lane M.M. et al. (2024) Ultra-processed food exposure and adverse health outcomes: umbrella review. BMJ 384, e077310.', url: 'https://doi.org/10.1136/bmj-2023-077310' },
  { id: 'wastyk-2021', cite: 'Wastyk H.C. et al. (2021) Gut-microbiota-targeted diets modulate human immune status. Cell 184, 4137–4153.', url: 'https://doi.org/10.1016/j.cell.2021.06.019' },
  { id: 'morton-2018', cite: 'Morton R.W. et al. (2018) Protein supplementation and resistance training gains: meta-analysis. British Journal of Sports Medicine 52, 376–384.', url: 'https://doi.org/10.1136/bjsports-2017-097608' },
  { id: 'hughes-2013', cite: 'Hughes M.C.B. et al. (2013) Sunscreen and prevention of skin aging: a randomized trial. Annals of Internal Medicine 158, 781–790.', url: 'https://doi.org/10.7326/0003-4819-158-11-201306040-00002' },
  { id: 'gbd-alcohol-2018', cite: 'GBD 2016 Alcohol Collaborators (2018) Alcohol use and burden for 195 countries. Lancet 392, 1015–1035.', url: 'https://doi.org/10.1016/S0140-6736(18)31310-2' },
  { id: 'holt-lunstad-2010', cite: 'Holt-Lunstad J. et al. (2010) Social relationships and mortality risk: a meta-analytic review. PLoS Medicine 7, e1000316.', url: 'https://doi.org/10.1371/journal.pmed.1000316' },
  { id: 'laukkanen-2015', cite: 'Laukkanen T. et al. (2015) Sauna bathing and fatal cardiovascular and all-cause mortality. JAMA Internal Medicine 175, 542–548.', url: 'https://doi.org/10.1001/jamainternmed.2014.8187' },
  { id: 'roberts-2015', cite: 'Roberts L.A. et al. (2015) Post-exercise cold water immersion attenuates acute anabolic signalling and long-term adaptations in muscle. Journal of Physiology 593, 4285–4301.', url: 'https://doi.org/10.1113/JP270570' },
  { id: 'drake-2013', cite: 'Drake C. et al. (2013) Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. Journal of Clinical Sleep Medicine 9, 1195–1200.', url: 'https://doi.org/10.5664/jcsm.3170' },
  { id: 'watson-2015', cite: 'Watson N.F. et al. (2015) Recommended amount of sleep for a healthy adult: AASM and SRS consensus. Sleep 38, 843–844.', url: 'https://doi.org/10.5665/sleep.4716' },
  { id: 'zaccaro-2018', cite: 'Zaccaro A. et al. (2018) How breath-control can change your life: a systematic review on slow breathing. Frontiers in Human Neuroscience 12, 353.', url: 'https://doi.org/10.3389/fnhum.2018.00353' },
  { id: 'estruch-2018', cite: 'Estruch R. et al. (2018) Primary prevention of cardiovascular disease with a Mediterranean diet supplemented with extra-virgin olive oil or nuts (PREDIMED). NEJM 378, e34.', url: 'https://doi.org/10.1056/NEJMoa1800389' },
  { id: 'uribarri-2010', cite: 'Uribarri J. et al. (2010) Advanced glycation end products in foods and a practical guide to their reduction in the diet. Journal of the American Dietetic Association 110, 911–916.', url: 'https://doi.org/10.1016/j.jada.2010.03.018' },
  { id: 'neelakantan-2020', cite: 'Neelakantan N. et al. (2020) Effect of coconut oil consumption on cardiovascular risk factors: systematic review and meta-analysis. Circulation 141, 803–814.', url: 'https://doi.org/10.1161/CIRCULATIONAHA.119.043052' },
  { id: 'efsa-ul', cite: 'EFSA (2024) Overview on Tolerable Upper Intake Levels.', url: 'https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values' },
];

// ── The eight cellular pillars ──────────────────────────────────────────
// The hallmarks of ageing (López-Otín 2023) are twelve, not eight. Several
// are not things food can meaningfully move, so the app groups the
// diet-relevant ones into eight pillars and says which hallmarks each one
// touches. Pillar 8 (skin) is not a hallmark: it's here because looking
// good is the point.

export type Component =
  | { kind: 'nutrient'; key: NKey; w: number }
  | { kind: 'tag'; tag: Tag; servings: number; w: number }
  | { kind: 'special'; key: 'energy' | 'fatShare' | 'sleep' | 'plants' | 'freeSugarLow' | 'protein'; w: number };

export interface Pillar {
  id: string;
  name: string;
  emoji: string;
  hallmarks: string[];
  what: string;
  why: string;
  evidence: Evidence;
  components: Component[];
  /** Points lost per serving of foods carrying these tags. */
  penalties: { tag: Tag; points: number }[];
  topTip: string;
}

export const PILLARS: Pillar[] = [
  {
    id: 'energy', name: 'Mitochondrial power', emoji: '⚡',
    hallmarks: ['Mitochondrial dysfunction'],
    what: 'Mitochondria are the power stations inside your cells. They burn food with oxygen to make ATP, the energy currency every cell spends. With age they become fewer, leakier and less efficient.',
    why: 'Iron, riboflavin, magnesium, copper and B12 are parts of the energy production chain itself. Dietary nitrate (rocket, beetroot) makes mitochondria use oxygen more efficiently. Creatine (meat, fish) is an instant ATP buffer. Too little total energy is the fastest way to throttle all of it.',
    evidence: 'moderate',
    components: [
      { kind: 'nutrient', key: 'iron', w: 2 },
      { kind: 'nutrient', key: 'b2', w: 1.5 },
      { kind: 'nutrient', key: 'magnesium', w: 1.5 },
      { kind: 'nutrient', key: 'b12', w: 1 },
      { kind: 'nutrient', key: 'copper', w: 1 },
      { kind: 'tag', tag: 'nitr', servings: 1, w: 1 },
      { kind: 'tag', tag: 'creat', servings: 1, w: 1 },
      { kind: 'tag', tag: 'coq', servings: 1, w: 0.5 },
      { kind: 'special', key: 'energy', w: 2.5 },
    ],
    penalties: [{ tag: 'alc', points: 12 }],
    topTip: 'A rocket or beetroot side most days, red meat or oily fish daily, and don’t let calories drop so low that your body starts rationing energy.',
  },
  {
    id: 'inflammation', name: 'Inflammation control', emoji: '🧊',
    hallmarks: ['Chronic inflammation ("inflammaging")', 'Altered intercellular communication'],
    what: 'Short bursts of inflammation heal you: that’s how training makes you fitter. "Inflammaging" is a low, constant background inflammation that rises with age and wears down tissue everywhere, skin included.',
    why: 'Omega-3s become resolvins, the signals that end inflammation. Polyphenols and fibre (via gut bacteria) calm inflammatory pathways. Ultra-processed food, fried oils, alcohol and excess sugar push the other way.',
    evidence: 'moderate',
    components: [
      { kind: 'nutrient', key: 'omega3', w: 3 },
      { kind: 'tag', tag: 'poly', servings: 4, w: 2 },
      { kind: 'nutrient', key: 'fibre', w: 1.5 },
      { kind: 'tag', tag: 'mufa', servings: 1, w: 1 },
      { kind: 'nutrient', key: 'magnesium', w: 0.5 },
      { kind: 'nutrient', key: 'vitD', w: 0.5 },
    ],
    penalties: [
      { tag: 'upf', points: 6 }, { tag: 'fried', points: 8 }, { tag: 'procmeat', points: 6 },
      { tag: 'addsug', points: 4 }, { tag: 'alc', points: 8 }, { tag: 'trans', points: 15 },
    ],
    topTip: 'Oily fish 2–3 times a week, a handful of berries daily, olive oil as your main fat.',
  },
  {
    id: 'dna', name: 'DNA & antioxidant shield', emoji: '🧬',
    hallmarks: ['Genomic instability', 'Telomere attrition', 'Epigenetic alterations'],
    what: 'Your DNA takes thousands of hits a day from normal metabolism. Telomeres, the protective caps on chromosomes, shorten each time a cell divides. Epigenetic marks (chemical tags that switch genes on and off) drift with age. That drift is what "biological age" clocks measure.',
    why: 'Folate, B12 and choline supply the methyl groups for epigenetic tagging and DNA building. Selenium and zinc build repair and antioxidant enzymes. Sulforaphane (broccoli) switches on Nrf2, your cells’ own antioxidant system, which is stronger than any antioxidant pill.',
    evidence: 'moderate',
    components: [
      { kind: 'nutrient', key: 'folate', w: 1.5 },
      { kind: 'nutrient', key: 'b12', w: 1 },
      { kind: 'nutrient', key: 'choline', w: 1 },
      { kind: 'nutrient', key: 'selenium', w: 1.5 },
      { kind: 'nutrient', key: 'zinc', w: 1 },
      { kind: 'nutrient', key: 'vitC', w: 1 },
      { kind: 'nutrient', key: 'vitE', w: 1 },
      { kind: 'tag', tag: 'sulf', servings: 1, w: 1.5 },
      { kind: 'tag', tag: 'carot', servings: 2, w: 1 },
    ],
    penalties: [{ tag: 'procmeat', points: 10 }, { tag: 'alc', points: 10 }, { tag: 'fried', points: 4 }],
    topTip: 'Eggs, leafy greens and one brassica (broccoli, kale, cabbage, rocket) every day, plus one Brazil nut.',
  },
  {
    id: 'glycation', name: 'Metabolic & glycation control', emoji: '🍯',
    hallmarks: ['Deregulated nutrient sensing'],
    what: 'Glycation is sugar sticking to proteins such as collagen, forming AGEs (advanced glycation end-products). AGEs make collagen stiff and yellowish, one reason skin sags and dulls. Nutrient sensing (insulin, mTOR, AMPK) is how cells decide whether to grow or repair.',
    why: 'Fibre and protein slow glucose spikes. Free sugars, sugary drinks and ultra-processed carbohydrate cause the biggest swings. Your training does a lot of the work here, because muscle soaks up glucose. Browning and charring meat also adds ready-made AGEs, so cook gently.',
    evidence: 'moderate',
    components: [
      { kind: 'nutrient', key: 'fibre', w: 2 },
      { kind: 'special', key: 'protein', w: 1 },
      { kind: 'nutrient', key: 'magnesium', w: 1 },
      { kind: 'special', key: 'freeSugarLow', w: 2.5 },
    ],
    penalties: [{ tag: 'addsug', points: 5 }, { tag: 'upf', points: 5 }, { tag: 'alc', points: 6 }, { tag: 'juice', points: 3 }, { tag: 'fried', points: 4 }],
    topTip: 'Keep free sugar under 30 g, put carbohydrate around training, and stew, poach or steam more than you char.',
  },
  {
    id: 'renewal', name: 'Autophagy & renewal', emoji: '♻️',
    hallmarks: ['Disabled macroautophagy', 'Loss of proteostasis', 'Cellular senescence', 'Stem cell exhaustion'],
    what: 'Autophagy means "self-eating": cells break down and recycle worn-out parts. Proteostasis is keeping proteins correctly folded. Senescent "zombie" cells stop dividing but don’t die, and leak inflammatory signals.',
    why: 'Spermidine (aged cheese, mushrooms, natto) and polyphenols trigger autophagy in animals. Human evidence is observational. Enough protein lets you rebuild what gets recycled. Deep sleep is when most repair happens.',
    evidence: 'emerging',
    components: [
      { kind: 'tag', tag: 'sperm', servings: 1, w: 1.5 },
      { kind: 'tag', tag: 'poly', servings: 4, w: 1.5 },
      { kind: 'special', key: 'protein', w: 2 },
      { kind: 'special', key: 'sleep', w: 2.5 },
    ],
    penalties: [{ tag: 'alc', points: 8 }, { tag: 'upf', points: 3 }],
    topTip: 'Sleep is the main repair window. Add mushrooms or a little aged cheese most days, and leave 12+ hours between dinner and breakfast if it suits your training.',
  },
  {
    id: 'gut', name: 'Gut microbiome', emoji: '🦠',
    hallmarks: ['Dysbiosis'],
    what: 'Trillions of gut bacteria ferment the fibre you can’t digest into short-chain fatty acids such as butyrate, which fuel your gut lining and calm the immune system. Dysbiosis is when that community loses diversity, which happens more with age.',
    why: 'Variety of plants (aim for 30+ different ones a week), fibre and fermented foods are the best-supported levers. In a 2021 Stanford trial, a high-fermented-food diet raised microbiome diversity and lowered 19 inflammatory markers.',
    evidence: 'moderate',
    components: [
      { kind: 'nutrient', key: 'fibre', w: 3 },
      { kind: 'special', key: 'plants', w: 2.5 },
      { kind: 'tag', tag: 'ferm', servings: 2, w: 2 },
      { kind: 'tag', tag: 'preb', servings: 2, w: 1 },
      { kind: 'tag', tag: 'poly', servings: 3, w: 1 },
    ],
    penalties: [{ tag: 'upf', points: 6 }, { tag: 'alc', points: 6 }],
    topTip: 'Kefir or yoghurt daily, a spoon of live sauerkraut or kimchi, and count your plants. Herbs and spices count.',
  },
  {
    id: 'hormones', name: 'Hormones & signalling', emoji: '🔥',
    hallmarks: ['Altered intercellular communication'],
    what: 'Hormones are your body’s long-distance messages: testosterone, thyroid hormone, cortisol, growth hormone. They decide whether your body builds or breaks down, holds water or sheds it, and sleeps deeply or lightly.',
    why: 'Zinc, vitamin D, selenium, iodine and magnesium are raw materials. Too little fat (under ~20% of energy) and low energy availability both suppress testosterone and thyroid hormone. Low energy is the single biggest risk for you at high training volume. Poor sleep cuts testosterone and raises cortisol, which feeds facial puffiness.',
    evidence: 'strong',
    components: [
      { kind: 'nutrient', key: 'zinc', w: 2 },
      { kind: 'nutrient', key: 'vitD', w: 1.5 },
      { kind: 'nutrient', key: 'selenium', w: 1 },
      { kind: 'nutrient', key: 'iodine', w: 1 },
      { kind: 'nutrient', key: 'magnesium', w: 1 },
      { kind: 'special', key: 'fatShare', w: 1.5 },
      { kind: 'special', key: 'energy', w: 3 },
      { kind: 'special', key: 'sleep', w: 2 },
    ],
    penalties: [{ tag: 'alc', points: 10 }],
    topTip: 'Eat enough, sleep 8+ hours, oysters or red meat for zinc, and take vitamin D from October to March.',
  },
  {
    id: 'skin', name: 'Skin, collagen & glow', emoji: '✨',
    hallmarks: ['Not a hallmark: skin is where the other eleven show on your face'],
    what: 'Skin is about 75% collagen by dry weight. From your mid-20s you lose roughly 1% a year. UV light, sugar (via glycation), smoking and poor sleep speed that up.',
    why: 'Vitamin C and copper are needed to make collagen, protein and glycine supply the material, and zinc and vitamin A run skin repair. Carotenoids (orange and red veg, salmon’s astaxanthin) build up in skin, add a healthy golden tone and give modest internal UV protection. But daily SPF does more for visible skin ageing than any food.',
    evidence: 'moderate',
    components: [
      { kind: 'nutrient', key: 'vitC', w: 2 },
      { kind: 'special', key: 'protein', w: 1 },
      { kind: 'tag', tag: 'carot', servings: 2, w: 1.5 },
      { kind: 'tag', tag: 'coll', servings: 1, w: 0.5 },
      { kind: 'tag', tag: 'lut', servings: 1, w: 0.5 },
      { kind: 'tag', tag: 'astax', servings: 1, w: 0.5 },
      { kind: 'nutrient', key: 'omega3', w: 1 },
      { kind: 'nutrient', key: 'vitA', w: 1 },
      { kind: 'nutrient', key: 'zinc', w: 1 },
      { kind: 'nutrient', key: 'copper', w: 0.5 },
      { kind: 'nutrient', key: 'vitE', w: 1 },
    ],
    penalties: [{ tag: 'addsug', points: 6 }, { tag: 'alc', points: 8 }, { tag: 'fried', points: 4 }, { tag: 'upf', points: 3 }],
    topTip: 'Red pepper or kiwi daily for vitamin C, something orange for carotenoids, oily fish, and SPF50 every morning.',
  },
];

// ── What each tag means for you ─────────────────────────────────────────
export const TAG_INFO: Partial<Record<Tag, { label: string; good: boolean; text: string }>> = {
  haem: { label: 'Haem iron', good: true, text: 'Haem iron (only in meat and fish) is absorbed at roughly 15–35%, against 2–20% for plant iron.' },
  phy: { label: 'Phytate', good: false, text: 'Phytate binds iron, zinc and calcium so you absorb less of them. Soaking, sprouting and fermenting reduce it, and vitamin C in the same meal helps iron.' },
  oxa: { label: 'Oxalate', good: false, text: 'Oxalate locks up calcium (and some iron) so very little is absorbed. The other nutrients are still valuable.' },
  poly: { label: 'Polyphenols', good: true, text: 'Plant compounds that switch on your cells’ defence and clean-up pathways and feed beneficial gut bacteria.' },
  poly2: { label: 'Very high polyphenols', good: true, text: 'Among the richest polyphenol sources there are.' },
  carot: { label: 'Carotenoids', good: true, text: 'Orange and red pigments that build up in skin, add a healthy golden tone and give modest internal UV protection. Absorption rises with cooking and a little fat.' },
  lut: { label: 'Lutein', good: true, text: 'A yellow carotenoid that collects in your eyes (macula) and skin.' },
  sulf: { label: 'Sulforaphane / glucosinolates', good: true, text: 'Activates Nrf2, the master switch for your own antioxidant and detox enzymes. Chop and wait before cooking.' },
  sperm: { label: 'Spermidine', good: true, text: 'Triggers autophagy (cellular recycling) in animal studies. Higher intake is linked with longer life in observational human data.' },
  ferm: { label: 'Fermented', good: true, text: 'Live microbes and fermentation products that raised microbiome diversity in trials.' },
  preb: { label: 'Prebiotic fibre', good: true, text: 'Fibre that feeds beneficial gut bacteria (inulin, resistant starch, beta-glucan, pectin).' },
  coll: { label: 'Collagen / glycine', good: true, text: 'Supplies glycine and proline, collagen’s building blocks.' },
  creat: { label: 'Creatine', good: true, text: 'Naturally present in meat and fish. It buffers ATP for sprints, lifting and possibly the brain.' },
  coq: { label: 'CoQ10', good: true, text: 'Part of the mitochondrial energy chain. Richest in heart, organ meats and oily fish.' },
  astax: { label: 'Astaxanthin', good: true, text: 'The red carotenoid in salmon, prawns and roe. A potent membrane antioxidant, with small trials in skin elasticity.' },
  nitr: { label: 'Dietary nitrate', good: true, text: 'Turned into nitric oxide: wider blood vessels, lower blood pressure, more efficient mitochondria.' },
  ala: { label: 'Plant omega-3 (ALA)', good: true, text: 'Useful, but less than 10% converts to the EPA and DHA in fish.' },
  mufa: { label: 'Monounsaturated fat', good: true, text: 'The heart-friendly fat of the Mediterranean diet.' },
  evoo: { label: 'Extra virgin olive oil', good: true, text: 'Its polyphenols are what set it apart from other oils.' },
  lowgi: { label: 'Low GI', good: true, text: 'Releases glucose slowly.' },
  highgi: { label: 'High GI', good: false, text: 'Spikes blood glucose fast. Useful around hard sessions, less so at a desk.' },
  upf: { label: 'Ultra-processed', good: false, text: 'Industrial formulations. In a controlled trial they made people eat about 500 kcal a day more without noticing, and they are linked with 32 harmful health outcomes in a 2024 umbrella review.' },
  addsug: { label: 'Free sugar', good: false, text: 'Drives glycation, which stiffens collagen. The UK limit is 30 g a day.' },
  juice: { label: 'Juice sugar', good: false, text: 'Juicing turns natural fruit sugar into free sugar.' },
  procmeat: { label: 'Processed meat', good: false, text: 'Classed as a Group 1 carcinogen for bowel cancer by the WHO’s cancer agency.' },
  fried: { label: 'Deep-fried', good: false, text: 'Reheated frying oils carry oxidised fats and lots of AGEs.' },
  alc: { label: 'Alcohol', good: false, text: 'Fragments deep sleep, raises cortisol, dehydrates and inflames skin, and is a carcinogen at any dose.' },
  trans: { label: 'Trans fat', good: false, text: 'The single most harmful fat. Now rare in the UK.' },
  merc: { label: 'Some mercury', good: false, text: 'Big predatory fish build up mercury. Vary your fish.' },
  merc2: { label: 'High mercury', good: false, text: 'NHS advice: no more than one portion a week.' },
  gluten: { label: 'Contains gluten', good: false, text: 'Contains wheat, barley or rye.' },
  oats: { label: 'Oats', good: true, text: 'Oats are naturally gluten-free but usually cross-contaminated. Choose certified gluten-free if you need to.' },
  caff: { label: 'Caffeine', good: true, text: 'Great before training. Keep it at least 8 hours before bed.' },
  retinol: { label: 'Retinol', good: true, text: 'Ready-made vitamin A: no conversion needed, but it counts towards the upper limit.' },
  seHigh: { label: 'Selenium bomb', good: true, text: 'One or two a day, not a handful.' },
  iodHigh: { label: 'Extreme iodine', good: false, text: 'Can exceed the safe upper limit in a few grams.' },
  raw: { label: 'Eaten raw', good: false, text: 'Raw shellfish carries a small food-poisoning risk.' },
};

// ── Things to cut out, and why ───────────────────────────────────────────
export interface CutItem {
  title: string;
  verdict: 'cut' | 'limit' | 'swap';
  why: string;
  instead: string;
  pillars: string[];
  evidence: Evidence;
  sources: string[];
}

export const CUT_OUT: CutItem[] = [
  { title: 'Under-eating while training hard', verdict: 'cut', evidence: 'strong', pillars: ['hormones', 'energy', 'skin'], sources: ['reds-2023'],
    why: 'This is the big one, and it’s yours. When the energy left after training (energy availability) drops below about 30 kcal per kg of fat-free mass, the body downregulates testosterone and thyroid hormone, sleeps worse, heals slower, loses bone, and your face shows it: dull skin, hollow eyes, puffiness from raised cortisol. An aggressive cut stacked on four lifts, 3–4 runs and 13k steps a day can land there.',
    instead: 'Cut slowly (0.25–0.5% body weight a week), keep carbohydrate around hard sessions, and check the energy availability card on the Body screen.' },
  { title: 'Alcohol', verdict: 'cut', evidence: 'strong', pillars: ['hormones', 'renewal', 'skin', 'inflammation'], sources: ['gbd-alcohol-2018'],
    why: 'It fragments REM and deep sleep, lowers testosterone, raises cortisol, dehydrates and inflames skin (redness, puffiness), cuts muscle protein synthesis after training, and is a carcinogen with no safe dose for cancer risk.',
    instead: 'Sparkling water with lime and bitters, kombucha, or a non-alcoholic beer.' },
  { title: 'Ultra-processed food', verdict: 'cut', evidence: 'strong', pillars: ['inflammation', 'gut', 'glycation'], sources: ['hall-2019', 'lane-2024'],
    why: 'Crisps, biscuits, ready meals, sweets and most bars. In a controlled trial people ate about 500 kcal a day more on ultra-processed food without noticing. They are linked with heart disease, type 2 diabetes, depression and early death.',
    instead: 'Whole foods you could cook from: eggs, meat, fish, potatoes, rice, fruit, veg, nuts.' },
  { title: 'Processed meat (bacon, ham, salami, most sausages)', verdict: 'limit', evidence: 'strong', pillars: ['dna', 'inflammation'], sources: ['iarc-2015'],
    why: 'A Group 1 carcinogen. Every 50 g a day raises bowel cancer risk by about 18%. The nitrites and haem form N-nitroso compounds in the gut.',
    instead: 'Fresh butcher meat. If you have it occasionally, eat it with vegetables (vitamin C and polyphenols reduce nitrosamine formation).' },
  { title: 'Sugary drinks and juice', verdict: 'cut', evidence: 'strong', pillars: ['glycation', 'skin'], sources: ['sacn-2015'],
    why: 'Liquid free sugar spikes glucose without filling you up. A can of cola is over a day’s free-sugar limit. Glycation stiffens and yellows collagen over years.',
    instead: 'Water, sparkling water, black coffee, green tea, kefir. Eat the fruit whole.' },
  { title: 'Deep-fried and charred food', verdict: 'limit', evidence: 'moderate', pillars: ['glycation', 'inflammation', 'dna'], sources: ['uribarri-2010'],
    why: 'High dry heat makes AGEs and, in meat, heterocyclic amines and PAHs (DNA-damaging compounds). Grilled and fried meat can carry several times the AGEs of stewed or poached meat.',
    instead: 'Stew, poach, steam, slow-roast. Marinate meat in lemon, herbs and olive oil before grilling, which cuts heterocyclic amine formation in studies. Don’t eat the blackened bits.' },
  { title: 'Late caffeine', verdict: 'limit', evidence: 'moderate', pillars: ['renewal', 'hormones'], sources: ['drake-2013'],
    why: 'Caffeine taken 6 hours before bed still cut sleep by about an hour in a controlled study, and you may not notice the shallower sleep.',
    instead: 'Last coffee by about 2pm, or at least 8 hours before bed.' },
  { title: 'Unprotected sun on your face', verdict: 'cut', evidence: 'strong', pillars: ['skin', 'dna'], sources: ['hughes-2013'],
    why: 'UV causes most visible facial ageing (photoageing). In a 4.5-year randomised trial, daily sunscreen users showed no detectable increase in skin ageing.',
    instead: 'Keep SPF50 every morning, including winter and cloudy days, and get daylight on your eyes and body instead.' },
  { title: 'High-mercury fish more than weekly', verdict: 'limit', evidence: 'strong', pillars: ['dna'], sources: ['nhs-fish'],
    why: 'Swordfish, shark and marlin build up methylmercury, a neurotoxin.',
    instead: 'Small oily fish: sardines, mackerel, anchovies, herring, wild salmon.' },
  { title: 'Liver more than once a week (or with cod liver oil)', verdict: 'limit', evidence: 'strong', pillars: ['skin', 'dna'], sources: ['nhs-vita'],
    why: '100 g of beef liver carries about 5,000 µg of retinol, against a 3,000 µg daily upper limit. Long-term excess is linked with lower bone density and liver strain. It’s also very high in copper.',
    instead: 'One 100 g portion a week, or 30–50 g twice a week. Heart and kidney give organ-meat benefits without the vitamin A load.' },
  { title: 'More than 2 Brazil nuts a day', verdict: 'limit', evidence: 'moderate', pillars: ['dna', 'hormones'], sources: ['efsa-ul'],
    why: 'Selenium is protective at the right dose and toxic above it (hair loss, brittle nails, fatigue). A single nut can hold 50–100 µg; the upper limit is 255 µg.',
    instead: '1–2 a day, not a handful.' },
  { title: 'Megadose antioxidant supplements', verdict: 'cut', evidence: 'moderate', pillars: ['energy', 'dna'], sources: [],
    why: 'High-dose vitamin C and E taken around training blunted the mitochondrial adaptations to exercise in several trials. Your cells’ own antioxidant system, which polyphenols and sulforaphane switch on, works better.',
    instead: 'Get antioxidants from colourful food.' },
  { title: 'Swapping olive oil for coconut oil because "saturated fat is fine"', verdict: 'swap', evidence: 'strong', pillars: ['inflammation'], sources: ['neelakantan-2020', 'estruch-2018'],
    why: 'Coconut oil raises LDL compared with plant oils. Extra virgin olive oil is the most consistently protective fat in trials.',
    instead: 'EVOO for most cooking and dressing. Tallow and butter as flavour, not the default.' },
  { title: 'A big salt jump the night before an event or photo', verdict: 'limit', evidence: 'moderate', pillars: ['skin'], sources: [],
    why: 'A sudden rise in sodium above your usual intake makes you hold water, which shows on the face next morning (along with alcohol and short sleep).',
    instead: 'Keep sodium steady day to day, eat potassium-rich food (potatoes, avocado, leafy greens, yoghurt) and sleep 8+ hours.' },
];

// ── Daily rituals (everything except training) ──────────────────────────
export interface Ritual {
  id: string;
  title: string;
  points: number;
  why: string;
  evidence: Evidence;
  sources?: string[];
}

export const RITUALS: Ritual[] = [
  { id: 'daylight', title: 'Morning daylight on your eyes (10+ min outside)', points: 3, evidence: 'moderate',
    why: 'Bright morning light sets your master body clock, which times cortisol (up in the morning, down at night), melatonin and deep sleep. Even overcast UK daylight is far brighter than indoor light.' },
  { id: 'spf', title: 'SPF50 on face, neck and ears', points: 3, evidence: 'strong', sources: ['hughes-2013'],
    why: 'The best-evidenced anti-ageing habit for your face. Already part of your routine, so this just keeps the streak honest.' },
  { id: 'breathe', title: '10 minutes of slow breathing or meditation', points: 3, evidence: 'moderate', sources: ['zaccaro-2018'],
    why: 'Breathing at about 6 breaths a minute increases heart-rate variability and calms the stress response. Lower cortisol helps sleep and facial puffiness. Use the pacer below.' },
  { id: 'nocaff', title: 'No caffeine after 2pm', points: 2, evidence: 'moderate', sources: ['drake-2013'],
    why: 'Protects deep sleep, the main repair window.' },
  { id: 'winddown', title: 'Dim lights and screens down 45 min before bed', points: 2, evidence: 'moderate',
    why: 'Bright light at night delays melatonin. The point is the stimulation and light, not blue light alone.' },
  { id: 'lastmeal', title: 'Last meal 2–3 hours before bed', points: 1, evidence: 'emerging',
    why: 'Large late meals can disturb sleep and keep insulin raised overnight. A protein snack (Greek yoghurt) is fine for recovery.' },
  { id: 'hydrate', title: '2+ litres of fluid (pale-yellow urine)', points: 1, evidence: 'emerging',
    why: 'Mostly about performance and puffiness. Being dehydrated makes you hold water. The evidence that extra water improves skin is weak.' },
  { id: 'social', title: 'Real connection: a call, a meal, a laugh with someone', points: 2, evidence: 'strong', sources: ['holt-lunstad-2010'],
    why: 'Strong social ties were associated with about 50% better survival odds in a meta-analysis of 148 studies, comparable to quitting smoking. Easily the most underrated longevity habit.' },
  { id: 'nature', title: '20+ minutes in green space or by water (not a training run)', points: 1, evidence: 'moderate',
    why: 'Linked with lower stress hormones and better mood in many studies.' },
  { id: 'floss', title: 'Floss / interdental brush', points: 1, evidence: 'moderate',
    why: 'Gum disease is a source of chronic inflammation and is associated with heart disease. It also protects your smile.' },
  { id: 'heat', title: 'Sauna or hot bath (optional)', points: 1, evidence: 'moderate', sources: ['laukkanen-2015'],
    why: 'Finnish cohorts link 4–7 sauna sessions a week with much lower cardiovascular mortality. Observational, but plausible (heat-shock proteins, blood vessel function). A warm bath 1–2 hours before bed also helps you fall asleep.' },
  { id: 'gratitude', title: 'One line in a journal: something good today', points: 1, evidence: 'emerging',
    why: 'Small trials show modest gains in mood and sleep. It takes 30 seconds.' },
];

// ── Boosters (non-training extras worth knowing) ────────────────────────
export const BOOSTERS: { title: string; text: string; evidence: Evidence }[] = [
  { title: 'Vitamin D, October to March', evidence: 'strong', text: 'The NHS advises 10 µg (400 IU) a day for everyone in the UK in autumn and winter, because the sun is too low for your skin to make it. This is the one supplement to start this week. It’s cheap, and a blood test can tell you if you need more.' },
  { title: 'A blood panel once a year', evidence: 'strong', text: 'Ferritin (iron stores, often low in runners), vitamin D, B12, full blood count, lipids, HbA1c, thyroid (TSH) and, if your energy or libido dips during the cut, testosterone. Ask your GP, or use a reputable private lab. Measure, don’t guess.' },
  { title: 'Creatine monohydrate, 3–5 g a day', evidence: 'strong', text: 'The best-evidenced sports supplement for strength, sprint performance and lean mass, with emerging evidence for brain function when sleep-deprived. Optional: you already get 1–2 g a day from meat and fish.' },
  { title: 'Sleep regularity over sleep hacks', evidence: 'strong', text: 'Waking at the same time every day (within 30 minutes, weekends included) is linked with lower mortality and better metabolic health, independent of duration. It beats every gadget.' },
  { title: 'Cold water: timing matters', evidence: 'moderate', text: 'Cold plunges feel great and can lift mood and alertness. Don’t do them in the 4 hours after lifting: they blunted muscle growth in a controlled trial. Mornings or separate days are fine.' },
  { title: 'Nose breathing and mouth tape', evidence: 'speculative', text: 'Popular online, with little evidence and some risk if you have sleep apnoea. Skip it unless a clinician recommends it.' },
  { title: 'Time-restricted eating', evidence: 'emerging', text: 'Trials suggest most of the benefit comes from eating less overall. With your training load it can make fuelling harder. A 12-hour overnight gap is plenty; you don’t need 16:8.' },
  { title: 'Red-light panels, NAD+ boosters, resveratrol', evidence: 'speculative', text: 'Interesting lab science, weak or absent human outcome data, and they cost money. Low value compared with sleep, food and SPF.' },
];

// ── Glossary ─────────────────────────────────────────────────────────────
export const GLOSSARY: [string, string][] = [
  ['Bioavailability', 'How much of a nutrient you actually absorb and use, not just how much is in the food. Haem iron from beef is several times more bioavailable than iron from spinach.'],
  ['Mitochondria', 'Tiny structures inside cells that burn food with oxygen to make ATP, the energy every cell runs on.'],
  ['ATP', 'Adenosine triphosphate: the cell’s energy currency, spent by every muscle contraction and every repair job.'],
  ['Autophagy', 'Literally "self-eating". Cells break down damaged parts and recycle them. It slows with age.'],
  ['Senescent cells', '"Zombie" cells that have stopped dividing but won’t die, and leak inflammatory signals into the tissue around them.'],
  ['Oxidative stress', 'When reactive molecules (free radicals) damage fats, proteins and DNA faster than your antioxidant defences can neutralise them.'],
  ['Free radical', 'An unstable molecule missing an electron. It steals one from whatever it touches, damaging it.'],
  ['Nrf2', 'A master switch in your cells that turns on hundreds of your own antioxidant and detox genes. Sulforaphane and exercise both flip it.'],
  ['Glycation / AGEs', 'Sugar molecules sticking to proteins, forming advanced glycation end-products. In skin they stiffen collagen and cause sagging.'],
  ['Collagen', 'The main structural protein in skin, tendons and bone. Your body makes it from glycine, proline and vitamin C.'],
  ['Inflammaging', 'Low-grade, constant inflammation that rises with age. It’s different from the healthy short bursts after training.'],
  ['Telomeres', 'Protective caps on the ends of chromosomes, like the plastic tips on shoelaces. They shorten as cells divide.'],
  ['Epigenetics', 'Chemical tags on DNA that switch genes on or off without changing the code. They drift with age, which "biological age" tests measure.'],
  ['Methylation', 'Adding a small chemical tag (methyl group) to DNA or other molecules. It depends on folate, B12, choline and B2.'],
  ['Microbiome / dysbiosis', 'The community of microbes in your gut. Dysbiosis is when it loses diversity or balance.'],
  ['Short-chain fatty acids', 'Compounds such as butyrate that gut bacteria make from fibre. They feed your gut lining and calm inflammation.'],
  ['Polyphenols', 'Thousands of plant compounds (in berries, cocoa, coffee, tea, olive oil) that trigger protective responses in your cells.'],
  ['Carotenoids', 'Yellow, orange and red plant pigments (beta-carotene, lycopene, lutein). Some become vitamin A, and they collect in skin.'],
  ['Retinol / RAE', 'Retinol is ready-made vitamin A from animal foods. RAE (retinol activity equivalents) counts plant carotenoids at their real conversion rate.'],
  ['Haem iron', 'Iron in the form found in blood and muscle. Only meat and fish have it, and it absorbs far better than plant iron.'],
  ['Phytate', 'A compound in grains, beans, nuts and seeds that binds minerals and reduces their absorption.'],
  ['Oxalate', 'A compound in spinach, beet greens and rhubarb that locks up calcium.'],
  ['EPA & DHA', 'The long-chain omega-3 fats from fish. They are built into cell membranes and become anti-inflammatory signals.'],
  ['Energy availability', 'The calories left for the rest of your body after training is paid for, per kg of fat-free mass. Below about 30 is low; 45 is the healthy target.'],
  ['Fat-free mass', 'Everything that isn’t fat: muscle, bone, organs, water.'],
  ['REDs', 'Relative Energy Deficiency in Sport: the health and performance problems caused by chronically low energy availability.'],
  ['Cortisol', 'The main stress hormone. Healthy in a morning peak; chronically high, it disrupts sleep, breaks down muscle and causes water retention.'],
  ['Circadian rhythm', 'Your roughly 24-hour body clock, set mainly by light. It times hormones, digestion, body temperature and sleep.'],
  ['HRV', 'Heart-rate variability: the natural variation between heartbeats. Higher generally means a calmer, more adaptable nervous system.'],
  ['NOVA', 'A system that grades food by processing: 1 unprocessed, 2 culinary ingredients, 3 processed, 4 ultra-processed.'],
  ['Upper limit (UL)', 'The highest daily intake considered safe long-term. More is not better past this point.'],
  ['Spermidine', 'A compound in aged cheese, mushrooms, natto and wheat germ that triggers autophagy in animals.'],
];
