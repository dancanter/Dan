import { useEffect, useState } from 'react';

/**
 * Combines the OS-level `prefers-reduced-motion` media query with an
 * in-app override (Settings screen), so users who want to disable motion
 * without changing OS-wide settings still can.
 */
export function useReducedMotionSafe(userOverride: boolean): boolean {
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setSystemPrefersReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return userOverride || systemPrefersReduced;
}
