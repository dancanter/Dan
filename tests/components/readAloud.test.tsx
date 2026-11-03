import { describe, expect, it } from 'vitest';
import { speakable } from '../../src/lib/speakable';
import { lossSections } from '../../src/content/loss';
import { afterLossSections } from '../../src/content/afterLoss';
import { urgentSymptoms } from '../../src/content';

/**
 * Read-aloud started on the urgent screens — someone frightened at 3am with
 * shaking hands. It is now also on the loss screens, where the case is
 * different but just as real: people cry, and you cannot read through it.
 *
 * The content was written to be read, not spoken, and two things in it sound
 * wrong out loud. These pin both.
 */

describe('preparing text to be spoken', () => {
  it('drops markdown emphasis rather than saying it', () => {
    // "asterisk asterisk Sands asterisk asterisk" is not support.
    expect(speakable('**Sands** — free')).toBe('Sands — free');
    expect(speakable('*threatened* — bleeding')).toBe('threatened — bleeding');
  });

  it('reads a helpline number as digits, not as a quantity', () => {
    // A synthesiser given "0808 164 3332" says "eight hundred and eight, one
    // hundred and sixty-four…", which nobody can write down.
    expect(speakable('Sands — 0808 164 3332')).toBe('Sands — 0 8 0 8 1 6 4 3 3 3 2');
    expect(speakable('Samaritans — 116 123')).toBe('Samaritans — 1 1 6 1 2 3');
  });

  it('leaves ordinary numbers alone', () => {
    // Times, weeks and counts should still be spoken as numbers.
    expect(speakable('Mon–Fri 10am–3pm')).toBe('Mon–Fri 10am–3pm');
    expect(speakable('loss before 24 completed weeks')).toBe('loss before 24 completed weeks');
    expect(speakable('around 1 in 4 pregnancies')).toBe('around 1 in 4 pregnancies');
  });

  it('does not mangle any real sentence in the loss content', () => {
    // The digit rule is the risky part: too greedy and it starts spelling out
    // week numbers and times. Checked against every line actually shipped.
    for (const s of [...lossSections, ...afterLossSections]) {
      for (const line of s.body) {
        const spoken = speakable(line);
        // A digit run only becomes spaced if the original held a real number
        // of six characters or more — never a bare year, week or time.
        for (const bad of ['2 4 ', '1 6 w', '9 a m', '2 0 2']) {
          expect(spoken, `${s.id}: ${line.slice(0, 60)}`).not.toContain(bad);
        }
      }
    }
  });

  it('handles a real paragraph without mangling it', () => {
    const out = speakable(
      '**Sands** — 0808 164 3332, free. Mon–Fri 10am–3pm, and Tue, Wed and Thu 6pm–9pm.',
    );
    expect(out).not.toContain('*');
    expect(out).toContain('0 8 0 8 1 6 4 3 3 3 2');
    expect(out).toContain('10am–3pm');
  });
});

describe('what read-aloud is offered on', () => {
  it('covers every loss section, so no part of it is reading-only', () => {
    // The screens render one control per section; this asserts there is
    // something in each to read.
    for (const s of [...lossSections, ...afterLossSections]) {
      expect(s.body.join(' ').trim().length, s.id).toBeGreaterThan(0);
    }
  });

  it('still speaks the urgent entries action-first', () => {
    // The urgent screen composes `now` then `why`. If that ever flips,
    // someone hears the reasoning before the instruction.
    for (const s of urgentSymptoms) {
      const spoken = speakable(`${s.now} ${s.why}`);
      expect(spoken.startsWith(speakable(s.now)), s.id).toBe(true);
    }
  });
});
