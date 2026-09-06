import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePersistedState } from '../../hooks/usePersistedState';

/**
 * "What's usual for your baby" — written once, read at 2am.
 *
 * NHS and RCOG guidance does not say how much a baby should move. It says
 * get to know *your* baby's pattern, so you would notice it change. The
 * journal already supports that by logging times, but at the moment it
 * matters — awake at 2am, frightened, trying to remember whether this is
 * normal for her — scrolling back through a list of entries is the wrong
 * shape. A sentence you wrote yourself in daylight is the right one.
 *
 * The thing this must never become is a self-assessment. So:
 *
 *  - It sits *below* the reminder that any change means calling, never above.
 *  - The prompt asks what is usual, never whether today is fine.
 *  - Reading it back is always followed by the same line: a change is a
 *    reason to call, and this note is not evidence that anything is fine.
 *  - Nothing is counted, scored, compared to it, or checked against it. The
 *    app never reads this text — only the person who wrote it does.
 */
const STORAGE_KEY = 'fieldnotes:usual-movements';

export function UsualPattern() {
  const [saved, setSaved] = usePersistedState<string>(STORAGE_KEY, '');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);

  function save() {
    setSaved(draft.trim());
    setEditing(false);
  }

  if (!editing && saved) {
    return (
      <section
        aria-labelledby="usual-pattern"
        className="mb-6 rounded-xl border border-line bg-card px-4 py-4"
      >
        <h2 id="usual-pattern" className="label-mono mb-1.5 text-mossd">
          What you said is usual
        </h2>
        <p className="m-0 whitespace-pre-wrap text-body leading-relaxed">{saved}</p>
        <p className="mt-3 border-l-2 border-alert pl-3 text-small leading-relaxed">
          If today is different from this, that is a reason to call — not a reason to wait and see.
          This note cannot tell you your baby is well.{' '}
          <Link to="/help/movements" className="font-semibold underline">
            What to do
          </Link>
        </p>
        <button
          type="button"
          onClick={() => {
            setDraft(saved);
            setEditing(true);
          }}
          className="mt-3 min-h-11 font-mono text-meta text-soft underline"
        >
          Change what I wrote
        </button>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="usual-pattern"
      className="mb-6 rounded-xl border border-line bg-card px-4 py-4"
    >
      <h2 id="usual-pattern" className="mb-1 font-display text-lead font-semibold">
        What’s usual for your baby?
      </h2>
      <p className="mb-3 text-small leading-relaxed text-soft">
        There is no normal number of movements — only what is normal for yours. Writing it down now,
        while you are not worried, gives you something to compare against when you are.
      </p>

      <label htmlFor="usual-pattern-note" className="mb-1.5 block text-small font-semibold">
        In your own words
      </label>
      <textarea
        id="usual-pattern-note"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder="Busiest late evening and after I eat. Quiet most mornings. Big rolls rather than sharp kicks."
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-base leading-relaxed"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={draft.trim().length === 0}
          className="min-h-11 rounded-lg border border-line bg-mossp px-4 text-body font-semibold text-mossd disabled:opacity-40"
        >
          Save this
        </button>
        {saved && (
          <button
            type="button"
            onClick={() => {
              setDraft(saved);
              setEditing(false);
            }}
            className="min-h-11 px-2 text-body underline"
          >
            Cancel
          </button>
        )}
      </div>
    </section>
  );
}
