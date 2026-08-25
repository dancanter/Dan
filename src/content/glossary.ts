/**
 * Plain-English definitions for the clinical terms that cannot be simplified
 * away without losing the word a reader needs.
 *
 * This is the other half of the readability work. The audit caps the score
 * penalty for these terms because "pre-eclampsia" has no shorter accurate
 * synonym — but capping a penalty does nothing for the reader who does not
 * know the word. So every term on that list gets a one-line definition, and
 * the word becomes tappable wherever it appears in body copy.
 *
 * Rules for writing these:
 *  - One or two short sentences. This is a tooltip, not an article.
 *  - Say what it *is* before what it does.
 *  - No second clinical term inside a definition, or it defeats the point.
 */

export interface GlossaryEntry {
  /** Canonical term, lowercase. Matching is case-insensitive. */
  term: string;
  /** Other spellings and inflections that should link to the same entry. */
  aliases?: string[];
  definition: string;
}

export const glossary: GlossaryEntry[] = [
  {
    term: 'pre-eclampsia',
    aliases: ['preeclampsia', 'eclampsia'],
    definition:
      'A condition that can develop from about 20 weeks. It pushes your blood pressure up and can affect your kidneys and liver. It is treatable, but it has to be caught early.',
  },
  {
    term: 'gestational diabetes',
    definition:
      'Diabetes that starts in pregnancy and usually goes away after the birth. It means your body cannot keep your blood sugar steady on its own for a while.',
  },
  {
    term: 'intrahepatic cholestasis of pregnancy',
    aliases: ['cholestasis', 'icp'],
    definition:
      'A liver condition in pregnancy. Bile does not flow out of the liver properly, which makes you itch — often on your hands and feet, and worse at night. A blood test finds it.',
  },
  {
    term: 'antenatal',
    definition: 'Before the birth. Antenatal care is the care you get while you are pregnant.',
  },
  {
    term: 'postnatal',
    aliases: ['postpartum'],
    definition: 'After the birth. Postnatal care is the care you and your baby get afterwards.',
  },
  {
    term: 'perinatal',
    definition:
      'The whole stretch around having a baby — pregnancy, the birth, and the first year after.',
  },
  {
    term: 'caesarean',
    aliases: ['c-section', 'caesarean section'],
    definition:
      'An operation to deliver your baby through a cut in your tummy and womb, rather than through the vagina.',
  },
  {
    term: 'epidural',
    definition:
      'Pain relief given through a fine tube in your back. It numbs you from the waist down, and an anaesthetist has to put it in.',
  },
  {
    term: 'haemorrhage',
    definition: 'Heavy bleeding. In pregnancy or after birth it needs treating urgently.',
  },
  {
    term: 'thrombosis',
    aliases: ['dvt', 'deep vein thrombosis'],
    definition:
      'A blood clot, usually in a leg. Pregnancy makes clots more likely, and they are treatable if caught.',
  },
  {
    term: 'anaemia',
    aliases: ['anemia', 'anaemic'],
    definition:
      'Not having enough healthy red blood cells to carry oxygen round your body. It usually makes you very tired. In pregnancy it is most often caused by low iron.',
  },
  {
    term: 'obstetrician',
    definition: 'A doctor who specialises in pregnancy and birth.',
  },
  {
    term: 'ectopic',
    aliases: ['ectopic pregnancy'],
    definition:
      'A pregnancy that has settled outside the womb, usually in a tube. It cannot continue, and it is an emergency because the tube can burst.',
  },
  {
    term: 'placenta',
    aliases: ['placental'],
    definition:
      'The organ that grows in your womb during pregnancy. It passes food and oxygen from you to your baby, and takes waste away.',
  },
  {
    term: 'episiotomy',
    definition:
      'A small cut made to widen the opening of the vagina during birth. It is stitched up afterwards.',
  },
  {
    term: 'incontinence',
    definition:
      'Leaking wee or poo when you do not mean to. It is common after birth, and treatable.',
  },
  {
    term: 'lochia',
    definition:
      'The bleeding you have for a few weeks after giving birth. It changes from red, to pink or brown, to whitish.',
  },
  {
    term: 'meconium',
    definition: 'Your baby’s first poo. It is very dark and sticky, and completely normal.',
  },
  {
    term: 'colostrum',
    definition:
      'The thick, yellowish first milk your body makes. There is not much of it, and that is fine — it is exactly what a newborn needs.',
  },
  {
    term: 'toxoplasmosis',
    definition:
      'An infection you can pick up from cat poo, soil, or undercooked meat. It is usually mild, but it can affect a baby in pregnancy.',
  },
  {
    term: 'listeria',
    aliases: ['listeriosis'],
    definition:
      'A bacteria found in some unpasteurised and chilled ready-to-eat foods. It is rare, but it can be serious in pregnancy.',
  },
  {
    term: 'retinoid',
    aliases: ['retinoids', 'retinol', 'retinoic acid'],
    definition:
      'A strong form of vitamin A used in some acne and anti-ageing creams. High doses can harm a baby’s development, so it is avoided in pregnancy.',
  },
  {
    term: 'anti-d',
    definition:
      'An injection given if your blood is rhesus negative and your baby’s might be positive. It stops your body reacting to your baby’s blood.',
  },
  {
    term: 'braxton hicks',
    definition:
      'Practice tightenings of your womb. They come and go without a pattern, and they are not labour.',
  },
  {
    term: 'deprivation',
    definition:
      'A measure of disadvantage in an area — not just income, but also housing, environment, health and how easily people can reach services.',
  },
  {
    term: 'mbrrace-uk',
    aliases: ['mbrrace'],
    definition:
      'The programme that reviews every death of a mother or baby in the UK, and publishes what it finds so care can be improved.',
  },
  {
    term: 'ctg',
    definition:
      'A machine that records your baby’s heartbeat and your contractions at the same time, usually with two bands round your bump.',
  },
  {
    term: 'pals',
    definition:
      'Patient Advice and Liaison Service. An NHS team in each hospital who help when you have a concern about your care. Contacting them is not a formal complaint.',
  },
];

/**
 * Every term and alias, longest first — so "intrahepatic cholestasis of
 * pregnancy" matches before "cholestasis" does.
 */
export const glossaryLookup: { pattern: string; entry: GlossaryEntry }[] = glossary
  .flatMap((entry) => [entry.term, ...(entry.aliases ?? [])].map((pattern) => ({ pattern, entry })))
  .sort((a, b) => b.pattern.length - a.pattern.length);

export function findGlossaryEntry(word: string): GlossaryEntry | undefined {
  const needle = word.toLowerCase().trim();
  return glossaryLookup.find((g) => g.pattern === needle)?.entry;
}
