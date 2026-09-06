import { useSpeech } from '../../hooks/useSpeech';
import { speakable } from '../../lib/speakable';

/**
 * "Read this to me."
 *
 * Started on the urgent screens, where the case is someone frightened at 3am
 * with shaking hands and possibly no glasses. It is now also on the loss
 * screens, where the case is different but just as real: people cry, and you
 * cannot read through it.
 *
 * Still deliberately absent from the browsing screens, where it would be a
 * gimmick rather than a way in.
 */


interface Props {
  /** What to say, in the order it should be said. */
  text: string;
  /** Overrides the button wording where "this" is ambiguous. */
  label?: string;
}

export function ReadAloud({ text, label = 'Read this to me' }: Props) {
  const { supported, speaking, speak, stop } = useSpeech();

  // Hidden rather than disabled where the browser can't do it — a dead
  // control is worse than no control on a screen someone needs quickly.
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : speak(speakable(text)))}
      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line px-4 text-[0.90625rem] font-semibold text-ink"
    >
      <span aria-hidden="true">{speaking ? '■' : '▶'}</span>
      {speaking ? 'Stop reading' : label}
    </button>
  );
}
