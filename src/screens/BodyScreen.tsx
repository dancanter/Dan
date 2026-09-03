import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { symptoms, symptomById } from '../content';
import { Screen } from '../components/ui/Screen';
import { Note } from '../components/ui/Note';
import { EvidenceNote } from '../components/ui/EvidenceNote';
import { SaveForMidwife } from '../components/ui/SaveForMidwife';

export function BodyScreen() {
  const [params] = useSearchParams();
  // `?symptom=<id>` so a search result can open the entry directly, rather
  // than dropping someone on a grid of sixteen tiles to find it again.
  const linkedId = params.get('symptom');
  const [openId, setOpenId] = useState<string | null>(linkedId);
  const [filter, setFilter] = useState('');
  const detailRef = useRef<HTMLDivElement>(null);
  const selected = openId ? symptomById.get(openId) : undefined;

  const q = filter.trim().toLowerCase();
  const shown = q
    ? symptoms.filter((s) => `${s.name} ${s.why} ${s.help}`.toLowerCase().includes(q))
    : symptoms;

  useEffect(() => {
    if (linkedId && symptomById.has(linkedId)) setOpenId(linkedId);
  }, [linkedId]);

  function choose(id: string) {
    setOpenId(id);
    // Move focus to the detail panel so keyboard and screen-reader users
    // land on the content they just asked for, not back at the top.
    requestAnimationFrame(() => detailRef.current?.focus());
  }

  return (
    <Screen title="My Body" lede="What’s happening, why, and when it’s worth getting checked.">
      {/* Sixteen tiles is browsable but not searchable, and the word someone
          has in their head ("acid", "swollen ankles") is often not the word on
          the tile. Filtering matches the description too, so it finds them. */}
      <div className="mb-4">
        <label htmlFor="symptom-search" className="mb-1.5 block text-sm font-semibold">
          What are you experiencing?
        </label>
        <input
          id="symptom-search"
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Or just tap one below"
          autoComplete="off"
          className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
        />
      </div>

      {shown.length === 0 && (
        <p className="mb-4 text-[0.9375rem] leading-relaxed text-soft">
          Nothing here matches that. This section covers the everyday symptoms — if what you’re
          feeling is sudden or severe,{' '}
          <Link to="/help" className="font-semibold text-alert underline">
            Get help
          </Link>{' '}
          is the right place.
        </p>
      )}

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 p-0">
        {shown.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => choose(s.id)}
              aria-pressed={openId === s.id}
              className={`min-h-11 w-full rounded-xl border px-2.5 py-3.5 text-center text-sm transition-transform hover:-translate-y-0.5 hover:border-moss hover:bg-mossp ${
                openId === s.id ? 'border-moss bg-mossp' : 'border-line bg-card'
              }`}
            >
              <span className="mb-1.5 block text-[1.375rem]" aria-hidden="true">
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
          <h2 className="text-[1.1875rem]">
            <span aria-hidden="true">{selected.icon} </span>
            {selected.name}
          </h2>

          {/* Three labelled parts, always in this order, always the same
              words. Someone scanning at 3am should be able to jump straight to
              the third without reading the first two — which is why "when to
              get it checked" is a heading rather than a "worth knowing" aside,
              and why it says what it is instead of hinting at it. */}
          <div className="my-3 rounded-lg bg-mossp px-3.5 py-3">
            <p className="label-mono mb-1 text-mossd">Why it happens</p>
            <p className="m-0 text-[0.9375rem] leading-relaxed">{selected.why}</p>
          </div>

          <div className="mb-3">
            <p className="label-mono mb-1 text-mossd">What may help</p>
            <p className="m-0 text-[0.9375rem] leading-relaxed">{selected.help}</p>
          </div>

          <div className="mb-3 rounded-lg border-l-[3px] border-l-alert bg-alertp px-3.5 py-3">
            <p className="label-mono mb-1 text-alert">When to get it checked</p>
            <p className="m-0 text-[0.9375rem] leading-relaxed">{selected.flag}</p>
            {/* Offered on every symptom, not only the alarming ones. The
                explorer describes the ordinary version of a thing; whether
                this is the ordinary version is not something it can know. */}
            <Link
              to="/help"
              className="mt-2 inline-flex min-h-11 items-center text-[0.90625rem] font-semibold text-alert underline"
            >
              If this is happening right now, start here
            </Link>
          </div>
          <EvidenceNote sourceIds={selected.sourceIds} />
          <SaveForMidwife
            topic={selected.name}
            prompt="Want to mention this at your next appointment?"
          />
        </div>
      )}

      {/* Reworded once each entry gained its own "when to get it checked".
          Two versions of the same warning on one screen reads as neither
          being important. This is now the part the entries cannot say: that
          the list itself is not the authority. */}
      <Note tone="warn" title="Trust your instinct over any list">
        Everything here describes the ordinary version of a thing. If yours feels sudden, severe or
        simply not right, that is reason enough —{' '}
        <Link to="/help" className="font-semibold text-alert underline">
          Get help
        </Link>{' '}
        doesn’t need you to be sure first.
      </Note>
    </Screen>
  );
}
