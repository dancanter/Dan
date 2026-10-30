import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// jsdom lacks these browser APIs; charts and the theme hook need them.
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= RO as unknown as typeof ResizeObserver;
if (!window.matchMedia) {
  window.matchMedia = ((q: string) => ({ matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as unknown as typeof window.matchMedia;
}
Element.prototype.scrollIntoView ??= function () {};
