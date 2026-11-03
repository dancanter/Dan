import type { Season } from './films';

// Eating and living with the UK seasons. Seasonal produce is fresher, often
// higher in vitamins (less time in storage) and cheaper. The body’s needs
// shift too: light, vitamin D, temperature, immunity and mood.

export const SEASON_GUIDE: Record<Season, { title: string; produce: string; eat: string[]; do: string[]; watch: string[] }> = {
  winter: {
    title: 'Winter (Dec–Feb): light, vitamin D and immunity',
    produce: 'Parsnips, swede, celeriac, beetroot, carrots, blood oranges and clementines, pomegranate, forced rhubarb (Feb). Game: venison, pheasant, partridge. Mussels and oysters are at their best (“months with an R”).',
    eat: ['Vitamin D from food: oily fish 3–4 times a week is the main lever (see the vitamin D card).', 'Citrus, kiwi and red peppers for vitamin C and immunity.', 'Warming, slow-cooked stews (moist heat keeps AGEs down): venison, beef shin, root veg.', 'Zinc from oysters, red meat and pumpkin seeds for immunity.'],
    do: ['Get outside in the brightest part of the day. Even overcast winter light beats indoor light by miles for your body clock and mood.', 'Keep a fixed wake time. Dark mornings tempt late sleeping, which drifts your body clock.', 'If low mood comes with the dark months (seasonal affective disorder), a 10,000-lux light box in the morning has good evidence. Talk to your GP.'],
    watch: ['Indoor heating dries skin: up your squalane and tallow nights.', 'Colds and flu: sleep is your best immune defence.', 'Christmas: alcohol and rich food, so plan for it rather than drift into it.'],
  },
  spring: {
    title: 'Spring (Mar–May): reset and build',
    produce: 'Asparagus (Apr–Jun), new potatoes, Jersey Royals, radishes, spring carrots, rhubarb. Spring lamb.',
    eat: ['Radishes, beetroot and asparagus for nitrate and fibre.', 'New potatoes cooled in salads for resistant starch.', 'Keep oily fish going. Vitamin D from sun only starts again in April.'],
    do: ['From April, UK sun can make vitamin D again: 10–20 minutes of midday sun on your arms (SPF on your face).', 'Great training season: build mileage gradually as the light returns.', 'Hay fever season: shower and change after long outdoor runs if pollen affects you.'],
    watch: ['Sun strength rises fast in April and May. Keep your SPF habit sharp.'],
  },
  summer: {
    title: 'Summer (Jun–Aug): sun, heat and hydration',
    produce: 'British strawberries, raspberries, blackcurrants, cherries, gooseberries, tomatoes, courgettes, peas, broad beans, runner beans, cucumbers, lettuces. Mackerel is in season and cheap.',
    eat: ['Berries daily: peak polyphenols at peak season.', 'Tomatoes cooked with a little fat for lycopene (also modest internal sun protection).', 'More fluid and electrolytes in heat: add a pinch of salt and potassium-rich foods after long, sweaty runs.'],
    do: ['Vitamin D season: short midday sun on arms and legs most days covers your needs. Never burn.', 'Run early or late to avoid the heat.', 'Blackout blinds: light at 4:30am can cut your sleep short.'],
    watch: ['SPF50 reapplied every 2 hours when outdoors, plus a hat and sunglasses (you have Persols for a reason).', 'Late barbecues: charring adds AGEs, so marinate in lemon and herbs first.', 'Holiday alcohol.'],
  },
  autumn: {
    title: 'Autumn (Sep–Nov): build the base for winter',
    produce: 'Apples and pears (FODMAP-heavy if you bloat), blackberries, plums, damsons, squash and pumpkin, beetroot, wild mushrooms, celeriac. Game season opens: venison, grouse, partridge. Oysters are back.',
    eat: ['Start the oily-fish habit hard now. Vitamin D stores built over summer run down from October.', 'Squash and beetroot for carotenoids and nitrate.', 'Blackberries and damsons for polyphenols.'],
    do: ['Shorter days: protect morning daylight walks.', 'Get your annual bloods in late autumn or January (vitamin D, ferritin, B12, coeliac antibodies).', 'A strong running season: cool, still weather is ideal for time trials.'],
    watch: ['Clocks go back in late October: hold your wake time steady to avoid a mini jet lag.', 'Mood dips as the light fades: watch for it early.'],
  },
};

export const VITD_NO_SUPPLEMENT = {
  title: 'Vitamin D without supplements',
  intro: 'From October to March the UK sun is too low for your skin to make vitamin D. You get it from food, not tablets, so food has to do the work, and it can, with a plan.',
  foods: [
    ['Mackerel, 150 g fillet', '≈ 24 µg'],
    ['Trout, 150 g fillet', '≈ 24 µg'],
    ['Kippers, 130 g', '≈ 20 µg'],
    ['Wild salmon, 150 g fillet', '≈ 16 µg'],
    ['Tinned pink salmon, 100 g', '≈ 17 µg'],
    ['UV-exposed mushrooms, 80 g', '≈ 8 µg'],
    ['Sardines, 1 tin', '≈ 4 µg'],
    ['2 large eggs', '≈ 3 µg'],
  ],
  plan: 'You need about 70 µg a week. Mackerel or trout twice plus wild salmon twice gives about 80 µg, or 11 µg a day. Add eggs and UV mushrooms and you’re covered.',
  sideEffects: 'Food first, by your choice: no tablets. A vitamin D blood test in January (with your coeliac bloods) shows whether the food plan is working.',
};
