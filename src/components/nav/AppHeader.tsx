import { NavLink } from 'react-router-dom';
import { usePregnancyProfile } from '../../hooks/usePregnancyProfile';
import { usePregnancyStatus } from '../../hooks/usePregnancyStatus';

interface Tab {
  to: string;
  label: string;
  urgent?: boolean;
  /** Hidden once the baby has arrived — these are pregnancy-only screens. */
  pregnancyOnly?: boolean;
}

const TABS: Tab[] = [
  { to: '/today', label: 'Home' },
  { to: '/baby', label: 'Baby', pregnancyOnly: true },
  { to: '/body', label: 'My Body', pregnancyOnly: true },
  { to: '/healthy', label: 'Guidance' },
  { to: '/appointments', label: 'Appointments', pregnancyOnly: true },
  { to: '/help', label: 'Get Help', urgent: true },
  { to: '/journal', label: 'Journal' },
  { to: '/sources', label: 'Sources' },
];

export function AppHeader() {
  const { hasBaby } = usePregnancyProfile();
  const { isAfterLoss } = usePregnancyStatus();
  // Week-by-week development, the antenatal timeline and the pregnancy
  // symptom explorer are all actively wrong once the baby is here — better
  // gone from the nav than left there giving stale answers.
  const tabs = TABS.filter((t) => !((hasBaby || isAfterLoss) && t.pregnancyOnly));

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <div className="mx-auto max-w-[920px] px-4 pt-3">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-2">
          <div>
            <span className="font-display text-[20px] font-bold">Field Notes</span>
            <small className="label-mono mt-0.5 block font-normal text-mossd">
              A pregnancy guide — by Dan Canter
            </small>
          </div>
          <span className="label-mono rounded-full border border-line bg-mossp px-2.5 py-1 font-normal text-mossd">
            Every entry sourced
          </span>
        </div>
        <nav aria-label="Sections" className="-mx-1 flex gap-0.5 overflow-x-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap border-b-[3px] px-2.5 py-2.5 font-mono text-[11.5px] transition-opacity',
                  t.urgent ? 'text-alert' : 'text-ink',
                  isActive
                    ? `border-b-current font-semibold opacity-100 ${t.urgent ? 'text-alert' : 'text-clay'}`
                    : 'border-transparent opacity-60 hover:opacity-100',
                ].join(' ')
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
