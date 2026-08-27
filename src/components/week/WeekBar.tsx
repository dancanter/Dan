import { MAX_WEEK, MIN_WEEK, DUE_WEEK } from '../../content/schema';
import { trimesterLabel } from '../../content/weeklyFocus';

interface WeekBarProps {
  week: number;
  onChange: (week: number) => void;
  daysToGo: number | null;
}

export function WeekBar({ week, onChange, daysToGo }: WeekBarProps) {
  const remaining = DUE_WEEK - week;
  const pct = Math.min(100, Math.max(0, (week / DUE_WEEK) * 100));

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
          className="h-11 w-11 flex-none rounded-md border border-line bg-mossp text-lg text-mossd disabled:opacity-30 enabled:hover:bg-moss enabled:hover:text-white"
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
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-paper px-3 font-mono text-sm text-ink"
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
          className="h-11 w-11 flex-none rounded-md border border-line bg-mossp text-lg text-mossd disabled:opacity-30 enabled:hover:bg-moss enabled:hover:text-white"
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
      <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-soft">
        <span>
          Week {week} of {DUE_WEEK}
        </span>
        <span>
          {daysToGo !== null && daysToGo > 0
            ? `${daysToGo} day${daysToGo === 1 ? '' : 's'} to go`
            : remaining > 0
              ? `${remaining} week${remaining === 1 ? '' : 's'} to go`
              : 'Any day now'}
        </span>
      </div>
    </section>
  );
}
