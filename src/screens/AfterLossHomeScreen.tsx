import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { afterLossIntro, afterLossSections } from '../content/afterLoss';
import { EvidenceNote } from '../components/ui/EvidenceNote';
import { RichText } from '../components/ui/RichText';

/**
 * Home, in support-after-loss mode.
 *
 * Nothing on this screen counts, tracks, prompts, congratulates or asks a
 * question. No streak, no checklist, no week, no due date. The "trying
 * again" section sits behind a deliberate extra tap so that nobody meets it
 * before they are looking for it.
 */
export function AfterLossHomeScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const [openGuarded, setOpenGuarded] = useState(false);

  const visible = afterLossSections.filter((s) => !s.guarded);
  const guarded = afterLossSections.filter((s) => s.guarded);

  return (
    <main id="main" className="mx-auto max-w-[680px] px-4 pt-8 pb-24">
      <h1 ref={headingRef} tabIndex={-1} className="mb-3 text-[1.5625rem] outline-none">
        Support after loss
      </h1>
      <p className="mb-8 border-l-[3px] border-l-moss bg-mossp py-3 pl-4 pr-3 text-[0.96875rem] leading-relaxed">
        {afterLossIntro}
      </p>

      {visible.map((section) => (
        <section key={section.id} className="mb-8">
          <h2 className="mb-2 text-[1.1875rem] text-mossd">{section.title}</h2>
          <RichText paragraphs={section.body} />
          <EvidenceNote sourceIds={section.sourceIds} />
        </section>
      ))}

      {guarded.map((section) =>
        openGuarded ? (
          <section key={section.id} className="mb-8">
            <h2 className="mb-2 text-[1.1875rem] text-mossd">{section.title}</h2>
            <RichText paragraphs={section.body} />
            <EvidenceNote sourceIds={section.sourceIds} />
          </section>
        ) : (
          <button
            key={section.id}
            type="button"
            onClick={() => setOpenGuarded(true)}
            className="mb-8 min-h-11 w-full rounded-lg border border-line px-4 py-3 text-[0.9375rem] text-soft"
          >
            {section.title} — tap if you want to read this
          </button>
        ),
      )}

      <div className="border-t border-line pt-6 text-[0.90625rem] text-soft">
        <Link to="/journal" className="underline">
          Your memories and journal
        </Link>
        {' · '}
        <Link to="/loss" className="underline">
          About pregnancy and baby loss
        </Link>
        {' · '}
        <Link to="/settings" className="underline">
          Settings
        </Link>
      </div>
    </main>
  );
}
