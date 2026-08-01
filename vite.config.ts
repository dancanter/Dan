/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves this repo from /Dan/, not the domain root, so the
// build needs every asset/route path prefixed with the repo name. Local dev
// and other static hosts (Vercel/Netlify) serve from the root, so this only
// kicks in when the Pages workflow sets GITHUB_PAGES=true.
const base = process.env.GITHUB_PAGES === 'true' ? '/Dan/' : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Bump — Your Pregnancy Guide',
        short_name: 'Bump',
        description:
          'A day-by-day, week-by-week pregnancy guide with evidence-based nutrition, symptom, and wellbeing tips from NHS, NICE, SACN and other trusted UK sources.',
        theme_color: '#f4a89b',
        background_color: '#fff8f5',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          {
            src: `${base}icons/icon-maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${base}index.html`,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
  },
});
