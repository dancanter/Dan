import { NavLink } from 'react-router-dom';
import { usePregnancyProfile } from '../../hooks/usePregnancyProfile';
import { usePregnancyStatus } from '../../hooks/usePregnancyStatus';

interface Tab {
  to: string;
  label: string;
  urgent?: boolean;
  /** Hidden once the baby has arrived, or in support-after-loss mode. */
  pregnancyOnly?: boolean;
}

/*
 * Get Help is pinned, and that is a safety decision, not a layout one.
 *
 * The tab bar scrolls sideways on a phone. When Get Help was the sixth tab
 * inside that scroll, it was measured 0% visible on arrival at 320px, 29% at
 * 375px and 50% at 390px — on the widths most phones actually are, the one
 * tab that must always be reachable was the one you had to know to scroll
 * for. Nothing in the automated audit caught it, because the page itself
 * never scrolled sideways; only the bar did.
 *
 * So it sits outside the scrolling part, at the right-hand end. Dan wanted it
 * after Journal in the order, and this gives him that without putting it back
 * where it can scroll out of sight: the other tabs scroll, and Get Help stays
 * put at every width.
 *
 * Order, as Dan set it: Home, Baby, Health, Appointments, Journal, then Get
 * Help. My Body and Sources were not in his list and are kept, after Journal,
 * rather than dropped.
 *
 * "Health" was "Guidance". It is the health and wellbeing library, and the
 * old name did not say so.
 */
const TABS: Tab[] = [
  { to: '/today', label: 'Home' },
  { to: '/baby', label: 'Baby', pregnancyOnly: true },
  { to: '/healthy', label: 'Health' },
  { to: '/appointments', label: 'Appointments', pregnancyOnly: true },
  { to: '/journal', label: 'Journal' },
  { to: '/body', label: 'My Body', pregnancyOnly: true },
  { to: '/sources', label: 'Sources' },
];

const GET_HELP: Tab = { to: '/help', label: 'Get Help', urgent: true };

function tabClass(t: Tab) {
  return ({ isActive }: { isActive: boolean }) =>
    [
      'flex min-h-11 items-center whitespace-nowrap border-b-[3px] px-2.5 font-mono text-meta',
      isActive
        ? `border-b-current font-semibold ${t.urgent ? 'text-alert' : 'text-clay'}`
        : `border-transparent ${t.urgent ? 'text-alert' : 'text-soft'} hover:text-ink`,
    ].join(' ');
}

export function AppHeader() {
  const { hasBaby } = usePregnancyProfile();
  const { isAfterLoss } = usePregnancyStatus();
  // Week-by-week development, the antenatal timeline and the pregnancy
  // symptom explorer are all actively wrong once the baby is here — better
  // gone from the nav than left there giving stale answers.
  const tabs = TABS.filter((t) => !((hasBaby || isAfterLoss) && t.pregnancyOnly));

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper print:hidden">
      <div className="mx-auto max-w-[920px] px-4 pt-3">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-2">
          <div>
            <span className="font-display text-title font-bold">Field Notes</span>
            <small className="label-mono mt-0.5 block font-normal text-mossd">
              A pregnancy guide — by Dan Canter
            </small>
          </div>
          <span className="label-mono rounded-full border border-line bg-mossp px-2.5 py-1 font-normal text-mossd">
            Every entry sourced
          </span>
        </div>
        {/* Two fixes measured rather than guessed, both on every screen.
            The inactive tabs were dimmed with opacity, which computed to
            #74796f on paper — 3.92:1, under the 4.5:1 AA floor for text this
            small. They now use the palette's own muted ink, which is 6.4:1.
            And at py-2.5 they were 41px tall: under the 44px target size, on
            the navigation someone uses one-handed. */}
        <nav aria-label="Sections" className="-mx-1 flex items-stretch">
          <div data-tab-scroll className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
            {tabs.map((t) => (
              <NavLink key={t.to} to={t.to} className={tabClass(t)}>
                {t.label}
              </NavLink>
            ))}
          </div>
          {/* Outside the scroll on purpose — see the note above TABS. */}
          <div className="flex shrink-0 border-l border-line pl-0.5">
            <NavLink to={GET_HELP.to} className={tabClass(GET_HELP)}>
              {GET_HELP.label}
            </NavLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
