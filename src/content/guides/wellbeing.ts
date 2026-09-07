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
    summary: 'A review of 32 trials found real reductions in stress, anxiety and low mood.',
    body: [
      'Researchers pooled 32 trials covering nearly 4,000 women. They looked at breathing, music, muscle relaxation, yoga and mindfulness.',
      'All of it cut stress, worry and low mood, measured on proper scales. Birth weight also went up slightly.',
      'You do not need an app or a class. Five minutes of slow breathing counts.',
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
  {
    id: 'baby-brain',
    section: 'wellbeing',
    title: 'Forgetting things, and losing your thread',
    summary: 'Measured, real, small — and it goes.',
    body: [
      'Losing words, walking into rooms, reading the same line four times. It is one of the most common things people say nobody warned them about, and it is usually met with a joke rather than an answer.',
      'It has actually been measured. Researchers pooled 20 studies covering more than 1,200 pregnant women and around 1,000 who were not. On tests of general thinking, memory and planning, the pregnant groups scored slightly lower — mostly in the third trimester, and the difference between the first and second trimesters showed up too.',
      '**Three things that measurement is not.** It is not large: the effects were small, and the researchers say they are not usually noticeable without a specific test. It is not permanent — it settles in the months after birth. And it is an average across a group, which says nothing about what you personally can do.',
      'There is also a gap worth knowing about: in one study, mothers rated their own memory as clearly worse while the tests showed no difference at all. Feeling foggy is real whether or not a test can find it, and it does not mean anything is wrong with you.',
      'Lists, alarms and writing things down are not a sign of losing your grip. They are what everyone does when they are carrying too much at once.',
    ],
    sourceIds: ['davies-2018'],
    emphasis: 'calm',
  },
  {
    id: 'waiting-for-the-scan',
    section: 'wellbeing',
    title: 'The wait before the first scan',
    summary: 'Weeks of not knowing, and nothing to do with them.',
    body: [
      'Most people find out they are pregnant around 4 to 6 weeks. The booking appointment is usually around week 8, and the dating scan around week 12. That is often the better part of two months between knowing and seeing anything.',
      'Nobody prepares you for that stretch. There is nothing to do in it, nothing to check, and no way to find out whether things are going well. That is exactly why it is hard, and why it is one of the most common things people say they wish they had been told.',
      'It is not a sign of anything that it feels long. It does not mean you are anxious, ungrateful, or bonding badly. It means you have been handed enormous news and asked to wait eight weeks with it.',
      'If the waiting is genuinely hard to carry, that is worth saying at your booking appointment rather than saving for later. It is a normal thing to raise, and the appointment is long enough to raise it in.',
    ],
    sourceIds: ['nhs-antenatal-care'],
  },
];

export const weightGuides: Guide[] = [
  {
    id: 'no-target-number',
    section: 'weight',
    title: 'There’s no single "correct" number',
    summary: 'UK guidance deliberately sets no fixed weight-gain target.',
    body: [
      'How much weight women gain varies hugely. UK guidance sets no target on purpose, because the evidence does not support one number that works for everyone.',
      'If you are worrying about a number, you can let that go.',
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
      'Cravings are very common, and nothing to feel guilty about.',
      'Researchers asked women how they actually deal with them. Fighting a craving caused more distress than giving in to it a bit. Guilt made things worse either way.',
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
  {
    id: 'other-peoples-comments',
    section: 'weight',
    title: 'When people comment on your body',
    summary: 'Strangers start doing it, and you are allowed to shut it down.',
    body: [
      'Something changes when you are visibly pregnant: people who would never remark on your body suddenly do. You are huge, you are tiny, are you sure it is not twins, you must be due any day. Some of it is meant warmly. It lands on you either way, several times a week, from people you cannot avoid.',
      'The comments about size are the ones that stick, and they contradict each other — the same bump gets called enormous and worryingly small in the same afternoon. Neither is an assessment of anything. Your midwife measures growth for a reason, and a colleague’s eye is not that.',
      'Touching without asking is the other one. You do not owe anyone access to your bump, and "I’d rather you didn’t" is a complete sentence. So is changing the subject.',
      'If this is wearing you down more than it seems like it should, that is worth mentioning rather than filing under things to put up with. In a survey of 501 pregnant and postpartum women, those who reported more experiences of weight stigma also reported more symptoms of low mood and stress. The two travel together, which is reason enough to say it out loud rather than absorb it.',
    ],
    sourceIds: ['incollingo-rodriguez-2019'],
  },
];
