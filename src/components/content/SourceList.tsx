import { sourceById } from '../../content';

interface SourceListProps {
  sourceIds: string[];
}

export function SourceList({ sourceIds }: SourceListProps) {
  const resolved = sourceIds.map((id) => sourceById.get(id)).filter(Boolean);
  if (resolved.length === 0) return null;

  return (
    <section aria-labelledby="sources-heading" className="mt-6 rounded-2xl border border-bump-border bg-bump-surface p-4 dark:border-bump-border-dark dark:bg-bump-surface-dark">
      <h2 id="sources-heading" className="text-sm font-semibold uppercase tracking-wide text-bump-muted dark:text-bump-muted-dark">
        Where this comes from
      </h2>
      <ul className="mt-3 space-y-3">
        {resolved.map((source) => (
          <li key={source!.id} className="text-sm leading-snug">
            {source!.url ? (
              <a
                href={source!.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-bump-primary underline decoration-1 underline-offset-2 dark:text-bump-primary-dark"
              >
                {source!.label}
              </a>
            ) : (
              <span className="font-medium">{source!.label}</span>
            )}
            <div className="text-bump-muted dark:text-bump-muted-dark">{source!.organisation}</div>
            {source!.note && (
              <div className="mt-0.5 text-xs text-bump-muted dark:text-bump-muted-dark">{source!.note}</div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
