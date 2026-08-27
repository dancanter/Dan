import { useSpeech } from '../../hooks/useSpeech';

/**
 * "Read this to me", on urgent screens only.
 *
 * Reads the action line first and the explanation second — the same order the
 * screen itself uses, so someone who taps it hears what to do before why.
 */
export function ReadAloud({ now, why }: { now: string; why: string }) {
  const { supported, speaking, speak, stop } = useSpeech();

  // Hidden rather than disabled where the browser can't do it — a dead
  // control is worse than no control on a screen someone needs quickly.
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : speak(`${now} ${why}`))}
      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line px-4 text-[0.90625rem] font-semibold text-ink"
    >
      <span aria-hidden="true">{speaking ? '■' : '▶'}</span>
      {speaking ? 'Stop reading' : 'Read this to me'}
    </button>
  );
}
