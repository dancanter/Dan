import { Link, useParams } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useMaternityUnit } from '../hooks/useMaternityUnit';
import { urgentSymptoms, urgentById, URGENT_DISCLAIMER, helpTopics } from '../content';
import { CallButton } from '../components/help/CallButton';
import { ReadAloud } from '../components/help/ReadAloud';
import { SourceList } from '../components/ui/SourceList';
import { RichText, RichLine } from '../components/ui/RichText';

/**
 * The most important screen in the app, and deliberately the plainest.
 *
 * No search box — nobody types while frightened. No animation, no
 * illustration, no colour beyond what distinguishes a 999 case from a
 * maternity-unit case. Works offline: all content ships with the bundle and
 * the phone number is on the device.
 */

function Disclaimer() {
  return (
    <p className="mt-8 border-t border-line pt-4 text-[13.5px] leading-relaxed text-soft">
      {URGENT_DISCLAIMER}
    </p>
  );
}

export function GetHelpScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { hasNumber, unitName } = useMaternityUnit();

  return (
    <main id="main" className="mx-auto max-w-[640px] px-4 pt-6 pb-24">
      <h1 ref={headingRef} tabIndex={-1} className="mb-1.5 text-[26px] outline-none">
        Get help
      </h1>
      <p className="mb-5 text-[15px] text-soft">
        Tap whichever is closest to what’s happening. You will not be wasting anyone’s time.
      </p>

      <a
        href="tel:999"
        className="mb-4 flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-alert px-4 text-[17px] font-semibold text-alert no-underline"
      >
        Call 999 — emergency
      </a>

      <ul className="m-0 list-none p-0">
        {urgentSymptoms.map((s) => (
          <li key={s.id} className="mb-2">
            <Link
              to={`/help/${s.id}`}
              className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 text-[16.5px] font-medium text-ink no-underline"
            >
              {s.title}
              <span className="font-mono text-soft" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-line bg-sand px-4 py-3.5">
        {hasNumber ? (
          <p className="m-0 text-[14px]">
            Your maternity unit: <strong>{unitName ?? 'saved'}</strong>.{' '}
            <Link to="/help/number" className="underline">
              Change it
            </Link>
          </p>
        ) : (
          <p className="m-0 text-[14px]">
            <Link to="/help/number" className="font-semibold underline">
              Save your maternity unit’s number
            </Link>{' '}
            — it’s on your handheld notes, and it means one tap instead of hunting for it later.
          </p>
        )}
      </div>

      <h2 className="mt-9 mb-3 text-[19px]">Also worth reading</h2>
      {helpTopics.map((t) => (
        <details key={t.id} className="mb-2.5 rounded-xl border border-line bg-card px-4 py-3">
          <summary className="cursor-pointer list-none font-display text-[15.5px] font-semibold [&::-webkit-details-marker]:hidden">
            {t.title}
          </summary>
          <div className="mt-2.5">
            <RichText paragraphs={t.body} />
            <SourceList sourceIds={t.sourceIds} />
          </div>
        </details>
      ))}

      <div className="mt-8 border-t border-line pt-5 text-[14px] text-soft">
        <Link to="/loss" className="underline">
          Pregnancy and baby loss
        </Link>
        {' · '}
        <Link to="/inequalities" className="underline">
          If you don’t feel you’re being listened to
        </Link>
        {' · '}
        <Link to="/changed" className="underline">
          My pregnancy has changed
        </Link>
      </div>

      <Disclaimer />
    </main>
  );
}

export function UrgentDetailScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { symptomId } = useParams();
  const symptom = symptomId ? urgentById.get(symptomId) : undefined;

  if (!symptom) {
    return (
      <main id="main" className="mx-auto max-w-[640px] px-4 pt-6 pb-24">
        <h1 ref={headingRef} tabIndex={-1} className="mb-3 text-[24px] outline-none">
          Not found
        </h1>
        <Link to="/help" className="underline">
          Back to Get help
        </Link>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-[640px] px-4 pt-6 pb-24">
      <Link to="/help" className="mb-4 inline-block font-mono text-[12px] text-soft underline">
        ← Get help
      </Link>

      <h1 ref={headingRef} tabIndex={-1} className="mb-5 text-[23px] leading-snug outline-none">
        {symptom.title}
      </h1>

      {/* 1. What to do now — always first, always large. */}
      <h2 className="label-mono mb-2 text-mossd">What to do now</h2>
      <p className="mb-3 text-[17.5px] font-medium leading-snug">{symptom.now}</p>
      <CallButton action={symptom.action} />
      <ReadAloud now={symptom.now} why={symptom.why} />

      {symptom.dont && (
        <ul className="mt-4 mb-0 list-none p-0">
          {symptom.dont.map((d) => (
            <li key={d} className="mb-1.5 border-l-[3px] border-l-alert pl-3 text-[15px]">
              {d}
            </li>
          ))}
        </ul>
      )}

      {/* 2. Why this matters. */}
      <h2 className="label-mono mt-8 mb-2 text-mossd">Why this matters</h2>
      <p className="m-0 text-[15.5px] leading-relaxed">
        <RichLine text={symptom.why} />
      </p>

      {/* 3. Reassurance — only where it is true. */}
      {symptom.reassurance && (
        <>
          <h2 className="label-mono mt-8 mb-2 text-mossd">Worth knowing</h2>
          <p className="m-0 rounded-r-lg border-l-[3px] border-l-moss bg-mossp px-4 py-3 text-[15.5px] leading-relaxed">
            {symptom.reassurance}
          </p>
        </>
      )}

      <SourceList sourceIds={symptom.sourceIds} />
      <Disclaimer />
    </main>
  );
}

export function MaternityNumberScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { unitName, unitPhone, setUnit } = useMaternityUnit();

  return (
    <main id="main" className="mx-auto max-w-[640px] px-4 pt-6 pb-24">
      <Link to="/help" className="mb-4 inline-block font-mono text-[12px] text-soft underline">
        ← Get help
      </Link>
      <h1 ref={headingRef} tabIndex={-1} className="mb-2 text-[24px] outline-none">
        Your maternity unit
      </h1>
      <p className="mb-5 text-[15px] text-soft">
        Saved on this device only, and never sent anywhere. It works with no signal. The triage or
        labour ward number is usually on the front of your handheld notes.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = (form.elements.namedItem('unit-name') as HTMLInputElement).value;
          const phone = (form.elements.namedItem('unit-phone') as HTMLInputElement).value;
          setUnit(name, phone);
          form.reset();
        }}
      >
        <label htmlFor="unit-name" className="mb-1.5 block text-sm font-semibold">
          Hospital or unit name
        </label>
        <input
          id="unit-name"
          name="unit-name"
          defaultValue={unitName ?? ''}
          placeholder="e.g. Leeds General Infirmary triage"
          className="mb-4 min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
        />

        <label htmlFor="unit-phone" className="mb-1.5 block text-sm font-semibold">
          Phone number
        </label>
        <input
          id="unit-phone"
          name="unit-phone"
          type="tel"
          inputMode="tel"
          defaultValue={unitPhone ?? ''}
          placeholder="e.g. 0113 000 0000"
          className="mb-4 min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
        />

        <button
          type="submit"
          className="min-h-[52px] w-full rounded-xl bg-ink px-4 text-[16px] font-semibold text-paper"
        >
          Save
        </button>
      </form>

      {unitPhone && (
        <p aria-live="polite" className="mt-4 text-[14px] text-mossd">
          Saved: {unitName ?? 'your unit'} — {unitPhone}
        </p>
      )}

      <Disclaimer />
    </main>
  );
}
