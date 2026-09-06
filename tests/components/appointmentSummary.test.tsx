import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppointmentSummaryScreen } from '../../src/screens/AppointmentSummaryScreen';
import css from '../../src/index.css?raw';

/**
 * One sheet to take into the appointment.
 *
 * Two things have to hold. It must interpret nothing — the app is not
 * qualified to summarise anyone's health and must not appear to. And it must
 * not leave the device, because the privacy page promises there is nowhere
 * for it to go.
 */

function seed(
  entries: unknown[],
  profile = { dueDate: '2027-03-01', birthDate: null, babyName: null, firstPregnancy: true },
) {
  window.localStorage.clear();
  window.localStorage.setItem('fieldnotes:profile', JSON.stringify(profile));
  window.localStorage.setItem('fieldnotes:journal', JSON.stringify(entries));
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

function show() {
  return render(
    <MemoryRouter>
      <AppointmentSummaryScreen />
    </MemoryRouter>,
  );
}

const question = (id: string, text: string, asked = false) => ({
  id,
  kind: 'question',
  text,
  date: '2026-09-01',
  week: 24,
  asked,
});

describe('what goes on the sheet', () => {
  beforeEach(() => seed([]));

  it('leads with the questions that have not been asked yet', () => {
    seed([question('q1', 'Is the breathlessness normal?'), question('q2', 'Old one', true)]);
    show();
    expect(screen.getByText('Is the breathlessness normal?')).toBeInTheDocument();
    // Answered ones are kept, but out of the way — the point of the sheet is
    // what she still needs to raise.
    const unasked = screen.getByText(/Questions I want to ask/i);
    const previously = screen.getByText(/Already asked at a previous appointment/i);
    expect(unasked.compareDocumentPosition(previously)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('says plainly that nothing on it has been assessed', () => {
    seed([question('q1', 'Anything')]);
    show();
    // A clinician reading this must not mistake it for a triage output.
    expect(
      screen.getByText(/has been assessed, scored or checked by the app/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/none of it is a clinical record/i)).toBeInTheDocument();
  });

  it('scores, rates and interprets nothing', () => {
    seed([
      question('q1', 'A question'),
      { id: 'm1', kind: 'mood', text: 'Low', date: '2026-09-01', week: 24 },
      { id: 'm2', kind: 'mood', text: 'Anxious', date: '2026-09-02', week: 24 },
    ]);
    const { container } = show();
    const text = container.textContent ?? '';
    // No trend language, no totals, no flags — the app is not qualified.
    expect(text).not.toMatch(/\b(score|risk|trend|improving|worsening|concerning|flagged)\b/i);
    expect(text).not.toMatch(/\b\d+\s*\/\s*\d+\b/);
    // The moods appear as her own words and nothing more.
    expect(screen.getByText(/These are the words I chose, not an assessment/i)).toBeInTheDocument();
  });

  it('tells someone with nothing saved how to fill it', () => {
    show();
    expect(screen.getByText(/There is nothing saved yet/i)).toBeInTheDocument();
    // No point offering a print button for an empty page.
    expect(screen.queryByRole('button', { name: /print/i })).not.toBeInTheDocument();
  });
});

describe('how it becomes a PDF', () => {
  beforeEach(() => seed([question('q1', 'A question')]));

  it('uses the browser rather than a PDF library', async () => {
    // Every browser already has a PDF engine. Shipping 400KB of jsPDF to an
    // offline-first app for a button pressed twice a month is a poor trade.
    const print = vi.fn();
    vi.stubGlobal('print', print);
    show();
    await userEvent.click(screen.getByRole('button', { name: /print, or save as a pdf/i }));
    expect(print).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('says the sheet never leaves the device', () => {
    show();
    expect(screen.getByText(/Nothing is sent anywhere/i)).toBeInTheDocument();
  });
});

describe('the print stylesheet', () => {
  it('strips the app furniture off the page', () => {
    const print = css.slice(css.indexOf('@media print'));
    for (const selector of ['nav', '.print\\:hidden', 'header', 'footer']) {
      expect(print, selector).toContain(selector);
    }
  });

  it('ignores the in-app text size, which would rescale the paper', () => {
    const print = css.slice(css.indexOf('@media print'), css.indexOf('.label-mono'));
    expect(print).toMatch(/font-size:\s*100%/);
  });

  it('keeps a question from splitting across a page break', () => {
    const print = css.slice(css.indexOf('@media print'), css.indexOf('.label-mono'));
    expect(print).toMatch(/break-inside:\s*avoid/);
  });
});
