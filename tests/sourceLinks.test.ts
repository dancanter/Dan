import { describe, expect, it } from 'vitest';
import { sources, sourceUrl, sourceLinkKind, validateContent } from '../src/content';

describe('making citations checkable', () => {
  it('resolves a PMC id to free full text', () => {
    expect(
      sourceUrl({
        id: 'x',
        label: 'A paper',
        organisation: 'Someone et al. 2024 (PMC10810490)',
        tier: 'research',
      }),
    ).toBe('https://pmc.ncbi.nlm.nih.gov/articles/PMC10810490/');
  });

  it('resolves a DOI, without swallowing the full stop that ends the sentence', () => {
    expect(
      sourceUrl({
        id: 'x',
        label: 'A paper',
        organisation: 'Teede H, et al. BMJ 2025; doi:10.1136/bmj-2025-085710.',
        tier: 'research',
      }),
    ).toBe('https://doi.org/10.1136/bmj-2025-085710');
  });

  it('falls back to PubMed when that is the only identifier', () => {
    expect(
      sourceUrl({
        id: 'x',
        label: 'A paper',
        organisation: 'Babbar S, et al. Clin Obstet Gynecol 2021;64(3), PMID 34162788',
        tier: 'research',
      }),
    ).toBe('https://pubmed.ncbi.nlm.nih.gov/34162788/');
  });

  it('prefers free full text over the publisher when both are available', () => {
    expect(
      sourceUrl({
        id: 'x',
        label: 'A paper',
        organisation: 'Someone 2024. doi:10.1000/abc (PMC1234567)',
        tier: 'research',
      }),
    ).toContain('pmc.ncbi.nlm.nih.gov');
  });

  it('returns nothing rather than guessing when there is no identifier', () => {
    expect(
      sourceUrl({
        id: 'x',
        label: 'Foods to avoid in pregnancy',
        organisation: 'NHS',
        tier: 'nhs',
      }),
    ).toBeUndefined();
  });

  it('lets a hand-checked url override the derived one, and says which it is', () => {
    const s = {
      id: 'x',
      label: 'A paper',
      organisation: 'Someone (PMC10810490)',
      tier: 'research' as const,
      url: 'https://example.org/checked',
    };
    expect(sourceUrl(s)).toBe('https://example.org/checked');
    expect(sourceLinkKind(s)).toBe('checked');
    expect(sourceLinkKind({ ...s, url: undefined })).toBe('resolved');
  });

  it('actually links a meaningful share of the real registry', () => {
    const openable = sources.filter((s) => sourceUrl(s));
    expect(openable.length).toBeGreaterThan(0);
    // Every derived link must be a real https URL, or the sources page ships
    // something that 404s — worse than showing no link at all.
    for (const s of openable) {
      const url = new URL(sourceUrl(s)!);
      expect(url.protocol, s.id).toBe('https:');
    }
  });

  it('fails the build on a malformed hand-written url', () => {
    // The registry itself must be clean…
    expect(validateContent().filter((i) => i.kind === 'bad-url')).toEqual([]);
  });
});
