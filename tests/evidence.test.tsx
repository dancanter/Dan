import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { evidenceFor, sourceYear, guides, sourceById, type Source } from '../src/content';
import { EvidenceNote } from '../src/components/ui/EvidenceNote';

const nhs: Source = { id: 'a', label: 'x', organisation: 'NHS', tier: 'nhs' };
const nice: Source = { id: 'b', label: 'y', organisation: 'NICE, August 2021', tier: 'gov' };
const paper: Source = {
  id: 'c',
  label: 'z',
  organisation: 'Someone et al. Nutrients 2024;16(19):3231',
  tier: 'research',
};
const charity: Source = { id: 'd', label: 'w', organisation: "Tommy's", tier: 'charity' };

describe('working out how strong the evidence is', () => {
  it('calls official UK guidance what it is', () => {
    expect(evidenceFor([nhs, nice])?.strength).toBe('uk-guidance');
    expect(evidenceFor([nhs])?.label).toBe('UK guidance');
  });

  it('distinguishes guidance backed by research from research alone', () => {
    expect(evidenceFor([nhs, paper])?.strength).toBe('guidance-and-research');
    expect(evidenceFor([paper])?.strength).toBe('research-only');
  });

  // The distinction the old citation list quietly erased: "the NHS recommends
  // this" and "one study found this" were rendered in identical grey type.
  it('says plainly when something is not official guidance', () => {
    expect(evidenceFor([paper])?.meaning).toMatch(/not settled|rather than official/i);
  });

  it('treats a charity source as its own thing, not as guidance', () => {
    expect(evidenceFor([charity])?.strength).toBe('charity');
  });

  it('has nothing to say when there are no sources', () => {
    expect(evidenceFor([])).toBeUndefined();
  });
});

describe('reading a year out of a citation', () => {
  it('finds the year where the citation states one', () => {
    expect(sourceYear(nice)).toBe(2021);
    expect(sourceYear(paper)).toBe(2024);
  });

  it('takes the most recent when a citation spans several', () => {
    expect(
      sourceYear({
        id: 'x',
        label: 'l',
        organisation: 'MBRRACE-UK, 2021–2023 report (Jan 2025) and 2022–2024 report (Jan 2026)',
        tier: 'gov',
      }),
    ).toBe(2026);
  });

  // The whole reason this is derived rather than typed in: an invented date on
  // health guidance is worse than an absent one.
  it('returns nothing rather than guessing for an undated source', () => {
    expect(sourceYear(nhs)).toBeUndefined();
    expect(sourceYear(charity)).toBeUndefined();
  });

  it('does not mistake a PMC or PubMed id for a year', () => {
    expect(
      sourceYear({
        id: 'x',
        label: 'l',
        organisation: 'Someone (PMC10810490), PMID 34162788',
        tier: 'research',
      }),
    ).toBeUndefined();
  });
});

describe('the evidence note on screen', () => {
  it('is collapsed until asked, so it never interrupts reading', async () => {
    const user = userEvent.setup();
    const { container } = render(<EvidenceNote sourceIds={['nhs-vitamins']} />);
    const details = container.querySelector('details')!;

    // <details> keeps its content in the DOM when shut — which is what lets
    // browser find-in-page reach it — so the closed state is the assertion,
    // not the absence of the text.
    expect(details.open).toBe(false);
    await user.click(screen.getByText(/why we say this/i));
    expect(details.open).toBe(true);
    expect(screen.getByText(/the same line your midwife/i)).toBeTruthy();
  });

  it('surfaces a funding conflict above the citation rather than inside it', async () => {
    const user = userEvent.setup();
    // The dairy and iodine paper is National Dairy Council-funded.
    render(<EvidenceNote sourceIds={['razmpoosh-2025']} />);
    await user.click(screen.getByText(/why we say this/i));
    expect(screen.getByText(/National Dairy Council/i)).toBeTruthy();
    expect(screen.getByText(/has a caveat/i)).toBeTruthy();
  });

  it('every shipped guide resolves to a label', () => {
    for (const g of guides) {
      const sources = g.sourceIds.map((id) => sourceById.get(id)!).filter(Boolean);
      const evidence = evidenceFor(sources);
      expect(evidence, g.id).toBeDefined();
      expect(evidence!.label.length, g.id).toBeGreaterThan(0);
    }
  });
});
