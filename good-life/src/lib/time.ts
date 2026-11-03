// Parsing and formatting of race times and paces. Accepts the ways people
// actually type times: "57", "57.3", "2:23", "17:17", "1:02:30".

export function parseTime(input: string): number | null {
  const s = input.trim().replace(/[’']/g, ':').replace(/\s+/g, '');
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  const parts = s.split(':');
  if (parts.some((p) => !/^\d+(\.\d+)?$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  return null;
}

/** Splits like "3:24 3:25 3:23" or "68, 69, 70" into seconds. */
export function parseSplits(input: string): number[] {
  return input
    .split(/[\s,;/]+/)
    .map((t) => parseTime(t))
    .filter((n): n is number => n != null && n > 0);
}

export function formatDuration(sec: number | null | undefined, opts: { tenths?: boolean } = {}): string {
  if (sec == null || !Number.isFinite(sec)) return '—';
  const neg = sec < 0;
  let s = Math.abs(sec);
  if (opts.tenths && s < 600) {
    const m = Math.floor(s / 60);
    const rest = s - m * 60;
    const str = m > 0 ? `${m}:${rest.toFixed(1).padStart(4, '0')}` : rest.toFixed(1);
    return (neg ? '-' : '') + str;
  }
  s = Math.round(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const body = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
  return (neg ? '-' : '') + body;
}

export function formatPace(secPerKm: number | null | undefined, unit: 'km' | 'mi' = 'km'): string {
  if (secPerKm == null || !Number.isFinite(secPerKm)) return '—';
  const v = unit === 'mi' ? secPerKm * 1.609344 : secPerKm;
  return `${formatDuration(v)}/${unit}`;
}

export function paceFor(distanceM: number, sec: number): number {
  return sec / (distanceM / 1000);
}

/** Time for a rep of the given distance at the given pace. */
export function repTime(secPerKm: number, distanceM: number): number {
  return (secPerKm * distanceM) / 1000;
}
