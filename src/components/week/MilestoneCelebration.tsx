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
 * Shown once when someone reaches a milestone week.
 *
 * **Deliberately not a modal**, and that is a safety decision rather than a
 * stylistic one. It used to be: a full-screen backdrop at z-80 with
 * `aria-modal` and a focus trap. Walking the usability tasks in a browser
 * found that this made **Get Help unclickable** — Playwright reported the
 * overlay intercepting pointer events on the navigation — for someone opening
 * the app at a milestone week. The first task in the test plan is "you've
 * noticed something that worries you"; a celebration standing in front of the
 * urgent route is the exact opposite of the app's own rule that safety is
 * never gated.
 *
 * So the backdrop no longer takes pointer events, the card sits below the
 * header in the stacking order, and there is no focus trap — a trap is
 * correct for a modal and this must not be one. It keeps what a dialog should
 * have either way: a role, a label, focus moved to it on open and restored on
 * close, Escape to dismiss, and no confetti under reduced-motion.
 */
export function MilestoneCelebration({ title, message, reduceMotionOverride, onDismiss }: Props) {
  const reduce = useReducedMotionSafe(reduceMotionOverride);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
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
        className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-5 [background:color-mix(in_srgb,var(--color-ink)_28%,transparent)]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-labelledby="celebrate-title"
          tabIndex={-1}
          initial={reduce ? false : { scale: 0.9, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
          className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-card p-6 text-center shadow-xl outline-none"
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
