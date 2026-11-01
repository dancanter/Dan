import { useMemo, useState } from 'react';
import { FOODS, type Food } from '@/data/foods';
import { ABSORPTION_BLOCKERS, ABSORPTION_BOOSTERS, BOOSTERS, COELIAC_AVOID, COELIAC_NUTRITION, COELIAC_SAFE, CUT_OUT, EVIDENCE_LABEL, GLOSSARY, PILLARS, SOURCES, type Pillar } from '@/data/science';
import { NUTRIENTS } from '@/data/nutrients';
import { dayResult } from '@/engine/game';
import { DEFAULT_PROFILE, scaleNutrients, targetsFor } from '@/engine/score';
import { useStore } from '@/store';
import { Bar, Card, EvidencePill, Pill, Segmented, scoreColour } from '@/components/ui';

type Tab = 'pillars' | 'cut' | 'coeliac' | 'absorb' | 'boost' | 'words' | 'sources';

/** The foods that move a pillar most per normal portion, ignoring anything it penalises. */
export function bestFoodsFor(p: Pillar, n = 6): Food[] {
  const t = targetsFor(DEFAULT_PROFILE, 57);
  const bad = new Set(p.penalties.map((x) => x.tag));
  return FOODS.filter((f) => !f.tags.some((tg) => bad.has(tg)) && f.n.kcal > 5 && !f.tags.includes('iodHigh'))
    .map((f) => {
      const portion = scaleNutrients(f.n, f.portion.g);
      let sum = 0;
      let w = 0;
      for (const c of p.components) {
        if (c.kind === 'nutrient') sum += c.w * Math.min(1, portion[c.key] / t[c.key]);
        else if (c.kind === 'tag') sum += c.w * (f.tags.includes(c.tag) || (c.tag === 'poly' && f.tags.includes('poly2')) ? Math.min(1, 1 / c.servings) * (f.tags.includes('poly2') ? 2 : 1) : 0);
        else if (c.key === 'protein') sum += c.w * Math.min(1, portion.protein / t.protein);
        w += c.w;
      }
      return { f, v: sum / w / Math.max(0.6, Math.sqrt(portion.kcal / 150)) };
    })
    .sort((a, b) => b.v - a.v)
    .slice(0, n)
    .map((x) => x.f);
}

export function Cellular({ date }: { date: string }) {
  const s = useStore((x) => x);
  const r = useMemo(() => dayResult(s, date), [s, date]);
  const [tab, setTab] = useState<Tab>('pillars');
  const best = useMemo(() => new Map(PILLARS.map((p) => [p.id, bestFoodsFor(p)])), []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Cellular</h1>
        <p className="text-sm text-ink-2">The science of ageing slowly, in plain words.</p>
      </div>
      <div className="-mx-1 overflow-x-auto px-1">
        <Segmented value={tab} onChange={setTab} options={[
          { value: 'pillars', label: '8 pillars' },
          { value: 'cut', label: 'Cut out' },
          { value: 'coeliac', label: 'Coeliac' },
          { value: 'absorb', label: 'Absorption' },
          { value: 'boost', label: 'Boosters' },
          { value: 'words', label: 'Glossary' },
          { value: 'sources', label: 'Sources' },
        ]} />
      </div>

      {tab === 'pillars' && (
        <>
          <Card>
            <p className="text-sm leading-relaxed text-ink-2">Scientists list <b>twelve hallmarks of ageing</b> (López-Otín et al., 2023): the cellular processes that go wrong as we age. You asked about eight, and that’s close: food can meaningfully push on about eight of them, so the app groups them into eight pillars. The eighth, skin, isn’t a hallmark at all. It’s where all the others show on your face.</p>
            <p className="mt-2 text-xs text-muted">Honest caveat: no food has been shown to reverse a hallmark in humans. Pillar scores tell you whether you’re supplying what each process needs, which is the controllable part.</p>
          </Card>
          {PILLARS.map((p) => {
            const score = r.analysis.pillars.find((x) => x.pillar.id === p.id)?.score ?? 0;
            return (
              <Card key={p.id} eyebrow={p.hallmarks.join(' · ')} title={<span>{p.emoji} {p.name}</span>} action={<span className="num font-serif text-2xl" style={{ color: scoreColour(score) }}>{score}</span>}>
                <Bar value={score} />
                <p className="mt-3 text-sm leading-relaxed">{p.what}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.why}</p>
                <div className="mt-3 rounded-xl bg-gold-soft p-3 text-sm"><b>Do this:</b> {p.topTip}</div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted">Best foods per portion:</span>
                  {best.get(p.id)!.map((f) => <Pill key={f.id} tone="sea">{f.name.split(/[(,]/)[0].trim()}</Pill>)}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <EvidencePill e={p.evidence} />
                  {p.components.filter((c) => c.kind === 'nutrient').map((c) => c.kind === 'nutrient' && <Pill key={c.key}>{NUTRIENTS[c.key].label}</Pill>)}
                </div>
              </Card>
            );
          })}
        </>
      )}

      {tab === 'cut' && (
        <>
          <Card><p className="text-sm text-ink-2">Ranked by how much each one matters <b>for you</b>, with the reason and the swap. “Cut” means it reliably works against your goals; “limit” means the dose is what matters.</p></Card>
          {CUT_OUT.map((c) => (
            <Card key={c.title} title={c.title} action={<Pill tone={c.verdict === 'cut' ? 'bad' : c.verdict === 'limit' ? 'warn' : 'sea'}>{c.verdict}</Pill>}>
              <p className="text-sm leading-relaxed">{c.why}</p>
              <p className="mt-2 rounded-xl bg-good-soft p-3 text-sm text-ink"><b>Instead:</b> {c.instead}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <EvidencePill e={c.evidence} />
                {c.pillars.map((id) => { const p = PILLARS.find((x) => x.id === id)!; return <Pill key={id}>{p.emoji} {p.name}</Pill>; })}
                {c.sources.map((id) => { const src = SOURCES.find((x) => x.id === id); return src && <a key={id} href={src.url} target="_blank" rel="noreferrer" className="text-[11px] text-sea underline">source</a>; })}
              </div>
            </Card>
          ))}
        </>
      )}

      {tab === 'coeliac' && (
        <>
          <Card eyebrow="Coeliac disease" title="Foods to stay away from">
            <p className="text-sm leading-relaxed text-ink-2">Coeliac disease isn’t an intolerance. Gluten (a protein in wheat, barley and rye) triggers your immune system to damage your small intestine. The only treatment is strict, lifelong gluten avoidance, and “a little” still counts. Gluten-free mode is {s.profile.glutenFree ? 'on' : <b className="text-bad">off: turn it on in Me</b>}, so any food containing gluten shows in red on Today.</p>
          </Card>
          {COELIAC_AVOID.map((g) => (
            <Card key={g.group} title={g.group} action={<Pill tone={g.level === 'never' ? 'bad' : g.level === 'check' ? 'warn' : 'gold'}>{g.level === 'never' ? 'never' : g.level === 'check' ? 'check label' : 'watch out'}</Pill>}>
              <p className="text-sm leading-relaxed">{g.items}</p>
              {g.note && <p className="mt-2 text-xs leading-relaxed text-ink-2">{g.note}</p>}
            </Card>
          ))}
          <Card title="Safe to eat freely" eyebrow="Naturally gluten-free"><p className="rounded-xl bg-good-soft p-3 text-sm leading-relaxed">{COELIAC_SAFE}</p></Card>
          {COELIAC_NUTRITION.map((n) => (
            <Card key={n.title} title={n.title}><p className="text-sm leading-relaxed text-ink-2">{n.text}</p></Card>
          ))}
          <p className="px-1 text-xs text-muted">Sources: NICE NG20; Coeliac UK. See the Sources tab.</p>
        </>
      )}

      {tab === 'absorb' && (
        <>
          <Card eyebrow="Bioavailability" title="What blocks absorption">
            <p className="text-sm leading-relaxed text-ink-2">How much of a nutrient you absorb depends on what you eat it with. Glow checks each meal you log and flags these combinations on Today.</p>
          </Card>
          {ABSORPTION_BLOCKERS.map((b) => (
            <Card key={b.blocker} title={b.blocker} action={<EvidencePill e={b.evidence} />}>
              <div className="mb-2 flex flex-wrap gap-1.5"><Pill tone="bad">blocks: {b.blocks}</Pill></div>
              <p className="text-xs text-muted">Found in: {b.where}</p>
              <p className="mt-2 text-sm leading-relaxed">{b.size}</p>
              <p className="mt-2 rounded-xl bg-good-soft p-3 text-sm"><b>Fix:</b> {b.fix}</p>
            </Card>
          ))}
          <Card title="What boosts absorption" eyebrow="Pair these">
            <ul className="space-y-3">
              {ABSORPTION_BOOSTERS.map((b) => <li key={b.title}><div className="font-medium">{b.title}</div><div className="text-sm leading-relaxed text-ink-2">{b.text}</div></li>)}
            </ul>
          </Card>
        </>
      )}

      {tab === 'boost' && (
        <>
          <Card><p className="text-sm text-ink-2">Beyond food and training, these are the extras worth knowing about, ranked honestly. The daily habits live in <b>Rituals</b>.</p></Card>
          {BOOSTERS.map((b) => (
            <Card key={b.title} title={b.title} action={<EvidencePill e={b.evidence} />}>
              <p className="text-sm leading-relaxed text-ink-2">{b.text}</p>
            </Card>
          ))}
          <Card title="What the evidence grades mean">
            <ul className="space-y-1 text-sm text-ink-2">{Object.entries(EVIDENCE_LABEL).map(([k, v]) => <li key={k}>{v}</li>)}</ul>
          </Card>
        </>
      )}

      {tab === 'words' && (
        <Card title="Glossary" eyebrow="The jargon, translated">
          <dl className="space-y-3">
            {GLOSSARY.map(([term, def]) => (
              <div key={term}><dt className="font-medium">{term}</dt><dd className="text-sm leading-relaxed text-ink-2">{def}</dd></div>
            ))}
          </dl>
        </Card>
      )}

      {tab === 'sources' && (
        <Card title="Sources">
          <ul className="space-y-2 text-sm">
            {SOURCES.map((src) => <li key={src.id}><a href={src.url} target="_blank" rel="noreferrer" className="text-sea underline-offset-2 hover:underline">{src.cite}</a></li>)}
          </ul>
          <p className="mt-3 text-xs text-muted">Food values are typical figures from USDA FoodData Central and UK composition tables, ±10–20%. Targets use the higher of UK and EFSA reference intakes; upper limits are EFSA tolerable upper intake levels.</p>
        </Card>
      )}
    </div>
  );
}
