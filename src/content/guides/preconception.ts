import type { Guide } from '../schema';

/**
 * Planning a pregnancy.
 *
 * Deliberately short, because most of what belongs here is already written
 * elsewhere in the app and did not need saying twice. Folic acid, including
 * the 5mg dose, is in Supplements. Live vaccines in pregnancy are in Existing
 * conditions. Trying again after a loss is in the after-loss module.
 *
 * What was genuinely missing is the *timing* argument: a set of things that
 * work better done before conceiving than after a positive test, which is a
 * different point from what each of them is.
 *
 * One figure that was offered for this section is not here — that around half
 * of pregnancies are unplanned. It is widely repeated and it did not verify,
 * so the same framing is made without a number, which costs nothing.
 */
export const preconceptionGuides: Guide[] = [
  {
    id: 'preconception-timing',
    section: 'preconception',
    title: 'The things that work better done in advance',
    summary: 'Roughly three months ahead is the useful window.',
    body: [
      'Plenty of pregnancies are not planned, so this is worth a read even if you are not actively trying. If you are already pregnant, start where you are rather than counting what you missed.',
      'About three months before conceiving is the window where preparation actually changes something. Not because anything goes wrong otherwise, but because several of these take weeks to have an effect.',
      '**Folic acid, 400 micrograms a day**, ideally from three months before and through the first 12 weeks. A prescription-only 5mg dose applies to some people. That, and who it applies to, is in Supplements.',
      '**Check your MMR is up to date.** It cannot be given during pregnancy, so before is the only opportunity. If you need a dose, you are advised to avoid getting pregnant for a month afterwards, which means planning contraception around it rather than stopping immediately.',
      '**Stopping smoking and alcohol helps from the day you stop**, whenever that is. There is no point at which it is too late to be worth doing.',
    ],
    sourceIds: ['nhs-planning-pregnancy', 'nice-ng247'],
  },
  {
    id: 'preconception-conditions',
    section: 'preconception',
    title: 'Existing conditions, and medicines, before rather than after',
    summary: 'Getting a condition stable first is measurably different from adjusting later.',
    body: [
      'If you have a long-term condition (asthma, diabetes, epilepsy, a thyroid problem, high blood pressure), the useful thing is to have it well controlled **before** conceiving, rather than adjusting once a test is positive.',
      'That is not the same advice as "manage your condition", which you are already doing. It is specifically about the sequence. Some medicines need switching to a different one, and a switch takes time to settle, which is time you have before and do not have after.',
      'Ask your specialist or GP for a conversation about this early. Some conditions have a dedicated pre-conception clinic.',
      '**Never stop a prescribed medicine on your own** because you are trying to conceive. Stopping suddenly is frequently more dangerous than carrying on, and the decision belongs with the person who prescribed it.',
    ],
    sourceIds: ['nhs-planning-pregnancy', 'nhs-medicines'],
    emphasis: 'warn',
  },
  {
    id: 'preconception-partner',
    section: 'preconception',
    title: 'If you have a partner, it is not only about you',
    summary: 'Sperm quality responds to the same things, and secondhand smoke is yours.',
    body: [
      'Cutting down on alcohol, stopping smoking and being less relentlessly stressed can all affect sperm quality. That side of it gets discussed far less, and the preparation is not one-sided.',
      'If your partner is not ready to stop smoking, stepping outside is still worth asking for. Secondhand smoke is your exposure, not only theirs.',
      'It is also worth them mentioning their own health and family history to a GP, rather than treating the whole subject as something that happens to you and is monitored in you.',
    ],
    sourceIds: ['nhs-planning-pregnancy'],
  },
];
