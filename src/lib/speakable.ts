/**
 * Turns content written to be read into content that sounds right spoken.
 *
 * Two things in it don't survive a speech synthesiser.
 *
 * Markdown emphasis is the obvious one — nobody wants to hear "asterisk
 * asterisk Sands". The subtler one is phone numbers: given "0808 164 3332" a
 * synthesiser says "eight hundred and eight, one hundred and sixty-four…",
 * which is useless to someone trying to write it down. Spacing the digits
 * makes it read them one at a time, which is the only form a helpline number
 * is any use in.
 *
 * Lives apart from the component that uses it so that file only exports a
 * component, and so the rule below can be tested directly — which is how the
 * bug in it was found.
 */
export function speakable(text: string): string {
  return (
    text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      // Six characters minimum, which is what it takes to reach the shortest
      // number here. An earlier draft required eight and so left "116 123"
      // alone — Samaritans, on the crisis box, the one number on these screens
      // most likely to be dialled. Caught by a test rather than by a listener.
      .replace(/\b\d[\d\s]{4,}\d\b/g, (run) => run.replace(/\s/g, '').split('').join(' '))
  );
}
