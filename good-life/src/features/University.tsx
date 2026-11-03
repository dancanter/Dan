import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { addDays, formatDay, startOfWeek, todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { useStore } from '@/store/store';
import type { Assessment, Flashcard, ParagraphDraft, Topic, TopicStatus } from '@/store/types';
import { AI_INTEGRITY, CAREER_PATH, PARAGRAPH_STEPS, PH_TERMS, SOURCE_HIERARCHY } from '@/data/academic';
import { assessmentStatus, dueCards, formatReference, minutesThisWeek, newCard, nextTopicReview, review, stageDates, suggestStudy, weeklyStudyMinutes, type Grade } from '@/engine/study';
import { BarsChart, ChartFrame } from '@/components/charts';
import { StudyForm } from '@/components/forms';
import { Badge, Button, Card, Empty, Field, Input, Meter, Note, PageHeader, Scale, Segmented, Select, Sheet, SourceRefs, Tabs, TextArea, cx } from '@/components/ui';

type Tab = 'overview' | 'assessments' | 'topics' | 'flashcards' | 'writing' | 'career';

export default function University() {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <div>
      <PageHeader eyebrow="University" title="Distinction, by design" subtitle="Spaced, active study; assignments planned backwards from the deadline; arguments built to evaluate, not describe." />
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ value: 'overview', label: 'Overview' }, { value: 'assessments', label: 'Assignments' }, { value: 'topics', label: 'Topics & notes' }, { value: 'flashcards', label: 'Flashcards' }, { value: 'writing', label: 'Writing studio' }, { value: 'career', label: 'Career' }]} />
      {tab === 'overview' && <Overview />}
      {tab === 'assessments' && <Assessments />}
      {tab === 'topics' && <Topics />}
      {tab === 'flashcards' && <Flashcards />}
      {tab === 'writing' && <Writing />}
      {tab === 'career' && <Career />}
    </div>
  );
}

function Overview() {
  const data = useStore((s) => s.data);
  const replaceAll = useStore((s) => s.replaceAll);
  const [log, setLog] = useState(false);
  const today = todayISO();
  const suggestion = suggestStudy(data, { fresh: true, tired: false, deadline: false, timeLimited: false });
  const weeks = Array.from({ length: 10 }, (_, i) => {
    const ws = startOfWeek(addDays(today, -7 * (9 - i)));
    const m = weeklyStudyMinutes(data, ws);
    return { week: ws.slice(5), ...Object.fromEntries(data.modules.map((x) => [x.code, Math.round(((m[x.code] ?? 0) / 60) * 10) / 10])) };
  });
  const setModule = (code: string, patch: Partial<(typeof data.modules)[number]>) => replaceAll({ ...data, modules: data.modules.map((m) => (m.code === code ? { ...m, ...patch } : m)) });
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {data.modules.map((m) => {
          const mins = minutesThisWeek(data, m.code);
          return (
            <Card key={m.code} eyebrow={`${m.credits} credits`} title={m.code}>
              <Input className="mb-3" value={m.title} placeholder="Module title (from your module website)" onChange={(e) => setModule(m.code, { title: e.target.value })} aria-label={`${m.code} title`} />
              <div className="mb-1 flex justify-between text-sm"><span>This week</span><span className="tabular text-muted">{(mins / 60).toFixed(1)} / {m.weeklyTargetHours} h</span></div>
              <Meter value={mins / 60} max={m.weeklyTargetHours} tone={mins / 60 >= m.weeklyTargetHours ? 'good' : 'navy'} />
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">Weekly target <Input className="h-8 min-h-0 w-16 py-1" inputMode="numeric" value={m.weeklyTargetHours} onChange={(e) => setModule(m.code, { weeklyTargetHours: Number(e.target.value) || 0 })} /> h</div>
            </Card>
          );
        })}
      </div>
      <Card eyebrow="Today" title={suggestion.headline} action={<Button variant="primary" size="sm" onClick={() => setLog(true)}><Plus size={14} /> Log study</Button>}>
        <ul className="space-y-2 text-sm">{suggestion.blocks.map((b, i) => <li key={i}><span className="font-medium">{b.moduleCode}</span> · {b.activity} ({b.minutes} min) <span className="text-muted">— {b.why}</span></li>)}</ul>
        <p className="mt-3 text-xs text-muted">The Open University guides roughly 16–18 hours a week for 60 credits — about 8–9 hours for each of your two 30-credit modules. Adjust the targets to your module guides.</p>
      </Card>
      <ChartFrame title="Study hours per week" subtitle="Last 10 weeks, by module" table={{ columns: ['Week', ...data.modules.map((m) => m.code)], rows: weeks.map((w) => [w.week, ...data.modules.map((m) => (w as Record<string, number | string>)[m.code] ?? 0)]) }}>
        <BarsChart data={weeks} x="week" stacked series={data.modules.slice(0, 3).map((m, i) => ({ key: m.code, label: m.code, colour: (['s1', 's2', 's3'] as const)[i] }))} />
      </ChartFrame>
      <Card tone="quiet" eyebrow="Evidence" title="How to study for a distinction">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li><strong>Retrieval beats re-reading.</strong> Testing yourself — flashcards, blank-page recall, answering practice questions — produced better long-term retention than restudying in controlled experiments.</li>
          <li><strong>Space it out.</strong> The same hours spread over days and weeks beat cramming, by a wide margin.</li>
          <li><strong>Detailed computer notes</strong> for understanding and reference; <strong>concise handwritten summaries</strong> for revision. The famous “longhand is better” finding did not clearly replicate — the benefit comes from summarising in your own words, not the pen itself.</li>
          <li><strong>Sleep the night after</strong> is part of learning.</li>
        </ul>
        <SourceRefs ids={['dunlosky2013', 'roediger2006', 'cepeda2006', 'mueller2014', 'morehead2019', 'diekelmann2010']} />
      </Card>
      <Sheet open={log} onClose={() => setLog(false)} title="Log study"><StudyForm onDone={() => setLog(false)} /></Sheet>
    </div>
  );
}

function Assessments() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const [edit, setEdit] = useState<Assessment | null>(null);
  const list = [...data.assessments].sort((a, b) => a.due.localeCompare(b.due));
  const blank = (): Assessment => ({ id: uid('as-'), moduleCode: data.modules[0]?.code ?? '', name: 'TMA 01', kind: 'TMA', due: addDays(todayISO(), 21), stages: {} });
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-2">Enter TMA and EMA dates from your module website. Each one is planned backwards: decode the question three weeks out, draft at nine days, critical revision at five, submit a day early.</p>
        <Button variant="primary" onClick={() => setEdit(blank())}><Plus size={14} /> Add</Button>
      </div>
      {list.length === 0 && <Empty title="No assignments yet" body="Add your first TMA to get a stage-by-stage plan and daily study suggestions that respond to it." />}
      {list.map((a) => {
        const st = assessmentStatus(a);
        return (
          <Card key={a.id} eyebrow={`${a.moduleCode} · ${a.kind}${a.weightPct ? ` · ${a.weightPct}%` : ''}`} title={a.name} action={<div className="flex items-center gap-2">{st.behind && <Badge tone="warn">behind plan</Badge>}<Badge tone={st.daysLeft <= 7 ? 'bad' : 'navy'}>{st.daysLeft >= 0 ? `${st.daysLeft} days` : 'past due'}</Badge></div>}>
            {a.question && <p className="mb-3 text-sm italic text-ink-2">{a.question}</p>}
            <Meter value={st.progressPct} max={100} tone="navy" />
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {stageDates(a).map((s) => (
                <li key={s.id} className={cx('rounded-xl border p-3 text-sm', s.done ? 'border-good/40 bg-good-soft/40' : s.date < todayISO() ? 'border-warn/50' : 'border-line')}>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" checked={s.done} onChange={(e) => upsert('assessments', { ...a, stages: { ...a.stages, [s.id]: e.target.checked } })} />
                    <span><span className="font-medium">{s.label}</span> <span className="text-xs text-muted">by {formatDay(s.date)}</span><span className="mt-0.5 block text-xs text-ink-2">{s.guide}</span></span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {a.wordLimit && (
                <span className="flex items-center gap-2">Words <Input className="h-8 min-h-0 w-20 py-1" inputMode="numeric" value={a.wordsWritten ?? ''} onChange={(e) => upsert('assessments', { ...a, wordsWritten: Number(e.target.value) || undefined })} /> / {a.wordLimit}</span>
              )}
              <Button size="sm" onClick={() => setEdit(a)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => remove('assessments', a.id)}><Trash2 size={13} /></Button>
            </div>
          </Card>
        );
      })}
      <Sheet open={!!edit} onClose={() => setEdit(null)} title="Assignment">{edit && <AssessmentForm a={edit} onDone={(x) => { upsert('assessments', x); setEdit(null); }} />}</Sheet>
    </div>
  );
}

function AssessmentForm({ a, onDone }: { a: Assessment; onDone: (a: Assessment) => void }) {
  const modules = useStore((s) => s.data.modules);
  const [v, setV] = useState(a);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Module"><Select value={v.moduleCode} onChange={(e) => setV({ ...v, moduleCode: e.target.value })}>{modules.map((m) => <option key={m.code}>{m.code}</option>)}</Select></Field>
        <Field label="Kind"><Select value={v.kind} onChange={(e) => setV({ ...v, kind: e.target.value as Assessment['kind'] })}>{['TMA', 'iCMA', 'EMA', 'Exam', 'Other'].map((k) => <option key={k}>{k}</option>)}</Select></Field>
        <Field label="Name"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
        <Field label="Due"><Input type="date" value={v.due} onChange={(e) => setV({ ...v, due: e.target.value })} /></Field>
        <Field label="Weighting %"><Input inputMode="numeric" value={v.weightPct ?? ''} onChange={(e) => setV({ ...v, weightPct: Number(e.target.value) || undefined })} /></Field>
        <Field label="Word limit"><Input inputMode="numeric" value={v.wordLimit ?? ''} onChange={(e) => setV({ ...v, wordLimit: Number(e.target.value) || undefined })} /></Field>
      </div>
      <Field label="Question (paste it in)"><TextArea rows={3} value={v.question ?? ''} onChange={(e) => setV({ ...v, question: e.target.value })} /></Field>
      <Button variant="primary" className="w-full" onClick={() => onDone(v)}>Save</Button>
    </div>
  );
}

const STATUS_LABEL: Record<TopicStatus, string> = { 'not-started': 'Not started', reading: 'Reading', notes: 'Notes done', revised: 'Revised', confident: 'Confident' };

function Topics() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const [mod, setMod] = useState(data.modules[0]?.code ?? '');
  const [name, setName] = useState('');
  const [open, setOpen] = useState<Topic | null>(null);
  const topics = data.topics.filter((t) => t.moduleCode === mod);
  const due = data.topics.filter((t) => t.nextReview && t.nextReview <= todayISO());
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={mod} onChange={setMod} options={data.modules.map((m) => ({ value: m.code, label: m.code }))} />
        {due.length > 0 && <Badge tone="warn">{due.length} topic{due.length > 1 ? 's' : ''} due for review</Badge>}
      </div>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a topic or unit — e.g. ‘Week 3: Innate immunity’" onKeyDown={(e) => { if (e.key === 'Enter' && name) { upsert('topics', { id: uid('tp-'), moduleCode: mod, name, status: 'not-started', confidence: 1, detailedNotes: '', handwrittenDone: false }); setName(''); } }} />
        <Button onClick={() => { if (name) { upsert('topics', { id: uid('tp-'), moduleCode: mod, name, status: 'not-started', confidence: 1, detailedNotes: '', handwrittenDone: false }); setName(''); } }}>Add</Button>
      </div>
      {topics.length === 0 ? <Empty title="No topics for this module" body="Add each unit as you start it. Rate your confidence after studying and the app schedules it to come back — sooner if shaky, later if solid." /> : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {topics.map((t) => (
            <li key={t.id} className="grid items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <button type="button" className="text-left font-medium hover:underline" onClick={() => setOpen(t)}>{t.name}{t.handwrittenDone && <span className="ml-2 text-xs text-good">✍ handwritten</span>}</button>
              <Select className="h-8 min-h-0 py-1 text-sm" value={t.status} onChange={(e) => upsert('topics', { ...t, status: e.target.value as TopicStatus })}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
              <span className="text-xs text-muted">{t.nextReview ? `review ${formatDay(t.nextReview)}` : 'not scheduled'}</span>
              <button type="button" aria-label="Delete topic" className="text-muted hover:text-bad" onClick={() => remove('topics', t.id)}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''} wide>
        {open && <TopicEditor topic={data.topics.find((t) => t.id === open.id) ?? open} onClose={() => setOpen(null)} />}
      </Sheet>
    </div>
  );
}

function TopicEditor({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const upsert = useStore((s) => s.upsert);
  const [notes, setNotes] = useState(topic.detailedNotes);
  const [conf, setConf] = useState(topic.confidence);
  return (
    <div className="space-y-4">
      <Field label="Detailed notes" hint="Your own words. Definitions, mechanisms, key evidence with full references, and your evaluation of it.">
        <TextArea rows={14} value={notes} onChange={(e) => setNotes(e.target.value)} className="font-[inherit]" />
      </Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={topic.handwrittenDone} onChange={(e) => upsert('topics', { ...topic, detailedNotes: notes, handwrittenDone: e.target.checked })} /> Concise handwritten revision page done (one side: key terms, a diagram, three evidence points, one evaluation)</label>
      <Scale label="Confidence after reviewing" labels={['shaky', 'could teach it']} value={conf} onChange={setConf} />
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => { upsert('topics', { ...topic, detailedNotes: notes, confidence: conf, lastReviewed: todayISO(), nextReview: nextTopicReview(conf) }); onClose(); }}>Save & schedule review</Button>
        <Button onClick={() => { upsert('topics', { ...topic, detailedNotes: notes }); onClose(); }}>Save notes only</Button>
      </div>
    </div>
  );
}

function Flashcards() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const due = dueCards(data);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [mod, setMod] = useState(data.modules[0]?.code ?? '');
  const card: Flashcard | undefined = due[idx];
  const grade = (g: Grade) => {
    if (!card) return;
    upsert('flashcards', review(card, g));
    setShow(false);
    setIdx(0);
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Card eyebrow={`${due.length} due`} title="Review">
        {card ? (
          <div>
            <div className="text-xs text-muted">{card.moduleCode}</div>
            <div className="my-6 font-serif text-3xl leading-snug">{card.front}</div>
            {show ? (
              <>
                <div className="rounded-xl bg-surface-2 p-4">{card.back}</div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {(['again', 'hard', 'good', 'easy'] as Grade[]).map((g) => <Button key={g} variant={g === 'good' ? 'primary' : 'secondary'} onClick={() => grade(g)}>{g[0].toUpperCase() + g.slice(1)}</Button>)}
                </div>
                <p className="mt-2 text-xs text-muted">Be honest: “again” brings it back tomorrow; “easy” pushes it weeks away.</p>
              </>
            ) : <Button variant="primary" onClick={() => setShow(true)}>Try to answer first — then reveal</Button>}
          </div>
        ) : <Empty title="Nothing due" body="All caught up. New cards and lapsed ones come back on a spaced schedule (SM-2)." />}
      </Card>
      <Card eyebrow="Make a card" title="One fact or idea per card">
        <div className="space-y-3">
          <Segmented value={mod} onChange={setMod} options={data.modules.map((m) => ({ value: m.code, label: m.code }))} size="sm" />
          <Field label="Question"><TextArea rows={2} value={front} onChange={(e) => setFront(e.target.value)} placeholder="What distinguishes vaccine efficacy from effectiveness?" /></Field>
          <Field label="Answer"><TextArea rows={3} value={back} onChange={(e) => setBack(e.target.value)} /></Field>
          <Button variant="primary" disabled={!front || !back} onClick={() => { upsert('flashcards', newCard({ id: uid('fc-'), moduleCode: mod, front, back })); setFront(''); setBack(''); }}>Add card</Button>
          <p className="text-xs text-muted">Good cards ask “why” and “how”, not only “what”. Write them from your notes, in your own words.</p>
        </div>
        <ul className="mt-4 max-h-64 divide-y divide-line overflow-auto text-sm">
          {data.flashcards.map((c) => <li key={c.id} className="flex items-center justify-between gap-2 py-1.5"><span className="truncate">{c.front}</span><span className="shrink-0 text-xs text-muted">{c.due}</span><button type="button" aria-label="Delete card" onClick={() => remove('flashcards', c.id)} className="text-muted hover:text-bad"><Trash2 size={13} /></button></li>)}
        </ul>
      </Card>
    </div>
  );
}

function Writing() {
  const data = useStore((s) => s.data);
  const upsert = useStore((s) => s.upsert);
  const nav = useNavigate();
  const [draft, setDraft] = useState<ParagraphDraft>(() => data.paragraphs.at(-1) ?? { id: uid('pg-'), title: 'Paragraph 1', fields: { point: '', evidence: '', explain: '', limitations: '', compare: '', evaluate: '', link: '' }, updated: new Date().toISOString() });
  const filled = PARAGRAPH_STEPS.filter((s) => draft.fields[s.key].trim()).length;
  const assembled = PARAGRAPH_STEPS.map((s) => draft.fields[s.key].trim()).filter(Boolean).join(' ');
  const words = assembled ? assembled.split(/\s+/).length : 0;
  const set = (k: keyof ParagraphDraft['fields'], v: string) => setDraft((d) => ({ ...d, fields: { ...d.fields, [k]: v }, updated: new Date().toISOString() }));
  const askCoach = () => {
    upsert('paragraphs', draft);
    sessionStorage.setItem('gl-coach-prefill', JSON.stringify({ mode: 'writing-feedback', text: `Please give me feedback on the structure and critical analysis of this paragraph I wrote. Do not rewrite it for me — tell me what is strong, what is missing, and questions I should ask myself.\n\n${PARAGRAPH_STEPS.map((s) => `${s.label.toUpperCase()}: ${draft.fields[s.key]}`).join('\n')}` }));
    nav('/coach');
  };
  return (
    <div className="space-y-6">
      <Card eyebrow="Paragraph builder" title="Point → Evidence → Explain → Limitations → Compare → Evaluate → Link" action={<Badge tone={filled === 7 ? 'good' : 'neutral'}>{filled}/7</Badge>}>
        <Input className="mb-4" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-label="Paragraph title" />
        <div className="space-y-4">
          {PARAGRAPH_STEPS.map((s) => (
            <div key={s.key}>
              <div className="mb-1 flex items-baseline justify-between"><span className="text-sm font-medium">{s.label}</span><span className="text-xs text-muted">{s.prompt}</span></div>
              <TextArea rows={2} value={draft.fields[s.key]} onChange={(e) => set(s.key, e.target.value)} placeholder={s.stems[0]} />
            </div>
          ))}
        </div>
        {filled < 7 && filled > 0 && <Note tone="warn">Missing: {PARAGRAPH_STEPS.filter((s) => !draft.fields[s.key].trim()).map((s) => s.label).join(', ')}. Limitations, comparison and evaluation are what separate a distinction from a pass — description alone caps the mark.</Note>}
        <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm">
          <div className="mb-1 flex justify-between text-xs text-muted"><span>Assembled paragraph</span><span>{words} words</span></div>
          {assembled || <span className="text-muted">Your paragraph appears here as you write.</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => upsert('paragraphs', draft)}>Save</Button>
          <Button onClick={() => navigator.clipboard?.writeText(assembled)}><Copy size={14} /> Copy</Button>
          <Button onClick={() => setDraft({ id: uid('pg-'), title: `Paragraph ${data.paragraphs.length + 1}`, fields: { point: '', evidence: '', explain: '', limitations: '', compare: '', evaluate: '', link: '' }, updated: new Date().toISOString() })}>New paragraph</Button>
          <Button variant="primary" disabled={filled < 2} onClick={askCoach}>Ask the coach for feedback</Button>
        </div>
        {data.paragraphs.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm">{data.paragraphs.map((p) => <button key={p.id} type="button" className="rounded-full border border-line px-3 py-1 hover:bg-surface-2" onClick={() => setDraft(p)}>{p.title}</button>)}</div>
        )}
      </Card>

      <ReferenceBuilder />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card eyebrow="Academic integrity" title="Using AI honestly">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">{AI_INTEGRITY.map((x, i) => <li key={i}>{x}</li>)}</ul>
          <p className="mt-3 text-xs text-muted">The coach in this app is set up to explain, question and give feedback — not to write assessed work for you.</p>
        </Card>
        <Card eyebrow="Sources" title="Which evidence to reach for">
          <ul className="space-y-2 text-sm">{SOURCE_HIERARCHY.map((s) => <li key={s.level}><span className="font-medium">{s.level}</span> <span className="text-muted">— {s.examples}.</span> <span className="text-ink-2">{s.use}</span></li>)}</ul>
          <p className="mt-3 text-xs text-muted">Always distinguish what a study shows (e.g. an association) from what you infer from it (e.g. a cause).</p>
        </Card>
      </div>

      <Card eyebrow="Terminology" title="Public health vocabulary">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{PH_TERMS.map((t) => <div key={t.term}><dt className="font-medium">{t.term}</dt><dd className="text-sm text-ink-2">{t.def}</dd></div>)}</dl>
        <SourceRefs ids={['tudorhart1971', 'marmot2010']} />
      </Card>
    </div>
  );
}

const REF_FIELDS: Record<'journal' | 'web' | 'report' | 'book', { key: string; label: string; ph?: string }[]> = {
  journal: [{ key: 'authors', label: 'Authors', ph: 'Smith, J., Jones, A. and Patel, R.' }, { key: 'year', label: 'Year' }, { key: 'title', label: 'Article title' }, { key: 'journal', label: 'Journal' }, { key: 'volume', label: 'Volume' }, { key: 'issue', label: 'Issue' }, { key: 'pages', label: 'Pages', ph: '405–412' }, { key: 'doi', label: 'DOI', ph: '10.xxxx/…' }],
  web: [{ key: 'authors', label: 'Author or organisation', ph: 'World Health Organization' }, { key: 'year', label: 'Year' }, { key: 'title', label: 'Page title' }, { key: 'url', label: 'URL' }, { key: 'accessed', label: 'Accessed', ph: '30 October 2026' }],
  report: [{ key: 'authors', label: 'Author or organisation', ph: 'NICE' }, { key: 'year', label: 'Year' }, { key: 'title', label: 'Title' }, { key: 'place', label: 'Place' }, { key: 'publisher', label: 'Publisher' }, { key: 'url', label: 'URL (if online)' }, { key: 'accessed', label: 'Accessed' }],
  book: [{ key: 'authors', label: 'Authors / editors' }, { key: 'year', label: 'Year' }, { key: 'title', label: 'Title' }, { key: 'edition', label: 'Edition', ph: '2nd' }, { key: 'place', label: 'Place' }, { key: 'publisher', label: 'Publisher' }],
};

function ReferenceBuilder() {
  const refs = useStore((s) => s.data.references);
  const upsert = useStore((s) => s.upsert);
  const remove = useStore((s) => s.remove);
  const [type, setType] = useState<'journal' | 'web' | 'report' | 'book'>('journal');
  const [f, setF] = useState<Record<string, string>>({});
  const out = formatReference(type, f);
  const sorted = useMemo(() => [...refs].sort((a, b) => formatReference(a.type, a.fields).list.localeCompare(formatReference(b.type, b.fields).list)), [refs]);
  return (
    <Card eyebrow="Harvard (Cite Them Right)" title="Reference builder">
      <Segmented value={type} onChange={(t) => { setType(t); }} options={[{ value: 'journal', label: 'Journal article' }, { value: 'web', label: 'Web page' }, { value: 'report', label: 'Report / guideline' }, { value: 'book', label: 'Book' }]} size="sm" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{REF_FIELDS[type].map((x) => <Field key={x.key} label={x.label}><Input value={f[x.key] ?? ''} placeholder={x.ph} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} /></Field>)}</div>
      <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm">
        <div className="text-xs text-muted">Reference list</div>
        <div className="mt-1" dangerouslySetInnerHTML={{ __html: out.list.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*([^*]+)\*/g, '<em>$1</em>') }} />
        <div className="mt-2 text-xs text-muted">In text: <span className="text-ink">{out.inText}</span></div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => navigator.clipboard?.writeText(out.list.replace(/\*/g, ''))}><Copy size={14} /> Copy</Button>
        <Button variant="primary" disabled={!f.title} onClick={() => { upsert('references', { id: uid('ref-'), type, fields: f, created: new Date().toISOString() }); setF({}); }}>Save to list</Button>
      </div>
      <p className="mt-2 text-xs text-muted">Check against Cite Them Right (free via the OU Library) — the OU’s standard. Italics shown here should be applied in your document.</p>
      {sorted.length > 0 && (
        <ol className="mt-4 space-y-2 text-sm">
          {sorted.map((r) => <li key={r.id} className="flex gap-2"><span className="flex-1" dangerouslySetInnerHTML={{ __html: formatReference(r.type, r.fields).list.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*([^*]+)\*/g, '<em>$1</em>') }} /><button type="button" aria-label="Delete reference" onClick={() => remove('references', r.id)} className="text-muted hover:text-bad"><Trash2 size={13} /></button></li>)}
        </ol>
      )}
    </Card>
  );
}

function Career() {
  return (
    <div className="space-y-4">
      <Card eyebrow="Long-term ambition" title="Towards Consultant in Public Health">
        <ol className="relative space-y-5 border-l border-line pl-6">
          {CAREER_PATH.map((c) => (
            <li key={c.stage}>
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-navy" aria-hidden />
              <div className="font-medium">{c.stage}</div>
              <p className="text-sm text-ink-2">{c.detail}</p>
              {c.links && <div className="mt-1 flex gap-3 text-sm">{c.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{l.label}</a>)}</div>}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-muted">Eligibility rules and recruitment for specialty training change; always check the current person specification before planning around it.</p>
      </Card>
      <Note>Highest-value career actions while studying: a distinction-level degree, one sustained piece of public-health experience you can describe with impact (a project, an audit, a health-improvement role), and a running record of what you did and learned.</Note>
    </div>
  );
}
