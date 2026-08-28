import { lazy, type ComponentType } from 'react';

/**
 * A lazily-loaded route that survives a deploy.
 *
 * The bug this fixes, reproduced in a browser before it was written: someone
 * has the app open, a new version is deployed, they tap a tab — and get
 * "This screen didn't load". The running page still holds the old chunk
 * filenames, and those files no longer exist:
 *
 *     404 /assets/HealthyScreen-BwdkAvJq.js
 *
 * Nothing is wrong with their connection and nothing is wrong with the app.
 * They are simply holding a page that has been replaced under them, and the
 * only thing that would help is the thing they have no reason to think of:
 * reloading. So the app does it for them, once, and they land on the screen
 * they asked for.
 *
 * Three guards keep this from becoming worse than the problem:
 *
 * 1. **Once per route, per session.** A reload that fails the same way twice
 *    is a loop, and a loop on a pregnancy app at 3am is unforgivable. The flag
 *    is in sessionStorage so it clears when the tab closes.
 * 2. **Only when online.** If the device has no connection, a reload replaces
 *    a screen that offers 111 and 999 with a blank browser error. Offline
 *    falls straight through to the error boundary, which is the right answer.
 * 3. **Storage may not exist.** Private windows and blocked storage throw on
 *    access; that must not turn a recoverable failure into a crash.
 */
/**
 * Split out from `lazyRoute` so it can be tested directly. Poking at
 * React.lazy's internals to trigger its loader is exactly the kind of test
 * that passes until React changes shape underneath it.
 */
export function reloadOnStaleChunk<T>(key: string, load: () => Promise<T>): () => Promise<T> {
  return () =>
    load().catch((error: unknown) => {
      if (!shouldReload(key)) throw error;

      // Best effort: nudge the service worker to pick up the new build before
      // reloading, so the reload doesn't come back from a stale cache.
      //
      // Written the long way on purpose. As
      // `navigator.serviceWorker?.getRegistration().finally(reload)` the
      // optional chain short-circuits the *whole* expression where there is no
      // service worker — a browser without one, or a private window — so the
      // reload silently never happened. A unit test caught it; nothing in a
      // browser would have.
      const worker = navigator.serviceWorker;
      const updated = worker
        ? worker
            .getRegistration()
            .then((reg) => reg?.update())
            .catch(() => undefined)
        : Promise.resolve();
      void updated.finally(() => window.location.reload());

      // Never resolves — the reload takes over. Suspense keeps showing the
      // loading state until the page goes, which is what it is for.
      return new Promise<T>(() => {});
    });
}

export function lazyRoute<T extends ComponentType<unknown>>(
  key: string,
  load: () => Promise<{ default: T }>,
) {
  return lazy(reloadOnStaleChunk(key, load));
}

function shouldReload(key: string): boolean {
  // navigator.onLine is unreliable as a "yes" and reliable as a "no": false
  // means definitely no connection, which is the case that must not reload.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;

  const flag = `fieldnotes:chunk-retry:${key}`;
  try {
    if (window.sessionStorage.getItem(flag) === '1') return false;
    window.sessionStorage.setItem(flag, '1');
    return true;
  } catch {
    // No storage means no way to remember we already tried, and a reload we
    // cannot count is a reload that could loop. Don't.
    return false;
  }
}
