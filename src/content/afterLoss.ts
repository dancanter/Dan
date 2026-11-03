/**
 * Support after loss.
 *
 * This is what Home becomes when someone chooses that option — not a
 * variation on the pregnancy screen with the numbers removed, but a
 * different screen with three ways in: what happens now, support, and your
 * memories.
 *
 * No week counter, no due date, no development content, no milestones, no
 * prompts of any kind. Nothing here asks a question.
 */

export interface AfterLossSection {
  id: string;
  title: string;
  body: string[];
  sourceIds: string[];
  /** Kept behind a deliberate extra tap rather than shown by default. */
  guarded?: boolean;
}

export const afterLossIntro =
  'There is no right way to do this, and no timetable. Take whatever is useful here and leave the rest.';

export const afterLossSections: AfterLossSection[] = [
  {
    id: 'physical',
    title: 'What happens now: your body',
    sourceIds: ['miscarriage-uk', 'nhs-early-days'],
    body: [
      'Bleeding and cramping are usual afterwards and can last days to a few weeks. Use pads rather than tampons so it can be assessed if needed.',
      '**Get help urgently** for bleeding that soaks more than a pad an hour, severe or one-sided pain, shoulder-tip pain, a temperature, or feeling faint. These can mean bleeding or infection that needs treating.',
      'After a later loss, **your milk may still come in**, usually two to four days afterwards. This is physically painful and can be emotionally very hard when nobody has warned you it will happen. It can be suppressed with medication (ask your midwife or GP) or allowed to settle on its own with support, firm bras and cold compresses. Some people choose to donate. All of these are valid.',
      'Your hormones will shift over the following weeks, which affects mood on top of grief itself. That is physical, not a failure of coping.',
    ],
  },
  {
    id: 'entitled',
    title: 'Care you are entitled to',
    sourceIds: ['miscarriage-association', 'nhs-postnatal-check'],
    body: [
      'A follow-up appointment to talk through what happened, and to ask questions you did not think of at the time. It is fine to ask for this again later.',
      'Investigation after recurrent loss, usually offered after three, though some units investigate earlier. Around half of couples do not get a definite explanation even after full testing; that is a limit of medicine, not something missed.',
      'Bereavement support through your GP, midwife or Early Pregnancy Unit, who can refer you directly.',
      'From 24 weeks, a stillbirth is registered and there is a legal certificate. Before 24 weeks there is no legal registration, but most hospitals will provide a certificate of remembrance if you would like one. You can ask for this at any point, including years later.',
    ],
  },
  {
    id: 'grief',
    title: 'Grief',
    sourceIds: ['cruse-baby-loss'],
    body: [
      'There is no correct amount to grieve based on how many weeks it was. Early loss is often minimised by other people, and that does not make it smaller.',
      'Guilt is extremely common: questioning stress, exercise, something you ate or lifted. It is almost never anything you could have controlled, and in many losses no cause is ever found.',
      'Partners often grieve differently from each other, and at different speeds. That difference is normal and is not a sign anything is wrong between you.',
      'Anniversaries and due dates can arrive harder than expected. Deciding in advance how you want to spend that day helps some people; ignoring it entirely helps others.',
    ],
  },
  {
    id: 'support',
    title: 'People who can help',
    sourceIds: ['miscarriage-association', 'cruse-baby-loss'],
    body: [
      '**Sands**: 0808 164 3332, free. Stillbirth and neonatal death support. Mon–Fri 10am–3pm, and Tue, Wed and Thu 6pm–9pm.',
      '**Tommy’s midwives**: 0800 0147 800, free, Mon–Fri 9am–5pm, or midwife@tommys.org. They also run a dedicated line for Black and Black Mixed-Heritage women, with Five X More.',
      '**The Miscarriage Association**: 0303 003 6464, including for partners. Mon, Tue and Thu 9am–4pm; Wed and Fri 9am–8pm.',
      '**Child Bereavement UK**: 0800 02 888 40, free, Mon–Fri 9am–4.30pm. Supports whole families, including siblings and grandparents.',
      '**PANDAS**: 0808 1961 776.',
      '**Cruse Bereavement Support**: 0808 808 1677, free. General bereavement counselling.',
      '**Twins Trust**: if you have lost one baby of a multiple pregnancy and are still pregnant, which is its own particular kind of hard and needs specialist support.',
    ],
  },
  {
    id: 'again',
    title: 'If you are thinking about trying again',
    guarded: true,
    sourceIds: ['miscarriage-association'],
    body: [
      'There is no universal right time, medically or emotionally, and the two do not always arrive together. Your team can advise on the physical side; the rest is yours.',
      'After an early miscarriage there is no set waiting time if there is no medical reason to wait. After an ectopic pregnancy most people are advised to wait for two periods, or three to six months if the treatment was not surgical. After a molar pregnancy, until follow-up finishes, which can be up to six months.',
      'Conceiving before your first period afterwards does not raise the risk. Some evidence points the other way: conceiving within six months of a miscarriage may carry a lower risk next time, not a higher one.',
      'Pregnancy after loss is frequently anxious in a way that first pregnancies are not, and that anxiety is not a sign you are not ready. Tell your midwife about the previous loss. Many areas have dedicated support, and some units offer additional early scans for reassurance.',
      'Wanting to try again quickly is not disloyal. Not wanting to at all is not a failure.',
    ],
  },
  {
    id: 'progesterone',
    title: 'If you bleed in a pregnancy after this one',
    guarded: true,
    sourceIds: ['nice-ng126'],
    body: [
      'This is here because it is the one thing in this section that can change what happens, and it is missed often enough to be worth saying plainly.',
      '**If you bleed before 12 weeks in a future pregnancy, and you have had a miscarriage before, NICE guidance says you should be offered progesterone.** Vaginal micronised progesterone, 400mg twice daily, as pessaries or capsules. It is offered once a scan has confirmed the pregnancy is in the womb, so it is not given before that scan or where the location is still unknown. If a heartbeat is seen, it continues to 16 completed weeks. The first prescription usually comes from the Early Pregnancy Unit and your GP continues it.',
      'On the numbers: for one or two previous miscarriages it raised live births by around 5 in 100, and for three or more by around 15 in 100. Those are the figures from the trial NICE used, and they are worth reading as what they are: a real effect in the group who had bled and miscarried before, found inside a trial whose overall result did not reach significance. It is not a guarantee and it is not nothing.',
      '**If this applies to you and nobody has mentioned it, you can ask for it directly.** You can also ask to speak to a different clinician, or to a different Early Pregnancy Unit. Being told no by one person is not the end of the question.',
    ],
  },
  {
    id: 'early-scans',
    title: 'Early scans, and what they can and cannot tell you',
    guarded: true,
    sourceIds: ['miscarriage-association', 'nhs-early-days'],
    body: [
      'An extra scan at around 6 to 10 weeks is something some people choose in a pregnancy after loss. It is not automatically offered without a medical reason, but you can ask your GP or Early Pregnancy Unit.',
      'What it can do is confirm a heartbeat and that the size matches the dates. Both are genuinely positive signs.',
      'What it cannot do is tell you how the rest of the pregnancy will go. A scan is a snapshot of one morning, and it is worth knowing that before you go, because people sometimes expect to come out reassured for good and instead find the reassurance lasts a fortnight.',
      'If a scan is unclear, being asked back in 7 to 14 days is ordinary and does not mean something is wrong. Early pregnancies are small, and sometimes the only way to tell is to look again when there is more to see.',
    ],
  },
];
