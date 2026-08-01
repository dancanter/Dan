import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TipRevealCard } from '../../src/components/content/TipRevealCard';
import { contentItemById } from '../../src/content';

describe('TipRevealCard', () => {
  it('hides the tip until revealed, then shows it and calls onReveal once', async () => {
    const user = userEvent.setup();
    const item = contentItemById.get('iron-anaemia-risk')!;
    const onReveal = vi.fn();

    render(
      <MemoryRouter>
        <TipRevealCard item={item} reduceMotionOverride onReveal={onReveal} />
      </MemoryRouter>,
    );

    expect(screen.queryByText(item.tip)).not.toBeInTheDocument();
    const revealButton = screen.getByRole('button', { name: /tap to reveal/i });

    await user.click(revealButton);

    expect(await screen.findByText(item.tip)).toBeInTheDocument();
    expect(onReveal).toHaveBeenCalledTimes(1);
  });
});
