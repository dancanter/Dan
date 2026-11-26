import { StrictMode, type ReactNode } from 'react';
import { eatNext } from './engine/eatnext';
import { MicrosRoundup, microWeek } from './components/MicrosRoundup';
import { createRoot, type Root } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { startCloud } from './cloud';
import { hosted, type DaySum } from './host';
import { getState, refreshFromHost, resolveItems, setState, setSummariser } from './store';
import { dayResult } from './engine/game';
import { DayPlanCard } from './components/DayPlan';
import { HomeHealth } from './components/HomeHealth';
import { RecoveryClock } from './components/RecoveryClock';
import { KeepMuscleGuide } from './components/Muscle';
import { CalmHome } from './components/CalmHome';
import { HealthPanel, healthSnapshot } from './components/HealthPanel';
import { todayISO } from './engine/body';
import { IdeasCard, PhaseCompareCard, WeeklyReviewCard } from './components/Review';
import { BingeToday } from './components/Binge';
import { IllToday } from './components/Illness';

// Inside The Good Life, Glow mounts into shadow roots on the tracker's own
// page (frames are not allowed there), each with its stylesheet sealed
// inside so the two designs never touch. The tracker places Glow's pieces
// where they belong: the app in its Food/Cells/Body/Rituals tabs, and the day
// plan, ideas, binge and sick-day logs on Today, the weekly review on Review.
// On its own, Glow mounts into #root as usual.
function shadowDiv(host: HTMLElement): HTMLElement {
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
  // follow the tracker's theme (dark unless Dan picks light)
  const th = document.documentElement.dataset.theme;
  if (th) host.setAttribute('data-theme', th);
  shadow.innerHTML = '';
  const css = (window as unknown as { __GLOW_CSS__?: string }).__GLOW_CSS__;
  if (css) {
    const st = document.createElement('style');
    st.textContent = css;
    shadow.appendChild(st);
  }
  const div = document.createElement('div');
  div.className = 'glow-app glow-part';
  shadow.appendChild(div);
  return div;
}

const roots = new Map<HTMLElement, Root>();
function render(host: HTMLElement, node: ReactNode) {
  let root = roots.get(host);
  if (!root) { root = createRoot(shadowDiv(host)); roots.set(host, root); }
  root.render(<StrictMode>{node}</StrictMode>);
}

type View = 'dayplan' | 'ideas' | 'review' | 'binge' | 'ill' | 'home' | 'calm' | 'health' | 'recovery' | 'muscleguide' | 'micros';
function view(v: View, date: string, open?: boolean): ReactNode {
  if (v === 'home') return <HomeHealth date={date} />;
  if (v === 'calm') return <CalmHome date={date} />;
  if (v === 'health') return <HealthPanel />;
  if (v === 'recovery') return <RecoveryClock date={date} />;
  if (v === 'muscleguide') return <KeepMuscleGuide />;
  if (v === 'micros') return <MicrosRoundup date={date} />;
  if (v === 'dayplan') return <DayPlanCard date={date} />;
  if (v === 'ideas') return <IdeasCard date={date} />;
  if (v === 'review') return <div className="space-y-4"><WeeklyReviewCard end={date} /><PhaseCompareCard /></div>;
  if (v === 'binge') return <BingeToday key={String(open)} date={date} startOpen={open} />;
  return <IllToday key={String(open)} date={date} startOpen={open} />;
}

if (hosted()) {
  setSummariser((s) => {
    const out: Record<string, DaySum> = {};
    for (const d of Object.keys(s.days)) {
      if (!s.days[d]?.items?.length) continue;
      const r = dayResult(s, d);
      out[d] = { kcal: Math.round(r.analysis.totals.kcal), protein: Math.round(r.analysis.totals.protein), carbs: Math.round(r.analysis.totals.carbs), fat: Math.round(r.analysis.totals.fat), fibre: Math.round(r.analysis.totals.fibre), nutrition: Math.round(r.analysis.nutritionScore), glow: r.glow, plants: r.analysis.plants, omega3: Math.round(r.analysis.effective.omega3 * 100) / 100, coverage: Math.round(r.analysis.coverage * 100), n: (s.days[d]?.items ?? []).length, names: [...new Set(resolveItems(s.days[d], s).map((x) => x.food.name))] };
    }
    return out;
  });
  const api = {
    /** The tracker's store changed: show it. */
    refresh: () => refreshFromHost(),
    /** Health age, rank and blood pressure, for the tracker's goal tiles. */
    health: () => { const h = healthSnapshot(getState(), todayISO()); return { age: h.age, glowAge: Math.round(h.ga.age), top: h.rank.rarest, bp: h.lastBp, rhr: h.rhr, vo2: h.vo2 }; },
    /** The full app (Food, Foods, Cells, Body, Rituals). */
    mountApp: (host: HTMLElement) => render(host, <App />),
    /** One of Glow's pieces, placed by the tracker. */
    mount: (host: HTMLElement, v: View, date: string, open?: boolean) => render(host, view(v, date, open)),
    /** Recount every day's totals and write them back (after the tracker adds food). */
    recompute: () => { refreshFromHost(); setState((s) => ({ ...s })); },
    /** For the tracker's nutrition, skin and longevity coaches: meals today, this week's absorbed nutrients (lowest first), and the food options. */
    nutri: (date: string) => {
      const s = getState();
      const meals: Record<string, { kcal: number; protein: number; n: number }> = {};
      for (const it of resolveItems(s.days[date], s)) {
        const m = (it as { meal?: string }).meal ?? 'snacks';
        const x = (meals[m] ??= { kcal: 0, protein: 0, n: 0 });
        x.kcal += (it.food.n.kcal * it.grams) / 100; x.protein += ((it.food.n.protein ?? 0) * it.grams) / 100; x.n++;
      }
      const mw = microWeek(s, date);
      return { meals, week: mw.rows.map((r) => ({ k: r.k, label: r.label, week: r.week, today: r.today })), days: mw.days, cov: mw.cov, next: eatNext(s, date) };
    },
    /** For tests: Glow's own view of a day. */
    day: (date: string) => getState().days[date],
  };
  (window as unknown as { GLOW: typeof api }).GLOW = api;
  window.dispatchEvent(new Event('glow-ready'));
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  void startCloud();
}
