import { useMemo, useState } from 'react';
import { ExternalLink, Shuffle } from 'lucide-react';
import { todayISO } from '@/lib/dates';
import { useStore } from '@/store/store';
import { FILM_BY_ID, FILM_TAG_LABEL, FILMS, justWatchUrl, letterboxdUrl, type Film, type FilmTag } from '@/data/films';
import { Badge, Button, Card, Chip, Input, PageHeader, Segmented } from '@/components/ui';

type View = 'all' | 'watchlist' | 'watched';

export default function Culture() {
  const films = useStore((s) => s.data.films);
  const [tag, setTag] = useState<FilmTag | null>(null);
  const [view, setView] = useState<View>('all');
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<Film | null>(null);

  const list = useMemo(() => FILMS.filter((f) => (!tag || f.tags.includes(tag)) && (view === 'all' || films[f.id]?.status === view) && (!q || `${f.title} ${f.director} ${f.summary}`.toLowerCase().includes(q.toLowerCase()))), [tag, view, q, films]);

  // Recommend from what you rated highly: tags of 4–5 star films weigh more.
  const surprise = () => {
    const liked = Object.entries(films).filter(([, s]) => (s.rating ?? 0) >= 4).flatMap(([id]) => FILM_BY_ID[id]?.tags ?? []);
    const weight = (f: Film) => 1 + f.tags.filter((t) => liked.includes(t)).length;
    const pool = FILMS.filter((f) => films[f.id]?.status !== 'watched' && films[f.id]?.status !== 'skip');
    const total = pool.reduce((s, f) => s + weight(f), 0);
    let r = Math.random() * total;
    for (const f of pool) {
      r -= weight(f);
      if (r <= 0) return setPick(f);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Culture" title="Films worth an evening" subtitle="Melville’s Paris, Visconti’s Italy, Vinterberg’s Denmark, Connery’s Bond — sophisticated, intelligent, beautifully shot." actions={<Button variant="primary" onClick={surprise}><Shuffle size={16} /> Choose for me</Button>} />
      {pick && <FilmCard film={pick} highlight onClose={() => setPick(null)} />}
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={view} onChange={setView} options={[{ value: 'all', label: `All (${FILMS.length})` }, { value: 'watchlist', label: 'Watchlist' }, { value: 'watched', label: 'Watched' }]} />
        <Input className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or director" />
      </div>
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
        <Chip active={!tag} onClick={() => setTag(null)}>Everything</Chip>
        {(Object.keys(FILM_TAG_LABEL) as FilmTag[]).map((t) => <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>{FILM_TAG_LABEL[t]}</Chip>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((f) => <FilmCard key={f.id} film={f} />)}</div>
      <p className="text-xs text-muted">Titles, years and directors are long-established facts. Critic ratings and streaming availability change, so each film links to Letterboxd and JustWatch UK for the current picture rather than storing figures that would go stale. {Object.values(films).filter((f) => f.status === 'watched').length} watched so far.</p>
    </div>
  );
}

function FilmCard({ film, highlight, onClose }: { film: Film; highlight?: boolean; onClose?: () => void }) {
  const state = useStore((s) => s.data.films[film.id]);
  const setFilm = useStore((s) => s.setFilm);
  return (
    <Card tone={highlight ? 'navy' : 'default'} eyebrow={`${film.year} · ${film.director} · ${film.country}`} title={film.title} action={onClose && <button type="button" className="text-sm opacity-70" onClick={onClose}>Close</button>}>
      <p className="text-sm">{film.summary}</p>
      <p className={`mt-2 text-sm ${highlight ? 'opacity-80' : 'text-ink-2'}`}><em>Why:</em> {film.why}</p>
      <div className="mt-3 flex flex-wrap gap-1">{film.tags.map((t) => <Badge key={t}>{FILM_TAG_LABEL[t]}</Badge>)}</div>
      {film.similar.length > 0 && <p className={`mt-2 text-xs ${highlight ? 'opacity-70' : 'text-muted'}`}>If you like it: {film.similar.map((id) => FILM_BY_ID[id]?.title).filter(Boolean).join(' · ')}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={state?.status === 'watchlist' ? 'primary' : 'secondary'} onClick={() => setFilm(film.id, state?.status === 'watchlist' ? null : { status: 'watchlist' })}>{state?.status === 'watchlist' ? 'On watchlist' : '+ Watchlist'}</Button>
        <Button size="sm" variant={state?.status === 'watched' ? 'primary' : 'secondary'} onClick={() => setFilm(film.id, { status: 'watched', rating: state?.rating, date: todayISO() })}>Watched</Button>
        {state?.status === 'watched' && (
          <span className="flex gap-0.5" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} className={(state.rating ?? 0) >= n ? 'text-bronze' : 'text-line-strong'} onClick={() => setFilm(film.id, { ...state, rating: n })}>★</button>)}
          </span>
        )}
        <a href={letterboxdUrl(film)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs underline underline-offset-2">Letterboxd <ExternalLink size={10} /></a>
        <a href={justWatchUrl(film)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs underline underline-offset-2">Where to watch <ExternalLink size={10} /></a>
      </div>
    </Card>
  );
}
