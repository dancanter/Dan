import type { Appointment } from './schema';

export const appointments: Appointment[] = [
  {
    week: 8,
    title: 'Booking appointment',
    detail:
      "The long one (around an hour). Full history, bloods, blood pressure, urine. You'll get your maternity notes.",
  },
  {
    week: 12,
    title: 'Dating scan',
    detail:
      "Confirms your due date and checks development. Screening for Down's, Edwards' and Patau's syndromes is offered — entirely your choice.",
  },
  {
    week: 16,
    title: 'Midwife appointment',
    detail: 'Booking blood results discussed. Blood pressure and urine checked.',
  },
  {
    week: 16,
    title: 'Whooping cough vaccine',
    detail: 'Offered from 16 weeks — protects your baby in their first weeks of life.',
  },
  {
    week: 20,
    title: 'Anomaly scan',
    detail: "A detailed check of your baby's development. You can find out the sex if you want to.",
  },
  {
    week: 25,
    title: 'Midwife appointment',
    detail: 'Bump measured, movements discussed, mental health checked.',
    firstPregnancyOnly: true,
  },
  {
    week: 28,
    title: 'Midwife appointment + bloods',
    detail:
      "Iron rechecked. Anti-D if you're rhesus negative. Glucose test around now if you're higher risk.",
  },
  {
    week: 31,
    title: 'Midwife appointment',
    detail: 'Birth preferences start being discussed.',
    firstPregnancyOnly: true,
  },
  {
    week: 34,
    title: 'Midwife appointment',
    detail: 'Preparing for birth, and knowing when labour has started.',
  },
  {
    week: 36,
    title: 'Midwife appointment',
    detail: "Baby's position checked. Feeding and postnatal care discussed.",
  },
  {
    week: 38,
    title: 'Midwife appointment',
    detail: 'Routine checks, plus what happens if you go past 40 weeks.',
  },
  {
    week: 40,
    title: 'Due date',
    detail: 'Only about 1 in 20 babies arrive exactly today. Perfectly normal either way.',
  },
  {
    week: 41,
    title: 'Midwife appointment',
    detail: 'Membrane sweep offered, and induction discussed if needed.',
  },
];
