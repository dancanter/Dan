import { useNavigate } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useAccessibilitySettings, type TextSize } from '../hooks/useAccessibilitySettings';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useProgress } from '../hooks/useProgress';
import { useJournal } from '../hooks/useJournal';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { badges } from '../content';
import { formatDate } from '../lib/dates';
import { ScreenTitle, SectionHeading } from '../components/ui/SectionHeading';

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'x-large', label: 'Extra large' },
];

export function SettingsScreen() {
  useAutoFocusHeading<HTMLHeadingElement>();
  const { textSize, reduceMotion, highContrast, setTextSize, setReduceMotion, setHighContrast } =
    useAccessibilitySettings();
  const { dueDate, birthDate, setBirthDate, resetProfile } = usePregnancyProfile();
  const { earnedBadgeIds, currentStreak, daysVisited, resetProgress } = useProgress();
  const { resetJournal } = useJournal();
  const { canPromptInstall, installed, isIOSManualInstall, promptInstall } = useInstallPrompt();
  const navigate = useNavigate();

  function handleReset() {
    if (
      window.confirm(
        'This clears your due date, journal, streak and saved progress on this device. Continue?',
      )
    ) {
      resetProfile();
      resetProgress();
      resetJournal();
      navigate('/', { replace: true });
    }
  }

  return (
    <main id="main" className="mx-auto max-w-[780px] px-4 pt-5 pb-24">
      <ScreenTitle title="Settings" strap="Make this comfortable to read and use." />

      <SectionHeading>Text size</SectionHeading>
      <div role="group" aria-label="Text size" className="flex gap-2">
        {TEXT_SIZES.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setTextSize(o.value)}
            aria-pressed={textSize === o.value}
            className={`min-h-11 flex-1 rounded-lg border px-2 text-sm font-medium ${
              textSize === o.value ? 'border-moss bg-mossp text-mossd' : 'border-line text-soft'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <SectionHeading>Display</SectionHeading>
      <div className="space-y-2.5">
        <label className="flex min-h-11 items-center justify-between rounded-lg border border-line px-3 py-2">
          <span className="text-sm font-medium">Reduce motion</span>
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
            className="h-5 w-5"
          />
        </label>
        <label className="flex min-h-11 items-center justify-between rounded-lg border border-line px-3 py-2">
          <span className="text-sm font-medium">High contrast</span>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </div>

      <SectionHeading>Install Field Notes</SectionHeading>
      {installed ? (
        <p className="text-sm text-soft">Already installed on this device. ✅</p>
      ) : canPromptInstall ? (
        <button
          type="button"
          onClick={promptInstall}
          className="min-h-11 w-full rounded-lg border border-moss px-3 text-sm font-semibold text-mossd"
        >
          Add to your home screen
        </button>
      ) : isIOSManualInstall ? (
        <p className="text-sm text-soft">
          On iPhone or iPad: tap the Share icon, then “Add to Home Screen”.
        </p>
      ) : (
        <p className="text-sm text-soft">
          Look for an install icon in your browser’s address bar to add Field Notes to your device.
        </p>
      )}

      <SectionHeading>Your progress</SectionHeading>
      <p className="text-sm text-soft">
        {currentStreak} day streak · visited on {daysVisited} day{daysVisited === 1 ? '' : 's'}.
        However often you visit is the right amount.
      </p>
      <ul className="mt-3 grid list-none grid-cols-2 gap-2.5 p-0">
        {badges.map((b) => {
          const earned = earnedBadgeIds.includes(b.id);
          return (
            <li
              key={b.id}
              className={`rounded-xl border p-3 text-center ${
                earned ? 'border-moss bg-mossp' : 'border-line bg-card opacity-60'
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {earned ? '🏅' : '·'}
              </span>
              <p className="mt-1 text-sm font-semibold">{b.title}</p>
              <p className="mt-0.5 text-xs text-soft">{b.description}</p>
              <span className="sr-only">{earned ? 'Earned' : 'Not yet earned'}</span>
            </li>
          );
        })}
      </ul>

      <SectionHeading>Your details</SectionHeading>
      {dueDate && <p className="text-sm">Due date: {formatDate(dueDate)}</p>}
      {birthDate && (
        <>
          <p className="mt-1 text-sm">Baby’s birthday: {formatDate(birthDate)}</p>
          <button
            type="button"
            onClick={() => setBirthDate(null)}
            className="mt-2 min-h-11 w-full rounded-lg border border-line px-3 text-sm text-soft"
          >
            Switch back to pregnancy mode
          </button>
        </>
      )}
      <button
        type="button"
        onClick={handleReset}
        className="mt-3 min-h-11 w-full rounded-lg border border-alert/50 px-3 text-sm font-semibold text-alert"
      >
        Reset my data
      </button>
    </main>
  );
}
