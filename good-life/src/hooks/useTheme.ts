import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';

/** Applies the theme setting, following the OS when set to "system". */
export function useApplyTheme() {
  const theme = useStore((s) => s.data.settings.theme);
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      try {
        localStorage.setItem('gl-theme', theme);
      } catch {
        /* private mode: the pre-paint script just falls back to the OS */
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

/** Resolved CSS token values, re-read when the theme flips (for charts). */
export function useTokens() {
  const read = () => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n: string) => cs.getPropertyValue(n).trim();
    return {
      s1: v('--series-1'),
      s2: v('--series-2'),
      s3: v('--series-3'),
      grid: v('--grid'),
      muted: v('--muted'),
      ink: v('--ink'),
      surface: v('--surface'),
      good: v('--good'),
      goodSoft: v('--good-soft'),
      warn: v('--warn'),
      bad: v('--bad'),
      line: v('--line-strong'),
      bronze: v('--bronze'),
    };
  };
  const [tokens, setTokens] = useState(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setTokens(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return tokens;
}
