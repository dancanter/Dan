import { Link } from 'react-router-dom';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';

/**
 * Why this exists.
 *
 * Short on purpose. A page explaining a product's philosophy is usually a
 * warning sign — if the thing needs a manifesto, the thing is not clear
 * enough. This one earns its place only by answering the question a careful
 * person actually asks before trusting a pregnancy app: who made this, what
 * is it for, and what will it not do.
 *
 * Kept separate from the methodology page, which is the long technical
 * version for anyone who wants it.
 */
export function WhyScreen() {
  return (
    <Screen
      title="Why this exists"
      lede="What this app is for, and the things it deliberately doesn’t do."
      width="reading"
    >
      <p className="text-[1rem] leading-relaxed">
        Pregnancy produces an enormous amount of advice. Not all of it is equally useful, and not
        all of it is equally well supported. A lot of it contradicts the rest, and almost none of it
        tells you where it came from.
      </p>
      <p className="text-[1rem] leading-relaxed">
        This app brings together practical pregnancy guidance from trusted UK sources and
        peer-reviewed research, and shows it at the point it becomes useful. Every claim names the
        source it rests on, and you can open{' '}
        <Link to="/sources" className="font-semibold underline">
          the whole list
        </Link>{' '}
        and check for yourself.
      </p>

      <SectionHeading>What it won’t do</SectionHeading>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {[
          [
            'It doesn’t diagnose you.',
            'It can’t know what is happening to you, and never pretends to.',
          ],
          ['It doesn’t score you.', 'No streaks, no points, no badges, no completion.'],
          [
            'It doesn’t ask you to keep up.',
            'Nothing here expires, nothing is missed, and opening it once a month is a perfectly good way to use it.',
          ],
          [
            'It doesn’t collect anything.',
            'What you write stays on your phone. There is no account and nowhere for it to be sent.',
          ],
        ].map(([title, detail]) => (
          <li key={title} className="rounded-xl border border-line bg-card px-4 py-3">
            <p className="m-0 font-semibold">{title}</p>
            <p className="m-0 mt-0.5 text-[0.90625rem] leading-relaxed text-soft">{detail}</p>
          </li>
        ))}
      </ul>

      <SectionHeading>What it’s for</SectionHeading>
      <p className="text-[1rem] leading-relaxed">
        Helping you understand what matters, and know when to get help. If it saves you five minutes
        of searching, or helps you remember what to ask, or makes one urgent decision clearer, it
        has done its job — whether you open it every day or three times in nine months.
      </p>

      <SectionHeading>Who made it</SectionHeading>
      <p className="text-[1rem] leading-relaxed">
        One person, not a hospital. It is an independent project, it is{' '}
        <strong>not clinically reviewed</strong>, and it cannot check whether you or your baby are
        well. If something feels wrong, contact your maternity unit — they would always rather hear
        from you.
      </p>
      <p className="text-[0.90625rem] leading-relaxed text-soft">
        The longer, more technical version of all this — how entries are written, how sources are
        graded, what is still unverified — is on{' '}
        <Link to="/methodology" className="font-semibold underline">
          How this is built
        </Link>
        .
      </p>
    </Screen>
  );
}
