import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useAppointments, type AppointmentDraft } from '../hooks/useAppointments';
import {
  APPOINTMENT_KINDS,
  appointmentKindLabel,
  describeCountdown,
  formatAppointmentDate,
  formatAppointmentTime,
  type Appointment,
  type AppointmentKind,
} from '../lib/appointments';
import { todayKey } from '../lib/dates';

function emptyDraft(): AppointmentDraft {
  return { date: todayKey(), time: null, kind: 'midwife', location: '', notes: '' };
}

function draftFrom(appointment: Appointment): AppointmentDraft {
  return {
    date: appointment.date,
    time: appointment.time,
    kind: appointment.kind,
    location: appointment.location,
    notes: appointment.notes,
  };
}

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: (draft: AppointmentDraft) => void;
  onCancel?: () => void;
}

function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const [draft, setDraft] = useState<AppointmentDraft>(() =>
    appointment ? draftFrom(appointment) : emptyDraft(),
  );
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  useEffect(() => {
    setDraft(appointment ? draftFrom(appointment) : emptyDraft());
    setError(null);
  }, [appointment]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.date) {
      setError('Add a date so this appointment can be sorted.');
      return;
    }
    setError(null);
    onSave(draft);
    if (!appointment) setDraft(emptyDraft());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-bump-border bg-bump-surface p-4 dark:border-bump-border-dark dark:bg-bump-surface-dark"
    >
      <fieldset className="border-0 p-0">
        <legend className="text-sm font-semibold text-bump-text dark:text-bump-text-dark">
          What kind of appointment?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {APPOINTMENT_KINDS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, kind: option.id as AppointmentKind }))}
              aria-pressed={draft.kind === option.id}
              className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium ${
                draft.kind === option.id
                  ? 'border-bump-primary bg-bump-primary/10 text-bump-primary dark:text-bump-primary-dark'
                  : 'border-bump-border text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex gap-3">
        <div className="flex-1">
          <label
            htmlFor={`${fieldId}-date`}
            className="text-sm font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Date
          </label>
          <input
            id={`${fieldId}-date`}
            type="date"
            required
            value={draft.date}
            onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
            className="mt-1 min-h-11 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
          />
        </div>
        <div className="w-32">
          <label
            htmlFor={`${fieldId}-time`}
            className="text-sm font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Time
          </label>
          <input
            id={`${fieldId}-time`}
            type="time"
            value={draft.time ?? ''}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, time: event.target.value || null }))
            }
            className="mt-1 min-h-11 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`${fieldId}-location`}
          className="text-sm font-semibold text-bump-text dark:text-bump-text-dark"
        >
          Where
        </label>
        <input
          id={`${fieldId}-location`}
          type="text"
          value={draft.location}
          placeholder="Clinic, hospital, or over the phone"
          onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
          className="mt-1 min-h-11 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor={`${fieldId}-notes`}
          className="text-sm font-semibold text-bump-text dark:text-bump-text-dark"
        >
          Notes
        </label>
        <textarea
          id={`${fieldId}-notes`}
          rows={3}
          value={draft.notes}
          placeholder="What it's for, what to bring, what you were told."
          onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
          className="mt-1 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base leading-relaxed text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="min-h-11 flex-1 rounded-xl bg-bump-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {appointment ? 'Save changes' : 'Save appointment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-bump-border px-4 py-2 text-sm font-semibold text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  showCountdown: boolean;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}

function AppointmentCard({
  appointment,
  showCountdown,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  const time = formatAppointmentTime(appointment.time);
  return (
    <li className="rounded-2xl border border-bump-border bg-bump-surface p-4 dark:border-bump-border-dark dark:bg-bump-surface-dark">
      <p className="text-xs font-semibold uppercase tracking-wide text-bump-accent dark:text-bump-accent-dark">
        {appointmentKindLabel(appointment.kind)}
        {showCountdown && ` · ${describeCountdown(appointment.date)}`}
      </p>
      <h3 className="mt-1 text-base font-semibold text-bump-text dark:text-bump-text-dark">
        {formatAppointmentDate(appointment.date)}
        {time ? ` at ${time}` : ''}
      </h3>
      {appointment.location && (
        <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">
          {appointment.location}
        </p>
      )}
      {appointment.notes && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-bump-text dark:text-bump-text-dark">
          {appointment.notes}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(appointment)}
          className="min-h-11 rounded-xl border border-bump-border px-3 py-2 text-sm font-medium text-bump-text dark:border-bump-border-dark dark:text-bump-text-dark"
        >
          Edit
          <span className="sr-only">
            {' '}
            {appointmentKindLabel(appointment.kind)} on {formatAppointmentDate(appointment.date)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(appointment)}
          className="min-h-11 rounded-xl border border-bump-border px-3 py-2 text-sm font-medium text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark"
        >
          Delete
          <span className="sr-only">
            {' '}
            {appointmentKindLabel(appointment.kind)} on {formatAppointmentDate(appointment.date)}
          </span>
        </button>
      </div>
    </li>
  );
}

export function AppointmentsScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const {
    upcoming,
    past,
    questions,
    addAppointment,
    updateAppointment,
    removeAppointment,
    addQuestion,
    toggleQuestion,
    removeQuestion,
  } = useAppointments();
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [composing, setComposing] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [status, setStatus] = useState('');
  const questionFieldId = useId();

  const formOpen = composing || (upcoming.length === 0 && past.length === 0);

  function handleSave(draft: AppointmentDraft) {
    if (editing) {
      updateAppointment(editing.id, draft);
      setEditing(null);
      setStatus('Appointment updated.');
    } else {
      addAppointment(draft);
      setComposing(false);
      setStatus('Appointment saved.');
    }
  }

  function handleDelete(appointment: Appointment) {
    if (!window.confirm(`Delete this ${appointmentKindLabel(appointment.kind).toLowerCase()} appointment?`)) {
      return;
    }
    removeAppointment(appointment.id);
    if (editing?.id === appointment.id) setEditing(null);
    setStatus('Appointment deleted.');
  }

  function handleAddQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (!questionText.trim()) return;
    addQuestion(questionText);
    setQuestionText('');
    setStatus('Question added.');
  }

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark"
      >
        Appointments
      </h1>
      <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">
        Your dates and the things you want to ask, kept together and saved on this device.
      </p>

      <p className="mt-3 text-sm">
        <Link
          to="/journal"
          className="font-semibold text-bump-primary underline dark:text-bump-primary-dark"
        >
          ← Back to your journal
        </Link>
      </p>

      <p aria-live="polite" className="sr-only">
        {status}
      </p>

      {editing ? (
        <section className="mt-6" aria-labelledby="edit-appointment-heading">
          <h2
            id="edit-appointment-heading"
            className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Edit appointment
          </h2>
          <AppointmentForm
            appointment={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : formOpen ? (
        <section className="mt-6" aria-labelledby="new-appointment-heading">
          <h2
            id="new-appointment-heading"
            className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Add an appointment
          </h2>
          <AppointmentForm
            onSave={handleSave}
            onCancel={
              upcoming.length + past.length > 0 ? () => setComposing(false) : undefined
            }
          />
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="mt-6 min-h-11 w-full rounded-xl bg-bump-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Add an appointment
        </button>
      )}

      {upcoming.length > 0 && (
        <section className="mt-8" aria-labelledby="upcoming-heading">
          <h2
            id="upcoming-heading"
            className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Coming up
          </h2>
          <ul className="space-y-3">
            {upcoming.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showCountdown
                onEdit={(selected) => {
                  setEditing(selected);
                  setComposing(false);
                }}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8" aria-labelledby="questions-heading">
        <h2
          id="questions-heading"
          className="mb-1 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
        >
          Questions to ask
        </h2>
        <p className="mb-3 text-sm text-bump-muted dark:text-bump-muted-dark">
          Anything you think of between appointments — so it's in front of you when you're there.
        </p>

        <form onSubmit={handleAddQuestion} className="flex gap-2">
          <label htmlFor={questionFieldId} className="sr-only">
            A question to ask
          </label>
          <input
            id={questionFieldId}
            type="text"
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
            placeholder="Is this amount of movement normal?"
            className="min-h-11 flex-1 rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
          />
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-bump-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </form>

        {questions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {questions.map((question) => (
              <li
                key={question.id}
                className="flex items-start gap-3 rounded-2xl border border-bump-border bg-bump-surface p-3 dark:border-bump-border-dark dark:bg-bump-surface-dark"
              >
                <label className="flex min-h-11 flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={question.asked}
                    onChange={() => toggleQuestion(question.id)}
                    className="h-5 w-5 shrink-0"
                  />
                  <span
                    className={`text-sm ${
                      question.asked
                        ? 'text-bump-muted line-through dark:text-bump-muted-dark'
                        : 'text-bump-text dark:text-bump-text-dark'
                    }`}
                  >
                    {question.text}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="min-h-11 shrink-0 rounded-xl border border-bump-border px-3 py-2 text-sm font-medium text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark"
                >
                  Remove<span className="sr-only"> question: {question.text}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-8" aria-labelledby="past-heading">
          <h2
            id="past-heading"
            className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Been and gone
          </h2>
          <ul className="space-y-3">
            {past.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showCountdown={false}
                onEdit={(selected) => {
                  setEditing(selected);
                  setComposing(false);
                }}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
