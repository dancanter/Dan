import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FirstVisitNote } from '../../src/components/today/FirstVisitNote';

function show() {
  return render(
    <MemoryRouter>
      <FirstVisitNote />
    </MemoryRouter>,
  );
}

describe('the first visit note', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('states the limit of the app, not just what it offers', () => {
    show();
    expect(screen.getByText(/cannot tell you whether you or your baby are well/i)).toBeTruthy();
  });

  it('points at urgent help, without setup', () => {
    show();
    const help = screen.getByRole('link', { name: /get help/i });
    expect(help.getAttribute('href')).toContain('/help');
  });

  // A modal or a tour would put screens between someone and the help they may
  // have opened the app to find. This has to be skippable by simply reading on.
  it('is not a dialog, and traps nothing', () => {
    show();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('goes away for good once dismissed', async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole('button', { name: /got it/i }));
    expect(screen.queryByText(/before you start/i)).toBeNull();

    // …and stays gone on the next visit.
    cleanup();
    show();
    expect(screen.queryByText(/before you start/i)).toBeNull();
  });
});
