import { Link } from 'react-router-dom';
import { calmExercises, calmFacts, CALM_INTRO, CALM_ESCALATION } from '../content';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';
import { EvidenceNote } from '../components/ui/EvidenceNote';
import { BreathingPacer } from '../components/calm/BreathingPacer';

/**
 * Reachable without onboarding, like the rest of the safety layer. Someone
 * can arrive here having never set a due date.
 *
 * The order of this page is the design. A breathing exercise is the wrong
 * answer to a crisis, and offering one first would be worse than offering
 * nothing — it implies the app has understood the problem and thinks this
 * will fix it. So the harder case is named at the top and routed off this
 * page entirely, before anything else is on offer.
 */
export function CalmScreen() {
  const { reduceMotion } = useAccessibilitySettings();

  return (
    <Screen title="Need a minute?" lede={CALM_INTRO} width="reading">
      <div className="mb-6 rounded-xl border-2 border-alert bg-alertp px-4 py-3.5">
        <p className="m-0 text-[0.96875rem] font-semibold leading-relaxed">{CALM_ESCALATION}</p>
        <p className="mb-3 mt-1.5 text-[0.90625rem] leading-relaxed">
          Breathing is not what you need right now, and asking for help is not an overreaction.
        </p>
        <Link
          to="/help/mental-health"
          className="inline-flex min-h-11 items-center rounded-lg border-2 border-alert px-4 text-[0.9375rem] font-semibold text-alert no-underline"
        >
          What to do instead →
        </Link>
      </div>

      {calmExercises.map((exercise) => (
        <section key={exercise.id} className="mb-8">
          <SectionHeading>{exercise.title}</SectionHeading>
          <p className="mb-3 text-[0.9375rem] leading-relaxed text-soft">{exercise.blurb}</p>

          {exercise.kind === 'breathing' && exercise.pattern && (
            <BreathingPacer
              inhale={exercise.pattern.inhale}
              exhale={exercise.pattern.exhale}
              reduceMotionOverride={reduceMotion}
            />
          )}

          {exercise.kind === 'noticing' && exercise.steps && (
            <ol className="m-0 list-none p-0">
              {exercise.steps.map((step, i) => (
                <li key={step} className="mb-2 flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-mossp font-mono text-[0.6875rem] font-semibold text-mossd"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          )}

          <EvidenceNote sourceIds={exercise.sourceIds} />
        </section>
      ))}

      {/* After the exercises, never instead of them. Being told this is common
          helps — but only once someone has had something to actually do. */}
      <SectionHeading>Worth knowing</SectionHeading>
      {calmFacts.map((fact) => (
        <div key={fact.text} className="mb-3 rounded-xl border border-line bg-card px-4 py-3.5">
          <p className="m-0 text-[0.9375rem] leading-relaxed">{fact.text}</p>
          <EvidenceNote sourceIds={fact.sourceIds} />
        </div>
      ))}

      <p className="mt-8 border-t border-line pt-5 text-[0.90625rem] leading-relaxed text-soft">
        If this is most days rather than today, that is worth saying out loud to your midwife or GP.
        Perinatal mental health support exists and is part of ordinary maternity care — read{' '}
        <Link to="/healthy?open=asking-for-help" className="underline">
          how to raise it
        </Link>
        , or go straight to{' '}
        <Link to="/help" className="font-semibold underline">
          Get help
        </Link>
        .
      </p>
    </Screen>
  );
}
