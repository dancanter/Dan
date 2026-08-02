/**
 * Appointments and the questions someone wants to ask at them. These are kept
 * together because that's how they're used: the questions list only earns its
 * place if it's in front of you at the appointment.
 */

export interface Appointment {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** 24h "HH:MM", or null when only the day is known. */
  time: string | null;
  kind: AppointmentKind;
  location: string;
  notes: string;
  createdAt: string;
}

export type AppointmentKind = 'midwife' | 'scan' | 'consultant' | 'class' | 'test' | 'other';

export interface AppointmentKindOption {
  id: AppointmentKind;
  label: string;
}

export const APPOINTMENT_KINDS: AppointmentKindOption[] = [
  { id: 'midwife', label: 'Midwife' },
  { id: 'scan', label: 'Scan' },
  { id: 'consultant', label: 'Consultant' },
  { id: 'class', label: 'Class' },
  { id: 'test', label: 'Test or bloods' },
  { id: 'other', label: 'Other' },
];

export const appointmentKindById = new Map(APPOINTMENT_KINDS.map((kind) => [kind.id, kind]));

export function appointmentKindLabel(kind: AppointmentKind): string {
  return appointmentKindById.get(kind)?.label ?? 'Appointment';
}

export interface MidwifeQuestion {
  id: string;
  text: string;
  asked: boolean;
  createdAt: string;
}

function appointmentTimestamp(appointment: Appointment): number {
  return new Date(`${appointment.date}T${appointment.time ?? '00:00'}:00`).getTime();
}

/** Soonest first — an appointments list is read forwards, unlike the journal. */
export function sortAppointments(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => appointmentTimestamp(a) - appointmentTimestamp(b));
}

/**
 * Splits into what's still ahead and what's been and gone. An appointment
 * counts as upcoming for the whole of its day, so a 9am scan doesn't drop into
 * "past" while you're sitting in the waiting room.
 */
export function splitAppointments(appointments: Appointment[], today = new Date()) {
  const todayISO = today.toISOString().slice(0, 10);
  const sorted = sortAppointments(appointments);
  return {
    upcoming: sorted.filter((appointment) => appointment.date >= todayISO),
    past: sorted.filter((appointment) => appointment.date < todayISO).reverse(),
  };
}

export function formatAppointmentDate(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

export function formatAppointmentTime(time: string | null): string | null {
  if (!time) return null;
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

/** "In 3 days" style copy for the next-appointment card on Today. */
export function daysUntil(dateISO: string, today = new Date()): number {
  const target = new Date(`${dateISO}T00:00:00`).getTime();
  const start = new Date(today.toISOString().slice(0, 10) + 'T00:00:00').getTime();
  return Math.round((target - start) / (24 * 60 * 60 * 1000));
}

export function describeCountdown(dateISO: string, today = new Date()): string {
  const days = daysUntil(dateISO, today);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 14) return 'Next week';
  return `In ${Math.round(days / 7)} weeks`;
}
