import { describe, expect, it } from 'vitest';
import { FOODS, UK_FOODS } from '@/data/foods';
import { searchFoods } from '@/engine/parse';

// Dan, 4 Nov: raw milk, raw butter and unpasteurised cheese are in the library and search finds them first.
const ALL = [...FOODS, ...UK_FOODS];
describe('raw dairy', () => {
  it.each([
    ['raw milk', 'uk-milk-raw'], ['unpasteurised milk', 'uk-milk-raw'],
    ['raw butter', 'uk-butter-raw'], ['unpasteurised butter', 'uk-butter-raw'],
    ['unpasteurised cheese', 'uk-cheddar-raw'], ['raw cheddar', 'uk-cheddar-raw'], ['comte', 'uk-comte'],
  ])('"%s" finds %s near the top', (q, id) => {
    expect(searchFoods(q, ALL, 5).map((f) => f.id)).toContain(id);
  });
});
