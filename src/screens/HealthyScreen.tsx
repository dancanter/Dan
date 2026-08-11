import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useProgress } from '../hooks/useProgress';
import { GUIDE_SECTIONS, GUIDE_PHASES, guides, guidesInSection, type Guide } from '../content';
import { ScreenTitle } from '../components/ui/SectionHeading';
import { SourceList } from '../components/ui/SourceList';
import { RichText } from '../components/ui/RichText';

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
      className={`mb-3 rounded-xl border px-4 py-3.5 ${border}`}
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) onOpen(guide.id);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2.5 font-display text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
        {guide.title}
        <span className="font-mono text-moss" aria-hidden="true">
          ›
        </span>
      </summary>
      <div className="mt-3">
        <RichText paragraphs={guide.body} />
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
        <SourceList sourceIds={guide.sourceIds} />
      </div>
    </details>
  );
}

export function HealthyScreen() {
  useAutoFocusHeading<HTMLHeadingElement>();
  const { markGuideRead, readGuideIds } = useProgress();
  const [query, setQuery] = useState('');
  const [params] = useSearchParams();
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

  const q = query.trim().toLowerCase();
  const sections = GUIDE_SECTIONS.map((section) => ({
    ...section,
    items: guidesInSection(section.id).filter(
      (g) =>
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.body.some((p) => p.toLowerCase().includes(q)),
    ),
  })).filter((s) => s.items.length > 0);

  // Guidance now runs past pregnancy into birth, recovery and feeding, so
  // it's grouped by phase — otherwise the list is one undifferentiated wall.
  const phases = GUIDE_PHASES.map((phase) => ({
    ...phase,
    sections: sections.filter((s) => s.phase === phase.id),
  })).filter((p) => p.sections.length > 0);

  const totalMatches = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      <ScreenTitle
        title="Guidance"
        strap="Everything that helps, and nothing that doesn’t — pregnancy through to feeding."
      />

      <div className="mb-5">
        <label htmlFor="guide-search" className="mb-1.5 block text-sm font-semibold">
          Search the guidance
        </label>
        <input
          id="guide-search"
          type="search"
          value={query}
          placeholder="e.g. cheese, sleep, paracetamol"
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
        />
        <p aria-live="polite" className="mt-1.5 font-mono text-[10.5px] text-soft">
          {q
            ? `${totalMatches} ${totalMatches === 1 ? 'entry matches' : 'entries match'} “${query}”`
            : `${guides.length} entries · ${readGuideIds.length} read so far`}
        </p>
      </div>

      {phases.length === 0 && (
        <p className="text-[15px] italic text-soft">
          Nothing matches that yet. Try a different word — or check My Body for symptoms.
        </p>
      )}

      {phases.map((phase) => (
        <section key={phase.id} className="mb-9">
          <div className="mb-4 border-b-2 border-ink pb-1.5">
            <h2 className="mb-0.5 text-[22px]">{phase.label}</h2>
            <p className="m-0 text-[14px] italic text-mossd">{phase.blurb}</p>
          </div>
          {phase.sections.map((section) => (
            <section key={section.id} className="mb-7">
              <h3 className="mb-1 text-[18px] text-mossd">{section.label}</h3>
              <p className="mb-3 text-[14px] text-soft">{section.blurb}</p>
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
    </main>
  );
}
