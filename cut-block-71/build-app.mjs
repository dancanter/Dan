// Builds app.html — the one page that is published: the tracker (index.html)
// with Glow's built app (../glow/dist) carried inside it. Frames are not
// allowed on the published page, so Glow is not a separate file: its code
// waits in a text block until the Food / Cells / Body / Rituals tabs are first
// opened, then mounts into a shadow root with its stylesheet sealed inside.
//   cd ../glow && npm ci && npx vite build && cd ../cut-block-71 && node build-app.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const here = (p) => new URL(p, import.meta.url).pathname;
const dist = here('../glow/dist/');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
let css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g)].map((m) => readFileSync(join(dist, m[1]), 'utf8')).join('\n');
const js = [...html.matchAll(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g)].map((m) => readFileSync(join(dist, m[1]), 'utf8')).join('\n');
if (!css || !js) throw new Error('Could not find the built CSS or JS in glow/dist/index.html');

// @property rules do nothing inside a shadow root, so they go on the page.
const props = (css.match(/@property\s*[^{]+\{[^}]*\}/g) || []).join('');
css = css.replace(/@property\s*[^{]+\{[^}]*\}/g, '');
// Page-level selectors become the shadow host and the app's own wrapper.
css = css
  .replace(/:root:not\(\[data-theme="?light"?\]\)/g, ':host')
  .replace(/:root\[data-theme="?dark"?\]/g, ':host([data-theme=dark])')
  .replaceAll(':root', ':host')
  .replace(/(^|[}{,;\s])html\s*,\s*body\s*\{/g, '$1.glow-app{')
  .replace(/(^|[}{,;\s])body\s*\{/g, '$1.glow-app{');

// Dan's hard rules (PROFILE.md): the built page must not carry any of the old
// recommendations Glow used to make. Fail the build if one creeps back in.
const BANNED = /2–3 drops|drops per bowl|drops of sweetener|stevia drops? a day|retinol \d|retinol nights|keep liver|olive oil as|garlic-infused|tinned lentils/i;
const hit = js.match(BANNED);
if (hit) throw new Error(`Banned advice in Glow's build: "${hit[0]}" near …${js.slice(Math.max(0, hit.index - 60), hit.index + 60)}…`);

const safe = (s) => s.replace(/<\/(script|style)/gi, '<\\/$1');
const block =
  `<style id="glowProps">${props}</style>\n` +
  `<script>window.__GLOW_EMBED__=true;window.__GLOW_CSS__=${safe(JSON.stringify(css))};</script>\n` +
  `<script type="text/plain" id="glowCode">${safe(js)}</script>\n`;

const page = readFileSync(here('./index.html'), 'utf8');
const at = page.lastIndexOf('</body>');
const out = at >= 0 ? page.slice(0, at) + block + page.slice(at) : page + block;
writeFileSync(here('./app.html'), out);
console.log(`app.html ${(out.length / 1024).toFixed(0)} KB (Glow ${(js.length / 1024).toFixed(0)} KB)`);
