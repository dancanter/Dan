import { MAX_WEEK, MIN_WEEK, DUE_WEEK } from '../../content/schema';
import { trimesterLabel } from '../../content/weeklyFocus';

interface WeekBarProps {
  week: number;
  onChange: (week: number | null) => void;
  /** The reader's actual week, so this can offer a way back to it. */
  currentWeek: number | null;
  /** Days until the due date, or null where there is no due date. */
  daysToGo: number | null;
}

/**
 * The week selector, and the two things it owns rather than each screen
 * deciding for itself.
 *
 * **What the countdown says.** Home used to pass a real days-to-go while the
 * Baby screen hardcoded null, so on the very same week Home said "213 days to
 * go" and Baby said "30 weeks to go". Both were reasonable; together they
 * were the app disagreeing with itself. The rule now lives here: days while
 * you are on your own week and a due date exists, weeks otherwise.
 *
 * **Getting back.** Home had a "back to my week" link and Baby had none, so
 * browsing ahead to week 35 on Baby left you arrowing back seven times. It is
 * part of the selector now, which is the only way the two screens cannot
 * drift apart again.
 */
export function WeekBar({ week, onChange, currentWeek, daysToGo }: WeekBarProps) {
  const remaining = DUE_WEEK - week;
  const pct = Math.min(100, Math.max(0, (week / DUE_WEEK) * 100));
  const browsing = currentWeek !== null && week !== currentWeek;
  // A countdown only means anything from where the reader actually is.
  const showDays = !browsing && daysToGo !== null && daysToGo > 0;

  return (
    <section
      aria-label="Week selector"
      className="mb-5 rounded-xl border border-line bg-card px-4 py-3.5"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(week - 1)}
          disabled={week <= MIN_WEEK}
          aria-label="Previous week"
          className="h-11 w-11 flex-none rounded-md border border-line bg-mossp text-title text-mossd disabled:opacity-30 enabled:hover:bg-moss enabled:hover:text-white"
        >
          ‹
        </button>
        <label className="sr-only" htmlFor="week-select">
          Choose week
        </label>
        <select
          id="week-select"
          value={week}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-paper px-3 font-mono text-small text-ink"
        >
          {Array.from({ length: MAX_WEEK - MIN_WEEK + 1 }, (_, i) => i + MIN_WEEK).map((w) => (
            <option key={w} value={w}>
              Week {w} — {trimesterLabel(w).split(' ')[0]} trimester
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onChange(week + 1)}
          disabled={week >= MAX_WEEK}
          aria-label="Next week"
          className="h-11 w-11 flex-none rounded-md border border-line bg-mossp text-title text-mossd disabled:opacity-30 enabled:hover:bg-moss enabled:hover:text-white"
        >
          ›
        </button>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-valuenow={week}
        aria-valuemin={MIN_WEEK}
        aria-valuemax={DUE_WEEK}
        aria-label={`Week ${week} of ${DUE_WEEK}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-moss to-mossd transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-meta text-soft">
        <span>
          Week {week} of {DUE_WEEK}
        </span>
        <span>
          {showDays
            ? `${daysToGo} day${daysToGo === 1 ? '' : 's'} to go`
            : remaining > 0
              ? `${remaining} week${remaining === 1 ? '' : 's'} to go`
              : 'Any day now'}
        </span>
      </div>

      {browsing && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2.5 flex min-h-11 items-center font-mono text-meta text-clay underline"
        >
          ← Back to my week ({currentWeek})
        </button>
      )}
    </section>
  );
}
