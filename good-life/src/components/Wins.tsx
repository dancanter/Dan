import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { todayISO, type ISODate } from '@/lib/dates';
import { useStore } from '@/store/store';
import { achievements, currentStreak, dayScore, loggedDays, nextUp, rank, type Achievement, type AchievementGroup } from '@/engine/achievements';
import { Card, Meter, PageHeader, cx } from './ui';

function useWins() {
  const data = useStore((s) => s.data);
  return useMemo(() => {
    const list = achievements(data);
    const days = loggedDays(data);
    return { list, rank: rank(data, list), streak: currentStreak((x) => days.has(x)) };
  }, [data]);
}

function Badge({ a, size = 'md' }: { a: Achievement; size?: 'sm' | 'md' }) {
  return (
    <div className={cx('flex gap-3 rounded-2xl border p-3', a.unlocked ? 'border-bronze/40 bg-bronze-soft' : 'border-line bg-surface')}>
      <div className={cx('grid shrink-0 place-items-center rounded-full', size === 'sm' ? 'h-10 w-10 text-xl' : 'h-12 w-12 text-2xl', a.unlocked ? 'bg-surface shadow-card' : 'bg-surface-2 grayscale opacity-50')}>{a.emoji}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className={cx('text-sm font-medium', !a.unlocked && 'text-ink-2')}>{a.title}</div>
          {a.unlocked && <span className="text-xs text-bronze">✓</span>}
        </div>
        <div className="text-xs leading-snug text-muted">{a.detail}</div>
        {!a.unlocked && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1"><Meter value={a.value} max={a.target} /></div>
            <span className="shrink-0 text-[11px] tabular text-muted">{a.progressLabel ?? `${a.value}/${a.target}`}</span>
          </div>
        )}
        {a.unlocked && a.progressLabel && <div className="mt-1 text-[11px] text-muted">{a.progressLabel}</div>}
      </div>
    </div>
  );
}

/** Rank, streak and the nearest achievements, for the top of Today. */
export function WinsStrip() {
  const { list, rank: r, streak } = useWins();
  const next = nextUp(list, 2);
  const got = list.filter((a) => a.unlocked).length;
  const pct = r.next ? ((r.xp - r.floor) / (r.next - r.floor)) * 100 : 100;
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-navy font-serif text-xl text-navy-ink">{r.level}</div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Rank</div>
            <div className="font-serif text-xl leading-tight">{r.name}</div>
          </div>
        </div>
        <div className="min-w-40 flex-1">
          <div className="mb-1 flex justify-between text-xs text-muted"><span>{r.xp.toLocaleString('en-GB')} XP</span><span>{r.nextName ? `${r.nextName} at ${r.next!.toLocaleString('en-GB')}` : 'Top rank'}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-bronze" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center"><div className="font-serif text-2xl leading-none">{streak > 0 ? '🔥' : '·'} {streak}</div><div className="mt-1 text-[11px] text-muted">day streak</div></div>
          <Link to="/wins" className="text-center"><div className="font-serif text-2xl leading-none">🏅 {got}</div><div className="mt-1 text-[11px] text-muted underline underline-offset-2">of {list.length}</div></Link>
        </div>
      </div>
      {next.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{next.map((a) => <Badge key={a.id} a={a} size="sm" />)}</div>
      )}
    </Card>
  );
}

/** Today's score, live as the log fills in. */
export function DayScoreBar({ date }: { date: ISODate }) {
  const data = useStore((s) => s.data);
  const { score, parts } = useMemo(() => dayScore(data, date), [data, date]);
  const missing = parts.filter((p) => !p.earned);
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className={cx('font-serif text-3xl tabular leading-none', score === 100 && 'text-bronze')}>{score}</div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between text-xs"><span className="font-medium">{date === todayISO() ? 'Today’s score' : 'Day score'}</span><span className="text-muted">/100 · +XP</span></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface"><motion.div className="h-full rounded-full bg-good" initial={false} animate={{ width: `${score}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} /></div>
        </div>
      </div>
      <div className="mt-1.5 text-[11px] leading-snug text-muted">
        {score === 100 ? 'A perfect day. 💯' : `Still to earn: ${missing.map((p) => (p.label.startsWith('Habits') ? p.label : `${p.label} +${p.points}`)).join(' · ')}`}
      </div>
    </div>
  );
}

/** Pops up once for each newly unlocked achievement. */
export function AchievementToaster() {
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.data.settings.onboarded);
  const seen = useStore((s) => s.data.settings.seenAchievements);
  const patch = useStore((s) => s.patch);
  const { list } = useWins();
  const [shown, setShown] = useState<Achievement[]>([]);
  const unlockedIds = list.filter((a) => a.unlocked).map((a) => a.id);
  const fresh = unlockedIds.filter((id) => !(seen ?? []).includes(id));
  const key = fresh.join(',');

  useEffect(() => {
    if (!hydrated || !onboarded || !key) return;
    const ids = key.split(',');
    setShown(list.filter((a) => ids.includes(a.id)));
    patch('settings', { seenAchievements: [...new Set([...(seen ?? []), ...ids])] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hydrated, onboarded]);

  useEffect(() => {
    if (!shown.length) return;
    const t = setTimeout(() => setShown([]), 6000);
    return () => clearTimeout(t);
  }, [shown]);

  const first = shown[0];
  return (
    <AnimatePresence>
      {first && (
        <motion.div
          key={first.id}
          role="status"
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm lg:bottom-8"
        >
          <Link to="/wins" onClick={() => setShown([])} className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-bronze/50 bg-surface p-4 shadow-card">
            {['🎉', '✨', '🎊', '⭐', '✨'].map((c, i) => (
              <motion.span key={i} aria-hidden className="pointer-events-none absolute text-lg" style={{ left: `${12 + i * 19}%`, top: '50%' }} initial={{ y: 0, opacity: 1 }} animate={{ y: -60 - (i % 2) * 20, opacity: 0, rotate: (i - 2) * 40 }} transition={{ duration: 1.4, delay: 0.1 * i }}>{c}</motion.span>
            ))}
            <motion.div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bronze-soft text-2xl" initial={{ rotate: -30, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.15 }}>{first.emoji}</motion.div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.14em] text-bronze">Achievement unlocked</div>
              <div className="font-serif text-xl leading-tight">{first.title}</div>
              <div className="text-xs text-muted">{shown.length > 1 ? `+${shown.length - 1} more · see all your wins` : first.detail}</div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const GROUPS: AchievementGroup[] = ['Goals', 'Consistency', 'Running', 'Gym', 'Recovery', 'Study', 'Habits', 'Body & life'];

export default function WinsPage() {
  const data = useStore((s) => s.data);
  const { list, rank: r, streak } = useWins();
  const got = list.filter((a) => a.unlocked).length;
  const days = useMemo(() => loggedDays(data), [data]);
  const sleepStreak = currentStreak((x) => (data.checkIns[x]?.sleepHours ?? 0) >= data.profile.sleepTargetHours[0]);
  const stepStreak = currentStreak((x) => (data.checkIns[x]?.steps ?? 0) >= data.profile.stepsTarget);
  const studyStreak = currentStreak((x) => data.study.some((s) => s.date === x && !s.demo && s.minutes > 0));
  const pct = r.next ? ((r.xp - r.floor) / (r.next - r.floor)) * 100 : 100;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Wins" title="Earned, not given." subtitle="Every badge here comes from what you logged. They reward turning up, sleeping, easy days kept easy and rest days kept restful — never running harder more often." />
      <Card tone="navy">
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-hero-ink font-serif text-3xl text-hero">{r.level}</div>
          <div className="min-w-48 flex-1">
            <div className="text-[11px] uppercase tracking-[0.16em] opacity-70">Rank {r.level}</div>
            <div className="font-serif text-3xl">{r.name}</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-hero-ink" style={{ width: `${pct}%` }} /></div>
            <div className="mt-1 text-xs opacity-75">{r.xp.toLocaleString('en-GB')} XP{r.nextName ? ` · ${(r.next! - r.xp).toLocaleString('en-GB')} to ${r.nextName}` : ''}</div>
          </div>
          <div className="text-sm opacity-85">🏅 {got} of {list.length} unlocked<br />{days.size} days logged</div>
        </div>
        <p className="mt-4 text-xs opacity-70">XP: your day score (up to 100 a day) for every day logged, plus 50 per achievement.</p>
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['🔥', 'Logging', streak], ['😴', 'Sleep target', sleepStreak], ['🚶', 'Steps target', stepStreak], ['📚', 'Study', studyStreak]].map(([e, l, n]) => (
          <Card key={l as string} className="!p-4"><div className="font-serif text-3xl">{e} {n}</div><div className="mt-1 text-xs text-muted">{l} streak (days)</div></Card>
        ))}
      </div>
      {GROUPS.map((g) => {
        const items = list.filter((a) => a.group === g).sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
        if (!items.length) return null;
        return (
          <section key={g}>
            <h2 className="mb-3 flex items-baseline gap-2 font-serif text-2xl">{g}<span className="font-sans text-sm text-muted">{items.filter((a) => a.unlocked).length}/{items.length}</span></h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((a) => <Badge key={a.id} a={a} />)}</div>
          </section>
        );
      })}
    </div>
  );
}
