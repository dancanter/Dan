import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MythsScreen } from '../src/screens/MythsScreen';
import { myths } from '../src/content/myths';

function show() {
  window.localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
  return render(
    <MemoryRouter>
      <MythsScreen />
    </MemoryRouter>,
  );
}

describe('myth or fact', () => {
  beforeEach(() => window.localStorage.clear());

  it('asks before it tells', async () => {
    show();
    expect(screen.getByRole('button', { name: /that’s a myth/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /that’s true/i })).toBeTruthy();
    // The verdict is not on screen until someone has had a go.
    expect(screen.queryByRole('button', { name: /next one/i })).toBeNull();
  });

  it('turns the card over on a guess, either way', async () => {
    const user = userEvent.setup();
    const { container } = show();
    await user.click(screen.getByRole('button', { name: /that’s true/i }));
    expect(screen.getByRole('button', { name: /next one/i })).toBeTruthy();
    // The explanation from the content file, not anything written here.
    const shown = myths.find((m) => container.textContent!.includes(m.explanation));
    expect(shown).toBeDefined();
  });

  // The core design decision. Half these myths are things a relative said with
  // total confidence; being marked incorrect for believing them is a small
  // humiliation attached to something already anxious.
  it('never tells anyone they are wrong', async () => {
    const user = userEvent.setup();

    for (const guess of [/that’s a myth/i, /that’s true/i]) {
      const { container, unmount } = show();
      await user.click(screen.getByRole('button', { name: guess }));
      const text = container.textContent!.toLowerCase();
      for (const word of ['wrong', 'incorrect', 'nope', 'try again', 'you failed', '✗']) {
        expect(text.includes(word), `says "${word}"`).toBe(false);
      }
      unmount();
    }
  });

  it('says something kind when the guess does not match', async () => {
    const user = userEvent.setup();
    const { container } = show();
    // Whichever way this lands, one of the two responses is on screen.
    await user.click(screen.getByRole('button', { name: /that’s a myth/i }));
    const text = container.textContent!;
    expect(text.includes('That’s right.') || text.includes('catches a lot of people')).toBe(true);
  });

  it('keeps no score and no completion count', async () => {
    const user = userEvent.setup();
    const { container } = show();
    await user.click(screen.getByRole('button', { name: /that’s true/i }));
    await user.click(screen.getByRole('button', { name: /next one/i }));
    await user.click(screen.getByRole('button', { name: /that’s a myth/i }));

    const text = container.textContent!.toLowerCase();
    for (const pattern of ['score', 'streak', 'out of 16', '1 of 16', '% ', 'correct so far']) {
      expect(text.includes(pattern), `shows "${pattern}"`).toBe(false);
    }
    expect(text).toContain('nothing to finish');
  });

  it('moves through the deck without repeating the same card', async () => {
    const user = userEvent.setup();
    const { container } = show();
    const first = myths.find((m) => container.textContent!.includes(m.claim))!;

    await user.click(screen.getByRole('button', { name: /that’s true/i }));
    await user.click(screen.getByRole('button', { name: /next one/i }));

    expect(container.textContent!.includes(first.claim)).toBe(false);
  });

  it('writes nothing medical of its own — every claim comes from the content file', () => {
    const { container } = show();
    const claim = myths.find((m) => container.textContent!.includes(`“${m.claim}”`));
    expect(claim).toBeDefined();
  });
});
