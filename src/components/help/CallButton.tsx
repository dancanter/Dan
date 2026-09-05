import { Link } from 'react-router-dom';
import { useMaternityUnit } from '../../hooks/useMaternityUnit';
import type { UrgentAction } from '../../content/urgent';

/**
 * The single most important control in the app. Deliberately large, plain,
 * and always in the same place at the top of an urgent screen.
 *
 * Every one of these carries a border in the same colour as its fill. It is
 * invisible in normal use and it is the whole button in Windows high-contrast
 * mode, where the OS overrides background and text colours: a filled button
 * with no border has no shape left, and the most important control in the app
 * becomes a line of text. Measured — the 999 button on the Get help list
 * survived a forced-colours pass for exactly this reason, and these three did
 * not.
 *
 * If no maternity number has been stored it does not hide or disable — it
 * still offers 111 and 999, which always work, and offers to save the number
 * afterwards rather than before. Nobody should hit a setup step mid-panic.
 */
export function CallButton({ action }: { action: UrgentAction }) {
  const { unitName, unitPhone, dialable, hasNumber } = useMaternityUnit();

  if (action === 'emergency') {
    return (
      <a
        href="tel:999"
        className="flex min-h-[60px] w-full items-center justify-center rounded-xl border-2 border-alert bg-alert px-4 text-[1.1875rem] font-semibold text-white no-underline"
      >
        Call 999
      </a>
    );
  }

  if (action === 'mental-health') {
    return (
      <div className="space-y-2">
        <a
          href="tel:111"
          className="flex min-h-[60px] w-full items-center justify-center rounded-xl border-2 border-ink bg-ink px-4 text-[1.1875rem] font-semibold text-paper no-underline"
        >
          Call 111 — mental health option
        </a>
        <a
          href="tel:116123"
          className="flex min-h-11 w-full items-center justify-center rounded-lg border border-line px-4 text-[0.9375rem] font-semibold text-ink no-underline"
        >
          Samaritans — 116 123, free, 24/7
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hasNumber ? (
        <a
          href={`tel:${dialable}`}
          className="flex min-h-[60px] w-full flex-col items-center justify-center rounded-xl border-2 border-ink bg-ink px-4 text-paper no-underline"
        >
          <span className="text-[1.1875rem] font-semibold">
            Call {unitName ?? 'your maternity unit'}
          </span>
          <span className="font-mono text-[0.8125rem] opacity-80">{unitPhone}</span>
        </a>
      ) : (
        <>
          <a
            href="tel:111"
            className="flex min-h-[60px] w-full items-center justify-center rounded-xl border-2 border-ink bg-ink px-4 text-[1.1875rem] font-semibold text-paper no-underline"
          >
            Call 111
          </a>
          <p className="m-0 text-center text-[0.84375rem] text-soft">
            Your maternity unit is the better number to call.{' '}
            <Link to="/help/number" className="underline">
              Save it for next time
            </Link>{' '}
            — it’s on your handheld notes.
          </p>
        </>
      )}
    </div>
  );
}
