import { Link } from 'react-router-dom';
import { methodologySections } from '../content/methodology';
import { sources, SOURCE_TIER_LABEL, type Source } from '../content';
import { Screen } from '../components/ui/Screen';
import { RichText } from '../components/ui/RichText';
import { Note } from '../components/ui/Note';

const TIER_ORDER: Source['tier'][] = ['gov', 'nhs', 'college', 'charity', 'research'];

export function MethodologyScreen() {
  const withCaveats = sources.filter((s) => s.caveat).length;

  return (
    <Screen
      title="How this is built"
      lede="The process behind every entry, not just the sources list."
      width="reading"
    >
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="rounded-xl border border-line bg-card px-3 py-3 text-center">
            <div className="font-display text-[22px] font-bold text-mossd">
              {sources.filter((s) => s.tier === tier).length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-soft">
              {SOURCE_TIER_LABEL[tier]}
            </div>
          </div>
        ))}
      </div>

      {withCaveats > 0 && (
        <Note tone="plain" title="Flagged, not filtered">
          {withCaveats} source{withCaveats === 1 ? '' : 's'} currently carr
          {withCaveats === 1 ? 'ies' : 'y'} a funding or framing caveat — see{' '}
          <Link to="/sources" className="font-semibold underline">
            Sources
          </Link>{' '}
          for exactly which, and the "Conflicts of interest" section below for how that’s handled.
        </Note>
      )}

      {methodologySections.map((section) => (
        <section key={section.id} className="mt-7">
          <h2 className="mb-2 text-[19px] text-mossd">{section.title}</h2>
          <RichText paragraphs={section.body} />
        </section>
      ))}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-5">
        <Link
          to="/sources"
          className="min-h-11 rounded-lg border border-line bg-card px-4 py-2.5 text-sm font-semibold text-mossd"
        >
          See every source →
        </Link>
        <Link
          to="/healthy"
          className="min-h-11 rounded-lg border border-line bg-card px-4 py-2.5 text-sm font-semibold text-mossd"
        >
          Browse the guidance →
        </Link>
      </div>
    </Screen>
  );
}
