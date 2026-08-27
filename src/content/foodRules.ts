/**
 * The food-safety guidance, as sortable items.
 *
 * Nothing here is a new claim. Every item is already stated in the food-safety
 * guides and cited to the same source — this file only restructures what the
 * prose already says into something you can sort.
 *
 * That restructuring is the risk, so it is checked rather than trusted:
 * `validateContent()` asserts every item's name actually appears in the guide
 * it points at. Reword the guidance and the game fails the build instead of
 * quietly teaching something the app no longer says. It is the same discipline
 * as the weekly reading rules carrying their guide's title.
 */

export type FoodVerdict = 'fine' | 'cook-first' | 'avoid' | 'limit';

export interface FoodRule {
  id: string;
  /** As someone would say it. Must appear in the guide it cites. */
  name: string;
  verdict: FoodVerdict;
  /** One line — the reason, not a lecture. */
  note: string;
  /** Where the guidance says this in full. */
  guideId: string;
  /**
   * Only where the guide phrases it differently — "British Lion eggs" appears
   * as "British Lion-stamped". The check looks for this instead of the name.
   */
  mentions?: string;
}

export const FOOD_VERDICT_LABEL: Record<FoodVerdict, string> = {
  fine: 'Fine as it is',
  'cook-first': 'Cook it first',
  limit: 'Limit it',
  avoid: 'Avoid',
};

export const foodRules: FoodRule[] = [
  // ── Cheese, where most of the confusion lives ──────────────────────
  {
    id: 'cheddar',
    name: 'Cheddar',
    verdict: 'fine',
    note: 'Hard cheeses are fine. So are most soft ones, as long as they’re pasteurised.',
    guideId: 'cheese',
  },
  {
    id: 'brie',
    name: 'Brie',
    verdict: 'cook-first',
    note: 'White-rind cheeses need cooking until steaming hot — then they’re fine.',
    guideId: 'cheese',
  },
  {
    id: 'feta',
    name: 'Feta',
    verdict: 'fine',
    note: 'Fine pasteurised, despite its reputation. So are mozzarella, halloumi and paneer.',
    guideId: 'cheese',
  },
  {
    id: 'blue-cheese',
    name: 'Gorgonzola',
    verdict: 'cook-first',
    note: 'Blue-veined cheeses go in the cook-until-steaming group, not the avoid group.',
    guideId: 'cheese',
  },
  {
    id: 'cream-cheese',
    name: 'Cream cheese',
    verdict: 'fine',
    note: 'Fine. Far more cheese is fine than people are led to believe.',
    guideId: 'cheese',
  },
  {
    id: 'unpasteurised-milk',
    name: 'Unpasteurised milk',
    verdict: 'avoid',
    note: 'Listeria risk. Pasteurised gives identical nutrition with no risk.',
    guideId: 'raw-dairy',
    mentions: 'unpasteurised milk',
  },

  // ── Meat, eggs, fish ───────────────────────────────────────────────
  {
    id: 'salami',
    name: 'Salami',
    verdict: 'cook-first',
    note: 'Cured meats need cooking until steaming — on a pizza is fine.',
    guideId: 'meat-eggs-fish',
  },
  {
    id: 'liver',
    name: 'Liver',
    verdict: 'avoid',
    note: 'Vitamin A. One portion can be several times the safe daily amount.',
    guideId: 'meat-eggs-fish',
  },
  {
    id: 'runny-egg',
    name: 'A runny British Lion egg',
    verdict: 'fine',
    note: 'British Lion-stamped eggs are fine raw or runny. Others cook firm.',
    guideId: 'meat-eggs-fish',
    mentions: 'British Lion',
  },
  {
    id: 'swordfish',
    name: 'Swordfish',
    verdict: 'avoid',
    note: 'Mercury. Shark and marlin are in the same group.',
    guideId: 'meat-eggs-fish',
  },
  {
    id: 'tuna',
    name: 'Tinned tuna',
    verdict: 'limit',
    note: 'Up to 4 cans or 2 steaks a week — a limit, not a ban.',
    guideId: 'meat-eggs-fish',
    // The guide says "limit tuna to 4 cans", not "tinned tuna". Caught by the
    // check on its first run, which is the entire reason the check exists.
    mentions: 'tuna',
  },
  {
    id: 'oily-fish',
    name: 'Salmon and mackerel',
    verdict: 'limit',
    note: 'Two portions a week. Most people in the UK have well under that.',
    guideId: 'meat-eggs-fish',
    mentions: 'oily fish',
  },
  {
    id: 'raw-fish',
    name: 'Sushi with raw fish',
    verdict: 'avoid',
    note: 'Raw fish and raw shellfish are out. Cooked fish and shellfish are fine.',
    guideId: 'meat-eggs-fish',
    mentions: 'raw fish',
  },
  {
    id: 'cooked-prawns',
    name: 'Cooked prawns',
    verdict: 'fine',
    note: 'Cooked shellfish is fine. It’s the raw version that isn’t.',
    guideId: 'meat-eggs-fish',
    mentions: 'shellfish',
  },

  // ── Everything else ────────────────────────────────────────────────
  {
    id: 'peanuts',
    name: 'Peanuts',
    verdict: 'fine',
    note: 'Completely fine unless you’re allergic. They don’t affect your baby’s allergy risk.',
    guideId: 'caffeine-and-rest',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    verdict: 'limit',
    note: '200mg a day is the ceiling — one mug of filter coffee is most of it.',
    guideId: 'caffeine-and-rest',
    mentions: 'coffee',
  },
  {
    id: 'liquorice-tea',
    name: 'Liquorice root tea',
    verdict: 'avoid',
    note: 'The one herbal tea to skip. Others are fine under four cups a day.',
    guideId: 'caffeine-and-rest',
    mentions: 'liquorice root',
  },
  {
    id: 'enoki',
    name: 'Enoki mushrooms',
    verdict: 'cook-first',
    note: 'Cook these rather than eating them raw in a salad.',
    guideId: 'caffeine-and-rest',
    mentions: 'enoki',
  },
];
