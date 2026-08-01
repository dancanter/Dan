import type { ContentItem } from '../schema';

export const dontDietContent: ContentItem[] = [
  {
    id: 'dont-diet-eat-for-two',
    category: 'general-reassurance',
    trimester: [1, 2, 3],
    title: "You don't need to \"eat for two\"",
    tip: "You don't need to eat for two — a normal, varied diet is enough until the third trimester, when a small increase (about 200 extra calories a day) is recommended.",
    body: "Current UK guidance (NICE guideline NG247) states that intentional weight loss during pregnancy is not recommended, whatever your starting weight, because of potential effects on the baby. Pregnant women don't need to \"eat for two\" — only the last trimester calls for extra energy, and even then it's a modest ~200 kcal a day added to your normal pre-pregnancy needs, not a generic figure. There's also no need to count calories or hit a specific weight-gain number: there are currently no UK evidence-based guidelines on a recommended weight-gain range, because the evidence doesn't support one single target working for everyone. Your weight before pregnancy tends to matter more for outcomes than how much you gain during it. If you're finding yourself worrying about a number, that's genuinely not something you need to carry — and if you have concerns, they're best discussed with your midwife or GP.",
    sourceIds: ['sacn-2026-maternal-weight', 'nice-ng247'],
    tags: ['weight', 'diet', 'reassurance'],
  },
];
