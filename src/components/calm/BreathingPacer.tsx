import { useEffect, useRef, useState } from 'react';
import { useReducedMotionSafe } from '../../hooks/useReducedMotionSafe';
import { Button } from '../ui/Button';

interface Props {
  inhale: number;
  exhale: number;
  reduceMotionOverride: boolean;
}

type Phase = 'in' | 'out';

/**
 * A pacer for slow breathing. Nothing is recorded, nothing is counted across
 * sessions, and it never starts on its own.
 *
 * The reduced-motion path is a real alternative rather than a degraded one.
 * An expanding circle is the obvious way to pace breathing and is also, for
 * some people, exactly the kind of movement that makes nausea or a migraine
 * worse — which in this audience is not a rare edge case. So that version
 * counts in plain numerals instead, and paces just as well.
 *
 * The count is announced politely for screen readers on each phase change
 * rather than every second, because a per-second live region would be
 * unusable — the point is "breathe in now", not a stopwatch.
 */
export function BreathingPacer({ inhale, exhale, reduceMotionOverride }: Props) {
  const reduce = useReducedMotionSafe(reduceMotionOverride);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('in');
  const [left, setLeft] = useState(inhale);
  const [cycles, setCycles] = useState(0);
  const tick = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setLeft((remaining) => {
        if (remaining > 1) return remaining - 1;
        // Phase over — swap, and reset the counter for the next one.
        setPhase((current) => {
          const next: Phase = current === 'in' ? 'out' : 'in';
          if (next === 'in') setCycles((c) => c + 1);
          setLeft(next === 'in' ? inhale : exhale);
          return next;
        });
        return remaining;
      });
    }, 1000);
    return () => window.clearInterval(tick.current);
  }, [running, inhale, exhale]);

  function stop() {
    setRunning(false);
    setPhase('in');
    setLeft(inhale);
  }

  const label = phase === 'in' ? 'Breathe in' : 'Breathe out';
  const duration = phase === 'in' ? inhale : exhale;

  return (
    <div className="rounded-xl border border-line bg-card px-4 py-5 text-center">
      {reduce ? (
        // Just the count. The phase is named once, below, rather than twice
        // over — the number is the pacing device here, and repeating the
        // words inside the circle only made the two harder to read at a
        // glance.
        <div className="mx-auto flex aspect-square w-[min(9.375rem,70vw)] items-center justify-center rounded-full border-[3px] border-moss bg-mossp">
          <span className="font-display text-[3.25rem] leading-none text-mossd">
            {running ? left : '—'}
          </span>
        </div>
      ) : (
        <div className="mx-auto flex aspect-square w-[min(11.875rem,72vw)] items-center justify-center">
          <span
            aria-hidden="true"
            style={
              running
                ? {
                    animationName: phase === 'in' ? 'breathe-in' : 'breathe-out',
                    animationDuration: `${duration}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationFillMode: 'forwards',
                  }
                : undefined
            }
            className="flex aspect-square w-[58%] items-center justify-center rounded-full border-[3px] border-moss bg-mossp"
          >
            <span className="font-display text-[2.25rem] leading-none text-mossd">
              {running ? left : '—'}
            </span>
          </span>
        </div>
      )}

      <p className="mb-4 mt-3 text-[1.0625rem] font-semibold">
        {running ? label : 'Ready when you are'}
      </p>

      {/* Announced on each phase change, not each second — a per-second live
          region would be unusable, and the message is "breathe in now". */}
      <p aria-live="polite" className="sr-only">
        {running ? `${label} for ${duration} seconds` : ''}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Button intent="primary" onClick={() => (running ? stop() : setRunning(true))}>
          {running ? 'Stop' : 'Start'}
        </Button>
      </div>

      {/* No target, no goal, and nothing kept once the page closes. Stopping
          after one breath is a complete use of this. */}
      {cycles > 0 && (
        <p className="mt-3 font-mono text-[0.6875rem] text-soft">
          {cycles} {cycles === 1 ? 'breath' : 'breaths'} so far. Stop whenever you like — there is
          no target, and this isn’t saved.
        </p>
      )}
    </div>
  );
}
