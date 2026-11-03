import type { Source } from './schema';

/**
 * Turns a citation into something a reader can actually open.
 *
 * "Every entry sourced" is the app's central claim, and until now it stopped
 * at a name — you could see that a sentence came from *somewhere*, but not go
 * and check it. That is most of the way to a trust signal and none of the way
 * to trust.
 *
 * The link is *derived* rather than typed in, which matters: a URL written by
 * hand is a second thing to get wrong, and a dead link on a sources page is
 * worse than no link at all. Every citation here already carries a permanent
 * identifier — a DOI, a PMC id, a PubMed id — so the resolver URL is a pure
 * function of the citation. If the citation is right, the link is right, and a
 * new paper added with a PMC id becomes checkable with no extra work.
 *
 * `Source.url` stays as an explicit override, for the pages that have no such
 * identifier — NHS, NICE, the royal colleges, the charities. Those have to be
 * checked by hand before they go in, because a guessed slug looks exactly like
 * a real one right up until someone taps it.
 */

/** PMC first: it is free full text, so a reader can actually read it. */
const PMC = /\b(PMC\d{6,9})\b/;
const DOI = /\b(10\.\d{4,9}\/[^\s;,)\]]+)/;
const PMID = /\bPMID[:\s]*(\d{6,9})\b/i;

export function sourceUrl(source: Source): string | undefined {
  if (source.url) return source.url;

  // Identifiers live in the citation line, occasionally in the label.
  const text = `${source.organisation} ${source.label}`;

  const pmc = text.match(PMC);
  if (pmc) return `https://pmc.ncbi.nlm.nih.gov/articles/${pmc[1]}/`;

  const doi = text.match(DOI);
  // Journals often end a citation with a full stop, which is not part of the
  // DOI — and doi.org will happily 404 on it.
  if (doi) return `https://doi.org/${doi[1].replace(/[.,;]+$/, '')}`;

  const pmid = text.match(PMID);
  if (pmid) return `https://pubmed.ncbi.nlm.nih.gov/${pmid[1]}/`;

  return undefined;
}

/**
 * Which of the two routes produced the link. The sources page says so, because
 * "we resolved this from the DOI" and "someone checked this page by hand" are
 * different promises and shouldn't look identical.
 */
export function sourceLinkKind(source: Source): 'checked' | 'resolved' | 'none' {
  if (source.url) return 'checked';
  return sourceUrl(source) ? 'resolved' : 'none';
}
