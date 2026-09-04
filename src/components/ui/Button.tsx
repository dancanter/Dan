import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * One button, three intents.
 *
 * The app had eight different spellings of "primary button" — some with a
 * hover state and some without, at four different text sizes and three
 * paddings. None of them looked wrong on its own; together they made the app
 * feel assembled rather than designed, which is exactly the tell the brief
 * describes.
 *
 * Press feedback is not here. It lives in one rule in index.css that covers
 * every button in the app, including the ones this component does not wrap —
 * a shared component only helps where it is used, and consistency should not
 * depend on remembering to use it.
 */

type Intent = 'primary' | 'secondary' | 'quiet';

const INTENT: Record<Intent, string> = {
  // The one action a screen most wants you to take. At most one per view.
  primary: 'bg-moss text-white hover:bg-mossd active:bg-mossd border border-moss',
  // Everything else that is still a real action.
  secondary: 'bg-card text-ink border border-line hover:border-moss hover:bg-mossp',
  // Reversible, low-stakes, or a way out. Reads as a control, not a shout.
  quiet: 'bg-transparent text-soft border border-transparent hover:text-ink hover:bg-mossp',
};

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-[0.9375rem] font-semibold no-underline disabled:cursor-not-allowed disabled:opacity-50';

interface Common {
  intent?: Intent;
  /** Fills the width of its container — the usual shape on a phone. */
  full?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  intent = 'secondary',
  full,
  className = '',
  children,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`${BASE} ${INTENT[intent]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * The same shape, for something that navigates.
 *
 * A link that looks like a button should still be a link — it belongs in the
 * browser's history, opens in a new tab on a long press, and announces itself
 * as a link. Styling it as a button does not change any of that.
 */
export function ButtonLink({
  to,
  intent = 'secondary',
  full,
  className = '',
  children,
}: Common & { to: string }) {
  return (
    <Link to={to} className={`${BASE} ${INTENT[intent]} ${full ? 'w-full' : ''} ${className}`}>
      {children}
    </Link>
  );
}
