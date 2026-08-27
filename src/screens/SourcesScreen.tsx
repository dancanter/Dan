import { Link } from 'react-router-dom';
import { sources, sourceUrl, sourceYear, SOURCE_TIER_LABEL, type Source } from '../content';
import { Screen } from '../components/ui/Screen';
import { Note } from '../components/ui/Note';

const TIER_ORDER: Source['tier'][] = ['gov', 'nhs', 'college', 'charity', 'research'];

export function SourcesScreen() {
  const openable = sources.filter((s) => sourceUrl(s)).length;
  const dated = sources.filter((s) => sourceYear(s) !== undefined).length;

  return (
    <Screen title="Sources" lede="Everything here comes from somewhere. Here’s where.">
      <Note tone="calm" title="How this is built">
        Every recommendation is checked against a named source before it goes in. Where evidence is
        uncertain, that’s stated rather than smoothed over. Where a study has a funding conflict,
        that’s flagged — see the dairy and iodine entries below, or read the{' '}
        <Link to="/methodology" className="font-semibold underline">
          full process
        </Link>
        .
      </Note>

      <p className="mt-4 text-[0.875rem] leading-relaxed text-soft">
        {openable} of these {sources.length} open directly, because the citation carries a permanent
        reference number. The rest are named in full but not yet linked — a link that goes to the
        wrong page is worse than no link, so each one gets checked by hand before it goes in.
      </p>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-soft">
        {dated} state a date. The others are standing NHS and charity pages that don’t publish one
        in the citation, and a date is never guessed to fill the gap. Note that an old date isn’t
        the same as out of date — the oldest thing here is a 1999 set of workplace regulations,
        which is exactly as current as the day it was written.
      </p>

      {TIER_ORDER.map((tier) => {
        const items = sources.filter((s) => s.tier === tier);
        if (items.length === 0) return null;
        return (
          <section key={tier} className="mt-6">
            <h2 className="mb-2 text-[1.1875rem] text-mossd">{SOURCE_TIER_LABEL[tier]}</h2>
            <ul className="m-0 list-none p-0">
              {items.map((s) => {
                const url = sourceUrl(s);
                return (
                  <li
                    key={s.id}
                    className="border-b border-line py-3 text-[0.90625rem] last:border-b-0"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={`label-mono inline-block rounded px-2 py-0.5 font-normal ${
                          tier === 'research' ? 'bg-mossp text-mossd' : 'bg-clayp text-clay'
                        }`}
                      >
                        {SOURCE_TIER_LABEL[tier]}
                      </span>
                      {/* The year the citation itself states, never a guess. */}
                      {!s.reviewed && sourceYear(s) && (
                        <span className="font-mono text-[0.6875rem] text-soft">
                          {sourceYear(s)}
                        </span>
                      )}
                    </span>
                    <div className="mt-1.5">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-semibold underline"
                        >
                          {s.label}
                          <span aria-hidden="true"> ↗</span>
                          <span className="sr-only"> (opens the source in a new tab)</span>
                        </a>
                      ) : (
                        <span className="font-semibold">{s.label}</span>
                      )}
                      <div className="text-soft">{s.organisation}</div>
                      {s.reviewed && (
                        <div className="font-mono text-[0.6875rem] text-mossd">
                          reviewed {s.reviewed}
                        </div>
                      )}
                      {s.caveat && (
                        <em className="mt-1 block text-[0.84375rem] text-soft">{s.caveat}</em>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </Screen>
  );
}
