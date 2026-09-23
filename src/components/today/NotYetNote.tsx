import { notYetForWeek } from '../../content/notYet';
import { SourceList } from '../ui/SourceList';

/**
 * "Not yet, and that is the schedule."
 *
 * Reassurance measured against the NHS timetable rather than against whoever
 * posted this morning. It sits inside the Home fold rather than on the open
 * screen, because it is comfort rather than action — and because something
 * that reassures you daily stops reassuring you by about the third time.
 *
 * Only one note shows. Three stacked reassurances read as a list of things
 * you have not done, which is the exact feeling this is meant to remove.
 */
export function NotYetNote({ week }: { week: number }) {
  const notes = notYetForWeek(week);
  if (notes.length === 0) return null;

  // The earliest-closing window first: a note that expires in two weeks is
  // more specific to now than one that runs to week 34.
  const note = [...notes].sort((a, b) => a.to - b.to)[0];

  return (
    <section className="mt-4 rounded-xl border border-line bg-mossp px-4 py-3">
      <h3 className="label-mono mb-1.5 text-mossd">Not yet, and that is fine</h3>
      <p className="m-0 text-body leading-relaxed">{note.text}</p>
      {note.sourceIds.length > 0 && <SourceList sourceIds={note.sourceIds} />}
    </section>
  );
}
