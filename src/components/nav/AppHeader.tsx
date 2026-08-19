import { NavLink } from 'react-router-dom';
import { usePregnancyProfile } from '../../hooks/usePregnancyProfile';
import { usePregnancyStatus } from '../../hooks/usePregnancyStatus';

/**
 * Three layers, per the brief: Today, Explore, and Get Help.
 *
 * The previous eight-tab bar meant Get Help competed for attention with
 * Sources and Journal. Now it sits on its own, visually separated and always
 * last-but-permanent, so it is one tap from anywhere without being one of
 * several equally-weighted options.
 *
 * Everything that used to be a tab — Baby, My Body, Appointments, Journal,
 * Sources — lives inside Explore or Today instead.
 */
interface Tab {
  to: string;
  label: string;
  /** Hidden once the baby has arrived, or in support-after-loss mode. */
  pregnancyOnly?: boolean;
}

const TABS: Tab[] = [
  { to: '/today', label: 'Today' },
  { to: '/explore', label: 'Explore' },
];

export function AppHeader() {
  const { hasBaby } = usePregnancyProfile();
  const { isAfterLoss } = usePregnancyStatus();
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
        <nav aria-label="Sections" className="-mx-1 flex items-stretch gap-0.5">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap border-b-[3px] px-3 py-2.5 font-mono text-[12px] transition-opacity',
                  isActive
                    ? 'border-b-current font-semibold text-clay opacity-100'
                    : 'border-transparent text-ink opacity-60 hover:opacity-100',
                ].join(' ')
              }
            >
              {t.label}
            </NavLink>
          ))}

          {/* Deliberately set apart from the browsing tabs, and never scrolled
            out of reach — this is the one someone might need urgently. */}
          <NavLink
            to="/help"
            className={({ isActive }) =>
              [
                'ml-auto my-1 flex items-center whitespace-nowrap rounded-lg px-3.5 font-mono text-[12px] font-semibold no-underline',
                isActive ? 'bg-alert text-white' : 'border border-alert text-alert',
              ].join(' ')
            }
          >
            Get help
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
