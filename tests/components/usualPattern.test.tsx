import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UsualPattern } from '../../src/components/movements/UsualPattern';
import { MovementsScreen } from '../../src/screens/MovementsScreen';
import { urgentById } from '../../src/content/urgent';

/**
 * A note the person writes about their own baby's pattern, so that at 2am
 * they have something to compare against.
 *
 * The risk is the whole design problem: a note like this is one careless
 * sentence away from being a self-assessment tool that delays a phone call.
 */

/**
 * usePersistedState keeps a module-level cache, and jsdom fires no
 * StorageEvent for same-window writes — so clear() alone leaves the previous
 * test's value in memory and the component renders someone else's note.
 */
function reset() {
  window.localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

function show(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('the usual-pattern note', () => {
  beforeEach(reset);

  it('asks what is usual, never whether today is fine', () => {
    show(<UsualPattern />);
    expect(screen.getByText(/What’s usual for your baby/i)).toBeInTheDocument();
    // The distinction is the entire point: it collects a baseline, it does
    // not invite a judgement about the present moment.
    expect(screen.queryByText(/today/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/is (this|it) normal/i)).not.toBeInTheDocument();
  });

  it('says there is no normal number of movements', () => {
    show(<UsualPattern />);
    expect(screen.getByText(/no normal number of movements/i)).toBeInTheDocument();
  });

  it('reads back what was written, and then says a change means calling', async () => {
    show(<UsualPattern />);
    await userEvent.type(screen.getByLabelText(/in your own words/i), 'Busy late evening.');
    await userEvent.click(screen.getByRole('button', { name: /save this/i }));

    expect(screen.getByText('Busy late evening.')).toBeInTheDocument();
    // Never shown without this. The note must not read as reassurance.
    expect(screen.getByText(/reason to call — not a reason to wait and see/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot tell you your baby is well/i)).toBeInTheDocument();
  });

  it('counts, scores and compares nothing', async () => {
    const { container } = show(<UsualPattern />);
    await userEvent.type(screen.getByLabelText(/in your own words/i), 'Rolls after lunch.');
    await userEvent.click(screen.getByRole('button', { name: /save this/i }));
    // Free text only. Nothing numeric, nothing the app could evaluate.
    expect(container.querySelector('input[type="number"]')).toBeNull();
    expect(container.textContent).not.toMatch(/\b\d+\s*(movements|kicks|times)\b/i);
  });
});

describe('where it sits on the movement journal', () => {
  beforeEach(reset);

  it('never appears above the instruction to call', () => {
    const { container } = show(<MovementsScreen />);
    const text = container.textContent ?? '';
    const call = text.indexOf('Movements feel different?');
    const note = text.indexOf('What’s usual for your baby');
    expect(call).toBeGreaterThan(-1);
    expect(note).toBeGreaterThan(call);
  });

  it('keeps a border on the call button, so high contrast cannot erase it', () => {
    const { container } = show(<MovementsScreen />);
    const call = container.querySelector('a[href^="tel:"]')!;
    expect(call.className).toMatch(/\bborder-2\b/);
  });
});

describe('what the urgent screen must not do', () => {
  it('never sends someone to check their note before calling', () => {
    // On the urgent screen the instruction is "call now". Inviting a
    // comparison first would add exactly the hesitation it exists to remove.
    const movements = urgentById.get('movements')!;
    const all = [movements.now, movements.why, ...(movements.dont ?? [])].join(' ');
    expect(all).not.toMatch(/usual pattern note|what you wrote|check your note/i);
    expect(movements.now).toMatch(/call your maternity unit now/i);
  });
});
