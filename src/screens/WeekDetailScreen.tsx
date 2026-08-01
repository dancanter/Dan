import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { weekByNumber, contentItemById, badgeById } from '../content';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useStreak } from '../hooks/useStreak';
import { ArticleCard } from '../components/content/ArticleCard';

export function WeekDetailScreen() {
  const { weekNumber } = useParams<{ weekNumber: string }>();
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { awardBadge } = useStreak();
  const week = weekNumber ? weekByNumber.get(Number(weekNumber)) : undefined;

  useEffect(() => {
    if (week?.milestone) {
      awardBadge(week.milestone.badgeId);
    }
  }, [week?.milestone, awardBadge]);

  if (!week) {
    return <Navigate to="/weeks" replace />;
  }

  const articles = week.featuredArticleIds
    .map((id) => contentItemById.get(id))
    .filter((item) => item !== undefined);
  const milestoneBadge = week.milestone ? badgeById.get(week.milestone.badgeId) : undefined;

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <p className="text-sm font-semibold text-bump-accent dark:text-bump-accent-dark">
        Week {week.week} · Trimester {week.trimester}
      </p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark">
        {week.headline}
      </h1>
      {week.babySize && (
        <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">Baby is {week.babySize}.</p>
      )}

      {milestoneBadge && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-bump-accent/40 bg-bump-accent/10 p-3">
          <span className="text-2xl" aria-hidden="true">
            🏅
          </span>
          <div>
            <p className="font-semibold text-bump-text dark:text-bump-text-dark">{milestoneBadge.title}</p>
            <p className="text-sm text-bump-muted dark:text-bump-muted-dark">{milestoneBadge.description}</p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {articles.length > 0 ? (
          articles.map((item) => <ArticleCard key={item!.id} item={item!} />)
        ) : (
          <p className="rounded-2xl border border-dashed border-bump-border p-4 text-center text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark">
            More content for this week is coming soon.
          </p>
        )}
      </div>
    </main>
  );
}
