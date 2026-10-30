import { describe, expect, it } from 'vitest';
import { SOURCE_BY_ID, SOURCES } from '@/data/sources';
import { SUPPLEMENTS, TOPICS } from '@/data/health';
import { FOOD_BY_ID, FOODS } from '@/data/foods';
import { MEALS } from '@/data/meals';
import { EXERCISE_BY_ID, SPLITS } from '@/data/exercises';
import { FILM_BY_ID, FILMS } from '@/data/films';
import { CAPSULE, COLOUR_BY_ID } from '@/data/style';

// Content integrity: every cross-reference resolves, so a typo can never
// produce a silently missing citation, food or exercise.
describe('content integrity', () => {
  it('every cited source exists and has a link', () => {
    const cited = [...TOPICS.flatMap((t) => t.claims.flatMap((c) => c.sources ?? [])), ...SUPPLEMENTS.flatMap((s) => s.sources)];
    for (const id of cited) expect(SOURCE_BY_ID[id], id).toBeDefined();
    for (const s of SOURCES) expect(s.doi || s.url, s.id).toBeTruthy();
  });
  it('source ids are unique', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
  });
  it('meals use real foods', () => {
    for (const m of MEALS) for (const it of m.items) expect(FOOD_BY_ID[it.foodId], `${m.id}:${it.foodId}`).toBeDefined();
  });
  it('food values are internally plausible', () => {
    for (const f of FOODS) {
      const macroKcal = f.n.protein * 4 + f.n.carbs * 4 + f.n.fat * 9 + f.n.fibre * 2;
      if (f.n.kcal > 20) expect(Math.abs(macroKcal - f.n.kcal) / f.n.kcal, f.id).toBeLessThan(0.2);
      expect(f.n.leucine, f.id).toBeLessThanOrEqual(f.n.protein * 0.13);
      expect(f.n.satFat, f.id).toBeLessThanOrEqual(f.n.fat + 0.01);
    }
  });
  it('programme exercises exist', () => {
    for (const s of Object.values(SPLITS)) for (const it of s.items) expect(EXERCISE_BY_ID[it.exerciseId], it.exerciseId).toBeDefined();
  });
  it('similar films and capsule colours resolve', () => {
    for (const f of FILMS) for (const id of f.similar) expect(FILM_BY_ID[id], `${f.id}→${id}`).toBeDefined();
    for (const c of CAPSULE) expect(COLOUR_BY_ID[c.colour], c.id).toBeDefined();
  });
});
