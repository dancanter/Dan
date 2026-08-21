import type { Guide } from '../schema';

export const exerciseGuides: Guide[] = [
  {
    id: 'exercise-safe',
    section: 'exercise',
    title: 'Exercise is safe — the guidelines all agree',
    summary: 'Around 150 minutes of moderate activity a week. Use the talk test.',
    body: [
      'Keep up your normal activity for as long as it feels comfortable — walking, swimming, yoga, dancing, or just going about your day. Guidelines from the UK, US, Canada, Australia and WHO converge on about 150 minutes of moderate activity a week.',
      'Exercise is not dangerous for your baby, and active women tend to have fewer problems in later pregnancy and labour.',
      '**The talk test:** you should be able to hold a conversation while exercising. Too breathless to talk means you’re working too hard.',
    ],
    sourceIds: ['nhs-exercise', 'opara-activity'],
    emphasis: 'calm',
  },
  {
    id: 'exercise-avoid',
    section: 'exercise',
    title: 'What to avoid',
    summary: 'Contact sports, scuba diving, altitude, and lying flat on your back after 16 weeks.',
    body: [
      'Don’t lie flat on your back for long periods, especially after 16 weeks. Avoid contact sports (kickboxing, judo, squash), scuba diving, and exercise above 2,500m altitude.',
      'Take care with anything carrying a fall risk — horse riding, skiing, gymnastics, cycling.',
    ],
    sourceIds: ['nhs-exercise'],
  },
  {
    id: 'pelvic-floor',
    section: 'exercise',
    title: 'Pelvic floor exercises',
    summary: '3 sets of 8 a day. One set at each meal is an easy way to remember.',
    body: [
      'Worth doing throughout pregnancy even if you’re not leaking yet — they reduce stress incontinence during and after pregnancy.',
      'Squeeze as if stopping yourself peeing, hold, release. Aim for 3 sets of 8 a day — one set at each meal is an easy way to remember.',
    ],
    sourceIds: ['nhs-exercise'],
  },
    {
    id: 'exercise-gd',
    section: 'exercise',
    title: 'Exercise and gestational diabetes',
    summary: 'The most effective lifestyle change for preventing it — more so than diet alone.',
    body: [
      'Being active is one of the best things you can do to lower your risk of gestational diabetes. On current evidence it works better than changing your diet alone.',
      'A 2026 review pooled over 100 trials and 36,000 women. Exercise came out top of every lifestyle approach they tested.',
      'What suits you will change as you go. Aerobic and strength work tend to fit earlier on. Swimming and gentler movement often feel better later.',
    ],
    sourceIds: ['allotey-2026'],
  },
];

export const sleepGuides: Guide[] = [
  {
    id: 'sleep-position',
    section: 'sleep',
    title: 'Sleep position — from 28 weeks',
    summary:
      'Go to sleep on your side, every sleep including naps. Either side is fine.',
    body: [
      'Go to sleep on your side rather than your back, for every sleep including naps. Going to sleep on your back has been linked to roughly double the risk of stillbirth and triple the risk of a smaller baby.',
      'It’s the position you *fall asleep in* that matters, since that’s what you hold longest — if you wake up on your back, just roll back onto your side.',
      'Either side is fine; there’s no meaningful difference between left and right. A pillow behind your back helps.',
    ],
    sourceIds: ['nice-ng201-sleep', 'tommys-sleep-on-side'],
    emphasis: 'warn',
  },
  {
    id: 'sleep-changes',
    section: 'sleep',
    title: 'How sleep changes across pregnancy',
    summary: 'Often improves early on, then gradually declines. A normal pattern.',
    body: [
      'Sleep often *improves* in early pregnancy — many people sleep more than usual around weeks 9–10.',
      'From there, quality gradually declines, with deep and dream (REM) sleep both reducing, especially in the third trimester. This is a normal pattern, not a sign anything’s wrong.',
    ],
    sourceIds: ['younglin-2025'],
  },
  {
    id: 'sleep-duration',
    section: 'sleep',
    title: 'Sleep duration and gestational diabetes',
    summary: '7–9 hours is a reasonable aim — but not worth stressing over.',
    body: [
      'Both very short sleep (under 7 hours) and very long sleep (9+ hours) have been linked to higher gestational diabetes risk across 41 studies.',
      'A fairly consistent 7–9 hours is a reasonable aim — though sleep is genuinely hard to control in pregnancy, and this isn’t worth stressing over.',
    ],
    sourceIds: ['wang-2022-sleep'],
  },
];
