/**
 * Ids for records the person creates. `crypto.randomUUID` is available in every
 * browser this PWA targets, but it's absent over plain HTTP on a LAN address
 * (a real case when testing the dev server from a phone), so there's a fallback.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
