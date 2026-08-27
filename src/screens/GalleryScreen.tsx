import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { usePregnancyStatus } from '../hooks/usePregnancyStatus';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import {
  allPhotos,
  savePhoto,
  deletePhoto,
  downscale,
  PhotoStoreUnavailable,
  type BumpPhoto,
} from '../lib/photoStore';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Screen } from '../components/ui/Screen';

/**
 * The bump gallery.
 *
 * Optional in the strongest sense: no prompt, no reminder, no "you missed
 * week 22", and no completeness indicator anywhere. A gallery with four
 * photos in it is a complete gallery. The copy never implies otherwise,
 * because the audience for a guilt-inducing photo streak is nobody.
 *
 * The time-lapse honours reduced-motion by falling back to a static grid,
 * and there is a text alternative either way.
 */
export function GalleryScreen() {
  const { currentWeek } = usePregnancyProfile();
  const { isAfterLoss } = usePregnancyStatus();
  const { reduceMotion } = useAccessibilitySettings();
  const [photos, setPhotos] = useState<BumpPhoto[]>([]);
  const [urls, setUrls] = useState<Map<number, string>>(new Map());
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    let rows: BumpPhoto[];
    try {
      rows = await allPhotos();
    } catch (err) {
      // Some browsers simply will not open a database — private windows,
      // managed devices. An empty grid would read as "your photos are gone",
      // which is a horrible thing to imply, so say what actually happened.
      if (err instanceof PhotoStoreUnavailable) {
        setUnavailable(true);
        return;
      }
      throw err;
    }
    setUnavailable(false);
    setPhotos(rows);
    setUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return new Map(rows.map((r) => [r.week, URL.createObjectURL(r.blob)]));
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Revoke object URLs on unmount so the blobs can be collected.
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  useEffect(() => {
    if (!playing || photos.length < 2) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % photos.length), 600);
    return () => window.clearInterval(id);
  }, [playing, photos.length]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || currentWeek === null) return;
    setBusy(true);
    try {
      await savePhoto(currentWeek, await downscale(file));
      await refresh();
    } catch (err) {
      if (err instanceof PhotoStoreUnavailable) setUnavailable(true);
      else throw err;
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const showTimeLapse = photos.length >= 2 && !reduceMotion;

  // Support-after-loss removes photo prompts entirely. Existing photos are
  // not deleted — they are reachable from "your memories" — but nothing
  // invites someone back into a bump gallery.
  if (isAfterLoss) return <Navigate to="/today" replace />;

  return (
    <Screen
      title="Bump gallery"
      lede="Entirely optional, and there’s no schedule to keep. Photos stay on this device — they are never uploaded anywhere."
      width="reading"
    >
      {unavailable && (
        <p className="mb-5 rounded-xl border border-clay bg-clayp px-4 py-3 text-[0.90625rem] leading-relaxed">
          This browser won’t let the app store photos on your device — usually a private window, or
          storage turned off in your settings. Nothing has been lost. Everything else in the app
          works as normal.
        </p>
      )}

      <input
        ref={fileRef}
        id="bump-photo"
        type="file"
        accept="image/*"
        onChange={onPick}
        className="sr-only"
      />
      <label
        htmlFor="bump-photo"
        className="flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-xl border border-moss bg-mossp px-4 text-[1rem] font-semibold text-mossd"
      >
        {busy
          ? 'Saving…'
          : currentWeek === null
            ? 'Add a photo'
            : `Add a photo for week ${currentWeek}`}
      </label>
      <p aria-live="polite" className="mt-2 text-[0.875rem] text-mossd">
        {photos.length === 0
          ? ''
          : `${photos.length} photo${photos.length === 1 ? '' : 's'} saved.`}
      </p>

      {photos.length === 0 ? (
        <p className="mt-6 text-[0.9375rem] italic text-soft">
          Nothing here yet. If you’d rather not do this at all, that’s a perfectly normal choice —
          nothing else in the app depends on it.
        </p>
      ) : (
        <>
          {photos.length >= 2 && (
            <>
              <SectionHeading>Time-lapse</SectionHeading>
              {showTimeLapse ? (
                <>
                  <div className="overflow-hidden rounded-xl border border-line bg-card">
                    <img
                      src={urls.get(photos[frame]?.week) ?? ''}
                      alt={`Bump photo from week ${photos[frame]?.week}`}
                      className="block max-h-[420px] w-full object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPlaying((p) => !p)}
                      className="min-h-11 rounded-lg border border-line px-4 text-[0.875rem] font-semibold"
                    >
                      {playing ? 'Pause' : 'Play'}
                    </button>
                    <span className="font-mono text-[0.75rem] text-soft">
                      Week {photos[frame]?.week}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-[0.90625rem] italic text-soft">
                  Time-lapse is paused because you’ve turned on reduced motion. All the photos are
                  below in order.
                </p>
              )}
            </>
          )}

          <SectionHeading>Every photo</SectionHeading>
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
            {photos.map((p) => (
              <li key={p.week} className="rounded-xl border border-line bg-card p-2">
                <img
                  src={urls.get(p.week) ?? ''}
                  alt={`Bump photo from week ${p.week}`}
                  className="block aspect-square w-full rounded-lg object-cover"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-mono text-[0.6875rem] text-clay">Week {p.week}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await deletePhoto(p.week);
                      await refresh();
                    }}
                    className="min-h-11 px-1 font-mono text-[0.6875rem] text-soft underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Screen>
  );
}
