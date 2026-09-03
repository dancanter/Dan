import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { foodRules, FOOD_VERDICT_LABEL, type FoodRule, type FoodVerdict } from '../../content';

/**
 * The supermarket question, answered in seconds.
 *
 * This screen used to be only a sorting game, which is a fine way to learn the
 * rules in advance and completely the wrong shape for the moment they actually
 * matter: standing in an aisle, holding a packet, needing one word. The game
 * is still here, below. This is the part you use with one hand.
 *
 * Nothing here is a new claim. Same 18 items, same verdicts, same one-line
 * reasons, same cited guides — a second way into the data that already exists.
 */

/** Colour supports the verdict; the words carry it. Never colour alone. */
const VERDICT_STYLE: Record<FoodVerdict, string> = {
  fine: 'border-moss bg-mossp text-mossd',
  'cook-first': 'border-clay bg-clayp text-clay',
  limit: 'border-clay bg-clayp text-clay',
  avoid: 'border-alert bg-alertp text-alert',
};

/**
 * Matches on any word start, so "tuna" finds "Tinned tuna" and "raw fish"
 * finds "Sushi with raw fish". A plain `startsWith` on the whole name would
 * fail both, which is most of what people actually type.
 */
function matches(rule: FoodRule, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  const haystack = `${rule.name} ${rule.note}`.toLowerCase();
  return q
    .split(/\s+/)
    .every((word) =>
      new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(haystack),
    );
}

export function FoodLookup() {
  const [query, setQuery] = useState('');
  const q = query.trim();

  const hits = useMemo(() => {
    if (!q) return [];
    const found = foodRules.filter((r) => matches(r, q));
    // Name matches first — someone typing "tuna" wants the tuna entry, not an
    // entry whose reason happens to mention it.
    return found.sort((a, b) => {
      const an = a.name.toLowerCase().includes(q.toLowerCase()) ? 0 : 1;
      const bn = b.name.toLowerCase().includes(q.toLowerCase()) ? 0 : 1;
      return an - bn;
    });
  }, [q]);

  // The label names the input and nothing else. It briefly also served as the
  // section's aria-labelledby, which made "Look something up" match two
  // elements — ambiguous to a test, and to a screen reader user hearing the
  // same name twice.
  return (
    <section className="mb-6">
      <label htmlFor="food-search" className="mb-1.5 block text-sm font-semibold">
        Look something up
      </label>
      <input
        id="food-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="brie, prawns, coffee…"
        autoComplete="off"
        className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
      />

      <div aria-live="polite">
        {q && hits.length > 0 && (
          <ul className="m-0 mt-3 list-none p-0">
            {hits.map((rule) => (
              <li
                key={rule.id}
                className={`mb-2.5 rounded-xl border-2 px-4 py-3.5 ${VERDICT_STYLE[rule.verdict]}`}
              >
                {/* The verdict first and largest. It is the whole answer; the
                    rest is why. */}
                <p className="label-mono m-0">{FOOD_VERDICT_LABEL[rule.verdict]}</p>
                <h3 className="mb-1 mt-0.5 text-[1.1875rem] text-ink">{rule.name}</h3>
                <p className="m-0 text-[0.9375rem] leading-relaxed text-ink">{rule.note}</p>
                <Link
                  to={`/healthy?open=${rule.guideId}`}
                  className="mt-1 inline-flex min-h-11 items-center text-[0.84375rem] font-semibold text-ink underline"
                >
                  Where this comes from
                </Link>
              </li>
            ))}
          </ul>
        )}

        {q && hits.length === 0 && (
          // Never a dead end. This list is short by design, and "not in my
          // list" must not read as "not allowed".
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-soft">
            Not one of the ones people ask about most. That doesn’t mean it’s a problem — try{' '}
            <Link to={`/healthy?q=${encodeURIComponent(q)}`} className="font-semibold underline">
              searching the guidance
            </Link>
            , or ask your midwife.
          </p>
        )}
      </div>
    </section>
  );
}
