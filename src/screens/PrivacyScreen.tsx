import { Link } from 'react-router-dom';
import { privacySections, URGENT_DISCLAIMER } from '../content';
import { Screen } from '../components/ui/Screen';
import { RichText } from '../components/ui/RichText';

export function PrivacyScreen() {
  return (
    <Screen
      title="Privacy, in plain English"
      lede="No account, no server, no analytics on anything you record. Everything stays on this device."
      ledeTone="quiet"
      width="reading"
    >
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
    </Screen>
  );
}
