import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import {
  GUIDE_SECTIONS,
  GUIDE_PHASES,
  guides,
  guidesInSection,
  searchGuides,
  searchSymptoms,
  urgentMatchFor,
  type Guide,
} from '../content';
import { Screen } from '../components/ui/Screen';
import { EvidenceNote } from '../components/ui/EvidenceNote';
import { RichText } from '../components/ui/RichText';
import { SaveForMidwife } from '../components/ui/SaveForMidwife';

function GuideCard({
  guide,
  onOpen,
  defaultOpen,
}: {
  guide: Guide;
  onOpen: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const border =
    guide.emphasis === 'warn'
      ? 'border-alert/40 bg-alertp'
      : guide.emphasis === 'calm'
        ? 'border-moss/40 bg-mossp'
        : 'border-line bg-card';

  return (
    <details
      id={`guide-${guide.id}`}
      open={defaultOpen}
      className={`mb-3 rounded-xl border ${border}`}
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) onOpen(guide.id);
      }}
    >
      {/* The padding lives on the summary rather than the card, so the whole
          row is tappable. It was on the card, which made the actual target a
          25px strip in the middle of a 52px box — the rest looked pressable
          and did nothing. This is the library's main browsing surface. */}
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2.5 px-4 py-3.5 font-display text-[1rem] font-semibold [&::-webkit-details-marker]:hidden">
        {guide.title}
        <span className="font-mono text-moss" aria-hidden="true">
          ›
        </span>
      </summary>
      <div className="px-4 pb-3.5">
        <RichText paragraphs={guide.body} />
        {guide.lists?.map((list) => (
          <div key={list.title ?? 'list'} className="mt-3">
            {list.title && <p className="label-mono mb-1.5 text-mossd">{list.title}</p>}
            <ul className="m-0 list-none p-0">
              {list.items.map((item) => (
                <li key={item} className="mb-1 flex gap-2 text-[0.9375rem]">
                  <span aria-hidden="true" className="text-moss">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {guide.table && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {guide.table.head.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="label-mono border-b border-line p-2 text-left text-mossd"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} className="border-b border-line p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <EvidenceNote sourceIds={guide.sourceIds} />
        <SaveForMidwife topic={guide.title} />
      </div>
    </details>
  );
}

export function HealthyScreen() {
  const { markGuideRead, readGuideIds } = useProgress();
  const [params] = useSearchParams();
  // `?q=` lets another screen hand its query over — the food lookup sends
  // anything not in its short list here rather than to a dead end.
  const [query, setQuery] = useState(params.get('q') ?? '');
  // `?open=<id>` lets the home screen link straight to an entry rather than
  // dropping someone at the top of a 108-item library to go hunting.
  const openId = params.get('open');
  const scrolledTo = useRef<string | null>(null);

  useEffect(() => {
    if (!openId || scrolledTo.current === openId) return;
    const el = document.getElementById(`guide-${openId}`);
    if (!el) return;
    scrolledTo.current = openId;
    markGuideRead(openId);
    el.scrollIntoView({ block: 'center' });
    el.querySelector('summary')?.focus();
  }, [openId, markGuideRead]);

  const q = query.trim();

  // Searching and browsing want different shapes. A question deserves ranked
  // answers, best first; browsing wants the hierarchy. Forcing search results
  // back into phase-and-section order buries the best match under whichever
  // phase happens to sort first.
  const results = q ? searchGuides(q) : [];
  const symptomHits = q ? searchSymptoms(q) : [];
  const urgent = q ? urgentMatchFor(q) : undefined;

  const sections = GUIDE_SECTIONS.map((section) => ({
    ...section,
    items: guidesInSection(section.id),
  })).filter((s) => s.items.length > 0);

  // Guidance now runs past pregnancy into birth, recovery and feeding, so
  // it's grouped by phase — otherwise the list is one undifferentiated wall.
  const phases = GUIDE_PHASES.map((phase) => ({
    ...phase,
    sections: sections.filter((s) => s.phase === phase.id),
  })).filter((p) => p.sections.length > 0);

  return (
    <Screen
      title="Guidance"
      lede="Everything that helps, and nothing that doesn’t — pregnancy through to feeding."
    >
      <div className="mb-5">
        <label htmlFor="guide-search" className="mb-1.5 block text-sm font-semibold">
          Search the guidance
        </label>
        <input
          id="guide-search"
          type="search"
          value={query}
          placeholder="Ask it however you'd say it — “can I eat brie?”"
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
        />
        {/* The urgent offer is announced here as well as shown below it.
            Without this, someone using a screen reader typed "bleeding" and
            heard "2 entries match" — the one part of the screen that matters
            was silent, because it sits outside the live region. */}
        <p aria-live="polite" className="mt-1.5 font-mono text-[0.65625rem] text-soft">
          {q
            ? `${urgent ? 'If this is happening now, there’s help below. ' : ''}${results.length} ${results.length === 1 ? 'entry matches' : 'entries match'} “${query}”`
            : `${guides.length} entries · ${readGuideIds.length} read so far`}
        </p>
      </div>

      {/* A reading list is a bad answer to "bleeding". If the search looks like
          someone describing what is happening to them, the urgent route goes
          above the results — offered, not forced, since they may equally be
          reading ahead.

          The entry's title is quoted rather than folded into a sentence:
          lowercasing a first-person title mid-clause produced "don't read up
          on it — i'm bleeding is something to get checked", which is both
          ungrammatical and slightly absurd at the moment it is read. */}
      {urgent && (
        <div className="mb-5 rounded-xl border-2 border-alert bg-alertp px-4 py-3.5">
          <p className="m-0 text-[0.9375rem] font-semibold">Is this happening now?</p>
          <p className="mb-1 mt-1.5 text-[0.9375rem] font-semibold italic leading-snug">
            “{urgent.title}”
          </p>
          <p className="mb-2.5 mt-1.5 text-[0.90625rem] leading-relaxed">
            If that’s you right now, this is one to get checked rather than read about.
          </p>
          <Link
            to={`/help/${urgent.id}`}
            className="inline-flex min-h-11 items-center rounded-lg border-2 border-alert px-4 text-[0.9375rem] font-semibold text-alert no-underline"
          >
            What to do now →
          </Link>
        </div>
      )}

      {/* The symptom explorer is a separate screen, so searching "heartburn"
          used to return nothing — the app had the answer and never offered it. */}
      {symptomHits.length > 0 && (
        <div className="mb-5">
          <p className="label-mono mb-2 text-mossd">In My Body</p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {symptomHits.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/body?symptom=${s.id}`}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-moss bg-mossp px-3.5 text-[0.90625rem] font-semibold text-mossd no-underline"
                >
                  <span aria-hidden="true">{s.icon}</span>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {q && results.length === 0 && symptomHits.length === 0 && (
        <p className="text-[0.9375rem] italic text-soft">
          Nothing matches that yet. Try fewer words — or check{' '}
          <Link to="/body" className="underline">
            My Body
          </Link>{' '}
          for symptoms, or{' '}
          <Link to="/help" className="font-semibold underline">
            Get help
          </Link>{' '}
          if something feels wrong now.
        </p>
      )}

      {/* Ranked, flat, best first — the shape a question deserves. */}
      {q &&
        results.map(({ guide }) => (
          <GuideCard key={guide.id} guide={guide} onOpen={markGuideRead} />
        ))}

      {!q && (
        <p className="mb-6 rounded-xl border border-line bg-sand px-4 py-3 text-[0.90625rem]">
          Not everyone gets the same standard of maternity care in the UK.{' '}
          <Link to="/inequalities" className="font-semibold underline">
            Inequalities in maternity care →
          </Link>
        </p>
      )}

      {!q &&
        phases.map((phase) => (
          <section key={phase.id} className="mb-9">
            <div className="mb-4 border-b-2 border-ink pb-1.5">
              <h2 className="mb-0.5 text-[1.375rem]">{phase.label}</h2>
              <p className="m-0 text-[0.875rem] italic text-mossd">{phase.blurb}</p>
            </div>
            {phase.sections.map((section) => (
              <section key={section.id} className="mb-7">
                <h3 className="mb-1 text-[1.125rem] text-mossd">{section.label}</h3>
                <p className="mb-3 text-[0.875rem] text-soft">{section.blurb}</p>
                {section.items.map((g) => (
                  <GuideCard
                    key={g.id}
                    guide={g}
                    onOpen={markGuideRead}
                    defaultOpen={g.id === openId}
                  />
                ))}
              </section>
            ))}
          </section>
        ))}
    </Screen>
  );
}
