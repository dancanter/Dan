import { APP_ID } from './backup';
import type { AppData } from '@/store/types';

// A starting profile can arrive inside a link: …/good-life/#import=z.<data>.
// Everything after "#" stays in the browser — it is never sent to the web
// server — so a profile link shared privately reaches only the person who
// opens it. "z." marks deflate-compressed JSON; "j." plain JSON.

export function hasLinkImport(hash = location.hash): boolean {
  return /[#&]import=/.test(hash);
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function inflate(bytes: Uint8Array): Promise<string> {
  const stream = new Response(bytes as BodyInit).body!.pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}

export async function readLinkImport(hash = location.hash): Promise<Partial<AppData>> {
  const raw = hash.match(/[#&]import=([^&]+)/)?.[1];
  if (!raw) throw new Error('No profile in this link.');
  const [kind, payload] = [raw.slice(0, 2), raw.slice(2)];
  const bytes = fromBase64Url(payload);
  const text = kind === 'z.' ? await inflate(bytes) : new TextDecoder().decode(bytes);
  const o = JSON.parse(text) as { app?: string; kind?: string; data?: Partial<AppData> };
  if (o.app !== APP_ID || o.kind !== 'starting-profile' || !o.data) throw new Error('This link does not contain a Good Life starting profile.');
  return o.data;
}

export function clearLinkImport() {
  history.replaceState(null, '', location.pathname + location.search);
}
