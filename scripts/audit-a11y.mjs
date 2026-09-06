// Playwright is not a dependency of this project — it is a big install for
// something run by hand a few times a year. Point PLAYWRIGHT_MODULE at a
// global install if it is not resolvable locally.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright').catch(() => {
  console.error(
    'Could not load Playwright.\n' +
      'Install it (npm i -D playwright && npx playwright install chromium),\n' +
      'or point PLAYWRIGHT_MODULE at an existing install.',
  );
  process.exit(1);
});
import { readFileSync } from 'node:fs';

/**
 * The measurement behind the accessibility statement.
 *
 * Every figure on the /accessibility page comes from this script rather than
 * from memory, which is the only thing that makes the page worth publishing.
 * Re-run it before editing that page, and update the date there to match.
 *
 * Run in a real browser, because colour contrast cannot be computed in jsdom
 * — which is exactly where this app's worst accessibility bug once hid.
 *
 *   npm run build && npx vite preview --port 4173 &
 *   npm run audit-a11y
 */
const B = process.env.PREVIEW_URL ?? 'http://localhost:4173';
const AXE = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const ROUTES = [
  ['Onboarding', '/'],
  ['Home', '/today'],
  ['Get help', '/help'],
  ['Urgent detail', '/help/bleeding'],
  ['Mental health', '/help/mental-health'],
  ['Baby', '/baby'],
  ['My body', '/body'],
  ['Guidance', '/healthy'],
  ['Appointments', '/appointments'],
  ['Money and deadlines', '/entitlements'],
  ['Journal', '/journal'],
  ['Movements', '/movements'],
  ['Sources', '/sources'],
  ['Loss support', '/loss'],
  ['Inequalities', '/inequalities'],
  ['Need a minute', '/minute'],
  ['Explore', '/explore'],
  ['Settings', '/settings'],
  ['Privacy', '/privacy'],
  ['Why', '/why'],
  ['Methodology', '/methodology'],
  ['Accessibility', '/accessibility'],
];

const b = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

async function sweep(label, { width, height, textSize }) {
  const ctx = await b.newContext({ viewport: { width, height }, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.goto(B + '/', { waitUntil: 'domcontentloaded' });
  await p.evaluate((size) => {
    localStorage.setItem(
      'fieldnotes:profile',
      JSON.stringify({
        dueDate: '2027-03-01',
        birthDate: null,
        babyName: null,
        firstPregnancy: true,
      }),
    );
    localStorage.setItem('fieldnotes:seenIntro', 'true');
    if (size)
      localStorage.setItem(
        'bump:accessibility',
        JSON.stringify({ textSize: size, reduceMotion: false, highContrast: false }),
      );
  }, textSize);

  let violations = 0;
  let overflow = [];
  for (const [name, path] of ROUTES) {
    await p.goto(B + path, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('main h1, main h2', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(350);
    await p.evaluate(AXE);
    const res = await p.evaluate(
      async (tags) => await window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
      TAGS,
    );
    if (res.violations.length) {
      violations += res.violations.length;
      for (const v of res.violations)
        console.log(`  *** ${name}: ${v.id} (${v.impact}) x${v.nodes.length}`);
    }
    const scrolls = await p.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    if (scrolls) overflow.push(name);
  }
  console.log(
    `${label.padEnd(34)} violations=${violations}  h-scroll=${overflow.length ? overflow.join(', ') : 'none'}`,
  );
  await ctx.close();
  return { violations, overflow };
}

console.log(`axe-core ${TAGS.join(', ')} across ${ROUTES.length} routes\n`);
await sweep('375x812 default text', { width: 375, height: 812 });
await sweep('320x568 smallest supported', { width: 320, height: 568 });
await sweep('390x844 Extra large text', { width: 390, height: 844, textSize: 'x-large' });
await sweep('1280x800 desktop', { width: 1280, height: 800 });

// Reduced motion, forced colours, and the call buttons.
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  serviceWorkers: 'block',
  forcedColors: 'active',
  reducedMotion: 'reduce',
});
const p = await ctx.newPage();
await p.goto(B + '/help/bleeding', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('main h1');
await p.waitForTimeout(400);
const tel = await p.evaluate(() =>
  [...document.querySelectorAll('a[href^="tel:"]')].map((el) => ({
    text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 30),
    border: parseFloat(getComputedStyle(el).borderTopWidth),
    visible: el.getBoundingClientRect().height > 0,
  })),
);
console.log('\nforced colours + reduced motion, urgent screen');
for (const t of tel)
  console.log(
    `  ${t.border > 0 && t.visible ? 'ok ' : '***'} ${t.text.padEnd(30)} border=${t.border}px`,
  );
await b.close();
