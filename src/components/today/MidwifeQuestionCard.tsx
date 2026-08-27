import { useState } from 'react';
import { Link } from 'react-router-dom';
import { midwifeQuestions } from '../../content/midwifeQuestions';
import { dayOfYear } from '../../lib/dates';

interface Props {
  onSave: (question: string) => void;
}

export function MidwifeQuestionCard({ onSave }: Props) {
  // Start from a day-derived index so the same prompt greets you all day,
  // rather than reshuffling on every re-render.
  const [index, setIndex] = useState(() => dayOfYear() % midwifeQuestions.length);
  const [saved, setSaved] = useState(false);
  const question = midwifeQuestions[index % midwifeQuestions.length];

  return (
    <div className="rounded-xl border border-dashed border-moss bg-card p-4">
      <p className="m-0 mb-3 text-[16px] italic">“{question}”</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setIndex((i) => i + 1);
            setSaved(false);
          }}
          className="min-h-11 rounded-lg border border-line bg-mossp px-3.5 text-[13.5px] font-semibold text-mossd"
        >
          Another →
        </button>
        <button
          type="button"
          onClick={() => {
            onSave(question);
            setSaved(true);
          }}
          className="min-h-11 rounded-lg border border-line bg-clayp px-3.5 text-[13.5px] font-semibold text-clay"
        >
          {saved ? 'Saved ✓' : 'Save this question'}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-[13px] text-soft">
        {saved ? (
          <>
            Saved. It’s on{' '}
            <Link to="/appointments" className="underline">
              Appointments
            </Link>{' '}
            with your other questions.
          </>
        ) : (
          ''
        )}
      </p>
    </div>
  );
}
