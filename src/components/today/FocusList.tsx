import type { FocusItem } from '../../content';
import { sourceById } from '../../content';

interface Props {
  items: FocusItem[];
  week: number;
  isTicked: (key: string) => boolean;
  onToggle: (key: string) => void;
}

function shortSource(sourceIds: string[]): string {
  const first = sourceIds.map((id) => sourceById.get(id)).find((s) => s !== undefined);
  return first ? first.organisation.split(',')[0].split('—')[0].trim() : '';
}

export function FocusList({ items, week, isTicked, onToggle }: Props) {
  const doneCount = items.filter((i) => isTicked(`${week}:${i.id}`)).length;

  return (
    <>
      <ul className="m-0 list-none p-0">
        {items.map((item) => {
          const key = `${week}:${item.id}`;
          const done = isTicked(key);
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 border-b border-line py-3 last:border-b-0"
            >
              <button
                type="button"
                aria-pressed={done}
                onClick={() => onToggle(key)}
                className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-[1.6px] border-moss transition-transform ${
                  done ? 'scale-105 bg-moss' : 'bg-transparent hover:bg-mossp'
                }`}
              >
                <svg
                  width="13"
                  height="10"
                  viewBox="0 0 13 10"
                  fill="none"
                  aria-hidden="true"
                  className={done ? 'opacity-100' : 'opacity-0'}
                >
                  <path
                    d="M1 5l3.5 3.5L12 1"
                    stroke="#fff"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="sr-only">
                  {done ? 'Mark as not done' : 'Mark as done'}: {item.text}
                </span>
              </button>
              <span className={`flex-1 text-[15.5px] ${done ? 'text-ink/45 line-through' : ''}`}>
                {item.text}
                <span className="mt-1 block font-mono text-[10px] text-soft opacity-75">
                  {shortSource(item.sourceIds)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="sr-only">
        {doneCount} of {items.length} focus items ticked this week.
      </p>
    </>
  );
}
