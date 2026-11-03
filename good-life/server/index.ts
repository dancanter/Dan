// A deliberately small server: it holds the Anthropic API key (read from
// .env, never sent to the browser), answers /api/status and /api/coach, and
// in production also serves the built app. It listens on 127.0.0.1 only, so
// it is reachable from this computer and nowhere else unless HOST is set.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { COACH_SYSTEM, MODE_NOTES } from './prompt.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
try {
  process.loadEnvFile(join(root, '.env'));
} catch {
  /* no .env — fine, the coach just reports itself unavailable */
}

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? '127.0.0.1';
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5';
const EFFORT = (process.env.ANTHROPIC_EFFORT ?? 'medium') as 'low' | 'medium' | 'high';
const PROD = process.env.NODE_ENV === 'production';
const DIST = join(root, 'dist');
const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const client = hasKey ? new Anthropic() : null;

// Simple per-process rate limit: protects your API bill from a runaway loop.
const hits: number[] = [];
function rateLimited(): boolean {
  const now = Date.now();
  while (hits.length && now - hits[0] > 60_000) hits.shift();
  hits.push(now);
  return hits.length > 30;
}

async function readBody(req: IncomingMessage, limit = 300_000): Promise<string> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > limit) throw new Error('Request too large');
    chunks.push(c as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

interface CoachBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: string;
  mode: string;
}

function validate(x: unknown): CoachBody {
  const b = x as CoachBody;
  if (!b || !Array.isArray(b.messages) || typeof b.context !== 'string') throw new Error('Malformed request');
  const messages = b.messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 12_000) }));
  // The API needs the conversation to start with a user turn.
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new Error('The last message must be from the user');
  return { messages, context: b.context.slice(0, 60_000), mode: typeof b.mode === 'string' ? b.mode : 'chat' };
}

async function coach(req: IncomingMessage, res: ServerResponse) {
  if (!client) return json(res, 503, { error: 'No ANTHROPIC_API_KEY configured on the server.' });
  if (rateLimited()) return json(res, 429, { error: 'Too many requests — wait a minute.' });
  let body: CoachBody;
  try {
    body = validate(JSON.parse(await readBody(req)));
  } catch (e) {
    return json(res, 400, { error: (e as Error).message });
  }

  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
  const send = (evt: Record<string, unknown>) => res.write(`data: ${JSON.stringify(evt)}\n\n`);
  const controller = new AbortController();
  res.on('close', () => controller.abort());

  const request = (withFallback: boolean) =>
    client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: EFFORT },
        // If a safety classifier declines, the API re-runs the request on
        // Anthropic's recommended fallback model instead of failing.
        ...(withFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
        system: [
          { type: 'text', text: COACH_SYSTEM, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: `${MODE_NOTES[body.mode] ?? ''}\n\nDATA SNAPSHOT (from the app, today):\n${body.context}`.trim() },
        ],
        messages: body.messages,
      } as unknown as Parameters<typeof client.beta.messages.stream>[0],
      { signal: controller.signal },
    );

  try {
    let sent = false;
    let stream = request(true);
    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          sent = true;
          send({ type: 'text', text: event.delta.text });
        }
      }
    } catch (e) {
      // An account or platform without the fallback beta rejects the
      // request outright; retry once, plainly, before anything was sent.
      if (sent || !(e instanceof Anthropic.BadRequestError)) throw e;
      stream = request(false);
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') send({ type: 'text', text: event.delta.text });
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') send({ type: 'text', text: '\n\n(The model declined to answer this request.)' });
    if (final.stop_reason === 'max_tokens') send({ type: 'text', text: '\n\n(Reply cut short — ask me to continue.)' });
    send({ type: 'done' });
  } catch (e) {
    let message = 'The coach request failed.';
    if (e instanceof Anthropic.AuthenticationError) message = 'The API key was rejected — check ANTHROPIC_API_KEY in .env.';
    else if (e instanceof Anthropic.RateLimitError) message = 'Anthropic rate limit reached — try again shortly.';
    else if (e instanceof Anthropic.BadRequestError) message = `Request rejected: ${e.message}`;
    else if (e instanceof Anthropic.APIError) message = `API error ${e.status ?? ''}: ${e.message}`;
    else if (e instanceof Anthropic.APIConnectionError) message = 'Could not reach the Anthropic API (network).';
    else if ((e as Error).name === 'AbortError') message = 'stopped';
    if (!res.writableEnded) send({ type: 'error', message });
  } finally {
    res.end();
  }
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

async function serveStatic(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const safe = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, safe);
  if (!file.startsWith(DIST)) return json(res, 403, { error: 'Forbidden' });
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(DIST, 'index.html');
  }
  try {
    const buf = await readFile(file);
    const immutable = file.includes(`${join(DIST, 'assets')}`);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' });
    res.end(buf);
  } catch {
    json(res, 404, { error: 'Not found — run `npm run build` first.' });
  }
}

createServer(async (req, res) => {
  try {
    const path = (req.url ?? '/').split('?')[0];
    if (path === '/api/status' && req.method === 'GET') {
      return json(res, 200, hasKey ? { available: true, model: MODEL } : { available: false, reason: 'No Anthropic API key on the server. Add ANTHROPIC_API_KEY to .env and restart.' });
    }
    if (path === '/api/coach' && req.method === 'POST') return await coach(req, res);
    if (path.startsWith('/api/')) return json(res, 404, { error: 'Unknown endpoint' });
    if (PROD) return await serveStatic(req, res);
    json(res, 404, { error: 'In development the app is served by Vite on port 5180.' });
  } catch (e) {
    if (!res.headersSent) json(res, 500, { error: (e as Error).message });
  }
}).listen(PORT, HOST, () => {
  console.log(`The Good Life ${PROD ? 'app + ' : ''}API on http://${HOST}:${PORT} — AI coach ${hasKey ? `enabled (${MODEL}, effort ${EFFORT})` : 'disabled (no API key)'}`);
});
