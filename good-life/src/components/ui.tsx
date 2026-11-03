import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { SOURCE_BY_ID, sourceLink, EVIDENCE_LABEL } from '@/data/sources';
import { CONFIDENCE_LABEL, type Confidence } from '@/data/health';

export function cx(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(' ');
}

export function Card({ title, eyebrow, action, children, className, tone, id }: { title?: ReactNode; eyebrow?: ReactNode; action?: ReactNode; children?: ReactNode; className?: string; tone?: 'default' | 'navy' | 'quiet'; id?: string }) {
  return (
    <section
      id={id}
      className={cx(
        'rounded-2xl border p-5 sm:p-6',
        tone === 'navy' ? 'border-transparent bg-hero text-hero-ink' : tone === 'quiet' ? 'border-line bg-surface-2/60' : 'border-line bg-surface shadow-card',
        className,
      )}
    >
      {(title || eyebrow || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <div className={cx('mb-1 text-[11px] font-medium uppercase tracking-[0.14em]', tone === 'navy' ? 'opacity-70' : 'text-muted')}>{eyebrow}</div>}
            {title && <h2 className="font-serif text-2xl leading-tight">{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{eyebrow}</div>}
        <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'bronze'; size?: 'sm' | 'md' };
export function Button({ variant = 'secondary', size = 'md', className, ...p }: BtnProps) {
  return (
    <button
      type="button"
      {...p}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-sm',
        variant === 'primary' && 'bg-navy text-navy-ink hover:opacity-90',
        variant === 'bronze' && 'bg-bronze text-white hover:opacity-90 dark:text-[#121110]',
        variant === 'secondary' && 'border border-line-strong bg-surface hover:bg-surface-2',
        variant === 'ghost' && 'text-ink-2 hover:bg-surface-2',
        variant === 'danger' && 'border border-bad/40 text-bad hover:bg-bad-soft',
        className,
      )}
    />
  );
}

export function Chip({ active, children, onClick, title, className }: { active?: boolean; children: ReactNode; onClick?: () => void; title?: string; className?: string }) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
        active ? 'border-navy bg-navy text-navy-ink' : 'border-line-strong bg-surface text-ink-2 hover:bg-surface-2',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label, size = 'md' }: { options: { value: T; label: ReactNode }[]; value: T | undefined; onChange: (v: T) => void; label?: string; size?: 'sm' | 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx('rounded-full px-3 transition-colors', size === 'sm' ? 'h-7 text-xs' : 'h-8 text-sm', value === o.value ? 'bg-surface font-medium shadow-card' : 'text-ink-2 hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A 1–5 tap scale with word anchors — quicker than a slider on a phone. */
export function Scale({ value, onChange, labels, label, invert }: { value?: number; onChange: (v: number) => void; labels: [string, string]; label: string; invert?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted">
          {labels[0]} → {labels[1]}
        </span>
      </div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const good = invert ? n <= 2 : n >= 4;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${label} ${n}`}
              onClick={() => onChange(n)}
              className={cx(
                'h-9 rounded-lg border text-sm tabular transition-colors',
                value === n ? (good ? 'border-good bg-good-soft font-semibold text-good' : 'border-navy bg-navy text-navy-ink') : 'border-line bg-surface hover:bg-surface-2',
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  // The wrapping <label> associates the text with the control inside it.
  return (
    <label className={cx('block', className)}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Input(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cx('field', p.className)} />;
}
export function Select(p: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cx('field pr-8', p.className)} />;
}
export function TextArea(p: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cx('field', p.className)} />;
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="scrollbar-none -mx-1 mb-5 flex gap-1 overflow-x-auto px-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cx('h-9 shrink-0 rounded-full px-4 text-sm transition-colors', value === t.value ? 'bg-navy text-navy-ink' : 'text-ink-2 hover:bg-surface-2')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub, tone, small }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: 'good' | 'warn' | 'bad'; small?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted">{label}</div>
      <div className={cx('tabular font-semibold leading-tight', small ? 'text-lg' : 'text-2xl', tone === 'good' && 'text-good', tone === 'warn' && 'text-warn', tone === 'bad' && 'text-bad')}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Badge({ children, tone = 'neutral', title }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'navy' | 'bronze'; title?: string }) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone === 'neutral' && 'bg-surface-2 text-ink-2',
        tone === 'good' && 'bg-good-soft text-good',
        tone === 'warn' && 'bg-warn-soft text-warn',
        tone === 'bad' && 'bg-bad-soft text-bad',
        tone === 'navy' && 'bg-navy text-navy-ink',
        tone === 'bronze' && 'bg-bronze-soft text-bronze',
      )}
    >
      {children}
    </span>
  );
}

/** Where a number came from. */
export function Provenance({ kind }: { kind: 'measured' | 'reported' | 'estimated' | 'evidence' }) {
  const map = { measured: ['Measured', 'navy'], reported: ['Self-reported', 'neutral'], estimated: ['Estimate', 'bronze'], evidence: ['Evidence', 'good'] } as const;
  const [label, tone] = map[kind];
  return <Badge tone={tone}>{label}</Badge>;
}

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const tone = level === 'established' ? 'good' : level === 'observational' ? 'navy' : level === 'mechanistic' ? 'bronze' : 'warn';
  return <Badge tone={tone}>{CONFIDENCE_LABEL[level]}</Badge>;
}

export function SourceRefs({ ids, className }: { ids?: string[]; className?: string }) {
  if (!ids?.length) return null;
  return (
    <ul className={cx('mt-2 space-y-1 text-xs text-muted', className)}>
      {ids.map((id) => {
        const s = SOURCE_BY_ID[id];
        if (!s) return null;
        const href = sourceLink(s);
        return (
          <li key={id}>
            <a href={href} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
              {s.authors.split(',')[0]}
              {s.authors.includes(',') ? ' et al.' : ''} ({s.year})
            </a>{' '}
            — {s.title}
            {s.journal ? `. ${s.journal}` : ''}. <span className="whitespace-nowrap">[{EVIDENCE_LABEL[s.type]}]</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Empty({ title, body, action }: { title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong p-6 text-center">
      <div className="font-medium">{title}</div>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Meter({ value, max, lo, hi, tone }: { value: number; max: number; lo?: number; hi?: number; tone?: 'good' | 'warn' | 'bad' | 'navy' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const auto = lo != null && hi != null ? (value < lo ? 'warn' : value > hi ? 'warn' : 'good') : 'navy';
  const t = tone ?? auto;
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
      {lo != null && hi != null && (
        <div className="absolute inset-y-0 bg-good-soft" style={{ left: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%` }} />
      )}
      <div className={cx('relative h-full rounded-full', t === 'good' && 'bg-good', t === 'warn' && 'bg-warn', t === 'bad' && 'bg-bad', t === 'navy' && 'bg-navy')} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('input,select,textarea,button')?.focus(), 50);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={cx('relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-card sm:rounded-3xl sm:p-6', wide ? 'sm:max-w-3xl' : 'sm:max-w-xl')}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Disclosure({ summary, children, defaultOpen }: { summary: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-line bg-surface">
      <summary className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
        <span className="min-w-0">{summary}</span>
        <span className="text-muted transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-line px-4 py-3 text-sm text-ink-2">{children}</div>
    </details>
  );
}

export function Note({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warn' | 'bad' | 'good' }) {
  return (
    <div className={cx('rounded-xl px-4 py-3 text-sm', tone === 'neutral' && 'bg-surface-2 text-ink-2', tone === 'warn' && 'bg-warn-soft text-ink', tone === 'bad' && 'bg-bad-soft text-ink', tone === 'good' && 'bg-good-soft text-ink')}>
      {children}
    </div>
  );
}

/** Tiny markdown: **bold**, bullet lines, paragraphs. Enough for coach replies. */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>));
  return (
    <div className="prose-gl">
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        if (lines.every((l) => /^\s*[-•*]\s/.test(l) || !l.trim())) {
          return (
            <ul key={i}>
              {lines.filter((l) => l.trim()).map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•*]\s/, ''))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {inline(l)}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
