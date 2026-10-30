export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;
export const M_PER_MILE = 1609.344;

export type WeightUnit = 'lb' | 'kg' | 'st';

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

export function formatWeight(kg: number | null | undefined, unit: WeightUnit, digits = 1): string {
  if (kg == null || !Number.isFinite(kg)) return '—';
  if (unit === 'kg') return `${kg.toFixed(digits)} kg`;
  const lb = kgToLb(kg);
  if (unit === 'lb') return `${lb.toFixed(digits)} lb`;
  const st = Math.floor(lb / 14);
  return `${st} st ${(lb - st * 14).toFixed(digits)} lb`;
}

/** Weight in the display unit as a plain number (stone shown as pounds for charts). */
export function weightValue(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg);
}

export function parseWeight(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : lbToKg(value);
}

export function heightFromFtIn(ft: number, inches: number): number {
  return (ft * 12 + inches) * CM_PER_IN;
}

export function formatHeight(cm: number | null): string {
  if (!cm) return '—';
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return `${ft} ft ${inch} in (${Math.round(cm)} cm)`;
}
