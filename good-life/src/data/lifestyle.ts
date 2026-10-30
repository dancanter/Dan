export type LifeCategory = 'walk' | 'cafe' | 'cinema' | 'day-trip' | 'culture' | 'restaurant' | 'friends' | 'weekend' | 'outdoors';

export const LIFE_CATEGORY_LABEL: Record<LifeCategory, string> = {
  walk: 'Walks',
  cafe: 'Cafés',
  cinema: 'Cinema evenings',
  'day-trip': 'Day trips',
  culture: 'Culture',
  restaurant: 'Restaurants',
  friends: 'With friends',
  weekend: 'Slow weekends',
  outdoors: 'Outdoors & sun',
};

export interface LifeIdea {
  id: string;
  title: string;
  category: LifeCategory;
  cost: 0 | 1 | 2 | 3; // free, £, ££, £££
  weather: 'any' | 'dry' | 'sunny' | 'indoor';
  effort: 'low' | 'medium';
  social: boolean;
  detail: string;
  restDayFriendly: boolean;
}

// General UK ideas. Places near you go in "Your places", where they can be
// remembered and rated — the app does not pretend to know your local area.
export const LIFE_IDEAS: LifeIdea[] = [
  { id: 'golden-hour-walk', title: 'Golden-hour walk, no headphones', category: 'walk', cost: 0, weather: 'dry', effort: 'low', social: false, detail: 'An hour before sunset. Counts as recovery — low-intensity movement and daylight both help sleep later.', restDayFriendly: true },
  { id: 'coastal-or-ridge', title: 'A long walk with a view', category: 'walk', cost: 0, weather: 'dry', effort: 'medium', social: true, detail: 'A coastal path, ridge or river walk of 2–3 hours, ending somewhere for lunch.', restDayFriendly: true },
  { id: 'national-trust', title: 'House and gardens visit', category: 'culture', cost: 1, weather: 'dry', effort: 'low', social: true, detail: 'National Trust or English Heritage gardens — gardens at their best in late spring and early autumn.', restDayFriendly: true },
  { id: 'free-museum', title: 'An afternoon in a national museum or gallery', category: 'culture', cost: 0, weather: 'any', effort: 'low', social: false, detail: 'Many UK national museums and galleries are free. Pick one room and stay with it rather than seeing everything.', restDayFriendly: true },
  { id: 'gallery-late', title: 'Gallery late opening', category: 'culture', cost: 0, weather: 'indoor', effort: 'low', social: true, detail: 'Several galleries run evening openings — quieter, often with a bar or talk.', restDayFriendly: true },
  { id: 'rep-cinema', title: 'A classic film on a big screen', category: 'cinema', cost: 1, weather: 'any', effort: 'low', social: false, detail: 'Independent cinemas and BFI-programmed seasons regularly screen restored classics. Check what is on near you.', restDayFriendly: true },
  { id: 'film-night', title: 'Film night at home, done properly', category: 'cinema', cost: 0, weather: 'indoor', effort: 'low', social: true, detail: 'Pick from Culture, cook something good, phones away. Melville or a Connery Bond.', restDayFriendly: true },
  { id: 'cafe-terrace', title: 'A café terrace with a book', category: 'cafe', cost: 1, weather: 'sunny', effort: 'low', social: false, detail: 'An hour outside with a novel, not a laptop. Check gluten-free options before you go if you want to eat.', restDayFriendly: true },
  { id: 'sunday-papers', title: 'Sunday papers and a long breakfast', category: 'weekend', cost: 1, weather: 'any', effort: 'low', social: false, detail: 'A slow morning on purpose — eggs, coffee, and something to read that is not a module text.', restDayFriendly: true },
  { id: 'farmers-market', title: 'Farmers’ market and cook a Riviera lunch', category: 'weekend', cost: 1, weather: 'dry', effort: 'medium', social: true, detail: 'Buy fish, tomatoes, good olive oil; cook for friends. Naturally gluten-free and the best kind of nutrition.', restDayFriendly: true },
  { id: 'train-day-trip', title: 'A day trip by train to a historic city', category: 'day-trip', cost: 2, weather: 'any', effort: 'medium', social: true, detail: 'Book advance tickets for value. Walk the old town, one museum, a long lunch.', restDayFriendly: true },
  { id: 'lido', title: 'An outdoor swim', category: 'outdoors', cost: 1, weather: 'sunny', effort: 'medium', social: true, detail: 'A lido or a supervised open-water spot. Gentle on running legs; cold water needs respect — never swim alone in open water.', restDayFriendly: true },
  { id: 'picnic', title: 'Picnic in the park with friends', category: 'friends', cost: 1, weather: 'sunny', effort: 'low', social: true, detail: 'You bring the food so it is safely gluten-free: tortilla, cold potatoes, cheese, fruit, dark chocolate.', restDayFriendly: true },
  { id: 'tennis-padel', title: 'Tennis or padel', category: 'friends', cost: 1, weather: 'dry', effort: 'medium', social: true, detail: 'Social, fun and sharp — but it is training load: keep it on a non-quality day.', restDayFriendly: false },
  { id: 'jazz-bar', title: 'Live music — a jazz bar or small venue', category: 'friends', cost: 2, weather: 'indoor', effort: 'low', social: true, detail: 'Somewhere you can hear it properly. Home by a reasonable hour if a quality session follows.', restDayFriendly: true },
  { id: 'theatre-broadcast', title: 'Theatre broadcast at a cinema', category: 'culture', cost: 1, weather: 'indoor', effort: 'low', social: true, detail: 'Live theatre broadcasts to cinemas give West End-level productions at cinema prices.', restDayFriendly: true },
  { id: 'gf-restaurant', title: 'Try a properly gluten-free restaurant', category: 'restaurant', cost: 2, weather: 'any', effort: 'low', social: true, detail: 'Coeliac UK accredits venues for gluten-free safety — a good way to eat out without the cross-contamination gamble.', restDayFriendly: true },
  { id: 'botanical', title: 'Botanical garden or glasshouse', category: 'outdoors', cost: 1, weather: 'any', effort: 'low', social: false, detail: 'Warm, green and calm in any season.', restDayFriendly: true },
  { id: 'bookshop', title: 'Bookshop browse, buy one novel', category: 'weekend', cost: 1, weather: 'any', effort: 'low', social: false, detail: 'Fiction counts. Reading for pleasure is not a productivity failure.', restDayFriendly: true },
  { id: 'sunrise-run-coffee', title: 'Easy sunrise run, then coffee somewhere nice', category: 'outdoors', cost: 1, weather: 'dry', effort: 'medium', social: false, detail: 'Turn an easy run into an outing. Keep it easy.', restDayFriendly: false },
];
