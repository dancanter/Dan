import { actions, getState, subscribe } from '@/store';
import { dayResult } from '@/engine/game';

// The bridge to The Good Life tracker, which runs Glow in a frame of the same
// page. Glow hands back each day's calories, protein and scores so the
// tracker's rings fill from what is logged here; the tracker hands over its
// morning weigh-ins so they are never typed twice.
const OUT = 'glow-bridge-v1';
const IN = 'tracker-bridge-v1';

function publish() {
  try {
    const s = getState();
    const days: Record<string, { kcal: number; protein: number; nutrition: number; glow: number; plants: number }> = {};
    for (const d of Object.keys(s.days).sort().slice(-21)) {
      if (!s.days[d]?.items?.length) continue;
      const r = dayResult(s, d);
      days[d] = {
        kcal: Math.round(r.analysis.totals.kcal),
        protein: Math.round(r.analysis.totals.protein),
        nutrition: Math.round(r.analysis.nutritionScore),
        glow: r.glow,
        plants: r.analysis.plants,
      };
    }
    // weigh-ins and sleep logged here go back too, so either place works
    const weights: Record<string, number> = {};
    for (const w of s.weights) weights[w.date] = Math.round(w.kg * 2.20462 * 10) / 10;
    const sleeps: Record<string, { bed: string; wake: string }> = {};
    for (const e of s.sleeps) sleeps[e.date] = { bed: e.bed, wake: e.wake };
    localStorage.setItem(OUT, JSON.stringify({ at: Date.now(), days, weights, sleeps }));
    (window.parent !== window ? window.parent : window).postMessage({ type: 'glow-bridge', days, weights, sleeps }, '*');
  } catch {
    /* storage blocked: the tracker just shows its own numbers */
  }
}

export function startBridge() {
  try {
    const raw = localStorage.getItem(IN);
    if (raw) {
      const b = JSON.parse(raw) as { weights?: Record<string, number>; sleeps?: Record<string, { bed: string; wake: string }> };
      const have = new Set(getState().weights.map((w) => w.date));
      for (const [d, lb] of Object.entries(b.weights ?? {})) {
        if (!have.has(d) && typeof lb === 'number' && lb > 60 && lb < 300) actions.logWeight(d, Math.round(lb * 0.45359237 * 100) / 100);
      }
      // bed and wake times logged in the tracker; quality defaults to 3 until rated here
      const slept = new Set(getState().sleeps.map((e) => e.date));
      for (const [d, x] of Object.entries(b.sleeps ?? {})) {
        if (!slept.has(d) && /^\d\d:\d\d$/.test(x?.bed ?? '') && /^\d\d:\d\d$/.test(x?.wake ?? '')) actions.logSleep({ date: d, bed: x.bed, wake: x.wake, quality: 3 });
      }
    }
  } catch {
    /* nothing to bring over */
  }
  publish();
  let t: ReturnType<typeof setTimeout> | undefined;
  subscribe(() => { clearTimeout(t); t = setTimeout(publish, 800); });
}
