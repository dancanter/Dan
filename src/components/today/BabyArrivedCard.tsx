import { useState } from 'react';
import { usePregnancyProfile } from '../../hooks/usePregnancyProfile';
import { toISODate } from '../../lib/dates';

/**
 * The switch into after-birth mode.
 *
 * Deliberately low-key and only shown from 34 weeks: it is a quiet line at the
 * bottom of the screen, not a celebratory banner someone has to look at every
 * day for six weeks. Anyone whose pregnancy ends another way should not be
 * met with a bright "has your baby arrived?" prompt — the same reasoning that
 * keeps loss support on its own route.
 */
export function BabyArrivedCard() {
  const { setBirthDate } = usePregnancyProfile();
  const [open, setOpen] = useState(false);
  const today = toISODate(new Date());
  const [value, setValue] = useState(today);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 min-h-11 w-full rounded-lg border border-line px-3 font-mono text-[0.6875rem] text-soft"
      >
        Baby arrived? Switch to after-birth mode →
      </button>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-moss bg-mossp px-4 py-3.5">
      <label htmlFor="birth-date" className="mb-1.5 block text-sm font-semibold">
        What date was your baby born?
      </label>
      <input
        id="birth-date"
        type="date"
        value={value}
        max={today}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
      />
      <p className="mt-2 mb-3 text-[0.84375rem] text-mossd">
        Your daily screen will switch to recovery, feeding and the first weeks. Everything else
        stays exactly where it is, and you can switch back in Settings.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setBirthDate(value);
          }}
          disabled={!value}
          className="min-h-11 flex-1 rounded-lg bg-moss px-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 rounded-lg border border-line px-4 text-sm text-soft"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
