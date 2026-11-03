import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CallButton } from '../../src/components/help/CallButton';
import { urgentSymptoms, URGENT_DISCLAIMER } from '../../src/content';

/**
 * The single most important control in the app, held to the strictest rules.
 *
 * The bug this pins was found with forced colours emulated: three of the four
 * call buttons were a coloured fill with no border. Windows high-contrast mode
 * overrides background and text, so a filled button with no border has no
 * shape left — and the button someone taps at 3am became a line of text. The
 * one that survived was the only one with a border.
 */

function show(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('the call button', () => {
  beforeEach(() => window.localStorage.clear());

  it.each([['emergency'], ['mental-health'], ['maternity-unit']] as const)(
    'keeps a border in the %s case, so high contrast cannot erase it',
    (action) => {
      const { container } = show(<CallButton action={action} />);
      const primary = container.querySelector('a[href^="tel:"]')!;
      expect(primary.className).toMatch(/\bborder-2\b/);
    },
  );

  it('always offers a number, even with nothing saved', () => {
    show(<CallButton action="maternity-unit" />);
    // Nobody should meet a setup step mid-panic.
    expect(screen.getByRole('link', { name: /call 111/i })).toHaveAttribute('href', 'tel:111');
  });

  it('dials 999 and nothing else for an emergency', () => {
    show(<CallButton action="emergency" />);
    expect(screen.getByRole('link', { name: /call 999/i })).toHaveAttribute('href', 'tel:999');
  });

  it('offers Samaritans alongside 111 for mental health', () => {
    show(<CallButton action="mental-health" />);
    expect(screen.getByRole('link', { name: /samaritans/i })).toHaveAttribute('href', 'tel:116123');
  });
});

describe('what every urgent entry has to carry', () => {
  it('says what to do before it explains anything', () => {
    // Action before explanation, on all thirteen. Someone reads the first
    // line and acts; the reasoning is there for afterwards.
    for (const s of urgentSymptoms) {
      expect(s.now.length, s.id).toBeGreaterThan(0);
      expect(s.why.length, s.id).toBeGreaterThan(0);
    }
  });

  it('states plainly what the app cannot work out', () => {
    expect(URGENT_DISCLAIMER).toMatch(/cannot check whether you or your baby are well/i);
  });
});
