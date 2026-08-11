import type { Source } from './schema';

/**
 * Sources for the birth, postnatal, feeding, rights and everyday-safety
 * content. Kept separate from sources.ts purely so neither file becomes
 * unmanageable — both are merged into one registry in content/index.ts and
 * behave identically.
 */
export const extendedSources: Source[] = [
  // ── Work, rights and legal ─────────────────────────────────────────
  {
    id: 'govuk-employee-rights',
    label: 'Pregnant employees’ rights',
    organisation: 'GOV.UK',
    tier: 'gov',
  },
  {
    id: 'acas-discrimination',
    label: 'Pregnancy and maternity discrimination',
    organisation: 'Acas (Equality Act 2010), updated June 2026',
    tier: 'gov',
  },
  {
    id: 'hse-pregnant-workers',
    label: 'Protecting pregnant workers and new mothers',
    organisation:
      'HSE — Management of Health and Safety at Work Regulations 1999 (regs 16–18); Workplace Regulations 1992 (reg 25)',
    tier: 'gov',
  },
  {
    id: 'govuk-rsv',
    label: 'RSV vaccination in pregnancy factsheet',
    organisation: 'GOV.UK / UKHSA',
    tier: 'gov',
  },

  // ── Birth and labour ───────────────────────────────────────────────
  {
    id: 'nhs-where-to-give-birth',
    label: 'Choosing where to give birth',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-labour-signs',
    label: 'Signs that labour has begun',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-pain-relief',
    label: 'Pain relief and medication during labour',
    organisation: 'NHS',
    tier: 'nhs',
  },
  { id: 'nhs-giving-birth', label: 'Giving birth', organisation: 'NHS', tier: 'nhs' },
  {
    id: 'nhs-birthing-ball',
    label: 'How to use a birthing ball',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-antenatal-classes',
    label: 'Antenatal and hypnobirthing classes',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nct-hypnobirthing',
    label: 'Hypnobirthing: where to start',
    organisation: 'NCT (reviewed March 2025)',
    tier: 'charity',
  },
  {
    id: 'nhs-hospital-bag',
    label: 'Hospital bag checklist',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-birth-plan',
    label: 'What to include in your birth plan',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-overdue',
    label: 'Overdue — have you gone past your due date?',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-birth-partner',
    label: 'Tips for your birthing partner or partners',
    organisation: 'NHS',
    tier: 'nhs',
  },

  // ── After birth ────────────────────────────────────────────────────
  {
    id: 'nhs-postnatal-check',
    label: 'Your 6-week postnatal check',
    organisation: 'NHS',
    tier: 'nhs',
  },
  { id: 'nhs-new-parents', label: 'Tips for new parents', organisation: 'NHS', tier: 'nhs' },
  { id: 'nhs-early-days', label: 'Early days', organisation: 'NHS', tier: 'nhs' },
  {
    id: 'nhs-post-pregnancy-body',
    label: 'Your post-pregnancy body',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-postnatal-depression',
    label: 'Postnatal depression',
    organisation: 'NHS (reviewed March 2026)',
    tier: 'nhs',
  },
  {
    id: 'tommys-pnd',
    label: 'Postnatal depression (PND)',
    organisation: "Tommy's",
    tier: 'charity',
  },
  {
    id: 'nhs-sex-contraception-after',
    label: 'Sex and contraception after birth',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-parent-support',
    label: 'Services and support for parents',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-single-parents',
    label: 'Advice for single parents',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-fit-with-baby',
    label: 'Keeping fit and healthy with a baby',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'who-lancet-perinatal-2023',
    label: 'Maternal health in the perinatal period and beyond',
    organisation: 'WHO / Lancet Global Health Series, December 2023',
    tier: 'research',
  },

  // ── Feeding ────────────────────────────────────────────────────────
  {
    id: 'ohid-infant-feeding-2024',
    label: 'Infant Feeding Survey 2024',
    organisation: 'DHSC / OHID',
    tier: 'gov',
  },
  {
    id: 'who-infant-feeding',
    label: 'Infant and young child feeding',
    organisation: 'WHO, August 2026',
    tier: 'research',
    caveat:
      'WHO’s framing is more strongly pro-breastfeeding than the tone used here, appropriately for its global public-health remit. Population-level associations are reported here as associations, not as guarantees for any individual baby.',
  },
  {
    id: 'nhs-breastfeeding',
    label: 'Breastfeeding help and support (expressing, storage, problems, medication, work)',
    organisation: 'NHS breastfeeding series',
    tier: 'nhs',
  },
  {
    id: 'nhs-bottle-feeding',
    label: 'Bottle feeding advice',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-sterilising',
    label: 'Sterilising baby bottles',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-making-formula',
    label: 'How to make up baby formula',
    organisation: 'NHS',
    tier: 'nhs',
  },
  { id: 'nhs-formula-types', label: 'Types of formula', organisation: 'NHS', tier: 'nhs' },
  {
    id: 'nhs-combine-feeding',
    label: 'How to combine breast and bottle feeding',
    organisation: 'NHS',
    tier: 'nhs',
  },

  // ── Existing health conditions ─────────────────────────────────────
  {
    id: 'nhs-asthma-pregnancy',
    label: 'Asthma and pregnancy',
    organisation: 'NHS (reviewed May 2024)',
    tier: 'nhs',
  },
  {
    id: 'nhs-chd-pregnancy',
    label: 'Congenital heart disease and pregnancy',
    organisation: 'NHS (reviewed April 2024)',
    tier: 'nhs',
  },
  {
    id: 'nhs-coronary-pregnancy',
    label: 'Coronary heart disease and pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-diabetes-pregnancy',
    label: 'Diabetes and pregnancy',
    organisation: 'NHS (reviewed May 2024)',
    tier: 'nhs',
  },
  {
    id: 'nhs-epilepsy-pregnancy',
    label: 'Epilepsy and pregnancy',
    organisation: 'NHS (reviewed February 2026)',
    tier: 'nhs',
  },
  {
    id: 'nhs-bp-pregnancy',
    label: 'High blood pressure (hypertension) and pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nice-ng121',
    label: 'NG121, Intrapartum care for women with existing medical conditions',
    organisation: 'NICE',
    tier: 'gov',
    caveat:
      'Used only to confirm that multidisciplinary care planning is standard NHS practice — not cited for clinical detail.',
  },

  // ── Vaccinations ───────────────────────────────────────────────────
  {
    id: 'nhs-vaccinations-pregnancy',
    label: 'Vaccinations in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  { id: 'nhs-flu-jab', label: 'The flu jab in pregnancy', organisation: 'NHS', tier: 'nhs' },
  {
    id: 'nhs-whooping-cough',
    label: 'Whooping cough vaccination in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },

  // ── Everyday life and safety ───────────────────────────────────────
  {
    id: 'nhs-free-dental',
    label: 'Who can get free NHS dental treatment or help with dental costs',
    organisation: 'NHS (reviewed February 2025)',
    tier: 'nhs',
  },
  {
    id: 'bupa-dental',
    label: 'Pregnancy dental care',
    organisation: 'Bupa',
    tier: 'charity',
    caveat:
      'A commercial dental provider. Used only for the plain-language explanation of why gum problems increase in pregnancy; all entitlement and treatment guidance comes from the NHS source alongside it.',
  },
  {
    id: 'nhs-wales-sex',
    label: 'Sex in pregnancy',
    organisation: 'NHS Wales',
    tier: 'nhs',
  },
  {
    id: 'tommys-chemicals',
    label: 'Chemicals and air pollution in pregnancy',
    organisation: "Tommy's (reviewed August 2024)",
    tier: 'charity',
  },
  {
    id: 'nct-beauty-treatments',
    label: 'Which beauty and wellbeing treatments are safe during pregnancy and breastfeeding?',
    organisation: 'NCT (reviewed November 2024)',
    tier: 'charity',
  },
  {
    id: 'putra-2022-topical',
    label: 'Skin Changes and Safety Profile of Topical Products in Pregnancy',
    organisation: 'Putra IB, Jusuf NK, Dewi NK (2022)',
    tier: 'research',
    caveat:
      'Written for clinicians and structured around the retired US FDA pregnancy categories. Used as underlying evidence for ingredient safety, not quoted directly.',
  },
  {
    id: 'bozzo-2011-cosmetics',
    label: 'Safety of skin care products during pregnancy',
    organisation: 'Bozzo P, Chua-Gocheco A, Einarson A. Canadian Family Physician 2011 (Motherisk)',
    tier: 'research',
    caveat:
      'Older (2011), but the underlying absorption findings are unchanged and still cited by newer reviews. Used as corroboration.',
  },

  // ── Pregnancy and baby loss ────────────────────────────────────────
  {
    id: 'miscarriage-uk',
    label: 'Types of pregnancy loss · Signs, symptoms, diagnosis',
    organisation: 'Miscarriage UK',
    tier: 'charity',
  },
  {
    id: 'miscarriage-association',
    label: 'Support and information after miscarriage',
    organisation: 'Miscarriage Association',
    tier: 'charity',
  },
  {
    id: 'cruse-baby-loss',
    label: 'Baby Loss',
    organisation: 'Cruse Bereavement Support',
    tier: 'charity',
  },

  // ── Additional NHS symptom pages ───────────────────────────────────
  {
    id: 'nhs-back-pain',
    label: 'Back pain in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-pelvic-pain',
    label: 'Pelvic pain in pregnancy',
    organisation: 'NHS, citing RCOG',
    tier: 'nhs',
  },
  {
    id: 'nhs-heartburn',
    label: 'Indigestion and heartburn in pregnancy',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'nhs-discharge-thrush',
    label: 'Vaginal discharge in pregnancy · Thrush',
    organisation: 'NHS',
    tier: 'nhs',
  },
  {
    id: 'kesikburun-2018',
    label: 'Musculoskeletal pain and symptoms in pregnancy',
    organisation: 'Kesikburun S, et al. 2018 (PMC6262502)',
    tier: 'research',
    caveat:
      'Small, non-UK study. Used only as background context for why aches increase later in pregnancy — not for specific advice.',
  },
];
