import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ContentItem } from '../../content';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

interface TipRevealCardProps {
  item: ContentItem;
  reduceMotionOverride: boolean;
  onReveal?: () => void;
}

export function TipRevealCard({ item, reduceMotionOverride, onReveal }: TipRevealCardProps) {
  const [revealed, setRevealed] = useState(false);
  const reduceMotion = useReducedMotionSafe(reduceMotionOverride);

  function handleReveal() {
    if (revealed) return;
    setRevealed(true);
    onReveal?.();
  }

  return (
    <div className="rounded-3xl border border-bump-border bg-bump-surface p-5 shadow-sm dark:border-bump-border-dark dark:bg-bump-surface-dark">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-bump-accent dark:text-bump-accent-dark">
        Today's tip
      </h2>

      {!revealed ? (
        <button
          type="button"
          onClick={handleReveal}
          className="mt-3 flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-bump-border bg-bump-bg/60 p-6 text-center transition-colors hover:border-bump-primary dark:border-bump-border-dark dark:bg-bump-bg-dark/40"
        >
          <span className="text-2xl" aria-hidden="true">
            ✨
          </span>
          <span className="font-medium text-bump-text dark:text-bump-text-dark">Tap to reveal today's tip</span>
        </button>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
            className="mt-3"
          >
            <p className="text-lg font-medium leading-snug text-bump-text dark:text-bump-text-dark">{item.tip}</p>
            <Link
              to={`/article/${item.id}`}
              className="mt-3 inline-block min-h-11 rounded-full bg-bump-primary px-4 py-2 text-sm font-semibold text-white dark:bg-bump-primary-dark"
            >
              Read more
            </Link>
          </motion.div>
        </AnimatePresence>
      )}

      <div aria-live="polite" className="sr-only">
        {revealed ? `Today's tip revealed: ${item.tip}` : ''}
      </div>
    </div>
  );
}
