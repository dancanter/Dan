import { useCallback, useEffect, useState } from 'react';

/**
 * Text-to-speech, used only on the urgent screens.
 *
 * The case for it is narrow and specific: someone frightened at 3am, hands
 * shaking, possibly without their glasses, should be able to be *told* what
 * to do rather than having to read it. That is an accessibility need, not a
 * novelty — so it is deliberately not offered on the browsing screens, where
 * it would just be a gimmick.
 *
 * Nothing ever autoplays. Speech starts only when someone asks for it.
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function';

  // Speech carries on across route changes unless it is explicitly stopped,
  // which would leave someone being read a screen they have already left.
  useEffect(() => {
    if (!supported) return;
    // Re-checked at cleanup rather than captured: the reference can be gone
    // by the time this runs, and an unmount must never throw.
    return () => window.speechSynthesis?.cancel();
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      // Slightly slower than default. This is being read to someone who is
      // not calm, and the default rate is brisk.
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported],
  );

  return { supported, speaking, speak, stop };
}
