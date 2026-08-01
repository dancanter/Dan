import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { MAX_WEEK, MIN_WEEK, toISODate } from '../lib/dates';

type Mode = 'due-date' | 'current-week';

export function OnboardingScreen() {
  const { setDueDate, setCurrentWeek } = usePregnancyProfile();
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

  return (
    <main id="main-content" className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <span className="text-4xl" aria-hidden="true">
          🌱
        </span>
        <h1 className="mt-3 text-2xl font-bold text-bump-text dark:text-bump-text-dark">Welcome to Bump</h1>
        <p className="mt-2 text-bump-muted dark:text-bump-muted-dark">
          A day-by-day, week-by-week guide to pregnancy — evidence-based, no guilt, no pressure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-bump-text dark:text-bump-text-dark">
            How would you like to get started?
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('due-date')}
              aria-pressed={mode === 'due-date'}
              className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                mode === 'due-date'
                  ? 'border-bump-primary bg-bump-primary/10 text-bump-primary dark:text-bump-primary-dark'
                  : 'border-bump-border text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark'
              }`}
            >
              I know my due date
            </button>
            <button
              type="button"
              onClick={() => setMode('current-week')}
              aria-pressed={mode === 'current-week'}
              className={`min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                mode === 'current-week'
                  ? 'border-bump-primary bg-bump-primary/10 text-bump-primary dark:text-bump-primary-dark'
                  : 'border-bump-border text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark'
              }`}
            >
              I know my current week
            </button>
          </div>
        </fieldset>

        {mode === 'due-date' ? (
          <div>
            <label htmlFor="due-date" className="mb-1 block text-sm font-semibold text-bump-text dark:text-bump-text-dark">
              Your due date
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDateInput}
              min={toISODate(new Date())}
              onChange={(event) => setDueDateInput(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="current-week" className="mb-1 block text-sm font-semibold text-bump-text dark:text-bump-text-dark">
              Current week of pregnancy
            </label>
            <input
              id="current-week"
              type="number"
              inputMode="numeric"
              min={MIN_WEEK}
              max={MAX_WEEK}
              value={weekInput}
              onChange={(event) => setWeekInput(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="min-h-11 w-full rounded-full bg-bump-primary px-4 py-3 text-base font-semibold text-white dark:bg-bump-primary-dark"
        >
          Let's go
        </button>

        <p className="text-center text-xs text-bump-muted dark:text-bump-muted-dark">
          No account needed. Your information stays on this device.
        </p>
      </form>
    </main>
  );
}
