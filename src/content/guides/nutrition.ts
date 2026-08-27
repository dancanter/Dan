import type { Guide } from '../schema';

export const nutritionGuides: Guide[] = [
  {
    id: 'eat-for-two',
    section: 'nutrition',
    title: 'You don’t need to "eat for two"',
    summary:
      'A normal varied diet is enough until the third trimester, and even then it’s about 200 extra calories.',
    body: [
      'A normal, varied diet is enough until the third trimester, when about 200 extra calories a day is recommended — roughly two slices of bread.',
      'No calorie counting, no weight-gain target. Intentional weight loss isn’t recommended in pregnancy, whatever your starting weight.',
    ],
    sourceIds: ['sacn-2026', 'nice-ng247'],
    emphasis: 'calm',
  },
  {
    id: 'intake-gaps',
    section: 'nutrition',
    title: 'The gaps that actually matter',
    summary:
      'Fruit, veg and fibre are where UK diets genuinely fall short — protein already isn’t a gap.',
    body: [
      'Protein is in the table deliberately — to show it *isn’t* a gap. Most people already get 147% of the target, so there’s no need to chase more.',
      'Try adding one extra portion of veg today, and swapping a refined grain for a wholegrain where you can.',
    ],
    table: {
      head: ['Target', 'Aim', 'UK average', 'Hitting it'],
      rows: [
        ['Fruit & veg', '5/day', '3.8', '27%'],
        ['Fibre', '30g', '17.2g', '4%'],
        ['Free sugars', '≤5%', '11.7%', '13%'],
        ['Protein', '45g', '66g', 'already exceeded'],
      ],
    },
    sourceIds: ['sacn-2026'],
  },
  {
    id: 'oily-fish',
    section: 'nutrition',
    title: 'Oily fish & omega-3',
    summary: 'Two portions of fish a week, one oily — one of the widest gaps in the whole UK diet.',
    body: [
      'Two portions of fish a week (140g each), at least one oily — salmon, mackerel, sardines. This is one of the widest gaps in the whole UK diet: average intake is around 42g a week against a 140g target, and 77% of women ate no oily fish at all across a four-day survey.',
      'Oily fish is the main dietary source of long-chain omega-3 fats, important for your baby’s brain and eye development. The UK recommendation is 0.45g/day, which two portions is designed to deliver.',
      'There are safety limits on some fish — see Food safety for the specifics on tuna, shark, swordfish and marlin.',
    ],
    sourceIds: ['sacn-2026'],
  },
  {
    id: 'iron-anaemia',
    section: 'nutrition',
    title: 'Iron & anaemia',
    summary:
      'Iron needs rise substantially. Eating meat less than weekly more than doubles anaemia risk.',
    body: [
      'Iron needs rise substantially in pregnancy to support your increased blood volume and growing baby. Meat — especially red meat — provides a well-absorbed (heme) form, and women eating meat once a week or less have been found to have over double the risk of anaemia (OR 2.02).',
      'Other sources: pulses, fortified cereals, dark leafy greens. Pair with vitamin C to boost absorption.',
    ],
    sourceIds: ['iannotti-2024'],
  },
  {
    id: 'red-meat-quality',
    section: 'nutrition',
    title: 'Grass-fed red meat — worth it, if you can',
    summary:
      'A slightly better fat profile. Identical iron and B12 — which is the actual reason to eat it.',
    body: [
      'Grass-fed and grass-finished beef has a modestly better fatty acid profile than grain-finished: more omega-3, a lower omega-6 to omega-3 ratio, and more vitamin E and beta-carotene. That difference is real and consistently measured.',
      'It is also small in absolute terms. Beef is not a meaningful omega-3 source either way — **one portion of oily fish does more for your omega-3 intake than switching every steak you eat**. If you only change one thing, change that one.',
      '**The iron, protein, B12 and zinc are the same regardless of how the animal was fed** — and iron is the actual reason red meat matters in pregnancy. Nothing your baby needs is riding on this choice.',
      'A labelling point worth knowing: in the UK, "grass-fed" does not guarantee **grass-finished**. Many cattle are grass-raised and then grain-finished, and the label still applies. Pasture for Life certification is the one that guarantees a 100% grass diet.',
      'So: if it is affordable and available, it is a reasonable preference with no downside. If it is not — and it is consistently more expensive — you are not missing anything. Ordinary red meat, cooked through, does the job it needs to do here.',
    ],
    sourceIds: ['daley-2010-grassfed', 'iannotti-2024', 'sacn-2026', 'nhs-foods-to-avoid'],
  },
  {
    id: 'dairy-iodine',
    section: 'nutrition',
    title: 'Dairy — birth weight & iodine',
    summary:
      'Linked to healthier birth weight, and a main UK source of the iodine your baby needs for brain development.',
    body: [
      'A review of 14 studies and 111,184 pregnant women linked higher dairy intake to higher birth weight (+51g), longer infant length, and reduced risk of small-for-gestational-age (OR 0.69) and low birth weight (OR 0.63). A separate dose-response analysis of 42 studies found the same pattern.',
      'Dairy is also a main UK source of **iodine** — contributing around 27% of dietary intake — which your baby needs for brain development. Iodine shortfall has re-emerged in the UK, partly because there’s no mandatory fortification here. If you eat little dairy or follow a plant-based diet, worth asking your midwife about.',
      'More isn’t automatically better — very high intake was linked to a slightly increased chance of a larger baby (OR 1.11).',
    ],
    sourceIds: ['iannotti-2024', 'dairy-dose-response', 'razmpoosh-2025'],
  },
  {
    id: 'dairy-fat-level',
    section: 'nutrition',
    title: 'Full-fat or lower-fat dairy?',
    summary:
      'UK guidance says lower-fat. Newer evidence is less certain — and calcium and iodine are identical either way.',
    body: [
      'UK guidance — NHS and the British Heart Foundation — favours lower-fat dairy, to help control calories and saturated fat. That is the line your midwife will be working from.',
      'Whether it is the whole story is discussed in the research. The idea put forward is the **dairy matrix** — that dairy fat may behave differently inside cheese or yoghurt than the same saturated fat eaten on its own. It is an open question rather than a finding, it has not been tested in pregnancy, and dairy research is frequently industry-funded. It is not a reason to go against UK guidance.',
      'What is not in question: **calcium, iodine and protein are the same regardless of fat level.** Nothing your baby needs from dairy is lost by choosing one over the other — so within the guidance, this is a reasonable choice to make on your own preference and goals.',
    ],
    sourceIds: ['nhs-dairy', 'bhf-dairy', 'thorning-2017-matrix', 'razmpoosh-2025'],
  },
];
