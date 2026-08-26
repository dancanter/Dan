import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * There was no error boundary anywhere in the app, which meant a throw inside
 * any one screen unmounted the entire tree and left a blank page — including
 * on the way to Get help. A blank page is the worst possible failure mode
 * here: it gives someone worried no route to a phone number and no reason to
 * believe the app will work if they try again.
 *
 * So the fallback is not a generic "something went wrong". It is the two
 * things that matter when the app itself is broken: call your maternity unit,
 * or call 111. Those are plain anchors, not routes, because routing is
 * exactly what might have failed.
 */
interface Props {
  children: ReactNode;
}
interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Console only. Nothing about a crash on this app gets sent anywhere —
    // the screen someone crashed on is itself health information.
    // eslint-disable-next-line no-console
    console.error('[fieldnotes] screen failed', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main id="main" className="mx-auto max-w-[620px] px-4 pt-10 pb-24">
        <h1 className="mb-3 text-[24px]">This screen didn’t load</h1>
        <p className="mb-6 text-[15.5px] leading-relaxed text-soft">
          Something in the app broke, not anything to do with you or your pregnancy. Nothing you
          have saved has been lost.
        </p>

        <p className="mb-3 text-[15.5px] font-medium">
          If you were looking for help with a symptom, don’t wait for this to be fixed:
        </p>
        <a
          href="tel:111"
          className="mb-2 flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-alert px-4 text-[17px] font-semibold text-alert no-underline"
        >
          Call 111
        </a>
        <a
          href="tel:999"
          className="mb-6 flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-alert px-4 text-[17px] font-semibold text-alert no-underline"
        >
          Call 999 — emergency
        </a>
        <p className="mb-6 text-[14.5px] leading-relaxed text-soft">
          If you have your maternity unit’s number saved on your phone, call that first — they would
          always rather hear from you.
        </p>

        {/* A full reload rather than a route change: the router is one of the
            things that might have thrown. */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 w-full rounded-lg border border-line px-3 text-[15px] font-semibold"
        >
          Reload the app
        </button>
      </main>
    );
  }
}
