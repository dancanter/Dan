import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookOpen, Dumbbell, Footprints, Moon, Salad, Sparkles, Sun } from 'lucide-react';
import { addDays, formatLong, todayISO, weekday, WEEKDAYS_SHORT } from '@/lib/dates';
import { describeWeather, useWeather } from '@/lib/weather';
import { useStore } from '@/store/store';
import { buildToday, type OptionKey } from '@/engine/today';
import { BAND_LABEL } from '@/engine/readiness';
import { dayPlan, describeDay, weekDates, type Prescription } from '@/engine/plan';
import { ROADMAP } from '@/engine/review';
import { DAY_TYPE_LABEL } from '@/engine/nutrition';
import { HARD_TYPES } from '@/engine/running';
import { CheckInForm, FlagChips, RunForm, StudyForm } from '@/components/forms';
import { Badge, Button, Card, Note, Sheet, cx } from '@/components/ui';

const LEVEL_TONE = { green: 'good', amber: 'warn', red: 'bad', unknown: 'neutral' } as const;

export default function Today() {
  const data = useStore((s) => s.data);
  const today = todayISO();
  const { weather } = useWeather(data.profile.location);
  const plan = useMemo(() => buildToday(data, today, weather), [data, today, weather]);
  const [choice, setChoice] = useState<OptionKey | null>(null);
  const [sheet, setSheet] = useState<null | 'checkin' | 'run' | 'study'>(null);
  const [runRx, setRunRx] = useState<Prescription | null>(null);
  const [studyPreset, setStudyPreset] = useState<{ moduleCode?: string; activity?: string }>();
  const nav = useNavigate();
  const active = choice ?? plan.recommended;
  const opt = plan.options.find((o) => o.key === active)!;
  const checkIn = data.checkIns[today];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isReviewDay = weekday(today) === 1 && !data.reviews.some((r) => r.kind === 'weekly' && r.created.slice(0, 10) >= addDays(today, -1));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted">{formatLong(today)}</div>
          <h1 className="mt-1 font-serif text-4xl leading-tight sm:text-5xl">{greet}{data.profile.name ? `, ${data.profile.name}` : ''}.</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-2">
            <Link to="/analytics?tab=roadmap"><Badge tone="navy">{ROADMAP[data.roadmap.current].label}</Badge></Link>
            <span>{describeDay(plan.planned)}</span>
            {weather && <span className="text-muted">· {describeWeather(weather.code)}, {Math.round(weather.tempMax)}°C{weather.precipProb >= 40 ? `, ${weather.precipProb}% rain` : ''}</span>}
          </div>
        </div>
        {!checkIn ? (
          <Button variant="primary" onClick={() => setSheet('checkin')}><Sparkles size={16} /> 20-second check-in</Button>
        ) : (
          <Button onClick={() => setSheet('checkin')}>Edit check-in</Button>
        )}
      </header>

      <div>
        <div className="mb-1.5 text-xs text-muted">How is today, really?</div>
        <FlagChips date={today} />
      </div>

      {plan.warnings.length > 0 && (
        <Note tone="bad">
          <div className="flex gap-2"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><div>{plan.warnings.join(' ')}</div></div>
        </Note>
      )}

      {/* Recommendation */}
      <Card tone="navy" className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] opacity-70">Today’s recommendation</div>
            <div className="mt-1 font-serif text-3xl">{opt.label}</div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <Badge tone={LEVEL_TONE[plan.level]}>{plan.readiness.band ? BAND_LABEL[plan.readiness.band] : 'No check-in'}</Badge>
            <span className="text-xs opacity-70">{plan.state.label}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1 rounded-full bg-white/10 p-1">
          {plan.options.map((o) => (
            <button key={o.key} type="button" onClick={() => setChoice(o.key)} aria-pressed={active === o.key} className={cx('flex-1 rounded-full px-3 py-1.5 text-sm transition-colors', active === o.key ? 'bg-hero-ink text-hero font-medium' : 'opacity-80 hover:opacity-100')}>
              {o.label}{o.key === plan.recommended ? ' ★' : ''}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.14em] opacity-70"><Footprints size={14} /> Running</div>
            <div className="text-lg font-medium">{opt.running.title}</div>
            <ul className="mt-2 space-y-1.5 text-sm opacity-85">{opt.running.detail.map((d, i) => <li key={i}>{d}</li>)}</ul>
            {opt.running.prescription && (
              <button type="button" onClick={() => { setRunRx(opt.running.prescription); setSheet('run'); }} className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
                Log this run <ArrowRight size={14} />
              </button>
            )}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.14em] opacity-70"><Dumbbell size={14} /> Gym</div>
            <div className="text-lg font-medium">{opt.gym.title}</div>
            <p className="mt-2 text-sm opacity-85">{opt.gym.detail}</p>
            {plan.planned.gym && opt.key !== 'recovery' && (
              <button type="button" onClick={() => nav(`/performance?tab=gym&start=${plan.planned.gym}`)} className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
                Start session <ArrowRight size={14} />
              </button>
            )}
            <div className="mt-5 rounded-xl bg-white/10 p-3 text-sm"><strong>Trade-off.</strong> {opt.tradeoff}</div>
          </div>
        </div>
        {plan.reasons.length > 0 && (
          <details className="mt-5 text-sm">
            <summary className="cursor-pointer opacity-80 hover:opacity-100">Why this recommendation</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 opacity-85">{plan.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
            {plan.state.evidence.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 opacity-70">{plan.state.evidence.map((r, i) => <li key={i}>{r}</li>)}</ul>}
            <p className="mt-2 text-xs opacity-60">Readiness is a heuristic built from your check-in, not a physiological measurement. Self-reported wellbeing is a responsive indicator, but it is one signal among several.</p>
          </details>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card eyebrow={<span className="inline-flex items-center gap-1.5"><Salad size={13} /> Nutrition · {DAY_TYPE_LABEL[plan.nutrition.targets.dayType]}</span>} title={<span className="text-xl">{plan.nutrition.line}</span>} action={<Link to="/nutrition" className="text-sm text-muted hover:text-ink">Log food</Link>}>
          <ul className="space-y-1.5 text-sm text-ink-2">{plan.nutrition.timing.map((t, i) => <li key={i}>{t}</li>)}</ul>
          {data.profile.diet.coeliac && <p className="mt-3 text-xs text-muted">Strictly gluten-free throughout.</p>}
        </Card>
        <Card eyebrow={<span className="inline-flex items-center gap-1.5"><BookOpen size={13} /> University</span>} title={<span className="text-xl">{plan.study.headline}</span>} action={<Link to="/university" className="text-sm text-muted hover:text-ink">Open</Link>}>
          {plan.study.blocks.length ? (
            <ul className="space-y-2">
              {plan.study.blocks.map((b, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm">
                  <div><span className="font-medium">{b.moduleCode}</span> · {b.activity} <span className="text-muted">({b.minutes} min)</span><div className="text-xs text-muted">{b.why}</div></div>
                  <Button size="sm" onClick={() => { setStudyPreset({ moduleCode: b.moduleCode, activity: b.activity }); setSheet('study'); }}>Log</Button>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">Add your modules and assessment dates in University to get study blocks here.</p>}
        </Card>
        <Card eyebrow={<span className="inline-flex items-center gap-1.5"><Moon size={13} /> Recovery</span>} title={<span className="text-xl">Sleep and recovery</span>} action={<Link to="/recovery" className="text-sm text-muted hover:text-ink">Trends</Link>}>
          <ul className="space-y-1.5 text-sm text-ink-2">{plan.recovery.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </Card>
        <Card eyebrow={<span className="inline-flex items-center gap-1.5"><Sun size={13} /> Life</span>} title={<span className="text-xl">Enjoy being alive</span>} action={<Link to="/lifestyle" className="text-sm text-muted hover:text-ink">Ideas</Link>}>
          <ul className="space-y-1.5 text-sm text-ink-2">{plan.lifestyle.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </Card>
      </div>

      <WeekStrip />

      {isReviewDay && (
        <Card tone="quiet" title="Last week’s review is ready" action={<Button onClick={() => nav('/analytics?tab=reviews')}>Open review</Button>}>
          <p className="text-sm text-ink-2">What improved, what slipped, and the single highest-value change for this week.</p>
        </Card>
      )}

      <Sheet open={sheet === 'checkin'} onClose={() => setSheet(null)} title="Morning check-in"><CheckInForm onDone={() => setSheet(null)} /></Sheet>
      <Sheet open={sheet === 'run'} onClose={() => setSheet(null)} title="Log run"><RunForm prescription={runRx} onDone={() => setSheet(null)} /></Sheet>
      <Sheet open={sheet === 'study'} onClose={() => setSheet(null)} title="Log study"><StudyForm preset={studyPreset} onDone={() => setSheet(null)} /></Sheet>
    </div>
  );
}

function WeekStrip() {
  const data = useStore((s) => s.data);
  const today = todayISO();
  return (
    <Card eyebrow="This week" title={<span className="text-xl">Plan and what actually happened</span>} action={<Link to="/performance?tab=plan" className="text-sm text-muted hover:text-ink">Edit plan</Link>}>
      <div className="scrollbar-none -mx-1 overflow-x-auto px-1">
      <div className="grid min-w-[34rem] grid-cols-7 gap-1.5">
        {weekDates(today).map((d) => {
          const p = dayPlan(data, d);
          const ran = data.runs.filter((r) => r.date === d);
          const lifted = data.gym.some((g) => g.date === d);
          const isToday = d === today;
          return (
            <div key={d} className={cx('rounded-xl border p-2 text-center text-[11px]', isToday ? 'border-navy' : 'border-line', d < today ? 'bg-surface-2/50' : '')}>
              <div className={cx('mb-1 font-medium', isToday && 'text-ink')}>{WEEKDAYS_SHORT[weekday(d)]}</div>
              <div className="min-h-8 leading-tight text-muted">{p.run ? (p.run === 'threshold' ? 'Threshold' : p.run === 'q2' ? 'Quality' : p.run === 'speed' ? 'Speed' : 'Easy') : p.gym ? '' : 'Rest'}</div>
              <div className="mt-1 flex justify-center gap-1">
                {ran.length > 0 && <span className={cx('h-1.5 w-1.5 rounded-full', ran.some((r) => HARD_TYPES.includes(r.type)) ? 'bg-bronze' : 'bg-good')} title="Run logged" />}
                {lifted && <span className="h-1.5 w-1.5 rounded-full bg-navy" title="Gym logged" />}
              </div>
            </div>
          );
        })}
      </div>
      </div>
      <div className="mt-3 flex gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-good" /> easy run</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-bronze" /> hard run</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-navy" /> gym</span>
      </div>
    </Card>
  );
}
