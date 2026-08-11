import type { Source } from './schema';

export const sources: Source[] = [
  // ── UK government / national bodies ────────────────────────────────
  {
    id: 'sacn-2026',
    label: 'Nutrition and maternal weight outcomes',
    organisation: 'SACN — UK Department of Health & Social Care, 2026',
    tier: 'gov',
  },
  {
    id: 'nice-ng201-sleep',
    label: 'NG201, evidence review W: Maternal sleep position during pregnancy',
    organisation: 'NICE, August 2021',
    tier: 'gov',
  },
  {
    id: 'nice-ng247',
    label: 'NG247, Maternal and child nutrition',
    organisation: 'NICE, 2025',
    tier: 'gov',
  },
  {
    id: 'mhra-paracetamol',
    label: 'MHRA statement on paracetamol use in pregnancy',
    organisation: 'MHRA via GOV.UK, September 2025',
    tier: 'gov',
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
  },
  {
    id: 'nct-emotions',
    label: 'Common emotions when expecting a baby',
    organisation: 'NCT (reviewed January 2025)',
    tier: 'charity',
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
