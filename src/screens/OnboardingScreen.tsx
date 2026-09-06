import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { MAX_WEEK, MIN_WEEK } from '../content/schema';
import { toISODate } from '../lib/dates';
import { seedDemo } from '../lib/demoData';
import { Button } from '../components/ui/Button';

type Mode = 'due-date' | 'current-week';

export function OnboardingScreen() {
  const { setDueDate, setCurrentWeek } = usePregnancyProfile();
  // Onboarding keeps its own centred layout rather than the Screen shell —
  // it is the one screen that isn't a page of content. It still has to put
  // focus somewhere, though, and it wasn't: a screen-reader user arriving at
  // the very first screen was left on <body> with nothing announced.
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('due-date');
  const [dueDateInput, setDueDateInput] = useState('');
  const [weekInput, setWeekInput] = useState('12');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === 'due-date') {
      if (!dueDateInput) {
        setError('Please enter your due date.');
        return;
      }
      setDueDate(dueDateInput);
    } else {
      const week = Number(weekInput);
      if (!Number.isFinite(week) || week < MIN_WEEK || week > MAX_WEEK) {
        setError(`Please enter a week between ${MIN_WEEK} and ${MAX_WEEK}.`);
        return;
      }
      setCurrentWeek(week);
    }
    navigate('/today', { replace: true });
  }

  function handleLookAround() {
    // seedDemo refuses if anything is already stored, so this cannot land on
    // top of a real pregnancy. Reaching that branch from here would mean the
    // profile exists, in which case App has already redirected away.
    if (seedDemo()) navigate('/today', { replace: true });
  }

  const toggleClass = (active: boolean) =>
    `min-h-11 flex-1 rounded-lg border px-3 text-sm font-medium ${
      active ? 'border-moss bg-mossp text-mossd' : 'border-line text-soft'
    }`;

  return (
    <main id="main" className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-7 text-center">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-[1.875rem] font-bold outline-none"
        >
          Field Notes
        </h1>
        <p className="label-mono text-mossd">A pregnancy guide — by Dan Canter</p>
        <p className="mt-4 text-[0.9375rem] text-soft">
          Week by week, evidence-based, and honest about what the evidence does and doesn’t say. No
          account, no tracking — everything stays on your device.
        </p>
        <p className="mt-2 text-[0.875rem] text-soft">
          Your due date is the only thing needed to start. Anything else is asked later, and only
          where it changes something.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset className="border-0 p-0">
          <legend className="mb-2 text-sm font-semibold">How would you like to start?</legend>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('due-date')}
              aria-pressed={mode === 'due-date'}
              className={toggleClass(mode === 'due-date')}
            >
              I know my due date
            </button>
            <button
              type="button"
              onClick={() => setMode('current-week')}
              aria-pressed={mode === 'current-week'}
              className={toggleClass(mode === 'current-week')}
            >
              I know my week
            </button>
          </div>
        </fieldset>

        {mode === 'due-date' ? (
          <div>
            <label htmlFor="due-date" className="mb-1 block text-sm font-semibold">
              Your due date
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDateInput}
              min={toISODate(new Date())}
              onChange={(e) => setDueDateInput(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="current-week" className="mb-1 block text-sm font-semibold">
              Current week of pregnancy
            </label>
            <input
              id="current-week"
              type="number"
              inputMode="numeric"
              min={MIN_WEEK}
              max={MAX_WEEK}
              value={weekInput}
              onChange={(e) => setWeekInput(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-alert">
            {error}
          </p>
        )}

        <Button intent="primary" full type="submit">
          Start
        </Button>

        <p className="text-center text-[0.875rem] text-soft">
          Worried about something right now?{' '}
          <Link to="/help" className="font-semibold underline">
            Get help
          </Link>{' '}
          — no setup needed.
        </p>

        {/* Below the fold of the real task, and quieter than it. Someone who
            is pregnant came here to start; this is for everyone else, and it
            should not compete with the thing they came to do. */}
        <div className="border-t border-line pt-4">
          <button
            type="button"
            onClick={handleLookAround}
            className="min-h-11 w-full rounded-lg border border-line px-3 text-[0.875rem] font-medium text-soft"
          >
            Not pregnant? Look around with example data
          </button>
          <p className="mt-1 text-center text-[0.8125rem] text-soft">
            Opens a made-up week 28. Clearly labelled, and one tap to clear.
          </p>
        </div>

        <p className="text-center font-mono text-[0.65625rem] leading-relaxed text-soft">
          Not a substitute for medical advice, and not clinically reviewed. It cannot check whether
          you or your baby are well. Always speak to your midwife or GP about your own care.
        </p>
      </form>
    </main>
  );
}
