/**
 * Maternal health inequalities in the UK.
 *
 * Structured like the loss module — its own route, its own tone, never
 * surfaced on a daily screen — but for a different reason. Loss is kept
 * separate so nobody meets it unprepared. This is kept separate because a
 * mortality ratio is the wrong thing to put in front of someone mid-checklist
 * at 3am, and because it needs room to do the thing that actually helps:
 * turn a statistic into something a reader can act on.
 *
 * Every section that states a disparity is followed, in the same module, by
 * what a reader can do with it. That ordering is deliberate and shouldn't be
 * rearranged — the actions are the point; the numbers are the reason for them.
 */

export interface EquitySection {
  id: string;
  title: string;
  body: string[];
  sourceIds: string[];
  tone?: 'plain' | 'action';
}

export const equityIntro =
  'This is difficult information, and it isn’t here to frighten you. It’s here because leaving it out would make this app less useful — particularly to Black, Asian and Mixed-ethnicity readers, and to anyone living in a lower-income area. The pattern below is documented by the NHS’s own review body and treated as a government priority. It is not a fringe claim, and there are concrete things you can do with it.';

export const equitySections: EquitySection[] = [
  {
    id: 'picture',
    title: 'The current picture',
    sourceIds: ['mbrrace-2026', 'rcog-mbrrace'],
    body: [
      'Maternal death — during pregnancy or in the year after — is rare in the UK, and the UK has one of the lowest maternal mortality rates in the world. That is the true context for everything below.',
      'Within that low overall rate, MBRRACE-UK — the body that reviews every maternal death in the UK — has consistently found the risk is not evenly spread:',
      '**Black women** are around 2 to 2.3 times more likely to die than White women. That gap has narrowed from roughly four times a few years ago, but it has not closed.',
      '**Asian women** are around 1.3 times more likely to die.',
      '**Women in the most deprived areas** are around 1.9 times more likely to die than women in the least deprived areas.',
      'The overall maternal death rate has risen slightly in recent years even as the ethnic gap has narrowed — so this is an active safety priority, not a solved problem.',
    ],
  },
  {
    id: 'why',
    title: 'Why — what the evidence actually shows',
    sourceIds: ['weq-black-maternal-health', 'adesina-2025'],
    body: [
      'The obvious question is whether this is really about something else. Age, perhaps. Health conditions. Or deprivation. Researchers have tested exactly that, and the answer is no — **those things do not explain the gap**. One UK study found that Black women’s higher risk barely moved once age, health and deprivation were accounted for.',
      '**Getting care early.** Black women are around four times more likely to book late for antenatal care, or to miss visits. That matters, because early care is where screening happens and where problems get picked up.',
      '**Care that fits the person.** Reviews of maternal deaths found Black women were over-represented in cases where the care given had not been shaped around them.',
      '**Being listened to.** Studies and national surveys keep finding the same thing. Women from ethnic minority backgrounds are more likely to say their concerns were brushed aside, especially about pain.',
      'NHS leaders and government reports now name racism and bias as part of the cause. You are not imagining it. You are not being oversensitive if this has happened to you.',
    ],
  },
  {
    id: 'what-you-can-do',
    title: 'What you can actually do with this',
    tone: 'action',
    sourceIds: ['nhs-antenatal-care', 'weq-black-maternal-health'],
    body: [
      '**Book early, and book yourself.** You can self-refer to maternity services — you do not need a GP referral. Booking by around 10 weeks genuinely improves outcomes, and it is the single most actionable thing on this page.',
      '**Ask for a professional interpreter** if English isn’t your first language. You are entitled to one, and you do not have to rely on a family member to translate for you.',
      '**If you feel you are not being taken seriously**, you can ask to speak to a senior midwife, ask for a second opinion, or contact the hospital’s PALS (Patient Advice and Liaison Service). All three are normal routes, not complaints.',
      '**Go back. Ask again.** If you feel dismissed and you still think something is wrong, it is fine — and safe — to return, to ask again, or to ask for someone else to review you. This is a documented, valid concern, not you being difficult. Nobody will think you are wasting their time.',
      '**Ask what is in place locally.** Many Local Maternity Systems now have specific equity action plans. Your midwife can tell you what yours does.',
    ],
  },
  {
    id: 'more',
    title: 'Organisations worth knowing',
    sourceIds: ['five-x-more', 'birthrights'],
    body: [
      '**Five X More** is a Black-led charity. They run the UK’s most detailed research into what Black women actually experience in maternity care. They also publish a practical guide to speaking up for yourself in appointments.',
      '**Birthrights** is a charity that deals with your rights in pregnancy and birth. That includes your right to make decisions about your own care.',
      '**Muslim Women’s Network UK** works on what Muslim women experience in maternity care, and offers support.',
    ],
  },
];
