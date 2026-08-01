import type { ContentItem } from '../schema';

export const dairyBirthOutcomesContent: ContentItem[] = [
  {
    id: 'dairy-birth-outcomes',
    category: 'dairy',
    trimester: [2, 3],
    title: 'Dairy and healthy birth weight',
    tip: "Dairy — milk, cheese, yoghurt — is linked to healthier birth weight and a lower chance of a baby being born small for their gestational age.",
    body: "A systematic review and meta-analysis pooling 14 studies and 111,184 pregnant women across multiple countries found higher dairy intake was associated with increased birth weight (+51.0g on average) and infant length (+0.33cm), and a lower risk of babies being born small for their gestational age (OR 0.69) or with low birth weight (OR 0.63). A separate, more recent dose-response analysis of 42 studies found a similar pattern, with the largest predicted birth-weight increase (~63g) around 5 servings a day. As with most things, more isn't automatically better: very high dairy intake was also linked to a slightly increased chance of a larger baby (OR 1.11 for large-for-gestational-age). So this is about including dairy as part of a varied diet, not maximising it.",
    sourceIds: ['iannotti-2024-terrestrial-asf', 'dairy-birth-outcomes-dose-response'],
    tags: ['dairy', 'birth weight', 'nutrition'],
  },
];
