import { useState } from 'react';
import { useJournal } from '../../hooks/useJournal';
import { usePregnancyProfile } from '../../hooks/usePregnancyProfile';
import { SectionHeading } from '../ui/SectionHeading';

/**
 * The questions you meant to ask, in the place you would look for them.
 *
 * They were already being saved — into the general journal, mixed in with
 * moods, notes and symptoms. Which meant that at the appointment, with ten
 * minutes and a midwife waiting, you had to scroll a diary to find them. A
 * saved question you cannot retrieve at the moment it matters is not really
 * saved.
 *
 * Ticking one off marks it asked and drops it to the bottom rather than
 * deleting it, because the answer usually matters afterwards too — and because
 * deleting on tap is a horrible thing to get wrong one-handed.
 *
 * Deliberately no count of unasked questions, no badge, no "3 still to ask".
 * A list of things you did not manage to raise is not a score to be improved,
 * and appointments get cut short for reasons that are nobody's fault.
 */
export function QuestionList() {
  const { questions, add, remove, toggleAsked } = useJournal();
  const { currentWeek } = usePregnancyProfile();
  const [draft, setDraft] = useState('');

  const toAsk = questions.filter((q) => !q.asked);
  const asked = questions.filter((q) => q.asked);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    add('question', draft, currentWeek);
    setDraft('');
  }

  return (
    <>
      <SectionHeading>Questions for your midwife</SectionHeading>

      <form onSubmit={submit} className="mb-4">
        <label htmlFor="new-question" className="mb-1.5 block text-[0.90625rem] text-soft">
          Anything you want to remember to ask. It stays on this device.
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="new-question"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Is this headache normal?"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-base"
          />
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-moss px-4 text-[0.9375rem] font-semibold text-white"
          >
            Add
          </button>
        </div>
      </form>

      {questions.length === 0 ? (
        <p className="text-[0.9375rem] italic text-soft">
          Nothing saved yet. Things worth asking tend to occur to you at 2am and vanish by the
          appointment — this is somewhere to put them.
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {toAsk.map((q) => (
            <li
              key={q.id}
              className="mb-2 flex items-start gap-3 rounded-xl border border-line bg-card px-3.5 py-3"
            >
              <input
                type="checkbox"
                id={`q-${q.id}`}
                checked={false}
                onChange={() => toggleAsked(q.id)}
                className="mt-0.5 h-5 w-5 flex-none accent-moss"
              />
              <label htmlFor={`q-${q.id}`} className="flex-1 text-[0.9375rem] leading-relaxed">
                {q.text}
                {q.week !== null && (
                  <span className="mt-0.5 block font-mono text-[0.65625rem] text-soft">
                    saved in week {q.week}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => remove(q.id)}
                className="min-h-11 px-1 font-mono text-[0.6875rem] text-soft underline"
              >
                Remove
                <span className="sr-only"> question: {q.text}</span>
              </button>
            </li>
          ))}

          {asked.length > 0 && (
            <li className="mt-5">
              <p className="label-mono mb-2 text-soft">Already asked</p>
              <ul className="m-0 list-none p-0">
                {asked.map((q) => (
                  <li key={q.id} className="mb-1.5 flex items-start gap-3 px-3.5">
                    <input
                      type="checkbox"
                      id={`q-${q.id}`}
                      checked
                      onChange={() => toggleAsked(q.id)}
                      className="mt-0.5 h-5 w-5 flex-none accent-moss"
                    />
                    <label
                      htmlFor={`q-${q.id}`}
                      className="flex-1 text-[0.90625rem] leading-relaxed text-soft line-through"
                    >
                      {q.text}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      )}
    </>
  );
}
