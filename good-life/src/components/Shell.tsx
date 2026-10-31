import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity, BookOpen, Clapperboard, Compass, Dna, GraduationCap, HeartPulse, LayoutGrid, LineChart, MessageCircle, Moon, Plus,
  Salad, Settings as SettingsIcon, Shirt, Sun, Tag, Trophy, X,
} from 'lucide-react';
import { diffDays, todayISO } from '@/lib/dates';
import { hasDemoData, useStore } from '@/store/store';
import { ROADMAP } from '@/engine/review';
import { DayLog } from './DayLog';
import { AchievementToaster } from './Wins';
import { Button, Sheet, cx } from './ui';

export const NAV = [
  { to: '/', label: 'Today', icon: Sun, group: 'Daily' },
  { to: '/coach', label: 'Coach', icon: MessageCircle, group: 'Daily' },
  { to: '/wins', label: 'Wins', icon: Trophy, group: 'Daily' },
  { to: '/performance', label: 'Performance', icon: Activity, group: 'Body' },
  { to: '/physique', label: 'Physique', icon: HeartPulse, group: 'Body' },
  { to: '/nutrition', label: 'Nutrition', icon: Salad, group: 'Body' },
  { to: '/recovery', label: 'Recovery', icon: Moon, group: 'Body' },
  { to: '/health', label: 'Cellular Health', icon: Dna, group: 'Body' },
  { to: '/university', label: 'University', icon: GraduationCap, group: 'Mind' },
  { to: '/style', label: 'Style', icon: Shirt, group: 'Life' },
  { to: '/vinted', label: 'Vinted', icon: Tag, group: 'Life' },
  { to: '/culture', label: 'Culture', icon: Clapperboard, group: 'Life' },
  { to: '/lifestyle', label: 'Lifestyle', icon: Compass, group: 'Life' },
  { to: '/analytics', label: 'Analytics', icon: LineChart, group: 'Insight' },
] as const;

const MOBILE = ['/', '/performance', '/nutrition', '/university'];

export function Shell({ children }: { children: ReactNode }) {
  const data = useStore((s) => s.data);
  const storageError = useStore((s) => s.storageError);
  const clearDemo = useStore((s) => s.clearDemo);
  const [quick, setQuick] = useState(false);
  const [more, setMore] = useState(false);
  const notice = useStore((s) => s.notice);
  const setNotice = useStore((s) => s.setNotice);
  const loc = useLocation();
  const demo = hasDemoData(data);
  const lastBackup = data.settings.lastBackupAt?.slice(0, 10);
  const realLogs = data.runs.filter((r) => !r.demo).length + Object.values(data.checkIns).filter((c) => !c.demo).length;
  const backupDue = realLogs > 10 && (!lastBackup || diffDays(lastBackup, todayISO()) > 14);
  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-navy-ink">Skip to content</a>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-paper px-4 py-6 lg:flex">
        <NavLink to="/" className="mb-8 px-2">
          <div className="font-serif text-[1.7rem] italic leading-none">The Good Life</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">{ROADMAP[data.roadmap.current].label.split('·')[0].trim()}</div>
        </NavLink>
        <nav aria-label="Sections" className="flex-1 space-y-5 overflow-y-auto">
          {groups.map((g) => (
            <div key={g}>
              <div className="mb-1 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{g}</div>
              {NAV.filter((n) => n.group === g).map((n) => (
                <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => cx('flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors', isActive ? 'bg-surface font-medium text-ink shadow-card' : 'text-ink-2 hover:bg-surface-2')}>
                  <n.icon size={16} strokeWidth={1.75} />
                  {n.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <NavLink to="/settings" className={({ isActive }) => cx('mt-4 flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm', isActive ? 'bg-surface font-medium' : 'text-ink-2 hover:bg-surface-2')}>
          <SettingsIcon size={16} strokeWidth={1.75} /> Settings & data
        </NavLink>
      </aside>

      <div className="lg:pl-60">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur lg:hidden" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <NavLink to="/" className="font-serif text-xl italic">The Good Life</NavLink>
          <NavLink to="/settings" aria-label="Settings" className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2"><SettingsIcon size={18} /></NavLink>
        </header>

        {(demo || storageError || backupDue || notice) && (
          <div className="space-y-2 px-4 pt-4 sm:px-8">
            {notice && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-good-soft px-4 py-2.5 text-sm">
                <span>✓ {notice}</span>
                <Button size="sm" onClick={() => setNotice(null)}>OK</Button>
              </div>
            )}
            {demo && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bronze-soft px-4 py-2.5 text-sm">
                <span><strong>Demonstration data is showing.</strong> It is made up, so every screen has something to show. Your own logs are kept separately.</span>
                <Button size="sm" onClick={clearDemo}>Remove demo data</Button>
              </div>
            )}
            {storageError && <div className="rounded-xl bg-bad-soft px-4 py-2.5 text-sm">Your last change could not be saved: {storageError}. Export a backup from Settings now.</div>}
            {backupDue && !demo && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2 px-4 py-2.5 text-sm">
                <span>Your data lives only in this browser. {lastBackup ? `Last backup ${lastBackup}.` : 'No backup yet.'}</span>
                <NavLink to="/settings#data" className="font-medium underline underline-offset-2">Back up now</NavLink>
              </div>
            )}
          </div>
        )}

        <main id="main" key={loc.pathname} className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-8 sm:pt-10">
          {children}
        </main>
      </div>

      <AchievementToaster />

      {/* Quick log */}
      <button
        type="button"
        onClick={() => setQuick(true)}
        aria-label="Quick log"
        className="fixed bottom-20 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-navy text-navy-ink shadow-card transition-transform hover:scale-105 lg:bottom-8 lg:right-8"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Plus size={24} />
      </button>

      {/* Mobile bottom nav */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-paper/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.filter((n) => MOBILE.includes(n.to)).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => cx('flex flex-col items-center gap-0.5 py-2 text-[11px]', isActive ? 'text-ink' : 'text-muted')}>
            <n.icon size={20} strokeWidth={1.75} />
            {n.label === 'Performance' ? 'Train' : n.label === 'University' ? 'Study' : n.label === 'Nutrition' ? 'Fuel' : n.label}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMore(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted">
          <LayoutGrid size={20} strokeWidth={1.75} /> More
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-40 bg-paper p-5 lg:hidden" role="dialog" aria-label="All sections">
          <div className="mb-6 flex items-center justify-between">
            <div className="font-serif text-3xl">Everything</div>
            <button type="button" aria-label="Close" onClick={() => setMore(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2"><X /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...NAV, { to: '/settings', label: 'Settings', icon: SettingsIcon }].map((n) => (
              <NavLink key={n.to} to={n.to} onClick={() => setMore(false)} className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center text-xs">
                <n.icon size={22} strokeWidth={1.6} />
                {n.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted"><BookOpen size={14} /> Evidence and sources are linked from each section.</div>
        </div>
      )}

      <Sheet open={quick} onClose={() => setQuick(false)} title="Daily log">
        <DayLog compact />
        <p className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
          More detail when it is worth it: <NavLink to="/performance?tab=gym" onClick={() => setQuick(false)} className="underline">gym sets</NavLink> · <NavLink to="/nutrition" onClick={() => setQuick(false)} className="underline">food by item</NavLink> · <NavLink to="/university" onClick={() => setQuick(false)} className="underline">study by topic</NavLink> · <NavLink to="/lifestyle" onClick={() => setQuick(false)} className="underline">life</NavLink>
        </p>
      </Sheet>
    </div>
  );
}
