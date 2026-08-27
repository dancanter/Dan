import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePregnancyStatus } from '../hooks/usePregnancyStatus';
import { useJournal } from '../hooks/useJournal';
import { useMovements } from '../hooks/useMovements';
import { Screen } from '../components/ui/Screen';
import { wipeAllLocalData, summariseStoredData, type StoredSummary } from '../lib/wipe';

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
  const { entries } = useJournal();
  const { entries: movements } = useMovements();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [stored, setStored] = useState<StoredSummary | null>(null);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);

  // Counted when the confirmation opens, so it can say what will actually go
  // rather than promising "everything" and hoping.
  useEffect(() => {
    if (!confirmingDelete) return;
    confirmHeadingRef.current?.focus();
    void summariseStoredData().then(setStored);
  }, [confirmingDelete]);

  function exportData() {
    // Offered before deletion, never instead of it. Some people want these
    // later even when they don't want them now.
    const blob = new Blob(
      [
        JSON.stringify(
          { journal: entries, movements, exported: new Date().toISOString() },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'field-notes-my-entries.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteEverything() {
    // One call, which enumerates rather than listing — see lib/wipe.ts. The
    // previous version reset three stores and left the bump photos, the
    // movement journal and the maternity unit's phone number behind, under a
    // button that said "permanently".
    await wipeAllLocalData();
    navigate('/', { replace: true });
  }

  return (
    <Screen
      title="My pregnancy has changed"
      lede="You don’t have to record anything about what happened — there is nowhere in this app to put it. Choose whichever of these is closest, and you can change your mind later."
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
          <span className="block font-display text-[1.0625rem] font-semibold">
            Pause everything for now
          </span>
          <span className="mt-1 block text-[0.90625rem] text-soft">
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
          <span className="block font-display text-[1.0625rem] font-semibold">
            Change to support after loss
          </span>
          <span className="mt-1 block text-[0.90625rem] text-soft">
            Removes the week counter, due date, development updates and milestones. The app becomes
            a quiet place with what happens now, support, and your memories.
          </span>
        </button>

        {/* Deliberately not a modal — a trapped dialog is the wrong shape for
            this decision, and someone should be able to read the rest of the
            page while making it. But an inline reveal still has to be
            announced: pressing this used to change nothing a screen reader
            could perceive, because the new panel appears below and focus does
            not move. aria-expanded and aria-controls say what happened; the
            heading below takes focus so the terms are actually read. */}
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-expanded={confirmingDelete}
          aria-controls="delete-confirm"
          className="w-full rounded-xl border border-line bg-card px-4 py-4 text-left"
        >
          <span className="block font-display text-[1.0625rem] font-semibold">
            Delete my pregnancy data
          </span>
          <span className="mt-1 block text-[0.90625rem] text-soft">
            Everything this app has saved on this device, including photos. This cannot be undone.
          </span>
        </button>

        <Link
          to="/today"
          className="block w-full rounded-xl border border-line px-4 py-4 text-center text-[1rem] font-medium text-soft no-underline"
        >
          Nothing — go back
        </Link>
      </div>

      {confirmingDelete && (
        <div
          id="delete-confirm"
          className="mt-7 rounded-xl border border-alert/50 bg-alertp px-4 py-4"
        >
          <h2
            ref={confirmHeadingRef}
            tabIndex={-1}
            className="mb-2 text-[1.0625rem] text-alert outline-none"
          >
            Before you delete
          </h2>
          <p className="mb-3 text-[0.9375rem] leading-relaxed">
            Some people want these later, even if they don’t want them now. You can save a copy to
            your device first — nothing is sent anywhere.
          </p>

          {/* Says what will go, rather than "everything" and hoping. */}
          <p className="mb-3 text-[0.90625rem] leading-relaxed">
            This will delete your notes, questions, mood entries, movement journal, saved maternity
            unit and pregnancy details
            {stored && stored.photos > 0
              ? `, and ${stored.photos} bump ${stored.photos === 1 ? 'photo' : 'photos'}.`
              : '.'}
          </p>

          <button
            type="button"
            onClick={exportData}
            className="mb-2 min-h-11 w-full rounded-lg border border-ink px-3 text-[0.9375rem] font-semibold"
          >
            Save my notes and movements first
          </button>

          {/* Photos are blobs and cannot go in the JSON file, so saying "save a
              copy" without this would be a promise the export does not keep. */}
          {stored && stored.photos > 0 && (
            <p className="mb-3 text-[0.84375rem] leading-relaxed text-soft">
              That file holds your written entries. Photos aren’t in it —{' '}
              <Link to="/gallery" className="underline">
                save them from the gallery
              </Link>{' '}
              first if you want to keep them.
            </p>
          )}
          <button
            type="button"
            onClick={() => void deleteEverything()}
            className="min-h-11 w-full rounded-lg bg-alert px-3 text-[0.9375rem] font-semibold text-white"
          >
            Delete everything permanently
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="mt-2 min-h-11 w-full rounded-lg px-3 text-[0.875rem] text-soft"
          >
            Cancel
          </button>
        </div>
      )}

      <p className="mt-10 border-t border-line pt-5 text-[0.875rem] leading-relaxed text-soft">
        This app sends no notifications and has no way to. Your due date and any anniversaries will
        pass without it saying anything.
      </p>

      {/* Someone arriving here after a loss had three state changes and no
          route to the support itself. */}
      <p className="mt-4 text-[0.90625rem] leading-relaxed text-soft">
        If you’ve lost a pregnancy or a baby,{' '}
        <Link to="/loss" className="font-semibold underline">
          support after loss
        </Link>{' '}
        is here whether or not you change anything on this screen. If you feel unwell or unsafe,{' '}
        <Link to="/help" className="font-semibold underline">
          get help
        </Link>
        .
      </p>
    </Screen>
  );
}
