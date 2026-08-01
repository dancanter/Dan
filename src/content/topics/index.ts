import type { ContentItem } from '../schema';
import { ironAnaemiaContent } from './iron-anaemia';
import { dairyBirthOutcomesContent } from './dairy-birth-outcomes';
import { dairyIodineContent } from './dairy-iodine';
import { omega3OilyFishContent } from './omega3-oily-fish';
import { fruitVegFibreSugarContent } from './fruit-veg-fibre-sugar';
import { dontDietContent } from './dont-diet';
import { hormonesSymptomsContent } from './hormones-symptoms';
import { stressMentalHealthContent } from './stress-mental-health';
import { weightBodyImageContent } from './weight-body-image';
import { vitaminDSunlightContent } from './vitamin-d-sunlight';
import { supplementsCoreContent } from './supplements-core';

export const allContentItems: ContentItem[] = [
  ...ironAnaemiaContent,
  ...dairyBirthOutcomesContent,
  ...dairyIodineContent,
  ...omega3OilyFishContent,
  ...fruitVegFibreSugarContent,
  ...dontDietContent,
  ...hormonesSymptomsContent,
  ...stressMentalHealthContent,
  ...weightBodyImageContent,
  ...vitaminDSunlightContent,
  ...supplementsCoreContent,
];

export const contentItemById = new Map(allContentItems.map((c) => [c.id, c]));
