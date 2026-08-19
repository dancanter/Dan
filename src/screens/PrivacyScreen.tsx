import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { privacySections, URGENT_DISCLAIMER } from '../content';
import { RichText } from '../components/ui/RichText';

export function PrivacyScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();

  return (
    <main id="main" className="mx-auto max-w-[700px] px-4 pt-6 pb-24">
      <h1 ref={headingRef} tabIndex={-1} className="mb-3 text-[25px] outline-none">
        Privacy, in plain English
      </h1>
      <p className="mb-7 border-l-[3px] border-l-moss bg-mossp py-3 pl-4 pr-3 text-[15.5px] leading-relaxed">
        No account, no server, no analytics on anything you record. Everything stays on this device.
      </p>

      {privacySections.map((section) => (
        <section key={section.id} className="mb-8">
          <h2 className="mb-2 text-[19px] text-mossd">{section.title}</h2>
          <RichText paragraphs={section.body} />
        </section>
      ))}

      <p className="mt-8 border-t border-line pt-4 text-[13.5px] leading-relaxed text-soft">
        {URGENT_DISCLAIMER}
      </p>
      <p className="mt-3 text-[14px]">
        <Link to="/methodology" className="underline">
          How the content is sourced and checked →
        </Link>
      </p>
    </main>
  );
}
