import type { Source } from './schema';

export const sources: Source[] = [
  {
    id: 'iannotti-2024-terrestrial-asf',
    label: 'Terrestrial Animal Source Foods and Health Outcomes for Those with Special Nutrient Needs in the Life Course',
    organisation: 'Nutrients (2024;16(19):3231)',
    note: 'Narrative review; cites the anaemia meta-analysis (OR 2.02) and a dairy/birth-outcome meta-analysis within it.',
  },
  {
    id: 'dairy-birth-outcomes-dose-response',
    label: 'Maternal Consumption of Milk or Dairy Products During Pregnancy and Birth Outcomes: A Systematic Review and Dose-Response Meta-Analysis',
    organisation: 'PROSPERO CRD42020150608 (PMC9261982)',
  },
  {
    id: 'razmpoosh-2025-dairy-iodine',
    label: 'Dairy Intake and Iodine Status in Pregnant and Lactating Women: A Systematic Review and Meta-Analysis',
    organisation: 'Nutrients (2025;17(23):3765)',
    note: 'PROSPERO CRD420251054576. Funded by the National Dairy Council — core statistics are methodologically solid (zero heterogeneity on the deficiency odds ratio) but discussion sections lean favourably toward dairy.',
  },
  {
    id: 'sacn-2026-maternal-weight',
    label: 'Nutrition and maternal weight outcomes',
    organisation: 'Scientific Advisory Committee on Nutrition (SACN), UK Department of Health and Social Care, 2026',
  },
  {
    id: 'nhs-weight-gain-pregnancy',
    label: 'Weight gain in pregnancy',
    organisation: 'NHS',
    url: 'https://www.nhs.uk/pregnancy/keeping-well/weight-gain/',
  },
  {
    id: 'nct-hormones-pregnancy-labour',
    label: 'Hormones in pregnancy and labour',
    organisation: 'NCT (National Childbirth Trust)',
    note: 'Reviewed February 2025, next review 2028.',
  },
  {
    id: 'nct-common-emotions',
    label: 'Common emotions when expecting a baby',
    organisation: 'NCT (National Childbirth Trust)',
    note: 'Reviewed January 2025.',
  },
  {
    id: 'jee-sawal-2024-cureus',
    label: 'Physiological Changes in Pregnant Women Due to Hormonal Changes',
    organisation: 'Cureus (2024;16(3):e55544)',
    note: 'Clinical-audience background source, used only to sanity-check plain-language explanations, not quoted directly.',
  },
  {
    id: 'nhs-mental-health-pregnancy',
    label: 'Mental health and pregnancy',
    organisation: 'NHS — Best Start in Life',
  },
  {
    id: 'alves-2021-resilience-stress',
    label: 'Resilience and Stress during Pregnancy: A Comprehensive Multidimensional Approach in Maternal and Perinatal Health',
    organisation: 'ScientificWorldJournal (2021, PMC8382548)',
  },
  {
    id: 'abera-2024-relaxation-meta-analysis',
    label: 'Effects of relaxation interventions during pregnancy on maternal mental health, and pregnancy and newborn outcomes: A systematic review and meta-analysis',
    organisation: 'PLOS Global Public Health (2024, PMC10810490)',
    note: 'PROSPERO CRD42020187443.',
  },
  {
    id: 'babbar-2021-mindfulness-review',
    label: 'Meditation and Mindfulness in Pregnancy and Postpartum: A Review of the Evidence',
    organisation: 'Clinical Obstetrics and Gynecology (2021;64(3)), PMID: 34162788',
  },
  {
    id: 'nice-ng247',
    label: 'Antenatal care (NICE guideline NG247)',
    organisation: 'National Institute for Health and Care Excellence (NICE), 2025',
  },
  {
    id: 'teede-2025-bmj-gestational-weight-gain',
    label: 'Gestational weight gain and risk of adverse maternal and neonatal outcomes in observational data from 1.6 million women: systematic review and meta-analysis',
    organisation: 'BMJ (2025), doi:10.1136/bmj-2025-085710',
  },
  {
    id: 'jabin-2025-interbio-weight-gain',
    label: 'Association between gestational age-specific weight gain in pregnancy and risk of adverse perinatal outcomes',
    organisation: 'American Journal of Clinical Nutrition (2025), doi:10.1016/j.ajcnut.2025.04.012',
    note: 'INTERBIO-21st Consortium.',
  },
  {
    id: 'chahal-2024-underweight-outcomes',
    label: 'Impact of Low Maternal Weight on Pregnancy and Neonatal Outcomes',
    organisation: 'Journal of the Endocrine Society (2024;9(1):bvae206)',
  },
  {
    id: 'blau-food-cravings-qualitative',
    label: "Women's Experience and Understanding of Food Cravings in Pregnancy: A Qualitative Study",
    organisation: 'Journal of the Academy of Nutrition and Dietetics (PMC7186144)',
  },
  {
    id: 'linde-body-image-trajectory',
    label: 'The trajectory of body image dissatisfaction during pregnancy and postpartum and its relationship to Body-Mass-Index',
    organisation: 'PMC11346655',
  },
  {
    id: 'carrard-2025-weight-body-image-qualitative',
    label: 'Weight and body image during pregnancy: a qualitative study of the experience of pregnant women, midwives and dietitians',
    organisation: 'PMC12777822',
  },
  {
    id: 'tommys-sunshine-healthy-babies',
    label: 'Sunshine and healthy babies',
    organisation: "Tommy's",
    note: 'Cites Clemens T, Megaw L, Dibben C, Stock S, Weller R. IJPDS 2017;1(1):242.',
  },
  {
    id: 'nhs-vitamins-supplements-pregnancy',
    label: 'Vitamins and supplements in pregnancy',
    organisation: 'NHS — Best Start in Life',
  },
  {
    id: 'rcog-healthy-eating-vitamins',
    label: 'Healthy eating and vitamin supplements in pregnancy',
    organisation: 'Royal College of Obstetricians and Gynaecologists (RCOG), based on NICE NG247, last updated April 2026',
  },
  {
    id: 'nhs-support-signposting',
    label: 'Mental health and pregnancy — further support (Tommy\'s, PANDAS, Family Hubs)',
    organisation: 'NHS — Best Start in Life',
  },
];

export const sourceById = new Map(sources.map((s) => [s.id, s]));
