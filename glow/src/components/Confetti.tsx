import { useEffect, useState } from 'react';

const COLOURS = ['#b8893b', '#f4d58d', '#1f7a8c', '#2e7d4f', '#13294b', '#e07a5f'];

/** A one-off burst of confetti whenever `fireKey` changes to a new non-empty value. */
export function Confetti({ fireKey }: { fireKey: string }) {
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (!fireKey) return;
    let seen = '';
    try { seen = sessionStorage.getItem('glow-confetti') ?? ''; } catch { /* ignore */ }
    if (seen.split('|').includes(fireKey)) return;
    try { sessionStorage.setItem('glow-confetti', `${seen}|${fireKey}`); } catch { /* ignore */ }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setBurst((b) => b + 1);
    const t = setTimeout(() => setBurst(0), 2600);
    return () => clearTimeout(t);
  }, [fireKey]);
  if (!burst) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      <style>{`@keyframes glow-fall { 0% { transform: translate3d(0,-10vh,0) rotate(0deg); opacity: 1 } 100% { transform: translate3d(var(--dx), 105vh, 0) rotate(var(--rot)); opacity: 0.9 } }`}</style>
      {Array.from({ length: 70 }, (_, i) => {
        const left = Math.random() * 100;
        const size = 6 + Math.random() * 7;
        return (
          <span key={`${burst}-${i}`} style={{
            position: 'absolute', left: `${left}%`, top: 0, width: size, height: size * 0.45, borderRadius: 2,
            background: COLOURS[i % COLOURS.length],
            animation: `glow-fall ${1.6 + Math.random() * 1.1}s cubic-bezier(.2,.6,.4,1) ${Math.random() * 0.4}s forwards`,
            ['--dx' as string]: `${(Math.random() - 0.5) * 30}vw`, ['--rot' as string]: `${Math.random() * 900 - 450}deg`,
          }} />
        );
      })}
    </div>
  );
}
