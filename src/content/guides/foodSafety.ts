import type { Guide } from '../schema';

export const foodSafetyGuides: Guide[] = [
  {
    id: 'raw-dairy',
    section: 'food-safety',
    title: 'Raw / unpasteurised dairy',
    summary: 'Avoid entirely — listeria risk. Pasteurised gives identical nutrition, no risk.',
    body: [
      'Avoid unpasteurised milk, cream, yoghurt, butter, ice cream and cheeses made from it. Listeria risk — it can cause miscarriage, stillbirth or serious newborn illness.',
      'Pasteurised gives identical nutrition, with no risk.',
    ],
    sourceIds: ['nhs-foods-to-avoid'],
    emphasis: 'warn',
  },
  {
    id: 'cheese',
    section: 'food-safety',
    title: 'Cheese — what’s actually fine',
    summary: 'Far more is fine than people think. Only white-rind and blue cheeses need cooking.',
    body: [
      '**Fine:** cheddar, parmesan, edam, cottage cheese, cream cheese, mozzarella, feta, paneer, ricotta, mascarpone, halloumi, burrata — as long as pasteurised.',
      '**Cook until steaming first:** brie, camembert, chèvre with a white rind, and blue-veined cheeses like gorgonzola, roquefort and Danish blue.',
    ],
    sourceIds: ['nhs-foods-to-avoid'],
  },
  {
    id: 'meat-eggs-fish',
    section: 'food-safety',
    title: 'Meat, eggs & fish',
    summary: 'Cook meat through, British Lion eggs are fine runny, limit tuna and oily fish.',
    body: [
      '**Meat:** cook thoroughly, no pink or blood. Cook cured meats (salami, chorizo, prosciutto) until steaming. Avoid liver and liver products (vitamin A) and game meat (lead).',
      '**Eggs:** British Lion-stamped or Laid in Britain eggs are fine raw or runny. Others cook firm. Duck, goose and quail eggs always well-cooked.',
      '**Fish:** cooked fish and shellfish are fine. Avoid raw fish, raw shellfish, shark, swordfish and marlin. Limit tuna to 4 cans or 2 steaks a week, and oily fish to 2 portions a week.',
    ],
    sourceIds: ['nhs-foods-to-avoid'],
  },
  {
    id: 'caffeine-and-rest',
    section: 'food-safety',
    title: 'Caffeine, herbal tea & the rest',
    summary: 'Treat 200mg as a ceiling, not a target. Peanuts are completely fine.',
    body: [
      '**Caffeine:** the NHS limit is 200mg a day. UK research since suggests aiming lower is worthwhile — Tommy’s tracked over 1,000 UK pregnancies and found stillbirth risk rose with caffeine intake, and varied by source: energy drinks carried the highest associated risk (1.85×), then instant coffee (1.34×) and cola (1.23×).',
      'The study couldn’t fully separate caffeine from the sugar in cola or the taurine in energy drinks — but the pattern tracked caffeine amount closely. Tommy’s own conclusion is the useful one: **the national guideline should be the limit, not the goal.** Cutting down further lowers risk further, even inside the "allowed" range. Decaf, fruit tea and water all count.',
      '**Hidden caffeine** is where people get caught out. Some paracetamol combination products contain it — check the label and avoid combined formulas where you can. A single coffee-shop drink can use up the whole day’s allowance, so it’s worth checking size and strength before ordering.',
      'If you’ve already had a lot of caffeine, including in a previous pregnancy — **please don’t turn this into blame.** Loss is very rarely caused by anything a parent did or didn’t do, and in many stillbirths no single cause is ever found.',
      '**Herbal tea:** under 4 cups a day, and avoid anything with liquorice root.',
      '**Fruit & veg:** wash thoroughly. Be careful with pre-packaged salads and sandwiches, and cook enoki mushrooms.',
      '**Peanuts:** completely fine, unless you’re allergic yourself. Eating them doesn’t affect your baby’s allergy risk.',
    ],
    table: {
      head: ['Drink', 'Caffeine'],
      rows: [
        ['Filter coffee (mug)', '~140mg'],
        ['Instant coffee (mug)', '~100mg'],
        ['Energy drink (250ml)', '~80mg'],
        ['Tea (mug)', '~75mg'],
        ['Cola (can)', '~40mg'],
        ['Dark chocolate (50g)', '~25mg'],
      ],
    },
    sourceIds: ['nhs-foods-to-avoid', 'tommys-caffeine'],
  },
];
