import { BRANDS, type Condition } from '@/data/brands';
import { CAPSULE, COLOUR_BY_ID } from '@/data/style';
import type { AppData, GarmentCategory, Season, WardrobeItem } from '@/store/types';

export type Occasion = 'everyday' | 'campus' | 'smart-casual' | 'evening' | 'holiday' | 'date';

export const OCCASION_LABEL: Record<Occasion, string> = {
  everyday: 'Everyday',
  campus: 'Study / campus',
  'smart-casual': 'Smart-casual',
  evening: 'Evening',
  holiday: 'Holiday',
  date: 'Date',
};

const FORMALITY: Record<Occasion, [number, number]> = {
  everyday: [1, 3],
  campus: [1, 3],
  'smart-casual': [2, 4],
  evening: [3, 5],
  holiday: [1, 3],
  date: [3, 4],
};

export function seasonFor(date = new Date()): Season {
  const m = date.getMonth();
  return m <= 1 || m === 11 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'autumn';
}

export interface Outfit {
  pieces: { slot: string; item: WardrobeItem | null; suggestion?: string }[];
  score: number;
  notes: string[];
}

const TOPS: GarmentCategory[] = ['shirt', 'polo', 'tshirt', 'knitwear'];
const BOTTOMS: GarmentCategory[] = ['trousers', 'shorts'];

function colourRole(id: string) {
  return COLOUR_BY_ID[id]?.role ?? 'neutral';
}

const LEATHER_FAMILY: Record<string, 'brown' | 'black' | 'other'> = {
  tan: 'brown', 'dark-brown': 'brown', brown: 'brown', camel: 'brown', 'black-leather': 'black', black: 'black',
};

/**
 * A small rules engine for the quiet, Riviera register: light bottoms with a
 * darker top, at most one accent colour, leathers that match, formality that
 * suits the occasion, and fabrics that suit the temperature.
 */
export function generateOutfits(d: AppData, occasion: Occasion, tempC: number, rain: boolean, season: Season = seasonFor()): Outfit[] {
  const owned = d.wardrobe.filter((w) => w.status === 'owned');
  const fits = (w: WardrobeItem) => w.seasons.includes(season) || w.seasons.length === 0;
  const [fLo, fHi] = FORMALITY[occasion];
  const okFormality = (w: WardrobeItem) => w.formality >= fLo - 1 && w.formality <= fHi + 1;
  const tops = owned.filter((w) => TOPS.includes(w.category) && fits(w) && okFormality(w));
  const bottoms = owned.filter((w) => BOTTOMS.includes(w.category) && fits(w) && okFormality(w)).filter((w) => w.category !== 'shorts' || (tempC >= 20 && !['evening', 'date', 'smart-casual'].includes(occasion)));
  const shoes = owned.filter((w) => w.category === 'shoes' && okFormality(w)).filter((w) => !(rain && /suede/i.test(w.fabric ?? '')));
  const layers = owned.filter((w) => ['jacket', 'outerwear', 'knitwear'].includes(w.category) && fits(w));
  const needsLayer = tempC < 16 || occasion === 'evening';

  const combos: Outfit[] = [];
  const tryTops = tops.length ? tops : [null];
  const tryBottoms = bottoms.length ? bottoms : [null];
  const tryShoes = shoes.length ? shoes : [null];
  for (const t of tryTops) for (const b of tryBottoms) for (const s of tryShoes) {
    const notes: string[] = [];
    let score = 0;
    const colours = [t?.colour, b?.colour].filter(Boolean) as string[];
    const accents = colours.filter((c) => colourRole(c) === 'accent').length;
    if (accents > 1) score -= 3;
    if (t && b && t.colour === b.colour && t.category !== 'knitwear') score -= 1;
    const lightBottom = b && ['stone', 'ecru', 'white', 'sand'].includes(b.colour);
    const darkTop = t && ['navy', 'charcoal', 'brown', 'olive', 'black'].includes(t.colour);
    if (lightBottom && darkTop) { score += 2; notes.push('Darker top over lighter trousers — the Riviera formula.'); }
    if (t && /linen/i.test(t.fabric ?? '') && tempC >= 20) { score += 1.5; notes.push('Linen for the warmth.'); }
    if (t && t.category === 'knitwear' && tempC >= 22) score -= 2;
    if (b && /wool|flannel/i.test(b.fabric ?? '') && tempC >= 24) score -= 1.5;
    if (s && b) {
      const formalGap = Math.abs(s.formality - b.formality);
      score -= formalGap * 0.5;
    }
    const mid = (fLo + fHi) / 2;
    for (const p of [t, b, s]) if (p) score -= Math.abs(p.formality - mid) * 0.4;
    // Favour things not worn much recently, gently.
    for (const p of [t, b]) if (p?.wears) score -= Math.min(1, p.wears / 50);

    let layer: WardrobeItem | null = null;
    if (needsLayer) {
      const sameLeather = layers.filter((l) => l.id !== t?.id).sort((a, z) => Math.abs(a.formality - mid) - Math.abs(z.formality - mid));
      layer = sameLeather[0] ?? null;
      if (layer) score += 0.5;
    }
    const pieces: Outfit['pieces'] = [
      { slot: 'Top', item: t, suggestion: t ? undefined : 'A navy knitted polo or white linen shirt' },
      { slot: 'Trousers', item: b, suggestion: b ? undefined : 'Stone pleated trousers' },
      { slot: 'Shoes', item: s, suggestion: s ? undefined : rain ? 'Leather (not suede) shoes or white trainers for the rain' : 'Brown suede loafers' },
    ];
    if (needsLayer) pieces.splice(1, 0, { slot: 'Layer', item: layer, suggestion: layer ? undefined : tempC < 10 ? 'A camel or navy overcoat' : 'A grey merino crewneck or unstructured jacket' });
    const belt = owned.find((w) => w.category === 'belt' && (!s || LEATHER_FAMILY[w.colour] === LEATHER_FAMILY[s.colour]));
    if (b?.category === 'trousers' && belt) pieces.push({ slot: 'Belt', item: belt });
    if (tempC >= 15 && !rain) {
      const sg = owned.find((w) => w.category === 'sunglasses');
      if (sg) pieces.push({ slot: 'Sunglasses', item: sg });
    }
    const watch = owned.find((w) => w.category === 'watch');
    if (watch) pieces.push({ slot: 'Watch', item: watch });
    if (rain) notes.push('Rain: leave suede at home.');
    combos.push({ pieces, score, notes });
  }
  const seen = new Set<string>();
  return combos
    .sort((a, b) => b.score - a.score)
    .filter((o) => {
      const key = o.pieces.slice(0, 2).map((p) => p.item?.id ?? p.suggestion).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

export function wardrobeGaps(d: AppData): typeof CAPSULE {
  const owned = d.wardrobe.filter((w) => w.status === 'owned');
  return CAPSULE.filter((c) => !owned.some((w) => w.category === c.category && w.colour === c.colour));
}

export function costPerWear(item: WardrobeItem): number | null {
  if (!item.costGBP || !item.wears) return null;
  return item.costGBP / item.wears;
}

// ─── Vinted ────────────────────────────────────────────────────────────────

export function vintedSearchUrl(q: { item: string; brand?: string; size?: string; maxPrice?: number }): string {
  const text = [q.brand, q.item, q.size].filter(Boolean).join(' ');
  const params = new URLSearchParams({ search_text: text, order: 'newest_first' });
  if (q.maxPrice) params.set('price_to', String(q.maxPrice));
  return `https://www.vinted.co.uk/catalog?${params.toString()}`;
}

const CONDITION_FRACTION: Record<Condition, [number, number]> = {
  'New with tags': [0.45, 0.65],
  'New without tags': [0.35, 0.55],
  'Very good': [0.25, 0.45],
  Good: [0.15, 0.3],
  Satisfactory: [0.08, 0.18],
};

export interface DealInput {
  brand: string;
  item: string;
  category: GarmentCategory;
  colour?: string;
  price: number;
  postage: number;
  condition: Condition;
  rrp?: number;
  composition?: string;
  fits: 'yes' | 'unsure' | 'no';
  authenticityChecked: boolean;
  expectedWearsPerYear?: number;
}

export interface DealVerdict {
  verdict: 'genuine-bargain' | 'fair' | 'overpriced' | 'pass' | 'unknown-price';
  headline: string;
  total: number;
  fee: number;
  fairRange: [number, number] | null;
  basis: string;
  points: string[];
  costPerWear: number | null;
}

export function evaluateDeal(d: AppData, x: DealInput): DealVerdict {
  const fee = Math.round((x.price * (d.settings.vintedFeePct / 100) + d.settings.vintedFeeFixed) * 100) / 100;
  const total = Math.round((x.price + fee + x.postage) * 100) / 100;
  const points: string[] = [];
  const brand = BRANDS.find((b) => b.name.toLowerCase() === x.brand.trim().toLowerCase());

  let fairRange: [number, number] | null = null;
  let basis = '';
  const obs = d.priceObservations.filter((o) => o.brand.toLowerCase() === x.brand.trim().toLowerCase() && o.item.toLowerCase().includes(x.item.trim().toLowerCase().split(' ').at(-1) ?? ''));
  if (x.rrp) {
    const [lo, hi] = CONDITION_FRACTION[x.condition];
    const adj = brand?.demand === 'high' ? 0.1 : brand?.demand === 'plentiful' ? -0.07 : 0;
    fairRange = [Math.max(1, x.rrp * Math.max(0.03, lo + adj)), x.rrp * Math.max(0.06, hi + adj)];
    basis = `RRP £${x.rrp} × typical second-hand fraction for "${x.condition}"${brand ? ` (${brand.demand} demand)` : ''}. A rule of thumb, not market data.`;
  }
  if (obs.length >= 3) {
    const sorted = obs.map((o) => o.price).sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    fairRange = fairRange ? [Math.min(fairRange[0], q1), Math.max(fairRange[1], q3)] : [q1, q3];
    basis = `${obs.length} prices you recorded for similar items${x.rrp ? ', combined with the RRP rule of thumb' : ''}.`;
  }

  if (x.fits === 'no') points.push('It does not fit. No price makes an ill-fitting garment a bargain — unless a tailor can fix it cheaply (waist and hem yes; shoulders no).');
  if (x.fits === 'unsure') points.push('Fit unknown: ask for flat measurements (pit-to-pit, length, shoulder) and compare with something you own.');
  if (x.composition && /polyester|acrylic|nylon|elastane/i.test(x.composition) && /knit|shirt|polo|trousers/i.test(x.category + x.item)) {
    const pct = Number(x.composition.match(/(\d+)\s*%\s*(polyester|acrylic|nylon)/i)?.[1] ?? 0);
    if (pct >= 20) points.push(`${pct}% synthetic: it will pill, hold odour and feel cheaper than the label suggests.`);
  }
  if (x.composition && /cashmere|merino|linen|wool|cotton|silk/i.test(x.composition)) points.push(`Good fibre (${x.composition}).`);
  if (brand?.fakeRisk === 'high' && !x.authenticityChecked) points.push(`${brand.name} is often counterfeited. ${brand.lookFor} Ask for label photos before buying.`);
  if (brand) points.push(`${brand.name}: ${brand.knownFor}`);
  const owned = d.wardrobe.filter((w) => w.status === 'owned');
  const duplicate = owned.find((w) => w.category === x.category && x.colour && w.colour === x.colour);
  if (duplicate) points.push(`You already own a similar piece (${duplicate.name}). Is this an upgrade or a duplicate?`);
  const gap = wardrobeGaps(d).find((g) => g.category === x.category && (!x.colour || g.colour === x.colour));
  if (gap) points.push(`Fills a capsule gap: ${gap.name}.`);

  const wears = (x.expectedWearsPerYear ?? 20) * 3;
  const cpw = Math.round((total / wears) * 100) / 100;

  let verdict: DealVerdict['verdict'];
  let headline: string;
  if (x.fits === 'no') {
    verdict = 'pass';
    headline = 'Pass — it does not fit.';
  } else if (!fairRange) {
    verdict = 'unknown-price';
    headline = 'Can’t judge the price yet — add the RRP or record a few comparable listings.';
  } else if (total <= fairRange[0]) {
    verdict = 'genuine-bargain';
    headline = `Genuine bargain: £${total} all-in against a fair range of £${Math.round(fairRange[0])}–${Math.round(fairRange[1])}.`;
  } else if (total <= fairRange[1]) {
    verdict = 'fair';
    headline = `Fair price: £${total} all-in, within £${Math.round(fairRange[0])}–${Math.round(fairRange[1])}.`;
  } else {
    verdict = 'overpriced';
    headline = `Overpriced: £${total} all-in, above a fair £${Math.round(fairRange[1])}. Offer, or wait — there is always another one.`;
  }
  return { verdict, headline, total, fee, fairRange, basis, points, costPerWear: cpw };
}
