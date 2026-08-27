import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { glossary } from '../content/glossary';
import { Screen } from '../components/ui/Screen';
import { PromptCard, NothingToFinish, type Option } from '../components/learn/PromptCard';

/**
 * The words, from the glossary the app already carries.
 *
 * Runs the other way round to a flashcard: it shows the plain-English
 * definition and asks which word it belongs to. That direction is the useful
 * one — nobody needs help recognising that "cholestasis" is a word, they need
 * to know which thing it is when a midwife says it.
 *
 * Every definition and every wrong option comes from `glossary.ts`, so there
 * is nothing medical written here and no way for a distractor to be a term the
 * app does not otherwise define.
 */
const CHOICES = 4;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function TermsScreen() {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);

  const deck = useMemo(() => shuffle(glossary), []);
  const entry = deck[index % deck.length];

  // Distractors are drawn from the glossary itself, so a wrong option is
  // always a real term someone might genuinely confuse this with.
  const options: Option[] = useMemo(() => {
    const others = shuffle(glossary.filter((g) => g.term !== entry.term)).slice(0, CHOICES - 1);
    return shuffle([entry, ...others]).map((g) => ({ value: g.term, label: g.term }));
  }, [entry]);

  return (
    <Screen
      title="What’s the word?"
      lede="The terms that get used around you without anyone stopping to explain them."
      width="reading"
    >
      <PromptCard
        eyebrow="Which one is this?"
        prompt={<p className="m-0 text-[1.0625rem] leading-relaxed">{entry.definition}</p>}
        options={options}
        answer={entry.term}
        chosen={chosen}
        onChoose={setChosen}
        onNext={() => {
          setChosen(null);
          setIndex((i) => i + 1);
        }}
        reveal={
          <>
            <p className="m-0 font-display text-[1.1875rem] font-semibold first-letter:uppercase">
              {entry.term}
            </p>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed">{entry.definition}</p>
            {entry.aliases && entry.aliases.length > 0 && (
              <p className="mt-2 font-mono text-[0.6875rem] text-soft">
                Also written: {entry.aliases.join(', ')}
              </p>
            )}
          </>
        }
      />

      <NothingToFinish>
        <>
          These words are tappable wherever they appear in the{' '}
          <Link to="/healthy" className="underline">
            guidance
          </Link>{' '}
          too, so you never have to remember them.
        </>
      </NothingToFinish>
    </Screen>
  );
}
