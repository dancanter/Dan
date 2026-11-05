// Health markers: VO2 max (from race times), blood pressure, blood tests,
// and a playful but transparent "Glow age".

/**
 * Jack Daniels' VDOT from a race: the VO2 the effort required, divided by
 * the share of VO2 max you can hold for that duration. For trained runners
 * VDOT tracks VO2 max closely (it folds in running economy).
 */
export function vdot(metres: number, seconds: number): number {
  const t = seconds / 60;
  const v = metres / t;
  const vo2 = -4.6 + 0.182258 * v + 0.000104 * v * v;
  const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t);
  return vo2 / pct;
}

export function parseTime(s: string): number | undefined {
  const parts = s.trim().split(/[:.]/).map(Number);
  if (!parts.length || parts.some((n) => Number.isNaN(n))) return undefined;
  return parts.reduce((a, n) => a * 60 + n, 0);
}

export const RACE_DISTANCES: { key: string; label: string; metres: number }[] = [
  { key: 'mile', label: 'Mile', metres: 1609.34 },
  { key: 'k5', label: '5K', metres: 5000 },
  { key: 'k10', label: '10K', metres: 10000 },
];

/** VO2 max estimate: the median VDOT of your race times (1 mile to 10K; shorter efforts are mostly anaerobic). */
export function vo2FromRaces(times: Record<string, string | undefined>): { vo2: number; from: { label: string; vdot: number }[] } | undefined {
  const from = RACE_DISTANCES.flatMap((r) => {
    const sec = times[r.key] ? parseTime(times[r.key]!) : undefined;
    return sec ? [{ label: `${r.label} ${times[r.key]}`, vdot: Math.round(vdot(r.metres, sec) * 10) / 10 }] : [];
  });
  if (!from.length) return undefined;
  const sorted = [...from].map((f) => f.vdot).sort((a, b) => a - b);
  const mid = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  return { vo2: Math.round(mid * 10) / 10, from };
}

/** Rough bands for men in their 20s (published norms differ between studies by a few points). */
export function vo2Band(vo2: number): { label: string; tone: 'good' | 'sea' | 'warn' | 'bad' } {
  if (vo2 >= 55) return { label: 'Superior: top few percent for your age', tone: 'good' };
  if (vo2 >= 49) return { label: 'Excellent', tone: 'good' };
  if (vo2 >= 43) return { label: 'Good', tone: 'sea' };
  if (vo2 >= 37) return { label: 'Average', tone: 'warn' };
  return { label: 'Below average', tone: 'bad' };
}

/**
 * Fitness age: the age at which an average man's VO2 max equals yours.
 * Uses a simple reference line (about 45 ml/kg/min at 25, falling about
 * 0.45 a year, roughly 10% a decade). Population studies differ, so read it
 * as a rough guide. Floored at 18.
 */
export function fitnessAge(vo2: number): number {
  return Math.max(18, Math.round(25 + (45 - vo2) / 0.45));
}

// ── Blood pressure (NHS thresholds) ──────────────────────────────────────
export interface BP { date: string; sys: number; dia: number }

export function bpCategory(sys: number, dia: number): { label: string; tone: 'good' | 'sea' | 'warn' | 'bad'; text: string } {
  if (sys >= 140 || dia >= 90) return { label: 'High', tone: 'bad', text: 'At or above 140/90 (135/85 at home). One reading isn’t a diagnosis: average a week of home readings, and if it stays here, see your GP.' };
  if (sys >= 120 || dia >= 80) return { label: 'Slightly raised', tone: 'warn', text: 'Between 120/80 and 140/90. Common, and very responsive to sleep, steady salt with plenty of potassium, and less alcohol and caffeine. Re-measure calmly (see the method below).' };
  if (sys < 90 || dia < 60) return { label: 'Low', tone: 'sea', text: 'Below 90/60. Usually normal and healthy in fit people. Only a concern with dizziness or fainting, especially on standing. Hydrate and salt your food normally.' };
  return { label: 'Ideal', tone: 'good', text: 'Between 90/60 and 120/80: the range linked with the lowest long-term risk to your heart, brain and kidneys.' };
}

// ── Blood tests ──────────────────────────────────────────────────────────
export interface LabMarker {
  key: string;
  label: string;
  unit: string;
  why: string;
  judge: (v: number) => { label: string; tone: 'good' | 'sea' | 'warn' | 'bad' };
}

const band = (label: string, tone: 'good' | 'sea' | 'warn' | 'bad') => ({ label, tone });

/** General UK guide ranges. Labs differ, so the range printed on your report always wins. */
export const LAB_MARKERS: LabMarker[] = [
  { key: 'ferritin', label: 'Ferritin', unit: 'µg/L', why: 'Iron stores. Runners and coeliacs run low; low ferritin means fatigue, slower runs and paler skin even before anaemia shows.', judge: (v) => (v < 30 ? band('Low stores', 'bad') : v < 50 ? band('OK, on the low side for a runner', 'warn') : v <= 300 ? band('Good', 'good') : band('High: ask your GP', 'warn')) },
  { key: 'vitd', label: 'Vitamin D (25-OH)', unit: 'nmol/L', why: 'Bone, muscle, immunity. UK winters drain it.', judge: (v) => (v < 25 ? band('Deficient', 'bad') : v < 50 ? band('Insufficient', 'warn') : v <= 150 ? band('Sufficient', 'good') : band('High: check supplements', 'warn')) },
  { key: 'b12', label: 'Vitamin B12', unit: 'ng/L', why: 'Red blood cells and nerves. Coeliac disease can reduce absorption.', judge: (v) => (v < 200 ? band('Low', 'bad') : v < 300 ? band('Borderline', 'warn') : band('Good', 'good')) },
  { key: 'folate', label: 'Folate (serum)', unit: 'µg/L', why: 'DNA synthesis and methylation. Also absorbed in the upper gut, which coeliac disease affects.', judge: (v) => (v < 3 ? band('Low', 'bad') : v < 5 ? band('Low-normal', 'warn') : band('Good', 'good')) },
  { key: 'hb', label: 'Haemoglobin', unit: 'g/L', why: 'Oxygen-carrying capacity, which drives your running.', judge: (v) => (v < 130 ? band('Low for a man', 'bad') : v <= 175 ? band('Normal', 'good') : band('High: ask your GP', 'warn')) },
  { key: 'ttg', label: 'Coeliac antibody (tTG-IgA)', unit: 'U/mL', why: 'Shows whether gluten is still getting in. Your lab gives the cut-off (often around 7–10 U/mL).', judge: (v) => (v < 7 ? band('Below typical cut-off: well controlled', 'good') : band('Raised: hidden gluten likely, check with your GP', 'warn')) },
  { key: 'hba1c', label: 'HbA1c', unit: 'mmol/mol', why: 'Average blood sugar over ~3 months, and a proxy for glycation.', judge: (v) => (v < 42 ? band('Normal', 'good') : v < 48 ? band('Prediabetes range', 'warn') : band('Diabetes range: see your GP', 'bad')) },
  { key: 'ldl', label: 'LDL cholesterol', unit: 'mmol/L', why: 'The cholesterol that drives artery plaque over decades.', judge: (v) => (v < 3 ? band('Good', 'good') : v < 4.1 ? band('Raised', 'warn') : band('High', 'bad')) },
  { key: 'hdl', label: 'HDL cholesterol', unit: 'mmol/L', why: 'The protective cholesterol. Endurance training raises it.', judge: (v) => (v >= 1.0 ? band('Good', 'good') : band('Low', 'warn')) },
  { key: 'tg', label: 'Triglycerides', unit: 'mmol/L', why: 'Blood fats. Sugar and alcohol push them up.', judge: (v) => (v < 1.7 ? band('Good', 'good') : v < 2.3 ? band('Raised', 'warn') : band('High', 'bad')) },
  { key: 'tsh', label: 'TSH (thyroid)', unit: 'mU/L', why: 'Thyroid signal. Under-eating can quietly lower thyroid output (look at free T3 too, if tested).', judge: (v) => (v < 0.4 ? band('Low: ask your GP', 'warn') : v <= 4.0 ? band('Normal', 'good') : band('High: ask your GP', 'warn')) },
  { key: 'testosterone', label: 'Total testosterone', unit: 'nmol/L', why: 'Low energy availability and short sleep both lower it. Test before 10am.', judge: (v) => (v < 8 ? band('Low', 'bad') : v < 12 ? band('Borderline: check fuelling and sleep', 'warn') : band('Normal', 'good')) },
  { key: 'crp', label: 'hs-CRP', unit: 'mg/L', why: 'Background inflammation. Test away from hard sessions or illness.', judge: (v) => (v < 1 ? band('Low inflammation', 'good') : v <= 3 ? band('Average', 'sea') : band('Raised (recent training or illness?)', 'warn')) },
];

// ── Glow age ─────────────────────────────────────────────────────────────
export interface AgeLine { label: string; years: number; why: string }

/**
 * A motivational "Glow age", NOT a validated biological-age test. It starts
 * from your real age and adds or removes years for each marker, in the
 * direction the evidence points. The amounts are deliberately simple and
 * capped, and every line is shown so you can see exactly how it's built.
 */
export function glowAge(age: number, m: { vo2?: number; rhr?: number; bp?: BP; sleepAvg?: number; nutritionAvg?: number; bmi?: number; alcoholDays?: number; dailySpf?: boolean }): { age: number; lines: AgeLine[] } {
  const lines: AgeLine[] = [];
  if (m.vo2 !== undefined) {
    const gap = Math.max(-6, Math.min(6, (fitnessAge(m.vo2) - age) / 3));
    lines.push({ label: `VO2 max ${m.vo2}`, years: Math.round(gap * 10) / 10, why: 'Cardiorespiratory fitness is one of the strongest single predictors of long-term survival.' });
  }
  if (m.rhr !== undefined) lines.push({ label: `Resting HR ${m.rhr}`, years: m.rhr <= 50 ? -1 : m.rhr <= 60 ? -0.5 : m.rhr >= 80 ? 1.5 : 0, why: 'A lower resting heart rate tracks fitness and lower cardiovascular risk.' });
  if (m.bp) {
    const c = bpCategory(m.bp.sys, m.bp.dia).label;
    lines.push({ label: `Blood pressure ${m.bp.sys}/${m.bp.dia}`, years: c === 'Ideal' || c === 'Low' ? -1 : c === 'Slightly raised' ? 1 : 3, why: 'Blood pressure ages arteries, brain and kidneys more than almost anything else.' });
  }
  if (m.sleepAvg !== undefined) lines.push({ label: `Sleep ${m.sleepAvg.toFixed(1)} h`, years: m.sleepAvg >= 7.5 ? -1 : m.sleepAvg < 6.5 ? 2 : 0.5, why: 'Short sleep is linked with faster ageing of the brain, metabolism and skin.' });
  if (m.nutritionAvg !== undefined) lines.push({ label: `Nutrition score ${Math.round(m.nutritionAvg)}`, years: m.nutritionAvg >= 75 ? -1.5 : m.nutritionAvg >= 60 ? -0.5 : m.nutritionAvg < 45 ? 1 : 0, why: 'Diet quality is linked with slower epigenetic ageing in cohort studies.' });
  if (m.bmi !== undefined) lines.push({ label: `BMI ${m.bmi.toFixed(1)}`, years: m.bmi < 18.5 ? 1 : m.bmi < 25 ? -0.5 : m.bmi < 30 ? 1 : 2.5, why: 'Both under- and over-weight carry costs. Under 18.5 means lower bone density and hormones.' });
  if (m.alcoholDays !== undefined) lines.push({ label: `Alcohol on ${m.alcoholDays} of the last 14 days`, years: m.alcoholDays === 0 ? -0.5 : m.alcoholDays <= 2 ? 0 : m.alcoholDays <= 5 ? 1 : 2, why: 'Alcohol disrupts sleep and repair, and damages DNA directly.' });
  if (m.dailySpf) lines.push({ label: 'SPF50 every day', years: -1, why: 'Daily broad-spectrum sunscreen stopped measurable skin ageing over 4.5 years in a randomised trial. It’s the single best-evidenced habit for how your face ages.' });
  const total = lines.reduce((a, l) => a + l.years, 0);
  return { age: Math.round((age + total) * 10) / 10, lines };
}

// ── How rare is your health? ─────────────────────────────────────────────
// Rough population percentiles for men in their 20s. These are deliberately
// approximate normal curves fitted to typical published norms; real data
// varies by country and study. They're for perspective, not diagnosis.

function normalCdf(z: number): number {
  // Abramowitz–Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export interface RankLine { label: string; topPct: number; note: string }

/** "Top X%" for one marker, given a typical mean and spread for men in their 20s. */
const topPct = (value: number, mean: number, sd: number, higherIsBetter: boolean) => {
  const z = (value - mean) / sd;
  const better = higherIsBetter ? 1 - normalCdf(z) : normalCdf(z);
  return Math.max(0.1, Math.round(better * 1000) / 10);
};

export function healthRank(m: { vo2?: number; rhr?: number; habits: { nonSmoker: boolean; activeEnough: boolean; dietGood: boolean; leanHealthy: boolean; sleepGood: boolean; lowAlcohol: boolean; dailySpf: boolean } }) {
  const lines: RankLine[] = [];
  if (m.vo2 !== undefined) lines.push({ label: `VO2 max ${m.vo2}`, topPct: topPct(m.vo2, 45, 7, true), note: 'Against men aged 20–29 (average about 45).' });
  if (m.rhr !== undefined) lines.push({ label: `Resting heart rate ${m.rhr}`, topPct: topPct(m.rhr, 68, 10, false), note: 'Against young men in general (average about 65–70 bpm).' });
  const h = m.habits;
  const core = [h.nonSmoker, h.activeEnough, h.dietGood, h.leanHealthy].filter(Boolean).length;
  if (core === 4) lines.push({ label: 'All 4 core healthy habits', topPct: 3, note: 'Not smoking, enough activity, a healthy diet and a healthy body-fat level: in a large US study only about 2.7% of adults met all four.' });
  const extras = [h.sleepGood, h.lowAlcohol, h.dailySpf].filter(Boolean).length;
  const rarest = lines.length ? Math.min(...lines.map((l) => l.topPct)) : undefined;
  return { lines, rarest, core, extras };
}

/** Rough counts for perspective: UK and worldwide men aged 20–29. */
export const POPULATION = { ukMen20s: 4_500_000, worldMen20s: 600_000_000 };
