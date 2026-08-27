/**
 * Readability audit.
 *
 * NHS guidance targets a reading age of about 9–11 for public-facing health
 * information, which is roughly Flesch–Kincaid grade 4–6 (reading age ≈
 * grade + 5). Anything much above that is asking a tired, anxious reader to
 * work harder than they should have to.
 *
 * Pure functions only — the CLI lives in readability-report.ts, so that
 * importing this from a test does not print anything.
 */
import {
  guides,
  urgentSymptoms,
  symptoms,
  myths,
  helpTopics,
  lossSections,
  equitySections,
  afterLossSections,
  privacySections,
  calmExercises,
  calmFacts,
} from '../src/content';

/** Strips markdown emphasis so `**word**` doesn't skew the word count. */
function plain(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/[—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Clinical terms with no simpler accurate synonym.
 *
 * Flesch–Kincaid punishes long words, but "pre-eclampsia" cannot be shortened
 * without losing the thing a reader needs in order to look it up or say it to
 * a midwife. Penalising those words pushes the content towards vagueness,
 * which is the opposite of the goal — so they are capped at two syllables
 * rather than excluded, keeping word and sentence counts honest while
 * removing a penalty that no rewrite could ever clear.
 *
 * Keep this list short and defensible. It is for terms that must survive,
 * not an escape hatch for prose that could simply be written better.
 */
const CLINICAL_TERMS = new Set([
  'intrahepatic',
  'cholestasis',
  'icp',
  'eclampsia',
  'gestational',
  'diabetes',
  'antenatal',
  'postnatal',
  'perinatal',
  'postpartum',
  'psychosis',
  'caesarean',
  'epidural',
  'haemorrhage',
  'thrombosis',
  'anaemia',
  'obstetrician',
  'cardiologist',
  'contraception',
  'vaccination',
  'vaccinations',
  'immunisation',
  'incontinence',
  'episiotomy',
  'ultrasound',
  'placenta',
  'placental',
  'ectopic',
  'miscarriage',
  'stillbirth',
  'breastfeeding',
  'paracetamol',
  'ibuprofen',
  'retinoid',
  'retinoids',
  'deprivation',
  'mbrrace',
  'toxoplasmosis',
  'listeria',
  'colostrum',
  'meconium',
  'lochia',
]);

const CLINICAL_SYLLABLE_CAP = 2;

/** Standard heuristic syllable count — good enough for a relative ranking. */
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  const count = Math.max(1, groups ? groups.length : 1);
  return CLINICAL_TERMS.has(w) ? Math.min(count, CLINICAL_SYLLABLE_CAP) : count;
}

export interface Score {
  id: string;
  kind: string;
  grade: number;
  ease: number;
  wordCount: number;
  longestSentence: { words: number; text: string };
}

export function score(id: string, kind: string, text: string): Score {
  const clean = plain(text);
  const ss = sentences(clean);
  const ws = words(clean);
  const syl = ws.reduce((n, w) => n + syllables(w), 0);
  const wps = ws.length / Math.max(1, ss.length);
  const spw = syl / Math.max(1, ws.length);

  const longest = ss
    .map((s) => ({ words: words(s).length, text: s }))
    .sort((a, b) => b.words - a.words)[0] ?? { words: 0, text: '' };

  return {
    id,
    kind,
    grade: 0.39 * wps + 11.8 * spw - 15.59,
    ease: 206.835 - 1.015 * wps - 84.6 * spw,
    wordCount: ws.length,
    longestSentence: longest,
  };
}

export function allScores(): Score[] {
  const out: Score[] = [];
  for (const g of guides) out.push(score(g.id, 'guide', [g.summary, ...g.body].join(' ')));
  for (const u of urgentSymptoms)
    out.push(
      score(u.id, 'urgent', [u.now, u.why, u.reassurance ?? '', ...(u.dont ?? [])].join(' ')),
    );
  for (const s of symptoms) out.push(score(s.id, 'symptom', [s.why, s.help, s.flag].join(' ')));
  for (const m of myths) out.push(score(m.id, 'myth', m.explanation));
  for (const t of helpTopics) out.push(score(t.id, 'helpTopic', t.body.join(' ')));
  for (const l of lossSections) out.push(score(l.id, 'loss', l.body.join(' ')));
  for (const e of equitySections) out.push(score(e.id, 'equity', e.body.join(' ')));
  for (const a of afterLossSections) out.push(score(a.id, 'afterLoss', a.body.join(' ')));
  for (const p of privacySections) out.push(score(p.id, 'privacy', p.body.join(' ')));
  // Reader-facing prose, so it is held to the same ceilings as everything
  // else. Someone reaching this page is not in a state to parse a clause.
  for (const c of calmExercises)
    out.push(score(c.id, 'calm', [c.blurb, ...(c.steps ?? [])].join(' ')));
  calmFacts.forEach((f, i) => out.push(score(`calm-fact-${i + 1}`, 'calm', f.text)));
  return out;
}
