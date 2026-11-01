import { useMemo, useState } from 'react';
import { Clapperboard, Dices } from 'lucide-react';
import { FILMS, MOOD_LABEL, letterboxdUrl, type Mood } from '@/data/films';
import { actions, useStore } from '@/store';
import { Button, Card, Pill } from './ui';

// A stable empty value: a new object on every read would make the store loop.
const NO_FILMS = { seen: [] as string[], watchlist: [] as string[] };

export function MovieNight() {
  const films = useStore((s) => s.films ?? NO_FILMS);
  const [mood, setMood] = useState<Mood | 'all' | 'watchlist'>('all');
  const [pick, setPick] = useState<string | null>(null);
  const [showSeen, setShowSeen] = useState(false);
  const list = useMemo(() => FILMS.filter((f) => (mood === 'all' ? true : mood === 'watchlist' ? films.watchlist.includes(f.id) : f.moods.includes(mood))).filter((f) => showSeen || !films.seen.includes(f.id)), [mood, films, showSeen]);
  const unseen = list.filter((f) => !films.seen.includes(f.id));
  const picked = FILMS.find((f) => f.id === pick);
  return (
    <Card eyebrow="Joy menu" title={<span className="flex items-center gap-2"><Clapperboard size={18} className="text-gold" />Movie night</span>} action={<span className="text-xs text-muted">{films.seen.length} seen</span>}>
      <p className="mb-3 text-sm text-ink-2">{FILMS.length} acclaimed films, the kind that keep topping Letterboxd lists. Tick off what you’ve seen and Glow only suggests the rest. Tap a title for its current Letterboxd rating.</p>
      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {(['all', 'watchlist', ...Object.keys(MOOD_LABEL)] as (Mood | 'all' | 'watchlist')[]).map((m) => (
          <button key={m} onClick={() => { setMood(m); setPick(null); }} className={`shrink-0 rounded-full px-3 py-1 text-xs ${mood === m ? 'bg-navy text-navy-ink' : 'bg-surface-2 text-ink-2'}`}>
            {m === 'all' ? 'All' : m === 'watchlist' ? `★ Watchlist (${films.watchlist.length})` : MOOD_LABEL[m]}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button tone="gold" disabled={!unseen.length} onClick={() => setPick(unseen[Math.floor(Math.random() * unseen.length)].id)}><Dices size={16} />Pick one for me</Button>
        <label className="flex items-center gap-1.5 text-xs text-muted"><input type="checkbox" checked={showSeen} onChange={(e) => setShowSeen(e.target.checked)} />Show films I’ve seen</label>
      </div>
      {picked && (
        <div className="rise mb-3 rounded-2xl bg-gold-soft p-4">
          <div className="text-xs font-semibold tracking-wide text-gold uppercase">Tonight</div>
          <a href={letterboxdUrl(picked)} target="_blank" rel="noreferrer" className="font-serif text-xl underline-offset-2 hover:underline">{picked.title}</a>
          <div className="text-sm text-ink-2">{picked.year} · {picked.director}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">{picked.moods.map((m) => <Pill key={m}>{MOOD_LABEL[m]}</Pill>)}</div>
        </div>
      )}
      <ul className="max-h-96 divide-y divide-line overflow-y-auto">
        {list.map((f) => {
          const seen = films.seen.includes(f.id);
          const wl = films.watchlist.includes(f.id);
          return (
            <li key={f.id} className="flex items-center gap-2 py-2 text-sm">
              <a href={letterboxdUrl(f)} target="_blank" rel="noreferrer" className={`min-w-0 flex-1 ${seen ? 'text-muted line-through' : ''}`}>
                <span className="block truncate">{f.title}</span>
                <span className="block truncate text-xs text-muted">{f.year} · {f.director}</span>
              </a>
              <button aria-label={wl ? 'Remove from watchlist' : 'Add to watchlist'} onClick={() => actions.toggleFilm('watchlist', f.id)} className={`rounded-full px-2 py-1 text-xs ${wl ? 'bg-gold-soft text-gold' : 'bg-surface-2'}`}>★</button>
              <button onClick={() => actions.toggleFilm('seen', f.id)} className={`rounded-full px-2.5 py-1 text-xs ${seen ? 'bg-good-soft text-good' : 'bg-surface-2'}`}>{seen ? '✓ Seen' : 'Seen?'}</button>
            </li>
          );
        })}
        {!list.length && <li className="py-3 text-sm text-muted">Nothing left here. You’ve seen them all! Try another mood.</li>}
      </ul>
      <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-ink-2">
        <b>Make it good for you too:</b> watch with someone when you can (connection is the biggest mood lift), start early enough to finish by about 10:30 so sleep isn’t cut, and plan the snack instead of grazing: a Fage pot with berries and dark chocolate shavings, or air-popped popcorn with a little olive oil and salt.
      </div>
    </Card>
  );
}
