import { useNavigate } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useAccessibilitySettings, type TextSize } from '../hooks/useAccessibilitySettings';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { BackupSection } from '../components/settings/BackupSection';
import { clearAll } from '../lib/storage';
import { formatDueDate } from '../lib/dates';

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'x-large', label: 'Extra large' },
];

export function SettingsScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { textSize, reduceMotion, highContrast, setTextSize, setReduceMotion, setHighContrast } =
    useAccessibilitySettings();
  const { dueDate } = usePregnancyProfile();
  const { canPromptInstall, installed, isIOSManualInstall, promptInstall } = useInstallPrompt();
  const navigate = useNavigate();

  function handleReset() {
    if (
      window.confirm(
        'This clears everything saved on this device — your due date, journal, appointments, saved reads and progress. Download a backup first if you might want it back. Continue?',
      )
    ) {
      // One sweep over the whole namespace, so a screen added later can't be
      // silently left behind by a reset that lists keys by hand.
      clearAll();
      navigate('/', { replace: true });
    }
  }

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark">
        Settings
      </h1>

      <section className="mt-6" aria-labelledby="text-size-heading">
        <h2 id="text-size-heading" className="text-sm font-semibold uppercase tracking-wide text-bump-muted dark:text-bump-muted-dark">
          Text size
        </h2>
        <div className="mt-2 flex gap-2" role="group" aria-labelledby="text-size-heading">
          {TEXT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTextSize(option.value)}
              aria-pressed={textSize === option.value}
              className={`min-h-11 flex-1 rounded-xl border px-2 py-2 text-sm font-medium ${
                textSize === option.value
                  ? 'border-bump-primary bg-bump-primary/10 text-bump-primary dark:text-bump-primary-dark'
                  : 'border-bump-border text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3" aria-labelledby="display-heading">
        <h2 id="display-heading" className="text-sm font-semibold uppercase tracking-wide text-bump-muted dark:text-bump-muted-dark">
          Display
        </h2>
        <label className="flex min-h-11 items-center justify-between rounded-xl border border-bump-border px-3 py-2 dark:border-bump-border-dark">
          <span className="text-sm font-medium text-bump-text dark:text-bump-text-dark">Reduce motion</span>
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => setReduceMotion(event.target.checked)}
            className="h-5 w-5"
          />
        </label>
        <label className="flex min-h-11 items-center justify-between rounded-xl border border-bump-border px-3 py-2 dark:border-bump-border-dark">
          <span className="text-sm font-medium text-bump-text dark:text-bump-text-dark">High contrast</span>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(event) => setHighContrast(event.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </section>

      <section className="mt-6" aria-labelledby="install-heading">
        <h2 id="install-heading" className="text-sm font-semibold uppercase tracking-wide text-bump-muted dark:text-bump-muted-dark">
          Install Bump
        </h2>
        {installed ? (
          <p className="mt-2 text-sm text-bump-muted dark:text-bump-muted-dark">Bump is already installed on this device. ✅</p>
        ) : canPromptInstall ? (
          <button
            type="button"
            onClick={promptInstall}
            className="mt-2 min-h-11 w-full rounded-xl border border-bump-primary px-3 py-2 text-sm font-semibold text-bump-primary dark:text-bump-primary-dark"
          >
            Add Bump to your home screen
          </button>
        ) : isIOSManualInstall ? (
          <p className="mt-2 text-sm text-bump-muted dark:text-bump-muted-dark">
            On iPhone or iPad: tap the Share icon, then "Add to Home Screen."
          </p>
        ) : (
          <p className="mt-2 text-sm text-bump-muted dark:text-bump-muted-dark">
            Look for an install icon in your browser's address bar to add Bump to your device.
          </p>
        )}
      </section>

      <BackupSection />

      <section className="mt-6" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="text-sm font-semibold uppercase tracking-wide text-bump-muted dark:text-bump-muted-dark">
          Your details
        </h2>
        {dueDate && (
          <p className="mt-2 text-sm text-bump-text dark:text-bump-text-dark">Due date: {formatDueDate(dueDate)}</p>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 min-h-11 w-full rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-800 dark:text-red-300"
        >
          Reset my data
        </button>
      </section>
    </main>
  );
}
