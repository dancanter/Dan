import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { symptoms, symptomById } from '../content';
import { ScreenTitle } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';
import { SourceList } from '../components/ui/SourceList';

export function BodyScreen() {
  useAutoFocusHeading<HTMLHeadingElement>();
  const [openId, setOpenId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const selected = openId ? symptomById.get(openId) : undefined;

  function choose(id: string) {
    setOpenId(id);
    // Move focus to the detail panel so keyboard and screen-reader users
    // land on the content they just asked for, not back at the top.
    requestAnimationFrame(() => detailRef.current?.focus());
  }

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      <ScreenTitle title="My Body" strap="Tap a symptom for what’s happening and what helps." />

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 p-0">
        {symptoms.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => choose(s.id)}
              aria-pressed={openId === s.id}
              className={`min-h-11 w-full rounded-xl border px-2.5 py-3.5 text-center text-sm transition-transform hover:-translate-y-0.5 hover:border-moss hover:bg-mossp ${
                openId === s.id ? 'border-moss bg-mossp' : 'border-line bg-card'
              }`}
            >
              <span className="mb-1.5 block text-[22px]" aria-hidden="true">
                {s.icon}
              </span>
              {s.name}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div
          ref={detailRef}
          tabIndex={-1}
          className="mt-4 rounded-xl border border-line bg-card p-4 outline-none"
        >
          <h2 className="text-[19px]">
            <span aria-hidden="true">{selected.icon} </span>
            {selected.name}
          </h2>
          <div className="my-3 rounded-lg bg-mossp px-3.5 py-3 text-[15px]">
            <b className="text-mossd">Why it happens:</b> {selected.why}
          </div>
          <p className="text-[15px]">
            <b>What helps:</b> {selected.help}
          </p>
          <Note tone="warn" title="Worth knowing">
            {selected.flag}
          </Note>
          <SourceList sourceIds={selected.sourceIds} />
        </div>
      )}

      <Note tone="warn" title="When a symptom needs checking">
        This section covers the common, expected stuff. If something feels sudden, severe, or just
        wrong —{' '}
        <Link to="/help" className="font-semibold text-alert underline">
          see Get Help
        </Link>
        . Trust your instinct over any list.
      </Note>
    </main>
  );
}
