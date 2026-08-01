import type { ContentItem } from '../schema';

export const dairyIodineContent: ContentItem[] = [
  {
    id: 'dairy-iodine',
    category: 'dairy',
    trimester: [1, 2, 3],
    title: 'Iodine, dairy, and your baby\'s brain development',
    tip: "Iodine is essential for your baby's brain development, and dairy is one of the main dietary sources of it in the UK — deficiency is more common here than people expect.",
    body: "A 2025 systematic review and meta-analysis of 51 studies found higher dairy intake was associated with significantly greater urinary iodine concentration and significantly lower odds of iodine deficiency (OR 0.581, with notably consistent results across studies). Dairy contributes an average of 27% of dietary iodine intake in the populations studied. Iodine is essential for maternal and fetal thyroid hormone production, which supports fetal brain development — especially in early pregnancy. The UK has been specifically named as a country where iodine deficiency has re-emerged, partly because there's no mandatory fortification programme here and dairy consumption has been declining. If you eat little dairy or follow a plant-based diet, it's worth asking your midwife or GP how to make sure you're getting enough.",
    sourceIds: ['razmpoosh-2025-dairy-iodine'],
    tags: ['dairy', 'iodine', 'nutrition', 'brain development'],
  },
];
