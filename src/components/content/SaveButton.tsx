import { useSavedItems } from '../../hooks/useSavedItems';

interface SaveButtonProps {
  itemId: string;
  title: string;
}

/** Bookmark toggle for a single read, used on the article screen. */
export function SaveButton({ itemId, title }: SaveButtonProps) {
  const { isSaved, toggleSaved } = useSavedItems();
  const saved = isSaved(itemId);

  return (
    <button
      type="button"
      onClick={() => toggleSaved(itemId)}
      aria-pressed={saved}
      className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold ${
        saved
          ? 'border-bump-primary bg-bump-primary/10 text-bump-primary dark:text-bump-primary-dark'
          : 'border-bump-border text-bump-text dark:border-bump-border-dark dark:text-bump-text-dark'
      }`}
    >
      <span aria-hidden="true">{saved ? '★' : '☆'}</span>{' '}
      {saved ? 'Saved' : 'Save this'}
      <span className="sr-only"> — {title}</span>
    </button>
  );
}
