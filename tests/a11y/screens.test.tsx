import { describe, expect, it, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { TodayScreen } from '../../src/screens/TodayScreen';
import { ArticleScreen } from '../../src/screens/ArticleScreen';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { OnboardingScreen } from '../../src/screens/OnboardingScreen';
import { JournalScreen } from '../../src/screens/JournalScreen';
import { AppointmentsScreen } from '../../src/screens/AppointmentsScreen';
import { SavedScreen } from '../../src/screens/SavedScreen';
import { ProgressScreen } from '../../src/screens/ProgressScreen';

function setOnboarded() {
  window.localStorage.setItem('bump:profile', JSON.stringify({ dueDate: '2026-12-01' }));
}

describe('accessibility', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('OnboardingScreen has no axe violations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <OnboardingScreen />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('TodayScreen has no axe violations', async () => {
    setOnboarded();
    const { container } = render(
      <MemoryRouter initialEntries={['/today']}>
        <Routes>
          <Route path="/today" element={<TodayScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('ArticleScreen has no axe violations', async () => {
    setOnboarded();
    const { container } = render(
      <MemoryRouter initialEntries={['/article/iron-anaemia-risk']}>
        <Routes>
          <Route path="/article/:articleId" element={<ArticleScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('SettingsScreen has no axe violations', async () => {
    setOnboarded();
    const { container } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsScreen />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('ProgressScreen has no axe violations', async () => {
    setOnboarded();
    const { container } = render(
      <MemoryRouter initialEntries={['/progress']}>
        <ProgressScreen />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('JournalScreen has no axe violations', async () => {
    setOnboarded();
    const { container } = render(
      <MemoryRouter initialEntries={['/journal']}>
        <JournalScreen />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('AppointmentsScreen has no axe violations', async () => {
    setOnboarded();
    const { container } = render(
      <MemoryRouter initialEntries={['/appointments']}>
        <AppointmentsScreen />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('SavedScreen has no axe violations', async () => {
    setOnboarded();
    const { container } = render(
      <MemoryRouter initialEntries={['/saved']}>
        <SavedScreen />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
