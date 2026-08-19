import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Myth } from '../../content';
import { SourceList } from '../ui/SourceList';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';

interface Props {
  myth: Myth;
  reduceMotionOverride: boolean;
  onReveal: (id: string) => void;
}

export function MythCard({ myth, reduceMotionOverride, onReveal }: Props) {
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotionSafe(reduceMotionOverride);

  function reveal() {
    if (revealed) return;
    setRevealed(true);
    onReveal(myth.id);
  }

  return (
    <div className="rounded-xl border border-line bg-card p-4.5 px-4 py-4 text-center">
      <span className="label-mono block text-clay">True or myth?</span>
      <p className="mt-2 mb-3 font-display text-[18px] font-semibold">“{myth.claim}”</p>

      {!revealed ? (
        <button
          type="button"
          onClick={reveal}
          className="min-h-11 w-full rounded-lg border-2 border-dashed border-line px-4 py-3 font-mono text-[11px] text-soft hover:border-moss hover:text-mossd"
        >
          Tap to reveal →
        </button>
      ) : (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className="border-t border-line pt-3 text-left"
        >
          <span
            className={`label-mono inline-block rounded px-2.5 py-1 font-normal ${
              myth.verdict === 'myth' ? 'bg-alertp text-alert' : 'bg-mossp text-mossd'
            }`}
          >
            {myth.verdict === 'myth' ? 'Myth' : 'True'}
          </span>
          <p className="mt-2 text-[15px]">{myth.explanation}</p>
          <SourceList sourceIds={myth.sourceIds} />
        </motion.div>
      )}

      <div aria-live="polite" className="sr-only">
        {revealed ? `${myth.verdict === 'myth' ? 'Myth' : 'True'}. ${myth.explanation}` : ''}
      </div>
    </div>
  );
}
