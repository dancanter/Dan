import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useSavedItems } from '../hooks/useSavedItems';
import { contentItemById } from '../content';
import { ArticleCard } from '../components/content/ArticleCard';

export function SavedScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { savedIds } = useSavedItems();

  // A saved id can outlive the content it pointed at if an article is renamed
  // between releases, so resolve defensively rather than rendering a blank card.
  const items = savedIds.map((id) => contentItemById.get(id)).filter((item) => item !== undefined);

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark"
      >
        Saved reads
      </h1>
      <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">
        The things you wanted to come back to.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-bump-border p-5 text-center text-sm text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark">
          Nothing saved yet. Tap “Save this” on any read and it'll be waiting here.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item!.id}>
              <ArticleCard item={item!} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm">
        <Link
          to="/progress"
          className="font-semibold text-bump-primary underline dark:text-bump-primary-dark"
        >
          ← Back to your progress
        </Link>
      </p>
    </main>
  );
}
