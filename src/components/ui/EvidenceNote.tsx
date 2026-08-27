import { evidenceFor, sourceYear } from '../../content/evidence';
import { sourceUrl } from '../../content/sourceLinks';
import { sourceById } from '../../content/sourceRegistry';

const TONE: Record<string, string> = {
  'uk-guidance': 'border-moss bg-mossp text-mossd',
  'guidance-and-research': 'border-moss bg-mossp text-mossd',
  'research-only': 'border-clay bg-clayp text-clay',
  charity: 'border-line bg-sand text-ink',
};

/**
 * Replaces the bare list of citations at the foot of an entry.
 *
 * The old list answered "where did this come from". It did not answer the
 * question underneath that one — *how much weight should I put on this* —
 * and it rendered "the NHS recommends this" and "one observational study
 * found this" in identical grey type, which quietly implied they were the
 * same kind of claim.
 *
 * So the badge says which of those it is, and the disclosure explains what
 * that means in a sentence rather than making the reader infer it from the
 * word "Nutrients". Funding conflicts travel up from the sources and are
 * shown before the list rather than buried in it — the dairy and iodine
 * paper is National Dairy Council-funded, and that belongs above the fold.
 *
 * Collapsed by default. Someone reading about heartburn at 2am does not need
 * a paragraph on evidence tiers, but they should be one tap from it.
 */
export function EvidenceNote({ sourceIds }: { sourceIds: string[] }) {
  const sources = sourceIds.map((id) => sourceById.get(id)).filter((s) => s !== undefined);
  const evidence = evidenceFor(sources);
  if (!evidence) return null;

  return (
    <details className="mt-3 border-t border-line pt-2.5">
      {/* min-h-11: the row was 26px tall, so the evidence label on every entry
          in the library was a target you had to aim at. */}
      <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-2 [&::-webkit-details-marker]:hidden">
        <span
          className={`label-mono rounded-full border px-2.5 py-1 font-normal ${TONE[evidence.strength]}`}
        >
          {evidence.label}
        </span>
        {evidence.newestYear && (
          <span className="font-mono text-[0.65625rem] text-soft">{evidence.newestYear}</span>
        )}
        {evidence.caveats.length > 0 && (
          <span className="font-mono text-[0.65625rem] text-clay">
            {evidence.caveats.length === 1 ? 'has a caveat' : `${evidence.caveats.length} caveats`}
          </span>
        )}
        {/* mossd, not moss: at 10.5px this needs 4.5:1 and moss gives 4.19. */}
        <span className="ml-auto font-mono text-[0.65625rem] text-mossd underline">
          Why we say this
        </span>
      </summary>

      <p className="mb-0 mt-2.5 text-[0.875rem] leading-relaxed text-soft">{evidence.meaning}</p>

      {evidence.caveats.length > 0 && (
        <ul className="mt-2.5 list-none p-0">
          {evidence.caveats.map((c) => (
            <li
              key={c}
              className="mb-1.5 border-l-[3px] border-l-clay bg-clayp px-3 py-2 text-[0.84375rem] leading-relaxed"
            >
              {c}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-2.5 space-y-1.5">
        {sources.map((s) => {
          const url = sourceUrl(s);
          const year = sourceYear(s);
          return (
            <li key={s.id} className="font-mono text-[0.65625rem] leading-relaxed text-soft">
              {url ? (
                <a href={url} target="_blank" rel="noreferrer noopener" className="underline">
                  {s.label}
                  <span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens the source in a new tab)</span>
                </a>
              ) : (
                s.label
              )}
              {' — '}
              {s.organisation}
              {s.reviewed ? (
                <span className="text-mossd"> · reviewed {s.reviewed}</span>
              ) : year ? null : (
                <span className="text-soft"> · no date published</span>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
