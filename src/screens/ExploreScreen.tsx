import { Link } from 'react-router-dom';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { usePregnancyStatus } from '../hooks/usePregnancyStatus';
import { guides, sources } from '../content';
import { Screen } from '../components/ui/Screen';
import { SectionHeading } from '../components/ui/SectionHeading';

interface Entry {
  to: string;
  label: string;
  blurb: string;
  /** Hidden once the baby has arrived, or in support-after-loss mode. */
  pregnancyOnly?: boolean;
}

/**
 * The middle layer of the three-tab navigation. Everything that used to be
 * its own tab lives here, grouped by what someone is actually trying to do
 * — read something, record something, or check how the app works — rather
 * than by which screen it happens to be.
 */
const GROUPS: { heading: string; entries: Entry[] }[] = [
  {
    heading: 'Read',
    entries: [
      {
        to: '/healthy',
        label: 'Guidance',
        blurb: `${guides.length} cited entries, pregnancy through to feeding.`,
      },
      {
        to: '/baby',
        label: 'Your baby, week by week',
        blurb: 'Development and size from week 1 to 42.',
        pregnancyOnly: true,
      },
      {
        to: '/myths',
        label: 'Myth or fact',
        blurb: 'Sixteen things people say about pregnancy. Some are true.',
      },
      {
        to: '/body',
        label: 'My body',
        blurb: 'Symptoms — why they happen, and when to check.',
        pregnancyOnly: true,
      },
      {
        to: '/appointments',
        label: 'Appointments',
        blurb: 'Your antenatal timeline and what each one covers.',
        pregnancyOnly: true,
      },
    ],
  },
  {
    heading: 'Record',
    entries: [
      { to: '/journal', label: 'Journal', blurb: 'Mood, notes, questions and symptoms.' },
      {
        to: '/movements',
        label: 'Movement journal',
        blurb: 'Your baby’s usual pattern. Not a kick counter.',
        pregnancyOnly: true,
      },
      {
        to: '/gallery',
        label: 'Bump gallery',
        blurb: 'Optional weekly photos, stored on this device.',
        pregnancyOnly: true,
      },
    ],
  },
  {
    heading: 'Support',
    entries: [
      {
        to: '/minute',
        label: 'Need a minute?',
        blurb: 'Slow breathing and somewhere quiet to put a minute.',
      },
      {
        to: '/inequalities',
        label: 'Inequalities in maternity care',
        blurb: 'The pattern, and what you can do about it.',
      },
      {
        to: '/loss',
        label: 'Pregnancy and baby loss',
        blurb: 'Types of loss, what happens, and where to get support.',
      },
      {
        to: '/changed',
        label: 'My pregnancy has changed',
        blurb: 'Pause, switch to support after loss, or delete your data.',
      },
    ],
  },
  {
    heading: 'How this works',
    entries: [
      {
        to: '/sources',
        label: 'Sources',
        blurb: `All ${sources.length} references, by evidence tier, with funding conflicts flagged.`,
      },
      {
        to: '/methodology',
        label: 'How this is built',
        blurb: 'What it can’t do, how sources are chosen, and the honest limits.',
      },
      { to: '/privacy', label: 'Privacy', blurb: 'No account, no server, nothing transmitted.' },
      { to: '/settings', label: 'Settings & accessibility', blurb: 'Text size, motion, contrast.' },
    ],
  },
];

export function ExploreScreen() {
  const { hasBaby } = usePregnancyProfile();
  const { isAfterLoss } = usePregnancyStatus();
  const hide = hasBaby || isAfterLoss;

  return (
    <Screen title="Explore" lede="Everything in the app, in one place.">
      {GROUPS.map((group) => {
        const entries = group.entries.filter((e) => !(hide && e.pregnancyOnly));
        if (entries.length === 0) return null;
        return (
          <section key={group.heading}>
            <SectionHeading>{group.heading}</SectionHeading>
            <ul className="m-0 list-none p-0">
              {entries.map((e) => (
                <li key={e.to} className="mb-2">
                  <Link
                    to={e.to}
                    className="flex min-h-[60px] items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 no-underline"
                  >
                    <span>
                      <span className="block font-display text-[16px] font-semibold text-ink">
                        {e.label}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] text-soft">{e.blurb}</span>
                    </span>
                    <span className="font-mono text-moss" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Screen>
  );
}
