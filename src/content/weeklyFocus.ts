import type { FocusItem, Trimester } from './schema';

export function trimesterForWeek(week: number): Trimester {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

export function trimesterLabel(week: number): string {
  const t = trimesterForWeek(week);
  return t === 1 ? 'First trimester' : t === 2 ? 'Second trimester' : 'Third trimester';
}

interface FocusRule {
  id: string;
  text: string;
  sourceIds: string[];
  applies: (week: number) => boolean;
}

/**
 * Weekly focus is rule-based rather than hand-written per week: each rule
 * knows which weeks it applies to, so adding a new piece of guidance means
 * adding one rule here rather than editing 39 week files. Item ids are
 * stable across weeks so a ticked item stays ticked.
 */
const RULES: FocusRule[] = [
  {
    id: 'folic-acid',
    text: 'Take your 400mcg folic acid — most important in these first 12 weeks.',
    sourceIds: ['nhs-vitamins', 'rcog-healthy-eating'],
    applies: (w) => w <= 12,
  },
  {
    id: 'folic-acid-stop',
    text: 'You can stop folic acid now if you like — continuing does no harm either.',
    sourceIds: ['nhs-vitamins'],
    applies: (w) => w >= 13 && w <= 14,
  },
  {
    id: 'vitamin-d',
    text: 'Take your 10mcg vitamin D — October to March, or year-round for some.',
    sourceIds: ['nhs-vitamins'],
    applies: () => true,
  },
  {
    id: 'nausea',
    text: 'If nausea is rough, small frequent meals usually beat forcing three big ones.',
    sourceIds: ['nhs-morning-sickness'],
    applies: (w) => w <= 13,
  },
  {
    id: 'iron',
    text: 'Include an iron-rich food today — meat, pulses, fortified cereal or dark greens.',
    sourceIds: ['iannotti-2024'],
    applies: (w) => w >= 8,
  },
  {
    id: 'fish',
    text: 'Two portions of fish this week, one oily. Most people in the UK get nowhere near it.',
    sourceIds: ['sacn-2026'],
    applies: (w) => w % 2 === 0,
  },
  {
    id: 'veg',
    text: 'Add one extra portion of veg or fruit today — only 27% of UK women hit five a day.',
    sourceIds: ['sacn-2026'],
    applies: (w) => w % 2 === 1,
  },
  {
    id: 'dairy',
    text: 'Some dairy today — calcium plus iodine, which your baby needs for brain development.',
    sourceIds: ['razmpoosh-2025'],
    applies: (w) => w >= 14 && w <= 27,
  },
  {
    id: 'whooping-cough',
    text: 'Whooping cough vaccine is offered from 16 weeks — worth asking about.',
    sourceIds: ['nhs-antenatal-care'],
    applies: (w) => w >= 16 && w <= 20,
  },
  {
    id: 'relax',
    text: 'Five minutes of slow breathing or calming music. Evidence-backed and genuinely easy.',
    sourceIds: ['abera-2024'],
    applies: (w) => w >= 20,
  },
  {
    id: 'extra-calories',
    text: 'About 200 extra calories a day now — roughly two slices of bread.',
    sourceIds: ['sacn-2026'],
    applies: (w) => w >= 28,
  },
  {
    id: 'side-sleeping',
    text: 'Go to sleep on your side tonight, not your back — including naps.',
    sourceIds: ['nice-ng201-sleep', 'tommys-sleep-on-side'],
    applies: (w) => w >= 28,
  },
  {
    id: 'movements',
    text: "Notice your baby's movement pattern today — you're learning what's normal for them.",
    sourceIds: ['nhs-baby-movements'],
    applies: (w) => w >= 28,
  },
  {
    id: 'pelvic-floor',
    text: 'Pelvic floor exercises — 3 sets of 8. One set at each meal is easy to remember.',
    sourceIds: ['nhs-exercise'],
    applies: (w) => w >= 32,
  },
  {
    id: 'walk',
    text: 'A walk, a swim, or anything that gets you moving — the talk test is the only gauge you need.',
    sourceIds: ['nhs-exercise', 'allotey-2026'],
    applies: (w) => w >= 12,
  },
];

const MAX_ITEMS = 5;

export function focusForWeek(week: number): FocusItem[] {
  return RULES.filter((r) => r.applies(week))
    .slice(0, MAX_ITEMS)
    .map((r) => ({ id: r.id, text: r.text, sourceIds: r.sourceIds }));
}

export interface WeekNote {
  tone: 'calm' | 'plain' | 'warn';
  title: string;
  body: string;
}

export function noteForWeek(week: number): WeekNote {
  if (week <= 12) {
    return {
      tone: 'calm',
      title: 'Early days',
      body: "Folic acid matters most right now. Beyond that, a normal varied diet is genuinely enough — you don't need to eat for two and you don't need to change much.",
    };
  }
  if (week <= 19) {
    return {
      tone: 'plain',
      title: 'No fixed weight-gain number',
      body: "UK guidance deliberately doesn't set one, because the evidence doesn't support a single target. If you're worrying about a number, you can let that go.",
    };
  }
  if (week <= 27) {
    return {
      tone: 'calm',
      title: "Most people aren't highly stressed",
      body: 'In a study of 1,500+ pregnant women, only 6% were highly stressed. Some worry is completely normal. If it’s more than that, your midwife is a good place to start.',
    };
  }
  if (week <= 35) {
    return {
      tone: 'warn',
      title: 'Two things that matter now',
      body: "Sleep on your side, not your back — including naps. And sudden swelling with headache or vision changes needs urgent attention. Don't wait either out.",
    };
  }
  return {
    tone: 'warn',
    title: 'Trust your instincts',
    body: 'Reduced or changed movements, bleeding, severe headache or vision changes: contact your maternity unit straight away, any hour. You will never be wasting their time.',
  };
}
