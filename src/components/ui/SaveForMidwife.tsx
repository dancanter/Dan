import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJournal } from '../../hooks/useJournal';
import { usePregnancyProfile } from '../../hooks/usePregnancyProfile';

/**
 * The bridge between reading something and remembering to raise it.
 *
 * The gap this closes is the ordinary one: you read something at 11pm that
 * you would like to ask about, you think "I must remember that", and by the
 * appointment three weeks later it is gone. The app already had somewhere to
 * put questions — it just had no way to get one there from the place the
 * question actually occurs to you.
 *
 * One tap. No dialog, no form, no confirmation step. The topic is the thing
 * you were reading, because that is what you will recognise in the room.
 *
 * Deliberately absent: any count, any badge, any nudge to save more. Saving
 * is a convenience, not a task — and a list of things you meant to ask is
 * never a score.
 */
export function SaveForMidwife({
  topic,
  prompt = 'Want to ask about this?',
}: {
  /** What gets saved — normally the title of what they are reading. */
  topic: string;
  prompt?: string;
}) {
  const { questions, add } = useJournal();
  const { currentWeek } = usePregnancyProfile();
  const [justSaved, setJustSaved] = useState(false);

  // Saved already, in this session or any previous one. Matching on the text
  // means a second visit to the same entry shows the saved state rather than
  // offering to save a duplicate.
  const already = questions.some((q) => q.text === topic);

  if (already) {
    return (
      <p
        className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-3 text-[0.84375rem] text-soft"
        // Only announce the ones saved just now — not every already-saved
        // entry on the screen, every time the list renders.
        aria-live={justSaved ? 'polite' : 'off'}
      >
        <span className="font-semibold text-mossd">
          <span aria-hidden="true">✓ </span>Saved for your next appointment
        </span>
        <Link to="/appointments" className="min-h-11 py-3 underline">
          See your questions
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line pt-3">
      <span className="text-[0.84375rem] text-soft">{prompt}</span>
      <button
        type="button"
        onClick={() => {
          add('question', topic, currentWeek);
          setJustSaved(true);
        }}
        className="inline-flex min-h-11 items-center rounded-lg border border-moss bg-mossp px-3.5 text-[0.84375rem] font-semibold text-mossd transition-colors hover:bg-moss hover:text-white active:bg-moss active:text-white"
      >
        Save for my midwife
      </button>
    </div>
  );
}
