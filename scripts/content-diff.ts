import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectClaims, type Claim } from './lib/claims';
import { meaningShifts, type Shift } from './lib/meaning';

/**
 * `npm run content-diff [ref]` — what changed in the medical copy, and does a
 * human need to look at it.
 *
 * A git diff of a content file cannot answer that. It shows lines, and content
 * files are full of lines that moved for reasons that have nothing to do with
 * meaning — a reflow, a rename, a new entry inserted above. This reads both
 * versions as data, matches claims by id, and reports each change as what it
 * is: this claim, this text before, this text after, these sources, and
 * whether the edit crossed a line where meaning lives.
 *
 * It never decides that a change is *right*. It decides that a change is
 * *reviewable*, which is the only judgement a script is entitled to make about
 * clinical copy.
 *
 *   npm run content-diff              # working tree vs HEAD
 *   npm run content-diff -- HEAD~5    # working tree vs an older commit
 *   npm run content-diff -- --strict  # exit 1 if anything needs review
 */

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const ref = args.find((a) => !a.startsWith('--')) ?? 'HEAD';

const git = (...a: string[]) => execFileSync('git', a, { encoding: 'utf8' }).trim();

let worktree: string | undefined;

async function loadClaims(root: string): Promise<Claim[]> {
  const content = (await import(join(root, 'src/content/index.ts'))) as Record<string, unknown>;
  return collectClaims(content);
}

function short(text: string, n = 150) {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat;
}

const line = (n = 74) => console.log('─'.repeat(n));

try {
  const sha = git('rev-parse', '--short', ref);
  worktree = mkdtempSync(join(tmpdir(), 'fieldnotes-content-'));
  git('worktree', 'add', '--detach', '--quiet', worktree, ref);

  const before = await loadClaims(worktree);
  const after = await loadClaims(process.cwd());

  const oldMap = new Map(before.map((c) => [c.id, c]));

  /**
   * Block ids carry a position, so inserting a paragraph renumbers every
   * paragraph below it and each one looks edited. Text that is present
   * verbatim on both sides of the same entry has not changed, wherever it now
   * sits — a tool that cries wolf on a reordered entry stops being read.
   */
  const entryOf = (c: Claim) => c.id.slice(0, c.id.indexOf('#'));
  const textsByEntry = (cs: Claim[]) => {
    const m = new Map<string, Set<string>>();
    for (const c of cs) {
      const key = entryOf(c);
      if (!m.has(key)) m.set(key, new Set());
      m.get(key)!.add(c.text);
    }
    return m;
  };
  const oldTexts = textsByEntry(before);
  const newTexts = textsByEntry(after);
  const movedNotEdited = (c: Claim) => oldTexts.get(entryOf(c))?.has(c.text) === true;
  const stillPresent = (c: Claim) => newTexts.get(entryOf(c))?.has(c.text) === true;

  console.log(`\nCONTENT CHANGE AUDIT — working tree vs ${ref} (${sha})\n`);
  line();
  console.log(`  ${before.length} claims at ${sha} · ${after.length} claims now`);

  /**
   * Three cases once positional noise is stripped out, and only the third is
   * an edit:
   *   · the new text was already in this entry → it moved down, nothing to see
   *   · the old text is still in this entry → new text was inserted above it
   *   · neither → the text at this slot genuinely changed
   */
  const added = after.filter(
    (c) => !movedNotEdited(c) && (!oldMap.has(c.id) || stillPresent(oldMap.get(c.id)!)),
  );
  const removed = before.filter((c) => !stillPresent(c));
  const changed = after
    .map((c) => ({ now: c, was: oldMap.get(c.id) }))
    .filter(
      (p) =>
        p.was !== undefined &&
        p.was.text !== p.now.text &&
        !movedNotEdited(p.now) &&
        !stillPresent(p.was),
    )
    .map((p) => ({
      ...p,
      was: p.was!,
      shifts: meaningShifts(p.was!.text, p.now.text),
    }));

  console.log(`  ${added.length} added · ${removed.length} removed · ${changed.length} edited`);

  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    line();
    console.log('\nNo medical copy changed.\n');
    process.exit(0);
  }

  // ── Edits, worst first ────────────────────────────────────────────
  const needsReview = (s: Shift[], urgent: boolean) => s.some((x) => x.reviewRequired) || urgent;
  const ordered = [...changed].sort(
    (a, b) =>
      Number(needsReview(b.shifts, b.now.urgent)) - Number(needsReview(a.shifts, a.now.urgent)) ||
      b.shifts.length - a.shifts.length,
  );

  if (ordered.length > 0) {
    line();
    console.log('\nEDITED\n');
    for (const { was, now, shifts } of ordered) {
      const review = needsReview(shifts, now.urgent);
      console.log(`${review ? '⚠ REVIEW REQUIRED' : '  wording only  '}  ${now.id}`);
      console.log(`    entry    ${now.title}${now.urgent ? '   [URGENT COPY]' : ''}`);
      console.log(`    was      ${short(was.text)}`);
      console.log(`    now      ${short(now.text)}`);
      if (now.sourceIds.length > 0) {
        console.log(`    sources  ${now.sourceIds.join(', ')}`);
      }
      for (const s of shifts) {
        console.log(`    ↳ ${s.kind}: ${s.from} → ${s.to}`);
      }
      if (review && shifts.length === 0) {
        console.log('    ↳ urgent copy — every edit here is reviewed, however small');
      }
      console.log();
    }
  }

  if (added.length > 0) {
    line();
    console.log('\nADDED — new claims, all of which need a source and a reader\n');
    for (const c of added) {
      console.log(`  ${c.id}  (${c.title})`);
      console.log(`    ${short(c.text)}`);
      console.log(`    sources  ${c.sourceIds.join(', ') || 'NONE'}`);
    }
    console.log();
  }

  if (removed.length > 0) {
    line();
    console.log('\nREMOVED\n');
    for (const c of removed) {
      console.log(`  ${c.id}  (${c.title})`);
      console.log(`    ${short(c.text, 110)}`);
    }
    console.log();
  }

  const flagged = ordered.filter((c) => needsReview(c.shifts, c.now.urgent)).length;
  const unsourced = added.filter((c) => c.sourceIds.length === 0).length;

  line();
  console.log(`\n  ${flagged} edit(s) need a human before release.`);
  console.log(`  ${added.length} new claim(s), ${unsourced} of them with no source.`);
  console.log(`\n  This tool checks whether meaning may have moved. It cannot check`);
  console.log(`  whether the new wording is correct — see docs/content-safety.md.\n`);

  if (strict && (flagged > 0 || unsourced > 0)) process.exit(1);
} finally {
  if (worktree) {
    try {
      git('worktree', 'remove', '--force', worktree);
    } catch {
      rmSync(worktree, { recursive: true, force: true });
    }
  }
}
