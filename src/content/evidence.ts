import type { Source } from './schema';

/**
 * How strong the evidence behind an entry is, and what that means for a reader.
 *
 * The app already showed *which* sources an entry cites. What it never showed
 * was what kind of thing they are — and "the NHS recommends this" and "one
 * observational study found this" are very different claims that were being
 * rendered in identical grey type at the bottom of a card.
 *
 * Like the citation links, the label is *derived* from the sources rather than
 * written per entry. 111 hand-written strength labels would be 111 things to
 * keep in sync with the citations above them, and the first one to drift would
 * be the one that mattered. Change a guide's sources and its label follows.
 */

export type EvidenceStrength =
  | 'uk-guidance'
  | 'guidance-and-research'
  | 'research-only'
  | 'charity';

/** NHS, NICE, MHRA, the royal colleges — the line UK maternity care runs on. */
const OFFICIAL: Source['tier'][] = ['gov', 'nhs', 'college'];

export interface Evidence {
  strength: EvidenceStrength;
  /** Short badge text. */
  label: string;
  /** One or two sentences: what this means for someone deciding what to do. */
  meaning: string;
  /** Funding conflicts and "background only" notes, carried up from sources. */
  caveats: string[];
  /** Newest year derivable from the citations, where any of them say. */
  newestYear?: number;
}

const MEANING: Record<EvidenceStrength, { label: string; meaning: string }> = {
  'uk-guidance': {
    label: 'UK guidance',
    meaning:
      'This is what the NHS, NICE or a royal college actually recommends — the same line your midwife is working from.',
  },
  'guidance-and-research': {
    label: 'Guidance + research',
    meaning:
      'UK guidance, with the research behind it cited alongside, so you can see where the recommendation comes from rather than taking it on trust.',
  },
  'research-only': {
    label: 'Research, not guidance',
    meaning:
      'This comes from published research rather than official UK guidance. Useful to know, but not settled — where UK guidance exists on a topic, that is what gets cited instead.',
  },
  charity: {
    label: 'Charity guidance',
    meaning:
      'From a UK maternity charity rather than the NHS or a royal college. Usually practical rather than clinical, and worth reading as such.',
  },
};

/**
 * The year a citation is anchored to, read out of what it already says.
 *
 * Nothing is guessed. Most citations carry a year in the text — "NICE, August
 * 2021", "Nutrients 2024;16(19):3231", "Tommy's (reviewed January 2026)" — and
 * for a source that names several, the most recent is the one that matters: an
 * MBRRACE citation covering two reports is anchored to the newer one.
 *
 * A bare "NHS" gets nothing, and shows nothing. An invented date on a page
 * about health guidance is worse than an absent one.
 */
export function sourceYear(source: Source): number | undefined {
  const text = `${source.reviewed ?? ''} ${source.organisation}`;
  // Bounded, so PMC10810490 and PMID 34162788 don't read as years.
  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));
  if (years.length === 0) return undefined;
  return Math.max(...years);
}

export function evidenceFor(sources: Source[]): Evidence | undefined {
  if (sources.length === 0) return undefined;

  const hasOfficial = sources.some((s) => OFFICIAL.includes(s.tier));
  const hasResearch = sources.some((s) => s.tier === 'research');

  const strength: EvidenceStrength = hasOfficial
    ? hasResearch
      ? 'guidance-and-research'
      : 'uk-guidance'
    : hasResearch
      ? 'research-only'
      : 'charity';

  const years = sources.map(sourceYear).filter((y): y is number => y !== undefined);

  return {
    strength,
    ...MEANING[strength],
    caveats: sources.map((s) => s.caveat).filter((c): c is string => Boolean(c)),
    newestYear: years.length > 0 ? Math.max(...years) : undefined,
  };
}
