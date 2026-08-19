import { useEffect } from 'react';
import { usePersistedState } from './usePersistedState';

export type TextSize = 'default' | 'large' | 'x-large';

interface AccessibilitySettings {
  textSize: TextSize;
  reduceMotion: boolean;
  highContrast: boolean;
}

const STORAGE_KEY = 'bump:accessibility';
const INITIAL_STATE: AccessibilitySettings = {
  textSize: 'default',
  reduceMotion: false,
  highContrast: false,
};

const TEXT_SCALE: Record<TextSize, string> = {
  default: '1',
  large: '1.15',
  'x-large': '1.3',
};

export function useAccessibilitySettings() {
  const [settings, setSettings] = usePersistedState<AccessibilitySettings>(
    STORAGE_KEY,
    INITIAL_STATE,
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-scale', TEXT_SCALE[settings.textSize]);
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.textSize, settings.highContrast]);

  return {
    ...settings,
    setTextSize: (textSize: TextSize) => setSettings((prev) => ({ ...prev, textSize })),
    setReduceMotion: (reduceMotion: boolean) => setSettings((prev) => ({ ...prev, reduceMotion })),
    setHighContrast: (highContrast: boolean) => setSettings((prev) => ({ ...prev, highContrast })),
  };
}
