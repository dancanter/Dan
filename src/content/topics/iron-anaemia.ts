import type { ContentItem } from '../schema';

export const ironAnaemiaContent: ContentItem[] = [
  {
    id: 'iron-anaemia-risk',
    category: 'iron',
    trimester: [1, 2, 3],
    title: 'Iron-rich foods and anaemia risk',
    tip: 'Meat — especially red meat — is a well-absorbed source of iron, and eating it less than once a week roughly doubles your risk of anaemia in pregnancy.',
    body: 'Meat, particularly red meat, is a highly bioavailable source of iron: it contains heme iron, which your body absorbs more efficiently than the non-heme iron found in plant foods. A systematic review with meta-analysis found that pregnant women who ate meat once a week or less had more than double the risk of anaemia compared with women who ate it more often (OR 2.02; 95% CI 1.55–2.50). Iron needs increase substantially in pregnancy to support your growing blood volume and your baby, and untreated iron deficiency anaemia is linked to complications for both of you. If meat isn\'t part of your diet, other good sources include pulses, fortified cereals, and dark leafy greens — pairing these with vitamin C (like citrus fruit or peppers) helps your body absorb the iron.',
    sourceIds: ['iannotti-2024-terrestrial-asf'],
    tags: ['iron', 'anaemia', 'nutrition'],
  },
];
