import type { ReactNode } from 'react';

/**
 * Content files use a tiny subset of markdown — **bold** and *italic* — so
 * that guidance copy stays readable as plain text in the data files. This
 * renders that subset without pulling in a markdown dependency, and without
 * ever using dangerouslySetInnerHTML on content.
 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="prose-note text-[15px] leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i}>{renderInline(p)}</p>
      ))}
    </div>
  );
}

export function RichLine({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}
