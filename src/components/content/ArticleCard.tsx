import { Link } from 'react-router-dom';
import type { ContentItem } from '../../content';

const CATEGORY_LABELS: Record<string, string> = {
  iron: 'Iron & anaemia',
  dairy: 'Dairy',
  omega3: 'Omega-3',
  'fruit-veg-fibre': 'Fruit, veg & fibre',
  'weight-body-image': 'Weight & body image',
  'hormones-symptoms': "What's happening in your body",
  'stress-mental-health': 'Stress & wellbeing',
  supplements: 'Supplements',
  'general-reassurance': 'Reassurance',
};

interface ArticleCardProps {
  item: ContentItem;
}

export function ArticleCard({ item }: ArticleCardProps) {
  return (
    <Link
      to={`/article/${item.id}`}
      className="block min-h-11 rounded-2xl border border-bump-border bg-bump-surface p-4 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5 dark:border-bump-border-dark dark:bg-bump-surface-dark"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-bump-accent dark:text-bump-accent-dark">
        {CATEGORY_LABELS[item.category] ?? item.category}
      </span>
      <h3 className="mt-1 text-base font-semibold text-bump-text dark:text-bump-text-dark">{item.title}</h3>
      <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">{item.tip}</p>
      {item.isRedFlag && (
        <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
          When to seek help
        </span>
      )}
    </Link>
  );
}
