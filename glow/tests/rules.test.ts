// Dan's hard rules (cut-block-71/PROFILE.md): Glow may log anything, but it
// never recommends what he avoids, never suggests sweetener, retinol, liver
// or olive oil, keeps Saturday free, and never names a day for a run.
import { ALL_FOODS, FOOD_BY_ID } from '@/data/foods';
import { isAvoided } from '@/data/avoid';
import { SWAPS, BLOAT_SWAPS, swapFor } from '@/data/swaps';
import { IDEAS } from '@/data/ideas';
import { bestFoodsFor } from '@/engine/review';
import { NUTRIENT_KEYS } from '@/data/nutrients';
import { dayPlan } from '@/engine/dayplan';
import { initial } from '@/store';
import * as science from '@/data/science';
import * as seasons from '@/data/seasons';

const AVOID_WORDS = /\b(broccoli|sprouts?|cabbage|kale|rocket|watercress|spinach|olive oil|evoo|green tea|matcha|brazil nuts?|lentils?|onions?|leeks?|garlic|liver)\b/i;
const BANNED = /2–3 drops|drops per bowl|drops of sweetener|stevia drops? a day|retinol \d|retinol nights|keep liver|olive oil as|garlic-infused|tinned lentils/i;

describe('Dan’s avoid list', () => {
  it('flags the excluded foods in the library', () => {
    for (const id of ['spinach', 'kale', 'broccoli', 'garlic', 'brazil-nuts', 'evoo']) {
      const f = FOOD_BY_ID.get(id);
      if (f) expect(f.excluded).toBe(true);
    }
    expect(ALL_FOODS.some((f) => f.excluded)).toBe(true);
    expect(FOOD_BY_ID.get('salmon-wild')?.excluded).toBeFalsy();
  });
  it('never offers an excluded food in bestFoodsFor', () => {
    for (const k of NUTRIENT_KEYS) for (const name of bestFoodsFor(k, 6)) expect(name).not.toMatch(AVOID_WORDS);
  });
  it('never swaps towards an excluded food', () => {
    for (const s of [...SWAPS, ...BLOAT_SWAPS]) {
      const from = FOOD_BY_ID.get(s.from);
      if (!from) continue;
      const r = swapFor(from, true) ?? swapFor(from, false);
      for (const t of r?.targets ?? []) expect(isAvoided(t)).toBe(false);
    }
  });
  it('has no idea that suggests an excluded food', () => {
    for (const i of IDEAS) expect(i.text).not.toMatch(AVOID_WORDS);
  });
});

describe('advice strings', () => {
  const texts = (o: unknown): string[] => (typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(texts) : o && typeof o === 'object' ? Object.values(o).flatMap(texts) : []);
  it('no sweetener, retinol, liver or olive-oil recommendations in the science, seasons or swaps', () => {
    const all = [...texts(science), ...texts(seasons), ...texts(SWAPS), ...texts(BLOAT_SWAPS)];
    for (const t of all) expect(t).not.toMatch(BANNED);
  });
});

describe('the day plan', () => {
  const s = { ...initial(), sleeps: [{ date: '2026-11-07', bed: '23:00', wake: '07:30', quality: 4 }] };
  it('keeps Saturday free: no run, no gym, no study', () => {
    const p = dayPlan(s, '2026-11-07'); // a Saturday
    expect(p.headline).toBe('Stress-free Saturday');
    for (const it of p.items) {
      expect(it.tag).not.toBe('study');
      expect(it.title).not.toMatch(/^Gym|Run slot|quality/i);
    }
  });
  it('never names a day for a run', () => {
    for (const d of ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05']) {
      for (const it of dayPlan(s, d).items) expect(`${it.title} ${it.detail}`).not.toMatch(/\brun today\b|today is a run day/i);
    }
  });
});
