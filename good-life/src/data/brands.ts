export interface Brand {
  name: string;
  tier: 'investment' | 'quality' | 'value';
  knownFor: string;
  lookFor: string;
  /** How often counterfeits turn up second-hand. */
  fakeRisk: 'high' | 'medium' | 'low';
  /** Resale demand: high-demand brands hold value; common brands are plentiful and cheap. */
  demand: 'high' | 'medium' | 'plentiful';
}

export const BRANDS: Brand[] = [
  { name: 'Loro Piana', tier: 'investment', knownFor: 'Cashmere, baby cashmere, summer-weight knits, suede loafers.', lookFor: 'Composition label stitched in, consistent font, high stitch density. Price that seems too good usually is.', fakeRisk: 'high', demand: 'high' },
  { name: 'Brunello Cucinelli', tier: 'investment', knownFor: 'Cashmere, tailoring, tonal knitwear.', lookFor: 'Detailed care labels, Italian-made, quality horn or corozo buttons.', fakeRisk: 'high', demand: 'high' },
  { name: 'Luca Faloni', tier: 'quality', knownFor: 'Linen shirts, cashmere, silk-cotton knits.', lookFor: 'Made-in-Italy labelling; linen weight and buttons. Rarely faked.', fakeRisk: 'low', demand: 'medium' },
  { name: 'John Smedley', tier: 'quality', knownFor: 'Fine-gauge merino and Sea Island cotton knitwear and polos.', lookFor: 'Made in England label; check elbows and cuffs for thinning.', fakeRisk: 'low', demand: 'medium' },
  { name: 'Sunspel', tier: 'quality', knownFor: 'T-shirts, Riviera polos, underwear.', lookFor: 'Long-staple cotton; collar shape on polos.', fakeRisk: 'low', demand: 'medium' },
  { name: 'Drake’s', tier: 'quality', knownFor: 'Shirts, ties, knitwear, chore jackets.', lookFor: 'Hand-rolled tie edges; shirt collars and buttons.', fakeRisk: 'low', demand: 'high' },
  { name: 'Incotex', tier: 'quality', knownFor: 'Tailored trousers and chinos (Slowear group).', lookFor: 'Model name and fit inside the waistband; fabric weight.', fakeRisk: 'low', demand: 'medium' },
  { name: 'Boglioli', tier: 'quality', knownFor: 'Unstructured, garment-dyed jackets (the K-Jacket).', lookFor: 'Unlined, soft-shouldered construction; check the shoulder fit in photos.', fakeRisk: 'low', demand: 'medium' },
  { name: 'Orlebar Brown', tier: 'quality', knownFor: 'Tailored swim shorts (Bulldog), resortwear.', lookFor: 'Side adjusters and the brand’s button fastening.', fakeRisk: 'medium', demand: 'high' },
  { name: 'Ralph Lauren (Polo)', tier: 'value', knownFor: 'Oxfords, cable knits, chinos, linen.', lookFor: 'Huge supply — be patient and pay little. Purple Label is a different, far more expensive line.', fakeRisk: 'high', demand: 'plentiful' },
  { name: 'Ralph Lauren Purple Label', tier: 'investment', knownFor: 'Italian-made tailoring and knitwear.', lookFor: 'Purple label inside, Italian manufacture.', fakeRisk: 'medium', demand: 'high' },
  { name: 'Tod’s', tier: 'quality', knownFor: 'Gommino driving shoes, suede loafers.', lookFor: 'Pebble sole condition — the pebbles wear and are hard to repair.', fakeRisk: 'medium', demand: 'high' },
  { name: 'Common Projects', tier: 'quality', knownFor: 'Achilles minimal leather trainers.', lookFor: 'Gold serial-number stamp on the heel; stitched cupsole.', fakeRisk: 'high', demand: 'high' },
  { name: 'Crockett & Jones', tier: 'quality', knownFor: 'Goodyear-welted English shoes and boots.', lookFor: 'Re-soleable — worn soles are fine if the uppers are good.', fakeRisk: 'low', demand: 'medium' },
  { name: 'Church’s', tier: 'quality', knownFor: 'English shoes and boots.', lookFor: 'Welt condition and upper creasing.', fakeRisk: 'low', demand: 'medium' },
  { name: 'Persol', tier: 'quality', knownFor: '714 and 649 sunglasses, Meflecto arms.', lookFor: 'Silver "arrow" hinges, model and serial on the inner arm.', fakeRisk: 'high', demand: 'high' },
  { name: 'Oliver Peoples', tier: 'quality', knownFor: 'Understated acetate frames.', lookFor: 'Model engraving inside the temples.', fakeRisk: 'medium', demand: 'medium' },
  { name: 'Uniqlo', tier: 'value', knownFor: 'Linen shirts, cashmere crews, U-line T-shirts.', lookFor: 'Composition label — Uniqlo cashmere and linen are excellent value.', fakeRisk: 'low', demand: 'plentiful' },
  { name: 'Hackett', tier: 'value', knownFor: 'British casualwear, polos, chinos.', lookFor: 'Avoid logo-heavy pieces; the plain ones are good value.', fakeRisk: 'medium', demand: 'plentiful' },
  { name: 'Aspesi', tier: 'quality', knownFor: 'Overshirts, light jackets, minimalist Italian casualwear.', lookFor: 'Fabric and construction rather than labels.', fakeRisk: 'low', demand: 'medium' },
];

export const CONDITIONS = ['New with tags', 'New without tags', 'Very good', 'Good', 'Satisfactory'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const QUALITY_SIGNALS: string[] = [
  'Composition: natural fibres (linen, cotton, wool, cashmere, silk) over polyester blends for anything that touches the skin.',
  'Construction: dense, even stitching; matched patterns at seams; generous seam allowances.',
  'Buttons: mother-of-pearl, horn or corozo rather than thin plastic.',
  'Jackets: half-canvassed or unstructured, not fused (a fused chest feels stiff and can bubble).',
  'Shoes: Goodyear-welted or Blake-stitched soles can be re-soled — a worn sole on a good upper is a bargain, not a flaw.',
  'Knitwear: check under the arms and at the elbows in photos; ask for close-ups of pilling.',
  'Ask for photos of the care and composition labels on any expensive item — fakes often fail here.',
];
