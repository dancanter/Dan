import { guides, GUIDE_SECTIONS } from './guides';
import { symptoms } from './symptoms';
import { urgentSymptoms, type UrgentSymptom } from './urgent';
import type { Guide, Symptom } from './schema';

/**
 * Search that survives being asked a question.
 *
 * The old search was `includes(query)` across the title, summary and body.
 * That works if you type "brie" and fails completely if you type "can I eat
 * brie" — which is how people actually search when they are worried, and is
 * exactly the moment the library should not come back empty.
 *
 * There is no backend and no model here, and there does not need to be. Three
 * plain mechanisms get most of the way:
 *
 *  1. Drop the words that carry no meaning ("can", "I", "should"), so a
 *     question reduces to the terms that matter.
 *  2. Match loosely on word stems, so "eating" finds "eat" and "medicines"
 *     finds "medicine".
 *  3. Translate the words people use into the words the content uses —
 *     "booze" to alcohol, "sore boobs" to breast, "tummy" to abdomen.
 *
 * Then rank: a hit in the title matters more than one in the body, and an
 * entry matching every term beats one matching a single term.
 */

/** Words that appear in questions but carry no search meaning. */
const STOP = new Set([
  'a',
  'about',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'been',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'for',
  'from',
  'get',
  'got',
  'had',
  'has',
  'have',
  'how',
  'i',
  'if',
  'in',
  'is',
  'it',
  'its',
  'me',
  'much',
  'my',
  'need',
  'of',
  'on',
  'or',
  'ok',
  'okay',
  'should',
  'so',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'too',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'why',
  'will',
  'with',
  'would',
  'you',
  'your',
]);

/**
 * The words people use, mapped to the words the content uses.
 *
 * Kept deliberately small and lay-facing. This is not a thesaurus — every
 * entry is here because it is what someone would plausibly type instead of
 * the clinical term, and getting nothing back would be a failure.
 */
const SYNONYMS: Record<string, string[]> = {
  booze: ['alcohol'],
  drink: ['alcohol'],
  drinking: ['alcohol'],
  wine: ['alcohol'],
  beer: ['alcohol'],
  coffee: ['caffeine'],
  tea: ['caffeine'],
  cola: ['caffeine'],
  fizzy: ['caffeine', 'sugar'],
  smoking: ['smoke', 'cigarette'],
  vape: ['smoke', 'smoking'],
  boobs: ['breast'],
  boob: ['breast'],
  breasts: ['breast'],
  tummy: ['abdomen', 'stomach', 'bump'],
  belly: ['abdomen', 'bump'],
  sickness: ['nausea', 'vomit', 'sick'],
  puking: ['vomit', 'sick'],
  throwing: ['vomit', 'sick'],
  poo: ['bowel', 'constipation'],
  pooing: ['bowel', 'constipation'],
  wee: ['urine', 'bladder'],
  weeing: ['urine', 'bladder'],
  pee: ['urine', 'bladder'],
  pills: ['medicine', 'medication'],
  pill: ['medicine', 'medication'],
  tablet: ['medicine', 'medication'],
  tablets: ['medicine', 'medication'],
  // The library uses both words and stemming will not join them, so someone
  // typing one of them was searching half the content.
  medicine: ['medication'],
  medicines: ['medication'],
  medication: ['medicine'],
  medications: ['medicine'],
  painkiller: ['paracetamol', 'medicine'],
  painkillers: ['paracetamol', 'medicine'],
  jab: ['vaccine', 'vaccination'],
  jabs: ['vaccine', 'vaccination'],
  flying: ['travel', 'flight'],
  plane: ['travel', 'flight'],
  gym: ['exercise'],
  workout: ['exercise'],
  running: ['exercise'],
  dye: ['hair'],
  tattoo: ['skin'],
  cleaning: ['chemical', 'household'],
  bleach: ['chemical', 'household'],
  paint: ['chemical', 'diy'],
  cat: ['toxoplasmosis'],
  litter: ['toxoplasmosis'],
  sushi: ['fish', 'raw'],
  brie: ['cheese'],
  camembert: ['cheese'],
  pate: ['liver'],
  work: ['work rights', 'employer'],
  boss: ['work rights', 'employer'],
  job: ['work rights', 'employer'],
  money: ['pay', 'maternity'],
  sleeping: ['sleep'],
  tired: ['fatigue', 'sleep'],
  knackered: ['fatigue', 'tired'],
  sad: ['low mood', 'depression'],
  worried: ['anxiety', 'anxious'],
  stressed: ['stress', 'anxiety'],
  sex: ['sex'],
  labour: ['labour', 'birth'],
  // "moving" cannot be stemmed to "mov" without dropping below the minimum
  // stem length, so it would never prefix-match "movements". Mapping the forms
  // onto the word the content uses is more precise than loosening the stemmer
  // for every word in the language.
  moving: ['movement'],
  move: ['movement'],
  moves: ['movement'],
  kicking: ['movement'],
  kicks: ['movement'],
};

/**
 * Crude but effective: strip common English endings so stems line up.
 *
 * The minimum length is what makes this safe rather than merely short. Without
 * it, "bleed" loses its "ed" and becomes "bl" — while "bleeding" becomes
 * "bleed" — so the two forms of the same word stop matching each other, which
 * is the exact opposite of what stemming is for. Refusing to strip below four
 * characters also makes the function idempotent, so stemming an already-stemmed
 * word is a no-op and both sides of a comparison can be run through it safely.
 */
const MIN_STEM = 4;

function stem(word: string): string {
  const shorten = (from: string, to: string) => {
    if (!word.endsWith(from)) return false;
    const stripped = word.slice(0, word.length - from.length) + to;
    if (stripped.length < MIN_STEM) return false;
    word = stripped;
    return true;
  };

  if (shorten('ies', 'y')) return word;
  for (const suffix of ['sses', 'shes', 'ches', 'xes', 'ing', 'ed', 'es', 's']) {
    if (shorten(suffix, '')) return word;
  }
  return word;
}

function tokenise(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOP.has(w));

  const expanded = words.flatMap((w) => [w, ...(SYNONYMS[w] ?? [])]);
  // A query of nothing but stop words ("can I") should match nothing rather
  // than everything, so an empty result here is meaningful.
  return [...new Set(expanded.flatMap((w) => w.split(' ')).map(stem))].filter((w) => w.length > 1);
}

const TITLE_WEIGHT = 6;
const SUMMARY_WEIGHT = 3;
/**
 * The section an entry sits in says what it is about, which its title often
 * does not. "Can I take this medicine" was led by an entry on breastfeeding
 * and contraception, while the entry that actually answers it — "The two
 * golden rules" — tied for third, because the titles here are written to be
 * read rather than to be searched. Its section is called Medications, and that
 * was already sitting in the data unused. Weighted below the summary: being
 * filed under a subject is weaker evidence than saying so.
 */
const SECTION_WEIGHT = 2;
const BODY_WEIGHT = 1;

const SECTION_LABELS = new Map(GUIDE_SECTIONS.map((s) => [s.id, s.label]));

/**
 * Each entry flattened once at load, rather than re-joining 111 arrays of
 * paragraphs on every keystroke.
 */
const INDEX = guides.map((guide) => ({
  guide,
  title: guide.title.toLowerCase(),
  summary: guide.summary.toLowerCase(),
  section: (SECTION_LABELS.get(guide.section) ?? '').toLowerCase(),
  body: (
    guide.body.join(' ') +
    ' ' +
    (guide.lists ?? []).flatMap((l) => l.items).join(' ')
  ).toLowerCase(),
}));

/**
 * How much a term is worth, based on how rare it is across the library.
 *
 * Without this, "my baby is moving less" was led by an entry about feeding,
 * because "baby" appears in almost every entry and three weak matches on a
 * ubiquitous word outweighed one good match on a rare one. A word that appears
 * everywhere tells you nothing about which entry you want — so it is worth
 * almost nothing, and "brie" or "hair" is worth a great deal.
 *
 * This is inverse document frequency, the standard answer, and it costs one
 * pass over the index per new term.
 */
const idfCache = new Map<string, number>();

/**
 * Matches a term at the start of a word, not anywhere inside one.
 *
 * A plain `includes` looked reasonable and was quietly wrong: searching "my
 * baby is moving less" put an entry about sex first, because "less" matches
 * inside "unless", "restless" and "regardless". Stems have to match word
 * *starts* — which also keeps the useful half of substring matching, so the
 * stem "exercis" still finds "exercise".
 */
const matcherCache = new Map<string, RegExp>();

function matcher(term: string): RegExp {
  let re = matcherCache.get(term);
  if (re === undefined) {
    re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    matcherCache.set(term, re);
  }
  return re;
}

function idf(term: string): number {
  let value = idfCache.get(term);
  if (value === undefined) {
    const re = matcher(term);
    const seenIn = INDEX.filter(
      (e) => re.test(e.title) || re.test(e.summary) || re.test(e.section) || re.test(e.body),
    ).length;
    // Floored rather than zeroed, so a search for a common word still returns
    // something rather than looking broken.
    value = Math.max(0.15, Math.log(INDEX.length / (seenIn + 1)));
    idfCache.set(term, value);
  }
  return value;
}

function scoreEntry(entry: (typeof INDEX)[number], terms: string[]): number {
  let score = 0;
  let matched = 0;

  for (const term of terms) {
    const re = matcher(term);
    let hit = 0;
    if (re.test(entry.title)) hit += TITLE_WEIGHT;
    if (re.test(entry.summary)) hit += SUMMARY_WEIGHT;
    if (re.test(entry.section)) hit += SECTION_WEIGHT;
    if (re.test(entry.body)) hit += BODY_WEIGHT;
    if (hit > 0) matched += 1;
    score += hit * idf(term);
  }

  if (matched === 0) return 0;
  // An entry that answers the whole question beats one that catches a single
  // word of it — "eat brie" should not be led by a general nutrition entry
  // that happens to say "eat".
  return score * (matched / terms.length);
}

export interface SearchResult {
  guide: Guide;
  score: number;
}

/**
 * Results scoring below this share of the best result are dropped.
 *
 * Without it, "can I eat brie" returned 51 entries: the right one first, then
 * everything in the library that happens to contain the word "eat". The
 * ranking was fine and the list was still useless — nobody scrolls 51 results
 * to check whether the first one was a fluke, and a long tail of near-misses
 * makes a search look like it did not understand the question.
 */
const RELEVANCE_FLOOR = 0.25;
const MAX_RESULTS = 25;

export function searchGuides(query: string): SearchResult[] {
  const terms = tokenise(query);
  if (terms.length === 0) return [];

  const scored = INDEX.map((entry) => ({ guide: entry.guide, score: scoreEntry(entry, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.guide.title.localeCompare(b.guide.title));

  if (scored.length === 0) return [];

  const floor = scored[0].score * RELEVANCE_FLOOR;
  return scored.filter((r) => r.score >= floor).slice(0, MAX_RESULTS);
}

/**
 * The symptom explorer lives outside the guidance library, so a search for
 * "heartburn" used to return nothing at all — the app had a good answer and
 * simply never offered it. Searched separately and shown above the guidance,
 * because if there is a symptom entry for what you typed, it is almost always
 * the thing you wanted.
 */
/** How many symptom names contain this term — cached, since the list is fixed. */
const nameMatchCache = new Map<string, number>();

function namesMatching(term: string): number {
  let count = nameMatchCache.get(term);
  if (count === undefined) {
    const re = matcher(term);
    count = symptoms.filter((s) => re.test(s.name)).length;
    nameMatchCache.set(term, count);
  }
  return count;
}

export function searchSymptoms(query: string): Symptom[] {
  const terms = tokenise(query);
  if (terms.length === 0) return [];

  return (
    symptoms
      .map((symptom) => {
        const haystack = `${symptom.name} ${symptom.why} ${symptom.help}`;
        const hits = terms.filter((t) => matcher(t).test(haystack)).length;
        // Weight a hit in the name far above one in the explanation: "swelling"
        // should lead with the swelling entry, not one that mentions it once.
        const named = terms.filter((t) => matcher(t).test(symptom.name)).length;
        // ...but only if the word actually distinguishes one symptom from
        // another. "chest pain" was offering Back pain and Pelvic pain, because
        // "pain" is in both names. Suggesting back pain to someone typing chest
        // pain is worse than suggesting nothing: it reads as the app having an
        // opinion about what is wrong with them.
        const discriminating = terms.filter(
          (t) => matcher(t).test(symptom.name) && namesMatching(t) === 1,
        ).length;
        return { symptom, hits, named, discriminating, score: hits + named * 4 };
      })
      // A single passing mention is not a match. "Can I eat brie" was pulling up
      // a symptom chip because one entry's advice happens to contain "eat" —
      // technically a hit, and obviously noise next to the cheese entry that
      // actually answered the question. Either the name matches on a word that
      // tells the entries apart, or the whole query hits.
      .filter((r) => r.discriminating > 0 || r.hits === terms.length)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((r) => r.symptom)
  );
}

/**
 * Words that mean someone may be describing something happening right now,
 * rather than reading up on it. Matched against the urgent flow's own titles
 * plus a few phrasings that would otherwise miss.
 */
const URGENT_HINTS: Record<string, string> = {
  bleed: 'bleeding',
  blood: 'bleeding',
  movement: 'movements',
  moving: 'movements',
  move: 'movements',
  kick: 'movements',
  quiet: 'movements',
  itch: 'itching',
  itchy: 'itching',
  headache: 'headache',
  blurred: 'headache',
  swell: 'swelling',
  swollen: 'swelling',
  waters: 'fluid',
  leaking: 'fluid',
  contraction: 'contractions',
  fever: 'temperature',
  temperature: 'temperature',
  chest: 'chest',
  breathless: 'chest',
  calf: 'leg',
  suicidal: 'mental-health',
  harm: 'mental-health',
};

/**
 * Stemmed at load, because the query terms are stemmed too — "moving" reduces
 * to "mov" and would never match a literal key of "moving". Building the
 * lookup through the same function that processes the query is what keeps the
 * two halves in step.
 */
const URGENT_LOOKUP = new Map(Object.entries(URGENT_HINTS).map(([word, id]) => [stem(word), id]));

/**
 * Phrases that are unambiguous where a single word would not be.
 *
 * "difficulty breathing" was matching nothing at all — the hint list had
 * "breathless" but not "breathing", so one of the most serious things a person
 * can type got a reading list. Adding "breath" as a bare word would fix that
 * and break something else: this app has a breathing exercise in it, and a red
 * panel is the wrong answer to someone looking for it. The distress is in the
 * phrase, not in the word.
 */
const URGENT_PHRASES: [RegExp, string][] = [
  [/\b(difficulty|trouble|struggling|hard|can.?t|cannot|unable)\b[^.?!]{0,14}\bbreath/i, 'chest'],
  [/\b(short(ness)?|out) of breath\b/i, 'chest'],
  [/\bstruggling to breathe\b/i, 'chest'],
];

/**
 * Words that mean "something is wrong" without saying what.
 *
 * These only apply when nothing more specific matched, because they are the
 * broadest thing a person can say and the most easily outranked. "Feeling very
 * unwell" is a real reason to call a maternity unit and had no route at all;
 * "I feel my baby moving less" should still go to movements, not here.
 */
const WEAK_HINTS: Record<string, string> = {
  unwell: 'instinct',
  ill: 'instinct',
  wrong: 'instinct',
};

const WEAK_LOOKUP = new Map(Object.entries(WEAK_HINTS).map(([word, id]) => [stem(word), id]));

/**
 * If someone searches the guidance for something that might be happening to
 * them now, the library is the wrong answer.
 *
 * A reading list is a bad response to "bleeding". This puts the urgent route
 * above the results rather than leaving someone to scroll a set of articles —
 * and it offers, rather than diverts, because the person searching may equally
 * be reading ahead out of interest.
 */
export function urgentMatchFor(query: string): UrgentSymptom | undefined {
  const find = (id: string) => urgentSymptoms.find((s) => s.id === id);

  // Most specific first: a whole phrase, then a distinctive word, then the
  // vague ones. Anything else and "I feel unwell when my baby moves" lands on
  // the catch-all instead of on movements.
  for (const [pattern, id] of URGENT_PHRASES) {
    if (pattern.test(query)) return find(id);
  }

  const terms = tokenise(query);
  for (const term of terms) {
    const id = URGENT_LOOKUP.get(term);
    if (id) return find(id);
  }
  for (const term of terms) {
    const id = WEAK_LOOKUP.get(term);
    if (id) return find(id);
  }
  return undefined;
}
