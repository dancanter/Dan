import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePregnancyStatus } from '../hooks/usePregnancyStatus';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useProgress } from '../hooks/useProgress';
import { useJournal } from '../hooks/useJournal';
import { Screen } from '../components/ui/Screen';

/**
 * "My pregnancy has changed."
 *
 * Four options and nothing else. The app never asks what happened, when, or
 * why — there is no field for it anywhere in the codebase, so there is
 * nothing to ask and nothing that could later be shown back to someone.
 *
 * Everything here is reversible except deletion, and deletion offers an
 * export first. The wording of these four options is the part that most
 * needs review by Sands or the Miscarriage Association before launch.
 */
export function PregnancyChangedScreen() {
  const navigate = useNavigate();
  const { setStatus } = usePregnancyStatus();
  const { resetProfile } = usePregnancyProfile();
  const { resetProgress } = useProgress();
  const { entries, resetJournal } = useJournal();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function exportData() {
    // Offered before deletion, never instead of it. Some people want these
    // later even when they don't want them now.
    const blob = new Blob([JSON.stringify({ journal: entries }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'field-notes-my-entries.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function deleteEverything() {
    resetProfile();
    resetProgress();
    resetJournal();
    setStatus('active');
    navigate('/', { replace: true });
  }

  return (
    <Screen
      title="My pregnancy has changed"
      lede="You don’t have to tell us anything about what happened. Choose whichever of these is closest, and you can change your mind later."
      width="focus"
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setStatus('paused');
            navigate('/today');
          }}
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-left"
        >
          <span className="block font-display text-[17px] font-semibold">
            Pause everything for now
          </span>
          <span className="mt-1 block text-[14.5px] text-soft">
            Tracking and prompts stop. Nothing is deleted, and you can turn it back on whenever you
            want.
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus('after-loss');
            navigate('/today');
          }}
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-left"
        >
          <span className="block font-display text-[17px] font-semibold">
            Change to support after loss
          </span>
          <span className="mt-1 block text-[14.5px] text-soft">
            Removes the week counter, due date, development updates and milestones. The app becomes
            a quiet place with what happens now, support, and your memories.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-left"
        >
          <span className="block font-display text-[17px] font-semibold">
            Delete my pregnancy data
          </span>
          <span className="mt-1 block text-[14.5px] text-soft">
            Removes everything from this device permanently.
          </span>
        </button>

        <Link
          to="/today"
          className="block w-full rounded-xl border border-line px-4 py-4 text-center text-[16px] font-medium text-soft no-underline"
        >
          Nothing — go back
        </Link>
      </div>

      {confirmingDelete && (
        <div className="mt-7 rounded-xl border border-alert/50 bg-alertp px-4 py-4">
          <h2 className="mb-2 text-[17px] text-alert">Before you delete</h2>
          <p className="mb-3 text-[15px] leading-relaxed">
            Some people want these later, even if they don’t want them now. You can save a copy to
            your device first — nothing is sent anywhere.
          </p>
          <button
            type="button"
            onClick={exportData}
            className="mb-3 min-h-11 w-full rounded-lg border border-ink px-3 text-[15px] font-semibold"
          >
            Save a copy first
          </button>
          <button
            type="button"
            onClick={deleteEverything}
            className="min-h-11 w-full rounded-lg bg-alert px-3 text-[15px] font-semibold text-white"
          >
            Delete everything permanently
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="mt-2 min-h-11 w-full rounded-lg px-3 text-[14px] text-soft"
          >
            Cancel
          </button>
        </div>
      )}

      <p className="mt-10 border-t border-line pt-5 text-[14px] leading-relaxed text-soft">
        Whatever you choose, your due date and any anniversaries will pass without a notification
        unless you ask for one.
      </p>
    </Screen>
  );
}
