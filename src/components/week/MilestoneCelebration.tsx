import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

interface Props {
  title: string;
  message: string;
  reduceMotionOverride: boolean;
  onDismiss: () => void;
}

/**
 * Shown once when someone reaches a milestone week. Celebratory, never
 * blocking: it's dismissible, focus moves to it for screen readers, and
 * the confetti is skipped entirely under reduced-motion.
 */
export function MilestoneCelebration({ title, message, reduceMotionOverride, onDismiss }: Props) {
  const reduce = useReducedMotionSafe(reduceMotionOverride);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
        return;
      }
      // aria-modal hides the page behind this from a screen reader, but it
      // does nothing about Tab — without a trap, the next Tab lands on a link
      // underneath the overlay that cannot be seen or clicked.
      if (e.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = [
        ...root.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea'),
      ].filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      // Put focus back where it came from, rather than at the top of the page.
      opener?.focus?.();
    };
  }, [onDismiss]);

  const dots = Array.from({ length: 14 }, (_, i) => i);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-5"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebrate-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          initial={reduce ? false : { scale: 0.9, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-card p-6 text-center shadow-xl outline-none"
        >
          {!reduce && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {dots.map((i) => (
                <motion.span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    background:
                      i % 3 === 0
                        ? 'var(--color-clay)'
                        : i % 3 === 1
                          ? 'var(--color-moss)'
                          : 'var(--color-sand)',
                  }}
                  initial={{ top: '-10%', opacity: 1 }}
                  animate={{ top: '110%', opacity: 0 }}
                  transition={{ duration: 1.6 + (i % 5) * 0.25, delay: (i % 7) * 0.08 }}
                />
              ))}
            </div>
          )}

          <span className="text-4xl" aria-hidden="true">
            🌱
          </span>
          <h2 id="celebrate-title" className="mt-2 text-[1.375rem]">
            {title}
          </h2>
          <p className="mt-1 text-[0.9375rem] text-soft">{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="mt-5 min-h-11 w-full rounded-lg bg-moss px-4 font-semibold text-white hover:bg-mossd"
          >
            Lovely
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
