import { Link } from 'react-router-dom';
import { useMaternityUnit } from '../../hooks/useMaternityUnit';
import type { UrgentAction } from '../../content';

/**
 * The single most important control in the app. Deliberately large, plain,
 * and always in the same place at the top of an urgent screen.
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
        className="flex min-h-[60px] w-full items-center justify-center rounded-xl bg-alert px-4 text-[19px] font-semibold text-white no-underline"
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
          className="flex min-h-[60px] w-full items-center justify-center rounded-xl bg-ink px-4 text-[19px] font-semibold text-paper no-underline"
        >
          Call 111 — mental health option
        </a>
        <a
          href="tel:116123"
          className="flex min-h-11 w-full items-center justify-center rounded-lg border border-line px-4 text-[15px] font-semibold text-ink no-underline"
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
          className="flex min-h-[60px] w-full flex-col items-center justify-center rounded-xl bg-ink px-4 text-paper no-underline"
        >
          <span className="text-[19px] font-semibold">
            Call {unitName ?? 'your maternity unit'}
          </span>
          <span className="font-mono text-[13px] opacity-80">{unitPhone}</span>
        </a>
      ) : (
        <>
          <a
            href="tel:111"
            className="flex min-h-[60px] w-full items-center justify-center rounded-xl bg-ink px-4 text-[19px] font-semibold text-paper no-underline"
          >
            Call 111
          </a>
          <p className="m-0 text-center text-[13.5px] text-soft">
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
