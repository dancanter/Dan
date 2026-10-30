// The Cellular Health research centre. Each topic separates four levels of
// confidence, because "plausible in a cell dish" and "shown to help people"
// are different claims:
//   established  — consistent human trials or meta-analyses
//   observational — associations in human cohorts (cause not shown)
//   mechanistic  — cell, animal or short biomarker studies
//   speculative  — hypotheses, marketing, or extrapolation

export type Confidence = 'established' | 'observational' | 'mechanistic' | 'speculative';

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  established: 'Established in humans',
  observational: 'Observational association',
  mechanistic: 'Mechanistic / animal',
  speculative: 'Speculative',
};

export interface Claim {
  level: Confidence;
  text: string;
  sources?: string[];
}

export interface HealthTopic {
  id: string;
  group: 'cellular' | 'longevity';
  title: string;
  plain: string;
  how: string;
  claims: Claim[];
  forYou: string[];
  overhyped?: string[];
}

export const TOPICS: HealthTopic[] = [
  {
    id: 'mitochondria',
    group: 'cellular',
    title: 'Mitochondrial function',
    plain: 'Mitochondria are the structures inside cells that turn food and oxygen into ATP, the molecule cells spend as energy. More, and better-functioning, mitochondria in muscle is a large part of what endurance fitness is.',
    how: 'Endurance training — especially sustained easy and threshold running — activates signalling (AMPK, PGC-1α: master switches that sense energy stress) that builds new mitochondria ("mitochondrial biogenesis") and capillaries around muscle fibres. Ageing and inactivity reduce both.',
    claims: [
      { level: 'established', text: 'Endurance training increases mitochondrial content and oxidative capacity in human muscle, and this underpins improvements in lactate threshold and economy.', sources: ['midgley2007', 'seiler2010'] },
      { level: 'observational', text: 'Higher cardiorespiratory fitness is one of the strongest predictors of lower all-cause mortality, with no apparent upper limit in cohort data.', sources: ['mandsager2018'] },
      { level: 'speculative', text: '“Mitochondrial booster” supplements (NAD+ precursors, PQQ, high-dose CoQ10 in healthy people) have no convincing human evidence of improving fitness or longevity.' },
    ],
    forYou: ['Your easy and threshold volume is the mitochondrial programme. Keeping easy runs easy lets you do more of it.', 'Megadose antioxidants can blunt the signal that builds mitochondria — food sources are fine.'],
    overhyped: ['NAD+/NMN/NR as an anti-ageing intervention in healthy young adults.'],
  },
  {
    id: 'oxidative-stress',
    group: 'cellular',
    title: 'Oxidative stress and antioxidant defence',
    plain: 'Normal metabolism and exercise produce reactive oxygen species (ROS) — unstable molecules that can damage cells in excess, but at normal levels act as signals that tell the body to adapt.',
    how: 'This is hormesis: a small, temporary stress that triggers a stronger defence. Exercise-generated ROS switch on the body’s own antioxidant enzymes (superoxide dismutase, glutathione peroxidase — which needs selenium). Flooding the system with supplemental antioxidants can mute that signal.',
    claims: [
      { level: 'established', text: 'Antioxidant supplements (beta-carotene, vitamin A, vitamin E) did not reduce mortality in healthy people and some were associated with harm.', sources: ['bjelakovic2012'] },
      { level: 'established', text: 'High-dose vitamins C and E blunted some training adaptations in randomised trials.', sources: ['ristow2009', 'paulsen2014'] },
      { level: 'observational', text: 'Diets rich in fruit, vegetables and polyphenols are associated with lower chronic disease — likely through many mechanisms, not just "antioxidant" activity.', sources: ['aune2017'] },
    ],
    forYou: ['Get antioxidants from berries, vegetables, olive oil and nuts. Avoid gram-dose vitamin C/E pills around training.'],
    overhyped: ['"Detox" products and high-ORAC supplement claims.'],
  },
  {
    id: 'inflammation',
    group: 'cellular',
    title: 'Inflammation',
    plain: 'Acute inflammation is the repair crew after a hard session — it is necessary. Chronic low-grade inflammation, which persists without a reason, is linked to cardiovascular disease, insulin resistance and ageing ("inflammageing").',
    how: 'Markers like CRP and IL-6 rise after hard training and fall within days. Chronic elevation is driven mainly by excess visceral fat, inactivity, smoking, poor sleep, and some dietary patterns.',
    claims: [
      { level: 'established', text: 'Regular exercise and weight management reduce chronic inflammatory markers.' },
      { level: 'mechanistic', text: 'Ice baths straight after strength training reduced long-term muscle and strength gains — suppressing the acute response is not free.', sources: ['roberts2015'] },
      { level: 'mechanistic', text: 'A high-fermented-food diet increased microbiome diversity and lowered inflammatory markers over 10 weeks (small trial).', sources: ['wastyk2021'] },
    ],
    forYou: ['Do not chase every bit of post-session soreness away with ice or anti-inflammatories; save cold water for competition recovery.', 'Kefir and yoghurt are a sensible, low-risk way to include fermented foods.'],
    overhyped: ['"Anti-inflammatory diets" sold as cures; turmeric pills for healthy people.'],
  },
  {
    id: 'autophagy',
    group: 'cellular',
    title: 'Autophagy',
    plain: 'Autophagy ("self-eating") is how cells break down and recycle worn-out parts. It is essential and well established in biology.',
    how: 'It is switched on by low nutrient signalling (low mTOR, high AMPK) — fasting, exercise and some drugs in animals. Measuring it in living humans is very difficult, so most claims rest on animal work.',
    claims: [
      { level: 'mechanistic', text: 'Fasting and exercise increase autophagy in animal models; extending lifespan via autophagy is shown in yeast, worms and mice.', sources: ['lopezotin2023'] },
      { level: 'established', text: 'In humans, time-restricted eating trials show weight loss driven mostly by eating less — and one RCT found a disproportionate loss of lean mass.', sources: ['lowe2020', 'decabo2019'] },
      { level: 'speculative', text: 'That fasting for X hours "triggers autophagy" with health benefits in humans is not demonstrated.' },
    ],
    forYou: ['For a lean runner chasing muscle, extended fasting is the wrong tool: it costs protein distribution and fuel for training. Exercise already stimulates autophagy.'],
    overhyped: ['72-hour fasts "for autophagy"; supplements claiming to induce it (spermidine, etc.).'],
  },
  {
    id: 'insulin',
    group: 'cellular',
    title: 'Insulin sensitivity and glucose regulation',
    plain: 'Insulin sensitivity is how readily your cells respond to insulin to take up glucose. High sensitivity means stable blood sugar from small amounts of insulin — a marker of metabolic health.',
    how: 'Contracting muscle takes up glucose even without insulin, and training increases glucose transporters (GLUT4). Muscle mass is the body’s largest glucose sink. Poor sleep reduces insulin sensitivity within days.',
    claims: [
      { level: 'established', text: 'Both endurance and resistance training improve insulin sensitivity.' },
      { level: 'established', text: 'Higher-fibre, whole-grain diets improve glycaemic control and are associated with lower type 2 diabetes risk.', sources: ['reynolds2019'] },
      { level: 'speculative', text: 'Continuous glucose monitors in healthy, active people: post-meal spikes after carbohydrate are normal, and there is no evidence that flattening them improves health in non-diabetic athletes.' },
    ],
    forYou: ['Your training makes you extremely insulin-sensitive. Carbohydrate around sessions is fuel, not a metabolic risk.'],
    overhyped: ['Glucose-spike anxiety in healthy people; "metabolism-boosting" supplements.'],
  },
  {
    id: 'cardiovascular',
    group: 'cellular',
    title: 'Cardiovascular and endothelial health',
    plain: 'The endothelium is the thin lining of every blood vessel. It releases nitric oxide (NO), which relaxes vessels and controls blood flow. Endothelial dysfunction is one of the earliest steps towards atherosclerosis (artery-wall plaque).',
    how: 'Exercise increases shear stress on the vessel wall, stimulating NO production. Dietary nitrate (beetroot, leafy greens) provides another NO pathway. LDL cholesterol, blood pressure and smoking drive plaque.',
    claims: [
      { level: 'established', text: 'A Mediterranean diet with extra virgin olive oil or nuts reduced major cardiovascular events in a large RCT.', sources: ['estruch2018'] },
      { level: 'established', text: 'Replacing saturated with unsaturated fat lowers LDL cholesterol and cardiovascular risk (UK SACN review).', sources: ['sacn2019'] },
      { level: 'established', text: 'A cup of blueberries a day improved endothelial function (FMD) over 6 months in adults with metabolic syndrome; industry-funded, older population.', sources: ['curtis2019'] },
      { level: 'established', text: 'Fish-oil supplements show mixed or small benefits for primary prevention; eating oily fish is still recommended.', sources: ['manson2019', 'abdelhamid2020'] },
    ],
    forYou: ['Oily fish twice a week, olive oil as the main fat, nuts most days, fibre ≥30 g, and the running you already do.', 'Get blood pressure and a lipid profile checked occasionally — even fit people can have familial high cholesterol.'],
  },
  {
    id: 'dna-epigenetics',
    group: 'cellular',
    title: 'DNA damage, repair and epigenetics',
    plain: 'DNA is damaged thousands of times a day and mostly repaired. Epigenetics is the layer of chemical tags (e.g. DNA methylation) that switches genes on and off without changing the code. "Epigenetic clocks" estimate biological age from these tags.',
    how: 'UV light, smoking, alcohol and processed meat compounds increase DNA damage; sleep and exercise influence repair and gene regulation. Epigenetic clocks are research tools; their changes in short interventions are hard to interpret.',
    claims: [
      { level: 'established', text: 'Processed meat is classified as carcinogenic (Group 1) and red meat as probably carcinogenic (Group 2A) for colorectal cancer, by IARC.', sources: ['bouvard2015'] },
      { level: 'established', text: 'UV exposure causes DNA damage in skin cells; daily sunscreen slowed visible skin ageing in an RCT.', sources: ['hughes2013'] },
      { level: 'speculative', text: 'Consumer "biological age" tests and interventions that claim to reverse epigenetic age by years have not been shown to change health outcomes.' },
    ],
    forYou: ['SPF 50 daily, minimal processed meat, no smoking, moderate alcohol — the unglamorous DNA protection that actually has evidence.'],
    overhyped: ['Paying for epigenetic age tests to "track" anti-ageing protocols.'],
  },
  {
    id: 'senescence',
    group: 'cellular',
    title: 'Cellular senescence',
    plain: 'Senescent cells have stopped dividing but do not die. They release inflammatory signals (the SASP) that damage neighbouring tissue. They accumulate with age.',
    how: '"Senolytic" drugs that clear senescent cells extend healthspan in mice. Human trials are early and mostly in older adults with disease.',
    claims: [
      { level: 'mechanistic', text: 'Senescence is one of the recognised hallmarks of ageing; senolytics improve multiple ageing measures in mice.', sources: ['lopezotin2023'] },
      { level: 'speculative', text: 'Senolytic supplements (e.g. fisetin, quercetin) for healthy young people: no evidence of benefit, unknown risks.' },
    ],
    forYou: ['Nothing to buy. Exercise and avoiding obesity are the best-supported ways to limit senescent cell burden.'],
    overhyped: ['Fisetin and quercetin stacks marketed as "senolytic".'],
  },
  {
    id: 'mps',
    group: 'cellular',
    title: 'Muscle protein synthesis',
    plain: 'Muscle is constantly built (synthesis) and broken down. Growth happens when synthesis exceeds breakdown over weeks. Training and protein both stimulate synthesis; together they add up.',
    how: 'Leucine-rich protein activates mTORC1, a growth switch. ~0.25–0.4 g/kg of high-quality protein per meal maximally stimulates synthesis in young men in classic studies, though larger doses produce a longer response than once thought. Total daily protein matters most.',
    claims: [
      { level: 'established', text: 'Protein intakes up to ~1.6 g/kg/day increase muscle gains from resistance training; benefits beyond that are small on average.', sources: ['morton2018'] },
      { level: 'established', text: 'About 20 g of high-quality protein maximised post-exercise synthesis in young men (single-meal studies).', sources: ['moore2009'] },
      { level: 'established', text: '100 g of protein produced a larger and longer anabolic response than 25 g — meal size matters less than once believed.', sources: ['trommelen2023'] },
      { level: 'established', text: 'One night without sleep reduced muscle protein synthesis by ~18% and lowered testosterone.', sources: ['lamon2021'] },
      { level: 'established', text: 'Energy deficits blunt lean-mass gains; around 500 kcal/day of deficit can prevent them.', sources: ['murphy2022'] },
    ],
    forYou: ['~115–130 g protein a day at your weight, across 4 meals including one before bed.', 'Lifting in a big deficit will hold muscle at best; building it needs maintenance energy or more.'],
  },
  {
    id: 'metabolic-flexibility',
    group: 'cellular',
    title: 'Metabolic flexibility',
    plain: 'The ability to switch smoothly between burning fat (at rest and easy pace) and carbohydrate (at high intensity).',
    how: 'Endurance training increases fat oxidation at a given pace, sparing glycogen. But high-intensity running — threshold, VO₂max, sprints — runs predominantly on carbohydrate, at every fitness level.',
    claims: [
      { level: 'established', text: 'Carbohydrate availability supports high-intensity endurance performance; low-carbohydrate diets impair it at race intensities in trained athletes.', sources: ['burke2011', 'burke2019'] },
      { level: 'mechanistic', text: '"Train-low" sessions (deliberately low glycogen) can enhance some molecular signals, but performance benefits are inconsistent and the cost is session quality.' },
    ],
    forYou: ['Sessions run "on low carbs" or "in a deficit" usually feel harder and go worse — the app flags those notes when you log them. Fuel quality days; easy runs can be done on normal meals.'],
    overhyped: ['Keto for middle-distance runners.'],
  },
  // ── Longevity ──
  {
    id: 'exercise-longevity',
    group: 'longevity',
    title: 'Exercise and longevity',
    plain: 'The most powerful longevity intervention with human evidence is not a pill — it is being fit and strong.',
    how: 'Cardiorespiratory fitness (VO₂max), muscle strength and daily movement each independently predict lower mortality. The UK recommends 150 min of moderate or 75 min of vigorous activity a week plus strength training on 2 days.',
    claims: [
      { level: 'observational', text: 'More daily physical activity and less sitting are associated with substantially lower mortality, in a dose–response pattern.', sources: ['ekelund2019'] },
      { level: 'observational', text: 'Muscle-strengthening activity is associated with lower mortality and lower risk of major diseases, with most benefit up to ~30–60 min a week.', sources: ['momma2022'] },
      { level: 'established', text: 'UK Chief Medical Officers’ physical activity guidelines.', sources: ['cmo2019'] },
    ],
    forYou: ['You already exceed every guideline several times over. For longevity the job is to keep doing it for decades — which means avoiding injury and burnout, not maximising this month.'],
  },
  {
    id: 'diet-patterns',
    group: 'longevity',
    title: 'Dietary patterns and healthy ageing',
    plain: 'Whole patterns — Mediterranean-style, high in plants, fish, olive oil and nuts, low in ultra-processed food — have the evidence. Single "superfoods" mostly do not.',
    how: 'Fibre feeds the gut microbiome and lowers LDL; oily fish provides EPA/DHA; polyphenols and nitrates act on vessels; processed foods drive over-eating.',
    claims: [
      { level: 'established', text: 'Ultra-processed diets caused ~500 kcal/day more intake and weight gain versus unprocessed diets in a controlled inpatient trial.', sources: ['hall2019'] },
      { level: 'observational', text: 'Higher fibre intake (25–29 g+/day) is associated with 15–30% lower mortality and chronic disease.', sources: ['reynolds2019'] },
      { level: 'observational', text: 'Fruit and vegetable intake up to ~800 g/day is associated with lower cardiovascular disease and mortality.', sources: ['aune2017'] },
    ],
    forYou: ['On a gluten-free diet, fibre is easy to miss: oats, potatoes with skins, berries, parsnips, nuts and seeds are your main sources.'],
  },
  {
    id: 'bone',
    group: 'longevity',
    title: 'Bone health',
    plain: 'Peak bone mass is built by your late twenties, then defended. Low bone density raises fracture risk later and stress-fracture risk now.',
    how: 'Bone responds to impact and loading (running, jumping, lifting). It needs calcium, vitamin D, protein — and enough energy: low energy availability suppresses bone formation. Coeliac disease can reduce calcium absorption, especially before diagnosis.',
    claims: [
      { level: 'established', text: 'Physical activity and adequate calcium and vitamin D support peak bone mass.', sources: ['weaver2016'] },
      { level: 'established', text: 'Low energy availability impairs bone health in male and female athletes (REDs).', sources: ['mountjoy2023'] },
      { level: 'established', text: 'NICE recommends considering bone density assessment in people with coeliac disease where there are risk factors.', sources: ['nice-ng20'] },
    ],
    forYou: ['Two risk factors apply to you: coeliac disease and a lean, high-volume training life. Worth asking your GP whether a DEXA scan is indicated, and keeping energy intake adequate.'],
  },
  {
    id: 'cognition',
    group: 'longevity',
    title: 'Cognitive health',
    plain: 'Brain health tracks cardiovascular health, sleep, physical activity, learning and social connection more than any supplement.',
    how: 'Sleep consolidates memory (and clears metabolic waste); exercise increases BDNF and blood flow; B12 and iron deficiency impair cognition and are correctable.',
    claims: [
      { level: 'established', text: 'Sleep plays an active role in consolidating memories.', sources: ['diekelmann2010'] },
      { level: 'established', text: 'Retrieval practice and spaced study are among the most effective learning strategies across hundreds of experiments.', sources: ['dunlosky2013', 'cepeda2006'] },
      { level: 'speculative', text: 'Nootropic stacks for healthy students: little evidence beyond caffeine.' },
    ],
    forYou: ['Sleep is your best study aid. Coeliac disease can cause B12, iron and folate shortfalls — part of your annual review.'],
  },
  {
    id: 'hormones',
    group: 'longevity',
    title: 'Hormonal health',
    plain: 'Testosterone, thyroid hormones, cortisol and others respond to sleep, energy intake, body fat and training load.',
    how: 'Chronic energy deficiency, very low body fat and short sleep all suppress testosterone and thyroid output in men. Cortisol rises acutely with hard training and stress; chronic elevation shows up as poor sleep and persistent fatigue.',
    claims: [
      { level: 'established', text: 'Low energy availability suppresses reproductive and metabolic hormones in male athletes (REDs).', sources: ['mountjoy2023'] },
      { level: 'mechanistic', text: 'One week of 5-hour nights lowered daytime testosterone by 10–15% in young men (small lab study).', sources: ['leproult2011'] },
    ],
    forYou: ['Warning signs worth taking to a GP: low libido, low morning energy for weeks, frequent illness or injury, low mood — especially during a cut.'],
    overhyped: ['"Testosterone booster" supplements; most have no effect in healthy men and some are contaminated.'],
  },
  {
    id: 'sleep-circadian',
    group: 'longevity',
    title: 'Sleep and circadian rhythm',
    plain: 'Duration matters, and regularity — going to bed and waking at consistent times — may matter even more.',
    how: 'The circadian clock is set mainly by morning light and meal/sleep timing. Irregular schedules (including weekend "social jet lag") disrupt it.',
    claims: [
      { level: 'observational', text: 'Sleep regularity predicted mortality more strongly than sleep duration in ~60,000 UK Biobank participants.', sources: ['windred2024'] },
      { level: 'observational', text: 'Both short and long sleep are associated with cardiovascular outcomes in meta-analysis.', sources: ['cappuccio2011'] },
      { level: 'established', text: 'Adults need 7+ hours; athletes may benefit from more.', sources: ['watson2015', 'walsh2021'] },
    ],
    forYou: ['Fix your wake time first; morning daylight; caffeine before midday.'],
  },
  {
    id: 'cancer',
    group: 'longevity',
    title: 'Cancer prevention evidence',
    plain: 'The largest controllable risk factors are smoking, alcohol, excess body fat, UV exposure, processed meat, and inactivity.',
    how: 'Mechanisms range from direct DNA damage (UV, tobacco, alcohol’s acetaldehyde) to hormonal and inflammatory effects of excess fat.',
    claims: [
      { level: 'established', text: 'Processed meat increases colorectal cancer risk (IARC Group 1).', sources: ['bouvard2015'] },
      { level: 'observational', text: 'Higher fibre and whole-grain intake is associated with lower colorectal cancer risk.', sources: ['reynolds2019'] },
    ],
    forYou: ['Skin cancer is the risk most relevant to an outdoor runner: SPF 50, especially on summer runs and holidays.'],
  },
];

export interface Supplement {
  id: string;
  name: string;
  verdict: 'consider' | 'if-indicated' | 'not-recommended' | 'neutral';
  evidence: Confidence;
  summary: string;
  forYou: string;
  sources: string[];
}

export const SUPPLEMENTS: Supplement[] = [
  { id: 'vitd', name: 'Vitamin D (10 µg/day)', verdict: 'consider', evidence: 'established', summary: 'UK government advice is that everyone should consider 10 µg (400 IU) daily in autumn and winter, when UK sunlight cannot make enough.', forYou: 'Sensible October–March. Testing is only needed if deficiency is suspected (coeliac disease is a reason to ask).', sources: ['sacn2016', 'nhs-vitd'] },
  { id: 'creatine', name: 'Creatine monohydrate (3–5 g/day)', verdict: 'consider', evidence: 'established', summary: 'The best-evidenced supplement for strength and lean mass; well studied for safety. Can add ~0.5–1 kg of water in muscle.', forYou: 'Helps gym progress and sprint repeatability; the small weight gain is water inside muscle, not fat — worth knowing before you misread the scale.', sources: ['kreider2017', 'maughan2018'] },
  { id: 'caffeine', name: 'Caffeine (~3 mg/kg, ~60 min before)', verdict: 'consider', evidence: 'established', summary: 'Reliably improves endurance and high-intensity performance.', forYou: '~170 mg (a strong coffee) before races or key sessions — not after midday if sleep matters more.', sources: ['guest2021', 'drake2013'] },
  { id: 'protein', name: 'Protein powder', verdict: 'neutral', evidence: 'established', summary: 'Food in a tub. Useful only if it makes hitting your protein target easier.', forYou: 'Optional. Choose batch-tested (e.g. Informed Sport) and confirm gluten-free.', sources: ['morton2018'] },
  { id: 'omega3', name: 'Fish oil', verdict: 'if-indicated', evidence: 'established', summary: 'Mixed results for preventing heart disease in trials; eating oily fish is the preferred route.', forYou: 'If you eat oily fish twice a week, you do not need it.', sources: ['manson2019', 'abdelhamid2020'] },
  { id: 'iron', name: 'Iron', verdict: 'if-indicated', evidence: 'established', summary: 'Only for diagnosed deficiency. Runners and people with coeliac disease are at higher risk; excess iron is harmful.', forYou: 'Ask for ferritin and a full blood count at your annual coeliac review rather than self-prescribing.', sources: ['nice-ng20', 'hurrell2010'] },
  { id: 'nitrate', name: 'Beetroot juice / nitrate', verdict: 'neutral', evidence: 'established', summary: 'Small average performance benefit, smaller in well-trained athletes.', forYou: 'Possibly worth trying before a key race; check your gut tolerates it first.', sources: ['senefeld2020'] },
  { id: 'beta-alanine', name: 'Beta-alanine', verdict: 'neutral', evidence: 'established', summary: 'Modest benefit for efforts of ~1–4 minutes (400–1500 m); harmless tingling.', forYou: 'Relevant to your 800 m and mile goals in a racing season; low priority otherwise.', sources: ['maughan2018'] },
  { id: 'collagen', name: 'Collagen / gelatin', verdict: 'neutral', evidence: 'mechanistic', summary: 'Gelatin with vitamin C before exercise increased collagen synthesis markers in a small study; skin claims rest largely on industry-funded trials.', forYou: 'Not a priority. Protein, vitamin C, sleep and sunscreen matter more.', sources: ['shaw2017'] },
  { id: 'antioxidants', name: 'High-dose vitamin C / E', verdict: 'not-recommended', evidence: 'established', summary: 'Can blunt training adaptations; no mortality benefit.', forYou: 'Avoid around training. Berries do the job without the downside.', sources: ['paulsen2014', 'ristow2009', 'bjelakovic2012'] },
  { id: 'nad', name: 'NMN / NR / "NAD boosters"', verdict: 'not-recommended', evidence: 'speculative', summary: 'Raises NAD+ levels in blood; no demonstrated health or longevity benefit in humans.', forYou: 'Expensive and unproven. Your money is better spent on food.', sources: ['lopezotin2023'] },
  { id: 'resveratrol', name: 'Resveratrol', verdict: 'not-recommended', evidence: 'speculative', summary: 'Early animal excitement did not translate into human outcomes.', forYou: 'Skip.', sources: [] },
  { id: 'ashwagandha', name: 'Ashwagandha', verdict: 'neutral', evidence: 'mechanistic', summary: 'Some small trials suggest stress and sleep effects; rare cases of liver injury reported.', forYou: 'Not recommended without a clear reason; meditation has better evidence for stress.', sources: ['goyal2014'] },
  { id: 'melatonin', name: 'Melatonin', verdict: 'if-indicated', evidence: 'established', summary: 'Prescription-only in the UK. Useful for jet lag and specific sleep disorders.', forYou: 'Not a fix for poor sleep habits. See a GP if sleep is persistently poor.', sources: [] },
  { id: 'test-boosters', name: '"Testosterone boosters"', verdict: 'not-recommended', evidence: 'speculative', summary: 'No meaningful effect in healthy men; supplement contamination risk.', forYou: 'If you suspect low testosterone, a GP blood test is the answer — and low energy intake is the likeliest cause.', sources: ['maughan2018'] },
];

export interface GlossaryTerm {
  term: string;
  def: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'ATP', def: 'Adenosine triphosphate — the molecule cells use as immediate energy currency.' },
  { term: 'Mitochondria', def: 'Structures inside cells that produce most ATP using oxygen. Endurance training increases them.' },
  { term: 'VO₂max', def: 'The maximum rate your body can use oxygen. Sets the aerobic ceiling.' },
  { term: 'Lactate threshold', def: 'The intensity above which lactate builds up faster than it is cleared. Roughly the pace you could hold for ~45–60 minutes.' },
  { term: 'Running economy', def: 'Oxygen cost of running at a given speed. Better economy = less energy for the same pace.' },
  { term: 'VDOT', def: 'Jack Daniels’ performance-based fitness score, derived from a race time. Not a lab VO₂max.' },
  { term: 'RPE', def: 'Rating of perceived exertion — how hard a session felt, here on a 1–10 scale.' },
  { term: 'sRPE load', def: 'Session RPE × minutes. A simple, validated way to quantify training stress.' },
  { term: 'ACWR', def: 'Acute:chronic workload ratio — this week’s load vs your 4-week average. Used here only as a rough flag; its use for injury prediction is disputed.' },
  { term: 'RIR', def: 'Reps in reserve — how many more reps you could have done. RIR 0 = failure.' },
  { term: 'e1RM', def: 'Estimated one-rep maximum, calculated from a set of several reps (Epley formula).' },
  { term: 'Hypertrophy', def: 'Growth of muscle fibres in size.' },
  { term: 'MPS', def: 'Muscle protein synthesis — the process of building new muscle proteins.' },
  { term: 'mTOR', def: 'A protein complex that acts as the cell’s growth switch; activated by leucine and resistance exercise.' },
  { term: 'AMPK', def: 'An energy sensor activated when ATP is low (exercise, fasting); promotes mitochondria and autophagy.' },
  { term: 'Leucine', def: 'An essential amino acid that strongly triggers muscle protein synthesis.' },
  { term: 'DIAAS', def: 'Digestible Indispensable Amino Acid Score — the FAO-preferred measure of protein quality.' },
  { term: 'Bioavailability', def: 'The fraction of a nutrient that is absorbed and used, not just eaten.' },
  { term: 'Haem iron', def: 'Iron from meat and fish, absorbed far better than plant (non-haem) iron.' },
  { term: 'Phytate', def: 'A compound in grains, nuts and legumes that binds iron and zinc and reduces their absorption.' },
  { term: 'Oxalate', def: 'A compound in spinach and some other plants that binds calcium and iron.' },
  { term: 'Glycaemic index (GI)', def: 'How quickly a carbohydrate food raises blood glucose compared with pure glucose.' },
  { term: 'Glycogen', def: 'Stored carbohydrate in muscle and liver; the main fuel for hard running.' },
  { term: 'Energy availability', def: 'Energy left for the body’s functions after exercise: (intake − exercise energy) ÷ fat-free mass.' },
  { term: 'REDs', def: 'Relative Energy Deficiency in Sport — health and performance problems caused by low energy availability.' },
  { term: 'Fat-free mass (FFM)', def: 'Everything that is not fat: muscle, bone, organs, water.' },
  { term: 'Endothelium', def: 'The cell lining of blood vessels; controls vessel tone through nitric oxide.' },
  { term: 'Nitric oxide (NO)', def: 'A signalling gas that relaxes blood vessels.' },
  { term: 'ROS', def: 'Reactive oxygen species — reactive molecules from metabolism; harmful in excess, useful as signals.' },
  { term: 'Hormesis', def: 'A beneficial adaptive response to a small dose of stress (exercise, heat, cold).' },
  { term: 'Autophagy', def: 'The cell’s recycling of its own damaged components.' },
  { term: 'Senescence', def: 'A state in which cells stop dividing but stay active and release inflammatory signals.' },
  { term: 'Epigenetics', def: 'Chemical marks on DNA and its packaging that change gene activity without changing the DNA sequence.' },
  { term: 'Telomeres', def: 'Protective caps on chromosome ends that shorten with cell division.' },
  { term: 'Insulin sensitivity', def: 'How strongly cells respond to insulin; higher is healthier.' },
  { term: 'HbA1c', def: 'A blood test reflecting average blood glucose over ~3 months.' },
  { term: 'CRP', def: 'C-reactive protein — a blood marker of inflammation.' },
  { term: 'HRV', def: 'Heart-rate variability — beat-to-beat variation; higher relative to your own baseline often reflects better recovery.' },
  { term: 'RHR', def: 'Resting heart rate. A rise of 5+ bpm above your baseline for several days can reflect fatigue or illness.' },
  { term: 'Cortisol', def: 'A stress hormone; rises with hard training and stress, normally in a daily rhythm.' },
  { term: 'HPA axis', def: 'Hypothalamic–pituitary–adrenal axis — the hormonal stress-response system.' },
  { term: 'Circadian rhythm', def: 'The body’s ~24-hour internal clock, set mainly by light.' },
  { term: 'FODMAPs', def: 'Fermentable carbohydrates (fructans, GOS, polyols, excess fructose, lactose) that gut bacteria ferment into gas.' },
  { term: 'GOS', def: 'Galacto-oligosaccharides — the FODMAP in lentils, beans and chickpeas.' },
  { term: 'Fructans', def: 'A FODMAP found in garlic, onion, wheat and some fruit.' },
  { term: 'Coeliac disease', def: 'An autoimmune condition in which gluten damages the small-intestine lining, impairing absorption.' },
  { term: 'Meta-analysis', def: 'A statistical combination of results from several studies.' },
  { term: 'RCT', def: 'Randomised controlled trial — participants randomly assigned to treatment or control; the best design for cause and effect.' },
  { term: 'Cohort study', def: 'Follows a group over time; shows associations, not cause.' },
  { term: 'Confounding', def: 'When a third factor explains an apparent link (e.g. healthier people both eat more fruit and exercise more).' },
];
