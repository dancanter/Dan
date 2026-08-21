/**
 * Pregnancy and baby loss. Deliberately kept out of the guides list and off
 * the daily/home surfaces: it lives on its own quiet route, reachable from
 * Get Help and the footer, so nobody encounters it unprepared in the middle
 * of checklist-style content.
 */
export interface LossSection {
  id: string;
  title: string;
  body: string[];
  sourceIds: string[];
  tone?: 'plain' | 'urgent';
}

export const lossIntro =
  'Around 1 in 4 pregnancies ends in loss, and about 1 in 5 in miscarriage specifically. If this is happening to you, you are not alone, and it is very unlikely to be anything you did.';

export const lossSections: LossSection[] = [
  {
    id: 'types',
    title: 'Types of loss, in plain terms',
    sourceIds: ['miscarriage-uk'],
    body: [
      '**Chemical pregnancy** — a very early loss, usually around or before 5 weeks, often before an ultrasound could detect anything. A positive test may turn negative days later, sometimes with a heavier-than-usual period. Rarely needs medical treatment.',
      '**Anembryonic pregnancy** (previously "blighted ovum") — a pregnancy sac forms but no embryo develops, usually found on an early scan. Often no symptoms until bleeding starts, since hormone levels can stay elevated.',
      '**Miscarriage** — loss before 24 completed weeks; the most common form. Usually due to a random chromosomal issue in the pregnancy, **not** caused by exercise, sex, stress, or anything you did.',
      '**Missed (silent) miscarriage** — the pregnancy has stopped but there’s no bleeding or pain; only found on a scan. Management options are waiting, medication, or a procedure — the right choice depends on your situation, and it’s your choice to make with your team.',
      '**Ectopic pregnancy** — the pregnancy implants outside the womb, usually in a fallopian tube. This is a genuine emergency risk — it cannot develop safely and can become life-threatening if the tube ruptures.',
      '**Molar pregnancy** — rare; the tissue that should form the placenta develops abnormally instead. Needs removal and hormone-level monitoring afterwards.',
      '**Second-trimester (late) miscarriage** — loss between 13 and 24 weeks. In UK law this is classed as miscarriage rather than stillbirth, even though that terminology can feel wrong for what families have experienced.',
      '**Recurrent miscarriage** — three or more losses. Investigations exist, but around half of couples don’t get a definite explanation even after full testing. That’s a real gap in medicine, not a sign something was missed.',
    ],
  },
  {
    id: 'symptoms',
    title: 'Symptoms — and the honest uncertainty',
    sourceIds: ['miscarriage-uk'],
    body: [
      'Bleeding, cramping, backache, passing tissue, or pregnancy symptoms easing off can all happen with a miscarriage. But **none of them prove one is happening. And not having them does not rule one out.**',
      'Some pregnancies bleed early and carry on perfectly well. Some losses are found on a routine scan, with no symptoms at all.',
      'That uncertainty is hard to sit with. It is also why being checked matters, rather than trying to read the signs yourself.',
    ],
  },
    {
    id: 'urgent',
    title: 'Get help urgently for',
    tone: 'urgent',
    sourceIds: ['miscarriage-uk', 'nhs-get-help'],
    body: [
      'Severe pain, or pain that is getting worse. Sharp pain, or pain on one side. Pain in the tip of your shoulder. Pain when you poo, along with tummy pain.',
      'Feeling faint, dizzy or weak. Heavy bleeding — soaking more than one pad an hour.',
      '**Call 999** if you collapse, if the pain is severe, or if you are bleeding very heavily. These can mean an ectopic pregnancy, or bleeding inside.',
      'For any bleeding or pain that worries you, call your GP, your midwife, 111, or your local Early Pregnancy Unit.',
      'Use pads rather than tampons, so the bleeding can be checked properly.',
    ],
  },
  {
    id: 'assessment',
    title: 'What happens at assessment',
    sourceIds: ['miscarriage-uk'],
    body: [
      'You’ll likely be asked about your last period, when bleeding or pain started, how heavy it’s been, and your pregnancy history. Assessment may include a urine test, blood tests (checking hCG, sometimes repeated 48 hours later to see the trend), and an ultrasound — often transvaginal in early pregnancy, since it gives the clearest picture. **An internal scan does not cause miscarriage.**',
      'Sometimes one scan can’t give a clear answer, especially very early on. A repeat scan about a week later is common and doesn’t mean something’s wrong with how you’re being cared for — clinicians need to be certain before confirming a loss, which is why this can feel slow when you just want an answer.',
      '**Terms you might hear:** *threatened* — bleeding, but cervix closed; pregnancy may continue. *Inevitable* — bleeding and cramping with the cervix opening. *Incomplete* — some tissue has passed, some remains. *Complete* — all tissue has passed. *Missed* — pregnancy stopped, nothing has passed yet.',
    ],
  },
  {
    id: 'grief',
    title: 'Grief doesn’t follow rules',
    sourceIds: ['cruse-baby-loss'],
    body: [
      'There’s no "correct" amount to grieve based on how early a loss happened.',
      'Guilt is extremely common — questioning whether stress, exercise or something you ate caused it — but this almost never has a real cause you could have controlled.',
      'Partners often grieve differently from each other, and that difference is normal, not a sign anything is wrong between you.',
    ],
  },
  {
    id: 'what-helps',
    title: 'Things that can help',
    sourceIds: ['cruse-baby-loss'],
    body: [
      '**Talk to someone** — friends, family, or a professional. Putting the experience into words often helps make sense of it.',
      '**Find your own way to remember** — a photo, a candle on a significant date, a name if that feels right to you.',
      '**Plan ahead for hard dates** — due dates and anniversaries can hit harder than expected. Deciding in advance how you’ll spend that day can help.',
      '**Writing** — a letter, a journal — can help clarify feelings that are hard to say aloud.',
    ],
  },
  {
    id: 'support',
    title: 'Where to get support',
    sourceIds: ['miscarriage-association', 'cruse-baby-loss', 'tommys-movements'],
    body: [
      '**Miscarriage Association** and **Miscarriage UK** — specialist support and information.',
      '**Tommy’s midwives:** 0800 0147 800 (free, Mon–Fri 9am–5pm) or midwife@tommys.org.',
      '**Sands** — supports anyone affected by the death of a baby.',
      '**Cruse Bereavement Support** — general bereavement counselling.',
      'Your GP, midwife or Early Pregnancy Unit can also make direct referrals to bereavement services.',
    ],
  },
];
