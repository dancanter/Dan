import { Navigate } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useStreak } from '../hooks/useStreak';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { weekByNumber, contentItemById } from '../content';
import { dayIndexWithinWeek } from '../lib/dates';
import { TipRevealCard } from '../components/content/TipRevealCard';
import { ArticleCard } from '../components/content/ArticleCard';
import { StreakBadge } from '../components/progress/StreakBadge';

export function TodayScreen() {
  const { currentWeek, isOnboarded } = usePregnancyProfile();
  const { currentStreak, totalDaysEngaged, recordEngagementToday } = useStreak();
  const { reduceMotion } = useAccessibilitySettings();
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();

  if (!isOnboarded || currentWeek === null) {
    return <Navigate to="/" replace />;
  }

  const week = weekByNumber.get(currentWeek) ?? weekByNumber.get(4)!;
  const dailyTipId =
    week.dailyTipIds.length > 0
      ? week.dailyTipIds[dayIndexWithinWeek() % week.dailyTipIds.length]
      : null;
  const dailyTip = dailyTipId ? contentItemById.get(dailyTipId) : undefined;
  const featuredArticles = week.featuredArticleIds
    .map((id) => contentItemById.get(id))
    .filter((item) => item !== undefined)
    .slice(0, 3);

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <header>
        <p className="text-sm font-semibold text-bump-accent dark:text-bump-accent-dark">
          Week {week.week} · Trimester {week.trimester}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark">
          {week.headline}
        </h1>
        {week.babySize && (
          <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">Baby is {week.babySize}.</p>
        )}
      </header>

      <div className="mt-6">
        <StreakBadge currentStreak={currentStreak} totalDaysEngaged={totalDaysEngaged} />
      </div>

      <div className="mt-6">
        {dailyTip ? (
          <TipRevealCard item={dailyTip} reduceMotionOverride={reduceMotion} onReveal={recordEngagementToday} />
        ) : (
          <div className="rounded-3xl border border-dashed border-bump-border p-5 text-center text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark">
            More content for this week is coming soon.
          </div>
        )}
      </div>

      {featuredArticles.length > 0 && (
        <section className="mt-8" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark">
            This week's reads
          </h2>
          <div className="space-y-3">
            {featuredArticles.map((item) => (
              <ArticleCard key={item!.id} item={item!} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
