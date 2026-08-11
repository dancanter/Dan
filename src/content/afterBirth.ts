import { guideById } from './guides';
import type { FocusItem } from './schema';
import type { WeekRead } from './weeklyReads';
import type { WeekNote } from './weeklyFocus';

/**
 * Life after the birth, on the same daily surface as the pregnancy weeks.
 *
 * Everything here is keyed on *weeks since birth* rather than a pregnancy
 * week. Someone in week two with a newborn has almost nothing in common with
 * someone at 38 weeks pregnant, so the home screen swaps over entirely rather
 * than trying to stretch the pregnancy layout across both.
 *
 * There is no streak pressure, no checklist guilt and no "you should be
 * feeling X by now" here. The first weeks are hard enough.
 */

export const POSTNATAL_MAX_WEEK = 52;

export function postnatalStageLabel(weeks: number): string {
  if (weeks < 1) return 'The first days';
  if (weeks < 6) return 'The early weeks';
  if (weeks < 12) return 'Finding a rhythm';
  if (weeks < 26) return 'The first few months';
  return 'The first year';
}

interface PostnatalFocusRule {
  id: string;
  text: string;
  sourceIds: string[];
  applies: (weeks: number) => boolean;
}

const RULES: PostnatalFocusRule[] = [
  {
    id: 'pn-skin-to-skin',
    text: 'Skin-to-skin whenever you can — it settles them, and it helps feeding.',
    sourceIds: ['nhs-early-days'],
    applies: (w) => w < 3,
  },
  {
    id: 'pn-bleeding-watch',
    text: 'Keep an eye on your bleeding. Soaking a pad in an hour, or clots, means call.',
    sourceIds: ['nhs-early-days'],
    applies: (w) => w < 6,
  },
  {
    id: 'pn-safer-sleep',
    text: 'On their back, in their own clear cot, in your room for the first 6 months.',
    sourceIds: ['nhs-new-parents'],
    applies: (w) => w < 26,
  },
  {
    id: 'pn-feed-on-demand',
    text: 'Feed on demand — newborns feed often, and that is how it is meant to work.',
    sourceIds: ['nhs-breastfeeding'],
    applies: (w) => w < 8,
  },
  {
    id: 'pn-vitamin-d-baby',
    text: 'Breastfed babies need 8.5–10mcg vitamin D drops daily from birth.',
    sourceIds: ['ohid-infant-feeding-2024', 'who-infant-feeding'],
    applies: (w) => w < 26,
  },
  {
    id: 'pn-ask-for-latch-help',
    text: 'If feeding hurts, ask for latch help today rather than waiting it out.',
    sourceIds: ['ohid-infant-feeding-2024'],
    applies: (w) => w < 10,
  },
  {
    id: 'pn-eat-drink',
    text: 'Eat something and drink something. Genuinely — it gets skipped constantly.',
    sourceIds: ['nhs-breastfeeding'],
    applies: (w) => w < 12,
  },
  {
    id: 'pn-pelvic-floor',
    text: 'Pelvic floor exercises — you can start these straight away, gently.',
    sourceIds: ['nhs-fit-with-baby'],
    applies: (w) => w >= 1,
  },
  {
    id: 'pn-let-someone-in',
    text: 'Let one person do one thing for you today. It is not a favour you owe back.',
    sourceIds: ['nhs-parent-support'],
    applies: (w) => w < 12,
  },
  {
    id: 'pn-book-check',
    text: 'Book or attend your 6-week check — yours, not just the baby’s.',
    sourceIds: ['nhs-postnatal-check'],
    applies: (w) => w >= 4 && w <= 9,
  },
  {
    id: 'pn-contraception',
    text: 'Worth sorting contraception — fertility can return from 21 days after birth.',
    sourceIds: ['nhs-sex-contraception-after'],
    applies: (w) => w >= 3 && w <= 12,
  },
  {
    id: 'pn-how-are-you',
    text: 'How are you actually doing? If low mood has lasted 2 weeks, tell someone.',
    sourceIds: ['nhs-postnatal-depression', 'tommys-pnd'],
    applies: (w) => w >= 2,
  },
  {
    id: 'pn-move',
    text: 'A walk with the pram counts. High-impact can wait for after your check.',
    sourceIds: ['nhs-fit-with-baby'],
    applies: (w) => w >= 6,
  },
];

const MAX_ITEMS = 5;

export function postnatalFocus(weeks: number): FocusItem[] {
  return RULES.filter((r) => r.applies(weeks))
    .slice(0, MAX_ITEMS)
    .map((r) => ({ id: r.id, text: r.text, sourceIds: r.sourceIds }));
}

interface PostnatalReadRule {
  guideId: string;
  why: string;
  from: number;
  to: number;
}

const READ_RULES: PostnatalReadRule[] = [
  {
    guideId: 'first-days',
    why: 'What is happening in these first few days, and who sees you when.',
    from: 0,
    to: 2,
  },
  {
    guideId: 'postnatal-bleeding',
    why: 'What is normal, and the point at which it is a 999 call.',
    from: 0,
    to: 6,
  },
  {
    guideId: 'feeding-well',
    why: 'Rounded cheeks, audible swallowing, six wet nappies from day five.',
    from: 0,
    to: 6,
  },
  {
    guideId: 'newborn-weeks',
    why: 'Sleep in short stretches, feeding on demand, and safer sleep.',
    from: 0,
    to: 8,
  },
  {
    guideId: 'tongue-tie',
    why: 'Around 1 in 6 babies. Worth asking about specifically if feeding hurts.',
    from: 1,
    to: 8,
  },
  {
    guideId: 'breastfeeding-problems',
    why: 'Sore nipples, mastitis, thrush — most are fixable without stopping.',
    from: 1,
    to: 12,
  },
  {
    guideId: 'feeding-nobody-figured-out',
    why: '73% of mothers who breastfed hit a difficulty. You are in the majority.',
    from: 1,
    to: 10,
  },
  {
    guideId: 'body-after-birth',
    why: 'Separated stomach muscles, pelvic floor and back pain — all common.',
    from: 2,
    to: 16,
  },
  {
    guideId: 'sex-contraception-after',
    why: 'Fertility can return from 21 days, before periods do.',
    from: 3,
    to: 12,
  },
  {
    guideId: 'postnatal-check',
    why: 'Your appointment is due around now. This is what to raise.',
    from: 4,
    to: 9,
  },
  {
    guideId: 'postnatal-depression',
    why: 'More than 1 in 10, usually within the first year, and treatable.',
    from: 2,
    to: 52,
  },
  {
    guideId: 'getting-active-again',
    why: 'Past your check, higher-impact exercise is back on the table.',
    from: 7,
    to: 20,
  },
  {
    guideId: 'combining-feeding',
    why: 'If you are thinking about mixing or moving over, both directions work.',
    from: 4,
    to: 20,
  },
  {
    guideId: 'expressing',
    why: 'Useful before going back to work, or for anyone else to do a feed.',
    from: 6,
    to: 24,
  },
  {
    guideId: 'lasting-problems',
    why: 'The honest picture on problems that last longer than people are told.',
    from: 8,
    to: 52,
  },
  {
    guideId: 'feeding-vitamins-solids',
    why: 'Solids from around 6 months — worth reading a few weeks ahead.',
    from: 18,
    to: 30,
  },
  {
    guideId: 'getting-support',
    why: 'Health visitors, Family Hubs and helplines that actually pick up.',
    from: 0,
    to: 52,
  },
];

const MAX_READS = 3;

export function postnatalReads(weeks: number): WeekRead[] {
  return READ_RULES.filter((r) => weeks >= r.from && weeks <= r.to)
    .sort((a, b) => b.from - a.from)
    .slice(0, MAX_READS)
    .map((r) => ({ guide: guideById.get(r.guideId)!, why: r.why }))
    .filter((r) => r.guide);
}

export function postnatalNote(weeks: number): WeekNote {
  if (weeks < 1) {
    return {
      tone: 'warn',
      title: 'You matter too',
      body: 'Sudden heavy bleeding, a severe headache, chest pain or breathlessness after birth is a 999 call, not a wait-and-see. You will never be wasting anyone’s time.',
    };
  }
  if (weeks < 6) {
    return {
      tone: 'calm',
      title: 'Almost nobody has this figured out',
      body: '73% of mothers who breastfed ran into a difficulty, and 54% of babies get breast milk only. Whatever combination you end up with is a normal one.',
    };
  }
  if (weeks < 12) {
    return {
      tone: 'plain',
      title: 'Your 6-week check is yours',
      body: 'It is easy for the appointment to become entirely about the baby. Your mood, your bleeding, pain during sex, leaking, and how you are coping are all fair to raise.',
    };
  }
  return {
    tone: 'calm',
    title: 'Later is still allowed',
    body: 'Postnatal depression can start any time in the first year, and problems that last months are far more common than most people are told. It is not too late to mention something.',
  };
}

/** Every guide id referenced above, for the content integrity check. */
export const postnatalReadGuideIds = READ_RULES.map((r) => r.guideId);
