interface StreakBadgeProps {
  currentStreak: number;
  totalDaysEngaged: number;
}

export function StreakBadge({ currentStreak, totalDaysEngaged }: StreakBadgeProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-bump-border bg-bump-surface p-4 dark:border-bump-border-dark dark:bg-bump-surface-dark">
      <div className="flex-1 text-center">
        <div className="text-2xl font-bold text-bump-primary dark:text-bump-primary-dark">{currentStreak}</div>
        <div className="text-xs text-bump-muted dark:text-bump-muted-dark">day streak</div>
      </div>
      <div className="w-px bg-bump-border dark:bg-bump-border-dark" aria-hidden="true" />
      <div className="flex-1 text-center">
        <div className="text-2xl font-bold text-bump-accent dark:text-bump-accent-dark">{totalDaysEngaged}</div>
        <div className="text-xs text-bump-muted dark:text-bump-muted-dark">days visited in total</div>
      </div>
      <p className="sr-only">
        {currentStreak === 0
          ? "No pressure — pick up whenever suits you. You've visited on "
          : `Current streak: ${currentStreak} days. Total days visited: `}
        {totalDaysEngaged}.
      </p>
    </div>
  );
}
