import { usePersistedState } from './usePersistedState';

export type PregnancyStatus = 'active' | 'paused' | 'after-loss';

interface StatusState {
  status: PregnancyStatus;
}

const STORAGE_KEY = 'fieldnotes:status';
const INITIAL: StatusState = { status: 'active' };

/**
 * Whether the app is running normally, paused, or in support-after-loss mode.
 *
 * Kept in its own storage key, separate from the pregnancy profile, for one
 * reason: entering support-after-loss must not require deleting anything.
 * Someone may want their journal and photos back later even if they cannot
 * face them now, and pausing has to be reversible without data loss.
 *
 * The app never records *what* happened or *when*. There is no field for it,
 * deliberately — so there is nothing to ask, and nothing that could later be
 * shown back to someone.
 */
export function usePregnancyStatus() {
  const [state, setState, reset] = usePersistedState<StatusState>(STORAGE_KEY, INITIAL);

  return {
    status: state.status,
    isActive: state.status === 'active',
    isPaused: state.status === 'paused',
    /**
     * Support-after-loss permanently removes week counters, due dates,
     * development content, milestones and photo prompts from every screen.
     */
    isAfterLoss: state.status === 'after-loss',
    setStatus: (status: PregnancyStatus) => setState({ status }),
    resetStatus: reset,
  };
}
