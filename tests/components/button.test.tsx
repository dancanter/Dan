import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import css from '../../src/index.css?raw';
import { Button, ButtonLink } from '../../src/components/ui/Button';

/**
 * The app had eight spellings of "primary button" — four text sizes, three
 * paddings, some with a hover state and some without. None looked wrong alone;
 * together they made the app feel assembled rather than designed.
 */

describe('the shared button', () => {
  it('is a button by default, without every caller remembering type="button"', () => {
    render(<Button>Save</Button>);
    // Inside a form, a button with no type submits it. That default has caused
    // more accidental form submissions than any other line of HTML.
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('lets a caller override the type where a submit is what it means', () => {
    render(<Button type="submit">Start</Button>);
    expect(screen.getByRole('button', { name: 'Start' })).toHaveAttribute('type', 'submit');
  });

  it('stays a link when it navigates, however it is styled', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/help" intent="primary">
          Get help
        </ButtonLink>
      </MemoryRouter>,
    );
    // A link belongs in history and opens in a new tab on a long press.
    // Styling it as a button must not take either of those away.
    const el = screen.getByRole('link', { name: 'Get help' });
    expect(el).toHaveAttribute('href', '/help');
  });

  it('gives every intent the same size and shape', () => {
    const { container } = render(
      <>
        <Button intent="primary">A</Button>
        <Button intent="secondary">B</Button>
        <Button intent="quiet">C</Button>
      </>,
    );
    const shapes = [...container.querySelectorAll('button')].map((b) =>
      [...b.classList]
        .filter((c) => /^(min-h|rounded|px-|text-\[)/.test(c))
        .sort()
        .join(' '),
    );
    expect(new Set(shapes).size).toBe(1);
  });
});

describe('press feedback', () => {
  // Written once in CSS rather than in every class string: the same fix
  // written 49 times is 49 chances to write it differently.

  it('exists at all — the tap highlight is disabled, so something must replace it', () => {
    expect(css).toMatch(/-webkit-tap-highlight-color:\s*transparent/);
    expect(css).toMatch(/:active[\s\S]{0,120}transform:\s*scale\(0\.98\)/);
  });

  it('is switched off for anyone who asked for no motion', () => {
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toMatch(/transform:\s*none/);
  });

  it('overrides at matching specificity, or it does not override at all', () => {
    // The bug this pins: written as a plain `button:active`, the reduced-motion
    // rule lost to `button:not(:disabled):active` — media queries add no
    // specificity — so the squash still ran. Measured in a browser as
    // matrix(0.98) under emulated reduced motion.
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toContain('button:not(:disabled):active');
  });
});
