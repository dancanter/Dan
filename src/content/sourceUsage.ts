import { guides } from './guides';
import { symptoms } from './symptoms';
import { urgentSymptoms } from './urgent';

/**
 * Which parts of the app rest on each source.
 *
 * A bibliography tells you what was read. This tells you what it was used
 * for — and that is the difference between a list of citations and being
 * shown where a claim came from. It is also the only direction of the link
 * that was missing: every entry already names its sources, and no source
 * named its entries.
 *
 * Derived, never hand-maintained. Add a guide tomorrow and it appears here;
 * a hand-written list would silently rot the moment anyone forgot.
 */

export interface SourceUse {
  /** Where tapping it goes. */
  to: string;
  title: string;
  /** Urgent entries are marked, because resting on a single source matters more there. */
  urgent?: boolean;
}

function build(): Map<string, SourceUse[]> {
  const map = new Map<string, SourceUse[]>();

  const add = (sourceIds: string[], use: SourceUse) => {
    for (const id of sourceIds) {
      const list = map.get(id);
      if (list) list.push(use);
      else map.set(id, [use]);
    }
  };

  for (const g of guides) {
    add(g.sourceIds, { to: `/healthy?open=${g.id}`, title: g.title });
  }
  for (const u of urgentSymptoms) {
    add(u.sourceIds, { to: `/help/${u.id}`, title: u.title, urgent: true });
  }
  for (const s of symptoms) {
    add(s.sourceIds, { to: `/body?symptom=${s.id}`, title: s.name });
  }

  return map;
}

const USAGE = build();

export function usesOf(sourceId: string): SourceUse[] {
  return USAGE.get(sourceId) ?? [];
}
