import type { ReactNode } from 'react';
import { useAutoFocusHeading } from '../../hooks/useAutoFocusHeading';

/**
 * The page shell every screen sits in.
 *
 * Before this, each screen wrote its own `<main>` and `<h1>`, and they had
 * drifted: six different max-widths (620, 640, 680, 700, 720, 780), three
 * heading sizes, three top paddings, and two unrelated ways of styling the
 * opening line. Nothing was wrong on any single screen — but moving between
 * them, the page kept subtly resizing under you, which is the opposite of calm.
 *
 * So width is a choice from three, made on what the content *is* rather than
 * how much of it there happens to be:
 *
 *   focus    one decision, few words. Nothing to scan, so a narrow measure.
 *   reading  continuous prose. Sized to keep lines near 65 characters.
 *   default  lists and cards, which need the room.
 *
 * The heading also lives here rather than in each screen, because focus
 * management used to be the screen's job and eight of them silently got it
 * wrong — they called the hook and dropped the ref it returned, so the effect
 * ran and focused nothing. There is no ref to forget now.
 */
const WIDTH = {
  focus: 'max-w-[620px]',
  reading: 'max-w-[700px]',
  default: 'max-w-[780px]',
} as const;

interface Props {
  title: string;
  /**
   * The line under the heading. `plain` is a quiet subtitle; `quiet` is the
   * bordered block used where a screen needs to set a tone before anyone
   * reads further — loss, inequalities, privacy.
   */
  lede?: ReactNode;
  ledeTone?: 'plain' | 'quiet';
  width?: keyof typeof WIDTH;
  /** Rendered between the heading and the body — a week picker, a filter. */
  aside?: ReactNode;
  children: ReactNode;
}

export function Screen({
  title,
  lede,
  ledeTone = 'plain',
  width = 'default',
  aside,
  children,
}: Props) {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();

  return (
    <main id="main" className={`mx-auto px-4 pt-6 pb-24 ${WIDTH[width]}`}>
      <header className={lede ? 'mb-6' : 'mb-5'}>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mb-2 border-b-2 border-ink pb-2 text-[1.5625rem] outline-none"
        >
          {title}
        </h1>
        {lede &&
          (ledeTone === 'quiet' ? (
            <p className="m-0 border-l-[3px] border-l-moss bg-mossp py-3 pl-4 pr-3 text-[0.96875rem] leading-relaxed">
              {lede}
            </p>
          ) : (
            <p className="m-0 text-[0.9375rem] leading-relaxed text-soft">{lede}</p>
          ))}
      </header>
      {aside}
      {children}
    </main>
  );
}
