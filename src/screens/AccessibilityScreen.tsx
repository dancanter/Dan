import { Link } from 'react-router-dom';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { RichText } from '../components/ui/RichText';
import { accessibilityIntro, accessibilitySections } from '../content/accessibility';

/**
 * The accessibility statement, as a page in the app rather than a file in the
 * repository.
 *
 * Somebody who needs it is using the app, not reading its source. Putting it
 * in docs/ would have been easier and would have reached nobody who needed
 * it.
 */
export function AccessibilityScreen() {
  return (
    <Screen
      title="Accessibility"
      lede={accessibilityIntro}
      ledeTone="quiet"
      width="reading"
      aside={
        <Link
          to="/settings"
          className="inline-flex min-h-11 items-center text-body font-semibold underline"
        >
          Text size, contrast and motion settings
        </Link>
      }
    >
      {accessibilitySections.map((section) => (
        <section key={section.id} className="mb-8">
          <SectionHeading>{section.title}</SectionHeading>
          <RichText paragraphs={section.body} />
        </section>
      ))}
    </Screen>
  );
}
