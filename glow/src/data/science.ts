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
  { id: 'nice-ng20', cite: 'NICE (2015) Coeliac disease: recognition, assessment and management (NG20).', url: 'https://www.nice.org.uk/guidance/ng20' },
  { id: 'coeliac-uk', cite: 'Coeliac UK. The gluten-free diet.', url: 'https://www.coeliac.org.uk/' },
  { id: 'hurrell-2010', cite: 'Hurrell R. & Egli I. (2010) Iron bioavailability and dietary reference values. American Journal of Clinical Nutrition 91, 1461S–1467S.', url: 'https://doi.org/10.3945/ajcn.2010.28674F' },
  { id: 'nhs-iron', cite: 'NHS. Iron.', url: 'https://www.nhs.uk/conditions/vitamins-and-minerals/iron/' },
  { id: 'epel-2004', cite: 'Epel E.S. et al. (2004) Accelerated telomere shortening in response to life stress. PNAS 101, 17312–17315.', url: 'https://doi.org/10.1073/pnas.0407162101' },
  { id: 'ristow-2009', cite: 'Ristow M. et al. (2009) Antioxidants prevent health-promoting effects of physical exercise in humans. PNAS 106, 8665–8670.', url: 'https://doi.org/10.1073/pnas.0903485106' },
  { id: 'gkogkolou-2012', cite: 'Gkogkolou P. & Böhm M. (2012) Advanced glycation end products: key players in skin aging? Dermato-Endocrinology 4, 259–270.', url: 'https://doi.org/10.4161/derm.22028' },
  { id: 'suez-2022', cite: 'Suez J. et al. (2022) Personalized microbiome-driven effects of non-nutritive sweeteners on human glucose tolerance. Cell 185, 3307–3328.', url: 'https://doi.org/10.1016/j.cell.2022.07.016' },
  { id: 'who-nss-2023', cite: 'WHO (2023) Use of non-sugar sweeteners: WHO guideline.', url: 'https://www.who.int/publications/i/item/9789240073616' },
  { id: 'who-aspartame-2023', cite: 'WHO/IARC/JECFA (2023) Aspartame hazard and risk assessment results released.', url: 'https://www.who.int/news/item/14-07-2023-aspartame-hazard-and-risk-assessment-results-released' },
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
  sweetener: { label: 'Sweeteners', good: false, text: 'Zero sugar, which beats sugar. But the WHO advises against relying on them, sucralose and saccharin altered gut bacteria and glucose response in some people in a 2022 trial, and all-day sweetness keeps cravings tuned high. Low risk in moderation; not something to sip all day.' },
  acidic: { label: 'Acidic drink', good: false, text: 'Citric and phosphoric acid soften tooth enamel. Sipping all day never gives saliva the 30–60 minutes it needs to re-harden it. Drink with meals or through a straw, and rinse with water after.' },
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
  { id: 'joy', title: 'One thing from the joy menu (below)', points: 2, evidence: 'moderate',
    why: 'Real, lasting rewards (mastery, connection, nature, anticipation) instead of the cheap dopamine of scrolling.' },
  { id: 'nosip', title: 'Squash and diet drinks only with meals, water in between', points: 1, evidence: 'moderate',
    why: 'Gives your enamel time to re-harden between acid hits, and turns down the all-day sweetness. Lemon, lime or cucumber water and cold green tea fill the gap.' },
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
  { title: 'A blood panel once a year', evidence: 'strong', text: 'With coeliac disease, NICE recommends an annual review anyway. Ask for ferritin (iron stores, often low in runners and coeliacs), folate, vitamin D, B12, full blood count, the coeliac antibody test (tTG-IgA), lipids, HbA1c, thyroid (TSH) and, if your energy or libido dips during the cut, testosterone. Ask your GP, or use a reputable private lab. Measure, don’t guess.' },
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

// ── Coeliac disease ─────────────────────────────────────────────────────
export const COELIAC_AVOID: { group: string; level: 'never' | 'check' | 'risk'; items: string; note?: string }[] = [
  { group: 'Grains that always contain gluten', level: 'never',
    items: 'Wheat in every form: spelt, kamut (khorasan), durum, semolina, einkorn, emmer, farro, freekeh, bulgur, couscous. Also barley, rye, triticale and seitan (pure wheat gluten).' },
  { group: 'Foods that usually contain gluten', level: 'never',
    items: 'Bread, wraps, pitta, naan, pasta, pastry, pies, pizza, cakes, biscuits, crackers, most breakfast cereals, udon and most egg noodles, batter and breadcrumbs (fish and chips, scampi, nuggets, schnitzel), beer, lager, ale and stout (unless labelled gluten-free).' },
  { group: 'Hidden gluten: read every label', level: 'check',
    items: 'Soy sauce (use gluten-free tamari), stock cubes and gravy granules, sauces, marinades and dressings, sausages and burgers (rusk), meatballs and fishcakes, ready meals and soups, flavoured crisps and nuts, barley malt extract (some cereals, chocolate, malted drinks), seasoning mixes, some sweets and liquorice.',
    note: 'In the UK, wheat, barley, rye and oats must be in bold in the ingredients list, so check the bold words. Malt vinegar and distilled spirits (including whisky) are considered safe by Coeliac UK because the gluten doesn’t carry through in any meaningful amount.' },
  { group: 'Oats', level: 'check',
    items: 'Only oats labelled gluten-free. Ordinary oats are grown and milled alongside wheat and barley. A small minority of coeliacs also react to avenin, the protein in oats themselves. If symptoms continue on GF oats, drop them for a while and tell your GP.' },
  { group: 'Cross-contamination: the gluten you can’t see', level: 'risk',
    items: 'Shared toasters (use toaster bags), chip-shop fryers where chips share oil with battered fish, butter, jam and spreads with crumbs from someone else’s knife, shared colanders, wooden boards and sieves, flour in the air in bakeries and pizza places, "may contain gluten" labels.',
    note: 'A crumb-sized amount (tens of milligrams a day) can keep the gut lining inflamed even without obvious symptoms.' },
  { group: 'Eating out', level: 'risk',
    items: 'Ask whether there’s a separate fryer and a gluten-free prep area. Look for Coeliac UK GF accreditation. Chinese and Japanese food: soy sauce is in almost everything. Indian: naan, and asafoetida (hing) is often cut with wheat flour. Thai: soy sauce and oyster sauce. Steak, fish and potatoes, or a rice dish without soy, are usually the safest orders.' },
];

export const COELIAC_SAFE =
  'Naturally gluten-free: all fresh meat, fish, shellfish and eggs, milk, yoghurt, kefir and plain cheese, potatoes and sweet potatoes, rice, buckwheat, quinoa, millet, corn (maize), amaranth, teff, sorghum, beans and lentils, nuts and seeds, all fruit and vegetables, olive oil, butter, wine, cider and spirits. Your Glow staples are almost all in this list.';

export const COELIAC_NUTRITION: { title: string; text: string }[] = [
  { title: 'Gluten is your biggest absorption blocker', text: 'In coeliac disease, gluten makes your immune system attack the villi, the finger-like folds that line your small intestine and absorb nutrients. When they’re flattened (villous atrophy), you absorb less iron, folate, calcium, vitamin D, zinc, B12 and fat-soluble vitamins, however good your food is. Strict gluten-free eating lets the villi regrow. That takes months to a couple of years in adults, and repeated small exposures keep resetting it.' },
  { title: 'The nutrients to watch', text: 'Iron (the most common deficiency at diagnosis), folate, vitamin D, calcium (bone density is often lower in coeliac disease), zinc and B12. Your diet of red meat, organ meats, oysters, eggs, salmon, dairy and leafy greens covers these unusually well. The question is whether you’re absorbing them, which only a blood test can tell you.' },
  { title: 'Gluten-free products aren’t fortified the same way', text: 'UK wheat flour must have calcium, iron, thiamin and niacin added by law. Most gluten-free bread, pasta and flour doesn’t, and much of it is ultra-processed with less fibre and protein. Build carbohydrate around potatoes, rice, buckwheat, quinoa and certified GF oats instead.' },
  { title: 'Annual review', text: 'NICE recommends an annual review for people with coeliac disease: weight, symptoms, diet and blood tests. Ask for full blood count, ferritin, folate, B12, vitamin D and the coeliac antibody test (tTG-IgA, which shows whether gluten is still getting in). In some areas you can also get GF staples on prescription.' },
  { title: 'Fibre on a gluten-free diet', text: 'The easy fibre sources (wholemeal bread, bran cereals) are off the table, so be deliberate: raspberries, potatoes in their skins, lentils and beans, chia and ground flax, buckwheat, quinoa, certified GF oats, nuts and lots of veg.' },
];

// ── What blocks (and boosts) absorption ─────────────────────────────────
export interface AbsorptionRule {
  blocker: string;
  blocks: string;
  where: string;
  size: string;
  fix: string;
  evidence: Evidence;
}

export const ABSORPTION_BLOCKERS: AbsorptionRule[] = [
  { blocker: 'Tea and coffee with meals', blocks: 'Plant (non-haem) iron', where: 'Black and green tea, coffee, matcha',
    size: 'A cup of tea or coffee with a meal can cut non-haem iron absorption by roughly 40–60%. Tannins and other polyphenols bind the iron in the gut.',
    fix: 'Drink them at least an hour away from iron-rich meals. Your morning coffee is fine if breakfast isn’t your main iron meal.', evidence: 'strong' },
  { blocker: 'Calcium in the same meal as iron', blocks: 'Both haem and non-haem iron', where: 'Milk, yoghurt, kefir, cheese, calcium supplements',
    size: 'Around 300 mg or more of calcium with a meal reduces iron absorption in single-meal studies. Over weeks the effect looks smaller, but it matters if your ferritin is low.',
    fix: 'Keep dairy (yoghurt, kefir) for snacks or breakfast, and eat red meat, liver or lentils at a separate meal.', evidence: 'moderate' },
  { blocker: 'Phytate', blocks: 'Iron, zinc and calcium', where: 'Whole grains, oats, beans, lentils, nuts and seeds (including pumpkin seeds)',
    size: 'It’s why plant zinc and iron count for less in Glow’s scores. Large effect on iron, moderate on zinc.',
    fix: 'Soak, sprout or ferment (sourdough-style buckwheat, soaked oats, tempeh). Add vitamin C or meat to the meal. Don’t rely on seeds as your main zinc source; oysters and red meat are far better.', evidence: 'strong' },
  { blocker: 'Oxalate', blocks: 'Calcium (and some iron)', where: 'Spinach, chard, beet greens, rhubarb, almonds, cocoa',
    size: 'You absorb only about 5% of the calcium in spinach, against about 30% from milk and kale.',
    fix: 'Keep eating spinach for its folate, vitamin K and nitrate, but don’t count it as a calcium source. Kale, pak choi, sardines with bones and dairy are the ones that count.', evidence: 'strong' },
  { blocker: 'High-dose zinc supplements', blocks: 'Copper', where: 'Zinc tablets above about 25 mg a day for weeks',
    size: 'Long-term high zinc causes copper deficiency (anaemia, nerve problems). Food zinc, even from oysters, rarely does.',
    fix: 'Get zinc from food. If you supplement, stay at or under 25 mg and not long-term without a blood test.', evidence: 'strong' },
  { blocker: 'Alcohol', blocks: 'Folate, B1 (thiamin), B12, zinc, magnesium', where: 'Any alcoholic drink',
    size: 'It damages the gut lining, increases losses in urine and disrupts how the liver stores vitamins.',
    fix: 'Another reason to keep alcohol rare.', evidence: 'strong' },
  { blocker: 'Fat-free meals', blocks: 'Vitamins A, D, E, K and carotenoids (lycopene, beta-carotene, lutein)', where: 'Salads and vegetables eaten without any fat',
    size: 'Carotenoid absorption from a salad can be several times higher with added fat than without.',
    fix: 'Add olive oil, avocado, eggs or salmon to your vegetables. Cook tomatoes and carrots with a little olive oil.', evidence: 'strong' },
  { blocker: 'Antacids and acid-reducing medicines', blocks: 'B12, iron, magnesium, calcium', where: 'Omeprazole, lansoprazole and other PPIs, long-term antacids',
    size: 'Stomach acid frees B12 and iron from food. Long-term PPIs are linked with low B12 and magnesium.',
    fix: 'If you take them regularly, mention it at your annual coeliac review and ask for B12 and magnesium checks.', evidence: 'moderate' },
  { blocker: 'Raw egg whites (in quantity)', blocks: 'Biotin (B7)', where: 'Raw egg whites in shakes',
    size: 'Avidin in raw white binds biotin. Cooking destroys it, and cooked egg protein is also absorbed about twice as well.',
    fix: 'Cook your eggs. A runny yolk with a set white is perfect.', evidence: 'moderate' },
  { blocker: 'Iron and zinc supplements taken together', blocks: 'Each other', where: 'Tablets on an empty stomach',
    size: 'Large doses compete for the same transporters. Not an issue with food.',
    fix: 'If you ever need both, take them at different times of day.', evidence: 'moderate' },
];

export const ABSORPTION_BOOSTERS: { title: string; text: string }[] = [
  { title: 'Vitamin C + plant iron', text: 'Vitamin C in the same meal (red pepper, kiwi, lemon, tomato, broccoli) can roughly double to triple non-haem iron absorption and partly cancels out phytate.' },
  { title: 'The "meat factor"', text: 'Meat, fish and poultry raise iron absorption from the plants eaten alongside them. Steak with spinach beats spinach alone.' },
  { title: 'Fat + carotenoids and vitamins A, D, E, K', text: 'Olive oil on salad, eggs with greens, salmon with sweet potato.' },
  { title: 'Cooking', text: 'Lycopene (tomato) and beta-carotene (carrot, sweet potato) absorb several times better cooked. Cooking also makes egg protein about twice as digestible.' },
  { title: 'Chop-and-wait for brassicas', text: 'Chopping broccoli and leaving it 30–40 minutes before cooking lets sulforaphane form. Alternatively, add a pinch of mustard powder after cooking.' },
  { title: 'Black pepper + turmeric', text: 'Piperine greatly increases curcumin absorption. Add fat too.' },
  { title: 'Vitamin D + calcium', text: 'Vitamin D is what lets you absorb calcium at all, which is one reason the October–March vitamin D advice matters more in coeliac disease.' },
  { title: 'A healed gut lining', text: 'For you, strict gluten-free eating is the absorption booster that beats everything else on this list.' },
];

// ── Stress, oxidation and AGEs ──────────────────────────────────────────
export interface StressTopic {
  id: string;
  title: string;
  what: string;
  you: string;
  do: string[];
  evidence: Evidence;
  sources: string[];
}

export const STRESS_TOPICS: StressTopic[] = [
  { id: 'hormesis', title: 'Good stress vs too much stress (hormesis)', evidence: 'moderate', sources: ['ristow-2009'],
    what: 'Your cells get stronger from small, recoverable doses of stress. A hard run, a sauna, cold water or the polyphenols in berries each cause a little damage or alarm, and the cell answers by building more mitochondria, more antioxidant enzymes and better repair machinery. That’s hormesis: the dose makes it medicine or poison.',
    you: 'Your training is the biggest hormetic dose you take. It only works if recovery (sleep, food, easy days) is big enough to answer it. In a calorie deficit, the same training is a bigger relative dose.',
    do: ['Hard days hard, easy days genuinely easy.', 'Recovery is when adaptation happens. Treat sleep as part of training.', 'Don’t stack every stressor at once: cold plunge + fasting + hard intervals + a big deficit is too much signal.'] },
  { id: 'oxidative', title: 'Oxidative stress', evidence: 'moderate', sources: ['ristow-2009'],
    what: 'Every time you burn food for energy, mitochondria leak a little oxygen as reactive oxygen species (free radicals). In small amounts these are signals that tell cells to adapt. Oxidative stress is when they outpace your defences and start damaging fats in cell membranes, proteins and DNA.',
    you: 'High training volume raises free-radical production. Your own defences (glutathione, superoxide dismutase, catalase) are far more powerful than any pill, and they’re built from selenium, zinc, copper, manganese, protein and the polyphenols and sulforaphane that switch on Nrf2.',
    do: ['Feed your own defences: Brazil nut (selenium), oysters or red meat (zinc, copper), brassicas (sulforaphane), berries and cocoa (polyphenols).', 'Skip high-dose vitamin C and E pills around training. In trials they blunted the adaptations exercise is meant to cause.', 'Biggest outside sources to cut: smoking or vaping, alcohol, unprotected UV, fried and burnt food.'] },
  { id: 'ages', title: 'AGEs (advanced glycation end-products)', evidence: 'moderate', sources: ['uribarri-2010', 'gkogkolou-2012'],
    what: 'AGEs form when sugars bond to proteins and fats. Your body makes them from blood glucose, and food adds more, especially protein and fat cooked with dry high heat (grilling, roasting, frying, charring). In skin, AGEs cross-link collagen and elastin: fibres that should glide become stiff and yellowish, which shows as lost bounce, sagging and dullness. Collagen lasts for years, so AGEs accumulate.',
    you: 'Your diet is low in sugar, which already keeps the body-made AGEs down. The lever left for you is cooking method: grilled steak, roasted meats, crispy skin and seared salmon carry several times the AGEs of the same food stewed, poached or steamed.',
    do: ['Cook with moisture more often: stews, poaching, steaming, slow-cooking, sous-vide.', 'Marinate meat in lemon juice or vinegar with herbs before grilling. Acid cut AGE formation substantially in lab tests.', 'Lower heat and shorter time. Don’t eat the charred or blackened bits.', 'Keep free sugar low (you already do) and protect sleep, which helps blood sugar control.', 'SPF: UV and AGEs damage collagen together.'] },
  { id: 'psych', title: 'Psychological stress and cortisol', evidence: 'moderate', sources: ['epel-2004'],
    what: 'Chronic stress keeps cortisol high. Over time that breaks down muscle, raises blood sugar, disturbs sleep, holds water (a puffy face) and suppresses testosterone and repair. In a well-known study, women under the highest long-term caregiving stress had telomeres equivalent to about a decade of extra ageing.',
    you: 'Deadlines, a cut, high training volume and study all draw on the same stress budget. Calm isn’t a luxury here: it’s how the training and diet actually pay off.',
    do: ['10 minutes of slow breathing (in Rituals) on hard days. It measurably lowers stress arousal.', 'Morning daylight and a regular wake time anchor a healthy cortisol rhythm.', 'Time with people you like. Social connection is one of the strongest health predictors there is.', 'Plan the week so a hard training day doesn’t land on a big deadline.'] },
  { id: 'inflammation', title: 'When stress becomes inflammation', evidence: 'moderate', sources: [],
    what: 'Short inflammation after training is how muscle rebuilds. The problem is the constant low-grade kind (inflammaging) that comes from stacking stressors without recovery: poor sleep, alcohol, ultra-processed food, chronic stress and under-fuelling.',
    you: 'Your signs to watch: a morning heart rate above baseline, poor sleep, lingering soreness, getting colds, and puffy skin. Glow tracks most of these.',
    do: ['Omega-3 (oily fish 2–3 times a week), colourful plants daily, olive oil.', 'If the training load says "pushing it", drop intensity, not food.'] },
];

export const SWEETENER_VERDICT = {
  title: 'Your squash and sweetener habit: the honest verdict',
  summary: 'Not dangerous, not optimal, and worth changing gradually. It’s far better than drinking sugar. The two real issues are teeth and all-day sweetness. The cancer headlines are weaker than they sound.',
  points: [
    { h: 'The biggest concrete issue is your teeth', t: 'No-added-sugar squash is still acidic (citric acid). Sipping it all day keeps enamel soft, because saliva needs 30–60 minutes between acid hits to re-harden it. Enamel erosion is permanent and makes teeth look duller and more yellow, which matters for the look you’re going for.' },
    { h: 'Sweeteners and your gut', t: 'In a 2022 trial (Suez et al., Cell), sucralose and saccharin changed gut bacteria and glucose response in some people within two weeks. Stevia and aspartame had smaller effects. The effect was personal: some people showed it, others didn’t.' },
    { h: 'Cravings and taste', t: 'Constant sweetness keeps your palate set to "very sweet", which can make whole foods taste flat. The evidence on weight is mixed. The WHO (2023) advises against relying on sweeteners for weight control, partly because long-term studies link heavy use with worse outcomes (observational, so not proof).' },
    { h: 'Cancer worries, in proportion', t: 'In 2023 the WHO’s cancer agency classed aspartame as “possibly carcinogenic” (the weakest category, alongside aloe vera extract), while the WHO’s food safety committee kept the safe daily limit at 40 mg per kg: about 2,300 mg for you, many litres of squash. Not a reason to panic, just not a reason to drink it all day.' },
    { h: 'Sweetener drops in meals', t: 'A few drops of stevia is the lowest-concern option. Sucralose drops are fine occasionally. Cinnamon, vanilla, berries or a little cocoa can replace most of them.' },
  ],
  plan: [
    'Week 1: dilute squash to half strength and drink it only with meals.',
    'Week 2: swap the between-meal glasses for water with fresh lemon, lime, cucumber or mint, or cold-brewed green tea (polyphenols, no acid load).',
    'Keep one or two glasses a day if you enjoy them. That’s fine.',
    'Use a straw, and rinse with water after. Don’t brush for 30–60 minutes after acidic drinks, because softened enamel brushes away.',
    'Swap sweetener drops in oats or yoghurt for cinnamon and berries most days.',
  ],
  sources: ['suez-2022', 'who-nss-2023', 'who-aspartame-2023'],
};

// ── Joy menu: lasting happiness, not cheap dopamine ─────────────────────
// Cheap dopamine (short-form video, endless scrolling, junk food) spikes
// and crashes, and trains you to need more. These build lasting wellbeing:
// mastery, connection, nature, movement, meaning and anticipation.
export const JOY_MENU: { title: string; why: string }[] = [
  { title: 'Morning daylight walk, no phone', why: 'Light, movement and a quiet head: the best start to the day there is.' },
  { title: 'Learn something with your hands or voice', why: 'Guitar, piano, French for the trip, cooking a new dish. Mastery and flow give the kind of reward that grows with practice.' },
  { title: 'See or call someone you love', why: 'Social connection is one of the strongest happiness and longevity predictors ever measured.' },
  { title: 'Help someone', why: 'Your ward-buddy volunteering counts. Kindness reliably lifts the giver’s mood.' },
  { title: 'Plan something to look forward to', why: 'Anticipation is a large part of the joy of a trip. Plan France: restaurants, outfits, the walk you’ll take.' },
  { title: 'Time by water, in woods or under big sky', why: 'Nature lowers stress hormones and lifts mood within 20 minutes.' },
  { title: 'Cook a beautiful meal from scratch', why: 'Creative, sensory and nourishing. Make it a ritual, not a chore.' },
  { title: 'Read fiction or a great biography for 20 minutes', why: 'Deep attention instead of fragmented attention. It also helps wind-down before sleep.' },
  { title: 'Dress well for no reason', why: 'Putting together a good outfit is self-expression and a small confidence lift.' },
  { title: 'Cold shower finish (30–90 s) or a sauna', why: 'Cold water raises noradrenaline and dopamine for hours and gives a clean mood lift. Not within 4 hours after lifting.' },
  { title: 'Finish one study block properly', why: 'Visible progress on meaningful work (“the progress principle”) is one of the strongest everyday mood boosters.' },
  { title: 'First hour of the day without short-form video', why: 'Protects your focus and keeps your reward system sensitive to things that matter.' },
];

export const STRAIGHT_ANSWERS: { q: string; a: string }[] = [
  { q: 'Should I masturbate?', a: 'It’s normal and healthy, and there’s no good evidence it lowers testosterone. One small study saw a brief bump around day 7 of abstinence that then returned to baseline. The big claims made for abstaining (“NoFap”) aren’t supported by trials. Large observational studies even link more frequent ejaculation with a slightly lower prostate cancer risk. The only things worth watching are compulsive use (feeling you can’t stop, or it crowding out sleep, study or people) and heavy porn use, which some people find drags on mood and motivation. Practical rule: it’s fine, keep your phone out of bed so it never costs you sleep, and if it ever feels compulsive, talk to your GP.' },
  { q: 'Is cheap dopamine actually a problem?', a: '“Dopamine detox” is pop science, but the core idea holds: very easy, fast rewards (endless scrolling, constant snacking) make slower rewards like study, reading and training feel flatter in comparison. You don’t need to ban them. Just make the good stuff easier (book by the bed, phone charging outside the bedroom, gym bag packed).' },
];

// ── The chiselled-face guide ─────────────────────────────────────────────
export const FACE_GUIDE: { title: string; text: string; evidence: Evidence }[] = [
  { title: 'Body fat sets the jawline, and you’re already there', evidence: 'moderate', text: 'Jaw and cheekbone definition in men usually shows from roughly 10–12% body fat. Going much lower mostly hollows the cheeks and under-eyes, which reads tired and older, not sharper. Your cut to 122–124 lb is about the limit for the look you want.' },
  { title: 'Water is the day-to-day difference', evidence: 'moderate', text: 'The same face looks sharp or soft depending on sleep, alcohol, sudden salt and cortisol. Use the De-puff check: 8+ hours of sleep, steady salt with plenty of potassium, no alcohol before big days.' },
  { title: 'Posture shapes the jawline in photos', evidence: 'emerging', text: 'A forward head (from phone and desk time) softens the jaw-to-neck angle. Chin tucks, upper-back strength (rows, face pulls) and a screen at eye level help how you hold yourself, and so how your jaw reads. Neck training adds a little thickness, a classic "model" proportion.' },
  { title: 'Skip the gimmicks', evidence: 'speculative', text: '“Mewing” (tongue posture) has no good evidence of reshaping an adult face. Jawline exercisers and constant hard gum chewing can strain the jaw joint (TMJ). Facial "fat loss" exercises don’t spot-reduce fat. Spend that effort on sleep and posture.' },
  { title: 'Grooming does a lot of the work', evidence: 'emerging', text: 'A haircut with structure at the sides, tidy brows and a short, crisp stubble line along the jaw can define a jawline visually. Shave with the grain to avoid the breakouts you get. A cold rinse or chilled gua sha in the morning de-puffs for a few hours.' },
  { title: 'Skin is the finish', evidence: 'strong', text: 'Daily SPF50 (you’re doing it), retinol 2–3 nights a week, carotenoid-rich food for a warm tone, and sleep. Clear, even skin is the “glow”.' },
];
