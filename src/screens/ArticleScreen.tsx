import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { contentItemById } from '../content';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useStreak } from '../hooks/useStreak';
import { SourceList } from '../components/content/SourceList';
import { SaveButton } from '../components/content/SaveButton';

export function ArticleScreen() {
  const { articleId } = useParams<{ articleId: string }>();
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { markArticleViewed, recordEngagementToday, viewedArticleIds, awardBadge } = useStreak();
  const item = articleId ? contentItemById.get(articleId) : undefined;

  useEffect(() => {
    if (!item) return;
    recordEngagementToday();
    markArticleViewed(item.id);
  }, [item, recordEngagementToday, markArticleViewed]);

  useEffect(() => {
    if (viewedArticleIds.length >= 10) {
      awardBadge('ten-articles');
    }
  }, [viewedArticleIds.length, awardBadge]);

  if (!item) {
    return <Navigate to="/today" replace />;
  }

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      {item.isRedFlag && (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          If this applies to you right now, contact your midwife, GP, or maternity unit — don't wait.
        </div>
      )}

      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark">
        {item.title}
      </h1>

      <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-bump-text dark:text-bump-text-dark">
        {item.body}
      </p>

      <div className="mt-5">
        <SaveButton itemId={item.id} title={item.title} />
      </div>

      <SourceList sourceIds={item.sourceIds} />
    </main>
  );
}
