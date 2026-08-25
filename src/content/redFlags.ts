import type { RedFlag } from './schema';

/**
 * Safety-critical. This content is reachable from every screen via the
 * persistent Get Help tab, is never gated behind onboarding, and is
 * deliberately the one place in the app that uses alarm styling.
 */
export const redFlags: RedFlag[] = [
  {
    id: 'movements',
    level: 'maternity-unit',
    title: "Your baby's movements",
    detail:
      "Moving less than usual, movements feel weaker, or stopped altogether. Don't wait until morning. Don't try to make your baby move first. Don't use a home doppler — hearing a heartbeat doesn't mean your baby is well.",
  },
  {
    id: 'bleeding',
    level: 'maternity-unit',
    title: 'Any vaginal bleeding',
    detail: 'However light.',
  },
  {
    id: 'headache',
    level: 'maternity-unit',
    title: 'Severe headache',
    detail:
      'Especially with vision changes (blurring, flashing lights, blind spots) or pain under your ribs.',
  },
  {
    id: 'swelling',
    level: 'maternity-unit',
    title: 'Sudden or severe swelling',
    detail: 'Face, hands or feet, especially alongside headache or vision changes.',
  },
  {
    id: 'fluid',
    level: 'maternity-unit',
    title: 'Fluid leaking from your vagina',
    detail: 'Could be your waters.',
  },
  {
    id: 'temperature',
    level: 'maternity-unit',
    title: 'High temperature (38°C or above)',
    detail: 'Can signal infection.',
  },
  {
    id: 'tummy-pain',
    level: 'maternity-unit',
    title: 'Severe or sudden tummy pain',
    detail: 'Especially with bleeding, shoulder-tip pain, or feeling faint.',
  },
  {
    id: 'itching',
    level: 'maternity-unit',
    title: 'Itchy skin',
    detail:
      'Especially palms and soles, worse at night. Can signal a liver condition (ICP) that needs treatment.',
  },
  {
    id: 'vomiting',
    level: 'maternity-unit',
    title: 'Severe vomiting',
    detail: "Can't keep fluids down for 24 hours, dark urine, or no wee for 8+ hours.",
  },
  {
    id: 'instinct',
    level: 'maternity-unit',
    title: 'You just feel something is wrong',
    detail: "Even if you can't explain why. This counts. Say exactly that.",
  },
  {
    id: 'heavy-bleeding',
    level: 'emergency',
    title: 'Heavy bleeding',
    detail: 'Soaking a pad quickly.',
  },
  {
    id: 'severe-pain',
    level: 'emergency',
    title: "Severe tummy pain you can't focus through",
    detail: 'Especially with shoulder pain or bleeding.',
  },
  {
    id: 'fainting',
    level: 'emergency',
    title: 'Fainting or loss of consciousness',
    detail: 'Or feeling repeatedly close to it.',
  },
  {
    id: 'chest-pain',
    level: 'emergency',
    title: 'Chest pain or sudden breathlessness',
    detail: 'Particularly if the pain is worse when you breathe in.',
  },
  {
    id: 'numbness',
    level: 'emergency',
    title: 'Losing feeling in your legs, bottom or genitals',
    detail: 'This needs immediate assessment.',
  },
];

export interface HelpTopic {
  id: string;
  title: string;
  body: string[];
  sourceIds: string[];
}

export const helpTopics: HelpTopic[] = [
  {
    id: 'dvt',
    title: 'Blood clots (DVT) — what to look for',
    body: [
      'Pregnancy raises clot risk. Watch for pain, swelling and tenderness in **one** leg — usually the calf, often worse when walking, sometimes with red or darkened skin.',
      'Some swelling in both legs is normal in pregnancy. New pain or swelling in just one leg is different.',
      'Also urgent: sudden breathlessness, chest pain that is worse when you breathe in, or coughing up blood — these can signal a clot on the lung.',
    ],
    sourceIds: ['nhs-dvt'],
  },
  {
    id: 'mental-health-urgent',
    title: 'Mental health — urgent support',
    body: [
      'If you are having thoughts of harming yourself or your baby, tell your GP, midwife or health visitor urgently, or call **111** and choose the mental health option.',
      "These thoughts are more common than people realise, and they're a sign you need support quickly — not a reflection of you as a parent.",
      'If you or anyone else is in immediate danger, call **999** or go to A&E. A mental health emergency should be taken as seriously as a physical one. **You will not be wasting anyone’s time.**',
      'Also: Samaritans 116 123 (free, 24/7) · text SHOUT to 85258 · PANDAS 0808 1961 776 (11am–10pm).',
    ],
    sourceIds: ['nhs-urgent-mental-health', 'nhs-mental-health'],
  },
  {
    id: 'movements-visit',
    title: 'What happens if you go in about movements',
    body: [
      "You'll be asked about the movements, have your baby's heartbeat checked, your bump measured, blood pressure and urine tested. After 26 weeks they'll usually also monitor your baby's heart rate on a CTG for at least 20 minutes.",
      "Most people are reassured and go home the same visit. You shouldn't be sent home if there are still concerns, and it's fine to ask for these checks if they aren't offered.",
      '**And if it happens again?** Go back. Even shortly after being reassured. There is no limit, and no such thing as calling too often about this.',
    ],
    sourceIds: ['tommys-movements', 'rcog-gtg57'],
  },
  {
    id: 'movements-why',
    title: 'Why movements matter — the honest version',
    body: [
      'In about half of stillbirths, the mother had noticed her baby moving less first. That sounds frightening. But it does not mean reduced movements usually lead to loss. Most women who report it once go on to have a normal pregnancy and a healthy baby.',
      "It also does not mean it is ever a parent's fault for not spotting it sooner. Checking early matters for one reason: problems found early can usually be treated.",
    ],
    sourceIds: ['tommys-movements'],
  },
  {
    id: 'movements-pattern',
    title: "Getting to know your baby's pattern",
    body: [
      'Most people feel movements from 16–24 weeks (often after 20 in a first pregnancy). Movements increase up to about 32 weeks, then stay roughly the same right up to and during labour — they *do not* reduce toward the end, whatever you may have heard.',
      "There's no set number to aim for and no need to count kicks. What matters is knowing what's normal for *your* baby, so you'd notice a change.",
      'If your placenta is at the front of your womb (anterior placenta), movements can feel fainter — normal, but the same rule applies if your pattern changes.',
    ],
    sourceIds: ['nhs-baby-movements', 'tommys-movements', 'rcog-gtg57'],
  },
  {
    id: 'where-to-go',
    title: 'Where to go, when — by stage',
    body: [
      '**First 12 weeks:** GP surgery or early pregnancy unit (EPU).',
      '**12–19 weeks:** midwife or EPU.',
      '**20 weeks onwards:** midwife or maternity unit.',
      'Call **999** for anything life-threatening at any stage. **111** if you are unsure or out of hours. Check your local NHS trust website — this varies by area.',
    ],
    sourceIds: ['nhs-get-help'],
  },
];
