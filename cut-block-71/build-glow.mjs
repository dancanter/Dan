// Packs Glow's built app (../glow/dist) into glow.html: a complete page the
// tracker publishes beside itself and shows in its Glow tab. Build Glow first:
//   cd ../glow && npm ci && npx vite build && cd ../cut-block-71 && node build-glow.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../glow/dist/', import.meta.url).pathname;
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g)].map((m) => readFileSync(join(dist, m[1]), 'utf8')).join('\n');
const js = [...html.matchAll(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g)].map((m) => readFileSync(join(dist, m[1]), 'utf8')).join('\n');
if (!css || !js) throw new Error('Could not find the built CSS or JS in glow/dist/index.html');

const page = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Glow</title><style>${css}</style></head><body><div id="root"></div><script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
writeFileSync(new URL('./glow.html', import.meta.url).pathname, page);
console.log(`glow.html ${(page.length / 1024).toFixed(0)} KB`);
