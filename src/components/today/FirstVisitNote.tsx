import { Link } from 'react-router-dom';
import { usePersistedState } from '../../hooks/usePersistedState';

const STORAGE_KEY = 'fieldnotes:seenIntro';

/**
 * The one thing a first-time reader is told, before they are left alone.
 *
 * Onboarding asks for a due date and nothing else, which is right — but it
 * means someone arrives at a full daily screen having been told nothing about
 * what this is. The two things worth saying are the two things that are easy
 * to get wrong about a pregnancy app: it will not check whether you are well,
 * and the urgent guidance is one tap away without hunting for it.
 *
 * Deliberately not a modal, not a carousel, and not a product tour. It is a
 * card in the flow of the page that can be read or ignored, and it goes away
 * for good the moment it is dismissed. A tour would put four screens between
 * someone and the help they might have opened the app to find.
 */
export function FirstVisitNote() {
  const [seen, setSeen] = usePersistedState<boolean>(STORAGE_KEY, false);
  if (seen) return null;

  return (
    <section
      aria-labelledby="first-visit"
      className="mb-6 rounded-xl border border-line bg-card px-4 py-4"
    >
      <h2 id="first-visit" className="mb-1.5 font-display text-[1.0625rem] font-semibold">
        Before you start
      </h2>
      <p className="m-0 text-[0.9375rem] leading-relaxed text-soft">
        Everything here is checked against a named source, and the research papers link straight
        through so you can read them yourself. Where the evidence is genuinely uncertain, it says so
        instead of picking a side.
      </p>
      <p className="mb-0 mt-2.5 text-[0.9375rem] leading-relaxed text-soft">
        <strong className="text-ink">
          This app cannot tell you whether you or your baby are well.
        </strong>{' '}
        Nothing here replaces your midwife. If something feels wrong —{' '}
        <Link to="/help" className="font-semibold text-alert underline">
          Get help
        </Link>{' '}
        is on every screen, and you will never be wasting anyone’s time.
      </p>
      <button
        type="button"
        onClick={() => setSeen(true)}
        className="mt-3.5 min-h-11 w-full rounded-lg border border-line px-3 text-[0.9375rem] font-semibold"
      >
        Got it
      </button>
    </section>
  );
}
