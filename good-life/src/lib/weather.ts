import { useEffect, useState } from 'react';
import type { Weather } from '@/engine/today';

// Open-Meteo: free, no API key, no account. If it is unreachable the app
// simply carries on without weather.

const SUNNY_CODES = [0, 1];

export function useWeather(location: { lat: number; lon: number } | null): { weather: Weather | null; status: 'off' | 'loading' | 'ok' | 'error' } {
  const [state, setState] = useState<{ weather: Weather | null; status: 'off' | 'loading' | 'ok' | 'error' }>({ weather: null, status: location ? 'loading' : 'off' });
  useEffect(() => {
    if (!location) {
      setState({ weather: null, status: 'off' });
      return;
    }
    const key = `gl-weather-${location.lat.toFixed(2)},${location.lon.toFixed(2)}`;
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) ?? 'null');
      if (cached && Date.now() - cached.at < 60 * 60 * 1000) {
        setState({ weather: cached.w, status: 'ok' });
        return;
      }
    } catch {
      /* ignore */
    }
    const ctrl = new AbortController();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=weather_code,temperature_2m_max,precipitation_probability_max,uv_index_max&timezone=Europe%2FLondon&forecast_days=1`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        const code = j.daily.weather_code[0];
        const w: Weather = {
          tempMax: j.daily.temperature_2m_max[0],
          precipProb: j.daily.precipitation_probability_max[0] ?? 0,
          uvMax: j.daily.uv_index_max[0] ?? 0,
          code,
          sunny: SUNNY_CODES.includes(code) && (j.daily.precipitation_probability_max[0] ?? 0) < 30,
        };
        try {
          sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), w }));
        } catch {
          /* ignore */
        }
        setState({ weather: w, status: 'ok' });
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setState({ weather: null, status: 'error' });
      });
    return () => ctrl.abort();
  }, [location?.lat, location?.lon]);
  return state;
}

export async function geocode(name: string): Promise<{ name: string; lat: number; lon: number; admin?: string }[]> {
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json&countryCode=GB`);
  if (!r.ok) throw new Error('Location search unavailable');
  const j = await r.json();
  return (j.results ?? []).map((x: { name: string; latitude: number; longitude: number; admin1?: string; admin2?: string }) => ({ name: x.name, lat: x.latitude, lon: x.longitude, admin: [x.admin2, x.admin1].filter(Boolean).join(', ') }));
}

export function describeWeather(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Mostly clear';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Thunderstorms';
}
