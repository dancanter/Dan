import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { __resetStorageForTests } from '../src/lib/storage';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  // The storage module holds a process-wide cache, so clearing localStorage
  // alone would leave the previous test's values visible to the next one.
  __resetStorageForTests();
});

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
