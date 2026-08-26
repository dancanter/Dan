import { useState } from 'react';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useJournal, JOURNAL_LABEL, MOODS, type JournalKind } from '../hooks/useJournal';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Note } from '../components/ui/Note';
import { formatDate } from '../lib/dates';

const TABS: { id: JournalKind; label: string }[] = [
  { id: 'mood', label: 'Mood' },
  { id: 'note', label: 'Notes' },
  { id: 'question', label: 'For my midwife' },
  { id: 'symptom', label: 'Symptoms' },
];

const MOOD_EMOJI = new Map<string, string>(MOODS.map((m) => [m.value, m.emoji]));

export function JournalScreen() {
  const { currentWeek } = usePregnancyProfile();
  const { entries, add, remove, moodHistory } = useJournal();

  const [tab, setTab] = useState<JournalKind>('mood');
  const [draft, setDraft] = useState('');
  const [moodMessage, setMoodMessage] = useState('');

  function save(kind: JournalKind, text: string) {
    if (!text.trim()) return;
    add(kind, text, currentWeek);
    setDraft('');
  }

  return (
    <Screen title="Journal" lede="Private to you. Nothing here is shared or sent anywhere.">
      <div role="tablist" aria-label="Journal sections" className="my-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => {
              setTab(t.id);
              setDraft('');
            }}
            className={`min-h-11 rounded-full border px-3.5 text-[13.5px] ${
              tab === t.id ? 'border-moss bg-moss text-white' : 'border-line bg-card text-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'mood' && (
          <>
            <p className="text-[15px]">How are you today? No scores, no streaks — just noticing.</p>
            <div className="my-4 flex flex-wrap justify-center gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    add('mood', m.value, currentWeek);
                    setMoodMessage(m.message);
                  }}
                  className="min-h-11 min-w-[60px] flex-1 rounded-xl border-[1.5px] border-line bg-card px-2 py-3 text-2xl transition-transform hover:-translate-y-0.5 hover:border-moss"
                >
                  <span aria-hidden="true">{m.emoji}</span>
                  <small className="mt-1 block font-mono text-[10px] text-soft">{m.value}</small>
                  <span className="sr-only">Record mood: {m.value}</span>
                </button>
              ))}
            </div>
            <p aria-live="polite" className="min-h-11 text-center text-[15px] text-mossd">
              {moodMessage}
            </p>

            {moodHistory.length > 1 && (
              <>
                <SectionHeading>Recent moods</SectionHeading>
                <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {moodHistory.map((e) => (
                    <li
                      key={e.id}
                      title={`${e.text} — ${formatDate(e.date)}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-card text-lg"
                    >
                      <span aria-hidden="true">{MOOD_EMOJI.get(e.text) ?? '·'}</span>
                      <span className="sr-only">
                        {e.text} on {formatDate(e.date)}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 font-mono text-[10.5px] text-soft">
                  A picture of how the last couple of weeks have felt — useful to show your midwife.
                </p>
              </>
            )}

            <Note title="If it’s more than a bad day">
              Tell your midwife or GP. You won’t be judged, and it’s exactly what they’re there for.
            </Note>
          </>
        )}

        {tab !== 'mood' && (
          <>
            <p className="text-[15px]">
              {tab === 'note'
                ? 'Anything you want to remember — how you felt, what happened, what you’re looking forward to.'
                : tab === 'question'
                  ? 'Questions build up between appointments and vanish the moment you’re in the room. Park them here.'
                  : 'A record of how you’ve been feeling — useful to show your midwife rather than trying to recall it.'}
            </p>
            <label htmlFor="journal-input" className="sr-only">
              {JOURNAL_LABEL[tab]}
            </label>
            {tab === 'note' ? (
              <textarea
                id="journal-input"
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Today…"
                className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 text-base"
              />
            ) : (
              <input
                id="journal-input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  tab === 'question'
                    ? 'Something to ask…'
                    : 'e.g. heartburn most evenings this week'
                }
                className="mt-2 min-h-11 w-full rounded-lg border border-line bg-card px-3 text-base"
              />
            )}
            <button
              type="button"
              onClick={() => save(tab, draft)}
              className="mt-3 min-h-11 rounded-lg bg-moss px-4 font-semibold text-white hover:bg-mossd"
            >
              Save {JOURNAL_LABEL[tab].toLowerCase()}
            </button>
          </>
        )}
      </div>

      <SectionHeading>Your entries</SectionHeading>
      {entries.length === 0 ? (
        <p className="text-[14.5px] italic text-soft">
          Nothing saved yet. Anything you add appears here — and stays on this device.
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {entries.map((e) => (
            <li key={e.id} className="mb-2.5 rounded-xl border border-line bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10.5px] text-soft">
                    {JOURNAL_LABEL[e.kind]}
                    {e.week !== null && ` · Week ${e.week}`} · {formatDate(e.date)}
                  </div>
                  <p className="m-0 mt-1 text-[14.5px]">{e.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="min-h-11 flex-none px-2 font-mono text-[11px] text-soft underline"
                >
                  Delete
                  <span className="sr-only"> entry: {e.text}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
