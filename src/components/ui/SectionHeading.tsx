import { useAutoFocusHeading } from '../../hooks/useAutoFocusHeading';

export function SectionHeading({ children, id }: { children: string; id?: string }) {
  return (
    <div className="mt-7 mb-3 flex items-center gap-2.5">
      <span className="h-px w-[18px] bg-ink/35" aria-hidden="true" />
      <h2 id={id} className="label-mono m-0 text-mossd">
        {children}
      </h2>
    </div>
  );
}

/**
 * A screen's `<h1>`, which is also where focus lands when you navigate to it.
 *
 * The focus part used to be each screen's own job: call `useAutoFocusHeading`,
 * put the ref on the heading. Eight of the screens using this component called
 * the hook and dropped the ref on the floor — the effect ran and focused
 * nothing, so a keyboard or screen-reader user arriving at Guidance was left
 * wherever they had been on the previous screen. It looked correct in every
 * one of those files, which is exactly the problem.
 *
 * So the heading owns it now. There is no ref to forget, because there is no
 * ref to pass.
 */
export function ScreenTitle({ title, strap }: { title: string; strap?: string }) {
  const ref = useAutoFocusHeading<HTMLHeadingElement>();

  return (
    <header className="mb-5">
      <h1
        ref={ref}
        tabIndex={-1}
        id="screen-title"
        className="mb-2 border-b-2 border-ink pb-2 text-[1.5625rem] outline-none"
      >
        {title}
      </h1>
      {strap && <p className="m-0 text-[0.9375rem] italic text-mossd">{strap}</p>}
    </header>
  );
}
