import type { ReactNode } from 'react';
import { glossaryLookup } from '../../content/glossary';
import { GlossaryTerm } from './GlossaryTerm';

/**
 * Content files use a tiny subset of markdown — **bold** and *italic* — so
 * that guidance copy stays readable as plain text in the data files. This
 * renders that subset without pulling in a markdown dependency, and without
 * ever using dangerouslySetInnerHTML on content.
 *
 * It also links clinical terms to the glossary automatically, so a definition
 * never has to be maintained inline next to the word. Adding a term to
 * glossary.ts makes it tappable everywhere it already appears.
 */

/**
 * One pattern for every glossary term and alias, longest first so the full
 * name wins over the short form. Word boundaries stop "icp" matching inside
 * another word, and the pattern is built once rather than per render.
 */
const GLOSSARY_PATTERN = new RegExp(
  `\\b(${glossaryLookup.map((g) => g.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'gi',
);

/** Wraps any glossary term found in a plain string. */
function linkTerms(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  GLOSSARY_PATTERN.lastIndex = 0;

  while ((match = GLOSSARY_PATTERN.exec(text)) !== null) {
    const found = match[0];
    const entry = glossaryLookup.find((g) => g.pattern === found.toLowerCase())?.entry;
    if (!entry) continue;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <GlossaryTerm key={`${keyPrefix}-g${key++}`} entry={entry}>
        {found}
      </GlossaryTerm>,
    );
    last = match.index + found.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length > 0 ? nodes : [text];
}

function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(...linkTerms(text.slice(last, match.index), `${keyPrefix}-${key}`));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-b${key++}`}>
          {linkTerms(token.slice(2, -2), `${keyPrefix}-bb${key}`)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={`${keyPrefix}-e${key++}`}>
          {linkTerms(token.slice(1, -1), `${keyPrefix}-ee${key}`)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    nodes.push(...linkTerms(text.slice(last), `${keyPrefix}-${key}`));
  }
  return nodes;
}

export function RichText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="prose-note text-[15px] leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i}>{renderInline(p, `p${i}`)}</p>
      ))}
    </div>
  );
}

export function RichLine({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}
