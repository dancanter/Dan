import { sourceUrl } from '../../content/sourceLinks';
import { sourceById } from '../../content/sourceRegistry';

/**
 * Citations are rendered from the shared registry rather than inline text,
 * so a source can be corrected in one place and every entry that cites it
 * updates. Funding conflicts and "background only" notes travel with the
 * source itself and are always shown, as is the review date where the
 * source publishes one. Where it doesn't, nothing is shown rather than a
 * guess — see the methodology page.
 *
 * Where the citation carries a DOI or PMC id, the label becomes a link to it,
 * so a claim can be checked rather than just attributed.
 */
export function SourceList({ sourceIds }: { sourceIds: string[] }) {
  const resolved = sourceIds.map((id) => sourceById.get(id)).filter((s) => s !== undefined);
  if (resolved.length === 0) return null;

  return (
    <div className="mt-3 border-t border-line pt-2.5">
      <span className="label-mono text-mossd">Source</span>
      <ul className="mt-1 space-y-1.5">
        {resolved.map((s) => {
          const url = sourceUrl(s);
          return (
            <li key={s.id} className="font-mono text-[0.65625rem] leading-relaxed text-soft">
              {/* Padding on an inline link grows the hit area without changing
                  the line box — the citation rows measured 12px tall. */}
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="py-1.5 underline"
                >
                  {s.label}
                  <span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens the source in a new tab)</span>
                </a>
              ) : (
                s.label
              )}
              {' — '}
              {s.organisation}
              {s.reviewed && <span className="text-mossd"> · reviewed {s.reviewed}</span>}
              {s.caveat && <em className="mt-0.5 block opacity-90">{s.caveat}</em>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
