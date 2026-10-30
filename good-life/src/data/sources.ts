// Every source the app cites. DOIs are checked against Crossref by
// `npm run verify-sources`, which compares each DOI's registered title and
// year with what is written here — a wrong DOI fails loudly rather than
// quietly pointing at someone else's paper.

export type EvidenceType =
  | 'meta-analysis'
  | 'systematic-review'
  | 'rct'
  | 'cohort'
  | 'consensus'
  | 'guideline'
  | 'review'
  | 'mechanistic'
  | 'other';

export const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  'meta-analysis': 'Meta-analysis',
  'systematic-review': 'Systematic review',
  rct: 'Randomised trial',
  cohort: 'Prospective cohort',
  consensus: 'Consensus statement',
  guideline: 'Guideline / official',
  review: 'Narrative review',
  mechanistic: 'Mechanistic / lab',
  other: 'Other',
};

export interface Source {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
  type: EvidenceType;
  note?: string;
}

export const SOURCES: Source[] = [
  // Training & performance
  { id: 'schoenfeld2017', authors: 'Schoenfeld BJ, Ogborn D, Krieger JW', year: 2017, title: 'Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis', journal: 'Journal of Sports Sciences', doi: '10.1080/02640414.2016.1210197', type: 'meta-analysis', note: 'More weekly sets → more growth, with diminishing returns.' },
  { id: 'schoenfeld2016freq', authors: 'Schoenfeld BJ, Ogborn D, Krieger JW', year: 2016, title: 'Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis', journal: 'Sports Medicine', doi: '10.1007/s40279-016-0543-8', type: 'meta-analysis' },
  { id: 'bazvalle2022', authors: 'Baz-Valle E, Balsalobre-Fernández C, Alix-Fages C, Santos-Concejero J', year: 2022, title: 'A systematic review of the effects of different resistance training volumes on muscle hypertrophy', journal: 'Journal of Human Kinetics', doi: '10.2478/hukin-2022-0017', type: 'systematic-review' },
  { id: 'refalo2023', authors: 'Refalo MC, Helms ER, Trexler ET, Hamilton DL, Fyfe JJ', year: 2023, title: 'Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic review with meta-analysis', journal: 'Sports Medicine', doi: '10.1007/s40279-022-01784-y', type: 'meta-analysis', note: 'Training to failure is not required; sets close to failure are enough.' },
  { id: 'robinson2024', authors: 'Robinson ZP, Pelland JC, Remmert JF, et al.', year: 2024, title: 'Exploring the dose–response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy: a series of meta-regressions', journal: 'Sports Medicine', doi: '10.1007/s40279-024-02069-2', type: 'meta-analysis' },
  { id: 'singer2024', authors: 'Singer A, Wolf M, Generoso L, et al.', year: 2024, title: 'Give it a rest: a systematic review with Bayesian meta-analysis on the effect of inter-set rest interval duration on muscle hypertrophy', journal: 'Frontiers in Sports and Active Living', doi: '10.3389/fspor.2024.1429789', type: 'meta-analysis' },
  { id: 'maeo2023', authors: 'Maeo S, Wu Y, Huang M, et al.', year: 2023, title: 'Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position', journal: 'European Journal of Sport Science', doi: '10.1080/17461391.2022.2100279', type: 'rct' },
  { id: 'maeo2021', authors: 'Maeo S, Huang M, Wu Y, et al.', year: 2021, title: 'Greater hamstrings muscle hypertrophy but similar damage protection after training at long versus short muscle lengths', journal: 'Medicine & Science in Sports & Exercise', doi: '10.1249/MSS.0000000000002523', type: 'rct' },
  { id: 'wilson2012', authors: 'Wilson JM, Marin PJ, Rhea MR, et al.', year: 2012, title: 'Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises', journal: 'Journal of Strength and Conditioning Research', doi: '10.1519/JSC.0b013e31823a3e2d', type: 'meta-analysis', note: 'Interference was greatest with running (vs cycling) and with high frequency/duration.' },
  { id: 'schumann2022', authors: 'Schumann M, Feuerbacher JF, Sünkeler M, et al.', year: 2022, title: 'Compatibility of concurrent aerobic and strength training for skeletal muscle size and function: an updated systematic review and meta-analysis', journal: 'Sports Medicine', doi: '10.1007/s40279-021-01587-7', type: 'meta-analysis', note: 'Hypertrophy was not significantly blunted overall; explosive strength was.' },
  { id: 'blagrove2018', authors: 'Blagrove RC, Howatson G, Hayes PR', year: 2018, title: 'Effects of strength training on the physiological determinants of middle- and long-distance running performance: a systematic review', journal: 'Sports Medicine', doi: '10.1007/s40279-017-0835-7', type: 'systematic-review' },
  { id: 'seiler2010', authors: 'Seiler S', year: 2010, title: 'What is best practice for training intensity and duration distribution in endurance athletes?', journal: 'International Journal of Sports Physiology and Performance', doi: '10.1123/ijspp.5.3.276', type: 'review' },
  { id: 'rosenblat2019', authors: 'Rosenblat MA, Perrotta AS, Vicenzino B', year: 2019, title: 'Polarized vs. threshold training intensity distribution on endurance sport performance: a systematic review and meta-analysis of randomized controlled trials', journal: 'Journal of Strength and Conditioning Research', doi: '10.1519/JSC.0000000000002618', type: 'meta-analysis' },
  { id: 'haugen2022', authors: 'Haugen T, Sandbakk Ø, Seiler S, Tønnessen E', year: 2022, title: 'The training characteristics of world-class distance runners: an integration of scientific literature and results-proven practice', journal: 'Sports Medicine - Open', doi: '10.1186/s40798-022-00438-7', type: 'review' },
  { id: 'haugen2019', authors: 'Haugen T, Seiler S, Sandbakk Ø, Tønnessen E', year: 2019, title: 'The training and development of elite sprint performance: an integration of scientific and best practice literature', journal: 'Sports Medicine - Open', doi: '10.1186/s40798-019-0221-0', type: 'review' },
  { id: 'midgley2007', authors: 'Midgley AW, McNaughton LR, Jones AM', year: 2007, title: 'Training to enhance the physiological determinants of long-distance running performance', journal: 'Sports Medicine', doi: '10.2165/00007256-200737100-00003', type: 'review' },
  { id: 'saunders2004', authors: 'Saunders PU, Pyne DB, Telford RD, Hawley JA', year: 2004, title: 'Factors affecting running economy in trained distance runners', journal: 'Sports Medicine', doi: '10.2165/00007256-200434070-00005', type: 'review' },
  { id: 'foster2001', authors: 'Foster C, Florhaug JA, Franklin J, et al.', year: 2001, title: 'A new approach to monitoring exercise training', journal: 'Journal of Strength and Conditioning Research', doi: '10.1519/00124278-200102000-00019', type: 'other', note: 'Session RPE × duration as a training-load measure.' },
  { id: 'impellizzeri2020', authors: 'Impellizzeri FM, Tenan MS, Kempton T, Novak A, Coutts AJ', year: 2020, title: 'Acute:chronic workload ratio: conceptual issues and fundamental pitfalls', journal: 'International Journal of Sports Physiology and Performance', doi: '10.1123/ijspp.2019-0864', type: 'review', note: 'Why the app treats load ratios as a flag, never a rule.' },
  { id: 'saw2016', authors: 'Saw AE, Main LC, Gastin PB', year: 2016, title: 'Monitoring the athlete training response: subjective self-reported measures trump commonly used objective measures: a systematic review', journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2015-094758', type: 'systematic-review' },
  { id: 'halson2014', authors: 'Halson SL', year: 2014, title: 'Monitoring training load to understand fatigue in athletes', journal: 'Sports Medicine', doi: '10.1007/s40279-014-0253-z', type: 'review' },
  { id: 'roberts2015', authors: 'Roberts LA, Raastad T, Markworth JF, et al.', year: 2015, title: 'Post-exercise cold water immersion attenuates acute anabolic signalling and long-term adaptations in muscle to strength training', journal: 'The Journal of Physiology', doi: '10.1113/JP270570', type: 'rct' },

  // Nutrition & body composition
  { id: 'morton2018', authors: 'Morton RW, Murphy KT, McKellar SR, et al.', year: 2018, title: 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults', journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2017-097608', type: 'meta-analysis', note: 'Gains plateau around 1.6 g/kg/day (upper 95% CI ~2.2).' },
  { id: 'jager2017', authors: 'Jäger R, Kerksick CM, Campbell BI, et al.', year: 2017, title: 'International Society of Sports Nutrition position stand: protein and exercise', journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1186/s12970-017-0177-8', type: 'consensus' },
  { id: 'kerksick2017', authors: 'Kerksick CM, Arent S, Schoenfeld BJ, et al.', year: 2017, title: 'International Society of Sports Nutrition position stand: nutrient timing', journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1186/s12970-017-0189-4', type: 'consensus' },
  { id: 'thomas2016', authors: 'Thomas DT, Erdman KA, Burke LM', year: 2016, title: 'American College of Sports Medicine joint position statement: nutrition and athletic performance', journal: 'Medicine & Science in Sports & Exercise', doi: '10.1249/MSS.0000000000000852', type: 'consensus' },
  { id: 'burke2011', authors: 'Burke LM, Hawley JA, Wong SHS, Jeukendrup AE', year: 2011, title: 'Carbohydrates for training and competition', journal: 'Journal of Sports Sciences', doi: '10.1080/02640414.2011.585473', type: 'review' },
  { id: 'burke2019', authors: 'Burke LM, Castell LM, Casa DJ, et al.', year: 2019, title: 'International Association of Athletics Federations consensus statement 2019: nutrition for athletics', journal: 'International Journal of Sport Nutrition and Exercise Metabolism', doi: '10.1123/ijsnem.2019-0065', type: 'consensus' },
  { id: 'moore2009', authors: 'Moore DR, Robinson MJ, Fry JL, et al.', year: 2009, title: 'Ingested protein dose response of muscle and albumin protein synthesis after resistance exercise in young men', journal: 'The American Journal of Clinical Nutrition', doi: '10.3945/ajcn.2008.26401', type: 'rct' },
  { id: 'areta2013', authors: 'Areta JL, Burke LM, Ross ML, et al.', year: 2013, title: 'Timing and distribution of protein ingestion during prolonged recovery from resistance exercise alters myofibrillar protein synthesis', journal: 'The Journal of Physiology', doi: '10.1113/jphysiol.2012.244897', type: 'rct' },
  { id: 'trommelen2023', authors: 'Trommelen J, van Lieshout GAA, Nyakayiru J, et al.', year: 2023, title: 'The anabolic response to protein ingestion during recovery from exercise has no upper limit in magnitude and duration in vivo in humans', journal: 'Cell Reports Medicine', doi: '10.1016/j.xcrm.2023.101324', type: 'rct' },
  { id: 'snijders2015', authors: 'Snijders T, Res PT, Smeets JSJ, et al.', year: 2015, title: 'Protein ingestion before sleep increases muscle mass and strength gains during prolonged resistance-type exercise training in healthy young men', journal: 'The Journal of Nutrition', doi: '10.3945/jn.114.208371', type: 'rct' },
  { id: 'helms2014', authors: 'Helms ER, Aragon AA, Fitschen PJ', year: 2014, title: 'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation', journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1186/1550-2783-11-20', type: 'review', note: 'Suggests 0.5–1% body weight loss per week, slower for leaner athletes.' },
  { id: 'garthe2011', authors: 'Garthe I, Raastad T, Refsnes PE, Koivisto A, Sundgot-Borgen J', year: 2011, title: 'Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes', journal: 'International Journal of Sport Nutrition and Exercise Metabolism', doi: '10.1123/ijsnem.21.2.97', type: 'rct', note: 'Slower loss (~0.7%/week) preserved lean mass better than faster loss.' },
  { id: 'murphy2022', authors: 'Murphy C, Koehler K', year: 2022, title: 'Energy deficiency impairs resistance training gains in lean mass but not strength: a meta-analysis and meta-regression', journal: 'Scandinavian Journal of Medicine & Science in Sports', doi: '10.1111/sms.14075', type: 'meta-analysis' },
  { id: 'mountjoy2023', authors: 'Mountjoy M, Ackerman KE, Bailey DM, et al.', year: 2023, title: "2023 International Olympic Committee's (IOC) consensus statement on Relative Energy Deficiency in Sport (REDs)", journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2023-106994', type: 'consensus' },
  { id: 'iraki2019', authors: 'Iraki J, Fitschen P, Espinar S, Helms E', year: 2019, title: 'Nutrition recommendations for bodybuilders in the off-season: a narrative review', journal: 'Sports', doi: '10.3390/sports7070154', type: 'review' },
  { id: 'evenepoel1998', authors: 'Evenepoel P, Geypens B, Luypaerts A, et al.', year: 1998, title: 'Digestibility of cooked and raw egg protein in humans as assessed by stable isotope techniques', journal: 'The Journal of Nutrition', doi: '10.1093/jn/128.10.1716', type: 'rct' },
  { id: 'hallberg1989', authors: 'Hallberg L, Brune M, Rossander L', year: 1989, title: 'Iron absorption in man: ascorbic acid and dose-dependent inhibition by phytate', journal: 'The American Journal of Clinical Nutrition', doi: '10.1093/ajcn/49.1.140', type: 'mechanistic' },
  { id: 'hurrell2010', authors: 'Hurrell R, Egli I', year: 2010, title: 'Iron bioavailability and dietary reference values', journal: 'The American Journal of Clinical Nutrition', doi: '10.3945/ajcn.2010.28674F', type: 'review' },
  { id: 'gartner1997', authors: 'Gärtner C, Stahl W, Sies H', year: 1997, title: 'Lycopene is more bioavailable from tomato paste than from fresh tomatoes', journal: 'The American Journal of Clinical Nutrition', doi: '10.1093/ajcn/66.1.116', type: 'mechanistic' },
  { id: 'unlu2005', authors: 'Unlu NZ, Bohn T, Clinton SK, Schwartz SJ', year: 2005, title: 'Carotenoid absorption from salad and salsa by humans is enhanced by the addition of avocado or avocado oil', journal: 'The Journal of Nutrition', doi: '10.1093/jn/135.3.431', type: 'rct' },
  { id: 'wastyk2021', authors: 'Wastyk HC, Fragiadakis GK, Perelman D, et al.', year: 2021, title: 'Gut-microbiota-targeted diets modulate human immune status', journal: 'Cell', doi: '10.1016/j.cell.2021.06.019', type: 'rct' },
  { id: 'curtis2019', authors: 'Curtis PJ, van der Velpen V, Berends L, et al.', year: 2019, title: 'Blueberries improve biomarkers of cardiometabolic function in participants with metabolic syndrome—results from a 6-month, double-blind, randomized controlled trial', journal: 'The American Journal of Clinical Nutrition', doi: '10.1093/ajcn/nqy380', type: 'rct', note: 'Funded by the US Highbush Blueberry Council; only the 1-cup dose had effects.' },
  { id: 'reynolds2019', authors: 'Reynolds A, Mann J, Cummings J, et al.', year: 2019, title: 'Carbohydrate quality and human health: a series of systematic reviews and meta-analyses', journal: 'The Lancet', doi: '10.1016/S0140-6736(18)31809-9', type: 'meta-analysis' },
  { id: 'aune2017', authors: 'Aune D, Giovannucci E, Boffetta P, et al.', year: 2017, title: 'Fruit and vegetable intake and the risk of cardiovascular disease, total cancer and all-cause mortality—a systematic review and dose-response meta-analysis of prospective studies', journal: 'International Journal of Epidemiology', doi: '10.1093/ije/dyw319', type: 'meta-analysis' },
  { id: 'estruch2018', authors: 'Estruch R, Ros E, Salas-Salvadó J, et al.', year: 2018, title: 'Primary prevention of cardiovascular disease with a Mediterranean diet supplemented with extra-virgin olive oil or nuts', journal: 'New England Journal of Medicine', doi: '10.1056/NEJMoa1800389', type: 'rct' },
  { id: 'bouvard2015', authors: 'Bouvard V, Loomis D, Guyton KZ, et al.', year: 2015, title: 'Carcinogenicity of consumption of red and processed meat', journal: 'The Lancet Oncology', doi: '10.1016/S1470-2045(15)00444-1', type: 'consensus' },
  { id: 'hall2019', authors: 'Hall KD, Ayuketah A, Brychta R, et al.', year: 2019, title: 'Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomized controlled trial of ad libitum food intake', journal: 'Cell Metabolism', doi: '10.1016/j.cmet.2019.05.008', type: 'rct' },
  { id: 'sacn2019', authors: 'Scientific Advisory Committee on Nutrition', year: 2019, title: 'Saturated fats and health', url: 'https://www.gov.uk/government/publications/saturated-fats-and-health-sacn-report', type: 'guideline' },
  { id: 'sacn2015', authors: 'Scientific Advisory Committee on Nutrition', year: 2015, title: 'Carbohydrates and health', url: 'https://www.gov.uk/government/publications/sacn-carbohydrates-and-health-report', type: 'guideline' },
  { id: 'sacn2016', authors: 'Scientific Advisory Committee on Nutrition', year: 2016, title: 'Vitamin D and health', url: 'https://www.gov.uk/government/publications/sacn-vitamin-d-and-health-report', type: 'guideline' },
  { id: 'nhs-vitd', authors: 'NHS', year: 2020, title: 'Vitamin D', url: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/', type: 'guideline' },
  { id: 'eatwell', authors: 'Public Health England', year: 2016, title: 'The Eatwell Guide', url: 'https://www.gov.uk/government/publications/the-eatwell-guide', type: 'guideline' },
  { id: 'nice-ng20', authors: 'National Institute for Health and Care Excellence', year: 2015, title: 'Coeliac disease: recognition, assessment and management (NG20)', url: 'https://www.nice.org.uk/guidance/ng20', type: 'guideline' },
  { id: 'nhs-coeliac', authors: 'NHS', year: 2023, title: 'Coeliac disease', url: 'https://www.nhs.uk/conditions/coeliac-disease/', type: 'guideline' },
  { id: 'coeliac-uk', authors: 'Coeliac UK', year: 2024, title: 'Coeliac UK — living gluten free, oats, and the GF venue guide', url: 'https://www.coeliac.org.uk/', type: 'guideline' },

  // Supplements
  { id: 'maughan2018', authors: 'Maughan RJ, Burke LM, Dvorak J, et al.', year: 2018, title: 'IOC consensus statement: dietary supplements and the high-performance athlete', journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2018-099027', type: 'consensus' },
  { id: 'kreider2017', authors: 'Kreider RB, Kalman DS, Antonio J, et al.', year: 2017, title: 'International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine', journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1186/s12970-017-0173-z', type: 'consensus' },
  { id: 'guest2021', authors: 'Guest NS, VanDusseldorp TA, Nelson MT, et al.', year: 2021, title: 'International society of sports nutrition position stand: caffeine and exercise performance', journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1186/s12970-020-00383-4', type: 'consensus' },
  { id: 'senefeld2020', authors: 'Senefeld JW, Wiggins CC, Regimbal RJ, et al.', year: 2020, title: 'Ergogenic effect of nitrate supplementation: a systematic review and meta-analysis', journal: 'Medicine & Science in Sports & Exercise', doi: '10.1249/MSS.0000000000002363', type: 'meta-analysis' },
  { id: 'ristow2009', authors: 'Ristow M, Zarse K, Oberbach A, et al.', year: 2009, title: 'Antioxidants prevent health-promoting effects of physical exercise in humans', journal: 'Proceedings of the National Academy of Sciences', doi: '10.1073/pnas.0903485106', type: 'rct' },
  { id: 'paulsen2014', authors: 'Paulsen G, Cumming KT, Holden G, et al.', year: 2014, title: 'Vitamin C and E supplementation hampers cellular adaptation to endurance training in humans: a double-blind, randomised, controlled trial', journal: 'The Journal of Physiology', doi: '10.1113/jphysiol.2013.267419', type: 'rct' },
  { id: 'bjelakovic2012', authors: 'Bjelakovic G, Nikolova D, Gluud LL, Simonetti RG, Gluud C', year: 2012, title: 'Antioxidant supplements for prevention of mortality in healthy participants and patients with various diseases', journal: 'Cochrane Database of Systematic Reviews', doi: '10.1002/14651858.CD007176.pub2', type: 'systematic-review' },
  { id: 'manson2019', authors: 'Manson JE, Cook NR, Lee IM, et al.', year: 2019, title: 'Marine n−3 fatty acids and prevention of cardiovascular disease and cancer', journal: 'New England Journal of Medicine', doi: '10.1056/NEJMoa1811403', type: 'rct' },
  { id: 'abdelhamid2020', authors: 'Abdelhamid AS, Brown TJ, Brainard JS, et al.', year: 2020, title: 'Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease', journal: 'Cochrane Database of Systematic Reviews', doi: '10.1002/14651858.CD003177.pub5', type: 'systematic-review' },
  { id: 'sesso2022', authors: 'Sesso HD, Manson JE, Aragaki AK, et al.', year: 2022, title: 'Effect of cocoa flavanol supplementation for the prevention of cardiovascular disease events: the COcoa Supplement and Multivitamin Outcomes Study (COSMOS) randomized clinical trial', journal: 'The American Journal of Clinical Nutrition', doi: '10.1093/ajcn/nqac055', type: 'rct' },
  { id: 'shaw2017', authors: 'Shaw G, Lee-Barthel A, Ross ML, Wang B, Baar K', year: 2017, title: 'Vitamin C–enriched gelatin supplementation before intermittent activity augments collagen synthesis', journal: 'The American Journal of Clinical Nutrition', doi: '10.3945/ajcn.116.138594', type: 'rct' },

  // Ageing, cellular health, longevity
  { id: 'lopezotin2023', authors: 'López-Otín C, Blasco MA, Partridge L, Serrano M, Kroemer G', year: 2023, title: 'Hallmarks of aging: an expanding universe', journal: 'Cell', doi: '10.1016/j.cell.2022.11.001', type: 'review' },
  { id: 'decabo2019', authors: 'de Cabo R, Mattson MP', year: 2019, title: 'Effects of intermittent fasting on health, aging, and disease', journal: 'New England Journal of Medicine', doi: '10.1056/NEJMra1905136', type: 'review' },
  { id: 'lowe2020', authors: 'Lowe DA, Wu N, Rohdin-Bibby L, et al.', year: 2020, title: 'Effects of time-restricted eating on weight loss and other metabolic parameters in women and men with overweight and obesity: the TREAT randomized clinical trial', journal: 'JAMA Internal Medicine', doi: '10.1001/jamainternmed.2020.4153', type: 'rct' },
  { id: 'mandsager2018', authors: 'Mandsager K, Harb S, Cremer P, et al.', year: 2018, title: 'Association of cardiorespiratory fitness with long-term mortality among adults undergoing exercise treadmill testing', journal: 'JAMA Network Open', doi: '10.1001/jamanetworkopen.2018.3605', type: 'cohort' },
  { id: 'ekelund2019', authors: 'Ekelund U, Tarp J, Steene-Johannessen J, et al.', year: 2019, title: 'Dose-response associations between accelerometry measured physical activity and sedentary time and all cause mortality: systematic review and harmonised meta-analysis', journal: 'BMJ', doi: '10.1136/bmj.l4570', type: 'meta-analysis' },
  { id: 'momma2022', authors: 'Momma H, Kawakami R, Honda T, Sawada SS', year: 2022, title: 'Muscle-strengthening activities are associated with lower risk and mortality in major non-communicable diseases: a systematic review and meta-analysis of cohort studies', journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2021-105061', type: 'meta-analysis' },
  { id: 'weaver2016', authors: 'Weaver CM, Gordon CM, Janz KF, et al.', year: 2016, title: "The National Osteoporosis Foundation's position statement on peak bone mass development and lifestyle factors: a systematic review and implementation recommendations", journal: 'Osteoporosis International', doi: '10.1007/s00198-015-3440-3', type: 'systematic-review' },
  { id: 'cmo2019', authors: 'Department of Health and Social Care', year: 2019, title: "UK Chief Medical Officers' physical activity guidelines", url: 'https://www.gov.uk/government/publications/physical-activity-guidelines-uk-chief-medical-officers-report', type: 'guideline' },
  { id: 'hughes2013', authors: 'Hughes MCB, Williams GM, Baker P, Green AC', year: 2013, title: 'Sunscreen and prevention of skin aging: a randomized trial', journal: 'Annals of Internal Medicine', doi: '10.7326/0003-4819-158-11-201306040-00002', type: 'rct' },
  { id: 'mukherjee2006', authors: 'Mukherjee S, Date A, Patravale V, et al.', year: 2006, title: 'Retinoids in the treatment of skin aging: an overview of clinical efficacy and safety', journal: 'Clinical Interventions in Aging', doi: '10.2147/ciia.2006.1.4.327', type: 'review' },

  // Sleep & recovery
  { id: 'watson2015', authors: 'Watson NF, Badr MS, Belenky G, et al.', year: 2015, title: 'Recommended amount of sleep for a healthy adult: a joint consensus statement of the American Academy of Sleep Medicine and Sleep Research Society', journal: 'Sleep', doi: '10.5665/sleep.4716', type: 'consensus' },
  { id: 'hirshkowitz2015', authors: 'Hirshkowitz M, Whiton K, Albert SM, et al.', year: 2015, title: "National Sleep Foundation's sleep time duration recommendations: methodology and results summary", journal: 'Sleep Health', doi: '10.1016/j.sleh.2014.12.010', type: 'consensus' },
  { id: 'walsh2021', authors: 'Walsh NP, Halson SL, Sargent C, et al.', year: 2021, title: 'Sleep and the athlete: narrative review and 2021 expert consensus recommendations', journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2020-102025', type: 'consensus' },
  { id: 'fullagar2015', authors: 'Fullagar HHK, Skorski S, Duffield R, et al.', year: 2015, title: 'Sleep and athletic performance: the effects of sleep loss on exercise performance, and physiological and cognitive responses to exercise', journal: 'Sports Medicine', doi: '10.1007/s40279-014-0260-0', type: 'systematic-review' },
  { id: 'mah2011', authors: 'Mah CD, Mah KE, Kezirian EJ, Dement WC', year: 2011, title: 'The effects of sleep extension on the athletic performance of collegiate basketball players', journal: 'Sleep', doi: '10.5665/SLEEP.1132', type: 'other', note: 'Small, uncontrolled — suggestive only.' },
  { id: 'lamon2021', authors: 'Lamon S, Morabito A, Arentson-Lantz E, et al.', year: 2021, title: 'The effect of acute sleep deprivation on skeletal muscle protein synthesis and the hormonal environment', journal: 'Physiological Reports', doi: '10.14814/phy2.14660', type: 'rct' },
  { id: 'leproult2011', authors: 'Leproult R, Van Cauter E', year: 2011, title: 'Effect of 1 week of sleep restriction on testosterone levels in young healthy men', journal: 'JAMA', doi: '10.1001/jama.2011.710', type: 'other', note: 'Small (n = 10) laboratory study.' },
  { id: 'prather2015', authors: 'Prather AA, Janicki-Deverts D, Hall MH, Cohen S', year: 2015, title: 'Behaviorally assessed sleep and susceptibility to the common cold', journal: 'Sleep', doi: '10.5665/sleep.4968', type: 'cohort' },
  { id: 'diekelmann2010', authors: 'Diekelmann S, Born J', year: 2010, title: 'The memory function of sleep', journal: 'Nature Reviews Neuroscience', doi: '10.1038/nrn2762', type: 'review' },
  { id: 'cappuccio2011', authors: 'Cappuccio FP, Cooper D, D’Elia L, Strazzullo P, Miller MA', year: 2011, title: 'Sleep duration predicts cardiovascular outcomes: a systematic review and meta-analysis of prospective studies', journal: 'European Heart Journal', doi: '10.1093/eurheartj/ehr007', type: 'meta-analysis' },
  { id: 'windred2024', authors: 'Windred DP, Burns AC, Lane JM, et al.', year: 2024, title: 'Sleep regularity is a stronger predictor of mortality risk than sleep duration: a prospective cohort study', journal: 'Sleep', doi: '10.1093/sleep/zsad253', type: 'cohort' },
  { id: 'drake2013', authors: 'Drake C, Roehrs T, Shambroom J, Roth T', year: 2013, title: 'Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed', journal: 'Journal of Clinical Sleep Medicine', doi: '10.5664/jcsm.3170', type: 'rct' },
  { id: 'goyal2014', authors: 'Goyal M, Singh S, Sibinga EMS, et al.', year: 2014, title: 'Meditation programs for psychological stress and well-being: a systematic review and meta-analysis', journal: 'JAMA Internal Medicine', doi: '10.1001/jamainternmed.2013.13018', type: 'meta-analysis' },

  // Learning
  { id: 'dunlosky2013', authors: 'Dunlosky J, Rawson KA, Marsh EJ, Nathan MJ, Willingham DT', year: 2013, title: "Improving students' learning with effective learning techniques: promising directions from cognitive and educational psychology", journal: 'Psychological Science in the Public Interest', doi: '10.1177/1529100612453266', type: 'review' },
  { id: 'cepeda2006', authors: 'Cepeda NJ, Pashler H, Vul E, Wixted JT, Rohrer D', year: 2006, title: 'Distributed practice in verbal recall tasks: a review and quantitative synthesis', journal: 'Psychological Bulletin', doi: '10.1037/0033-2909.132.3.354', type: 'meta-analysis' },
  { id: 'roediger2006', authors: 'Roediger HL, Karpicke JD', year: 2006, title: 'Test-enhanced learning: taking memory tests improves long-term retention', journal: 'Psychological Science', doi: '10.1111/j.1467-9280.2006.01693.x', type: 'rct' },
  { id: 'mueller2014', authors: 'Mueller PA, Oppenheimer DM', year: 2014, title: 'The pen is mightier than the keyboard: advantages of longhand over laptop note taking', journal: 'Psychological Science', doi: '10.1177/0956797614524581', type: 'rct' },
  { id: 'morehead2019', authors: 'Morehead K, Dunlosky J, Rawson KA', year: 2019, title: 'How much mightier is the pen than the keyboard for note-taking? A replication and extension of Mueller and Oppenheimer (2014)', journal: 'Educational Psychology Review', doi: '10.1007/s10648-019-09468-2', type: 'rct', note: 'Did not clearly replicate the longhand advantage.' },

  // Public health (academic)
  { id: 'tudorhart1971', authors: 'Tudor Hart J', year: 1971, title: 'The inverse care law', journal: 'The Lancet', doi: '10.1016/S0140-6736(71)92410-X', type: 'other' },
  { id: 'marmot2010', authors: 'Marmot M, et al.', year: 2010, title: 'Fair Society, Healthy Lives (The Marmot Review)', url: 'https://www.instituteofhealthequity.org/resources-reports/fair-society-healthy-lives-the-marmot-review', type: 'guideline' },
];

export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

export function sourceLink(s: Source): string | undefined {
  return s.doi ? `https://doi.org/${s.doi}` : s.url;
}
