import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { sources, sourceUrl, sourceYear, usesOf, SOURCE_TIER_LABEL, type Source } from '../content';
import { Screen } from '../components/ui/Screen';
import { Note } from '../components/ui/Note';

/**
 * 122 sources, in a shape you can actually get through.
 *
 * As one flat list this screen was 16,000 pixels tall on a phone — which is
 * not a reading experience, it is a bibliography that happens to be scrollable.
 * The content was right and the shape was wrong.
 *
 * Two changes. Search, because the question people bring here is usually about
 * one specific claim rather than the whole list. And a section per kind of
 * source, closed until asked for, so the screen opens as five headings you can
 * read in a glance instead of a wall you have to scroll past.
 *
 * The third change is the one that matters most: every source now names the
 * entries that rest on it. The link previously ran one way — each entry listed
 * its sources, and no source listed its entries — which meant this screen could
 * tell you what had been read but not what it had been used for.
 */

const TIER_ORDER: Source['tier'][] = ['gov', 'nhs', 'college', 'charity', 'research'];

/** Research is visually distinct from guidance, deliberately and consistently. */
const TIER_STYLE = (tier: Source['tier']) =>
  tier === 'research' ? 'bg-mossp text-mossd' : 'bg-clayp text-clay';

function SourceEntry({ source }: { source: Source }) {
  const url = sourceUrl(source);
  const uses = usesOf(source.id);

  return (
    <li className="border-b border-line py-3.5 text-[0.90625rem] last:border-b-0">
      <span className="flex flex-wrap items-center gap-2">
        <span
          className={`label-mono inline-block rounded px-2 py-0.5 font-normal ${TIER_STYLE(source.tier)}`}
        >
          {SOURCE_TIER_LABEL[source.tier]}
        </span>
        {/* The year the citation itself states, never a guess. */}
        {!source.reviewed && sourceYear(source) && (
          <span className="font-mono text-[0.6875rem] text-soft">{sourceYear(source)}</span>
        )}
        {!url && (
          // Said plainly rather than left to be inferred from the absence of a
          // link. Someone checking a claim should know the difference between
          // "no link yet" and "nothing to check".
          <span className="rounded bg-sand/60 px-1.5 py-0.5 font-mono text-[0.6875rem] text-soft">
            not yet linked
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
            {source.label}
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens the source in a new tab)</span>
          </a>
        ) : (
          <span className="font-semibold">{source.label}</span>
        )}
        <div className="text-soft">{source.organisation}</div>
        {source.reviewed && (
          <div className="font-mono text-[0.6875rem] text-mossd">reviewed {source.reviewed}</div>
        )}
        {source.caveat && (
          <em className="mt-1 block text-[0.84375rem] text-soft">{source.caveat}</em>
        )}

        {uses.length > 0 && (
          <div className="mt-2">
            <p className="label-mono mb-1 text-soft">What this is used for</p>
            <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-0.5 p-0">
              {uses.map((u) => (
                <li key={u.to}>
                  <Link
                    to={u.to}
                    className={`inline-flex min-h-11 items-center text-[0.84375rem] underline ${
                      u.urgent ? 'font-semibold text-alert' : 'text-mossd'
                    }`}
                  >
                    {u.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}

export function SourcesScreen() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const openable = sources.filter((s) => sourceUrl(s)).length;
  const dated = sources.filter((s) => sourceYear(s) !== undefined).length;

  const matches = useMemo(
    () =>
      q
        ? sources.filter((s) =>
            `${s.label} ${s.organisation} ${SOURCE_TIER_LABEL[s.tier]}`.toLowerCase().includes(q),
          )
        : [],
    [q],
  );

  return (
    <Screen title="Sources" lede="Everything here comes from somewhere. Here’s where.">
      <Note tone="calm" title="How this is built">
        Every recommendation is checked against a named source before it goes in. Where evidence is
        uncertain, that’s stated rather than smoothed over. Where a study has a funding conflict,
        that’s flagged — see the dairy and iodine entries, or read the{' '}
        <Link to="/methodology" className="font-semibold underline">
          full process
        </Link>
        .
      </Note>

      <div className="mb-5 mt-4">
        <label htmlFor="source-search" className="mb-1.5 block text-sm font-semibold">
          Find a source
        </label>
        <input
          id="source-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="NHS, NICE, a study author…"
          autoComplete="off"
          className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
        />
      </div>

      {q ? (
        <section aria-live="polite">
          <p className="label-mono mb-2 text-mossd">
            {matches.length === 0
              ? 'Nothing matches that'
              : `${matches.length} of ${sources.length}`}
          </p>
          {matches.length === 0 ? (
            <p className="text-[0.9375rem] leading-relaxed text-soft">
              Try the organisation instead — most entries are listed under NHS, NICE, SACN, RCOG or
              the name of a study’s first author.
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {matches.map((s) => (
                <SourceEntry key={s.id} source={s} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {TIER_ORDER.map((tier) => {
            const items = sources.filter((s) => s.tier === tier);
            if (items.length === 0) return null;
            return (
              <details key={tier} className="mb-2.5 rounded-xl border border-line bg-card">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2.5 px-4 py-3.5 font-display text-[1rem] font-semibold [&::-webkit-details-marker]:hidden">
                  <span>
                    {SOURCE_TIER_LABEL[tier]}
                    <span className="ml-2 font-sans text-[0.84375rem] font-normal text-soft">
                      {items.length}
                    </span>
                  </span>
                  <span className="font-mono text-moss" aria-hidden="true">
                    ›
                  </span>
                </summary>
                <ul className="m-0 list-none px-4 pb-2 pt-0">
                  {items.map((s) => (
                    <SourceEntry key={s.id} source={s} />
                  ))}
                </ul>
              </details>
            );
          })}

          <p className="mt-5 text-[0.875rem] leading-relaxed text-soft">
            <strong>
              {openable} of these {sources.length} open directly
            </strong>
            , because the citation carries a permanent reference number. The rest are named in full
            but not yet linked — a link that goes to the wrong page is worse than no link, so each
            one gets checked by hand before it goes in.
          </p>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-soft">
            {dated} state a date. The others are standing NHS and charity pages that don’t publish
            one in the citation, and a date is never guessed to fill the gap. An old date isn’t the
            same as out of date — the oldest thing here is a 1999 set of workplace regulations,
            which is exactly as current as the day it was written.
          </p>
        </>
      )}
    </Screen>
  );
}
