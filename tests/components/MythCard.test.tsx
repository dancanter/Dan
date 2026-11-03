import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MythCard } from '../../src/components/today/MythCard';
import { myths } from '../../src/content';

describe('MythCard', () => {
  it('hides the verdict until revealed, then shows it and reports once', async () => {
    const user = userEvent.setup();
    const myth = myths[0];
    const onReveal = vi.fn();

    render(<MythCard myth={myth} reduceMotionOverride onReveal={onReveal} />);

    expect(screen.queryByText(myth.explanation)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tap to reveal/i }));

    expect(await screen.findByText(myth.explanation)).toBeInTheDocument();
    expect(onReveal).toHaveBeenCalledExactlyOnceWith(myth.id);
  });
});
