import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersistedState } from '../../hooks/usePersistedState';
import { DEMO_KEY, clearDemo } from '../../lib/demoData';

/**
 * Says, on every screen and without a way to hide it, that the pregnancy on
 * display is invented.
 *
 * Not dismissible, and deliberately so. A banner someone can close is a
 * banner that stops being true the moment they close it — and the failure it
 * guards against is somebody scrolling a made-up journal believing it is
 * theirs, or reading a week-28 screen as advice about their own week.
 *
 * It is a strip rather than a card because it appears above every screen in
 * the app, including the urgent ones, and nothing should push a red-flag
 * heading further down the page than it already is.
 */
export function DemoBanner() {
  const [demo] = usePersistedState<boolean>(DEMO_KEY, false);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  if (!demo) return null;

  async function handleClear() {
    setClearing(true);
    await clearDemo();
    navigate('/', { replace: true });
  }

  return (
    <div className="border-b-2 border-ink bg-ink px-4 py-2 text-paper">
      <div className="mx-auto flex max-w-[920px] flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="m-0 font-mono text-[0.6875rem] leading-snug">
          <strong>Example data.</strong> This pregnancy is made up, so the app can be looked at
          without setting one up.
        </p>
        <button
          type="button"
          onClick={handleClear}
          disabled={clearing}
          className="min-h-11 shrink-0 font-mono text-[0.6875rem] underline disabled:opacity-70"
        >
          {clearing ? 'Clearing…' : 'Clear it and start properly'}
        </button>
      </div>
    </div>
  );
}
