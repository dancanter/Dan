import type { ReactNode } from 'react';

interface NoteProps {
  tone?: 'plain' | 'calm' | 'warn';
  title?: string;
  children: ReactNode;
  /** Warn notes that describe urgent action get an assertive live region. */
  urgent?: boolean;
}

const TONE = {
  plain: 'bg-sand border-l-clay',
  calm: 'bg-mossp border-l-moss',
  warn: 'bg-alertp border-l-alert',
} as const;

const TITLE_TONE = {
  // Ink rather than clay: the plain note sits on sand, where clay measured
  // 2.98:1. The tone still reads from the clay left border.
  plain: 'text-ink',
  calm: 'text-mossd',
  warn: 'text-alert',
} as const;

export function Note({ tone = 'plain', title, children, urgent }: NoteProps) {
  return (
    <div
      role={urgent ? 'note' : undefined}
      className={`my-4 rounded-r-lg border-l-[3px] px-4 py-3 text-[0.90625rem] leading-relaxed ${TONE[tone]}`}
    >
      {title && <strong className={`block ${TITLE_TONE[tone]}`}>{title}</strong>}
      <div className="prose-note mt-0.5">{children}</div>
    </div>
  );
}
