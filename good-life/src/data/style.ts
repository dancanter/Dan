import type { GarmentCategory, Season } from '@/store/types';

export interface ColourDef {
  id: string;
  label: string;
  hex: string;
  role: 'neutral' | 'accent' | 'leather';
}

export const COLOURS: ColourDef[] = [
  { id: 'navy', label: 'Navy', hex: '#1f2a44', role: 'neutral' },
  { id: 'white', label: 'White', hex: '#f8f7f3', role: 'neutral' },
  { id: 'ecru', label: 'Ecru / cream', hex: '#ece3cf', role: 'neutral' },
  { id: 'stone', label: 'Stone', hex: '#cbbfa6', role: 'neutral' },
  { id: 'sand', label: 'Sand / beige', hex: '#d8c4a0', role: 'neutral' },
  { id: 'camel', label: 'Camel', hex: '#b88a55', role: 'neutral' },
  { id: 'grey', label: 'Mid grey', hex: '#8d8f93', role: 'neutral' },
  { id: 'charcoal', label: 'Charcoal', hex: '#3b3d42', role: 'neutral' },
  { id: 'olive', label: 'Olive', hex: '#6b6a45', role: 'neutral' },
  { id: 'brown', label: 'Chocolate brown', hex: '#4a3326', role: 'neutral' },
  { id: 'black', label: 'Black', hex: '#151515', role: 'neutral' },
  { id: 'light-blue', label: 'Light blue', hex: '#a9c4dd', role: 'accent' },
  { id: 'sage', label: 'Sage', hex: '#a3ad8f', role: 'accent' },
  { id: 'rust', label: 'Rust / terracotta', hex: '#a85a3a', role: 'accent' },
  { id: 'burgundy', label: 'Burgundy', hex: '#5e2430', role: 'accent' },
  { id: 'tan', label: 'Tan (leather)', hex: '#a56c3f', role: 'leather' },
  { id: 'dark-brown', label: 'Dark brown (leather)', hex: '#3c2619', role: 'leather' },
  { id: 'black-leather', label: 'Black (leather)', hex: '#111111', role: 'leather' },
];

export const COLOUR_BY_ID = Object.fromEntries(COLOURS.map((c) => [c.id, c])) as Record<string, ColourDef>;

/** Pairings that reliably work in the quiet, Riviera register. */
export const PALETTES: { name: string; colours: string[]; note: string }[] = [
  { name: 'Riviera classic', colours: ['navy', 'white', 'stone', 'tan'], note: 'The default: navy top, white or stone trousers, tan suede.' },
  { name: 'Sun-bleached', colours: ['ecru', 'sand', 'light-blue', 'tan'], note: 'Low contrast, very summer; looks best with a tan and in linen.' },
  { name: 'Delon autumn', colours: ['charcoal', 'camel', 'grey', 'dark-brown'], note: 'Coat-and-knit weather. Tonal, serious, quietly expensive.' },
  { name: 'Countryside', colours: ['olive', 'ecru', 'brown', 'dark-brown'], note: 'Weekend and travel — suede, cord, cable knits.' },
  { name: 'Evening', colours: ['navy', 'charcoal', 'white', 'black-leather'], note: 'Dark tailoring, white shirt, one restrained accessory.' },
];

export interface CapsulePiece {
  id: string;
  name: string;
  category: GarmentCategory;
  colour: string;
  fabric: string;
  seasons: Season[];
  formality: number;
  why: string;
  brands: string[];
  lookFor: string;
}

const ALL: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const WARM: Season[] = ['spring', 'summer'];
const COOL: Season[] = ['autumn', 'winter'];

export const CAPSULE: CapsulePiece[] = [
  { id: 'white-linen-shirt', name: 'White linen shirt', category: 'shirt', colour: 'white', fabric: 'linen', seasons: WARM, formality: 3, why: 'The single most Riviera garment. Worn open-necked, sleeves rolled twice.', brands: ['Luca Faloni', 'Ralph Lauren', 'Drake’s', 'Uniqlo (budget)'], lookFor: '100% linen, mother-of-pearl buttons, a collar that holds its shape open.' },
  { id: 'blue-oxford', name: 'Light-blue oxford shirt', category: 'shirt', colour: 'light-blue', fabric: 'cotton oxford', seasons: ALL, formality: 3, why: 'Works with everything from shorts to a navy blazer.', brands: ['Drake’s', 'Ralph Lauren', 'Brooks Brothers'], lookFor: 'Button-down collar with a soft roll; dense, slightly heavy cloth.' },
  { id: 'navy-knit-polo', name: 'Navy knitted polo', category: 'polo', colour: 'navy', fabric: 'fine cotton or merino knit', seasons: ['spring', 'summer', 'autumn'], formality: 3, why: 'Smarter than a polo, easier than a shirt. Shows off the shoulders without trying.', brands: ['John Smedley', 'Sunspel', 'Luca Faloni'], lookFor: 'Fine gauge (high stitch count), no logo, a collar that sits flat.' },
  { id: 'white-tee', name: 'Heavyweight white T-shirt', category: 'tshirt', colour: 'white', fabric: 'cotton jersey', seasons: ALL, formality: 1, why: 'The base layer of everything casual.', brands: ['Sunspel', 'Uniqlo U', 'Asket'], lookFor: 'Dense jersey that does not go see-through; neckband that will not stretch.' },
  { id: 'grey-crew', name: 'Grey merino crewneck', category: 'knitwear', colour: 'grey', fabric: 'extra-fine merino', seasons: ['spring', 'autumn', 'winter'], formality: 3, why: 'Layers over a collared shirt or under a coat.', brands: ['John Smedley', 'Loro Piana', 'Luca Faloni'], lookFor: 'Extra-fine merino (≈19 micron or less) or cashmere, tight even knit.' },
  { id: 'camel-knit', name: 'Camel or oatmeal knit', category: 'knitwear', colour: 'camel', fabric: 'cashmere or lambswool', seasons: COOL, formality: 3, why: 'The quiet-luxury colour. Warm against navy, charcoal and denim.', brands: ['Loro Piana', 'Luca Faloni', 'Ralph Lauren'], lookFor: 'Two-ply cashmere; check under the arms for pilling on second-hand pieces.' },
  { id: 'stone-trousers', name: 'Stone pleated trousers', category: 'trousers', colour: 'stone', fabric: 'cotton twill or linen blend', seasons: ['spring', 'summer', 'autumn'], formality: 3, why: 'Lighter trousers with a darker top is the Riviera formula.', brands: ['Incotex', 'Ralph Lauren', 'Drake’s'], lookFor: 'Mid-to-high rise, gentle taper, side adjusters rather than belt loops if you can.' },
  { id: 'navy-trousers', name: 'Navy or charcoal tailored trousers', category: 'trousers', colour: 'navy', fabric: 'high-twist wool', seasons: ALL, formality: 4, why: 'Evening and smart-casual workhorse.', brands: ['Incotex', 'Boglioli'], lookFor: 'Tropical or high-twist wool for year-round use; no break or a slight break.' },
  { id: 'white-trousers', name: 'White or ecru trousers', category: 'trousers', colour: 'ecru', fabric: 'linen or cotton drill', seasons: WARM, formality: 3, why: 'With a navy polo and suede loafers, this is the whole look.', brands: ['Incotex', 'Ralph Lauren', 'Orlebar Brown'], lookFor: 'Opaque enough to wear without show-through; straight or gently tapered.' },
  { id: 'dark-denim', name: 'Dark, plain denim', category: 'trousers', colour: 'navy', fabric: 'raw or rinsed denim', seasons: ALL, formality: 2, why: 'Casual weekends, autumn and travel.', brands: ['A.P.C.', 'Levi’s 501/505'], lookFor: 'No distressing; straight or slim-straight.' },
  { id: 'tailored-shorts', name: 'Tailored shorts', category: 'shorts', colour: 'navy', fabric: 'cotton or linen', seasons: ['summer'], formality: 2, why: 'Shorter inseams (~5–7 in) flatter a 5 ft 8 in, athletic frame.', brands: ['Orlebar Brown', 'Ralph Lauren', 'Sunspel'], lookFor: 'Flat front, side adjusters, hem above the knee.' },
  { id: 'swim-shorts', name: 'Mid-length swim shorts', category: 'swim', colour: 'navy', fabric: 'quick-dry', seasons: ['summer'], formality: 1, why: 'Tailored swim shorts work from beach to lunch.', brands: ['Orlebar Brown', 'Frescobol Carioca'], lookFor: 'Side adjusters, short inseam, solid colour.' },
  { id: 'navy-blazer', name: 'Unstructured navy jacket', category: 'jacket', colour: 'navy', fabric: 'hopsack, linen or wool', seasons: ALL, formality: 4, why: 'Soft shoulders and no lining: smart without stiffness.', brands: ['Boglioli', 'Drake’s', 'Ralph Lauren'], lookFor: 'Half-canvas or unstructured (not fused — the chest should not feel like cardboard); sleeves showing ~1 cm of shirt cuff.' },
  { id: 'overcoat', name: 'Camel or navy overcoat', category: 'outerwear', colour: 'camel', fabric: 'wool or wool-cashmere', seasons: ['winter'], formality: 4, why: 'Delon’s winter uniform. Covers everything underneath.', brands: ['Ralph Lauren', 'Boglioli', 'Loro Piana'], lookFor: 'Ends just above or at the knee; shoulders that fit — they cannot be altered.' },
  { id: 'trench', name: 'Stone trench or mac', category: 'outerwear', colour: 'stone', fabric: 'cotton gabardine', seasons: ['spring', 'autumn'], formality: 3, why: 'The Le Samouraï coat; the UK’s most useful one.', brands: ['Burberry', 'Grenfell', 'Private White V.C.'], lookFor: 'Proper gabardine; a length that suits your height (above the knee).' },
  { id: 'suede-loafers', name: 'Brown suede loafers', category: 'shoes', colour: 'dark-brown', fabric: 'suede', seasons: ['spring', 'summer', 'autumn'], formality: 3, why: 'The Riviera shoe: no socks in summer, with everything.', brands: ['Tod’s', 'Crockett & Jones', 'Ralph Lauren'], lookFor: 'Good suede nap, re-soleable construction if possible (Tod’s Gommino pebble soles wear quickly).' },
  { id: 'white-trainers', name: 'Minimal white leather trainers', category: 'shoes', colour: 'white', fabric: 'calf leather', seasons: ALL, formality: 2, why: 'The only trainer needed outside running.', brands: ['Common Projects', 'Koio', 'Veja (budget)'], lookFor: 'Smooth leather, stitched (not just glued) sole, no visible branding.' },
  { id: 'chelsea', name: 'Dark brown suede Chelsea boots', category: 'shoes', colour: 'dark-brown', fabric: 'suede', seasons: COOL, formality: 3, why: 'Autumn and winter replacement for loafers.', brands: ['Crockett & Jones', 'R.M. Williams', 'Church’s'], lookFor: 'Goodyear-welted (re-soleable); a slim last.' },
  { id: 'tortoise-sunglasses', name: 'Tortoiseshell sunglasses', category: 'sunglasses', colour: 'brown', fabric: 'acetate', seasons: ['spring', 'summer'], formality: 3, why: 'Softer than black frames; flatters most faces.', brands: ['Persol', 'Oliver Peoples', 'Moscot'], lookFor: 'Acetate frames, glass or quality lenses; check the hinge arrows on Persol.' },
  { id: 'watch', name: 'Understated steel watch', category: 'watch', colour: 'grey', fabric: 'steel', seasons: ALL, formality: 4, why: 'One watch, small case (36–39 mm suits your wrist), on leather in summer and steel in winter.', brands: ['Longines', 'Tudor', 'Seiko (budget)'], lookFor: 'A modest case size, no oversized bezels or logos.' },
  { id: 'belt', name: 'Brown leather or suede belt', category: 'belt', colour: 'dark-brown', fabric: 'leather', seasons: ALL, formality: 3, why: 'Match it to your shoes.', brands: ['Anderson’s', 'Ralph Lauren'], lookFor: 'Plain buckle, 3–3.5 cm width.' },
];

export const FABRICS: { name: string; when: string; note: string }[] = [
  { name: 'Linen', when: 'Late spring, summer, holidays', note: 'Breathes best of all and creases honestly — the creases are part of the look. European flax is the benchmark.' },
  { name: 'Cotton oxford & poplin', when: 'All year', note: 'Oxford is textured and casual; poplin is smooth and smarter.' },
  { name: 'Seersucker', when: 'High summer', note: 'Puckered weave lifts off the skin. Keep it to one piece per outfit.' },
  { name: 'Extra-fine merino', when: 'Three seasons', note: 'Thin, warm, does not smell after a day. Look for ≈19 micron or below.' },
  { name: 'Cashmere', when: 'Autumn–winter', note: 'Ply and fibre length matter more than the word on the label. Cheap cashmere pills fast.' },
  { name: 'High-twist wool (fresco, tropical)', when: 'All year, travel', note: 'Tailoring that breathes and recovers from creasing.' },
  { name: 'Flannel', when: 'Winter', note: 'Soft, matte wool trousers — the winter counterpart to stone cotton.' },
  { name: 'Suede', when: 'Spring–autumn', note: 'More casual and warmer-looking than polished leather; spray-protect before UK rain.' },
];

export const FIT_RULES: string[] = [
  'At 5 ft 8 in with an athletic frame, the aim is clean lines and proportion — not extra fabric.',
  'Shoulders first: a jacket or coat that fits the shoulder can be altered everywhere else; one that does not, cannot.',
  'Jacket length should just cover the seat; slightly shorter jackets lengthen the leg line.',
  'Trousers with a mid-to-high rise and a gentle taper; no break or a slight break at the shoe.',
  'Knitwear and polos should skim the shoulders and chest, not cling. The muscle shows through the fit, not through tightness.',
  'Shorts with a 5–7 in inseam, hem above the knee.',
  'Tonal outfits (one colour family, varied textures) look expensive and make you look taller.',
  'One point of interest per outfit at most — a texture, a watch, or a colour. Not all three.',
];

export const LOOKS: { name: string; occasion: string; pieces: string[]; note: string }[] = [
  { name: 'Riviera lunch', occasion: 'Holiday or summer weekend', pieces: ['White linen shirt, open collar', 'Stone pleated trousers', 'Brown suede loafers, no socks', 'Tortoiseshell sunglasses', 'Steel watch on leather'], note: 'Inspired by 1960s Côte d’Azur dressing.' },
  { name: 'The Samouraï', occasion: 'Autumn evening', pieces: ['Stone trench, belted', 'Grey merino crewneck', 'Charcoal trousers', 'Dark brown suede Chelsea boots'], note: 'A near-monochrome outfit in the spirit of Melville’s Paris.' },
  { name: 'Quiet campus', occasion: 'Study day, library, tutorial', pieces: ['Navy knitted polo or blue oxford', 'Dark denim or stone chinos', 'White leather trainers', 'Camel knit over the shoulders if cool'], note: 'Smart enough for anything; comfortable for hours at a desk.' },
  { name: 'Evening, understated', occasion: 'Dinner or a date', pieces: ['Unstructured navy jacket', 'White poplin shirt, no tie', 'Charcoal or navy trousers', 'Dark brown suede loafers or Chelsea boots'], note: 'Bond-era restraint without the dinner suit.' },
  { name: 'Sun-bleached weekend', occasion: 'Hot day in the UK', pieces: ['Ecru linen shirt', 'Navy tailored shorts', 'Suede loafers or white trainers', 'Sunglasses, SPF on the face'], note: 'Low-contrast, relaxed, cool.' },
];

export const GROOMING: { title: string; points: string[]; evidence?: string }[] = [
  {
    title: 'Shaving with reactive skin',
    points: [
      'Shave after a warm shower, when hair is softest; use a gel or cream rather than foam.',
      'With the grain on the first pass; only go across if needed, never against on breakout-prone areas.',
      'A single sharp blade (or a safety razor) pulls less than multi-blade cartridges for many people prone to ingrown hairs — try both and keep the one that leaves fewer bumps.',
      'Change blades often. Avoid alcohol-heavy aftershave; a plain moisturiser is enough.',
      'Persistent bumps along the beard line can be pseudofolliculitis barbae; a GP or pharmacist can advise, and a short stubble trimmer is a legitimate solution.',
    ],
  },
  {
    title: 'Skincare that has evidence',
    points: [
      'Daily broad-spectrum SPF 50 on face, ears and neck — the best-evidenced anti-ageing step (RCT: Hughes et al., 2013).',
      'A retinoid at night is the best-evidenced active for fine lines and texture; start 2×/week and build slowly.',
      'Niacinamide is well tolerated and helps barrier function and redness; reasonable, moderate evidence.',
      'Squalane is a gentle, non-irritating moisturiser.',
      'Beef tallow has little clinical evidence either way and can clog pores in acne-prone skin — fine if it suits you, not something to rely on.',
      'Gua sha may reduce morning puffiness temporarily (fluid movement); there is no evidence it changes facial structure.',
    ],
    evidence: 'hughes2013',
  },
  {
    title: 'Puffiness and dark circles',
    points: [
      'The big drivers: short or irregular sleep, alcohol, salty evening meals, allergies, and — for under-eye shadows — genetics and thin skin.',
      'Very high training volume can raise fluid retention for a day or two; it settles with recovery.',
      'A cold compress in the morning helps temporarily.',
      'Do not cut water or salt drastically to look leaner — that is the opposite of what a runner needs.',
    ],
  },
  {
    title: 'Hair and presentation',
    points: ['A regular cut every 4–5 weeks matters more than any product.', 'A clean neckline and trimmed eyebrows are the "invisible" grooming that makes outfits look intentional.'],
  },
];
