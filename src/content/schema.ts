export type Trimester = 1 | 2 | 3;

export type ContentCategory =
  | 'iron'
  | 'dairy'
  | 'omega3'
  | 'fruit-veg-fibre'
  | 'weight-body-image'
  | 'hormones-symptoms'
  | 'stress-mental-health'
  | 'supplements'
  | 'general-reassurance';

export interface Source {
  id: string;
  label: string;
  organisation: string;
  url?: string;
  note?: string;
}

export interface ContentItem {
  id: string;
  category: ContentCategory;
  trimester: Trimester[];
  title: string;
  /** Short, scannable version shown in the daily "reveal" card. */
  tip: string;
  /** Fuller explanation shown in the article detail view. */
  body: string;
  sourceIds: string[];
  tags?: string[];
  /** Marks content that should be visually flagged as urgent/red-flag guidance. */
  isRedFlag?: boolean;
}

export interface WeekMilestone {
  title: string;
  badgeId: string;
}

export interface WeekPlan {
  week: number;
  trimester: Trimester;
  headline: string;
  babySize?: string;
  dailyTipIds: string[];
  featuredArticleIds: string[];
  milestone?: WeekMilestone;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
}
