import { APP_ID, mergeStartingProfile } from './backup';
import { migrate } from '@/store/defaults';
import { useStore } from '@/store/store';
import type { AppData } from '@/store/types';

// Data can arrive inside a link: …/good-life/#import=z.<data>.
// Everything after "#" stays in the browser — it is never sent to the web
// server — so a link shared privately reaches only the person who opens it.
// "z." marks deflate-compressed JSON; "j." plain JSON. Two kinds travel this
// way: a starting profile (merged into what is there) and a full copy of
// someone's data (for moving into a home-screen app or another device).

export interface LinkPayload {
  kind: 'starting-profile' | 'backup';
  data: Partial<AppData>;
}

export function hasLinkImport(hash = location.hash): boolean {
  return /[#&]import=/.test(hash);
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function inflate(bytes: Uint8Array): Promise<string> {
  const stream = new Response(bytes as BodyInit).body!.pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}

async function deflate(text: string): Promise<Uint8Array> {
  const stream = new Response(text).body!.pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Reads the payload from a hash, or from a whole pasted link. */
export async function readLinkImport(text = location.hash): Promise<LinkPayload> {
  const raw = text.trim().match(/[#&]import=([^&\s]+)/)?.[1];
  if (!raw) throw new Error('That isn’t a Good Life data link.');
  const [kind, payload] = [raw.slice(0, 2), raw.slice(2)];
  let o: { app?: string; kind?: string; data?: Partial<AppData> };
  try {
    const bytes = fromBase64Url(payload);
    o = JSON.parse(kind === 'z.' ? await inflate(bytes) : new TextDecoder().decode(bytes));
  } catch {
    throw new Error('That link is incomplete. Copy the whole link and try again.');
  }
  if (o.app !== APP_ID || (o.kind !== 'starting-profile' && o.kind !== 'backup') || !o.data) throw new Error('That link does not contain Good Life data.');
  return { kind: o.kind, data: o.data };
}

export function clearLinkImport() {
  history.replaceState(null, '', location.pathname + location.search);
}

/** Applies a link's data. Returns false if the person cancelled. */
export async function applyLinkImport(text = location.hash): Promise<boolean> {
  const { kind, data: incoming } = await readLinkImport(text);
  const { data, replaceAll, setNotice } = useStore.getState();
  if (kind === 'backup') {
    if (data.settings.onboarded && !confirm('Replace everything here with the data from this link?')) return false;
    replaceAll(migrate({ ...incoming, settings: { ...(incoming.settings ?? data.settings), onboarded: true } }));
    setNotice('All your data is here now. From now on, log in this copy of the app.');
    return true;
  }
  if (data.settings.onboarded && !confirm('Load the starting profile from this link into your data? Your logs are kept.')) return false;
  replaceAll({ ...mergeStartingProfile(data, incoming), settings: { ...data.settings, ...(incoming.settings ?? {}), onboarded: true } });
  const runs = incoming.runs?.length ? `, with ${incoming.runs.length} runs from Strava` : '';
  setNotice(`Your starting profile is loaded${runs}. What you log from here on is what makes the coaching personal.`);
  return true;
}

/** A link that carries everything (except coach chat) to another copy of the app. */
export async function makeDataLink(data: AppData): Promise<string> {
  const json = JSON.stringify({ app: APP_ID, kind: 'backup', data: { ...data, chat: [] } });
  return `${location.origin}${location.pathname}#import=z.${toBase64Url(await deflate(json))}`;
}
