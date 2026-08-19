import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { lossSections, lossIntro } from '../content';
import { SourceList } from '../components/ui/SourceList';
import { RichText } from '../components/ui/RichText';

/**
 * Deliberately quiet and self-contained: no streaks, no checklists, no
 * week context, and never surfaced on the home screen. Reached only when
 * someone goes looking, via Get Help or the footer.
 */
export function LossSupportScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();

  return (
    <main id="main" className="mx-auto max-w-[720px] px-4 pt-8 pb-24">
      <h1 ref={headingRef} tabIndex={-1} className="mb-3 text-[26px] outline-none">
        Pregnancy and baby loss
      </h1>
      <p className="mb-7 border-l-[3px] border-l-moss bg-mossp py-3 pl-4 pr-3 text-[15.5px] leading-relaxed">
        {lossIntro}
      </p>

      {lossSections.map((section) => (
        <section key={section.id} className="mb-8">
          <h2
            className={`mb-2 text-[19px] ${section.tone === 'urgent' ? 'text-alert' : 'text-mossd'}`}
          >
            {section.title}
          </h2>
          <div
            className={
              section.tone === 'urgent'
                ? 'rounded-r-lg border-l-[3px] border-l-alert bg-alertp px-4 py-3'
                : undefined
            }
          >
            <RichText paragraphs={section.body} />
          </div>
          <SourceList sourceIds={section.sourceIds} />
        </section>
      ))}

      <p className="mt-10 border-t border-line pt-5 text-center text-[14.5px] italic text-soft">
        However early, however long ago — what you’re feeling is real, and there is support for it.
      </p>
    </main>
  );
}
