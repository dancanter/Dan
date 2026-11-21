import { addDays, todayISO } from '@/engine/body';
import { fromStrava } from '@/engine/training';
import { actions } from '@/store';
import { runtime } from '@/cloud';

// Pulls your recent Strava activities through the Strava connector on your
// Claude account. Only works when Glow is opened inside Claude, and only
// after you allow Strava for this page. Read-only: Glow never writes to Strava.

interface McpLike { callTool(server: string, tool: string, input?: unknown): Promise<{ payload?: unknown }> }

export type SyncResult = { ok: true; count: number } | { ok: false; message: string };

export async function stravaAvailable(): Promise<boolean> {
  const rt = runtime();
  if (!rt) return false;
  return !!(await rt.use('mcp'));
}

export async function syncStrava(days = 42): Promise<SyncResult> {
  const rt = runtime();
  const mcp = rt ? ((await rt.use('mcp')) as McpLike | null) : null;
  if (!mcp) return { ok: false, message: 'Strava sync works when Glow is opened inside Claude with the Strava connector connected.' };
  const start = `${addDays(todayISO(), -days)}T00:00:00`;
  const items: ReturnType<typeof fromStrava>[] = [];
  let after: string | undefined;
  try {
    for (let page = 0; page < 4; page++) {
      const res = await mcp.callTool('Strava', 'list_activities', { first: 100, range_start: start, ordering: 'StartDateLocalAsc', ...(after ? { after } : {}) });
      const p = res.payload as { activities?: Parameters<typeof fromStrava>[0][]; has_next_page?: boolean; end_cursor?: string } | undefined;
      for (const a of p?.activities ?? []) items.push(fromStrava(a));
      if (!p?.has_next_page || !p.end_cursor) break;
      after = p.end_cursor;
    }
  } catch (e) {
    const code = (e as { code?: string }).code;
    const message =
      code === 'server_not_connected' ? 'Strava isn’t connected to your Claude account. Add it in claude.ai Settings → Connectors.'
      : code === 'needs_reauth' ? 'Strava needs reconnecting in claude.ai Settings → Connectors.'
      : code === 'not_in_manifest' || code === 'approval_required' ? 'Strava isn’t allowed for this page yet. Tap Sync again and choose Allow.'
      : 'Couldn’t reach Strava just now. Try again in a minute.';
    return { ok: false, message };
  }
  actions.mergeStrava(items, new Date().toISOString());
  return { ok: true, count: items.length };
}
