import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { Evidence } from '@/data/science';

export function Card({ title, eyebrow, children, className = '', action }: { title?: ReactNode; eyebrow?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`card rise p-4 sm:p-5 ${className}`}>
      {(title || eyebrow) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow && <div className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">{eyebrow}</div>}
            {title && <h2 className="font-serif text-lg leading-tight">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function scoreColour(v: number): string {
  if (v >= 80) return 'var(--good)';
  if (v >= 60) return 'var(--sea)';
  if (v >= 40) return 'var(--gold)';
  return 'var(--bad)';
}

export function Ring({ value, size = 132, stroke = 11, label, sub }: { value: number; size?: number; stroke?: number; label?: string; sub?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${label ?? 'Score'} ${Math.round(v)} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreColour(v)} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="num font-serif leading-none" style={{ fontSize: size * 0.3 }}>{Math.round(v)}</div>
        {label && <div className="mt-1 text-[11px] tracking-wide text-muted uppercase">{label}</div>}
        {sub && <div className="text-[11px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

export function Bar({ value, max = 100, colour, height = 8, marker }: { value: number; max?: number; colour?: string; height?: number; marker?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-surface-2" style={{ height }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colour ?? scoreColour(pct), transition: 'width 0.6s ease' }} />
      {marker !== undefined && <div className="absolute top-0 h-full w-0.5 bg-ink/40" style={{ left: `${Math.min(100, (marker / max) * 100)}%` }} />}
    </div>
  );
}

export function Pill({ children, tone = 'neutral', title }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'gold' | 'sea'; title?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-surface-2 text-ink-2',
    good: 'bg-good-soft text-good',
    warn: 'bg-warn-soft text-warn',
    bad: 'bg-bad-soft text-bad',
    gold: 'bg-gold-soft text-gold',
    sea: 'bg-surface-2 text-sea',
  };
  return <span title={title} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function EvidencePill({ e }: { e: Evidence }) {
  const tone = e === 'strong' ? 'good' : e === 'moderate' ? 'sea' : e === 'emerging' ? 'gold' : 'warn';
  return <Pill tone={tone} title={`Evidence: ${e}`}>{e} evidence</Pill>;
}

export function Grade({ grade, score, big }: { grade: string; score: number; big?: boolean }) {
  return (
    <span className={`num inline-grid place-items-center rounded-xl font-serif font-semibold text-white ${big ? 'h-14 w-14 text-2xl' : 'h-8 w-8 text-sm'}`} style={{ background: scoreColour(score) }} title={`Optimisation score ${score}/100`}>
      {grade}
    </span>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="rise max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-surface p-5 pb-8 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-serif text-xl leading-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-surface-2"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Button({ children, onClick, tone = 'primary', className = '', type = 'button', disabled }: { children: ReactNode; onClick?: () => void; tone?: 'primary' | 'ghost' | 'gold' | 'danger'; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  const tones: Record<string, string> = {
    primary: 'bg-navy text-navy-ink hover:opacity-90',
    gold: 'bg-gold text-white hover:opacity-90',
    ghost: 'bg-surface-2 text-ink hover:bg-line',
    danger: 'bg-bad-soft text-bad hover:opacity-90',
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition disabled:opacity-40 ${tones[tone]} ${className}`}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl bg-surface-2 p-1" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)} className={`rounded-lg px-3 py-1.5 text-sm transition ${value === o.value ? 'bg-surface font-medium shadow-sm' : 'text-ink-2'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function LineChart({ points, height = 140, unit = '', target, colour = 'var(--sea)', secondary }: { points: { x: string; y: number }[]; height?: number; unit?: string; target?: number; colour?: string; secondary?: { x: string; y: number }[] }) {
  if (points.length < 2) return <p className="py-6 text-center text-sm text-muted">Log at least two entries to see the trend.</p>;
  const w = 320;
  const pad = { l: 34, r: 8, t: 10, b: 20 };
  const ys = points.map((p) => p.y).concat(secondary?.map((p) => p.y) ?? [], target !== undefined ? [target] : []);
  let lo = Math.min(...ys);
  let hi = Math.max(...ys);
  if (hi - lo < 1) { hi += 0.5; lo -= 0.5; }
  const span = hi - lo;
  lo -= span * 0.1;
  hi += span * 0.1;
  const X = (i: number) => pad.l + (i / (points.length - 1)) * (w - pad.l - pad.r);
  const Y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (height - pad.t - pad.b);
  const path = (ps: { y: number }[]) => ps.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const ticks = [lo + (hi - lo) * 0.15, (lo + hi) / 2, hi - (hi - lo) * 0.15];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img" aria-label="Trend chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} stroke="var(--line)" strokeDasharray="3 3" />
          <text x={pad.l - 4} y={Y(t) + 3} textAnchor="end" fontSize="9" fill="var(--muted)">{t.toFixed(1)}</text>
        </g>
      ))}
      {target !== undefined && <line x1={pad.l} x2={w - pad.r} y1={Y(target)} y2={Y(target)} stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="5 4" />}
      {secondary && <path d={path(secondary)} fill="none" stroke={colour} strokeWidth="2.5" strokeLinejoin="round" />}
      <path d={path(points)} fill="none" stroke={secondary ? 'var(--muted)' : colour} strokeWidth={secondary ? 1 : 2.5} strokeLinejoin="round" opacity={secondary ? 0.7 : 1} />
      {points.map((p, i) => <circle key={i} cx={X(i)} cy={Y(p.y)} r={secondary ? 2 : 3} fill={secondary ? 'var(--muted)' : colour}><title>{`${p.x}: ${p.y.toFixed(1)}${unit}`}</title></circle>)}
      <text x={pad.l} y={height - 4} fontSize="9" fill="var(--muted)">{points[0].x}</text>
      <text x={w - pad.r} y={height - 4} fontSize="9" fill="var(--muted)" textAnchor="end">{points[points.length - 1].x}</text>
    </svg>
  );
}
