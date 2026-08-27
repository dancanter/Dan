import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CalmScreen } from '../src/screens/CalmScreen';
import { BreathingPacer } from '../src/components/calm/BreathingPacer';
import { calmExercises, calmFacts, sourceById, validateContent } from '../src/content';

function show() {
  return render(
    <MemoryRouter>
      <CalmScreen />
    </MemoryRouter>,
  );
}

describe('the calm page', () => {
  // The single most important thing on this page. A breathing exercise is the
  // wrong answer to a crisis, and offering one first would be worse than
  // offering nothing — it implies the app understood and thinks this fixes it.
  it('routes a crisis off this page before offering anything', () => {
    const { container } = show();
    const text = container.textContent!;
    const escalation = text.indexOf('skip this page');
    const firstExercise = text.indexOf('Slow breathing');

    expect(escalation).toBeGreaterThan(-1);
    expect(escalation).toBeLessThan(firstExercise);

    const out = screen.getByRole('link', { name: /what to do instead/i });
    expect(out.getAttribute('href')).toContain('/help/mental-health');
  });

  it('never claims to treat anything', () => {
    const { container } = show();
    const text = container.textContent!.toLowerCase();
    for (const claim of ['will help you', 'cure', 'treat your', 'therapy', 'reduces your anxiety']) {
      expect(text.includes(claim), `claims "${claim}"`).toBe(false);
    }
    expect(text).toContain('nothing here is a treatment');
  });

  it('offers a route to real support at the end as well as the start', () => {
    show();
    expect(screen.getByRole('link', { name: /get help/i })).toBeTruthy();
  });

  it('cites everything, like the rest of the app', () => {
    for (const e of calmExercises) {
      expect(e.sourceIds.length, e.id).toBeGreaterThan(0);
      for (const id of e.sourceIds) expect(sourceById.has(id), `${e.id} → ${id}`).toBe(true);
    }
    for (const f of calmFacts) {
      expect(f.sourceIds.length).toBeGreaterThan(0);
      for (const id of f.sourceIds) expect(sourceById.has(id)).toBe(true);
    }
    expect(validateContent().filter((i) => i.detail.includes('Calm'))).toEqual([]);
  });
});

describe('the breathing pacer', () => {
  afterEach(() => vi.useRealTimers());

  it('never starts on its own', () => {
    render(<BreathingPacer inhale={4} exhale={6} reduceMotionOverride={false} />);
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy();
    expect(screen.getByText('Ready when you are')).toBeTruthy();
  });

  it('paces a longer out-breath than in-breath', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BreathingPacer inhale={4} exhale={6} reduceMotionOverride={true} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByText('Breathe in')).toBeTruthy();

    // Four seconds in, then it should turn over to the out-breath.
    act(() => void vi.advanceTimersByTime(4000));
    expect(screen.getByText('Breathe out')).toBeTruthy();
    // …and the out-breath is the longer of the two.
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByText('Breathe out')).toBeTruthy();
    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.getByText('Breathe in')).toBeTruthy();
  });

  // Reduced motion has to be a real alternative, not a degraded one: an
  // expanding circle is exactly the movement that worsens nausea for some
  // people, which in this audience is not a rare edge case.
  it('paces just as well with motion turned off', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BreathingPacer inhale={4} exhale={6} reduceMotionOverride={true} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    act(() => void vi.advanceTimersByTime(1000));
    // The count itself is the pacing device when the circle cannot move.
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('keeps no target and saves nothing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(
      <BreathingPacer inhale={4} exhale={6} reduceMotionOverride={true} />,
    );
    await user.click(screen.getByRole('button', { name: 'Start' }));
    act(() => void vi.advanceTimersByTime(11000));

    expect(container.textContent).toMatch(/no target/i);
    expect(window.localStorage.getItem('fieldnotes:calm')).toBeNull();
    // Nothing about this session is written anywhere.
    expect(Object.keys(window.localStorage).some((k) => k.includes('breath'))).toBe(false);
  });
});
