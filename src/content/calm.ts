/**
 * "Need a minute?"
 *
 * The narrowest possible version of this feature, on purpose.
 *
 * An app that cannot check whether you are well has no business running a
 * wellbeing programme. So this is not a mood tracker, not a course, not a
 * streak, and it never assesses anyone. It is two things the evidence in this
 * app already supports, and a clear route out to real help for anyone who
 * needs more than a minute.
 *
 * What is deliberately absent is as important. There is no 5-4-3-2-1 grounding
 * exercise here, useful as it is elsewhere: the review this page rests on
 * covered breathing, music, muscle relaxation, yoga and mindfulness, and
 * grounding is not among them. Adding it would have meant either an
 * uncited technique on a page whose whole claim is that everything is cited,
 * or attributing it to an NHS page nobody here has read.
 */

export interface CalmExercise {
  id: string;
  title: string;
  /** One line, so someone can decide before committing to it. */
  blurb: string;
  kind: 'breathing' | 'noticing';
  /** Seconds. A longer out-breath than in-breath is the active ingredient. */
  pattern?: { inhale: number; exhale: number };
  /** For the non-timed exercise. */
  steps?: string[];
  sourceIds: string[];
}

export const CALM_INTRO =
  'Nothing here is a treatment, and none of it is being recorded. It is somewhere to put a minute when you need one.';

/**
 * Shown before anything else on the page.
 *
 * A breathing exercise is the wrong answer to a crisis, and offering one first
 * would be worse than offering nothing — it implies the app has understood the
 * problem and thinks this will fix it. So the harder case is named first, and
 * routed away from this page entirely.
 */
export const CALM_ESCALATION =
  'If you are thinking of harming yourself or your baby, please skip this page.';

export const calmExercises: CalmExercise[] = [
  {
    id: 'slow-breathing',
    title: 'Slow breathing',
    blurb: 'In for four, out for six. The long out-breath is the part that does the work.',
    kind: 'breathing',
    pattern: { inhale: 4, exhale: 6 },
    sourceIds: ['abera-2024', 'nhs-mental-health'],
  },
  {
    id: 'noticing',
    title: 'Noticing, for one minute',
    blurb: 'Not clearing your mind. Just letting your attention rest somewhere ordinary.',
    kind: 'noticing',
    steps: [
      'Put your feet flat on the floor, or lie on your side.',
      'Pick one thing to notice — the weight of your hands, the sound of the room, the air on your face.',
      'When your attention wanders off to the appointment, the list, the worry — that is not failing. Noticing it wandered is the whole exercise.',
      'Bring it back. Then do that again for a minute or so.',
    ],
    sourceIds: ['babbar-2021', 'abera-2024'],
  },
];

/**
 * Facts, offered after the exercises rather than before.
 *
 * Being told "this is common" is genuinely one of the more useful things
 * available here — but only once, and never instead of doing something.
 */
export interface CalmFact {
  text: string;
  sourceIds: string[];
}

export const calmFacts: CalmFact[] = [
  {
    text: 'In a study of more than 1,500 pregnant women, only 6% were highly stressed. Some worry is the ordinary state, not a warning sign.',
    sourceIds: ['alves-2021'],
  },
  {
    text: 'Up to 1 in 4 people have anxiety symptoms during pregnancy. It is common enough that your midwife will have heard it many times this week.',
    sourceIds: ['nct-emotions'],
  },
  {
    text: 'Pooling 32 trials of nearly 4,000 women, relaxation reduced stress, worry and low mood on proper scales. You do not need an app or a class — five minutes of slow breathing counts.',
    sourceIds: ['abera-2024'],
  },
];
