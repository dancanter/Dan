import { useMemo, useState } from 'react';
import { CONFIDENCE_LABEL, GLOSSARY, SUPPLEMENTS, TOPICS, type Confidence } from '@/data/health';
import { EVIDENCE_LABEL, SOURCES, sourceLink, type EvidenceType } from '@/data/sources';
import { Badge, Card, Chip, ConfidenceBadge, Input, Note, PageHeader, SourceRefs, Tabs } from '@/components/ui';

type Tab = 'topics' | 'supplements' | 'glossary' | 'sources';

const VERDICT = {
  consider: ['Worth considering', 'good'],
  'if-indicated': ['Only if indicated', 'navy'],
  neutral: ['Optional / low priority', 'neutral'],
  'not-recommended': ['Not recommended', 'bad'],
} as const;

export default function Health() {
  const [tab, setTab] = useState<Tab>('topics');
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const match = (...xs: string[]) => !s || xs.join(' ').toLowerCase().includes(s);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Cellular health & longevity" title="What actually helps — and how sure we are" subtitle="Each claim carries its level of evidence: established in humans, observational, mechanistic, or speculative. Biological plausibility is not the same as demonstrated benefit." />
      <Note>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(CONFIDENCE_LABEL) as Confidence[]).map((c) => <ConfidenceBadge key={c} level={c} />)}
          <span className="text-xs">— read every claim with its label.</span>
        </div>
      </Note>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics, supplements, terms and sources — e.g. ‘autophagy’, ‘creatine’, ‘HRV’" />
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ value: 'topics', label: 'Topics' }, { value: 'supplements', label: 'Supplements' }, { value: 'glossary', label: 'Glossary' }, { value: 'sources', label: 'All sources' }]} />

      {tab === 'topics' && (
        <div className="space-y-8">
          {(['cellular', 'longevity'] as const).map((g) => {
            const topics = TOPICS.filter((t) => t.group === g && match(t.title, t.plain, t.how, t.claims.map((c) => c.text).join(' '), t.forYou.join(' ')));
            if (!topics.length) return null;
            return (
              <section key={g}>
                <h2 className="mb-3 font-serif text-3xl">{g === 'cellular' ? 'Cellular health' : 'Longevity'}</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {topics.map((t) => (
                    <Card key={t.id} title={t.title}>
                      <p className="text-ink">{t.plain}</p>
                      <p className="mt-2 text-sm text-ink-2"><strong className="font-medium text-ink">How it works.</strong> {t.how}</p>
                      <div className="mt-4 space-y-3">
                        {t.claims.map((c, i) => (
                          <div key={i} className="border-l-2 border-line pl-3">
                            <ConfidenceBadge level={c.level} />
                            <p className="mt-1 text-sm">{c.text}</p>
                            <SourceRefs ids={c.sources} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl bg-good-soft p-3 text-sm"><div className="mb-1 font-medium">For you</div><ul className="list-disc space-y-1 pl-5">{t.forYou.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
                      {t.overhyped && <div className="mt-2 rounded-xl bg-warn-soft p-3 text-sm"><div className="mb-1 font-medium">Overhyped</div><ul className="list-disc space-y-1 pl-5">{t.overhyped.map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === 'supplements' && (
        <div className="space-y-4">
          <Note>No supplement is recommended because it is popular. The default is food first; supplements earn a place only with good evidence, a clear reason, and a batch-tested product (look for Informed Sport or similar — contamination with banned or undeclared substances is a documented problem).</Note>
          <div className="grid gap-4 md:grid-cols-2">
            {SUPPLEMENTS.filter((x) => match(x.name, x.summary, x.forYou)).map((x) => (
              <Card key={x.id} title={<span className="text-xl">{x.name}</span>} action={<Badge tone={VERDICT[x.verdict][1]}>{VERDICT[x.verdict][0]}</Badge>}>
                <ConfidenceBadge level={x.evidence} />
                <p className="mt-2 text-sm">{x.summary}</p>
                <p className="mt-2 text-sm text-ink-2"><strong className="font-medium text-ink">For you:</strong> {x.forYou}</p>
                <SourceRefs ids={x.sources} />
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'glossary' && (
        <Card>
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {GLOSSARY.filter((g) => match(g.term, g.def)).map((g) => (
              <div key={g.term}><dt className="font-medium">{g.term}</dt><dd className="text-sm text-ink-2">{g.def}</dd></div>
            ))}
          </dl>
        </Card>
      )}

      {tab === 'sources' && <SourcesList match={match} />}

      <p className="text-xs text-muted">For any medical concern — symptoms, suspected deficiency, medication, hormones — see your GP or a relevant specialist. Nothing here is a diagnosis.</p>
    </div>
  );
}

function SourcesList({ match }: { match: (...xs: string[]) => boolean }) {
  const [type, setType] = useState<EvidenceType | 'all'>('all');
  const list = useMemo(() => SOURCES.filter((s) => (type === 'all' || s.type === type) && match(s.title, s.authors, s.journal ?? '', s.note ?? '')).sort((a, b) => b.year - a.year), [type, match]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2"><Chip active={type === 'all'} onClick={() => setType('all')}>All ({SOURCES.length})</Chip>{(Object.keys(EVIDENCE_LABEL) as EvidenceType[]).filter((t) => SOURCES.some((s) => s.type === t)).map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{EVIDENCE_LABEL[t]}</Chip>)}</div>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {list.map((s) => (
          <li key={s.id} className="px-4 py-3 text-sm">
            <a href={sourceLink(s)} target="_blank" rel="noreferrer" className="font-medium hover:underline">{s.title}</a>
            <div className="text-xs text-muted">{s.authors} ({s.year}){s.journal ? `. ${s.journal}` : ''}. <Badge>{EVIDENCE_LABEL[s.type]}</Badge></div>
            {s.note && <div className="mt-1 text-xs text-ink-2">{s.note}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
