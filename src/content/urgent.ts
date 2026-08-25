/**
 * The urgent flow.
 *
 * Every entry follows the same three-part order, and that order is the whole
 * design: what to do now, then why it matters, then reassurance where it is
 * genuinely true. Someone frightened at 3am reads the first line and acts;
 * the explanation is there for afterwards, not before.
 *
 * Titles are in the first person and in the words someone would actually use
 * — "I'm bleeding", not "Antepartum haemorrhage" — because this list is read
 * by someone scanning, not searching. There is deliberately no search box.
 *
 * Ordering is by how urgently it is likely to need action, not alphabetically
 * and not by how common it is.
 */

export type UrgentAction = 'maternity-unit' | 'emergency' | 'mental-health';

export interface UrgentSymptom {
  id: string;
  /** First-person, plain language, as someone would say it out loud. */
  title: string;
  action: UrgentAction;
  /** Shown large, at the top. Keep to one or two short lines. */
  now: string;
  /** Never leave someone wondering what not to do — these are load-bearing. */
  dont?: string[];
  why: string;
  /** Only where it is true. An empty reassurance is worse than none. */
  reassurance?: string;
  sourceIds: string[];
}

export const URGENT_DISCLAIMER =
  'This app cannot check whether you or your baby are well. Always contact your maternity unit if something feels wrong.';

export const urgentSymptoms: UrgentSymptom[] = [
  {
    id: 'movements',
    title: 'My baby is moving less, or differently',
    action: 'maternity-unit',
    now: 'Call your maternity unit now. Any hour, day or night.',
    dont: [
      'Don’t wait until morning.',
      'Don’t try to make your baby move first — no cold drinks, no lying down, no sugary food.',
      'Don’t use a home doppler. Hearing a heartbeat does not mean your baby is well, and it can falsely reassure you.',
    ],
    why: 'A change in your baby’s pattern can be the earliest sign that something needs checking. There is no target number of movements and no need to count kicks — what matters is that this feels different from your baby’s normal.',
    reassurance:
      'Most people who report one episode of reduced movements go on to have a straightforward pregnancy and a healthy baby. Checking early is exactly the right thing to do, and there is no limit on how many times you can go in.',
    sourceIds: ['nhs-baby-movements', 'tommys-movements', 'rcog-gtg57'],
  },
  {
    id: 'bleeding',
    title: 'I’m bleeding',
    action: 'maternity-unit',
    now: 'Call your maternity unit now — however light the bleeding is.',
    dont: ['Use a pad rather than a tampon, so the bleeding can be assessed properly.'],
    why: 'Bleeding has many causes in pregnancy, some completely harmless and some that need treating quickly. It is not something to judge for yourself at home.',
    reassurance:
      'Many pregnancies with early bleeding continue perfectly normally. Calling is the right response regardless of how it turns out.',
    sourceIds: ['nhs-get-help', 'miscarriage-uk'],
  },
  {
    id: 'severe-pain',
    title: 'I have severe or sudden pain',
    action: 'emergency',
    now: 'Call 999 if the pain is severe, constant, or you can’t focus through it — especially with bleeding, shoulder-tip pain, or feeling faint. Otherwise call your maternity unit now.',
    why: 'Sudden severe pain can signal an ectopic pregnancy in early pregnancy, or a problem with the placenta later on. Shoulder-tip pain alongside tummy pain is a specific warning sign of internal bleeding.',
    sourceIds: ['nhs-get-help', 'miscarriage-uk'],
  },
  {
    id: 'headache',
    title: 'I have a bad headache or my vision has changed',
    action: 'maternity-unit',
    now: 'Call your maternity unit now — don’t wait to see if it passes.',
    why: 'A severe headache, blurring, flashing lights or blind spots — especially with pain under your ribs — can be a sign of pre-eclampsia, which needs treating quickly and cannot be diagnosed at home.',
    sourceIds: ['nhs-headaches', 'nhs-get-help'],
  },
  {
    id: 'swelling',
    title: 'I have sudden swelling',
    action: 'maternity-unit',
    now: 'Call your maternity unit now if swelling comes on suddenly, or with a headache or vision changes.',
    why: 'Gradual swelling of ankles and feet is normal in pregnancy. A sudden increase — particularly in your face or hands, or alongside a headache — is one of the signs of pre-eclampsia.',
    reassurance:
      'Mild swelling that builds through the day and settles overnight is extremely common and not what this is about.',
    sourceIds: ['nhs-common-problems', 'nhs-get-help'],
  },
  {
    id: 'fluid',
    title: 'Fluid is leaking',
    action: 'maternity-unit',
    now: 'Call your maternity unit now. Tell them the colour and the smell.',
    why: 'This could be your waters breaking. It is usually a small pop and a trickle rather than a dramatic gush. Waters should be clear — if the fluid is smelly or coloured, say so, as that changes how quickly you need to be seen.',
    sourceIds: ['nhs-labour-signs', 'nhs-get-help'],
  },
  {
    id: 'itching',
    title: 'My skin is itching, especially my hands and feet',
    action: 'maternity-unit',
    now: 'Call your maternity unit and ask for a liver function blood test.',
    why: 'Itching with no rash, on your palms and soles, and worse at night, can mean a liver condition. Its full name is intrahepatic cholestasis of pregnancy, usually shortened to ICP. It needs monitoring and treatment. A blood test finds it — looking at your skin does not.',
    sourceIds: ['nhs-get-help'],
  },
  {
    id: 'temperature',
    title: 'I have a high temperature',
    action: 'maternity-unit',
    now: 'Call your maternity unit if your temperature is 38°C or above.',
    why: 'A high temperature usually means an infection. In pregnancy, infections are treated faster than they otherwise would be.',
    sourceIds: ['nhs-get-help', 'nhs-infections'],
  },
  {
    id: 'contractions',
    title: 'I’m having regular painful contractions',
    action: 'maternity-unit',
    now: 'Call your maternity unit now if you are under 37 weeks. At any stage, call if contractions come every 5 minutes, if one lasts more than 2 minutes, or if you have 6 or more in 10 minutes.',
    why: 'Before 37 weeks this may be premature labour, which is treatable and much better managed early. After 37 weeks it may simply be labour starting — but your unit would rather hear from you than not.',
    reassurance:
      'Irregular tightenings that come and go without a pattern are usually Braxton Hicks — practice contractions — which are normal and not labour.',
    sourceIds: ['nhs-labour-signs'],
  },
  {
    id: 'chest',
    title: 'I’m breathless or have chest pain',
    action: 'emergency',
    now: 'Call 999.',
    why: 'Sudden breathlessness, chest pain that is worse when you breathe in, or coughing up blood can signal a clot on the lung. Pregnancy raises clot risk, and this is treatable — but only quickly.',
    sourceIds: ['nhs-dvt', 'nhs-get-help'],
  },
  {
    id: 'leg',
    title: 'One leg is painful or swollen',
    action: 'maternity-unit',
    now: 'Call your maternity unit, GP or 111 today.',
    why: 'Pain, swelling and tenderness in one leg — usually the calf, often worse walking — can be a deep vein thrombosis. Some swelling in both legs is normal in pregnancy; new pain or swelling in just one leg is different.',
    sourceIds: ['nhs-dvt'],
  },
  {
    id: 'mental-health',
    title: 'I’m having thoughts of harming myself or my baby',
    action: 'mental-health',
    now: 'Call 111 and choose the mental health option, or tell your GP, midwife or health visitor today. If you or anyone else is in immediate danger, call 999.',
    why: 'These thoughts are far more common than people realise. They are a sign you need support quickly — not a reflection of you as a parent, and not something that will be held against you.',
    reassurance:
      'Many people worry their baby will be taken away if they admit to this. That is very rare. Your team’s job is to support you to care for your baby. Samaritans 116 123, free, 24/7. Text SHOUT to 85258. PANDAS 0808 1961 776.',
    sourceIds: ['nhs-urgent-mental-health', 'nhs-mental-health', 'tommys-pnd'],
  },
  {
    id: 'instinct',
    title: 'I just feel something’s wrong',
    action: 'maternity-unit',
    now: 'Call your maternity unit and say exactly that.',
    why: 'You know your own body and your own pregnancy. "Something feels wrong and I can’t explain why" is a legitimate reason to be seen, and midwives treat it as one.',
    reassurance:
      'You will not be wasting anyone’s time. If you feel you are not being taken seriously, you can ask to speak to a senior midwife or ask for a second opinion.',
    sourceIds: ['nhs-get-help', 'weq-black-maternal-health'],
  },
];

export const urgentById = new Map(urgentSymptoms.map((s) => [s.id, s]));
