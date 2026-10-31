import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useStore } from '@/store/store';
import { emptyData } from '@/store/defaults';
import { buildDemo } from '@/lib/demo';
import Today from '@/features/Today';
import Performance from '@/features/Performance';
import Physique from '@/features/Physique';
import Nutrition from '@/features/Nutrition';
import Health from '@/features/Health';
import Recovery from '@/features/Recovery';
import University from '@/features/University';
import Style from '@/features/Style';
import Vinted from '@/features/Vinted';
import Culture from '@/features/Culture';
import Lifestyle from '@/features/Lifestyle';
import Analytics from '@/features/Analytics';
import Coach from '@/features/Coach';
import Settings from '@/features/Settings';
import { hoursInBed } from '@/components/DayLog';
import { mergeStartingProfile } from '@/lib/backup';
import { todayISO } from '@/lib/dates';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline in tests'))));
  const d = emptyData();
  d.settings.onboarded = true;
  useStore.setState({ hydrated: true, data: d });
  useStore.getState().mergeDemo(buildDemo(d));
});

const page = (C: ComponentType, path = '/') => render(<MemoryRouter initialEntries={[path]}><C /></MemoryRouter>);

describe('every section renders with data', () => {
  const cases: [string, ComponentType, RegExp][] = [
    ['Today', Today, /recommendation/i],
    ['Performance', Performance, /Run fast/],
    ['Physique', Physique, /Lean, strong/],
    ['Nutrition', Nutrition, /Fuel, recover/],
    ['Cellular health', Health, /how sure we are/],
    ['Recovery', Recovery, /Sleep, readiness/],
    ['University', University, /Distinction, by design/],
    ['Style', Style, /never overdressed/],
    ['Vinted', Vinted, /first-rate/],
    ['Culture', Culture, /Films worth an evening/],
    ['Lifestyle', Lifestyle, /Enjoy being alive/],
    ['Analytics', Analytics, /What the data says/],
    ['Coach', Coach, /Ask anything/],
    ['Settings', Settings, /your data/],
  ];
  for (const [name, C, heading] of cases) {
    it(name, () => {
      page(C);
      expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
    });
  }
});

describe('interactions', () => {
  it('a flag on Today changes the recommendation', () => {
    page(Today);
    fireEvent.click(screen.getByRole('button', { name: /I’m exhausted/ }));
    expect(useStore.getState().data.checkIns[Object.keys(useStore.getState().data.checkIns).sort().at(-1)!].flags).toContain('exhausted');
    expect(screen.getAllByText('Recovery & life').length).toBeGreaterThan(0);
  });
  it('removing demo data leaves real entries untouched', () => {
    useStore.getState().upsert('runs', { id: 'real', date: '2026-10-01', type: 'easy', distanceKm: 5, durationSec: 1500 });
    useStore.getState().clearDemo();
    const d = useStore.getState().data;
    expect(d.runs.map((r) => r.id)).toEqual(['real']);
    expect(Object.values(d.checkIns).some((c) => c.demo)).toBe(false);
  });
  it('the offline coach answers without a network', async () => {
    page(Coach);
    fireEvent.change(screen.getByPlaceholderText(/legs are heavy/), { target: { value: 'What are my paces?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText(/Threshold:/)).toBeInTheDocument();
  });
});

describe('profile link', () => {
  it('decodes a compressed starting profile from the link', async () => {
    const { readLinkImport } = await import('@/lib/linkImport');
    const file = { app: 'the-good-life', kind: 'starting-profile', data: { profile: { name: 'Test' } } };
    const packed = new Uint8Array(await new Response(new Response(JSON.stringify(file)).body!.pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    const z = btoa(String.fromCharCode(...packed)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const { data } = await readLinkImport(`#import=z.${z}`);
    expect(data.profile?.name).toBe('Test');
    await expect(readLinkImport('#import=j.bm9wZQ')).rejects.toThrow();
  });
});

describe('daily log', () => {
  it('works out time in bed across midnight', () => {
    expect(hoursInBed('23:00', '07:15')).toBe(8.25);
    expect(hoursInBed('00:30', '08:30')).toBe(8);
    expect(hoursInBed(undefined, '07:00')).toBeUndefined();
  });

  it('saves as you type, with no Save button', () => {
    page(Today);
    const today = todayISO();
    fireEvent.change(screen.getByLabelText(/^Weight/), { target: { value: '126.4' } });
    fireEvent.change(screen.getByLabelText(/^Steps/), { target: { value: '13200' } });
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Energy' })).getByRole('radio', { name: '4' }));
    const d = useStore.getState().data;
    expect(d.weights.find((w) => w.date === today && !w.demo)?.kg).toBeCloseTo(126.4 * 0.45359237, 2);
    expect(d.checkIns[today].steps).toBe(13200);
    expect(d.checkIns[today].energy).toBe(4);
    expect(screen.queryByRole('button', { name: /save check-in/i })).toBeNull();
  });

  it('logs a gym tick and a quick run', () => {
    page(Today);
    const today = todayISO();
    fireEvent.click(screen.getByRole('button', { name: /^Gym/ }));
    expect(useStore.getState().data.gym.some((g) => g.id === `gym-quick-${today}`)).toBe(true);
    const before = useStore.getState().data.runs.length;
    fireEvent.change(screen.getByPlaceholderText('8.0'), { target: { value: '8.04' } });
    fireEvent.change(screen.getByPlaceholderText('40:30'), { target: { value: '41:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add run' }));
    expect(useStore.getState().data.runs.length).toBe(before + 1);
  });

  it('merges imported runs once, however many times the link is opened', () => {
    const d = emptyData();
    const runs = [{ id: 'strava-1', date: '2026-10-28', type: 'threshold' as const, distanceKm: 4.8, durationSec: 1012 }];
    const once = mergeStartingProfile(d, { runs });
    const twice = mergeStartingProfile(once, { runs });
    expect(twice.runs.filter((r) => r.id === 'strava-1')).toHaveLength(1);
  });
});

describe('moving data', () => {
  it('round-trips everything through a data link', async () => {
    const { makeDataLink, readLinkImport } = await import('@/lib/linkImport');
    const d = useStore.getState().data;
    const link = await makeDataLink(d);
    const { kind, data } = await readLinkImport(link);
    expect(kind).toBe('backup');
    expect(data.runs?.length).toBe(d.runs.length);
  });

  it('shows the Wins page', async () => {
    const { default: Wins } = await import('@/components/Wins');
    page(Wins);
    expect(screen.getByText('Earned, not given.')).toBeTruthy();
  });
});
