import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  urgentSymptoms,
  urgentById,
  URGENT_DISCLAIMER,
  validateContent,
  guides,
} from '../src/content';
import { UrgentDetailScreen } from '../src/screens/GetHelpScreen';
import { MovementsScreen } from '../src/screens/MovementsScreen';

describe('the urgent flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('gives every symptom an action, an explanation and a source', () => {
    expect(validateContent()).toEqual([]);
    for (const s of urgentSymptoms) {
      expect(s.now.trim().length, `${s.id} action`).toBeGreaterThan(0);
      expect(s.why.trim().length, `${s.id} why`).toBeGreaterThan(0);
      expect(s.sourceIds.length, `${s.id} sources`).toBeGreaterThan(0);
    }
  });

  it('puts what to do before why it matters on every screen', () => {
    for (const s of urgentSymptoms) {
      const { container, unmount } = render(
        <MemoryRouter initialEntries={[`/help/${s.id}`]}>
          <Routes>
            <Route path="/help/:symptomId" element={<UrgentDetailScreen />} />
          </Routes>
        </MemoryRouter>,
      );
      const text = container.textContent ?? '';
      expect(text.indexOf('What to do now'), s.id).toBeLessThan(text.indexOf('Why this matters'));
      // The boundary statement is on every urgent screen, without exception.
      expect(text, s.id).toContain(URGENT_DISCLAIMER);
      unmount();
    }
  });

  it('offers a working number even when no maternity unit is saved', () => {
    render(
      <MemoryRouter initialEntries={['/help/movements']}>
        <Routes>
          <Route path="/help/:symptomId" element={<UrgentDetailScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    // Nobody should hit a setup step mid-panic — 111 always works.
    const link = screen.getByRole('link', { name: /call 111/i });
    expect(link.getAttribute('href')).toBe('tel:111');
  });

  it('dials the stored maternity number when there is one', () => {
    const key = 'fieldnotes:maternity-unit';
    window.localStorage.setItem(
      key,
      JSON.stringify({ name: 'St Elsewhere triage', phone: '0113 000 0000' }),
    );
    // usePersistedState caches per key across the module; nudge it the way a
    // second window would.
    window.dispatchEvent(new StorageEvent('storage', { key }));
    render(
      <MemoryRouter initialEntries={['/help/movements']}>
        <Routes>
          <Route path="/help/:symptomId" element={<UrgentDetailScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /St Elsewhere triage/i });
    // Spaces break some diallers.
    expect(link.getAttribute('href')).toBe('tel:01130000000');
  });

  it('routes chest pain and severe pain to 999', () => {
    expect(urgentById.get('chest')?.action).toBe('emergency');
    expect(urgentById.get('severe-pain')?.action).toBe('emergency');
  });
});

describe('the movement journal is not a kick counter', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });

  it('never shows a count, total, target or goal', () => {
    const { container } = render(
      <MemoryRouter>
        <MovementsScreen />
      </MemoryRouter>,
    );
    const text = (container.textContent ?? '').toLowerCase();
    for (const banned of ['kick count', 'total', 'target', 'goal', 'streak', 'score']) {
      // "no target number" is the one legitimate use — it's the guidance itself.
      const bad = text.includes(banned) && !text.includes(`no ${banned}`);
      expect(bad, `movement journal mentions "${banned}"`).toBe(false);
    }
  });

  it('shows the call-your-unit line unconditionally, before anything is logged', () => {
    const { container } = render(
      <MemoryRouter>
        <MovementsScreen />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('Movements feel different?');
    expect(container.textContent).toContain('cannot check whether your baby is well');
  });

  it('never suggests waiting, cold drinks, lying down or a doppler', () => {
    const { container } = render(
      <MemoryRouter>
        <MovementsScreen />
      </MemoryRouter>,
    );
    const text = (container.textContent ?? '').toLowerCase();
    expect(text).not.toContain('cold drink');
    expect(text).not.toContain('lie down');
    expect(text).not.toContain('wait and see');
    // Dopplers are mentioned only to tell someone not to use one.
    if (text.includes('doppler')) expect(text).toMatch(/don.t use a home doppler/);
  });
});

describe('engagement mechanics the brief rules out', () => {
  it('ships no badge or streak content', async () => {
    const content = await import('../src/content');
    expect('badges' in content).toBe(false);
    expect('WEEK_BADGES' in content).toBe(false);
  });

  it('still covers postpartum psychosis as its own entry', () => {
    const entry = guides.find((g) => g.id === 'postpartum-psychosis');
    expect(entry).toBeDefined();
    expect(entry?.emphasis).toBe('warn');
    // It is an emergency, and the entry has to say so plainly.
    expect(entry?.body.join(' ')).toMatch(/999|emergency/i);
  });
});
