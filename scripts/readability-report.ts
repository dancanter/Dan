/**
 * Prints the readability audit. Run with: npm run readability
 */
import { allScores } from './readability';

function report() {
  const scores = allScores().sort((a, b) => b.grade - a.grade);
  const avg = scores.reduce((n, s) => n + s.grade, 0) / scores.length;
  const over = scores.filter((s) => s.grade > 8);

  console.log(`Entries: ${scores.length}`);
  console.log(
    `Mean Flesch–Kincaid grade: ${avg.toFixed(1)} (reading age ~${(avg + 5).toFixed(0)})`,
  );
  console.log(`Above grade 8 (reading age 13+): ${over.length}\n`);
  console.log('WORST 25');
  console.log('grade  ease   words  kind        id');
  for (const s of scores.slice(0, 25)) {
    console.log(
      `${s.grade.toFixed(1).padStart(5)}  ${s.ease.toFixed(0).padStart(4)}  ${String(s.wordCount).padStart(5)}  ${s.kind.padEnd(10)}  ${s.id}`,
    );
  }
  console.log('\nLONGEST SENTENCES');
  for (const s of scores.slice(0, 8)) {
    console.log(`\n[${s.id}] ${s.longestSentence.words} words:\n  ${s.longestSentence.text}`);
  }
}

report();
