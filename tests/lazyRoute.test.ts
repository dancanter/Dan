import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { reloadOnStaleChunk } from '../src/lib/lazyRoute';

/**
 * The bug: someone has the app open, a new version is deployed, they tap a tab
 * and get "This screen didn't load" — because the running page holds chunk
 * filenames the server no longer has. Reproduced in a browser as
 * `404 /assets/HealthyScreen-BwdkAvJq.js`.
 *
 * The fix reloads once and lands them where they asked. These tests pin the
 * guards that stop the fix being worse than the bug.
 */

const reload = vi.fn();

beforeEach(() => {
  reload.mockClear();
  window.sessionStorage.clear();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, reload },
  });
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const fails = () => Promise.reject(new Error('Failed to fetch dynamically imported module'));

describe('a lazily-loaded route after a deploy', () => {
  it('reloads once when a chunk has been replaced under it', async () => {
    void reloadOnStaleChunk('a', fails)();
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  });

  it('does not reload twice for the same route in one session', async () => {
    void reloadOnStaleChunk('b', fails)();
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));

    // The reload did not help — the chunk is genuinely gone. Stop.
    const second = reloadOnStaleChunk('b', fails)();
    await expect(second).rejects.toThrow();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when the device is offline', async () => {
    // A reload with no connection replaces a screen offering 111 and 999 with
    // a blank browser error. Offline belongs to the error boundary.
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    await expect(reloadOnStaleChunk('c', fails)()).rejects.toThrow();
    expect(reload).not.toHaveBeenCalled();
  });

  it('does not reload when there is nowhere to record that it tried', async () => {
    // A reload it cannot count is a reload that could loop.
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    await expect(reloadOnStaleChunk('d', fails)()).rejects.toThrow();
    expect(reload).not.toHaveBeenCalled();
  });

  it('stays out of the way when the chunk loads', async () => {
    const Screen = () => null;
    const result = await reloadOnStaleChunk('e', () => Promise.resolve({ default: Screen }))();
    expect(result.default).toBe(Screen);
    expect(reload).not.toHaveBeenCalled();
  });
});
