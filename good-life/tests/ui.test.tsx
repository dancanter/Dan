import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
