import type { Badge } from './schema';

export const badges: Badge[] = [
  {
    id: 'first-trimester-checkin',
    title: 'First trimester check-in',
    description: 'Explored the hormones, symptoms, and stress content for week 9.',
  },
  {
    id: 'halfway-there',
    title: 'Halfway there',
    description: 'Reached week 20 — the midpoint of pregnancy.',
  },
  {
    id: 'ten-articles',
    title: 'Curious mind',
    description: 'Read 10 articles.',
  },
  {
    id: 'seven-day-visit',
    title: 'A week of check-ins',
    description: 'Opened Bump on 7 different days.',
  },
];

export const badgeById = new Map(badges.map((b) => [b.id, b]));
