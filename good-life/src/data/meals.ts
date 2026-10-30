import type { MealSlot } from '@/store/types';

export interface MealTemplate {
  id: string;
  name: string;
  slot: MealSlot;
  when: string;
  items: { foodId: string; grams: number }[];
  why: string;
}

// Built around foods Dan already tolerates; quantities are raw/dry weights.
export const MEALS: MealTemplate[] = [
  {
    id: 'kefir-oats',
    name: 'Kefir overnight oats with blueberries and walnuts',
    slot: 'breakfast',
    when: 'Quality-session mornings (2–4 h before)',
    items: [
      { foodId: 'oats-gf', grams: 70 },
      { foodId: 'kefir', grams: 200 },
      { foodId: 'blueberries', grams: 100 },
      { foodId: 'walnuts', grams: 15 },
      { foodId: 'honey', grams: 10 },
    ],
    why: 'Slow and fast carbohydrate to top up glycogen, ~20 g protein, and soaking in kefir trims some of the oats’ phytate.',
  },
  {
    id: 'eggs-potatoes',
    name: 'Eggs, crispy potatoes, avocado and spinach',
    slot: 'breakfast',
    when: 'Rest or easy days; late breakfast after an easy run',
    items: [
      { foodId: 'eggs', grams: 175 },
      { foodId: 'potato', grams: 250 },
      { foodId: 'avocado', grams: 50 },
      { foodId: 'spinach', grams: 40 },
      { foodId: 'olive-oil', grams: 5 },
    ],
    why: 'Three whole eggs for choline, B12 and vitamin D; potatoes for potassium and carbohydrate; avocado helps absorb the spinach carotenoids.',
  },
  {
    id: 'greek-bowl',
    name: 'Greek yoghurt, strawberries, hazelnuts and oats',
    slot: 'post-run',
    when: 'Within ~2 h after training',
    items: [
      { foodId: 'greek-yoghurt-0', grams: 250 },
      { foodId: 'strawberries', grams: 150 },
      { foodId: 'oats-gf', grams: 30 },
      { foodId: 'hazelnuts', grams: 15 },
      { foodId: 'honey', grams: 10 },
    ],
    why: '~30 g protein with carbohydrate to start glycogen repletion; strawberries add vitamin C for collagen and iron absorption.',
  },
  {
    id: 'chicken-rice',
    name: 'Chicken, basmati, courgette and peppers',
    slot: 'lunch',
    when: 'Any training day',
    items: [
      { foodId: 'chicken-breast', grams: 160 },
      { foodId: 'rice-basmati', grams: 85 },
      { foodId: 'courgette', grams: 150 },
      { foodId: 'red-pepper', grams: 100 },
      { foodId: 'olive-oil', grams: 10 },
    ],
    why: 'A dependable, gut-friendly training-day plate: ~40 g protein, ~70 g carbohydrate, very gentle vegetables.',
  },
  {
    id: 'salmon-traybake',
    name: 'Wild salmon traybake with potatoes, parsnips and green beans',
    slot: 'dinner',
    when: 'Twice a week',
    items: [
      { foodId: 'salmon-wild', grams: 150 },
      { foodId: 'potato', grams: 300 },
      { foodId: 'parsnip', grams: 100 },
      { foodId: 'green-beans', grams: 100 },
      { foodId: 'olive-oil', grams: 10 },
    ],
    why: 'Covers the week’s oily-fish advice in one meal, plus vitamin D and a large potassium hit.',
  },
  {
    id: 'beef-sweet-potato',
    name: 'Lean beef, roasted sweet potato, carrots and tomato',
    slot: 'dinner',
    when: 'Once or twice a week',
    items: [
      { foodId: 'beef-mince-5', grams: 150 },
      { foodId: 'sweet-potato', grams: 250 },
      { foodId: 'carrot', grams: 80 },
      { foodId: 'tomato', grams: 150 },
      { foodId: 'olive-oil', grams: 5 },
    ],
    why: 'Haem iron and zinc — the two minerals runners most often run short of — with vitamin A from the orange veg.',
  },
  {
    id: 'sardine-potato-salad',
    name: 'Sardine, potato and rocket salad',
    slot: 'lunch',
    when: 'Rest days or light days',
    items: [
      { foodId: 'sardines', grams: 90 },
      { foodId: 'potato', grams: 200 },
      { foodId: 'rocket', grams: 40 },
      { foodId: 'tomato', grams: 100 },
      { foodId: 'avocado', grams: 50 },
      { foodId: 'olive-oil', grams: 10 },
    ],
    why: 'Calcium and vitamin D together (bones), EPA/DHA, and cooled potatoes for resistant starch.',
  },
  {
    id: 'mackerel-quinoa',
    name: 'Mackerel, quinoa and pak choi',
    slot: 'dinner',
    when: 'If quinoa and pak choi suit you',
    items: [
      { foodId: 'mackerel', grams: 120 },
      { foodId: 'quinoa', grams: 70 },
      { foodId: 'pak-choi', grams: 100 },
      { foodId: 'red-pepper', grams: 80 },
    ],
    why: 'The highest omega-3 and vitamin D meal here; quinoa adds magnesium and folate.',
  },
  {
    id: 'tofu-rice',
    name: 'Crispy tofu, rice and pak choi',
    slot: 'dinner',
    when: 'Meat-free night',
    items: [
      { foodId: 'tofu-firm', grams: 180 },
      { foodId: 'rice-basmati', grams: 75 },
      { foodId: 'pak-choi', grams: 100 },
      { foodId: 'carrot', grams: 80 },
      { foodId: 'olive-oil', grams: 10 },
    ],
    why: 'A plant protein that is often tolerated where lentils and beans are not, with well-absorbed calcium.',
  },
  {
    id: 'liver-mash',
    name: 'Liver, mash and green beans (once a week at most)',
    slot: 'dinner',
    when: 'Weekly at most',
    items: [
      { foodId: 'beef-liver', grams: 80 },
      { foodId: 'potato', grams: 250 },
      { foodId: 'green-beans', grams: 100 },
      { foodId: 'butter', grams: 5 },
    ],
    why: 'A weekly micronutrient top-up — but the vitamin A is why it stays weekly.',
  },
  {
    id: 'pre-run',
    name: 'Pre-run top-up: banana, rice cakes, honey',
    slot: 'pre-run',
    when: '30–90 minutes before a quality session',
    items: [
      { foodId: 'banana', grams: 120 },
      { foodId: 'rice-cakes', grams: 20 },
      { foodId: 'honey', grams: 10 },
    ],
    why: '~45 g fast carbohydrate, low fibre and fat so it sits lightly.',
  },
  {
    id: 'pre-sleep',
    name: 'Pre-sleep cottage cheese, blueberries and walnuts',
    slot: 'pre-sleep',
    when: 'Evening, especially after lifting',
    items: [
      { foodId: 'cottage-cheese', grams: 200 },
      { foodId: 'blueberries', grams: 80 },
      { foodId: 'walnuts', grams: 10 },
    ],
    why: 'Slow casein protein overnight; small, so it will not disturb sleep.',
  },
];
