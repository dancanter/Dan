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
    localStorage.setItem(OUT, JSON.stringify({ at: Date.now(), days }));
    if (window.parent !== window) window.parent.postMessage({ type: 'glow-bridge', days }, '*');
  } catch {
    /* storage blocked: the tracker just shows its own numbers */
  }
}

export function startBridge() {
  try {
    const raw = localStorage.getItem(IN);
    if (raw) {
      const b = JSON.parse(raw) as { weights?: Record<string, number> };
      const have = new Set(getState().weights.map((w) => w.date));
      for (const [d, lb] of Object.entries(b.weights ?? {})) {
        if (!have.has(d) && typeof lb === 'number' && lb > 60 && lb < 300) actions.logWeight(d, Math.round(lb * 0.45359237 * 100) / 100);
      }
    }
  } catch {
    /* nothing to bring over */
  }
  publish();
  let t: ReturnType<typeof setTimeout> | undefined;
  subscribe(() => { clearTimeout(t); t = setTimeout(publish, 800); });
}
