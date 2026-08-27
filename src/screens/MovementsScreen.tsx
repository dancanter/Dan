import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useMovements,
  activeHours,
  MOVEMENT_KINDS,
  MOVEMENT_STRENGTHS,
  type MovementKind,
  type MovementStrength,
} from '../hooks/useMovements';
import { useMaternityUnit } from '../hooks/useMaternityUnit';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Screen } from '../components/ui/Screen';

/**
 * The Movement Journal — explicitly not a kick counter.
 *
 * Three rules hold this screen together, and none of them are cosmetic:
 *  1. Nothing on screen is a number, a total, a target or a verdict.
 *  2. The call-your-unit line is permanent, not conditional on what was
 *     logged — the app must never appear to decide a pattern is fine.
 *  3. It never suggests waiting, cold drinks, lying down, or a home doppler.
 */
export function MovementsScreen() {
  const { entries, log, remove } = useMovements();
  const { dialable, unitName, hasNumber } = useMaternityUnit();
  const [kind, setKind] = useState<MovementKind>('kick');
  const [strength, setStrength] = useState<MovementStrength>('usual');
  const [note, setNote] = useState('');
  const [justLogged, setJustLogged] = useState(false);

  const hours = activeHours(entries);
  const recent = entries.slice(0, 20);

  return (
    <Screen title="Movement journal" width="reading">
      <p className="mb-4 text-[0.9375rem] leading-relaxed text-soft">
        This journal helps you remember your baby’s usual pattern. It cannot check whether your baby
        is well.
      </p>

      {/* Permanent, unconditional, and above everything else on the screen. */}
      <div className="mb-6 rounded-xl border-2 border-alert bg-alertp px-4 py-3.5">
        <p className="m-0 mb-2.5 text-[0.96875rem] font-semibold text-alert">
          Movements feel different? Contact your maternity unit now.
        </p>
        <a
          href={hasNumber ? `tel:${dialable}` : 'tel:111'}
          className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-alert px-4 text-[1.0625rem] font-semibold text-white no-underline"
        >
          {hasNumber ? `Call ${unitName ?? 'your maternity unit'}` : 'Call 111'}
        </a>
        <p className="m-0 mt-2 text-[0.8125rem] text-ink/70">
          Any hour, day or night. Don’t wait to see if it changes, and don’t use a home doppler.
        </p>
      </div>

      <SectionHeading>Log a movement</SectionHeading>
      <fieldset className="mb-3 border-0 p-0">
        <legend className="mb-1.5 text-sm font-semibold">What did it feel like?</legend>
        <div className="flex flex-wrap gap-2">
          {MOVEMENT_KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              aria-pressed={kind === k.value}
              onClick={() => setKind(k.value)}
              className={`min-h-11 rounded-lg border px-3.5 text-[0.875rem] font-medium ${
                kind === k.value ? 'border-moss bg-mossp text-mossd' : 'border-line text-soft'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-3 border-0 p-0">
        <legend className="mb-1.5 text-sm font-semibold">How did it compare to usual?</legend>
        <div className="flex flex-wrap gap-2">
          {MOVEMENT_STRENGTHS.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={strength === s.value}
              onClick={() => setStrength(s.value)}
              className={`min-h-11 rounded-lg border px-3.5 text-[0.875rem] font-medium ${
                strength === s.value ? 'border-moss bg-mossp text-mossd' : 'border-line text-soft'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label htmlFor="movement-note" className="mb-1.5 block text-sm font-semibold">
        Anything to remember (optional)
      </label>
      <input
        id="movement-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. after lunch, very wriggly"
        className="mb-3 min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
      />

      <button
        type="button"
        onClick={() => {
          log(kind, strength, note);
          setNote('');
          setJustLogged(true);
        }}
        className="min-h-[52px] w-full rounded-xl bg-ink px-4 text-[1rem] font-semibold text-paper"
      >
        Add to journal
      </button>

      {/* Confirms the record was saved. Says nothing about what it means. */}
      <p aria-live="polite" className="mt-2 min-h-[20px] text-[0.875rem] text-mossd">
        {justLogged ? 'Saved.' : ''}
      </p>

      {strength === 'faint' && (
        <p className="mt-2 rounded-r-lg border-l-[3px] border-l-alert bg-alertp px-4 py-3 text-[0.9375rem]">
          You’ve noted this felt fainter than usual. That is worth a phone call, not a wait — use
          the button at the top of this screen.
        </p>
      )}

      <SectionHeading>When your baby tends to be active</SectionHeading>
      {hours.size === 0 ? (
        <p className="text-[0.9375rem] italic text-soft">
          Nothing logged in the last week yet. There’s no right amount to log — a few entries at
          different times of day is enough to start seeing a shape.
        </p>
      ) : (
        <>
          <ul
            className="m-0 flex list-none flex-wrap gap-1 p-0"
            aria-label="Hours with movements logged in the last 7 days"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <li
                key={h}
                className={`flex h-9 w-9 items-center justify-center rounded-md border font-mono text-[0.6875rem] ${
                  hours.has(h) ? 'border-moss bg-moss text-white' : 'border-line text-soft'
                }`}
              >
                <span className="sr-only">
                  {hours.has(h) ? 'Movements logged around' : 'Nothing logged around'}{' '}
                </span>
                {String(h).padStart(2, '0')}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.84375rem] italic text-soft">
            Hours you’ve logged something in the last 7 days. This is a memory aid, not an
            assessment — a quiet hour here means nothing on its own.
          </p>
        </>
      )}

      <SectionHeading>Recent entries</SectionHeading>
      {recent.length === 0 ? (
        <p className="text-[0.9375rem] italic text-soft">Nothing yet.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {recent.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 border-b border-line py-2.5"
            >
              <span className="text-[0.9375rem]">
                <strong className="font-mono text-[0.8125rem] text-clay">
                  {new Date(e.at).toLocaleString('en-GB', {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
                {' — '}
                {MOVEMENT_KINDS.find((k) => k.value === e.kind)?.label}
                {', '}
                {MOVEMENT_STRENGTHS.find((s) => s.value === e.strength)?.label?.toLowerCase()}
                {e.note && <span className="block text-[0.875rem] text-soft">{e.note}</span>}
              </span>
              <button
                type="button"
                onClick={() => remove(e.id)}
                className="min-h-11 shrink-0 px-2 font-mono text-[0.6875rem] text-soft underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 border-t border-line pt-4 text-[0.84375rem] leading-relaxed text-soft">
        There is no target number of movements and no need to count kicks — NHS and RCOG guidance
        are explicit about this.{' '}
        <Link to="/help/movements" className="underline">
          What to do if the pattern changes
        </Link>
      </p>
    </Screen>
  );
}
