import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { GlossaryEntry } from '../../content/glossary';

/**
 * A clinical term you can tap for a plain-English definition, inline, without
 * leaving the page.
 *
 * Uses a real <button> with aria-expanded rather than a hover tooltip: hover
 * does not exist on a phone, and this content is read on phones. The
 * definition is referenced by aria-controls so a screen reader announces it,
 * rather than being a title attribute nobody hears.
 *
 * The panel is positioned rather than inserted into the text flow. Pushing a
 * block into the middle of a paragraph tears the sentence in half and leaves
 * the remainder stranded — which looked exactly as bad as it sounds.
 */
export function GlossaryTerm({ entry, children }: { entry: GlossaryEntry; children: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapper = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  // A term sitting near the right-hand edge would push its panel off screen,
  // where it is simply gone on a phone. Measure once on open and slide it
  // back inside — cheaper and more reliable than guessing with CSS alone.
  useLayoutEffect(() => {
    if (!open || !panel.current) {
      setShift(0);
      return;
    }
    const margin = 12;
    const rect = panel.current.getBoundingClientRect();
    const overflowRight = rect.right - (window.innerWidth - margin);
    if (overflowRight > 0) setShift(-overflowRight);
    else if (rect.left < margin) setShift(margin - rect.left);
  }, [open]);

  // Escape closes, and a tap anywhere else closes — the same two gestures
  // that dismiss everything else on a phone.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <span ref={wrapper} className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help border-b border-dashed border-moss bg-transparent p-0 text-left font-[inherit] text-[inherit] text-ink"
      >
        {children}
        <span className="sr-only"> — tap for a plain-English definition</span>
      </button>
      {open && (
        <span
          ref={panel}
          id={id}
          role="note"
          style={{ transform: `translateX(${shift}px)` }}
          className="absolute left-0 top-full z-40 mt-1 block w-[min(300px,78vw)] rounded-lg border border-moss bg-mossp px-3 py-2.5 text-[14px] font-normal not-italic leading-relaxed text-ink shadow-lg"
        >
          {/* Terms are stored lowercase; capitalize would give "Cholestasis
              Of Pregnancy", so only the first letter is lifted. */}
          <b className="mb-0.5 block font-display first-letter:uppercase">{entry.term}</b>
          {entry.definition}
        </span>
      )}
    </span>
  );
}
