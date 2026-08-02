import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useStreak } from '../hooks/useStreak';
import { useJournal } from '../hooks/useJournal';
import { useSavedItems } from '../hooks/useSavedItems';
import { badges } from '../content';
import { StreakBadge } from '../components/progress/StreakBadge';

export function ProgressScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { currentStreak, totalDaysEngaged, viewedArticleIds, earnedBadgeIds } = useStreak();
  const { daysLogged } = useJournal();
  const { savedCount } = useSavedItems();

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark">
        Your progress
      </h1>
      <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">
        However often you visit is the right amount — this is just here to look back on.
      </p>

      <div className="mt-6">
        <StreakBadge currentStreak={currentStreak} totalDaysEngaged={totalDaysEngaged} />
      </div>

      <p className="mt-4 text-sm text-bump-muted dark:text-bump-muted-dark">
        You've read {viewedArticleIds.length} {viewedArticleIds.length === 1 ? 'article' : 'articles'} so far.
      </p>

      <ul className="mt-4 space-y-2 text-sm">
        <li>
          <Link to="/saved" className="font-semibold text-bump-primary underline dark:text-bump-primary-dark">
            {savedCount} saved {savedCount === 1 ? 'read' : 'reads'} →
          </Link>
        </li>
        <li>
          <Link to="/journal" className="font-semibold text-bump-primary underline dark:text-bump-primary-dark">
            {daysLogged} {daysLogged === 1 ? 'day' : 'days'} in your journal →
          </Link>
        </li>
      </ul>

      <section className="mt-8" aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark">
          Milestones
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {badges.map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id);
            return (
              <li
                key={badge.id}
                className={`rounded-2xl border p-3 text-center ${
                  earned
                    ? 'border-bump-accent bg-bump-accent/10'
                    : 'border-bump-border bg-bump-surface opacity-60 dark:border-bump-border-dark dark:bg-bump-surface-dark'
                }`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {earned ? '🏅' : '🔒'}
                </span>
                <p className="mt-1 text-sm font-semibold text-bump-text dark:text-bump-text-dark">{badge.title}</p>
                <p className="mt-0.5 text-xs text-bump-muted dark:text-bump-muted-dark">{badge.description}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
