import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QuestionList } from '../../src/components/appointments/QuestionList';

function reset(entries: unknown[] = []) {
  window.localStorage.clear();
  window.localStorage.setItem('fieldnotes:journal', JSON.stringify(entries));
  window.localStorage.setItem(
    'fieldnotes:profile',
    JSON.stringify({ dueDate: '2027-01-01', babyName: null, firstPregnancy: true }),
  );
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
}

function show() {
  return render(
    <MemoryRouter>
      <QuestionList />
    </MemoryRouter>,
  );
}

const question = (id: string, text: string, asked?: boolean) => ({
  id,
  kind: 'question',
  text,
  date: '2026-08-01',
  week: 20,
  ...(asked === undefined ? {} : { asked }),
});

describe('questions for your midwife', () => {
  beforeEach(() => reset());

  it('says something useful when there is nothing saved yet', () => {
    show();
    expect(screen.getByText(/occur to you at 2am/i)).toBeTruthy();
  });

  it('lets you add one, and keeps it', async () => {
    const user = userEvent.setup();
    show();
    await user.type(screen.getByLabelText(/anything you want to remember/i), 'Is this normal?');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Is this normal?')).toBeTruthy();
  });

  it('ticking one off moves it to already asked rather than deleting it', async () => {
    reset([question('1', 'Can I still swim?')]);
    const user = userEvent.setup();
    show();

    expect(screen.queryByText(/already asked/i)).toBeNull();
    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByText(/already asked/i)).toBeTruthy();
    // Still there — the answer usually matters after the appointment too.
    expect(screen.getByText('Can I still swim?')).toBeTruthy();
  });

  it('shows entries saved before ticking existed as still to ask', () => {
    // No `asked` key at all, as older saved questions have.
    reset([question('1', 'Old question')]);
    show();
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', false);
    expect(screen.queryByText(/already asked/i)).toBeNull();
  });

  // A list of things you didn't manage to raise is not a score. Appointments
  // get cut short for reasons that are nobody's fault.
  it('never counts, scores or chases unasked questions', () => {
    reset([question('1', 'A'), question('2', 'B'), question('3', 'C', true)]);
    const { container } = show();
    const text = container.textContent!.toLowerCase();
    for (const phrase of ['still to ask', 'remaining', 'you have 2', '2 unasked', 'don’t forget']) {
      expect(text.includes(phrase), `says "${phrase}"`).toBe(false);
    }
  });

  it('can remove one outright', async () => {
    reset([question('1', 'Delete me')]);
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryByText('Delete me')).toBeNull();
  });
});
