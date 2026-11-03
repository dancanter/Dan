import type { Food } from '@/data/foods';

// Dan's avoid list: foods that upset his gut or that he has chosen not to
// eat. They stay in the database (so anything he does eat can still be
// logged) but are never suggested, and the Foods screen marks them.
export const AVOID_RE = /\b(broccoli|brussels?|sprouts?|cabbage|spring greens|savoy|pak choi|bok choy|kale|cavolo|rocket|arugula|watercress|spinach|olive oil|evoo|green tea|matcha|brazil|lentils?|onions?|shallots?|leeks?|garlic|liver|liver pât[eé])\b/i;
const AVOID_IDS = /^(evoo|olive-oil|brazil-nuts|spinach|kale|broccoli|garlic|beef-liver|chicken-liver|lamb-liver|cod-liver-oil|green-tea|lentils.*|onion.*|leek.*)$/;

export function isAvoided(f: Pick<Food, 'id' | 'name'> & { excluded?: boolean }): boolean {
  return !!f.excluded || AVOID_IDS.test(f.id) || AVOID_RE.test(f.name);
}
