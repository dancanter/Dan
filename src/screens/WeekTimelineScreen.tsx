import { Link } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { allWeeks } from '../content';

export function WeekTimelineScreen() {
  const { currentWeek } = usePregnancyProfile();
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark">
        Week by week
      </h1>
      <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">
        Browse ahead or look back any time — nothing here is locked.
      </p>

      <ul className="mt-6 space-y-2">
        {allWeeks.map((week) => {
          const isCurrent = week.week === currentWeek;
          return (
            <li key={week.week}>
              <Link
                to={`/weeks/${week.week}`}
                className={`flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 ${
                  isCurrent
                    ? 'border-bump-primary bg-bump-primary/10'
                    : 'border-bump-border bg-bump-surface dark:border-bump-border-dark dark:bg-bump-surface-dark'
                }`}
              >
                <span>
                  <span className="font-semibold text-bump-text dark:text-bump-text-dark">Week {week.week}</span>
                  <span className="ml-2 text-sm text-bump-muted dark:text-bump-muted-dark">{week.headline}</span>
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-bump-primary px-2 py-0.5 text-xs font-semibold text-white dark:bg-bump-primary-dark">
                    You are here
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
