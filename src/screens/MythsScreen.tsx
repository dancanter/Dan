import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { myths } from '../content/myths';
import { useProgress } from '../hooks/useProgress';
import { Screen } from '../components/ui/Screen';
import { EvidenceNote } from '../components/ui/EvidenceNote';
import { Button } from '../components/ui/Button';

/**
 * Myth or fact, over the deck the app already ships.
 *
 * Every claim, verdict, explanation and citation comes from `myths.ts` by id.
 * Nothing medical is written here — this file decides only what order things
 * appear in and what to say when someone guesses.
 *
 * That last part is the whole design problem. A quiz that tells a pregnant
 * person they are WRONG about pregnancy is a bad idea: half these myths are
 * things a relative said with total confidence, and being marked incorrect for
 * believing them is a small humiliation attached to something already anxious.
 *
 * So there is no right and wrong here. Guessing turns the card over, and the
 * response either agrees with you or tells you the claim catches a lot of
 * people — which is true, and is why the card exists. Nothing is scored,
 * nothing is counted against you, and there is no completion percentage: the
 * only thing kept is which ones you have already turned over, so the deck
 * does not hand you the same card twice.
 */
type Guess = 'myth' | 'true';

export function MythsScreen() {
  const { revealedMythIds, markMythRevealed } = useProgress();
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<Guess | null>(null);

  // Unseen ones first, so returning picks up somewhere new — but the whole
  // deck stays available, because re-reading one is a perfectly good use.
  const deck = useMemo(() => {
    const unseen = myths.filter((m) => !revealedMythIds.includes(m.id));
    const seen = myths.filter((m) => revealedMythIds.includes(m.id));
    return [...unseen, ...seen];
    // Deliberately computed once on mount: reordering under someone mid-deck
    // as their own answers mark cards seen would be disorienting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myth = deck[index % deck.length];
  const revealed = guess !== null;
  const agreed = guess === myth.verdict;

  function answer(value: Guess) {
    setGuess(value);
    markMythRevealed(myth.id);
  }

  function next() {
    setGuess(null);
    setIndex((i) => i + 1);
  }

  return (
    <Screen
      title="Myth or fact"
      lede="Sixteen things people say about pregnancy. Some of them are true."
      width="reading"
    >
      <div className="rounded-xl border-[1.5px] border-line bg-card px-4 py-5">
        <p className="label-mono mb-2 text-clay">Someone will tell you…</p>
        <p className="m-0 mb-5 font-display text-[1.3125rem] font-semibold leading-snug">
          “{myth.claim}”
        </p>

        {!revealed ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => answer('myth')}
              className="min-h-[52px] flex-1 rounded-xl border-[1.5px] border-line bg-paper px-4 text-[1rem] font-semibold hover:border-moss"
            >
              That’s a myth
            </button>
            <button
              type="button"
              onClick={() => answer('true')}
              className="min-h-[52px] flex-1 rounded-xl border-[1.5px] border-line bg-paper px-4 text-[1rem] font-semibold hover:border-moss"
            >
              That’s true
            </button>
          </div>
        ) : (
          <div className="reveal-in">
            <span
              className={`label-mono inline-block rounded px-2.5 py-1 font-normal ${
                myth.verdict === 'myth' ? 'bg-alertp text-alert' : 'bg-mossp text-mossd'
              }`}
            >
              {myth.verdict === 'myth' ? 'Myth' : 'True'}
            </span>

            {/* Never "wrong". Half of these are things a relative said with
                total confidence, and being marked incorrect for believing
                them helps nobody. */}
            <p className="mb-2 mt-2.5 text-[0.9375rem] font-semibold">
              {agreed ? 'That’s right.' : 'This one catches a lot of people.'}
            </p>
            <p className="m-0 text-[0.9375rem] leading-relaxed">{myth.explanation}</p>
            <EvidenceNote sourceIds={myth.sourceIds} />

            <Button intent="primary" onClick={next} className="mt-4" full>
              Next one →
            </Button>
          </div>
        )}

        <p aria-live="polite" className="sr-only">
          {revealed ? `${myth.verdict === 'myth' ? 'Myth' : 'True'}. ${myth.explanation}` : ''}
        </p>
      </div>

      {/* No score, no streak, no "4 of 16". Stopping after one is a complete
          use of this, and a progress fraction would quietly say otherwise. */}
      <p className="mt-6 text-[0.90625rem] leading-relaxed text-soft">
        Stop whenever you like — there’s nothing to finish. Everything here is explained in full
        under{' '}
        <Link to="/healthy" className="underline">
          Guidance
        </Link>
        , with the sources behind it.
      </p>
    </Screen>
  );
}
