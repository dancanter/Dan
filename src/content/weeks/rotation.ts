import type { Trimester, WeekPlan } from '../schema';
import { contentItemById } from '../topics';

function trimesterForWeek(week: number): Trimester {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

// Every week outside the two hand-curated deep-dive weeks (9 and 20, see
// week-09.ts / week-20.ts) still gets real, cited content — just assembled
// by rotating through the topics relevant to that trimester, rather than
// each week having bespoke hand-written content. As more research batches
// get added to src/content/topics/, add the new ContentItem ids to the
// relevant list(s) below and every affected week picks them up automatically.

const TRIMESTER_1_IDS = [
  'supplements-folic-acid',
  'hormones-nausea',
  'hormones-heartburn-constipation',
  'hormones-fatigue',
  'hormones-frequent-urination',
  'hormones-mood-swings',
  'dont-diet-eat-for-two',
  'supplements-vitamin-d',
  'supplements-what-to-avoid',
  'stress-normalising',
  'stress-mindfulness',
  'stress-relaxation-techniques',
  'stress-coping-strategies',
  'stress-reach-out',
  'stress-signposting',
  'sunlight-vitamin-d',
  'dairy-iodine',
  'fruit-veg-fibre-sugar-gaps',
  'iron-anaemia-risk',
  'weight-no-target-number',
];

const TRIMESTER_2_IDS = [
  'iron-anaemia-risk',
  'dairy-birth-outcomes',
  'dairy-iodine',
  'omega3-oily-fish',
  'fruit-veg-fibre-sugar-gaps',
  'weight-no-target-number',
  'weight-both-directions-risk',
  'weight-underweight-consideration',
  'weight-cravings-eating-for-two',
  'weight-body-image-trajectory',
  'weight-support-gap',
  'hormones-mood-swings',
  'hormones-heartburn-constipation',
  'hormones-frequent-urination',
  'sunlight-vitamin-d',
  'supplements-vitamin-d',
  'supplements-iron',
  'stress-relaxation-techniques',
  'stress-mindfulness',
  'dont-diet-eat-for-two',
];

const TRIMESTER_3_IDS = [
  'hormones-fatigue',
  'hormones-breathlessness',
  'hormones-frequent-urination',
  'hormones-heartburn-constipation',
  'weight-no-target-number',
  'weight-both-directions-risk',
  'iron-anaemia-risk',
  'omega3-oily-fish',
  'dairy-birth-outcomes',
  'dairy-iodine',
  'fruit-veg-fibre-sugar-gaps',
  'sunlight-vitamin-d',
  'supplements-vitamin-d',
  'supplements-iron',
  'stress-coping-strategies',
  'stress-reach-out',
  'stress-signposting',
  'weight-cravings-eating-for-two',
  'dont-diet-eat-for-two',
];

// Kept separate from the rotations above: this is safety-relevant red-flag
// content, so it's surfaced deliberately as a featured read in trimesters 2
// and 3 (when swelling/pre-eclampsia risk is actually relevant) rather than
// mixed into the light "tap to reveal" daily tip rotation.
const RED_FLAG_IDS = ['hormones-swelling'];

const TRIMESTER_IDS: Record<Trimester, string[]> = {
  1: TRIMESTER_1_IDS,
  2: TRIMESTER_2_IDS,
  3: TRIMESTER_3_IDS,
};

const TRIMESTER_HEADLINES: Record<Trimester, string[]> = {
  1: [
    'Your body is already changing fast',
    'Small steps, solid foundations',
    'Getting the essentials in place',
  ],
  2: [
    'Settling into the rhythm of pregnancy',
    'Building strength for the months ahead',
    'The steady middle stretch',
  ],
  3: [
    'The final stretch',
    'Getting ready to meet your baby',
    'Almost there',
  ],
};

function pickSlice(ids: string[], offset: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => ids[(offset + i) % ids.length]);
}

export function buildRotatedWeeks(weeks: number[]): WeekPlan[] {
  return weeks.map((week) => {
    const trimester = trimesterForWeek(week);
    const ids = TRIMESTER_IDS[trimester];
    const dailyTipIds = pickSlice(ids, week, 7);
    const featuredArticleIds = pickSlice(ids, week + 9, 4);
    if (trimester !== 1) {
      featuredArticleIds.push(...RED_FLAG_IDS.filter((id) => !featuredArticleIds.includes(id)));
    }

    const headlineOptions = TRIMESTER_HEADLINES[trimester];
    const headline = headlineOptions[week % headlineOptions.length];

    return {
      week,
      trimester,
      headline,
      dailyTipIds,
      featuredArticleIds,
    };
  });
}

const populatedWeeks = new Set([9, 20]);
const allWeekNumbers = Array.from({ length: 42 - 4 + 1 }, (_, i) => i + 4);
export const rotatedWeekNumbers = allWeekNumbers.filter((w) => !populatedWeeks.has(w));

// Sanity check kept here (rather than only in tests) so a typo'd id in one
// of the rotation lists above fails fast in dev, same spirit as the
// content-wide integrity check in content/index.ts.
for (const ids of [TRIMESTER_1_IDS, TRIMESTER_2_IDS, TRIMESTER_3_IDS, RED_FLAG_IDS]) {
  for (const id of ids) {
    if (!contentItemById.has(id)) {
      throw new Error(`weeks/rotation.ts references unknown ContentItem id "${id}"`);
    }
  }
}
