import type { ReactNode } from 'react';
import { Button } from '../ui/Button';

export interface Option {
  value: string;
  label: string;
}

interface Props {
  /** Small line above the prompt — "Someone will tell you…", "Is this…". */
  eyebrow: string;
  prompt: ReactNode;
  options: Option[];
  /** The option the content says is right. Never shown as a mark. */
  answer: string;
  chosen: string | null;
  onChoose: (value: string) => void;
  onNext: () => void;
  /** Verdict badge and explanation, supplied by the screen. */
  reveal: ReactNode;
}

/**
 * The shape all three learning cards share: ask, turn over, move on.
 *
 * Extracted once there were three of them rather than guessed at in advance.
 * What it really centralises is the tone rule — there is no right and wrong
 * here, and the response to a mismatch is never a mark.
 *
 * Half of what these cards cover is things a relative said with total
 * confidence, or a rule that genuinely is confusing. Being told you are WRONG
 * about pregnancy attaches a small humiliation to something already anxious,
 * so a guess simply turns the card over and the response either agrees with
 * you or says the item catches people out — which is true, and is why it is
 * in the deck at all.
 */
export function PromptCard({
  eyebrow,
  prompt,
  options,
  answer,
  chosen,
  onChoose,
  onNext,
  reveal,
}: Props) {
  const revealed = chosen !== null;
  const agreed = chosen === answer;

  return (
    <div className="rounded-xl border-[1.5px] border-line bg-card px-4 py-5">
      <p className="label-mono mb-2 text-clay">{eyebrow}</p>
      <div className="mb-5">{prompt}</div>

      {!revealed ? (
        <div className={options.length > 2 ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChoose(o.value)}
              className="min-h-[52px] flex-1 rounded-xl border-[1.5px] border-line bg-paper px-3 text-[0.96875rem] font-semibold hover:border-moss"
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="reveal-in">
          {/* Never "wrong", "incorrect" or a cross. */}
          <p className="mb-2 text-[0.9375rem] font-semibold">
            {agreed ? 'That’s right.' : 'This one catches a lot of people.'}
          </p>
          {reveal}
          <Button intent="primary" onClick={onNext} className="mt-4" full>
            Next one →
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * The line under every deck. No score, no streak, no "4 of 16" — stopping
 * after one card is a complete use of these, and a progress fraction would
 * quietly say otherwise.
 */
export function NothingToFinish({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-[0.90625rem] leading-relaxed text-soft">
      Stop whenever you like — there’s nothing to finish. {children}
    </p>
  );
}
