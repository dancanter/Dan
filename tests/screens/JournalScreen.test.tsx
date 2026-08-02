import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { JournalScreen } from '../../src/screens/JournalScreen';
import { __resetStorageForTests } from '../../src/lib/storage';

function renderJournal() {
  return render(
    <MemoryRouter initialEntries={['/journal']}>
      <JournalScreen />
    </MemoryRouter>,
  );
}

function storedEntries() {
  const raw = window.localStorage.getItem('bump:journal');
  return raw ? (JSON.parse(raw).entries as Array<Record<string, unknown>>) : [];
}

describe('JournalScreen', () => {
  it('saves what someone types, and it is still there after a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = renderJournal();

    await user.click(screen.getByRole('button', { name: /a good day/i }));
    await user.click(screen.getByRole('button', { name: 'Tiredness' }));
    await user.type(screen.getByLabelText('Notes'), 'Slept badly but the sickness has eased.');
    await user.click(screen.getByRole('button', { name: 'Save entry' }));

    const saved = storedEntries();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      mood: 'bright',
      symptomIds: ['tiredness'],
      note: 'Slept badly but the sickness has eased.',
    });

    // Simulate closing and reopening the app: fresh module cache, same disk.
    unmount();
    __resetStorageForTests();
    renderJournal();

    expect(screen.getByText('Slept badly but the sickness has eased.')).toBeInTheDocument();
    expect(screen.getByText('Tiredness')).toBeInTheDocument();
  });

  it('refuses to save an entry with nothing in it', async () => {
    const user = userEvent.setup();
    renderJournal();

    await user.click(screen.getByRole('button', { name: 'Save entry' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/before saving/i);
    expect(storedEntries()).toHaveLength(0);
  });

  it('edits an existing entry in place instead of adding a second one', async () => {
    const user = userEvent.setup();
    renderJournal();

    await user.type(screen.getByLabelText('Notes'), 'First version.');
    await user.click(screen.getByRole('button', { name: 'Save entry' }));

    await user.click(screen.getByRole('button', { name: /^Edit/ }));
    const noteField = screen.getByLabelText('Notes');
    await user.clear(noteField);
    await user.type(noteField, 'Corrected version.');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    const saved = storedEntries();
    expect(saved).toHaveLength(1);
    expect(saved[0].note).toBe('Corrected version.');
  });

  it('deletes an entry once the confirmation is accepted', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderJournal();

    await user.type(screen.getByLabelText('Notes'), 'To be removed.');
    await user.click(screen.getByRole('button', { name: 'Save entry' }));
    expect(storedEntries()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /^Delete/ }));

    expect(storedEntries()).toHaveLength(0);
    vi.restoreAllMocks();
  });

  it('keeps the entry for the session when the disk write fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    renderJournal();

    await user.type(screen.getByLabelText('Notes'), 'Written while storage is full.');
    await user.click(screen.getByRole('button', { name: 'Save entry' }));

    // Nothing reached disk, but the entry is still on screen rather than lost
    // silently mid-edit.
    expect(screen.getByText('Written while storage is full.')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
