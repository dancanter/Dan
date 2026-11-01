import { useMemo, useState } from 'react';
import { Copy, Plane } from 'lucide-react';
import { addDays, prettyDate, rolling, sortByDate, todayISO, toDisplay, weeklyRate } from '@/engine/body';
import { KIND_LABEL, defaultSeason, kcalForDate, phaseDayInfo, phaseOn, plannedWeight, seasonProgress, type Phase, type PhaseKind } from '@/engine/season';
import { actions, useStore } from '@/store';
import { cleanWeights } from '@/engine/calls';
import { Button, Card, LineChart, Pill } from './ui';

const KIND_COLOUR: Record<PhaseKind, string> = { cut: 'var(--sea)', peak: 'var(--gold)', travel: 'var(--gold)', maintain: 'var(--good)' };

/** What each phase is for, in one place. */
export const PHASE_GUIDE: Record<PhaseKind, { title: string; points: string[] }> = {
  cut: { title: 'How to cut without looking drained', points: [
    'Lose 0.5% of body weight a week (about 0.6 lb for you). Faster costs muscle, hormones and facial fullness.',
    'Protein at 2.0–2.2 g/kg every day, spread over 3–4 meals, each with 25–40 g.',
    'Put most of your carbohydrate around runs and lifts so quality sessions stay fast. Cut fat and snacks first, not training fuel.',
    'Keep steps steady at 10–13k. Don’t add extra cardio to speed things up: eat 100 kcal less on rest days instead.',
    'Sleep 8–9 hours. Short sleep turns the weight you lose from fat into muscle.',
    'One higher-carb day a week (at maintenance) around your hardest session keeps training and mood up.',
  ] },
  peak: { title: 'Peak days', points: ['Keep the routine you know: no new foods, supplements or skincare.', 'Normal carbs and steady salt make muscles look full. Sleep is the finishing touch.'] },
  travel: { title: 'Travel without losing your edge', points: [
    'Eat at maintenance and enjoy it. Three days can’t undo a month, and the 1–2 lb you’ll see afterwards is restaurant salt and carbs (water). It’s gone within 3–4 days of normal eating.',
    'Two protein-led meals a day: steak, fish, seafood, eggs, duck. Then enjoy the rest.',
    'Walk everywhere: 12–15k steps a day happens by itself on a city trip.',
    'Get morning daylight and keep your normal bedtime in local time (France is 1 hour ahead).',
    'On the flight: drink water, skip the alcohol and salty snacks, and walk the aisle. That’s how you land without a puffy face.',
  ] },
  maintain: { title: 'Recover & rebuild: hormones and cell renewal', points: [
    'Raise calories by about 150 kcal a week until your weight holds steady (a "reverse diet"). Glow does this automatically.',
    'Energy availability back to 45+ kcal/kg fat-free mass: this is when testosterone, thyroid hormone, sleep and skin recover.',
    'Carbohydrate back up around training, and fat at 25–30% of energy (hormones are built from cholesterol and fat).',
    'A deload week of training: lower volume, same intensity. Muscle and tendons rebuild in it.',
    'Protein can drop to 1.6–2.0 g/kg, because muscle is no longer under threat.',
    'In January, book your annual coeliac blood test plus ferritin, vitamin D, B12 and testosterone to see where you stand after the cut.',
    'You’ll gain 1–2 lb of glycogen and water in the first week. That’s fuel, not fat, and it makes you look fuller, not softer.',
  ] },
};

export function PhaseBanner({ date }: { date: string }) {
  const s = useStore((x) => x);
  const phase = phaseOn(s.profile.season, date);
  const kg = sortByDate(s.weights).filter((w) => w.date <= date).at(-1)?.kg;
  if (!phase) return null;
  const info = phaseDayInfo(phase, date);
  const k = kcalForDate(s.profile, date, kg);
  return (
    <div className="card rise flex items-center gap-3 p-3.5" style={{ borderLeft: `4px solid ${KIND_COLOUR[phase.kind]}` }}>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">{KIND_LABEL[phase.kind]} phase · day {info.day} of {info.of}</div>
        <div className="font-medium">{phase.name}</div>
        <div className="text-xs text-ink-2">{k.why}</div>
      </div>
      <div className="text-right"><div className="num font-serif text-2xl leading-none">{k.kcal.toLocaleString('en-GB')}</div><div className="text-[10px] text-muted">kcal today</div></div>
    </div>
  );
}

export function SeasonCard() {
  const s = useStore((x) => x);
  const today = todayISO();
  const season = s.profile.season;
  const unit = s.profile.unit;
  // Ignore the water-heavy mornings after a refeed.
  const weights = cleanWeights(s);
  const roll = rolling(weights);
  const proposal = useMemo(() => defaultSeason(today), [today]);
  const startKg = season ? (weights.find((w) => w.date >= season[0].start)?.kg ?? weights.at(-1)?.kg ?? 126.6 / 2.20462) : 126.6 / 2.20462;
  const avg = roll.at(-1)?.avg;
  const prog = season ? seasonProgress(season, startKg, today, avg, weeklyRate(weights)) : undefined;
  const d = (kg: number) => toDisplay(kg, unit).toFixed(1);

  if (!season) {
    return (
      <Card eyebrow="Season plan" title="Your winter, planned">
        <p className="mb-3 text-sm text-ink-2">Lean and sharp for France on 3 December, at your best by Christmas, then a proper recovery so your hormones and cells rebuild instead of rebounding. Glow sets your calorie target for each phase automatically.</p>
        <Timeline season={proposal} today={today} />
        <p className="mt-3 text-xs text-muted">At 0.5% a week from 126.6 lb, that lands you at about {d(plannedWeight(proposal, 126.6 / 2.20462, addDays(proposal[1].start, -1))!)} {unit} for France and {d(plannedWeight(proposal, 126.6 / 2.20462, proposal[2].end)!)} {unit} by Christmas, inside your 122–124 lb target without crash dieting.</p>
        <Button tone="gold" className="mt-3 w-full" onClick={() => actions.setProfile({ season: proposal })}>Start this plan</Button>
      </Card>
    );
  }
  const planLine = roll.filter((r) => r.date >= season[0].start).map((r) => ({ x: prettyDate(r.date), y: toDisplay(plannedWeight(season, startKg, r.date) ?? r.avg, unit) }));
  const actual = roll.filter((r) => r.date >= season[0].start).map((r) => ({ x: prettyDate(r.date), y: toDisplay(r.avg, unit) }));
  const current = phaseOn(season, today);
  return (
    <Card eyebrow="Season plan" title="Your winter" action={<Pill tone={prog?.verdict === 'behind' || prog?.verdict === 'too-fast' ? 'warn' : prog ? 'good' : 'neutral'}>{prog ? prog.verdict.replace('-', ' ') : 'needs weigh-ins'}</Pill>}>
      <Timeline season={season} today={today} />
      {actual.length >= 2 && (
        <div className="mt-4">
          <div className="mb-1 text-xs text-muted">Your 7-day average (navy) against the plan (gold), {unit}</div>
          <LineChart points={planLine} secondary={actual} colour="var(--navy)" unit={` ${unit}`} />
        </div>
      )}
      {prog && <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">Plan says <b className="num">{d(prog.planned)}</b>, you’re at <b className="num">{d(prog.actual)}</b> {unit}. {prog.advice}</p>}
      {current && (
        <details className="mt-3 text-sm" open>
          <summary className="cursor-pointer font-medium">{PHASE_GUIDE[current.kind].title}</summary>
          <ul className="mt-2 space-y-1.5 text-ink-2">{PHASE_GUIDE[current.kind].points.map((p) => <li key={p}>• {p}</li>)}</ul>
        </details>
      )}
      <EditSeason season={season} />
    </Card>
  );
}

function Timeline({ season, today }: { season: Phase[]; today: string }) {
  return (
    <ol className="space-y-2">
      {season.map((p) => {
        const now = today >= p.start && today <= p.end;
        const done = today > p.end;
        return (
          <li key={p.id} className={`flex items-center gap-3 rounded-xl p-2.5 ${now ? 'bg-gold-soft' : 'bg-surface-2'} ${done ? 'opacity-50' : ''}`}>
            <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: KIND_COLOUR[p.kind] }} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{p.name}{now && <span className="ml-2 text-xs text-gold">← now</span>}</div>
              <div className="text-xs text-muted">{prettyDate(p.start)} – {prettyDate(p.end)} · {KIND_LABEL[p.kind]}{p.ratePct ? ` · ${p.ratePct}% a week` : ''}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function EditSeason({ season }: { season: Phase[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(season);
  if (!open) return <button className="mt-3 text-sm text-sea" onClick={() => { setDraft(season); setOpen(true); }}>Edit dates and phases</button>;
  const set = (i: number, patch: Partial<Phase>) => setDraft(draft.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <div className="mt-3 space-y-3 rounded-xl bg-surface-2 p-3">
      {draft.map((p, i) => (
        <div key={p.id} className="grid grid-cols-2 gap-2 text-xs text-muted">
          <label className="col-span-2">Name<input className="field mt-1" value={p.name} onChange={(e) => set(i, { name: e.target.value })} /></label>
          <label>From<input type="date" className="field mt-1" value={p.start} onChange={(e) => set(i, { start: e.target.value })} /></label>
          <label>To<input type="date" className="field mt-1" value={p.end} onChange={(e) => set(i, { end: e.target.value })} /></label>
          <label>Type<select className="field mt-1" value={p.kind} onChange={(e) => set(i, { kind: e.target.value as PhaseKind, ratePct: e.target.value === 'cut' ? -0.5 : 0 })}>{(Object.keys(KIND_LABEL) as PhaseKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></label>
          {p.kind === 'cut' && <label>Rate per week<select className="field mt-1" value={p.ratePct} onChange={(e) => set(i, { ratePct: Number(e.target.value) })}>{[-0.25, -0.4, -0.5, -0.6, -0.75].map((r) => <option key={r} value={r}>{r}%</option>)}</select></label>}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { actions.setProfile({ season: [...draft].sort((a, b) => a.start.localeCompare(b.start)) }); setOpen(false); }}>Save</Button>
        <Button tone="ghost" onClick={() => setDraft([...draft, { id: `p${Date.now()}`, name: 'New phase', kind: 'maintain', start: addDays(draft.at(-1)!.end, 1), end: addDays(draft.at(-1)!.end, 28), ratePct: 0 }])}>Add phase</Button>
        <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button tone="danger" onClick={() => { actions.setProfile({ season: undefined }); setOpen(false); }}>Remove plan</Button>
      </div>
    </div>
  );
}

const FRENCH_CARD = 'Je suis cœliaque. Je ne peux pas manger de gluten : ni blé, ni orge, ni seigle, ni avoine non certifiée sans gluten. Même une petite quantité (miettes, farine, huile de friture partagée) me rend malade. Pourriez-vous m’indiquer les plats sans gluten ?';

export function TravelGuide({ date }: { date: string }) {
  const season = useStore((s) => s.profile.season);
  const trip = season?.find((p) => p.kind === 'travel' && p.end >= date);
  const [copied, setCopied] = useState(false);
  if (!trip) return null;
  return (
    <Card eyebrow={`Travel mode · ${prettyDate(trip.start)}`} title={<span className="flex items-center gap-2"><Plane size={18} className="text-gold" />{trip.name}: eat well, stay sharp</span>}>
      <div className="space-y-4 text-sm leading-relaxed">
        <div>
          <div className="mb-1 font-medium">Your coeliac card (show it to the waiter)</div>
          <p className="rounded-xl bg-surface-2 p-3 font-serif text-[15px] italic select-all">{FRENCH_CARD}</p>
          <p className="mt-1 text-xs text-muted">“I have coeliac disease. I can’t eat gluten: no wheat, barley, rye or non-certified oats. Even a small amount (crumbs, flour, shared frying oil) makes me ill. Could you show me the gluten-free dishes?” Look for <b>sans gluten</b> on menus and labels, and the AFDIAG logo in shops.</p>
          <Button tone="ghost" className="mt-2" onClick={async () => { try { await navigator.clipboard.writeText(FRENCH_CARD); setCopied(true); } catch { setCopied(false); } }}><Copy size={15} />{copied ? 'Copied' : 'Copy the French'}</Button>
        </div>
        <div>
          <div className="mb-1 font-medium">Usually safe and very good</div>
          <p className="text-ink-2">Steak (entrecôte, onglet, filet) with salad, or potatoes cooked in their own pan. Moules marinières (check there’s no flour in the sauce). Huîtres and plateau de fruits de mer. Confit de canard. Steak tartare without toast. Salade niçoise. Grilled fish (poisson grillé, loup, dorade). Cheese board without bread. Crème brûlée, île flottante, sorbet. Macarons are almond-based, but ask about cross-contamination.</p>
        </div>
        <div>
          <div className="mb-1 font-medium">Avoid or ask first</div>
          <p className="text-ink-2">Baguette, croissants and all viennoiserie. Croque monsieur, quiche, tarte. Sauces thickened with flour (béchamel, many velouté and gravy-style sauces, “sauce au poivre” sometimes). Frites (shared fryer with breaded food). Galettes de sarrasin are buckwheat, but many crêperies add wheat flour, so ask for “100% sarrasin”. Beer.</p>
        </div>
        <div>
          <div className="mb-1 font-medium">Pack</div>
          <p className="text-ink-2">Gluten-free oatcakes, nuts, a couple of protein bars you know you tolerate, and a tin or two of mackerel or sardines (vitamin D and protein on the go). French pharmacies and Monoprix/Carrefour stock “sans gluten” bread and crackers.</p>
        </div>
        <ul className="space-y-1 text-ink-2">{PHASE_GUIDE.travel.points.map((p) => <li key={p}>• {p}</li>)}</ul>
      </div>
    </Card>
  );
}
