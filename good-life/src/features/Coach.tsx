import { useEffect, useRef, useState } from 'react';
import { Send, Square, Trash2 } from 'lucide-react';
import { todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { aiStatus, streamCoach, type AiStatus, type CoachMode } from '@/lib/ai';
import { useStore } from '@/store/store';
import { buildContext } from '@/engine/context';
import { offlineReply } from '@/engine/offlineCoach';
import { Badge, Button, Chip, Disclosure, PageHeader, RichText, TextArea, cx } from '@/components/ui';

const PROMPTS = [
  'What should I do today?',
  'I’m exhausted today',
  'My legs are heavy',
  'I only have 45 minutes',
  'Are my running goals realistic?',
  'Is cutting to my target weight a good idea?',
  'Am I overtraining?',
  'How was my week?',
  'Quiz me on SK297',
];

export default function Coach() {
  const data = useStore((s) => s.data);
  const addChat = useStore((s) => s.addChat);
  const updateChat = useStore((s) => s.updateChat);
  const clearChat = useStore((s) => s.clearChat);
  const setCheckIn = useStore((s) => s.setCheckIn);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CoachMode>('chat');
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const useAi = data.settings.aiEnabled && status?.available;

  useEffect(() => {
    aiStatus().then(setStatus);
    const pre = sessionStorage.getItem('gl-coach-prefill');
    if (pre) {
      sessionStorage.removeItem('gl-coach-prefill');
      const p = JSON.parse(pre);
      setInput(p.text);
      setMode(p.mode);
    }
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [data.chat.length, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg = { id: uid('m-'), role: 'user' as const, content: text.trim(), created: new Date().toISOString() };
    addChat(userMsg);
    setInput('');
    const offline = () => {
      const r = offlineReply(useStore.getState().data, text);
      if (r.setFlags) setCheckIn(todayISO(), { flags: r.setFlags });
      addChat({ id: uid('m-'), role: 'assistant', content: r.text, created: new Date().toISOString(), source: 'offline' });
    };
    if (!useAi) return offline();
    // Flags mentioned in a message still adjust today, even with the AI on.
    const flagHint = offlineReply(useStore.getState().data, text);
    if (flagHint.setFlags) setCheckIn(todayISO(), { flags: flagHint.setFlags });
    const id = uid('m-');
    addChat({ id, role: 'assistant', content: '', created: new Date().toISOString(), source: 'ai' });
    setBusy(true);
    abort.current = new AbortController();
    let acc = '';
    try {
      const history = [...useStore.getState().data.chat.filter((m) => m.id !== id && m.content)].slice(-16).map((m) => ({ role: m.role, content: m.content }));
      await streamCoach({ messages: history, context: buildContext(useStore.getState().data), mode }, (t) => { acc += t; updateChat(id, acc); }, abort.current.signal);
      if (!acc) updateChat(id, '(No reply.)');
    } catch (e) {
      if ((e as Error).name === 'AbortError') updateChat(id, acc + ' …(stopped)');
      else {
        const r = offlineReply(useStore.getState().data, text);
        updateChat(id, `_The AI coach could not be reached (${(e as Error).message}). Offline answer:_\n\n${r.text}`);
      }
    } finally {
      setBusy(false);
      setMode('chat');
    }
  };

  return (
    <div className="flex min-h-[70dvh] flex-col">
      <PageHeader
        eyebrow="Coach"
        title="Ask anything"
        subtitle="Grounded in your own logs, honest about uncertainty, and willing to disagree with you."
        actions={
          <div className="flex items-center gap-2">
            {status == null ? <Badge>checking…</Badge> : useAi ? <Badge tone="good">AI connected · {status.model}</Badge> : <Badge tone="warn" title={status.reason}>Offline coach (rules-based)</Badge>}
            {data.chat.length > 0 && <Button size="sm" variant="ghost" onClick={clearChat}><Trash2 size={14} /> Clear</Button>}
          </div>
        }
      />
      {!useAi && status && (
        <p className="mb-4 text-sm text-muted">{data.settings.aiEnabled ? status.reason : 'AI is switched off in Settings.'} The offline coach answers common questions from the same engines the app uses — it cannot hold a free conversation.</p>
      )}

      <div className="flex-1 space-y-4">
        {data.chat.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line-strong p-6">
            <p className="mb-3 text-sm text-ink-2">Try one of these:</p>
            <div className="flex flex-wrap gap-2">{PROMPTS.map((p) => <Chip key={p} onClick={() => send(p)}>{p}</Chip>)}</div>
          </div>
        )}
        {data.chat.map((m) => (
          <div key={m.id} className={cx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[44rem] rounded-2xl px-4 py-3 text-[15px]', m.role === 'user' ? 'bg-navy text-navy-ink' : 'border border-line bg-surface')}>
              {m.role === 'assistant' && m.source === 'offline' && <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-muted">offline coach</div>}
              {m.content ? <RichText text={m.content.replace(/^_(.*)_$/gm, '$1')} /> : <span className="animate-pulse text-muted">Thinking…</span>}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="sticky bottom-20 mt-6 lg:bottom-4">
        {data.chat.length > 0 && <div className="scrollbar-none mb-2 flex gap-2 overflow-x-auto">{PROMPTS.slice(0, 5).map((p) => <Chip key={p} onClick={() => send(p)}>{p}</Chip>)}</div>}
        {mode === 'writing-feedback' && <div className="mb-2 text-xs text-bronze">Writing-feedback mode: the coach will comment and question, not rewrite.</div>}
        <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-surface p-2 shadow-card">
          <TextArea rows={2} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="“My legs are heavy and I have a TMA due Friday — what should this week look like?”" className="min-h-[3rem] border-0 bg-transparent shadow-none focus:shadow-none" />
          {busy ? <Button aria-label="Stop" onClick={() => abort.current?.abort()}><Square size={16} /></Button> : <Button variant="primary" aria-label="Send" onClick={() => send(input)} disabled={!input.trim()}><Send size={16} /></Button>}
        </div>
        <div className="mt-3">
          <Disclosure summary="What the coach sees (sent with each message)">
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed">{buildContext(data)}</pre>
            <p className="mt-2 text-xs">Every line is labelled MEASURED, REPORTED or ESTIMATED so the coach can keep the distinction. Progress photos are never sent. With the AI on, this text goes to Anthropic’s API via the app’s own server.</p>
          </Disclosure>
        </div>
      </div>
    </div>
  );
}
