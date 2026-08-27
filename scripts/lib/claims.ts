/**
 * Every piece of medical copy in the app, flattened into one addressable list.
 *
 * The point of an id-per-block rather than a file diff: a content edit has to
 * be reviewable as "this claim changed, from this to this", not as "these 40
 * lines moved". A reviewer reading a git diff of a reformatted content file
 * cannot tell a rewording from a change of meaning, which is exactly the
 * distinction that matters here.
 *
 * Imported dynamically from a path, so the same flattener can be pointed at an
 * older checkout of the content and the two compared.
 */

export interface Claim {
  /** Stable across versions: `<kind>:<entry id>#<block>`. */
  id: string;
  kind: string;
  /** Human-readable label for a report — the entry the block belongs to. */
  title: string;
  text: string;
  sourceIds: string[];
  /** Urgent copy is held to a higher bar; a change here always needs review. */
  urgent: boolean;
}

type Content = Record<string, unknown>;

function push(
  out: Claim[],
  kind: string,
  entryId: string,
  title: string,
  blocks: (string | undefined)[],
  sourceIds: string[] = [],
  urgent = false,
) {
  blocks.forEach((text, i) => {
    if (typeof text !== 'string' || text.trim() === '') return;
    out.push({ id: `${kind}:${entryId}#${i}`, kind, title, text: text.trim(), sourceIds, urgent });
  });
}

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/**
 * Deliberately defensive. This runs against older checkouts whose shapes may
 * differ, and a thrown error there would silently turn "the tool found no
 * changes" into "the tool did not run" — the worse of the two failures.
 */
export function collectClaims(content: Content): Claim[] {
  const out: Claim[] = [];

  for (const g of arr<Record<string, unknown>>(content.guides)) {
    const lists = arr<{ items?: string[] }>(g.lists).flatMap((l) => arr<string>(l.items));
    push(
      out,
      'guide',
      String(g.id),
      String(g.title),
      [String(g.summary), ...arr<string>(g.body), ...lists],
      arr<string>(g.sourceIds),
      g.emphasis === 'warn',
    );
  }

  for (const u of arr<Record<string, unknown>>(content.urgentSymptoms)) {
    push(
      out,
      'urgent',
      String(u.id),
      String(u.title),
      [
        String(u.now),
        ...arr<string>(u.dont),
        String(u.why),
        typeof u.reassurance === 'string' ? u.reassurance : undefined,
      ],
      arr<string>(u.sourceIds),
      true,
    );
  }

  for (const s of arr<Record<string, unknown>>(content.symptoms)) {
    push(
      out,
      'symptom',
      String(s.id),
      String(s.name),
      [String(s.why), String(s.help)],
      arr<string>(s.sourceIds),
    );
  }

  for (const m of arr<Record<string, unknown>>(content.myths)) {
    push(
      out,
      'myth',
      String(m.id),
      String(m.claim ?? m.title ?? m.id),
      [
        typeof m.claim === 'string' ? m.claim : undefined,
        typeof m.truth === 'string' ? m.truth : undefined,
        typeof m.detail === 'string' ? m.detail : undefined,
      ],
      arr<string>(m.sourceIds),
    );
  }

  for (const f of arr<Record<string, unknown>>(content.foodRules)) {
    push(out, 'food', String(f.id ?? f.name), String(f.name ?? f.id), [
      typeof f.verdict === 'string' ? `verdict: ${f.verdict}` : undefined,
      typeof f.detail === 'string' ? f.detail : undefined,
      typeof f.why === 'string' ? f.why : undefined,
    ]);
  }

  for (const t of arr<Record<string, unknown>>(content.helpTopics)) {
    push(
      out,
      'help-topic',
      String(t.id),
      String(t.title),
      arr<string>(t.body),
      arr<string>(t.sourceIds),
      true,
    );
  }

  for (const r of arr<Record<string, unknown>>(content.redFlags)) {
    push(out, 'red-flag', String(r.id ?? r.title), String(r.title ?? r.id), [
      typeof r.detail === 'string' ? r.detail : undefined,
      typeof r.action === 'string' ? r.action : undefined,
    ]);
  }

  for (const e of arr<Record<string, unknown>>(content.glossary)) {
    push(out, 'glossary', String(e.term ?? e.id), String(e.term ?? e.id), [
      typeof e.plain === 'string' ? e.plain : undefined,
      typeof e.meaning === 'string' ? e.meaning : undefined,
    ]);
  }

  for (const key of ['lossSections', 'equitySections', 'afterLossSections', 'privacySections']) {
    for (const s of arr<Record<string, unknown>>(content[key])) {
      push(
        out,
        key.replace('Sections', ''),
        String(s.id ?? s.title),
        String(s.title ?? s.id),
        arr<string>(s.body),
        arr<string>(s.sourceIds),
      );
    }
  }

  for (const c of arr<Record<string, unknown>>(content.calmExercises)) {
    push(
      out,
      'calm',
      String(c.id),
      String(c.title ?? c.name ?? c.id),
      [typeof c.how === 'string' ? c.how : undefined, ...arr<string>(c.steps)],
      arr<string>(c.sourceIds),
    );
  }

  return out;
}
