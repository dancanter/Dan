import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MilestoneCelebration } from '../../src/components/week/MilestoneCelebration';

/**
 * The bug this pins was found by walking the usability test's own first task —
 * "you've noticed something that worries you" — in a real browser. The
 * celebration was a modal with a full-screen backdrop, and Playwright reported
 * it intercepting pointer events on the Get Help tab. Someone opening the app
 * worried, in a week that happens to be a milestone, had a celebration
 * standing between them and the urgent route.
 *
 * jsdom has no layout, so this cannot test interception directly. It tests the
 * three properties that caused it, each of which is a one-word edit away from
 * coming back.
 */
function show(onDismiss = vi.fn()) {
  return {
    onDismiss,
    ...render(
      <MilestoneCelebration
        title="Week 24"
        message="A genuine milestone."
        reduceMotionOverride={true}
        onDismiss={onDismiss}
      />,
    ),
  };
}

describe('the milestone celebration', () => {
  it('does not claim to be modal — safety is never behind a celebration', () => {
    show();
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-modal');
  });

  it('lets pointer events through everywhere except the card itself', () => {
    const { container } = show();
    const backdrop = container.firstElementChild as HTMLElement;
    expect(backdrop.className).toContain('pointer-events-none');
    expect(screen.getByRole('dialog').className).toContain('pointer-events-auto');
  });

  it('does not trap Tab, so the navigation stays reachable', async () => {
    const user = userEvent.setup();
    // A control outside the dialog, standing in for the app's own navigation.
    render(<a href="/help">Get Help</a>);
    show();

    screen.getByRole('button', { name: /lovely/i }).focus();
    await user.tab();
    // With a trap, focus would have cycled back inside the dialog.
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(false);
  });

  it('is still a labelled dialog that takes focus and closes on Escape', async () => {
    const user = userEvent.setup();
    const { onDismiss } = show();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Week 24');
    expect(document.activeElement).toBe(dialog);

    await user.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('skips the confetti under reduced motion', () => {
    const { container } = show();
    // The dots are the only aria-hidden absolutely-positioned children.
    expect(container.querySelectorAll('.absolute.h-1\\.5')).toHaveLength(0);
  });
});
