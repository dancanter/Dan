import type { Source } from './schema';

export const sources: Source[] = [
  // ── UK government / national bodies ────────────────────────────────
  {
    id: 'sacn-2026',
    label: 'Nutrition and maternal weight outcomes',
    organisation: 'SACN — UK Department of Health & Social Care, 2026',
    tier: 'gov',
    reviewed: '2026',
  },
  {
    id: 'nice-ng201-sleep',
    label: 'NG201, evidence review W: Maternal sleep position during pregnancy',
    organisation: 'NICE, August 2021',
    tier: 'gov',
    reviewed: 'August 2021',
  },
  {
    id: 'nice-ng247',
    label: 'NG247, Maternal and child nutrition',
    organisation: 'NICE, 2025',
    tier: 'gov',
    reviewed: '2025',
  },
  {
    id: 'mhra-paracetamol',
    label: 'MHRA statement on paracetamol use in pregnancy',
    organisation: 'MHRA via GOV.UK, September 2025',
    tier: 'gov',
    reviewed: 'September 2025',
  },

  // ── NHS ────────────────────────────────────────────────────────────
  {
    id: 'nhs-antenatal-care',
    label: 'Antenatal care and appointments',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-week-by-week',
    label: 'Week-by-week guide to pregnancy, including 1 to 3 weeks',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-dairy',
    label: 'Milk and dairy foods — Eatwell Guide',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'bhf-dairy',
    label: 'Dairy foods, saturated fat and heart health',
    organisation: 'British Heart Foundation',
    tier: 'charity',
  },
  {
    id: 'rcm-infant-feeding',
    label: 'Infant feeding guidance',
    organisation: 'Royal College of Midwives',
    tier: 'college',
  },
  {
    id: 'nhs-postpartum-psychosis',
    label: 'Postpartum psychosis',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'app-network',
    label: 'Action on Postpartum Psychosis — support and peer network',
    organisation: 'APP',
    tier: 'charity',
  },
  {
    id: 'mbrrace-2026',
    label: 'Saving Lives, Improving Mothers’ Care — UK confidential enquiry into maternal deaths',
    organisation: 'MBRRACE-UK, 2021–2023 report (Jan 2025) and 2022–2024 report (Jan 2026)',
    tier: 'gov',
    reviewed: 'January 2026',
    caveat:
      'The published ratios move between annual reports as the rolling three-year window shifts. Figures here are stated as ranges for that reason — check the latest report for the current numbers.',
  },
  {
    id: 'rcog-mbrrace',
    label: 'Statement on the MBRRACE-UK maternal mortality findings',
    organisation: 'Royal College of Obstetricians and Gynaecologists, 2025',
    tier: 'college',
  },
  {
    id: 'weq-black-maternal-health',
    label: 'Black maternal health — Third Report of Session 2022–23',
    organisation: 'Women and Equalities Committee, House of Commons, 2023',
    tier: 'gov',
    reviewed: '2023',
  },
  {
    id: 'adesina-2025',
    label: 'Ethnic disparities in UK maternal outcomes',
    organisation: 'Adesina O, et al. British Journal of Midwifery, 2025',
    tier: 'research',
  },
  {
    id: 'five-x-more',
    label: 'Black maternity experiences and advocacy guidance',
    organisation: 'Five X More',
    tier: 'charity',
  },
  {
    id: 'birthrights',
    label: 'Your rights in pregnancy and birth',
    organisation: 'Birthrights',
    tier: 'charity',
  },
  {
    id: 'tommys-caffeine',
    label: 'Limiting your caffeine intake in pregnancy, and the stillbirth research summary',
    organisation: 'Tommy’s Maternal and Fetal Health Research Centre, 2024',
    tier: 'charity',
    reviewed: 'August 2024',
    caveat:
      'Observational, so it cannot fully separate caffeine from sugar in cola or taurine in energy drinks. The dose-response pattern tracks caffeine amount closely, which is why the practical advice — treat 200mg as a ceiling, not a target — holds regardless.',
  },
  {
    id: 'daley-2010-grassfed',
    label: 'Fatty acid profiles and antioxidant content in grass-fed and grain-fed beef',
    organisation: 'Daley CA, et al. Nutrition Journal 2010;9:10',
    tier: 'research',
    caveat:
      'A comparison of what is in the meat, not a study of what it does to anyone. No trial has shown better outcomes for a mother or baby from grass-fed over grain-fed — the differences are real but small in absolute terms.',
  },
  {
    id: 'anderson-2026-dairy',
    label: 'Full-fat dairy and cardiometabolic risk factors — 12-week randomised controlled trial',
    organisation: 'Anderson GH, et al. University of Toronto, 2026',
    tier: 'research',
    caveat:
      'A randomised trial, so it avoids the confounding that limits the observational dairy studies — but it ran 12 weeks and measured risk markers rather than disease outcomes, and it was not conducted in pregnancy. Funding is not confirmed here, and dairy trials are frequently industry-supported.',
  },
  {
    id: 'thorning-2017-matrix',
    label: 'Whole dairy matrix or single nutrients in assessment of health effects',
    organisation: 'Thorning TK, et al. Am J Clin Nutr 2017;105(5):1033–45',
    tier: 'research',
    caveat:
      'A narrative review rather than a trial, and dairy-industry research funding is common across this field. The "matrix" idea is widely discussed but not settled — treat it as an open question, not a reversal of UK guidance.',
  },
  {
    id: 'nhs-vitamins',
    label: 'Vitamins and supplements in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-foods-to-avoid',
    label: 'Foods to avoid in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-weight-gain',
    label: 'Weight gain in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
    reviewed: 'March 2026',
  },
  {
    id: 'nhs-mental-health',
    label: 'Mental health and pregnancy',
    organisation: 'NHS — Best Start in Life',
    tier: 'nhs',
  },
  {
    id: 'nhs-exercise',
    label: 'Exercise in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-baby-movements',
    label: "Your baby's movements",
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-common-problems',
    label: 'Common health problems in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-get-help',
    label: 'Pregnancy symptoms you need to get help for',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-medicines',
    label: 'Medicines in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-headaches',
    label: 'Headaches in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-alcohol',
    label: 'Drinking alcohol while pregnant',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-smoking',
    label: 'Stop smoking in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-travel',
    label: 'Travelling in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-infections',
    label: 'Infections in pregnancy that may affect your baby',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-dvt',
    label: 'Deep vein thrombosis in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-urgent-mental-health',
    label: 'Where to get urgent help for mental health',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-morning-sickness',
    label: 'Vomiting and morning sickness',
    organisation: 'NHS',
    tier: 'nhs',
  },

  // ── Royal colleges ─────────────────────────────────────────────────
  {
    id: 'rcog-healthy-eating',
    label: 'Healthy eating and vitamin supplements in pregnancy',
    organisation: 'RCOG (based on NICE NG247, updated April 2026)',
    tier: 'college',
  },
  {
    id: 'rcog-gtg57',
    label: 'Green-top Guideline No. 57: Reduced Fetal Movements',
    organisation: 'RCOG',
    tier: 'college',
  },

  // ── Charities ──────────────────────────────────────────────────────
  {
    id: 'nct-hormones',
    label: 'Hormones in pregnancy and labour',
    organisation: 'NCT (reviewed February 2025)',
    tier: 'charity',
    reviewed: 'February 2025',
  },
  {
    id: 'nct-emotions',
    label: 'Common emotions when expecting a baby',
    organisation: 'NCT (reviewed January 2025)',
    tier: 'charity',
    reviewed: 'January 2025',
  },
  {
    id: 'tommys-sleep-on-side',
    label: 'Sleep On Side',
    organisation: "Tommy's",
    tier: 'charity',
  },
  {
    id: 'tommys-movements',
    label: 'Reduced fetal movements in pregnancy',
    organisation: "Tommy's (reviewed January 2026)",
    tier: 'charity',
  },
  {
    id: 'tommys-sunshine',
    label: 'Sunshine and healthy babies',
    organisation: "Tommy's",
    tier: 'charity',
    caveat: 'Cites Clemens T, et al. IJPDS 2017;1(1):242.',
  },

  // ── Peer-reviewed research ─────────────────────────────────────────
  {
    id: 'iannotti-2024',
    label: 'Terrestrial Animal Source Foods and Health Outcomes',
    organisation: 'Iannotti L, et al. Nutrients 2024;16(19):3231',
    tier: 'research',
    caveat:
      'Narrative review in a special issue on animal-derived foods, with FAO-affiliated authors — the underlying meta-analysis figures are checkable, but read the framing with some caution.',
  },
  {
    id: 'dairy-dose-response',
    label: 'Maternal Consumption of Milk or Dairy Products and Birth Outcomes',
    organisation: 'Dose-response meta-analysis, PMC9261982 (PROSPERO CRD42020150608)',
    tier: 'research',
  },
  {
    id: 'razmpoosh-2025',
    label: 'Dairy Intake and Iodine Status in Pregnant and Lactating Women',
    organisation: 'Razmpoosh E, et al. Nutrients 2025;17(23):3765',
    tier: 'research',
    caveat:
      'Funded by the National Dairy Council. The core statistics are methodologically solid (the deficiency odds ratio has zero heterogeneity); the discussion leans favourably toward dairy.',
  },
  {
    id: 'allotey-2026',
    label: 'Lifestyle interventions and gestational diabetes',
    organisation: 'Allotey J, et al. (i-WIP Collaborative Group). BMJ 2026;392:e084159',
    tier: 'research',
  },
  {
    id: 'teede-2025',
    label: 'Gestational weight gain and adverse outcomes in 1.6 million women',
    organisation: 'Teede H, et al. BMJ 2025; doi:10.1136/bmj-2025-085710',
    tier: 'research',
  },
  {
    id: 'jabin-2025',
    label: 'Gestational age-specific weight gain and perinatal outcomes',
    organisation: 'Jabin N, et al. (INTERBIO-21st Consortium). Am J Clin Nutr 2025',
    tier: 'research',
  },
  {
    id: 'abera-2024',
    label: 'Effects of relaxation interventions during pregnancy',
    organisation: 'Abera M, et al. PLOS Global Public Health 2024 (PMC10810490)',
    tier: 'research',
  },
  {
    id: 'babbar-2021',
    label: 'Meditation and Mindfulness in Pregnancy and Postpartum',
    organisation: 'Babbar S, et al. Clin Obstet Gynecol 2021;64(3), PMID 34162788',
    tier: 'research',
  },
  {
    id: 'alves-2021',
    label: 'Resilience and Stress during Pregnancy',
    organisation: 'Alves AC, et al. ScientificWorldJournal 2021 (PMC8382548)',
    tier: 'research',
  },
  {
    id: 'wang-2022-sleep',
    label: 'Sleep duration and gestational diabetes risk',
    organisation: 'Wang R, et al. J Diabetes Investig 2022;13:1262–1276',
    tier: 'research',
  },
  {
    id: 'younglin-2025',
    label: 'Insights into maternal sleep',
    organisation: 'Young-Lin N, et al. eBioMedicine 2025 (PMC11992403)',
    tier: 'research',
  },
  {
    id: 'chahal-2024',
    label: 'Impact of Low Maternal Weight on Pregnancy and Neonatal Outcomes',
    organisation: 'Chahal N, et al. J Endocr Soc 2024;9(1):bvae206',
    tier: 'research',
  },
  {
    id: 'blau-cravings',
    label: "Women's Experience and Understanding of Food Cravings in Pregnancy",
    organisation: 'Blau LE, et al. J Acad Nutr Diet (PMC7186144)',
    tier: 'research',
  },
  {
    id: 'linde-body-image',
    label: 'Trajectory of body image dissatisfaction during pregnancy and postpartum',
    organisation: 'Linde K, et al. (PMC11346655)',
    tier: 'research',
  },
  {
    id: 'carrard-2025',
    label: 'Weight and body image during pregnancy: a qualitative study',
    organisation: 'Carrard I, et al. (PMC12777822)',
    tier: 'research',
  },
  {
    id: 'jee-sawal-2024',
    label: 'Physiological Changes in Pregnant Women Due to Hormonal Changes',
    organisation: 'Jee SB, Sawal A. Cureus 2024;16(3):e55544',
    tier: 'research',
    caveat:
      'Written for a clinical audience. Used only as background to sanity-check the plain-language explanations here, never quoted directly.',
  },
  {
    id: 'clemens-2017',
    label: 'Effect of ultraviolet radiation on birth weights and gestational length',
    organisation: 'Clemens T, et al. IJPDS 2017;1(1):242',
    tier: 'research',
  },
  {
    id: 'opara-activity',
    label: 'Recommendations for Lifestyle Physical Activity During the Perinatal Period',
    organisation: 'Opara J, Mehlich K, Szczygieł J (PMC12785493)',
    tier: 'research',
  },
];

export const sourceById = new Map(sources.map((s) => [s.id, s]));

export const SOURCE_TIER_LABEL: Record<Source['tier'], string> = {
  gov: 'UK Government',
  nhs: 'NHS',
  college: 'Royal College',
  charity: 'Charity',
  research: 'Peer-reviewed',
};
