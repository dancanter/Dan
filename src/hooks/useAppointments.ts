import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState';
import { createId } from '../lib/id';
import {
  splitAppointments,
  type Appointment,
  type AppointmentKind,
  type MidwifeQuestion,
} from '../lib/appointments';

interface AppointmentsState {
  appointments: Appointment[];
  questions: MidwifeQuestion[];
}

const STORAGE_KEY = 'bump:appointments';
const INITIAL_STATE: AppointmentsState = { appointments: [], questions: [] };

export interface AppointmentDraft {
  date: string;
  time: string | null;
  kind: AppointmentKind;
  location: string;
  notes: string;
}

export function useAppointments() {
  const [state, setState, resetAppointments] = usePersistedState<AppointmentsState>(
    STORAGE_KEY,
    INITIAL_STATE,
  );

  const { upcoming, past } = useMemo(
    () => splitAppointments(state.appointments),
    [state.appointments],
  );

  const nextAppointment = upcoming[0] ?? null;

  const addAppointment = useCallback(
    (draft: AppointmentDraft): Appointment => {
      const appointment: Appointment = {
        id: createId(),
        date: draft.date,
        time: draft.time,
        kind: draft.kind,
        location: draft.location.trim(),
        notes: draft.notes.trim(),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, appointments: [...prev.appointments, appointment] }));
      return appointment;
    },
    [setState],
  );

  const updateAppointment = useCallback(
    (id: string, draft: AppointmentDraft) => {
      setState((prev) => ({
        ...prev,
        appointments: prev.appointments.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                date: draft.date,
                time: draft.time,
                kind: draft.kind,
                location: draft.location.trim(),
                notes: draft.notes.trim(),
              }
            : appointment,
        ),
      }));
    },
    [setState],
  );

  const removeAppointment = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        appointments: prev.appointments.filter((appointment) => appointment.id !== id),
      }));
    },
    [setState],
  );

  const addQuestion = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setState((prev) => ({
        ...prev,
        questions: [
          ...prev.questions,
          { id: createId(), text: trimmed, asked: false, createdAt: new Date().toISOString() },
        ],
      }));
    },
    [setState],
  );

  const toggleQuestion = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((question) =>
          question.id === id ? { ...question, asked: !question.asked } : question,
        ),
      }));
    },
    [setState],
  );

  const removeQuestion = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.filter((question) => question.id !== id),
      }));
    },
    [setState],
  );

  const openQuestionCount = state.questions.filter((question) => !question.asked).length;

  return {
    appointments: state.appointments,
    upcoming,
    past,
    nextAppointment,
    questions: state.questions,
    openQuestionCount,
    addAppointment,
    updateAppointment,
    removeAppointment,
    addQuestion,
    toggleQuestion,
    removeQuestion,
    resetAppointments,
  };
}
