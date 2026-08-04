import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { sources, SOURCE_TIER_LABEL, type Source } from '../content';
import { ScreenTitle } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';

const TIER_ORDER: Source['tier'][] = ['gov', 'nhs', 'college', 'charity', 'research'];

export function SourcesScreen() {
  useAutoFocusHeading<HTMLHeadingElement>();

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      <ScreenTitle title="Sources" strap="Everything here comes from somewhere. Here’s where." />

      <Note tone="calm" title="How this is built">
        Every recommendation is checked against a named source before it goes in. Where evidence is
        uncertain, that’s stated rather than smoothed over. Where a study has a funding conflict,
        that’s flagged — see the dairy and iodine entries below.
      </Note>

      {TIER_ORDER.map((tier) => {
        const items = sources.filter((s) => s.tier === tier);
        if (items.length === 0) return null;
        return (
          <section key={tier} className="mt-6">
            <h2 className="mb-2 text-[19px] text-mossd">{SOURCE_TIER_LABEL[tier]}</h2>
            <ul className="m-0 list-none p-0">
              {items.map((s) => (
                <li key={s.id} className="border-b border-line py-3 text-[14.5px] last:border-b-0">
                  <span
                    className={`label-mono inline-block rounded px-2 py-0.5 font-normal ${
                      tier === 'research' ? 'bg-mossp text-mossd' : 'bg-clayp text-clay'
                    }`}
                  >
                    {SOURCE_TIER_LABEL[tier]}
                  </span>
                  <div className="mt-1.5">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-semibold underline"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span className="font-semibold">{s.label}</span>
                    )}
                    <div className="text-soft">{s.organisation}</div>
                    {s.caveat && (
                      <em className="mt-1 block text-[13.5px] text-soft">{s.caveat}</em>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
