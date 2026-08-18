import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { equitySections, equityIntro } from '../content';
import { SourceList } from '../components/ui/SourceList';
import { RichText } from '../components/ui/RichText';

/**
 * Its own route, like loss support — but discoverable rather than hidden.
 * Half this page is things a reader can do (self-refer, ask for an
 * interpreter, ask for a second opinion, go back and ask again), and those
 * are useless if nobody finds them. So it's linked from Get Help, Guidance
 * and the footer, and still kept off the daily screens, where a mortality
 * ratio has no business appearing next to a checklist.
 */
export function EquityScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();

  return (
    <main id="main" className="mx-auto max-w-[720px] px-4 pt-8 pb-24">
      <h1 ref={headingRef} tabIndex={-1} className="mb-3 text-[26px] outline-none">
        Inequalities in maternity care
      </h1>
      <p className="mb-7 border-l-[3px] border-l-moss bg-mossp py-3 pl-4 pr-3 text-[15.5px] leading-relaxed">
        {equityIntro}
      </p>

      {equitySections.map((section) => (
        <section key={section.id} className="mb-8">
          <h2
            className={`mb-2 text-[19px] ${section.tone === 'action' ? 'text-clay' : 'text-mossd'}`}
          >
            {section.title}
          </h2>
          <div
            className={
              section.tone === 'action'
                ? 'rounded-r-lg border-l-[3px] border-l-clay bg-clayp px-4 py-3'
                : undefined
            }
          >
            <RichText paragraphs={section.body} />
          </div>
          <SourceList sourceIds={section.sourceIds} />
        </section>
      ))}

      <p className="mt-10 border-t border-line pt-5 text-center text-[14.5px] italic text-soft">
        Knowing the pattern exists is not the same as being at its mercy. Asking again is always
        allowed.
      </p>
    </main>
  );
}
