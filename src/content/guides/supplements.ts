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
    title: 'Avoid vitamin A (retinol)',
    summary: 'Avoid retinol supplements, liver and pâté. Always check multivitamin labels.',
    body: [
      'Avoid supplements containing vitamin A (retinol), plus liver and pâté. High vitamin A can harm your baby’s development.',
      'Always check multivitamin labels — a general multivitamin not designed for pregnancy may well contain it.',
    ],
    sourceIds: ['nhs-vitamins', 'rcog-healthy-eating'],
    emphasis: 'warn',
  },
];
