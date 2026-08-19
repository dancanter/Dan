import { usePersistedState } from './usePersistedState';

export interface MaternityUnit {
  name: string | null;
  /** Triage / labour ward number. Stored on the device, never transmitted. */
  phone: string | null;
}

const STORAGE_KEY = 'fieldnotes:maternity-unit';
const INITIAL: MaternityUnit = { name: null, phone: null };

/**
 * Kept in its own key rather than on the pregnancy profile, so it survives
 * every other state change in the app — including the pregnancy-ended flow.
 * Someone who has just lost a pregnancy may still need to phone their unit.
 *
 * Asked for in context, the first time someone opens Get Help, and never as
 * part of onboarding: nobody should have to look up a phone number before
 * they can use the app.
 */
export function useMaternityUnit() {
  const [unit, setUnit, reset] = usePersistedState<MaternityUnit>(STORAGE_KEY, INITIAL);

  // Tel links choke on spaces in some dialler apps; strip to digits and +.
  const dialable = unit.phone ? unit.phone.replace(/[^\d+]/g, '') : null;

  return {
    unitName: unit.name,
    unitPhone: unit.phone,
    dialable,
    hasNumber: Boolean(dialable),
    setUnit: (name: string, phone: string) =>
      setUnit({ name: name.trim() || null, phone: phone.trim() || null }),
    clearUnit: reset,
  };
}
