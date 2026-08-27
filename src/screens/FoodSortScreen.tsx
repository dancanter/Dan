import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { foodRules, FOOD_VERDICT_LABEL, type FoodVerdict } from '../content/foodRules';
import { Screen } from '../components/ui/Screen';
import { PromptCard, NothingToFinish, type Option } from '../components/learn/PromptCard';

const OPTIONS: Option[] = (['fine', 'cook-first', 'limit', 'avoid'] as FoodVerdict[]).map((v) => ({
  value: v,
  label: FOOD_VERDICT_LABEL[v],
}));

const TONE: Record<FoodVerdict, string> = {
  fine: 'bg-mossp text-mossd',
  'cook-first': 'bg-clayp text-clay',
  limit: 'bg-sand text-ink',
  avoid: 'bg-alertp text-alert',
};

/**
 * Food safety, sorted.
 *
 * Four buckets rather than two, because that is genuinely the shape of the
 * guidance — "cook it first" and "avoid" get collapsed together constantly,
 * and that conflation is most of why people think the list of banned foods is
 * far longer than it is. Brie is not banned; it needs heating.
 *
 * Every item, verdict and note comes from `foodRules.ts`, which is itself
 * checked against the food-safety guides at build time.
 */
export function FoodSortScreen() {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);

  // Shuffled once on mount so the order is not the same every visit, and so
  // the four buckets do not arrive in blocks.
  const deck = useMemo(() => {
    const items = [...foodRules];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, []);

  const item = deck[index % deck.length];

  return (
    <Screen
      title="Can I eat it?"
      lede="The food rules people get most tangled up in. Four answers, not two."
      width="reading"
    >
      <PromptCard
        eyebrow="Is this…"
        prompt={
          <p className="m-0 font-display text-[1.5rem] font-semibold leading-snug">{item.name}</p>
        }
        options={OPTIONS}
        answer={item.verdict}
        chosen={chosen}
        onChoose={setChosen}
        onNext={() => {
          setChosen(null);
          setIndex((i) => i + 1);
        }}
        reveal={
          <>
            <span
              className={`label-mono mb-2.5 inline-block rounded px-2.5 py-1 font-normal ${TONE[item.verdict]}`}
            >
              {FOOD_VERDICT_LABEL[item.verdict]}
            </span>
            <p className="m-0 text-[0.9375rem] leading-relaxed">{item.note}</p>
            <p className="mt-2.5">
              <Link
                to={`/healthy?open=${item.guideId}`}
                className="font-mono text-[0.6875rem] text-clay underline"
              >
                Read the full guidance →
              </Link>
            </p>
          </>
        }
      />

      <NothingToFinish>
        <>
          The useful bit isn’t getting them right — it’s that “cook it first” and “avoid” are
          different answers, and collapsing them is why the banned list feels far longer than it
          really is. All of it is in{' '}
          <Link to="/healthy" className="underline">
            Guidance
          </Link>
          .
        </>
      </NothingToFinish>
    </Screen>
  );
}
