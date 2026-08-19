import { sourceById } from '../../content';

/**
 * Citations are rendered from the shared registry rather than inline text,
 * so a source can be corrected in one place and every entry that cites it
 * updates. Funding conflicts and "background only" notes travel with the
 * source itself and are always shown, as is the review date where the
 * source publishes one. Where it doesn't, nothing is shown rather than a
 * guess — see the methodology page.
 */
export function SourceList({ sourceIds }: { sourceIds: string[] }) {
  const resolved = sourceIds.map((id) => sourceById.get(id)).filter((s) => s !== undefined);
  if (resolved.length === 0) return null;

  return (
    <div className="mt-3 border-t border-line pt-2.5">
      <span className="label-mono text-mossd">Source</span>
      <ul className="mt-1 space-y-1.5">
        {resolved.map((s) => (
          <li key={s.id} className="font-mono text-[10.5px] leading-relaxed text-soft">
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer noopener" className="underline">
                {s.label}
              </a>
            ) : (
              s.label
            )}
            {' — '}
            {s.organisation}
            {s.reviewed && <span className="text-mossd"> · reviewed {s.reviewed}</span>}
            {s.caveat && <em className="mt-0.5 block opacity-90">{s.caveat}</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
