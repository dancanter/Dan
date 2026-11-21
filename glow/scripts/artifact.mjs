// Packs the built app (dist/) into one self-contained HTML page that can be
// published as a page inside Claude: CSS and JS inlined, and the document
// wrapper stripped because Claude adds its own.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g)].map((m) => readFileSync(join(dist, m[1]), 'utf8')).join('\n');
const js = [...html.matchAll(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g)].map((m) => readFileSync(join(dist, m[1]), 'utf8')).join('\n');
if (!css || !js) throw new Error('Could not find the built CSS or JS in dist/index.html');

const page = `<title>Glow</title>
<meta name="description" content="Cellular nutrition, sleep, vitals and rituals, scored.">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
const outDir = new URL('../dist-artifact/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'glow.html'), page);
console.log(`dist-artifact/glow.html ${(page.length / 1024).toFixed(0)} KB`);
