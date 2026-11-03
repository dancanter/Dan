import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SaveForMidwife } from '../../src/components/ui/SaveForMidwife';
import { FoodLookup } from '../../src/components/learn/FoodLookup';

/**
 * The bridge between reading something and remembering to raise it — and the
 * fast answer to a question asked in a supermarket aisle. Both exist because
 * the app already held the answer and had no quick way to reach it.
 */

function show(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('saving something to ask about', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('takes one tap, and says so without a dialog', async () => {
    const user = userEvent.setup();
    show(<SaveForMidwife topic="Cheese — what’s actually fine" />);

    await user.click(screen.getByRole('button', { name: /save for my midwife/i }));

    expect(screen.getByText(/saved for your next appointment/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save for my midwife/i })).toBeNull();
  });

  it('writes a question the appointment screen can find', async () => {
    const user = userEvent.setup();
    show(<SaveForMidwife topic="Sleep position — from 28 weeks" />);
    await user.click(screen.getByRole('button', { name: /save/i }));

    const stored = JSON.parse(window.localStorage.getItem('fieldnotes:journal') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ kind: 'question', text: 'Sleep position — from 28 weeks' });
  });

  it('does not offer to save the same thing twice', async () => {
    const user = userEvent.setup();
    const { unmount } = show(<SaveForMidwife topic="Iron & anaemia" />);
    await user.click(screen.getByRole('button', { name: /save/i }));
    unmount();

    // Coming back to the same entry later.
    show(<SaveForMidwife topic="Iron & anaemia" />);
    expect(screen.queryByRole('button', { name: /save/i })).toBeNull();
    expect(screen.getByText(/saved for your next appointment/i)).toBeInTheDocument();
  });

  it('offers no count, badge or progress', () => {
    const { container } = show(<SaveForMidwife topic="Anything" />);
    expect(container.textContent).not.toMatch(/\d+\s*(saved|question|to ask)/i);
  });
});

describe('looking a food up', () => {
  it('answers with the verdict first', async () => {
    const user = userEvent.setup();
    show(<FoodLookup />);
    await user.type(screen.getByLabelText(/look something up/i), 'brie');

    const card = screen.getByRole('heading', { name: 'Brie' }).closest('li')!;
    const text = card.textContent ?? '';
    // The verdict has to come before the explanation — it is the answer.
    expect(text.indexOf('Cook it first')).toBeLessThan(text.indexOf('White-rind'));
    expect(card).toHaveTextContent(/where this comes from/i);
  });

  it('finds an item by a word in the middle of its name', async () => {
    const user = userEvent.setup();
    show(<FoodLookup />);
    await user.type(screen.getByLabelText(/look something up/i), 'tuna');
    expect(screen.getByRole('heading', { name: /tinned tuna/i })).toBeInTheDocument();
  });

  it('never dead-ends on something it does not cover', async () => {
    const user = userEvent.setup();
    show(<FoodLookup />);
    await user.type(screen.getByLabelText(/look something up/i), 'kombucha');

    // "Not in my list" must not read as "not allowed".
    const live = screen.getByText(/doesn’t mean it’s a problem/i);
    expect(live).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /searching the guidance/i })).toBeInTheDocument();
  });

  it('shows nothing at all until asked', () => {
    const { container } = show(<FoodLookup />);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });
});
