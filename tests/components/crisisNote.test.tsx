import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CrisisNote } from '../../src/components/loss/CrisisNote';
import { lossSections } from '../../src/content/loss';
import { afterLossSections } from '../../src/content/afterLoss';

/**
 * Neither loss screen had any route out of a crisis. Someone reading about
 * baby loss at 3am, unable to keep themselves safe, had a page of gentle
 * writing and nowhere to go.
 */

function show() {
  return render(
    <MemoryRouter>
      <CrisisNote />
    </MemoryRouter>,
  );
}

describe('the crisis route on the loss screens', () => {
  it('offers a number that is answered day and night', () => {
    show();
    // Samaritans is written out rather than only linked: free, 24/7, and
    // someone in that state should not have to tap twice to reach it.
    expect(screen.getByRole('link', { name: /samaritans/i })).toHaveAttribute('href', 'tel:116123');
  });

  it('keeps a border, so high contrast cannot erase it', () => {
    const { container } = show();
    const call = container.querySelector('a[href^="tel:"]')!;
    expect(call.className).toMatch(/\bborder-2\b/);
  });

  it('routes on to the rest of the urgent mental health help', () => {
    show();
    expect(screen.getByRole('link', { name: /other ways to get help/i })).toHaveAttribute(
      'href',
      '/help/mental-health',
    );
  });

  it('says reading is not the answer, rather than offering more reading', () => {
    show();
    expect(screen.getByText(/Reading is not what you need/i)).toBeInTheDocument();
  });
});

describe('the helplines named on the loss screens', () => {
  // These are numbers someone dials in acute grief. Each was checked against
  // the charity's own helpline page, and the hours matter as much as the
  // digits — a number given with the wrong opening times is a number that
  // rings out.
  const text = [...lossSections, ...afterLossSections].flatMap((s) => s.body).join(' ');

  it.each([
    ['Sands', '0808 164 3332'],
    ['Tommy’s', '0800 0147 800'],
    ['Miscarriage Association', '0303 003 6464'],
    ['Cruse', '0808 808 1677'],
  ])('gives a number for %s', (_name, number) => {
    expect(text).toContain(number);
  });

  it('states hours wherever a helpline is not 24/7', () => {
    // The version of this content that arrived from outside said Sands ran
    // 9am–5pm. It does not — 10am–3pm, plus three evenings. Someone calling
    // at 9am would have got nothing.
    expect(text).toMatch(/Sands[\s\S]{0,90}10am–3pm/);
    expect(text).toMatch(/Miscarriage Association[\s\S]{0,90}9am–4pm/);
  });
});
