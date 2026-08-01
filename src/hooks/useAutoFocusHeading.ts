import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Moves keyboard/screen-reader focus to the screen's main heading whenever
 * the route changes, so users aren't stranded on the previous screen's
 * scroll position or focus target after navigating.
 */
export function useAutoFocusHeading<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const location = useLocation();

  useEffect(() => {
    ref.current?.focus();
  }, [location.pathname]);

  return ref;
}
