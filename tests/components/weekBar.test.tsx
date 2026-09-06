import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeekBar } from '../../src/components/week/WeekBar';

/**
 * Two things the selector owns, because when the screens owned them the two
 * screens disagreed.
 */

describe('the countdown', () => {
  it('counts days while you are on your own week', () => {
    render(<WeekBar week={28} currentWeek={28} daysToGo={84} onChange={() => {}} />);
    expect(screen.getByText('84 days to go')).toBeInTheDocument();
  });

  it('counts weeks while you are browsing another one', () => {
    // A days-to-go figure only means anything from where the reader is. Home
    // passed a real number and Baby hardcoded null, so on the same week one
    // said "213 days to go" and the other "30 weeks to go".
    render(<WeekBar week={35} currentWeek={28} daysToGo={84} onChange={() => {}} />);
    expect(screen.getByText('5 weeks to go')).toBeInTheDocument();
    expect(screen.queryByText(/days to go/)).not.toBeInTheDocument();
  });

  it('falls back to weeks when there is no due date at all', () => {
    render(<WeekBar week={20} currentWeek={20} daysToGo={null} onChange={() => {}} />);
    expect(screen.getByText('20 weeks to go')).toBeInTheDocument();
  });
});

describe('getting back to your own week', () => {
  it('offers a way back once you have browsed away', async () => {
    const onChange = vi.fn();
    render(<WeekBar week={35} currentWeek={28} daysToGo={84} onChange={onChange} />);
    const back = screen.getByRole('button', { name: /back to my week \(28\)/i });
    await userEvent.click(back);
    // null means "wherever I actually am", rather than a hardcoded number
    // that would go stale the moment the week rolled over.
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('stays out of the way when you are already there', () => {
    render(<WeekBar week={28} currentWeek={28} daysToGo={84} onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /back to my week/i })).not.toBeInTheDocument();
  });

  it('offers nothing to go back to before a due date is set', () => {
    render(<WeekBar week={12} currentWeek={null} daysToGo={null} onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /back to my week/i })).not.toBeInTheDocument();
  });
});
