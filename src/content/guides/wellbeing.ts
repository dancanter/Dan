import type { Guide } from '../schema';

export const wellbeingGuides: Guide[] = [
  {
    id: 'stress-normal',
    section: 'wellbeing',
    title: 'Most pregnant women aren’t highly stressed',
    summary: 'Only 6% were classified as highly stressed in a study of 1,500+ women.',
    body: [
      'In a study of over 1,500 pregnant women, only 6% were classified as highly stressed. 78% reported low-to-moderate stress and 16% reported none at all.',
      'Some worry is completely normal — you’re not unusual.',
    ],
    sourceIds: ['alves-2021'],
    emphasis: 'calm',
  },
  {
    id: 'relaxation',
    section: 'wellbeing',
    title: 'Relaxation genuinely works',
    summary: 'A meta-analysis of 32 trials found real reductions in stress, anxiety and low mood.',
    body: [
      'A meta-analysis of 32 trials and nearly 4,000 women found relaxation techniques — breathing, music, progressive muscle relaxation, yoga, mindfulness — meaningfully reduced stress, anxiety and low mood on validated scales, with a modest associated increase in birth weight.',
      'You don’t need an app or a class. Five minutes of slow breathing counts.',
    ],
    sourceIds: ['abera-2024'],
  },
  {
    id: 'mindfulness',
    section: 'wellbeing',
    title: 'Mindfulness specifically',
    summary: 'Well-studied, low risk, benefits that may continue postpartum.',
    body: [
      'One of the most-studied relaxation techniques for pregnancy. Evidence supports it for anxiety, depression and stress, with benefits that may continue postpartum. Very low risk, so worth trying.',
    ],
    sourceIds: ['babbar-2021'],
  },
  {
    id: 'other-coping',
    section: 'wellbeing',
    title: 'Other things that help',
    summary: 'Talking, writing, music — all free, all evidence-reasonable.',
    body: [
      'Talking to someone you trust helps because it makes you notice and name what you’re feeling. Writing freely, with no worry about anyone reading it, works alone or alongside other support. Music and singing calm emotions and are a nice way to bond with your baby.',
      'Up to 1 in 4 people experience anxiety symptoms during pregnancy. You are very much not unusual.',
    ],
    sourceIds: ['nct-emotions'],
  },
  {
    id: 'asking-for-help',
    section: 'wellbeing',
    title: 'If it feels like more than you can manage',
    summary: 'Tell your midwife or GP. You won’t be judged.',
    body: [
      'Tell your midwife or GP. Many people worry about being judged, or fear that admitting to struggling could cause problems — in reality, professionals work hard to keep families together, and being honest is what gets you the right support.',
      '**More help:** Tommy’s (wellbeing plan) · PANDAS Foundation (perinatal mental illness) · Family Hubs via gov.uk',
    ],
    sourceIds: ['nhs-mental-health', 'nct-emotions'],
  },
];

export const weightGuides: Guide[] = [
  {
    id: 'no-target-number',
    section: 'weight',
    title: 'There’s no single "correct" number',
    summary: 'UK guidance deliberately sets no fixed weight-gain target.',
    body: [
      'Weight gain varies enormously, and current UK guidance deliberately sets no fixed target — because the evidence doesn’t support one number working for everyone.',
      'If you’re worrying about a number, you can genuinely let that go.',
    ],
    sourceIds: ['sacn-2026', 'nhs-weight-gain'],
    emphasis: 'calm',
  },
  {
    id: 'both-directions',
    section: 'weight',
    title: 'Both directions carry risk',
    summary: 'Gaining less than your body needs has its own risks — and it’s common.',
    body: [
      'It’s not just about avoiding gaining "too much". Gaining less than your body needs carries its own risks — and it’s common: in a six-country study including the UK, more than half of women didn’t gain enough by current standards, linked to double the risk of low birthweight.',
      'Not a reason to watch a number. A reason not to restrict.',
    ],
    sourceIds: ['teede-2025', 'jabin-2025'],
  },
  {
    id: 'underweight',
    section: 'weight',
    title: 'If you’re underweight',
    summary: 'Worth a conversation with your midwife, not something to self-manage.',
    body: [
      'Being underweight has its own considerations for how your baby grows, just as being overweight does — a cohort of 16,000 women found notably higher rates of small-for-gestational-age babies.',
      'Worth a conversation with your midwife, not something to self-manage.',
    ],
    sourceIds: ['chahal-2024'],
  },
  {
    id: 'cravings',
    section: 'weight',
    title: 'Cravings are normal',
    summary: 'Fighting them caused more distress than allowing them in moderation.',
    body: [
      'Extremely common and nothing to feel guilty about. Research on how women actually experience cravings found that fighting them caused more distress than allowing them in moderation — and guilt was an unhelpful companion either way.',
    ],
    sourceIds: ['blau-cravings'],
  },
  {
    id: 'body-image-improves',
    section: 'weight',
    title: 'Body image often improves in pregnancy',
    summary: 'Dissatisfaction was lower during pregnancy than before it.',
    body: [
      'This surprises people. A longitudinal study found body image dissatisfaction was actually *lower* during pregnancy than before it — attention shifts from how your body looks to what it’s doing.',
      'Concerns are more common in the months after birth, so that’s when to be gentle with yourself.',
    ],
    sourceIds: ['linde-body-image'],
  },
  {
    id: 'support-gap',
    section: 'weight',
    title: 'If nobody’s talked to you about this',
    summary: 'Most women report little or no discussion of weight with their doctor.',
    body: [
      'You’re not alone. A 2025 study found most women reported little or no discussion of weight or body image with their doctor — often weighed without comment, left to work it out alone.',
      'Midwives tend to be a supportive place to start that conversation.',
      'If you have a current or past experience of disordered eating, pregnancy can stir up a lot. Worth raising with your midwife early so support can be tailored to you.',
    ],
    sourceIds: ['carrard-2025'],
  },
];
