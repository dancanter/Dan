import { useEffect, useRef, useState } from 'react';
import { Atom, Leaf, Moon, Sparkles, Sun, User } from 'lucide-react';
import { todayISO } from '@/engine/body';
import { Today } from '@/screens/Today';
import { Foods } from '@/screens/Foods';
import { Cellular } from '@/screens/Cellular';
import { Body } from '@/screens/Body';
import { Rituals } from '@/screens/Rituals';
import { Me } from '@/screens/Me';

const TABS = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'foods', label: 'Foods', icon: Leaf },
  { id: 'cellular', label: 'Cellular', icon: Atom },
  { id: 'body', label: 'Body', icon: Moon },
  { id: 'rituals', label: 'Rituals', icon: Sparkles },
  { id: 'me', label: 'Me', icon: User },
] as const;
type TabId = (typeof TABS)[number]['id'];

// Inside The Good Life, Glow is one part of a single app: the tracker draws
// the header and the navigation, and tells Glow which screen to show.
const embedded = (() => { try { return window.parent !== window; } catch { return true; } })();

function readHash(): TabId {
  const h = location.hash.replace('#', '') as TabId;
  return TABS.some((t) => t.id === h) ? h : 'today';
}

export function App() {
  const [tab, setTab] = useState<TabId>(readHash);
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    const onHash = () => setTab(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (!embedded) return;
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; id?: string } | null;
      if (d?.type === 'glow-screen' && TABS.some((t) => t.id === d.id)) setTab(d.id as TabId);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  useEffect(() => {
    if (location.hash !== `#${tab}`) history.replaceState(null, '', `#${tab}`);
    window.scrollTo({ top: 0 });
  }, [tab]);
  // If the app is left open overnight and you were on "today", follow it to the new day.
  const lastToday = useRef(todayISO());
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      const now = todayISO();
      setDate((d) => (d === lastToday.current ? now : d));
      lastToday.current = now;
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div className={embedded ? 'mx-auto min-h-dvh max-w-2xl px-4 pt-3 pb-8' : 'mx-auto min-h-dvh max-w-2xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28'}>
      {!embedded && <header className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy text-gold"><Sun size={18} /></span>
        <span className="font-serif text-lg tracking-wide">Glow</span>
        <span className="text-xs text-muted">· cellular nutrition</span>
      </header>}
      <main>
        {tab === 'today' && <Today date={date} setDate={setDate} />}
        {tab === 'foods' && <Foods date={date} />}
        {tab === 'cellular' && <Cellular date={date} />}
        {tab === 'body' && <Body />}
        {tab === 'rituals' && <Rituals date={date} />}
        {tab === 'me' && <Me />}
      </main>
      {!embedded && <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="Sections">
        <ul className="mx-auto grid max-w-2xl grid-cols-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={`flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] ${tab === id ? 'text-gold' : 'text-muted'}`}>
                <Icon size={21} strokeWidth={tab === id ? 2.4 : 1.8} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>}
    </div>
  );
}
