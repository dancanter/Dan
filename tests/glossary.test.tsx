import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { glossary, findGlossaryEntry, guides } from '../src/content';
import { RichText } from '../src/components/ui/RichText';
import { UrgentDetailScreen } from '../src/screens/GetHelpScreen';

describe('the glossary', () => {
  it('gives every term a short, jargon-free definition', () => {
    for (const entry of glossary) {
      expect(entry.definition.trim().length, entry.term).toBeGreaterThan(20);
      // A definition that needs its own definition helps nobody.
      const others = glossary.filter((g) => g.term !== entry.term).map((g) => g.term);
      for (const other of others) {
        expect(
          entry.definition.toLowerCase().includes(other.toLowerCase()),
          `"${entry.term}" defines itself using "${other}"`,
        ).toBe(false);
      }
    }
  });

  it('matches the longest term first, so the full name wins', () => {
    expect(findGlossaryEntry('intrahepatic cholestasis of pregnancy')?.term).toBe(
      'intrahepatic cholestasis of pregnancy',
    );
    expect(findGlossaryEntry('ICP')?.term).toBe('intrahepatic cholestasis of pregnancy');
    expect(findGlossaryEntry('Pre-eclampsia')?.term).toBe('pre-eclampsia');
  });

  it('makes a term tappable inline and reveals the definition', async () => {
    const user = userEvent.setup();
    render(<RichText paragraphs={['Watch for signs of pre-eclampsia after 20 weeks.']} />);

    const term = screen.getByRole('button', { name: /pre-eclampsia/i });
    expect(term.getAttribute('aria-expanded')).toBe('false');

    await user.click(term);
    expect(term.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('note').textContent).toContain('blood pressure');
  });

  it('leaves surrounding text and markdown intact', () => {
    const { container } = render(
      <RichText paragraphs={['**Avoid retinoids** — they can harm development.']} />,
    );
    expect(container.textContent).toContain('Avoid retinoids');
    expect(container.textContent).toContain('they can harm development.');
    expect(container.querySelector('strong')).not.toBeNull();
  });

  it('actually reaches real content — terms appear in shipped guides', () => {
    const allBody = guides
      .flatMap((g) => g.body)
      .join(' ')
      .toLowerCase();
    const used = glossary.filter((g) =>
      [g.term, ...(g.aliases ?? [])].some((t) => allBody.includes(t.toLowerCase())),
    );
    // A glossary nothing links to is dead weight; most terms should be live.
    expect(used.length).toBeGreaterThan(glossary.length / 2);
  });
});

describe('read aloud on the urgent flow', () => {
  // After the test body, so it runs after Testing Library unmounts.
  afterEach(() => vi.unstubAllGlobals());

  function renderUrgent() {
    return render(
      <MemoryRouter initialEntries={['/help/movements']}>
        <Routes>
          <Route path="/help/:symptomId" element={<UrgentDetailScreen />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('hides the control entirely when the browser cannot speak', () => {
    // jsdom has no speechSynthesis — a dead button is worse than none on a
    // screen someone needs quickly.
    expect('speechSynthesis' in window).toBe(false);
    renderUrgent();
    expect(screen.queryByRole('button', { name: /read this to me/i })).toBeNull();
  });

  it('offers it, and speaks the action before the explanation, where supported', async () => {
    const spoken: string[] = [];
    class FakeUtterance {
      text: string;
      lang = '';
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    vi.stubGlobal('speechSynthesis', {
      cancel: () => {},
      speak: (u: FakeUtterance) => spoken.push(u.text),
    });

    const user = userEvent.setup();
    renderUrgent();
    await user.click(screen.getByRole('button', { name: /read this to me/i }));

    expect(spoken).toHaveLength(1);
    const said = spoken[0];
    expect(said).toContain('Call your maternity unit now');
    // Same order as the screen: what to do, then why.
    expect(said.indexOf('Call your maternity unit now')).toBeLessThan(
      said.indexOf('A change in your baby'),
    );
  });
});
