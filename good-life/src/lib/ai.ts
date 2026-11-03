// Client for the coach endpoint. The API key never reaches the browser:
// requests go to this app's own server, which holds the key.

export interface AiStatus {
  available: boolean;
  model?: string;
  reason?: string;
}

export async function aiStatus(): Promise<AiStatus> {
  try {
    // Relative, so it works both at the root locally and under /good-life/ online.
    const r = await fetch('api/status', { headers: { accept: 'application/json' } });
    if (!r.ok || !r.headers.get('content-type')?.includes('json')) {
      return { available: false, reason: 'This online version has no coach server, so the offline coach is answering. The AI coach works when the app runs on your Mac with an API key (see the README).' };
    }
    return await r.json();
  } catch {
    return { available: false, reason: 'The coach server is not running (start the app with `npm run dev` or `npm start`).' };
  }
}

export type CoachMode = 'chat' | 'writing-feedback' | 'weekly-review';

export async function streamCoach(
  body: { messages: { role: 'user' | 'assistant'; content: string }[]; context: string; mode: CoachMode },
  onText: (t: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const r = await fetch('api/coach', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!r.ok || !r.body) {
    const msg = await r.text().catch(() => '');
    throw new Error(msg || `Coach request failed (${r.status})`);
  }
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const line = chunk.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const evt = JSON.parse(line.slice(6));
      if (evt.type === 'text') onText(evt.text);
      else if (evt.type === 'error') throw new Error(evt.message);
    }
  }
}
