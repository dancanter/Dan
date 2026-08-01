import { describe, expect, it } from 'vitest';
import { validateContentIntegrity, allWeeks, allContentItems } from '../src/content';

describe('content integrity', () => {
  it('has no dangling references between weeks, content items, sources, and badges', () => {
    const issues = validateContentIntegrity();
    expect(issues).toEqual([]);
  });

  it('covers the full pregnancy week range with no gaps', () => {
    const weekNumbers = allWeeks.map((w) => w.week).sort((a, b) => a - b);
    for (let i = 1; i < weekNumbers.length; i++) {
      expect(weekNumbers[i]).toBe(weekNumbers[i - 1] + 1);
    }
  });

  it('gives every content item at least one source citation', () => {
    for (const item of allContentItems) {
      expect(item.sourceIds.length).toBeGreaterThan(0);
    }
  });
});
