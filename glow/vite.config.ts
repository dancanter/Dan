/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Relative base so the same build works at /glow/ on GitHub Pages, from a
// local preview, or from any static host.
export default defineConfig({
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5190 },
  plugins: [react(), tailwindcss()],
  test: { environment: 'jsdom', globals: true },
});
