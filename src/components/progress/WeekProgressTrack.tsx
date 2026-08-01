import { Link } from 'react-router-dom';
import { allWeeks } from '../../content';

interface WeekProgressTrackProps {
  currentWeek: number | null;
}

export function WeekProgressTrack({ currentWeek }: WeekProgressTrackProps) {
  return (
    <div
      role="list"
      aria-label="Pregnancy week by week timeline"
      className="flex gap-2 overflow-x-auto pb-2"
    >
      {allWeeks.map((week) => {
        const isCurrent = week.week === currentWeek;
        const isPast = currentWeek !== null && week.week < currentWeek;
        return (
          <Link
            role="listitem"
            key={week.week}
            to={`/weeks/${week.week}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={`flex min-h-11 min-w-11 flex-shrink-0 flex-col items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              isCurrent
                ? 'bg-bump-primary text-white dark:bg-bump-primary-dark'
                : isPast
                  ? 'bg-bump-accent/20 text-bump-accent dark:bg-bump-accent-dark/20 dark:text-bump-accent-dark'
                  : 'bg-bump-surface text-bump-muted ring-1 ring-inset ring-bump-border dark:bg-bump-surface-dark dark:text-bump-muted-dark dark:ring-bump-border-dark'
            }`}
          >
            {week.week}
          </Link>
        );
      })}
    </div>
  );
}
