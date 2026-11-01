import type { Season } from './films';

// Optional ideas for the day: small, varied, genuinely good for you.
// Picked fresh each day (seasonal ones only in their season). Do one if
// you have time; skipping them costs nothing.

export interface Idea { id: string; text: string; area: 'health' | 'looks' | 'style' | 'mind' | 'social' | 'learn' | 'career' | 'fun'; seasons?: Season[] }

export const IDEAS: Idea[] = [
  { id: 'new-recipe', area: 'health', text: 'Cook one new recipe built around something in season.' },
  { id: 'fish-batch', area: 'health', text: 'Batch-cook two portions of oily fish for this week’s vitamin D days.' },
  { id: 'new-plant', area: 'health', text: 'Buy one fruit or veg you haven’t had this month. Plant variety feeds your gut microbiome.' },
  { id: 'herbs', area: 'health', text: 'Add a fistful of fresh herbs (parsley, coriander, basil) to a meal: a free polyphenol boost.' },
  { id: 'mobility', area: 'health', text: '10 minutes of the runner’s mobility flow while something cooks.' },
  { id: 'strides', area: 'health', text: '4–6 relaxed strides after an easy run: speed with almost no fatigue.' },
  { id: 'posture', area: 'looks', text: '3 sets of chin tucks and wall angels: posture is half of a sharp jawline in photos.' },
  { id: 'photo', area: 'looks', text: 'Take a progress photo (face and body, morning, same light). Compare with two weeks ago.' },
  { id: 'brows', area: 'looks', text: 'Tidy your brows and neck line. Small grooming, big difference.' },
  { id: 'skin-reset', area: 'looks', text: 'Skin night: gentle cleanse, chilled gua sha for 3 minutes, squalane or tallow, early bed.' },
  { id: 'teeth', area: 'looks', text: 'Floss properly and swap one squash for water. A bright smile is part of the look.' },
  { id: 'nails-hair', area: 'looks', text: 'Book the next haircut so it’s never overdue: every 3–4 weeks keeps the shape sharp.' },
  { id: 'outfit', area: 'style', text: 'Build one outfit from what you own you’ve never worn together. Riviera rule: fewer colours, better fabrics.' },
  { id: 'care', area: 'style', text: 'Care session: brush knitwear, condition leather shoes, steam a shirt. Good clothes last decades.' },
  { id: 'style-film', area: 'style', text: 'Watch 20 minutes of a Delon or Connery film and note one styling detail to borrow.' },
  { id: 'wardrobe-edit', area: 'style', text: 'Take out three things you never wear. Sell or donate one.' },
  { id: 'breathe', area: 'mind', text: '10 minutes of slow breathing between study blocks.' },
  { id: 'journal', area: 'mind', text: 'Write three lines: what went well, what you learned, what tomorrow’s first task is.' },
  { id: 'no-phone-hour', area: 'mind', text: 'One hour with your phone in another room. Notice how your focus changes.' },
  { id: 'body-scan', area: 'mind', text: 'The 10-minute body-scan rest after lunch.' },
  { id: 'nature-walk', area: 'mind', text: '30 minutes in green space or by water, no headphones.' },
  { id: 'gratitude-msg', area: 'social', text: 'Send a message thanking someone who helped you this year.' },
  { id: 'call', area: 'social', text: 'Call a friend or family member instead of texting.' },
  { id: 'cook-for', area: 'social', text: 'Cook a meal for someone at home.' },
  { id: 'plan-meet', area: 'social', text: 'Plan a walk, run or film night with a friend this week.' },
  { id: 'kindness', area: 'social', text: 'Do one small, unasked-for kind thing.' },
  { id: 'french', area: 'learn', text: '15 minutes of French for the trip: ordering, “sans gluten”, small talk.' },
  { id: 'read', area: 'learn', text: '20 minutes of a book that isn’t for your course.' },
  { id: 'podcast', area: 'learn', text: 'Listen to one episode on economics, politics or trading on a walk.' },
  { id: 'markets', area: 'learn', text: 'Read the FT or Economist summary of the week and note one thing that surprised you.' },
  { id: 'teach', area: 'learn', text: 'Explain a concept from SK297 or SK298 out loud in 2 minutes. If you can teach it, you know it.' },
  { id: 'paper', area: 'career', text: 'Read one public health paper abstract (e.g. BMJ, Lancet Public Health) and summarise it in three lines.' },
  { id: 'cv', area: 'career', text: 'Add one line to your CV from your ward-buddy volunteering or study this month.' },
  { id: 'nhs-jobs', area: 'career', text: 'Check NHS Jobs for part-time health-improvement or public health roles near you.' },
  { id: 'linkedin', area: 'career', text: 'Follow or message one public health professional whose work you admire.' },
  { id: 'phe-data', area: 'career', text: 'Explore one indicator for your area on the OHID Fingertips public health profiles.' },
  { id: 'film-night', area: 'fun', text: 'Movie night: let Glow pick from this season’s list.' },
  { id: 'new-route', area: 'fun', text: 'Run or walk a route you’ve never done.' },
  { id: 'gallery', area: 'fun', text: 'Visit a gallery, museum or bookshop: inspiration with no screen.' },
  { id: 'music', area: 'fun', text: 'Make a playlist for your next quality session.' },
  { id: 'trip-plan', area: 'fun', text: 'Plan one perfect day in France: a walk, a gluten-free lunch, a view.' },
  { id: 'photo-walk', area: 'fun', text: 'Photo walk: 10 shots of something beautiful nearby.' },
  { id: 'winter-light', area: 'mind', text: 'Get outside at midday today: winter light is scarce, so catch it.', seasons: ['winter'] },
  { id: 'winter-stew', area: 'health', text: 'Slow-cook a venison or beef shin stew with root veg: low-AGE, collagen-rich, cosy.', seasons: ['winter', 'autumn'] },
  { id: 'christmas-gift', area: 'social', text: 'Sort one thoughtful Christmas gift early.', seasons: ['winter'] },
  { id: 'oysters', area: 'health', text: 'Have oysters this week: in season now, and a zinc powerhouse.', seasons: ['winter', 'autumn'] },
  { id: 'autumn-forage', area: 'fun', text: 'Walk somewhere with autumn colour and pick blackberries if there are any left.', seasons: ['autumn'] },
  { id: 'clocks', area: 'health', text: 'Lock in your wake time: darker mornings make it slip.', seasons: ['autumn', 'winter'] },
  { id: 'spring-run', area: 'fun', text: 'Long easy run somewhere green: spring air, first light evenings.', seasons: ['spring'] },
  { id: 'asparagus', area: 'health', text: 'British asparagus is in season: roast it with olive oil and lemon (go easy if it bloats you).', seasons: ['spring'] },
  { id: 'summer-swim', area: 'fun', text: 'Open-water swim or lido session.', seasons: ['summer'] },
  { id: 'berries', area: 'health', text: 'Pick-your-own strawberries or raspberries: peak polyphenols.', seasons: ['summer'] },
  { id: 'sun-d', area: 'health', text: '15 minutes of midday sun on your arms (SPF on your face) for vitamin D.', seasons: ['summer', 'spring'] },
];

export function ideasFor(date: string, season: Season, shuffle = 0): Idea[] {
  const pool = IDEAS.filter((i) => !i.seasons || i.seasons.includes(season));
  let h = 17 + shuffle * 7919;
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const out: Idea[] = [];
  const usedAreas = new Set<string>();
  for (let k = 0; out.length < 3 && k < pool.length * 3; k++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const idea = pool[h % pool.length];
    if (out.includes(idea) || usedAreas.has(idea.area)) continue;
    out.push(idea);
    usedAreas.add(idea.area);
  }
  return out;
}
