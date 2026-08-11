import type { Guide } from '../schema';

export const workRightsGuides: Guide[] = [
  {
    id: 'four-rights',
    section: 'work-rights',
    title: 'The four legal rights',
    summary: 'Antenatal care, maternity leave, maternity pay, and protection from unfair treatment.',
    body: [
      'Pregnant employees in the UK have four main legal rights: **paid time off for antenatal care**, **maternity leave**, **maternity pay or maternity allowance**, and **protection against unfair treatment, discrimination or dismissal**.',
      '"Antenatal care" isn’t just medical appointments — it includes antenatal or parenting classes if your doctor or midwife recommends them.',
    ],
    sourceIds: ['govuk-employee-rights'],
    emphasis: 'calm',
  },
  {
    id: 'time-off',
    section: 'work-rights',
    title: 'Time off for appointments — you’re paid for it',
    summary: 'Your employer must give you paid time off at your normal rate.',
    body: [
      'Your employer must give you time off for antenatal care and **pay your normal rate for it**. Your partner has the right to unpaid time off for two antenatal appointments.',
      'One catch worth knowing: you can’t take time off for appointments until you’ve told your employer you’re pregnant.',
    ],
    sourceIds: ['govuk-employee-rights'],
  },
  {
    id: 'telling-employer',
    section: 'work-rights',
    title: 'When to tell your employer',
    summary: 'At least 15 weeks before the week your baby is due.',
    body: [
      'At least 15 weeks before the week your baby is due. If that’s not possible — for example if you didn’t know you were pregnant — tell them as soon as you can.',
      'You’ll also need to tell them when you want your maternity leave and pay to start.',
    ],
    sourceIds: ['govuk-employee-rights'],
  },
  {
    id: 'workplace-risk',
    section: 'work-rights',
    title: 'Health and safety at work — a legal duty, not a favour',
    summary: 'Your employer must assess risks and remove them, or suspend you on full pay.',
    body: [
      'Once you tell your employer you’re pregnant, they **must** assess risks to you and your baby. Risks include heavy lifting or carrying, standing or sitting for long periods without adequate breaks, exposure to toxic substances, and long working hours.',
      'Where risks exist, your employer must take reasonable steps to remove them — offering different work or changing your hours. **If they can’t remove the risk, they must suspend you on full pay.**',
      'They must also provide a suitable place for you to rest.',
      'If your employer disagrees there’s a risk: speak to your health and safety or trade union representative. If they still won’t act, talk to your doctor or contact the Health and Safety Executive directly.',
    ],
    sourceIds: ['govuk-employee-rights', 'hse-pregnant-workers'],
  },
  {
    id: 'discrimination',
    section: 'work-rights',
    title: 'Discrimination and redundancy protection',
    summary: 'No minimum service needed. Redundancy protection lasts 18 months from birth.',
    body: [
      'It’s against the law to dismiss, discriminate against, or harass you because you’re pregnant, a new mother, or breastfeeding. **There’s no minimum length of service needed** for this protection, and it covers contract, agency and apprentice workers too.',
      'If you’re selected for redundancy, you have the right to be offered a suitable alternative job if one exists — **even if colleagues are more suitable for the role**. This protection starts the day you tell your employer you’re pregnant and lasts up to 18 months from your child’s birth.',
      'If you believe you’ve been discriminated against, you can complain to your employer, and they should investigate promptly. Do it as soon as possible — but a late complaint should still be taken seriously. Acas offers free, confidential, impartial advice on all of this.',
    ],
    sourceIds: ['govuk-employee-rights', 'acas-discrimination'],
  },
  {
    id: 'work-practical',
    section: 'work-rights',
    title: 'Two things people don’t know',
    summary: 'Illness near your due date triggers maternity leave automatically. Some leave is compulsory.',
    body: [
      '**Pregnancy-related illness near your due date:** if you’re off work with a pregnancy-related illness in the 4 weeks before your baby is due, maternity leave and Statutory Maternity Pay start automatically — regardless of what you’d previously arranged.',
      '**Compulsory leave:** even if you’re not taking Statutory Maternity Leave, you must take 2 weeks off after the birth — 4 weeks if you work in a factory.',
      'Your employer also can’t change your contract terms and conditions without your agreement. If they do, that’s a breach of contract.',
    ],
    sourceIds: ['govuk-employee-rights'],
  },
];
