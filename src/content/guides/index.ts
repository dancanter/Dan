import type { Guide, GuideSection, GuidePhase } from '../schema';
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
import { workRightsGuides } from './workRights';
import { healthConditionGuides, vaccinationGuides } from './healthConditions';
import { everydaySafetyGuides, skincareGuides } from './everydaySafety';
import { birthGuides } from './birth';
import { postnatalGuides } from './postnatal';
import { feedingGuides } from './feeding';

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
  ...vaccinationGuides,
  ...everydaySafetyGuides,
  ...skincareGuides,
  ...healthConditionGuides,
  ...workRightsGuides,
  ...birthGuides,
  ...postnatalGuides,
  ...feedingGuides,
];

export const guideById = new Map(guides.map((g) => [g.id, g]));

interface SectionMeta {
  id: GuideSection;
  phase: GuidePhase;
  label: string;
  blurb: string;
}

export const GUIDE_SECTIONS: SectionMeta[] = [
  // ── During pregnancy ───────────────────────────────────────────────
  {
    id: 'nutrition',
    phase: 'pregnancy',
    label: 'Nutrition',
    blurb: 'What actually matters, and what doesn’t.',
  },
  {
    id: 'supplements',
    phase: 'pregnancy',
    label: 'Supplements',
    blurb: 'The two to take, and the one to avoid.',
  },
  {
    id: 'food-safety',
    phase: 'pregnancy',
    label: 'Food safety',
    blurb: 'More is fine than people think.',
  },
  {
    id: 'exercise',
    phase: 'pregnancy',
    label: 'Exercise & movement',
    blurb: 'Safe, and genuinely worth it.',
  },
  {
    id: 'sleep',
    phase: 'pregnancy',
    label: 'Sleep',
    blurb: 'Including the side-sleeping rule from 28 weeks.',
  },
  {
    id: 'wellbeing',
    phase: 'pregnancy',
    label: 'Mental wellbeing',
    blurb: 'Normalising, and what helps.',
  },
  {
    id: 'weight',
    phase: 'pregnancy',
    label: 'Weight & body image',
    blurb: 'No target number. No guilt.',
  },
  { id: 'medications', phase: 'pregnancy', label: 'Medications', blurb: 'The two golden rules.' },
  {
    id: 'vaccinations',
    phase: 'pregnancy',
    label: 'Vaccinations',
    blurb: 'Three recommended, all free.',
  },
  {
    id: 'health-conditions',
    phase: 'pregnancy',
    label: 'Existing conditions',
    blurb: 'Asthma, diabetes, epilepsy, heart and blood pressure.',
  },
  {
    id: 'alcohol-smoking',
    phase: 'pregnancy',
    label: 'Alcohol & smoking',
    blurb: 'Support, not lectures.',
  },
  {
    id: 'work-rights',
    phase: 'pregnancy',
    label: 'Work & your rights',
    blurb: 'What your employer legally must do.',
  },
  {
    id: 'everyday-safety',
    phase: 'pregnancy',
    label: 'Everyday safety',
    blurb: 'Dental, sex, chemicals and DIY.',
  },
  {
    id: 'skincare',
    phase: 'pregnancy',
    label: 'Skincare & beauty',
    blurb: 'Retinoids out; most things fine.',
  },
  { id: 'travel', phase: 'pregnancy', label: 'Travel', blurb: 'Flying, journeys and insurance.' },
  {
    id: 'infections',
    phase: 'pregnancy',
    label: 'Infections',
    blurb: 'The precautions that actually help.',
  },

  // ── Birth ──────────────────────────────────────────────────────────
  {
    id: 'birth-place',
    phase: 'birth',
    label: 'Where and how',
    blurb: 'Hospital, birth centre, home — and types of delivery.',
  },
  {
    id: 'labour',
    phase: 'birth',
    label: 'Signs of labour',
    blurb: 'What it feels like, and when to call.',
  },
  {
    id: 'pain-relief',
    phase: 'birth',
    label: 'Pain relief',
    blurb: 'Every option, with its trade-offs.',
  },
  {
    id: 'birth-prep',
    phase: 'birth',
    label: 'Getting ready',
    blurb: 'Classes, bag, birth plan, going overdue.',
  },

  // ── After birth ────────────────────────────────────────────────────
  {
    id: 'first-days',
    phase: 'after',
    label: 'The first days & weeks',
    blurb: 'Checks, bleeding, and your 6-week appointment.',
  },
  {
    id: 'recovery',
    phase: 'after',
    label: 'Your recovery',
    blurb: 'Including what lasts longer than people are told.',
  },
  {
    id: 'postnatal-mind',
    phase: 'after',
    label: 'Postnatal mental health',
    blurb: 'More than 1 in 10, and treatable.',
  },
  {
    id: 'postnatal-support',
    phase: 'after',
    label: 'Getting support',
    blurb: 'Health visitors, hubs and helplines.',
  },

  // ── Feeding ────────────────────────────────────────────────────────
  {
    id: 'feeding-basics',
    phase: 'feeding',
    label: 'What to expect',
    blurb: 'The honest national picture.',
  },
  {
    id: 'breastfeeding',
    phase: 'feeding',
    label: 'Breastfeeding',
    blurb: 'Expressing, problems, diet and medication.',
  },
  {
    id: 'bottle-feeding',
    phase: 'feeding',
    label: 'Bottle & formula',
    blurb: 'Sterilising, making up feeds, formula types.',
  },
];

export const GUIDE_PHASES: { id: GuidePhase; label: string; blurb: string }[] = [
  {
    id: 'pregnancy',
    label: 'During pregnancy',
    blurb: 'Day-to-day guidance from now until birth.',
  },
  { id: 'birth', label: 'Birth & labour', blurb: 'Preparing for the day itself.' },
  { id: 'after', label: 'After birth', blurb: 'Recovery, your mind, and the first weeks.' },
  { id: 'feeding', label: 'Feeding', blurb: 'However you end up doing it.' },
];

export function guidesInSection(section: GuideSection): Guide[] {
  return guides.filter((g) => g.section === section);
}

export function sectionsInPhase(phase: GuidePhase): SectionMeta[] {
  return GUIDE_SECTIONS.filter((s) => s.phase === phase);
}
