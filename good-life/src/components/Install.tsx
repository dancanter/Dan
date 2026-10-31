import { useEffect, useState } from 'react';
import { Check, Copy, Download, Share, X } from 'lucide-react';
import { useStore } from '@/store/store';
import { applyLinkImport, makeDataLink } from '@/lib/linkImport';
import { Button, Card, Input, Note } from './ui';

// Installing as a phone app. Android Chrome offers a real install prompt;
// iPhone Safari only has Share → Add to Home Screen. On iPhone the home-screen
// app can keep its own storage, separate from Safari's, so data moves across
// with a copied link (everything after # stays on the phone).

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
}

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();

export function listenForInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    listeners.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((f) => f());
  });
}

function useInstall() {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    listeners.add(f);
    return () => void listeners.delete(f);
  }, []);
  const nav = navigator as Navigator & { standalone?: boolean };
  return {
    canPrompt: deferred != null,
    prompt: async () => {
      await deferred?.prompt();
      deferred = null;
    },
    standalone: matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true,
    ios: /iphone|ipad|ipod/i.test(navigator.userAgent),
  };
}

/** Copy a link carrying all the data; paste one in to load it. */
export function MoveData({ pasteOnly }: { pasteOnly?: boolean }) {
  const data = useStore((s) => s.data);
  const [copied, setCopied] = useState<'idle' | 'copied' | 'show'>('idle');
  const [link, setLink] = useState('');
  const [paste, setPaste] = useState('');
  const [msg, setMsg] = useState('');
  const copy = async () => {
    const l = await makeDataLink(data);
    setLink(l);
    try {
      await navigator.clipboard.writeText(l);
      setCopied('copied');
    } catch {
      setCopied('show');
    }
  };
  const load = async () => {
    setMsg('');
    try {
      if (await applyLinkImport(paste)) {
        setPaste('');
        setMsg('Loaded.');
      }
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  return (
    <div className="space-y-3">
      {!pasteOnly && <div className="flex flex-wrap items-center gap-2">
        <Button onClick={copy}>{copied === 'copied' ? <Check size={14} /> : <Copy size={14} />} {copied === 'copied' ? 'Link copied' : 'Copy a link with all my data'}</Button>
      </div>}
      {copied === 'show' && <Input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Your data link" />}
      <div className="flex gap-2">
        <Input value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste a Good Life link here" aria-label="Paste a data link" />
        <Button variant="primary" disabled={!paste.includes('import=')} onClick={load}>Load</Button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
      {!pasteOnly && <p className="text-xs text-muted">The link holds your data itself, so treat it like a diary: send it only to yourself.</p>}
    </div>
  );
}

/** How to get the app onto the phone, adapted to the device in hand. */
export function InstallCard({ dismissible }: { dismissible?: boolean }) {
  const { canPrompt, prompt, standalone, ios } = useInstall();
  const [hidden, setHidden] = useState(() => {
    try { return dismissible && localStorage.getItem('gl-install-hidden') === '1'; } catch { return false; }
  });
  if (hidden || (dismissible && standalone)) return null;
  const hide = () => {
    try { localStorage.setItem('gl-install-hidden', '1'); } catch { /* private mode */ }
    setHidden(true);
  };
  return (
    <Card
      eyebrow="Phone app"
      title={standalone ? 'You’re using the app ✓' : 'Put The Good Life on your home screen'}
      action={dismissible ? <button type="button" aria-label="Hide" onClick={hide} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2"><X size={16} /></button> : undefined}
    >
      {standalone ? (
        <p className="text-sm text-ink-2">It opens full-screen from its icon and works offline. If this copy is empty, paste the data link from Safari or Chrome below.</p>
      ) : canPrompt ? (
        <Button variant="primary" onClick={prompt}><Download size={14} /> Install app</Button>
      ) : ios ? (
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-2">
          <li>This must be open in <strong>Safari</strong> (not inside Gmail, WhatsApp or Chrome).</li>
          <li>Tap <strong>Copy a link with all my data</strong> below, before you add it, so your logs can come with you.</li>
          <li>Tap Share <Share size={13} className="inline -translate-y-0.5" /> at the bottom, then <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li>
          <li>Open it from the new icon. If it shows the welcome screen, tap <strong>Paste a link</strong> and paste. From then on, log in the icon app only.</li>
        </ol>
      ) : (
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-2">
          <li>In <strong>Chrome</strong>, open the ⋮ menu.</li>
          <li>Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).</li>
          <li>Open it from the icon. Your data comes with it on Android.</li>
        </ol>
      )}
      {(ios || standalone) && <div className="mt-4"><MoveData /></div>}
      {!ios && !standalone && <Note>On a laptop, Chrome and Edge show an install icon at the right of the address bar.</Note>}
    </Card>
  );
}
