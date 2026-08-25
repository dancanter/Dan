import type { Myth } from './schema';

export const myths: Myth[] = [
  {
    id: 'eat-for-two',
    claim: 'You need to eat for two',
    verdict: 'myth',
    explanation:
      "Not until the third trimester, and even then it's only about 200 extra calories a day — roughly two slices of bread.",
    sourceIds: ['sacn-2026'],
  },
  {
    id: 'weight-target',
    claim: 'You should gain a specific amount of weight',
    verdict: 'myth',
    explanation:
      'UK guidance sets no target on purpose. The evidence does not support one number that works for everyone.',
    sourceIds: ['sacn-2026'],
  },
  {
    id: 'peanuts',
    claim: 'Peanuts in pregnancy cause allergies',
    verdict: 'myth',
    explanation:
      "Eating peanuts doesn't affect your baby's chance of developing a peanut allergy. Only avoid them if you're allergic yourself.",
    sourceIds: ['nhs-foods-to-avoid'],
  },
  {
    id: 'folic-acid',
    claim: 'Folic acid genuinely prevents birth defects',
    verdict: 'true',
    explanation:
      'One of the most robustly evidenced interventions in all of pregnancy care. 400mcg daily significantly reduces the risk of neural tube defects.',
    sourceIds: ['nhs-vitamins', 'rcog-healthy-eating'],
  },
  {
    id: 'most-stressed',
    claim: 'Most pregnant women are highly stressed',
    verdict: 'myth',
    explanation:
      'In a study of over 1,500 pregnant women, only 6% were classified as highly stressed. 78% reported low-to-moderate stress.',
    sourceIds: ['alves-2021'],
  },
  {
    id: 'body-image',
    claim: 'Pregnancy always makes you feel worse about your body',
    verdict: 'myth',
    explanation:
      'Research found women felt better about their bodies while pregnant than before. Attention shifts from how your body looks to what it is doing.',
    sourceIds: ['linde-body-image'],
  },
  {
    id: 'all-cheese',
    claim: 'You should avoid all cheese',
    verdict: 'myth',
    explanation:
      'Only ripened soft cheeses with a white rind and blue-veined ones — and even those are fine cooked until steaming. Cheddar, feta, mozzarella, cream cheese and paneer are all fine.',
    sourceIds: ['nhs-foods-to-avoid'],
  },
  {
    id: 'liver-iron',
    claim: 'Liver is a good iron source in pregnancy',
    verdict: 'myth',
    explanation:
      "Liver is iron-rich but should be avoided — it's very high in vitamin A, which can harm your baby's development.",
    sourceIds: ['nhs-vitamins', 'rcog-healthy-eating'],
  },
  {
    id: 'everyone-iron',
    claim: 'Everyone should take an iron supplement',
    verdict: 'myth',
    explanation:
      "Not automatic. Levels are checked at booking and around 28 weeks; you'll only be advised to supplement if you're anaemic or at risk.",
    sourceIds: ['rcog-healthy-eating'],
  },
  {
    id: 'relaxation-works',
    claim: 'Relaxation techniques actually do something',
    verdict: 'true',
    explanation:
      'A review of 32 trials, covering nearly 4,000 women, looked at breathing, music and mindfulness. All three cut stress, worry and low mood.',
    sourceIds: ['abera-2024'],
  },
  {
    id: 'movements-reduce',
    claim: 'Babies move less towards the end of pregnancy',
    verdict: 'myth',
    explanation:
      "Not true, and it's an important one. Movements should stay roughly the same right up to and during labour. Any reduction needs checking straight away.",
    sourceIds: ['nhs-baby-movements', 'tommys-movements'],
  },
  {
    id: 'paracetamol-autism',
    claim: 'Paracetamol in pregnancy causes autism',
    verdict: 'myth',
    explanation:
      'The MHRA, which regulates medicines in the UK, has confirmed that paracetamol is still safe in pregnancy. There is no evidence that it causes autism.',
    sourceIds: ['mhra-paracetamol', 'nhs-headaches'],
  },
  {
    id: 'morning-sickness',
    claim: 'Morning sickness only happens in the morning',
    verdict: 'myth',
    explanation:
      'It can strike at any time of day or night. Around 8 in 10 pregnant people experience some degree of it.',
    sourceIds: ['nhs-morning-sickness'],
  },
  {
    id: 'exercise-risky',
    claim: 'Exercise is risky for the baby',
    verdict: 'myth',
    explanation:
      'The opposite is true. Exercise is safe, and it is good for you. It is also the best lifestyle change for preventing gestational diabetes.',
    sourceIds: ['nhs-exercise', 'allotey-2026'],
  },
  {
    id: 'doppler',
    claim: 'A home doppler can reassure you your baby is fine',
    verdict: 'myth',
    explanation:
      "Hearing a heartbeat doesn't mean your baby is well, and using one can delay you getting checked. If movements change, call your maternity unit rather than reaching for a doppler.",
    sourceIds: ['tommys-movements', 'nhs-baby-movements'],
  },
  {
    id: 'kick-counting',
    claim: 'You should count kicks to a set number each day',
    verdict: 'myth',
    explanation:
      "There's no set number to aim for and no need to count. What matters is knowing what's normal for your baby, so you'd notice a change.",
    sourceIds: ['nhs-baby-movements', 'rcog-gtg57'],
  },
];

export const mythById = new Map(myths.map((m) => [m.id, m]));
