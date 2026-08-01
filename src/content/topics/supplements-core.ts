import type { ContentItem } from '../schema';

export const supplementsCoreContent: ContentItem[] = [
  {
    id: 'supplements-folic-acid',
    category: 'supplements',
    trimester: [1],
    title: 'Folic acid',
    tip: 'Take a 400 microgram folic acid supplement daily until 12 weeks — it significantly reduces the risk of neural tube defects.',
    body: "Take a 400 microgram folic acid supplement daily, ideally starting 3 months before trying to conceive and continuing until 12 weeks of pregnancy. It significantly reduces the risk of neural tube defects like spina bifida. If you didn't start before pregnancy, begin as soon as you find out. A higher 5mg dose is prescribed by a GP for specific higher-risk groups — including a personal or family history of neural tube defects, diabetes, or taking certain epilepsy or HIV medication. Ask your midwife or GP if any of this applies to you.",
    sourceIds: ['nhs-vitamins-supplements-pregnancy', 'rcog-healthy-eating-vitamins'],
    tags: ['folic acid', 'supplements'],
  },
  {
    id: 'supplements-vitamin-d',
    category: 'supplements',
    trimester: [1, 2, 3],
    title: 'Vitamin D',
    tip: 'Consider a 10 microgram vitamin D supplement daily, at least between October and March.',
    body: "Everyone in the UK is advised to consider a 10 microgram vitamin D supplement daily between October and March, since sunlight alone isn't reliable in those months. Some people should take it all year round — if you cover most of your skin outdoors, spend a lot of time indoors, or have black or brown skin, ask your midwife or GP whether year-round supplementation is right for you.",
    sourceIds: ['nhs-vitamins-supplements-pregnancy', 'rcog-healthy-eating-vitamins'],
    tags: ['vitamin d', 'supplements'],
  },
  {
    id: 'supplements-iron',
    category: 'iron',
    trimester: [1, 2, 3],
    title: 'Iron — checked, not automatic',
    tip: "You don't automatically need iron supplements — your levels are checked at booking and again around 28 weeks.",
    body: "You don't automatically need iron supplements — your iron levels are checked at your booking appointment and again around 28 weeks, and you'll only be advised to supplement if you're anaemic or at risk of becoming so.",
    sourceIds: ['nhs-vitamins-supplements-pregnancy', 'rcog-healthy-eating-vitamins'],
    tags: ['iron', 'supplements'],
  },
  {
    id: 'supplements-what-to-avoid',
    category: 'supplements',
    trimester: [1, 2, 3],
    title: 'What to avoid: vitamin A and liver',
    tip: 'Avoid supplements containing vitamin A (retinol), and avoid liver or liver products like pâté.',
    body: "Avoid supplements containing vitamin A (retinol), and avoid liver or liver products like pâté — high vitamin A can harm your baby's development.",
    sourceIds: ['nhs-vitamins-supplements-pregnancy', 'rcog-healthy-eating-vitamins'],
    tags: ['vitamin a', 'liver', 'supplements', 'foods to avoid'],
  },
];
