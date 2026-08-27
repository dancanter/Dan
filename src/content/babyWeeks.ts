import type { BabyWeek, Milestone } from './schema';

/**
 * Week-by-week fetal development. The size comparisons are deliberately
 * framed as rough and friendly — see the caveat shown on the Baby screen,
 * since babies vary enormously and a bump measurement is what actually
 * matters clinically.
 */
export const babyWeeks: BabyWeek[] = [
  // Weeks 1–3 exist because of how pregnancy is dated, not because there is
  // anything to see. Said plainly here rather than padded out, since the
  // honest answer — "you weren't pregnant yet" — is the useful one.
  {
    week: 1,
    sizeLabel: 'No baby yet — this week is your period',
    size: 'nothing yet',
    development:
      'Pregnancy is counted from the first day of your last period, so week 1 is your period. It is an odd system, but every due date, scan and appointment uses it — which is why you get called "4 weeks pregnant" about a fortnight after conception.',
  },
  {
    week: 2,
    sizeLabel: 'No baby yet — conception happens around now',
    size: 'nothing yet',
    development:
      'Your body releases an egg towards the end of this week. If it meets sperm, conception happens here — though you are still officially "2 weeks pregnant" before there is anything to be pregnant with.',
  },
  {
    week: 3,
    sizeLabel: 'Smaller than a full stop',
    size: 'a full stop',
    development:
      'A fertilised egg divides into a ball of around a hundred cells and travels down towards your womb. Nothing you would feel, and a test would still read negative.',
  },
  {
    week: 4,
    size: 'a poppy seed',
    development:
      'The very beginnings — a cluster of cells is burrowing into your womb lining. Nothing visible yet, but a great deal underway.',
  },
  {
    week: 5,
    size: 'an apple pip',
    development:
      'The neural tube — which becomes the brain and spinal cord — is forming. This is exactly why folic acid matters so much right now.',
  },
  {
    week: 6,
    size: 'a lentil',
    development:
      'A heartbeat flickers into existence this week. Tiny buds that will become arms and legs are appearing.',
  },
  {
    week: 7,
    size: 'a blueberry',
    development:
      'The brain is growing fast — around 100 new cells a minute. Facial features are starting to take shape.',
  },
  {
    week: 8,
    size: 'a raspberry',
    development:
      'Now officially a fetus. Fingers and toes are forming, and the heart has settled into a regular rhythm.',
  },
  {
    week: 9,
    size: 'a grape',
    development:
      'All major organs have begun forming. Tiny movements are happening, though far too small to feel.',
  },
  {
    week: 10,
    size: 'a kumquat',
    development: 'Vital organs are up and running. Fingernails and hair are starting to appear.',
  },
  {
    week: 11,
    size: 'a fig',
    development:
      'Your baby can hiccup now. Bones are hardening, and the face is looking much more human.',
  },
  {
    week: 12,
    size: 'a lime',
    development:
      'Reflexes are developing — your baby can curl fingers and toes. Most of the risky early development is complete.',
  },
  {
    week: 13,
    size: 'a pea pod',
    development: 'Vocal cords are forming. Your baby has fingerprints now, entirely unique.',
  },
  {
    week: 14,
    size: 'a lemon',
    development:
      'Facial muscles are working — squinting, frowning, grimacing. Not emotions yet, just practice.',
  },
  {
    week: 15,
    size: 'an apple',
    development:
      'Your baby can sense light through closed eyelids, and is starting to move more purposefully.',
  },
  {
    week: 16,
    size: 'an avocado',
    development:
      'Tiny bones in the ears are in place — your baby may be starting to hear muffled sound.',
  },
  {
    week: 17,
    size: 'a pear',
    development:
      'Fat is starting to form under the skin. The umbilical cord is growing thicker and stronger.',
  },
  {
    week: 18,
    size: 'a sweet potato',
    development:
      'Your baby is yawning, stretching and making faces. You might start feeling flutters.',
  },
  {
    week: 19,
    size: 'a mango',
    development:
      'Vernix, a waxy protective coating, is forming over the skin. Senses are developing rapidly.',
  },
  {
    week: 20,
    size: 'a banana',
    development:
      'Halfway. Your baby is swallowing, and producing meconium — the first nappy is being prepared.',
  },
  {
    week: 21,
    size: 'a carrot',
    development:
      'Your baby can now taste what you eat, through the amniotic fluid. Movements are getting stronger.',
  },
  {
    week: 22,
    size: 'a papaya',
    development:
      'Lips, eyelids and eyebrows are more distinct. Your baby now looks like a miniature newborn.',
  },
  {
    week: 23,
    size: 'a large mango',
    development:
      'Hearing is sharpening — loud sounds may make your baby move. Talking and reading aloud is a lovely thing to do.',
  },
  {
    week: 24,
    size: 'an ear of corn',
    development:
      'A milestone: lungs are developing branches and producing surfactant. Your baby is considered viable.',
  },
  {
    week: 25,
    size: 'a swede',
    development:
      'Your baby is putting on baby fat, and skin is becoming less translucent and more opaque.',
  },
  {
    week: 26,
    size: 'a lettuce',
    development:
      'Eyes are starting to open. Brain wave activity for hearing and sight is being recorded.',
  },
  {
    week: 27,
    size: 'a cauliflower',
    development: 'Your baby has regular sleep and wake cycles now, and may be sucking their thumb.',
  },
  {
    week: 28,
    size: 'an aubergine',
    development: 'Eyes can open, close and blink. Your baby can dream — REM sleep has begun.',
  },
  {
    week: 29,
    size: 'a butternut squash',
    development:
      'Bones are fully formed but still soft. Your baby is beginning to store iron and calcium.',
  },
  {
    week: 30,
    size: 'a cabbage',
    development:
      "Your baby's brain is developing fast and the surface is becoming grooved and wrinkled.",
  },
  {
    week: 31,
    size: 'a coconut',
    development:
      'Rapid weight gain from here. Your baby is running out of room and movements feel different — but shouldn’t reduce.',
  },
  {
    week: 32,
    size: 'a jicama',
    development:
      'Practice breathing movements are happening. Toenails and fingernails are fully formed.',
  },
  {
    week: 33,
    size: 'a pineapple',
    development:
      'The skull bones stay soft and separate, to make the journey through the birth canal possible.',
  },
  {
    week: 34,
    size: 'a cantaloupe',
    development:
      "Your baby's central nervous system and lungs are maturing steadily. Fat continues building.",
  },
  {
    week: 35,
    size: 'a honeydew melon',
    development:
      'Most of the physical development is complete — from here it’s mostly growing and gaining weight.',
  },
  {
    week: 36,
    size: 'a romaine lettuce',
    development:
      'Your baby may "drop" lower into your pelvis, which can ease breathing but increase bladder pressure.',
  },
  {
    week: 37,
    size: 'a bunch of chard',
    development:
      'Nearly there. Your baby is practising for the outside world — breathing, sucking, blinking.',
  },
  {
    week: 38,
    size: 'a leek',
    development: "Vernix and lanugo are shedding. Your baby's grasp is firm.",
  },
  {
    week: 39,
    size: 'a mini watermelon',
    development: "Full term. Your baby's organs are ready to function independently.",
  },
  {
    week: 40,
    size: 'a small pumpkin',
    development:
      'Due date week — though only about 1 in 20 babies arrive exactly on it. Any day now.',
  },
  {
    week: 41,
    size: 'a small pumpkin',
    development:
      'Going a little past your due date is common and usually fine. Your midwife will talk through a membrane sweep and induction options.',
  },
  {
    week: 42,
    size: 'a small pumpkin',
    development:
      'Almost everyone has given birth or been induced by now. Your team will be monitoring you closely.',
  },
];

export const babyWeekByNumber = new Map(babyWeeks.map((b) => [b.week, b]));

export const milestones: Milestone[] = [
  { week: 6, title: 'Heartbeat begins' },
  { week: 9, title: 'All major organs forming' },
  {
    week: 12,
    title: 'Reflexes developing; fingerprints soon',
    celebration: 'End of the first trimester — most of the riskiest early development is complete.',
  },
  {
    week: 16,
    title: 'Ear bones in place — hearing begins',
    celebration: 'Your baby may be starting to hear muffled sound. Worth saying hello.',
  },
  { week: 18, title: 'You may start feeling movements' },
  {
    week: 20,
    title: 'Halfway. Swallowing and producing meconium',
    celebration: 'Halfway there. Twenty weeks down, twenty to go.',
  },
  {
    week: 24,
    title: 'Considered viable; lungs producing surfactant',
    celebration: 'A genuine milestone — your baby is now considered viable.',
  },
  { week: 26, title: 'Eyes start to open' },
  {
    week: 28,
    title: 'Dreaming begins (REM sleep)',
    celebration:
      'Third trimester. Your baby can dream now — and this is the week side-sleeping starts to matter.',
  },
  { week: 32, title: 'Movements settle to a steady pattern' },
  {
    week: 37,
    title: 'Practising breathing, sucking, blinking',
    celebration: 'Your baby is nearly ready. Not long now.',
  },
  {
    week: 39,
    title: 'Full term — organs ready',
    celebration: 'Full term. Your baby could arrive any day.',
  },
];
