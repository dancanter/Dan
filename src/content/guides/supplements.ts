import type { Guide } from '../schema';

export const supplementGuides: Guide[] = [
  {
    id: 'folic-acid',
    section: 'supplements',
    title: 'Folic acid — take this',
    summary: '400mcg daily up to 12 weeks. One of the best-evidenced things in pregnancy care.',
    body: [
      '**400 micrograms daily**, ideally from 3 months before conceiving through to 12 weeks. It significantly reduces the risk of neural tube defects like spina bifida. Didn’t start before? Begin as soon as you find out — it still helps.',
      'A **5mg** dose is GP-prescribed for higher-risk groups: personal or family history of neural tube defects, diabetes, or certain epilepsy or HIV medication. Ask your midwife or GP if any of that applies to you.',
    ],
    sourceIds: ['nhs-vitamins', 'rcog-healthy-eating'],
    emphasis: 'calm',
  },
  {
    id: 'vitamin-d',
    section: 'supplements',
    title: 'Vitamin D — take this',
    summary: '10mcg daily October to March, and year-round for some people.',
    body: [
      '**10 micrograms daily** between October and March. Year-round if you cover most of your skin outdoors, spend a lot of time indoors, or have black or brown skin — worth asking your midwife.',
    ],
    sourceIds: ['nhs-vitamins'],
    emphasis: 'calm',
  },
  {
    id: 'iron-supplement',
    section: 'supplements',
    title: 'Iron — only if you need it',
    summary: 'Not automatic. Checked at booking and around 28 weeks.',
    body: [
      'Not automatic. Levels are checked at booking and around 28 weeks; you’ll only be advised to supplement if you’re anaemic or at risk.',
    ],
    sourceIds: ['rcog-healthy-eating', 'nhs-vitamins'],
  },
  {
    id: 'sunlight',
    section: 'supplements',
    title: 'Sunlight and vitamin D',
    summary:
      'Interesting emerging research, but the settled advice is still to take the supplement.',
    body: [
      'UK research linking over 550,000 births with weather data found sunlight exposure associated with healthier birth weight and lower preterm birth rates. A small trial found UV exposure lowered blood pressure — of interest for pre-eclampsia.',
      'This research is still developing. The settled advice stands: take the supplement, since UK sunlight isn’t reliable. And avoid sunburn — this isn’t a reason to seek out extra sun.',
    ],
    sourceIds: ['clemens-2017', 'tommys-sunshine', 'nhs-vitamins'],
  },
  {
    id: 'vitamin-a',
    section: 'supplements',
    title: 'Vitamin A, liver and pâté',
    summary:
      'The one nutrient where more is worse. Liver is the exception to "nutrient-dense is good".',
    body: [
      'Avoid supplements containing vitamin A (retinol), and avoid **liver and liver products including pâté**, throughout pregnancy. Too much vitamin A can harm your baby’s development.',
      '**Why liver specifically, when it is otherwise one of the most nutritious foods there is.** That reputation is deserved — liver is exceptionally rich in iron, B12 and folate, and outside pregnancy it is a genuinely good food. The problem is dose. Vitamin A in pregnancy is not a "keep it moderate" nutrient: a single portion of lamb’s liver can contain **several times the daily upper limit**, so the amount arrives in one sitting rather than building up gradually. That is why UK guidance says avoid rather than limit — there is no useful portion size to recommend.',
      'The risk is highest in the **first trimester**, when the organs are forming.',
      'Always check multivitamin labels — a general multivitamin not designed for pregnancy may well contain retinol. Pregnancy-specific ones do not.',
      '**If you have already eaten some**, don’t panic. The risk relates to regular or large intakes, not one meal. Mention it to your midwife rather than worrying about it alone.',
      'Beta-carotene — the form in carrots, sweet potato and other vegetables — is **not** the same thing and is completely fine. Your body only converts what it needs.',
    ],
    sourceIds: ['nhs-vitamins', 'rcog-healthy-eating'],
    emphasis: 'warn',
  },
];
