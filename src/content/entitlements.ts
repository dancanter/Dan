import { MAX_WEEK } from './schema';

/**
 * The administrative half of a UK pregnancy, anchored to the week you are in.
 *
 * This app was strong on what is happening to your body and nearly silent on
 * the part that costs money to get wrong. Searching the whole content library
 * before this existed, "MatB1" appeared once, inside a guide about dental
 * care. Nothing said when maternity leave has to be notified, what the
 * qualifying week is, or that a maternity grant has a claim window that
 * closes.
 *
 * These are hard deadlines attached to money and to legal rights, and they are
 * missed constantly, because the information lives scattered across GOV.UK and
 * NHS pages with no timing on it. A pregnant person does not need another
 * article about maternity leave. She needs to know that the notification
 * deadline is three weeks away and what it costs to be late.
 *
 * Four rules hold this to the brief:
 *
 * 1. **No guilt.** Nothing here says "you missed it", "you're behind", or
 *    counts what has not been done. A window that has closed shows the route
 *    that is still open — because most of them have one, and someone reading
 *    at week 30 needs a way forward rather than a reprimand.
 *
 * 2. **No amounts.** Payment rates change every April. The rules and the
 *    timings here are stable — most are set in regulations that have not moved
 *    in years — but a figure printed in an app and left to rot is worse than
 *    no figure. Each entry says what to claim and sends you to the body that
 *    publishes the current rate.
 *
 * 3. **Nations are named.** Sure Start Maternity Grant is England, Wales and
 *    Northern Ireland; Scotland runs Best Start Grant instead. Healthy Start
 *    is the same split. An app that quietly assumes England is an app that is
 *    wrong for eight million people.
 *
 * 4. **Nothing is collected.** No ticking, no progress, no reminder that needs
 *    an account. It reads off the week you are already in.
 */

export type Nations = 'uk' | 'england-wales-ni' | 'scotland';

export const NATION_LABEL: Record<Nations, string> = {
  uk: 'UK-wide',
  'england-wales-ni': 'England, Wales & NI',
  scotland: 'Scotland',
};

export interface Entitlement {
  id: string;
  title: string;
  /** One line: what this actually is. */
  what: string;
  /** What it gets you, or what being late costs. Never a scolding. */
  why: string;
  /** What to physically do, in one sentence. */
  action: string;
  /** First week it can be done. null = any time in pregnancy. */
  opensWeek: number | null;
  /** The week it has to be done by. null = no in-pregnancy deadline. */
  deadlineWeek: number | null;
  /** The route that is still open once the deadline has gone. */
  ifLate?: string;
  nations: Nations;
  sourceIds: string[];
}

/**
 * Weeks are counted from the last period, as everywhere else in the app.
 *
 * Two of these deadlines are the same moment described two ways. Statutory
 * maternity pay and maternity leave both hinge on the 15th week before the
 * week the baby is expected — which lands at week 25 of a 40-week pregnancy.
 * They are listed separately because they are claimed from different places
 * and people routinely do one and not the other.
 */
export const QUALIFYING_WEEK = 25;

export const entitlements: Entitlement[] = [
  {
    id: 'healthy-start',
    title: 'Healthy Start / Best Start Foods',
    what: 'A prepaid card for milk, fruit, vegetables and pulses if you are on certain benefits.',
    why: 'It is money for food you are buying anyway, and it continues after the birth. Take-up is well below the number of people eligible.',
    action: 'Apply online — you can do it from 10 weeks pregnant.',
    opensWeek: 10,
    deadlineWeek: null,
    nations: 'uk',
    sourceIds: ['gov-healthy-start', 'gov-best-start-foods'],
  },
  {
    id: 'free-prescriptions',
    title: 'Free prescriptions and NHS dental care',
    what: 'A maternity exemption certificate (MatEx), free for the whole pregnancy and for 12 months after the birth.',
    why: 'Nobody applies it for you. Without it you pay for care you are entitled to have free. In Scotland, Wales and Northern Ireland prescriptions are free for everyone anyway, so there it is your dental care it covers.',
    action:
      'Ask your midwife or GP — they complete form FW8, or apply for you online. Only someone with access to your medical records can do it.',
    opensWeek: null,
    deadlineWeek: null,
    ifLate:
      'The certificate backdates one month from when the application is received, so apply as soon as you can. If you pay for a prescription while waiting, ask for an FP57 receipt at the till — you cannot get one afterwards.',
    nations: 'uk',
    sourceIds: ['nhs-maternity-exemption'],
  },
  {
    id: 'tell-employer',
    title: 'Tell your employer, in writing',
    what: 'Notice that you are pregnant, when the baby is due, and when you want maternity leave to start.',
    why: 'This is the legal trigger. Until you give it, your employer has no duty to start your leave on the date you want, and your health-and-safety protections are weaker.',
    action:
      'Write to your employer with the due date and your intended leave start date, by the 15th week before the baby is due.',
    opensWeek: null,
    deadlineWeek: QUALIFYING_WEEK,
    ifLate:
      'Give notice as soon as you can. Late notice is accepted where it was not reasonably practicable to give it in time — say why in the letter.',
    nations: 'uk',
    sourceIds: ['gov-maternity-leave'],
  },
  {
    id: 'smp',
    title: 'Statutory Maternity Pay — the qualifying week',
    what: 'Whether you get SMP is decided by your employment and earnings in the 15th week before the baby is due.',
    why: 'It is a fixed point, not a rolling one. If you do not qualify for SMP, Maternity Allowance is the separate route and it is claimed from the DWP rather than your employer.',
    action:
      'Check with your employer that they hold your notice, and check the current rate rather than assuming.',
    opensWeek: null,
    deadlineWeek: QUALIFYING_WEEK,
    ifLate:
      'If you did not qualify for SMP, claim Maternity Allowance instead — it can be claimed from 26 weeks pregnant.',
    nations: 'uk',
    sourceIds: ['gov-maternity-pay', 'gov-maternity-allowance'],
  },
  {
    id: 'matb1',
    title: 'Get your MatB1 certificate',
    what: 'The form your midwife or GP signs to confirm your due date.',
    why: 'Your employer or the DWP needs it before maternity pay can start. It cannot be issued earlier than 20 weeks, so it is the one thing here you genuinely cannot do in advance.',
    action:
      'Ask at an appointment from 20 weeks, then give it to your employer or send it with your claim.',
    opensWeek: 20,
    deadlineWeek: null,
    nations: 'uk',
    sourceIds: ['gov-maternity-pay'],
  },
  {
    id: 'maternity-allowance',
    title: 'Maternity Allowance, if SMP does not apply',
    what: 'The route for people who are self-employed, recently changed jobs, or do not meet the SMP conditions.',
    why: 'It is claimed from the DWP, not an employer, and nobody prompts you to do it.',
    action: 'Claim from 26 weeks pregnant using form MA1.',
    opensWeek: 26,
    deadlineWeek: null,
    nations: 'uk',
    sourceIds: ['gov-maternity-allowance'],
  },
  {
    id: 'maternity-grant',
    title: 'Sure Start Maternity Grant',
    what: 'A one-off payment towards the cost of a first baby, if you are on certain benefits.',
    why: 'The claim window opens 11 weeks before the due date and closes 6 months after the birth. Miss it and it is gone — there is no late route.',
    action: 'Claim on form SF100 once you are 29 weeks pregnant.',
    opensWeek: 29,
    deadlineWeek: null,
    nations: 'england-wales-ni',
    sourceIds: ['gov-sure-start-grant'],
  },
  {
    id: 'best-start-grant',
    title: 'Best Start Grant — Pregnancy and Baby Payment',
    what: 'Scotland’s equivalent, and it is not restricted to a first baby.',
    why: 'Different scheme, different rules, different form. Applying for the wrong one wastes the window.',
    action: 'Apply through Social Security Scotland from 24 weeks pregnant.',
    opensWeek: 24,
    deadlineWeek: null,
    nations: 'scotland',
    sourceIds: ['gov-best-start-grant'],
  },
  {
    id: 'antenatal-classes',
    title: 'Book antenatal classes',
    what: 'NHS classes are free; NCT and others charge.',
    why: 'Not a legal deadline, but classes usually run 8 to 10 weeks before the due date and the popular ones fill months ahead. Expecting twins moves it earlier — start around 24 weeks, because they are more likely to arrive early.',
    action:
      'Ask your midwife what your trust runs, and book as soon as you know — the free NHS ones go first.',
    opensWeek: 16,
    deadlineWeek: 30,
    ifLate: 'Ask anyway — trusts often keep late places, and many run online sessions with no cap.',
    nations: 'uk',
    sourceIds: ['nhs-antenatal-classes'],
  },
  {
    id: 'register-birth',
    title: 'Registering the birth',
    what: 'The law gives you 42 days in England, Wales and Northern Ireland. In Scotland it is 21 days.',
    why: 'You need the birth certificate to claim Child Benefit, and later to get a passport. If you are not married or in a civil partnership, the father goes on the certificate only if you both go together.',
    action: 'Book a register office slot in the first couple of weeks, not on day 40.',
    opensWeek: null,
    deadlineWeek: null,
    nations: 'uk',
    sourceIds: ['gov-register-birth'],
  },
  {
    id: 'child-benefit',
    title: 'Child Benefit',
    what: 'Claimed after the birth, but worth knowing about before it.',
    why: 'It backdates only three months, and claiming it credits your National Insurance record towards your State Pension — which still applies if you opt out of receiving the payments themselves.',
    action: 'Claim once the birth is registered. It can be claimed 48 hours after registration.',
    opensWeek: null,
    deadlineWeek: null,
    nations: 'uk',
    sourceIds: ['gov-child-benefit'],
  },
];

export interface EntitlementTiming {
  entitlement: Entitlement;
  /** Weeks until the deadline. Negative once it has passed. */
  weeksToDeadline: number | null;
  status: 'open-now' | 'closing-soon' | 'passed' | 'later' | 'anytime';
}

/** How close is close enough to say something about it on a daily screen. */
const SOON_WEEKS = 5;

/**
 * Where each entitlement stands for a given week.
 *
 * Deliberately returns everything with a status rather than filtering, so the
 * screen can show the whole picture — including what is already done with and
 * what is still months off. Someone at week 30 should be able to see that the
 * grant window has opened without the app having decided that is not her
 * business any more.
 */
export function entitlementTimings(week: number): EntitlementTiming[] {
  return entitlements.map((entitlement) => {
    const { opensWeek, deadlineWeek } = entitlement;
    const weeksToDeadline = deadlineWeek === null ? null : deadlineWeek - week;

    let status: EntitlementTiming['status'];
    if (opensWeek !== null && week < opensWeek) {
      status = 'later';
    } else if (weeksToDeadline === null) {
      status = opensWeek === null ? 'anytime' : 'open-now';
    } else if (weeksToDeadline < 0) {
      status = 'passed';
    } else if (weeksToDeadline <= SOON_WEEKS) {
      status = 'closing-soon';
    } else {
      status = 'open-now';
    }

    return { entitlement, weeksToDeadline, status };
  });
}

/**
 * The one or two worth putting in front of someone this week.
 *
 * Capped hard. The value of this is that it is short: a list of eleven things
 * to do is the wall of text the app exists to avoid, and it is also how a
 * useful prompt turns into a nagging one.
 */
export function entitlementsWorthRaising(week: number, limit = 2): EntitlementTiming[] {
  if (week < 1 || week > MAX_WEEK) return [];
  return entitlementTimings(week)
    .filter((t) => t.status === 'closing-soon' || (t.status === 'open-now' && justOpened(t, week)))
    .sort((a, b) => (a.weeksToDeadline ?? 99) - (b.weeksToDeadline ?? 99))
    .slice(0, limit);
}

/** Opened within the last fortnight — new information rather than a standing fact. */
function justOpened(t: EntitlementTiming, week: number): boolean {
  const opens = t.entitlement.opensWeek;
  return opens !== null && week - opens >= 0 && week - opens <= 2;
}
