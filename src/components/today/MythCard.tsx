import { useState } from 'react';
import type { Myth } from '../../content/schema';
import { EvidenceNote } from '../ui/EvidenceNote';
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
        // A fade-and-rise, in CSS rather than Framer Motion. This card is on
        // the eagerly-loaded home screen, so importing an animation library
        // for one transition put ~100kB of it in front of every first paint.
        <div className={`border-t border-line pt-3 text-left ${reduce ? '' : 'reveal-in'}`}>
          <span
            className={`label-mono inline-block rounded px-2.5 py-1 font-normal ${
              myth.verdict === 'myth' ? 'bg-alertp text-alert' : 'bg-mossp text-mossd'
            }`}
          >
            {myth.verdict === 'myth' ? 'Myth' : 'True'}
          </span>
          <p className="mt-2 text-[15px]">{myth.explanation}</p>
          <EvidenceNote sourceIds={myth.sourceIds} />
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {revealed ? `${myth.verdict === 'myth' ? 'Myth' : 'True'}. ${myth.explanation}` : ''}
      </div>
    </div>
  );
}
