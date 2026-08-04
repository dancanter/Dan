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

export function ScreenTitle({ title, strap }: { title: string; strap?: string }) {
  return (
    <header className="mb-5">
      <h1
        tabIndex={-1}
        id="screen-title"
        className="mb-2 border-b-2 border-ink pb-2 text-[25px] outline-none"
      >
        {title}
      </h1>
      {strap && <p className="m-0 text-[15px] italic text-mossd">{strap}</p>}
    </header>
  );
}
