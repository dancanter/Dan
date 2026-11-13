/** plan-def: the plan as Glow says it (Dan, 12 Nov: one source of truth).
 *  Inside The Good Life the tracker owns every target and hands it over through window.__PLAN__;
 *  on its own, Glow falls back to these. Never type a target into a sentence: use plan(). */
export interface PlanText {
  /** today's calories */ kcal: number;
  /** the base day */ kcalBase: number;
  /** grams a day */ protein: number;
  /** e.g. "11–13k" as the week average */ steps: string;
  /** e.g. "8,000" */ stepsFloor: string;
  /** e.g. "5–6" sessions a week */ gym: string;
  /** e.g. "123–124" lb */ goal: string;
}
const FALLBACK: PlanText = { kcal: 1799, kcalBase: 1799, protein: 140, steps: '11–13k', stepsFloor: '8,000', gym: '5–6', goal: '123–124' };
/** The tracker's plan, when Glow runs inside The Good Life; undefined on its own. */
export function hostPlan(): Partial<PlanText> | undefined {
  try {
    const f = (globalThis as unknown as { __PLAN__?: () => Partial<PlanText> }).__PLAN__;
    if (typeof f === 'function') return f();
  } catch { /* standalone */ }
  return undefined;
}
export function plan(): PlanText {
  return { ...FALLBACK, ...(hostPlan() ?? {}) };
}
