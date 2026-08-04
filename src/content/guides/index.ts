import type { Guide, GuideSection } from '../schema';
import { nutritionGuides } from './nutrition';
import { supplementGuides } from './supplements';
import { foodSafetyGuides } from './foodSafety';
import { exerciseGuides, sleepGuides } from './movement';
import { wellbeingGuides, weightGuides } from './wellbeing';
import {
  medicationGuides,
  alcoholSmokingGuides,
  travelGuides,
  infectionGuides,
} from './everydayLife';

export const guides: Guide[] = [
  ...nutritionGuides,
  ...supplementGuides,
  ...foodSafetyGuides,
  ...exerciseGuides,
  ...sleepGuides,
  ...wellbeingGuides,
  ...weightGuides,
  ...medicationGuides,
  ...alcoholSmokingGuides,
  ...travelGuides,
  ...infectionGuides,
];

export const guideById = new Map(guides.map((g) => [g.id, g]));

export const GUIDE_SECTIONS: { id: GuideSection; label: string; blurb: string }[] = [
  { id: 'nutrition', label: 'Nutrition', blurb: 'What actually matters, and what doesn’t.' },
  { id: 'supplements', label: 'Supplements', blurb: 'The two to take, and the one to avoid.' },
  { id: 'food-safety', label: 'Food safety', blurb: 'More is fine than people think.' },
  { id: 'exercise', label: 'Exercise & movement', blurb: 'Safe, and genuinely worth it.' },
  { id: 'sleep', label: 'Sleep', blurb: 'Including the side-sleeping rule from 28 weeks.' },
  { id: 'wellbeing', label: 'Mental wellbeing', blurb: 'Normalising, and what helps.' },
  { id: 'weight', label: 'Weight & body image', blurb: 'No target number. No guilt.' },
  { id: 'medications', label: 'Medications', blurb: 'The two golden rules.' },
  { id: 'alcohol-smoking', label: 'Alcohol & smoking', blurb: 'Support, not lectures.' },
  { id: 'travel', label: 'Travel', blurb: 'Flying, journeys and insurance.' },
  { id: 'infections', label: 'Infections', blurb: 'The precautions that actually help.' },
];

export function guidesInSection(section: GuideSection): Guide[] {
  return guides.filter((g) => g.section === section);
}
