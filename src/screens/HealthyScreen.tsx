import { useState } from 'react';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useProgress } from '../hooks/useProgress';
import { GUIDE_SECTIONS, guidesInSection, type Guide } from '../content';
import { ScreenTitle } from '../components/ui/SectionHeading';
import { SourceList } from '../components/ui/SourceList';
import { RichText } from '../components/ui/RichText';

function GuideCard({ guide, onOpen }: { guide: Guide; onOpen: (id: string) => void }) {
  const border =
    guide.emphasis === 'warn'
      ? 'border-alert/40 bg-alertp'
      : guide.emphasis === 'calm'
        ? 'border-moss/40 bg-mossp'
        : 'border-line bg-card';

  return (
    <details
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

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      <ScreenTitle
        title="Healthy Pregnancy"
        strap="Everything that helps, and nothing that doesn’t."
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
            ? `${sections.reduce((n, s) => n + s.items.length, 0)} entries match “${query}”`
            : `${readGuideIds.length} entries read so far`}
        </p>
      </div>

      {sections.length === 0 && (
        <p className="text-[15px] italic text-soft">
          Nothing matches that yet. Try a different word — or check My Body for symptoms.
        </p>
      )}

      {sections.map((section) => (
        <section key={section.id} className="mb-7">
          <h2 className="mb-1 text-[19px] text-mossd">{section.label}</h2>
          <p className="mb-3 text-[14px] text-soft">{section.blurb}</p>
          {section.items.map((g) => (
            <GuideCard key={g.id} guide={g} onOpen={markGuideRead} />
          ))}
        </section>
      ))}
    </main>
  );
}
